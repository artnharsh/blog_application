const express = require('express');
const multer = require('multer');
const path = require('path');

const Blog = require("../models/blog");
const Comment = require("../models/comment");

const router = express.Router();

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.resolve(`./public/uploads/`));
  },
  filename: function (req, file, cb) {
    const fileName = `${Date.now()}-${file.originalname}`;
    cb(null, fileName);
  },
});

const upload = multer({ storage: storage });

router.get('/add-new', (req, res) => {
    return res.render("addBlog",{
        user: req.user,
    });
});

router.get('/:id', async (req, res) => {
    const blog = await Blog.findById(req.params.id).populate("createdBy");
    const comments = await Comment.find({ blogId: req.params.id}).populate("createdBy");
    if (!blog) {
        return res.status(404).send("Blog not found");
    }
    return res.render("blog", {
        user: req.user,
        blog,
        comments
    });
});

router.post('/',upload.single('coverImage'), async (req, res) => {
    const blog = await Blog.create({
        title: req.body.title,
        body: req.body.body,
        coverImageURL: `/uploads/${req.file.filename}`,
        createdBy: req.user._id,
    })
    return res.redirect(`/`);
    //return res.redirect(`/blog/${blog._id}`);
});

router.post("/comment/:id", async(req, res) => {
    const comment = await Comment.create({
        content: req.body.content,
        blogId: req.params.id,
        createdBy: req.user._id,
    });
    res.redirect(`/blog/${req.params.id}`);
});


module.exports = router;
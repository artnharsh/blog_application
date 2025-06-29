require("dotenv").config();
// This is the main entry point of the application
const express = require("express");
const path = require("path");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");
const Blog = require("./models/blog");

const userRoute = require("./routes/user");
const blogRoute = require("./routes/blog");
const { checkForAuthenticationCookie } = require("./middlewares/authentication");

const app = express();

const PORT = process.env.PORT;
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(checkForAuthenticationCookie("token"));
app.use(express.static(path.resolve("./public")));

mongoose.connect(process.env.MONGO_URL)
    .then(() => console.log("MongoDB connected: Bloom"))
    .catch((err) => console.error("MongoDB connection error:", err));

app.set("view engine", "ejs");
app.set("views", path.resolve("./views"));

app.get("/", async (req, res) => {
    const allBlogs = await Blog.find({}).sort({ createdAt: -1 });
    res.render("home",{
        user: req.user,
        blogs: allBlogs,
    });
}); 

app.use("/user", userRoute);
app.use("/blog", blogRoute);

app.listen(PORT, () => console.log(`Server is running on PORT ${PORT}`));

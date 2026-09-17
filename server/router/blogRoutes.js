import express from "express";
import {
  addBlog,
  getAllBlogs,
  getBlogId,
  deleteBlogById,
  togglePublish,
  addComment,
  getBlogComments,
  generateContent,
} from "../controller/blogController.js";
import upload from "../middleware/multer.js";
import auth from "../middleware/auth.js";

const blogRouter = express.Router();

// Blog CRUD endpoints
blogRouter.post("/add", auth, upload.single("image"), addBlog);
blogRouter.get("/all", getAllBlogs);
blogRouter.get("/:blogId", getBlogId);
blogRouter.post("/delete", auth, deleteBlogById);
blogRouter.post("/toggle-publish", auth, togglePublish);

// Comment endpoints (supports both POST and GET for REST conventions)
blogRouter.post("/add-comment", addComment);
blogRouter.post("/comments", getBlogComments);
blogRouter.get("/:blogId/comments", getBlogComments);

// AI Generation endpoint
blogRouter.post("/generate", auth, generateContent);

export default blogRouter;

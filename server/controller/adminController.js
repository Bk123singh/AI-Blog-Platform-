import jwt from "jsonwebtoken";
import Blog from "../models/blog.js";
import Comment from "../models/comment.js";

export const adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (
      email !== process.env.ADMIN_EMAIL ||
      password !== process.env.ADMIN_PASSWORD
    ) {
      return res.status(401).json({
        success: false,
        message: "Invalid Credentials",
      });
    }

    const token = jwt.sign({ email }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });

    return res.status(200).json({
      success: true,
      message: "Login Successful",
      token,
    });

  } catch (error) {
    console.log(error);

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

export const getAllBlogsAdmin = async (req, res) => {
  try {
    const blogs = await Blog.find({}).sort({ createdAt: -1 });
    res.json({
      success: true,
      blogs,
    });
  } catch (error) {
    res.json({
      success: false,
      message: error.message,
    });
  }
};

export const getAllComments = async (req, res) => {
  try {
    const comments = await Comment.find({})
      .populate("blog")
      .sort({ createdAt: -1 });

    return res.json({
      success: true,     
      comments,          
    });

  } catch (error) {
    return res.json({
      success: false,
      message: error.message,
    });
  }
};

export const getDashbord = async (req, res) => {
  try {
    
    const recentBlog = await Blog.find({})
      .sort({ createdAt: -1 })
      .limit(5);

    const blogs = await Blog.countDocuments();
    const comments = await Comment.countDocuments();
    const drafts = await Blog.countDocuments({ isPublished: false });

    const dashboardData = {
      blog: blogs,          
      comments,
      drafts,
      recentBlog,           
    };

    return res.json({
      success: true,
      dashboard: dashboardData, 
    });

  } catch (error) {
    return res.json({
      success: false,
      message: error.message,
    });
  }
};

export const delteCommentById = async (req, res) => {
  try {
    const { id } = req.body;
    await Comment.findByIdAndDelete(id);
    res.json({ success: true, message: "Comment delted Successfully" });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

export const approvedCommentById = async (req, res) => {
  try {
    const { id } = req.body;
    await Comment.findByIdAndUpdate(id, { isApproved: true });
    res.json({ success: true, message: "Comment approved Successfully" });
  } catch (error) {}
};

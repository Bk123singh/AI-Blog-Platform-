import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import Blog from "../models/blog.js";
import Comment from "../models/comment.js";

export const adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body || {};

    if (!email || !password || typeof email !== "string" || typeof password !== "string") {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    const envEmail = process.env.ADMIN_EMAIL;
    const envPassword = process.env.ADMIN_PASSWORD;

    if (!envEmail || !envPassword) {
      console.error("ADMIN_EMAIL or ADMIN_PASSWORD is not defined in environment variables");
      return res.status(500).json({
        success: false,
        message: "Admin authentication is not configured on the server",
      });
    }

    const isEmailValid = email.trim().toLowerCase() === envEmail.trim().toLowerCase();
    const isPasswordValid = password === envPassword;

    if (!isEmailValid || !isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Invalid Credentials",
      });
    }

    if (!process.env.JWT_SECRET) {
      console.error("JWT_SECRET is not defined in environment variables");
      return res.status(500).json({
        success: false,
        message: "JWT authentication is not configured on the server",
      });
    }

    const token = jwt.sign(
      { email: envEmail, role: "admin" },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    return res.status(200).json({
      success: true,
      message: "Login Successful",
      token,
    });
  } catch (error) {
    console.error("Admin Login Error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Server error",
    });
  }
};

export const getAllBlogsAdmin = async (req, res) => {
  try {
    // Exclude heavy rich-text description for the admin table to improve response time
    const blogs = await Blog.find({})
      .select("-description")
      .sort({ createdAt: -1 })
      .lean();

    return res.status(200).json({
      success: true,
      blogs,
    });
  } catch (error) {
    console.error("Get All Blogs Admin Error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch blogs",
    });
  }
};

export const getAllComments = async (req, res) => {
  try {
    const comments = await Comment.find({})
      .populate("blog", "title")
      .sort({ createdAt: -1 })
      .lean();

    return res.status(200).json({
      success: true,
      comments,
    });
  } catch (error) {
    console.error("Get All Comments Error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch comments",
    });
  }
};

export const getDashboard = async (req, res) => {
  try {
    // Run queries concurrently via Promise.all for fast dashboard loading
    const [recentBlog, blogCount, commentsCount, draftsCount] = await Promise.all([
      Blog.find({})
        .select("title createdAt isPublished")
        .sort({ createdAt: -1 })
        .limit(5)
        .lean(),
      Blog.countDocuments(),
      Comment.countDocuments(),
      Blog.countDocuments({ isPublished: false }),
    ]);

    const dashboardData = {
      blog: blogCount,
      comments: commentsCount,
      drafts: draftsCount,
      recentBlog,
    };

    return res.status(200).json({
      success: true,
      dashboard: dashboardData,
    });
  } catch (error) {
    console.error("Get Dashboard Error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to load dashboard data",
    });
  }
};

// Alias for backward compatibility
export const getDashbord = getDashboard;

export const deleteCommentById = async (req, res) => {
  try {
    const { id } = req.body || {};

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Valid comment ID is required",
      });
    }

    const comment = await Comment.findByIdAndDelete(id);

    if (!comment) {
      return res.status(404).json({
        success: false,
        message: "Comment not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Comment deleted successfully",
    });
  } catch (error) {
    console.error("Delete Comment Error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to delete comment",
    });
  }
};

// Alias for backward compatibility with existing imports
export const delteCommentById = deleteCommentById;

export const approvedCommentById = async (req, res) => {
  try {
    const { id } = req.body || {};

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Valid comment ID is required",
      });
    }

    const comment = await Comment.findByIdAndUpdate(
      id,
      { isApproved: true },
      { new: true }
    );

    if (!comment) {
      return res.status(404).json({
        success: false,
        message: "Comment not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Comment approved successfully",
    });
  } catch (error) {
    console.error("Approve Comment Error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to approve comment",
    });
  }
};

import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import imageKit, { isImageKitConfigured } from "../config/imageKit.js";
import Blog from "../models/blog.js";
import Comment from "../models/comment.js";
import main from "../config/groq.js";

export const addBlog = async (req, res) => {
  try {
    if (!req.body.blog) {
      return res.status(400).json({
        success: false,
        message: "Missing blog payload",
      });
    }

    let parsedBlog;
    try {
      parsedBlog =
        typeof req.body.blog === "string"
          ? JSON.parse(req.body.blog)
          : req.body.blog;
    } catch (parseErr) {
      return res.status(400).json({
        success: false,
        message: "Invalid JSON format for blog data",
      });
    }

    const { title, subTitle, description, category, isPublished } =
      parsedBlog || {};
    const imageFile = req.file;

    // Validate all required fields
    if (
      !title?.trim() ||
      !subTitle?.trim() ||
      !description?.trim() ||
      !category?.trim() ||
      !imageFile
    ) {
      return res.status(400).json({
        success: false,
        message:
          "All fields (title, subTitle, description, category, and image) are required",
      });
    }

    // Verify ImageKit is configured before attempting upload
    if (!isImageKitConfigured()) {
      return res.status(500).json({
        success: false,
        message:
          "ImageKit service is not configured. Please set IMAGEKIT_PUBLIC_KEY, IMAGEKIT_PRIVATE_KEY, and IMAGEKIT_URL_ENDPOINT in .env",
      });
    }

    // Upload directly from memory buffer (zero temporary disk files)
    const uploadResponse = await imageKit.upload({
      file: imageFile.buffer,
      fileName: imageFile.originalname || `blog_${Date.now()}`,
      folder: "/blogs",
    });

    const optimizedImageUrl = imageKit.url({
      path: uploadResponse.filePath,
      transformation: [
        { quality: "auto" },
        { format: "webp" },
        { width: "1280" },
      ],
    });

    const newBlog = await Blog.create({
      title: title.trim(),
      subTitle: subTitle.trim(),
      description: description.trim(),
      category: category.trim(),
      image: optimizedImageUrl,
      isPublished: Boolean(isPublished),
    });

    return res.status(201).json({
      success: true,
      message: "Blog added successfully",
      blog: newBlog,
    });
  } catch (error) {
    console.error("Add Blog Error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to add blog",
    });
  }
};

export const getAllBlogs = async (req, res) => {
  try {
    // Sort by newest first and use lean for high throughput
    const blogs = await Blog.find({ isPublished: true })
      .sort({ createdAt: -1 })
      .lean();

    return res.status(200).json({
      success: true,
      message: "Blogs fetched successfully",
      blogs,
    });
  } catch (error) {
    console.error("Get All Blogs Error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch blogs",
    });
  }
};

export const getBlogId = async (req, res) => {
  try {
    const { blogId } = req.params;

    if (!blogId || !mongoose.Types.ObjectId.isValid(blogId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid blog ID format",
      });
    }

    const blog = await Blog.findById(blogId);

    if (!blog) {
      return res.status(404).json({
        success: false,
        message: "Blog not found",
      });
    }

    // Protect draft blogs from public snooping: allow only if valid admin token is present
    if (!blog.isPublished) {
      const authHeader = req.headers.authorization || req.headers.token;
      let isAdmin = false;

      if (authHeader && process.env.JWT_SECRET) {
        try {
          const token = authHeader.startsWith("Bearer ")
            ? authHeader.slice(7).trim()
            : authHeader.trim();
          jwt.verify(token, process.env.JWT_SECRET);
          isAdmin = true;
        } catch (e) {
          isAdmin = false;
        }
      }

      if (!isAdmin) {
        return res.status(404).json({
          success: false,
          message: "Blog not found",
        });
      }
    }

    return res.status(200).json({
      success: true,
      blog,
    });
  } catch (error) {
    console.error("Get Blog By ID Error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch blog",
    });
  }
};

export const deleteBlogById = async (req, res) => {
  try {
    const { id } = req.body || {};

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Valid blog ID is required",
      });
    }

    const blog = await Blog.findByIdAndDelete(id);

    if (!blog) {
      return res.status(404).json({
        success: false,
        message: "Blog not found",
      });
    }

    // Cascade delete all comments associated with the deleted blog
    await Comment.deleteMany({ blog: id });

    return res.status(200).json({
      success: true,
      message: "Blog deleted successfully",
    });
  } catch (error) {
    console.error("Delete Blog Error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to delete blog",
    });
  }
};

export const togglePublish = async (req, res) => {
  try {
    const { id } = req.body || {};

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Valid blog ID is required",
      });
    }

    const blog = await Blog.findById(id);

    if (!blog) {
      return res.status(404).json({
        success: false,
        message: "Blog not found",
      });
    }

    blog.isPublished = !blog.isPublished;
    await blog.save();

    return res.status(200).json({
      success: true,
      message: `Blog ${blog.isPublished ? "published" : "unpublished"} successfully`,
      isPublished: blog.isPublished,
    });
  } catch (error) {
    console.error("Toggle Publish Error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to toggle blog publish status",
    });
  }
};

export const addComment = async (req, res) => {
  try {
    const { blog, name, content } = req.body || {};

    if (!blog || !name || !content) {
      return res.status(400).json({
        success: false,
        message: "Blog ID, name, and comment content are all required",
      });
    }

    const trimmedName = String(name).trim();
    const trimmedContent = String(content).trim();

    if (!trimmedName || trimmedName.length > 100) {
      return res.status(400).json({
        success: false,
        message: "Name must be between 1 and 100 characters",
      });
    }

    if (!trimmedContent || trimmedContent.length > 2000) {
      return res.status(400).json({
        success: false,
        message: "Comment must be between 1 and 2000 characters",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(blog)) {
      return res.status(400).json({
        success: false,
        message: "Invalid blog ID format",
      });
    }

    // Verify the blog exists and is published before accepting comments
    const targetBlog = await Blog.findById(blog);
    if (!targetBlog || !targetBlog.isPublished) {
      return res.status(404).json({
        success: false,
        message: "Blog does not exist or is not published",
      });
    }

    await Comment.create({
      blog,
      name: trimmedName,
      content: trimmedContent,
      isApproved: false,
    });

    return res.status(201).json({
      success: true,
      message: "Comment added for review",
    });
  } catch (error) {
    console.error("Add Comment Error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to submit comment",
    });
  }
};

export const getBlogComments = async (req, res) => {
  try {
    // Support blogId in body (frontend format), params, or query
    const blogId =
      req.body?.blogId || req.params?.blogId || req.query?.blogId;

    if (!blogId || !mongoose.Types.ObjectId.isValid(blogId)) {
      return res.status(400).json({
        success: false,
        message: "Valid blogId is required",
      });
    }

    const comments = await Comment.find({
      blog: blogId,
      isApproved: true,
    })
      .sort({ createdAt: -1 })
      .lean();

    return res.status(200).json({
      success: true,
      comments,
    });
  } catch (error) {
    console.error("Get Blog Comments Error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch comments",
    });
  }
};

export const generateContent = async (req, res) => {
  try {
    const { prompt } = req.body || {};

    if (!prompt || typeof prompt !== "string" || !prompt.trim()) {
      return res.status(400).json({
        success: false,
        message: "Prompt is required and must be a non-empty text",
      });
    }

    const content = await main(prompt.trim());

    return res.status(200).json({
      success: true,
      content,
    });
  } catch (error) {
    console.error("Generate Content Error:", error.message);

    return res.status(500).json({
      success: false,
      message: error.message || "Failed to generate content with AI",
    });
  }
};
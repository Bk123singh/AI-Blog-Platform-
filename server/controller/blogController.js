import fs from "fs";
import imageKit from "../config/imageKit.js";
import Blog from "../models/blog.js";
import Comment from "../models/comment.js";
import main from "../config/groq.js";

export const addBlog = async (req, res) => {
  try {
    const { title, subTitle, description, category, isPublished } = JSON.parse(
      req.body.blog
    );

    const imageFile = req.file;

    
    if (!title || !description || !category || !imageFile) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields",
      });
    }

    const fileBuffer = fs.readFileSync(imageFile.path);

    //  upload image
    const response = await imageKit.upload({
      file: fileBuffer,
      fileName: imageFile.originalname,
      folder: "/blogs",
    });

    const optimizedImageUrl = imageKit.url({
      path: response.filePath,
      transformation: [
        { quality: "auto" },
        { format: "webp" },
        { width: "1280" },
      ],
    });

    const image = optimizedImageUrl;

    await Blog.create({
      title,
      subTitle,
      description,
      category,
      image,
      isPublished,
    });

    return res.status(200).json({
      success: true,
      message: "Blog added successfully",
    });

  } catch (error) {
    console.log(error); 

    return res.status(500).json({
      success: false,
      message: error.message || "Server error",
    });
  }
};


export const getAllBlogs= async(req, res)=>{
  try {
    const blogs =await Blog.find({isPublished:true});
    res.json({
      success:true,
      message: "Blog added successfully",
      blogs
    })
  } catch (error) {
    res.jons({
      success:false,
      message:message.error
    })

    
  }
}

export const getBlogId = async (req, res) => {
  try {
    const { blogId } = req.params;

    const blog = await Blog.findById(blogId);

    if (!blog) {
      return res.json({  
        success: false,
        message: "Blog not found",
      });
    }

    return res.json({     
      success: true,
      blog,
    });

  } catch (error) {
    return res.json({    
      success: false,
      message: error.message,
    });
  }
};

export const deleteBlogById = async (req, res) => {
  try {
    const { id } = req.body;

    const blog = await Blog.findByIdAndDelete(id);

    if (!blog) {
      return res.json({
        success: false,
        message: "Blog not found",
      });
    }

    // delete all comments associated with the blog
    await Comment.deleteMany({ blog: id });

    return res.json({
      success: true,
      message: "Blog deleted successfully",
    });

  } catch (error) {
    return res.json({
      success: false,
      message: error.message,
    });
  }
};


export const togglePublish = async (req, res) => {
  try {
    const { id } = req.body;

    const blog = await Blog.findById(id);

    if (!blog) {
      return res.json({
        success: false,
        message: "Blog not found",
      });
    }

    blog.isPublished = !blog.isPublished;
    await blog.save();

    return res.json({
      success: true,
      message: "Blog status updated",
    });

  } catch (error) {
    return res.json({
      success: false,
      message: error.message,
    });
  }
};


export const addComment = async (req, res) => {
  try {
    const { blog, name, content } = req.body;

    await Comment.create({
      blog,
      name,        
      content,
    });

    return res.json({
      success: true,
      message: "Comment added for review",
    });

  } catch (error) {
    return res.json({
      success: false,
      message: error.message,
    });
  }
};

export const getBlogComments = async (req, res) => {
  try {
    const { blogId } = req.body;

    
    const comments = await Comment.find({
      blog: blogId,
      isApproved: true,
    }).sort({ createdAt: -1 });

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

export const generateContent = async (req, res) => {
  try {
    const { prompt } = req.body;

    if (!prompt) {
      return res.json({
        success: false,
        message: "Prompt is required",
      });
    }

    const content = await main(
      prompt + " Write a clean blog with headings and simple explanation"
    );

   

    return res.json({
      success: true,
      content,
    });

  } catch (error) {
    console.log("ERROR:", error.response?.data || error.message);

    return res.json({
      success: false,
      message: error.message,
    });
  }
};
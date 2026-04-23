import mongoose from "mongoose";

const blogSchema =new mongoose.Schema({
    title:{
        type:String,
        required:true
    
    },
    subTitle:{
        type:String,
        required:true
    },
    description:{
        type:String,
        required:true
    },
    category:{
        type:String,
        required:true
    },
    image:{
        type:String,
        retuired:true
    },
    isPublished:{
        type:Boolean,
        retuired:true
    }

},{
    timestamps:true
}
)

const Blog=mongoose.model('blog', blogSchema);

export default Blog;
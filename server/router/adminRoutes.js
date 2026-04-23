import express from 'express'
import { adminLogin, getAllComments, getDashbord,approvedCommentById, getAllBlogsAdmin, delteCommentById} from '../controller/adminController.js';
import auth from '../middleware/auth.js';

const adminRouter=express.Router();

adminRouter.post("/login", adminLogin)
adminRouter.get("/comments", auth,getAllComments)
adminRouter.get("/blogs", auth,getAllBlogsAdmin)
adminRouter.post("/delete-comment", auth,delteCommentById)
adminRouter.post("/approve-comment", auth,approvedCommentById)
adminRouter.get("/dashboard", auth,getDashbord)

export default adminRouter;
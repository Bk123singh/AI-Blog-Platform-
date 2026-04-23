import "dotenv/config";
import express from "express";
import cors from "cors";
import connectDB from "./config/db.js";
import adminRouter from "./router/adminRoutes.js";
import blogRouter from "./router/blogRoutes.js";

const app = express();
const port = process.env.PORT || 8080;


app.use(cors({
  origin: process.env.VITE_URL,
  credentials: true
}));

app.use(express.json());

app.use("/api/admin", adminRouter);
app.use("/api/blog", blogRouter);

app.get("/", (req, res) => {
  res.send("API is working");
});

const startServer = async () => {
  try {
    await connectDB();

    app.listen(port, () => {
      console.log(`Server running on port ${port}`);
    });
  } catch (error) {
    console.error(error.message);
  }
};

startServer();

export default app;
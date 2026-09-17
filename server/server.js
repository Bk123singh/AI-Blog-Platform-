import dotenv from "dotenv";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, ".env") });

import express from "express";
import cors from "cors";
import connectDB from "./config/db.js";
import adminRouter from "./router/adminRoutes.js";
import blogRouter from "./router/blogRoutes.js";
import errorHandler from "./middleware/errorHandler.js";

const app = express();
const port = process.env.PORT || 8080;

// Configurable CORS supporting production, preview, and local frontend
const configuredOrigins = [
  process.env.VITE_URL,
  "http://localhost:5173",
  "http://localhost:3000",
]
  .filter(Boolean)
  .map((url) => url.replace(/\/$/, ""));

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (Postman, server-to-server) or matched origins
      if (
        !origin ||
        configuredOrigins.includes(origin.replace(/\/$/, "")) ||
        process.env.NODE_ENV !== "production"
      ) {
        callback(null, true);
      } else {
        callback(new Error(`CORS error: Origin ${origin} is not allowed`));
      }
    },
    credentials: true,
  })
);

// Body parsers with safe payload limits
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Routes
app.use("/api/admin", adminRouter);
app.use("/api/blog", blogRouter);

// Health check and root route
app.get("/", (req, res) => {
  res.status(200).send("API is working");
});

app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok", uptime: process.uptime() });
});

// 404 Route Not Found handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Endpoint not found: ${req.method} ${req.originalUrl}`,
  });
});

// Centralized Error Handling Middleware
app.use(errorHandler);

const startServer = async () => {
  try {
    await connectDB();

    app.listen(port, () => {
      console.log(`Server running on port ${port}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error.message);
  }
};

startServer();

export default app;
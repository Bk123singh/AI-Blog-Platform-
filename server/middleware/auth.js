import jwt from "jsonwebtoken";

const auth = (req, res, next) => {
  try {
    if (!process.env.JWT_SECRET) {
      console.error("JWT_SECRET is not defined in environment variables");
      return res.status(500).json({
        success: false,
        message: "Server authentication configuration error",
      });
    }

    const authHeader = req.headers.authorization || req.headers.token;

    if (!authHeader) {
      return res.status(401).json({
        success: false,
        message: "Access denied. No token provided",
      });
    }

    // Support both "Bearer <token>" and raw "<token>"
    const token = authHeader.startsWith("Bearer ")
      ? authHeader.slice(7).trim()
      : authHeader.trim();

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Access denied. Token is missing or malformed",
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;

    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        message: "Token has expired. Please login again",
      });
    }

    return res.status(401).json({
      success: false,
      message: "Invalid or unauthorized token",
    });
  }
};

export default auth;
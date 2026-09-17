const errorHandler = (err, req, res, next) => {
  console.error("Unhandled Error:", err);

  // Multer file upload errors
  if (err.name === "MulterError") {
    if (err.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({
        success: false,
        message: "File size exceeds the 5MB limit",
      });
    }
    return res.status(400).json({
      success: false,
      message: `File upload error: ${err.message}`,
    });
  }

  // Custom validation errors passed from multer fileFilter
  if (err.message && err.message.includes("Only image files")) {
    return res.status(400).json({
      success: false,
      message: err.message,
    });
  }

  // Mongoose CastError (invalid ObjectId format)
  if (err.name === "CastError") {
    return res.status(400).json({
      success: false,
      message: `Invalid ID format for field '${err.path}'`,
    });
  }

  // Mongoose ValidationError
  if (err.name === "ValidationError") {
    const messages = Object.values(err.errors).map((e) => e.message);
    return res.status(400).json({
      success: false,
      message: messages.join(", "),
    });
  }

  // JSON Body Parse error
  if (err instanceof SyntaxError && err.status === 400 && "body" in err) {
    return res.status(400).json({
      success: false,
      message: "Invalid JSON format in request body",
    });
  }

  // Default server error
  const statusCode = err.statusCode || err.status || 500;
  return res.status(statusCode).json({
    success: false,
    message: err.message || "Internal Server Error",
  });
};

export default errorHandler;

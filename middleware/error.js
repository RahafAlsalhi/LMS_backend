// middleware/error.js - Error Handling Middleware
import { createResponse } from "../utils/helper.js";

export function errorHandler(err, req, res, next) {
  // Default error
  let error = { ...err };
  error.message = err.message;

  // Log error for debugging
  if (process.env.NODE_ENV === "development") {
    console.error("Error:", err);
  }

  // Joi validation error
  if (err.name === "ValidationError" || err.isJoi) {
    const message =
      err.details?.map((detail) => detail.message).join(", ") ||
      "Validation error";
    return res
      .status(400)
      .json(createResponse(false, message, null, "Validation failed"));
  }

  // Duplicate field error (PostgreSQL)
  if (err.code === "23505") {
    const field = err.constraint?.includes("email") ? "Email" : "Field";
    const message = `${field} already exists`;
    return res
      .status(409)
      .json(createResponse(false, message, null, "Duplicate entry"));
  }

  // Foreign key constraint error (PostgreSQL)
  if (err.code === "23503") {
    const message = "Referenced resource does not exist";
    return res
      .status(400)
      .json(createResponse(false, message, null, "Foreign key constraint"));
  }

  // JWT errors
  if (err.name === "JsonWebTokenError") {
    const message = "Invalid token";
    return res
      .status(401)
      .json(createResponse(false, message, null, "Authentication failed"));
  }

  if (err.name === "TokenExpiredError") {
    const message = "Token expired";
    return res
      .status(401)
      .json(createResponse(false, message, null, "Authentication expired"));
  }

  // MongoDB/Database connection errors
  if (err.name === "MongoError" || err.name === "MongooseError") {
    const message = "Database connection error";
    return res
      .status(500)
      .json(createResponse(false, message, null, "Database error"));
  }

  // Multer errors (file upload)
  if (err.code === "LIMIT_FILE_SIZE") {
    const message = "File too large";
    return res
      .status(400)
      .json(createResponse(false, message, null, "File size exceeded"));
  }

  if (err.code === "LIMIT_FILE_COUNT") {
    const message = "Too many files";
    return res
      .status(400)
      .json(createResponse(false, message, null, "File count exceeded"));
  }

  // Cast error (invalid ObjectId, etc.)
  if (err.name === "CastError") {
    const message = "Invalid resource ID";
    return res
      .status(400)
      .json(createResponse(false, message, null, "Invalid ID format"));
  }

  // Default to 500 server error
  const statusCode = err.statusCode || err.status || 500;
  const message = err.message || "Internal Server Error";

  res
    .status(statusCode)
    .json(
      createResponse(
        false,
        message,
        null,
        process.env.NODE_ENV === "production" ? "Server error" : err.stack
      )
    );
}

export const notFound = (req, res, next) => {
  const error = new Error(`Route not found - ${req.originalUrl}`);
  error.statusCode = 404;
  next(error);
};

// Async error handler wrapper
export const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

export default {
  errorHandler,
  notFound,
  asyncHandler,
};

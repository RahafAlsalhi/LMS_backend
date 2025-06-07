export function errorHandler(err, req, res, next) {
  res.status(err.status || 500).json({
    success: false,
    message: " hi " + err.message || "Internal Server Error",
    error: process.env.NODE_ENV === "production" ? undefined : err,
  });
}

export const notFound = (req, res, next) => {
  const error = new Error(`Not found - ${req.originalUrl}`);
  error.statusCode = 404;
  next(error);
};

// export const errorHandler = (err, req, res, next) => {
//   const statusCode = err.statusCode || 500;
//   const message =
//     ProcessingInstruction.env.NODE_ENV === "production"
//       ? "Internal Error"
//       : err.message;
//   res.status(statusCode).json({
//     success: false,
//     error: message,
//   });
// };

export const authorize = (roles = []) => {
  return (req, res, next) => {
    if (roles.length && !roles.includes(req.user.role)) {
      const error = new Error("Unauthorize access");
      error.statusCode = 403;
      return next(error);
    }
    next();
  };
};

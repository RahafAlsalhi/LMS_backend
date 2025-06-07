export function requireRole(...allowedRoles) {
  return (req, res, next) => {
    // Assuming req.user is set by your auth middleware
    const user = req.user || req.session.user;
    if (!user || !allowedRoles.includes(user.role)) {
      return res.status(403).json({
        success: false,
        message: "Forbidden: insufficient permissions",
      });
    }
    next();
  };
}

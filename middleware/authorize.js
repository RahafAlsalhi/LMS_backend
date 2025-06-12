// middleware/authorize.js - Role-Based Authorization
import { createResponse } from "../utils/helper.js";

// Role-based authorization middleware
export const requireRole = (allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res
        .status(401)
        .json(
          createResponse(
            false,
            "Authentication required",
            null,
            "No user found"
          )
        );
    }

    // Convert single role to array for consistency
    const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];

    if (!roles.includes(req.user.role)) {
      return res
        .status(403)
        .json(
          createResponse(
            false,
            "Access denied",
            null,
            `Required role: ${roles.join(" or ")}, your role: ${req.user.role}`
          )
        );
    }

    next();
  };
};

// Check if user owns resource or is admin
export const requireOwnershipOrAdmin = (getResourceOwnerIdFn) => {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        return res
          .status(401)
          .json(createResponse(false, "Authentication required"));
      }

      // Admin can access anything
      if (req.user.role === "admin") {
        return next();
      }

      // Get resource owner ID using the provided function
      const resourceOwnerId = await getResourceOwnerIdFn(req);

      if (!resourceOwnerId) {
        return res
          .status(404)
          .json(createResponse(false, "Resource not found"));
      }

      // Check ownership
      if (req.user.id !== resourceOwnerId) {
        return res
          .status(403)
          .json(
            createResponse(
              false,
              "Access denied",
              null,
              "You can only access your own resources"
            )
          );
      }

      next();
    } catch (error) {
      console.error("Ownership check error:", error);
      return res
        .status(500)
        .json(
          createResponse(
            false,
            "Authorization check failed",
            null,
            error.message
          )
        );
    }
  };
};

// Middleware to check if user can manage courses
export const canManageCourses = (req, res, next) => {
  if (!req.user) {
    return res
      .status(401)
      .json(createResponse(false, "Authentication required"));
  }

  if (!["instructor", "admin"].includes(req.user.role)) {
    return res
      .status(403)
      .json(
        createResponse(
          false,
          "Access denied",
          null,
          "Only instructors and admins can manage courses"
        )
      );
  }

  next();
};

// Middleware to check if user can manage users (admin only)
export const canManageUsers = (req, res, next) => {
  if (!req.user) {
    return res
      .status(401)
      .json(createResponse(false, "Authentication required"));
  }

  if (req.user.role !== "admin") {
    return res
      .status(403)
      .json(
        createResponse(false, "Access denied", null, "Admin access required")
      );
  }

  next();
};

// Convenience middleware functions
export const requireAdmin = (req, res, next) => {
  return requireRole(["admin"])(req, res, next);
};

export const requireInstructorOrAdmin = (req, res, next) => {
  return requireRole(["instructor", "admin"])(req, res, next);
};

export const requireStudent = (req, res, next) => {
  return requireRole(["student"])(req, res, next);
};

// For broader access patterns
export const requireInstructor = (req, res, next) => {
  return requireRole(["instructor", "admin"])(req, res, next);
};

export const requireStudentAccess = (req, res, next) => {
  return requireRole(["student", "instructor", "admin"])(req, res, next);
};
// Only allow user to access their own resource (no admin bypass)
export const requireSelfOnly = (getResourceOwnerIdFn) => {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        return res
          .status(401)
          .json(createResponse(false, "Authentication required"));
      }

      const resourceOwnerId = await getResourceOwnerIdFn(req);

      if (!resourceOwnerId) {
        return res
          .status(404)
          .json(createResponse(false, "Resource not found"));
      }

      if (req.user.id !== resourceOwnerId) {
        return res
          .status(403)
          .json(
            createResponse(
              false,
              "Access denied",
              null,
              "You can only access your own account"
            )
          );
      }

      next();
    } catch (error) {
      console.error("Self-only check error:", error);
      return res
        .status(500)
        .json(
          createResponse(
            false,
            "Authorization check failed",
            null,
            error.message
          )
        );
    }
  };
};

// Default export
export default {
  requireRole,
  requireOwnershipOrAdmin,
  canManageCourses,
  canManageUsers,
  requireAdmin,
  requireInstructorOrAdmin,
  requireStudent,
  requireInstructor,
  requireStudentAccess,
  requireSelfOnly,
};

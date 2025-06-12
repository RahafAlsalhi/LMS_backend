import jwt from "jsonwebtoken";
import { getUserById } from "../models/user.model.js";
import { createResponse } from "../utils/helper.js";

// Main JWT authentication middleware (checks cookies first, then headers)
export const authenticateJWT = async (req, res, next) => {
  try {
    let token = null;

    // 1. First check cookies (for browser requests)
    if (req.cookies && req.cookies.accessToken) {
      token = req.cookies.accessToken;
    }

    // 2. Fallback to Authorization header (for API requests)
    if (!token) {
      const authHeader = req.headers.authorization;
      if (authHeader && authHeader.startsWith("Bearer ")) {
        token = authHeader.split(" ")[1];
      }
    }

    // 3. No token found
    if (!token) {
      return res
        .status(401)
        .json(
          createResponse(
            false,
            "Access token required",
            null,
            "No token provided"
          )
        );
    }

    // 4. Verify and decode token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 5. Get user from database
    const user = await getUserById(decoded.id);
    if (!user) {
      return res
        .status(401)
        .json(createResponse(false, "Invalid token", null, "User not found"));
    }

    // 6. Check if user is active
    if (!user.is_active) {
      return res
        .status(401)
        .json(
          createResponse(
            false,
            "Account deactivated",
            null,
            "User account is not active"
          )
        );
    }

    // 7. Attach user to request object
    req.user = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      avatar_url: user.avatar_url,
      is_active: user.is_active,
    };

    next();
  } catch (error) {
    // Handle different JWT errors
    if (error.name === "TokenExpiredError") {
      return res
        .status(401)
        .json(
          createResponse(false, "Token expired", null, "Please login again")
        );
    } else if (error.name === "JsonWebTokenError") {
      return res
        .status(403)
        .json(
          createResponse(false, "Invalid token", null, "Token is malformed")
        );
    } else {
      console.error("JWT Auth Error:", error);
      return res
        .status(500)
        .json(
          createResponse(false, "Authentication error", null, error.message)
        );
    }
  }
};

// Optional JWT authentication (doesn't fail if no token)
export const optionalJWT = async (req, res, next) => {
  try {
    let token = null;

    // Check cookies first, then headers
    if (req.cookies && req.cookies.accessToken) {
      token = req.cookies.accessToken;
    } else {
      const authHeader = req.headers.authorization;
      if (authHeader && authHeader.startsWith("Bearer ")) {
        token = authHeader.split(" ")[1];
      }
    }

    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await getUserById(decoded.id);

        if (user && user.is_active) {
          req.user = {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            avatar_url: user.avatar_url,
            is_active: user.is_active,
          };
        }
      } catch (error) {
        // Silently fail for optional auth
        console.log("Optional JWT failed:", error.message);
      }
    }

    next();
  } catch (error) {
    // Continue without authentication
    next();
  }
};

// Session-based authentication (for Passport.js OAuth)
export const isAuthenticated = (req, res, next) => {
  if (req.isAuthenticated && req.isAuthenticated()) {
    return next();
  }

  return res
    .status(401)
    .json(
      createResponse(
        false,
        "Authentication required",
        null,
        "User not authenticated"
      )
    );
};

// Legacy token authentication (for backwards compatibility)
export const authenticateToken = async (req, res, next) => {
  try {
    // Check session first
    if (req.session && req.session.authenticated && req.session.userId) {
      const user = await getUserById(req.session.userId);
      if (user && user.is_active) {
        req.user = user;
        return next();
      }
    }

    // Check cookie token
    const token = req.cookies.token || req.cookies.accessToken;
    if (!token) {
      return res
        .status(401)
        .json(createResponse(false, "Authentication token missing"));
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await getUserById(decoded.id);

    if (!user) {
      return res.status(401).json(createResponse(false, "User not found"));
    }

    if (!user.is_active) {
      return res.status(401).json(createResponse(false, "Account deactivated"));
    }

    // Renew session
    if (req.session) {
      req.session.userId = user.id;
      req.session.authenticated = true;
    }

    req.user = user;
    next();
  } catch (error) {
    console.error("Token authentication error:", error);
    return res
      .status(403)
      .json(
        createResponse(false, "Invalid or expired token", null, error.message)
      );
  }
};

export default {
  authenticateJWT,
  optionalJWT,
  isAuthenticated,
  authenticateToken,
};

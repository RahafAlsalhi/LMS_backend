import {
  generateTokens,
  verifyPassword,
  generateRefreshTokens,
} from "../utils/auth.js";
import {
  getUserByEmail,
  createUser,
  getUserById,
} from "../models/user.model.js";
import passport from "../config/passport.js";
import jwt from "jsonwebtoken";
import { createResponse } from "../utils/helper.js";

//start google oauth flow
export const googleAuth = passport.authenticate("google", {
  scope: ["profile", "email"],
  prompt: "select_account",
});

//handle google auth callback
export const googleCallBack = (req, res, next) => {
  passport.authenticate(
    "google",
    { failureRedirect: "/login" },
    async (err, user) => {
      if (err) {
        console.error("Google OAuth error: ", err);
        return res.status(500).json({
          success: false,
          message: "OAuth authentication failed",
        });
      }
      if (!user) {
        return res.status(401).json({
          success: false,
          message: "Authentication failed",
        });
      }
      try {
        req.login(user, (err) => {
          if (err) {
            console.error("Login error", err);
            return res.status(500).json({
              success: false,
              message: "Failed to log in",
            });
          }

          req.session.userId = user.id;
          req.session.authenticated = true;

          const tokenPayload = { id: user.id, email: user.email };
          const accessToken = generateTokens(tokenPayload);
          const refreshToken = generateRefreshTokens(tokenPayload);

          req.session.save(() => {
            // Set http-only cookies for security
            res.cookie("accessToken", accessToken, {
              httpOnly: true,
              secure: process.env.NODE_ENV === "production",
              sameSite: "lax",
              maxAge: 24 * 60 * 60 * 1000, // 24 hours
            });
            res.cookie("refreshToken", refreshToken, {
              httpOnly: true,
              secure: process.env.NODE_ENV === "production",
              sameSite: "lax",
              maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
            });

            res.json({
              success: true,
              user: {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role,
              },
              message: "Successfully logged in",
            });
          });
        });
      } catch (err) {
        next(err);
      }
    }
  )(req, res, next);
};

export async function Register(req, res, next) {
  try {
    const userInfo = { ...req.body };
    const existingUser = await getUserByEmail(userInfo.email);

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "Email already in use",
      });
    }

    const newUser = await createUser(userInfo);

    // Create session
    req.session.userId = newUser.id;
    req.session.authenticated = true;

    req.session.save(() => {
      const tokenPayload = { id: newUser.id, email: newUser.email };
      const accessToken = generateTokens(tokenPayload);
      const refreshToken = generateRefreshTokens(tokenPayload);

      // Set consistent cookie names
      res.cookie("accessToken", accessToken, {
        secure: process.env.NODE_ENV === "production",
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000, // 24 hours
        sameSite: "lax",
      });

      res.cookie("refreshToken", refreshToken, {
        secure: process.env.NODE_ENV === "production",
        httpOnly: true,
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        sameSite: "lax",
      });

      res.status(201).json({
        success: true,
        user: {
          id: newUser.id,
          email: newUser.email,
          name: newUser.name,
          role: newUser.role,
        },
        message: "Registration successful",
      });
    });
  } catch (err) {
    next(err);
  }
}

export async function Login(req, res, next) {
  try {
    const { email, password } = req.body;
    console.log("🔍 Login attempt for:", email);

    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    // Find user
    console.log("🔍 Looking up user...");
    const existingUser = await getUserByEmail(email);

    if (!existingUser) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    // Check if user has password hash (not OAuth-only user)
    if (!existingUser.password_hash) {
      return res.status(401).json({
        success: false,
        message: "Please login with Google",
      });
    }

    // Verify password
    console.log("🔍 Verifying password...");
    const isMatch = await verifyPassword(password, existingUser.password_hash);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    // Generate tokens
    const tokenPayload = {
      id: existingUser.id,
      email: existingUser.email,
      role: existingUser.role,
    };

    const accessToken = generateTokens(tokenPayload);
    const refreshToken = generateRefreshTokens(tokenPayload);

    console.log(
      "✅ Tokens generated - Access:",
      accessToken.length,
      "chars, Refresh:",
      refreshToken.length,
      "chars"
    );

    // CORRECTED: Cookie settings for localhost development
    const isDevelopment = process.env.NODE_ENV !== "production";

    const cookieOptions = {
      httpOnly: true,
      secure: false, // Always false for localhost
      sameSite: "lax", // Use 'lax' for localhost
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
      path: "/",
      // Don't set domain for localhost - let browser handle it
    };

    const refreshCookieOptions = {
      httpOnly: true,
      secure: false, // Always false for localhost
      sameSite: "lax", // Use 'lax' for localhost
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      path: "/",
      // Don't set domain for localhost - let browser handle it
    };

    // Set cookies
    res.cookie("accessToken", accessToken, cookieOptions);
    res.cookie("refreshToken", refreshToken, refreshCookieOptions);

    console.log("🍪 Setting cookies with options:", {
      httpOnly: cookieOptions.httpOnly,
      secure: cookieOptions.secure,
      sameSite: cookieOptions.sameSite,
      maxAge: cookieOptions.maxAge,
    });

    // Create session
    req.session.userId = existingUser.id;
    req.session.authenticated = true;

    // Save session and send response
    req.session.save((err) => {
      if (err) {
        return res.status(500).json({
          success: false,
          message: "Session creation failed",
        });
      }

      const responseData = {
        success: true,
        user: {
          id: existingUser.id,
          email: existingUser.email,
          name: existingUser.name,
          role: existingUser.role,
        },
        message: "Login successful",
      };

      res.json(responseData);
    });
  } catch (err) {
    console.error("❌ Login function error:", err);
    next(err);
  }
}
export async function getCurrentLogInInfo(req, res, next) {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({
        success: false,
        message: "User not authenticated",
      });
    }

    const user = await getUserById(req.user.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Remove password_hash from response
    const { password_hash, ...sanitizedUser } = user;

    res.json({
      success: true,
      user: sanitizedUser,
    });
  } catch (err) {
    next(err);
  }
}

export async function logout(req, res, next) {
  try {
    // Destroy session if exists
    if (req.session) {
      req.session.destroy((err) => {
        if (err) {
          return next(err);
        }
        // Clear cookies
        res.clearCookie("accessToken");
        res.clearCookie("refreshToken");
        res.json({ success: true, message: "Logged out successfully" });
      });
    } else {
      // Clear cookies even if no session
      res.clearCookie("accessToken");
      res.clearCookie("refreshToken");
      res.json({ success: true, message: "Logged out successfully" });
    }
  } catch (err) {
    next(err);
  }
}

export async function getCurrentUser(req, res) {
  try {
    if (!req.user) {
      return res
        .status(401)
        .json(
          createResponse(
            false,
            "Not Authenticated",
            null,
            "User not found in session"
          )
        );
    }

    // Remove password_hash from user object
    const { password_hash, ...sanitizedUser } = req.user;

    return res.json(
      createResponse(true, "User retrieved successfully", sanitizedUser)
    );
  } catch (error) {
    console.error("Get current user error:", error);
    return res
      .status(500)
      .json(createResponse(false, "Server error", null, error.message));
  }
}

// Fixed refreshToken function
export const refreshToken = async (req, res) => {
  try {
    // Get refresh token from cookies
    const refreshTokenFromCookie = req.cookies.refreshToken;

    if (!refreshTokenFromCookie) {
      return res
        .status(401)
        .json(
          createResponse(
            false,
            "Refresh token required",
            null,
            "No refresh token provided"
          )
        );
    }

    // Verify refresh token - Use the correct secret
    const decoded = jwt.verify(
      refreshTokenFromCookie,
      process.env.JWT_REFRESH_SECRET
    );

    // Verify user still exists and is active
    const user = await getUserById(decoded.id);
    if (!user) {
      res.clearCookie("refreshToken");
      res.clearCookie("accessToken");
      return res
        .status(401)
        .json(
          createResponse(
            false,
            "User not found",
            null,
            "Invalid refresh token - user does not exist"
          )
        );
    }

    if (!user.is_active) {
      res.clearCookie("refreshToken");
      res.clearCookie("accessToken");
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

    // Generate new access token
    const newAccessToken = generateTokens({
      id: decoded.id,
      email: decoded.email,
    });

    // Set new access token cookie
    res.cookie("accessToken", newAccessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    });

    return res.json(
      createResponse(true, "Token refreshed successfully", {
        accessToken: newAccessToken,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        },
      })
    );
  } catch (err) {
    // Handle specific JWT errors
    if (err.name === "TokenExpiredError") {
      res.clearCookie("refreshToken");
      res.clearCookie("accessToken");
      return res
        .status(401)
        .json(
          createResponse(
            false,
            "Refresh token expired",
            null,
            "Please login again"
          )
        );
    }

    if (err.name === "JsonWebTokenError") {
      res.clearCookie("refreshToken");
      res.clearCookie("accessToken");
      return res
        .status(401)
        .json(
          createResponse(
            false,
            "Invalid refresh token",
            null,
            "Token is malformed"
          )
        );
    }

    // Clear invalid refresh token for any other error
    res.clearCookie("refreshToken");
    res.clearCookie("accessToken");

    return res
      .status(401)
      .json(createResponse(false, "Invalid refresh token", null, err.message));
  }
};

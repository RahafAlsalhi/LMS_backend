import {
  generateTokens,
  verifyPassword,
  generateRefreshTokens,
} from "../utils/auth.js";
import { createResponse, sanitizedUser } from "../utils/helper.js";
import {
  getUserByEmail,
  createUser,
  getUserById,
} from "../models/user.model.js";
import passport from "../config/passport.js";
import jwt from "jsonwebtoken";

// Start Google OAuth flow
export const googleAuth = passport.authenticate("google", {
  scope: ["profile", "email"],
  prompt: "select_account",
});

// Handle Google OAuth callback
export const googleCallBack = (req, res, next) => {
  passport.authenticate(
    "google",
    { failureRedirect: "/login" },
    async (err, user) => {
      if (err) {
        console.error("Google OAuth error:", err);
        return res
          .status(500)
          .json({ success: false, message: "Google OAuth error" });
      }

      if (!user) {
        return res
          .status(401)
          .json({ success: false, message: "Not logged in" });
      }

      try {
        req.login(user, (loginErr) => {
          if (loginErr) {
            console.error("Login error", loginErr);
            return res
              .status(500)
              .json({ success: false, message: "Failed to log in" });
          }

          req.session.userId = user.id;
          req.session.authenticated = true;

          const tokenPayload = {
            id: user.id,
            email: user.email,
            role: user.role,
          };
          const accessToken = generateTokens(tokenPayload);
          const refreshToken = generateRefreshTokens(tokenPayload);

          req.session.save((sessionErr) => {
            if (sessionErr) {
              console.error("Session save error", sessionErr);
              return res
                .status(500)
                .json({ success: false, message: "Session error" });
            }

            const safeUser = sanitizedUser(user);
            res.cookie("accessToken", accessToken, {
              httpOnly: true,
              secure: process.env.NODE_ENV === "production",
              sameSite: "lax",
              maxAge: 24 * 60 * 60 * 1000,
            });
            res.cookie("refreshToken", refreshToken, {
              httpOnly: true,
              secure: process.env.NODE_ENV === "production",
              sameSite: "lax",
              maxAge: 24 * 60 * 60 * 1000,
            });

            return res.json({ success: true, user: safeUser });
          });
        });
      } catch (err) {
        console.error("Google callback server error", err);
        return res
          .status(500)
          .json({ success: false, message: "Server error" });
      }
    }
  )(req, res, next);
};

// Register (email/password)
export async function Register(req, res, next) {
  try {
    const userInfo = { ...req.body };

    if (!userInfo.email || !userInfo.password || !userInfo.name) {
      return res
        .status(400)
        .json(createResponse(false, "Name, email, and password are required"));
    }

    const existingUser = await getUserByEmail(userInfo.email);
    if (existingUser) {
      return res
        .status(409)
        .json(createResponse(false, "Email already in use"));
    }

    const newUser = await createUser(userInfo);
    req.session.userId = newUser.id;
    req.session.authenticated = true;

    const tokenPayload = {
      id: newUser.id,
      email: newUser.email,
      role: newUser.role,
    };
    const accessToken = generateTokens(tokenPayload);
    const refreshToken = generateRefreshTokens(tokenPayload);

    req.session.save((sessionErr) => {
      if (sessionErr) {
        console.error("Session save error", sessionErr);
        return res.status(500).json(createResponse(false, "Session error"));
      }

      res.cookie("accessToken", accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 24 * 60 * 60 * 1000,
      });
      res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 24 * 60 * 60 * 1000,
      });

      const safeUser = sanitizedUser(newUser);
      res.json({
        success: true,
        accessToken,
        refreshToken,
        user: safeUser,
        message: "Logged in",
      });
    });
  } catch (err) {
    next(err);
  }
}

// Login (email/password)
export async function Login(req, res, next) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json(createResponse(false, "Email and password are required"));
    }

    const existingUser = await getUserByEmail(email);
    if (!existingUser) {
      return res.status(401).json(createResponse(false, "User not found"));
    }

    const isMatch = await verifyPassword(password, existingUser.password_hash);
    if (!isMatch) {
      return res
        .status(401)
        .json(createResponse(false, "Email or password is incorrect"));
    }

    req.session.userId = existingUser.id;
    req.session.authenticated = true;

    const tokenPayload = {
      id: existingUser.id,
      email: existingUser.email,
      role: existingUser.role,
    };
    const accessToken = generateTokens(tokenPayload);
    const refreshToken = generateRefreshTokens(tokenPayload);

    req.session.save((sessionErr) => {
      if (sessionErr) {
        console.error("Session save error", sessionErr);
        return res.status(500).json(createResponse(false, "Session error"));
      }

      res.cookie("accessToken", accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 24 * 60 * 60 * 1000,
      });
      res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 24 * 60 * 60 * 1000,
      });

      const safeUser = sanitizedUser(existingUser);
      res.json({
        success: true,
        accessToken,
        refreshToken,
        user: safeUser,
        message: "Logged in",
      });
    });
  } catch (err) {
    next(err);
  }
}

// Logout
export async function logout(req, res, next) {
  try {
    if (req.session) {
      req.session.destroy((err) => {
        if (err) return next(err);
        res.clearCookie("accessToken");
        res.clearCookie("refreshToken");
        res.json({ success: true, message: "Logged out successfully" });
      });
    } else {
      res.clearCookie("accessToken");
      res.clearCookie("refreshToken");
      res.json({ success: true, message: "Logged out successfully" });
    }
  } catch (err) {
    next(err);
  }
}

// Get current login info (from session or req.user)
export async function getCurrentUserInfo(req, res, next) {
  try {
    if (!req.session || !req.session.userId) {
      return res.status(401).json({
        success: false,
        message: "User not authenticated",
      });
    }

    const user = await getUserById(req.session.userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.json({
      success: true,
      user: sanitizedUser(user),
    });
  } catch (err) {
    next(err);
  }
}

// Refresh token handler
export const refreshToken = (req, res) => {
  try {
    const refreshTokenCookie = req.cookies.refreshToken;
    if (!refreshTokenCookie) {
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

    const decoded = jwt.verify(refreshTokenCookie, process.env.JWT_SECRET);
    const newAccessToken = generateTokens({
      id: decoded.id,
      email: decoded.email,
      role: decoded.role,
    });

    res.cookie("accessToken", newAccessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.json(
      createResponse(true, "Token refreshed", { accessToken: newAccessToken })
    );
  } catch (err) {
    console.error("Can't refresh token", err);
    return res
      .status(500)
      .json(createResponse(false, "Server error", null, err.message));
  }
};

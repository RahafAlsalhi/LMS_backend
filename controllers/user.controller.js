import {
  createUser,
  updateUser,
  deleteUser,
  getAllUsers,
  getUserById,
  getUserByEmail,
  changeUserPassword,
  getUserbyGoogleId,
  toggleUserStatus as toggleUserStatusModel,
  getAllUsersAdmin as getAllUsersAdminModel,
} from "../models/user.model.js";
import { createResponse } from "../utils/helper.js";
import { verifyPassword } from "../utils/auth.js";

// Create user - FIXED: Better validation and response
export async function createUserController(req, res) {
  try {
    const userInfo = { ...req.body };

    // Check if user already exists
    const existingUser = await getUserByEmail(userInfo.email);
    if (existingUser) {
      return res
        .status(400)
        .json(createResponse(false, "Email already in use"));
    }

    // Google Auth registration
    if (userInfo.oauth_provider === "google" && userInfo.oauth_id) {
      userInfo.password = null; // Ignore password for Google users
      userInfo.avatar_url = userInfo.avatar_url || null;

      // Validate required Google fields
      if (!userInfo.email || !userInfo.name) {
        return res
          .status(400)
          .json(
            createResponse(
              false,
              "Email and name are required for Google registration"
            )
          );
      }
    } else {
      // Email/password registration
      userInfo.oauth_provider = null;
      userInfo.oauth_id = null;
      userInfo.avatar_url = userInfo.avatar_url || null;

      // Validate required fields
      if (!userInfo.email || !userInfo.password || !userInfo.name) {
        return res
          .status(400)
          .json(
            createResponse(false, "Name, email, and password are required")
          );
      }

      // Validate password length
      if (userInfo.password.length < 6) {
        return res
          .status(400)
          .json(
            createResponse(false, "Password must be at least 6 characters long")
          );
      }
    }

    // Set default role if not provided
    if (!userInfo.role) {
      userInfo.role = "student";
    }

    // Create user
    const user = await createUser(userInfo);
    if (user) {
      // Remove password_hash from response
      const { password_hash, ...sanitizedUser } = user;
      return res
        .status(201)
        .json(createResponse(true, "User created successfully", sanitizedUser));
    }
    return res.status(400).json(createResponse(false, "Failed to create user"));
  } catch (err) {
    console.error("Create user error:", err);
    return res
      .status(500)
      .json(createResponse(false, err.message || "Server error"));
  }
}

// Update user - FIXED: Only allow name, email, role, avatar_url updates
export async function updateUserController(req, res) {
  const id = Number(req.params.id);
  if (!Number.isInteger(id)) {
    return res.status(400).json(createResponse(false, "Invalid user ID"));
  }

  try {
    // Check if user exists
    const existingUser = await getUserById(id);
    if (!existingUser) {
      return res.status(404).json(createResponse(false, "User not found"));
    }

    // Only allow specific fields to be updated
    const allowedFields = ["name", "email", "role", "avatar_url"];
    const updateData = {};

    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        updateData[field] = req.body[field];
      }
    }

    // Validate required fields
    if (updateData.name === "") {
      return res
        .status(400)
        .json(createResponse(false, "Name cannot be empty"));
    }

    if (updateData.email === "") {
      return res
        .status(400)
        .json(createResponse(false, "Email cannot be empty"));
    }

    // Check if email is being changed and already exists
    if (updateData.email && updateData.email !== existingUser.email) {
      const emailExists = await getUserByEmail(updateData.email);
      if (emailExists) {
        return res
          .status(400)
          .json(createResponse(false, "Email already in use"));
      }
    }

    const user = await updateUser({ ...updateData, id });
    if (user) {
      // Remove password_hash from response
      const { password_hash, ...sanitizedUser } = user;
      return res
        .status(200)
        .json(createResponse(true, "User updated successfully", sanitizedUser));
    }
    return res.status(404).json(createResponse(false, "User not found"));
  } catch (err) {
    console.error("Update user error:", err);
    return res
      .status(500)
      .json(createResponse(false, err.message || "Server error"));
  }
}

// Delete user - FIXED: Better error handling
export async function deleteUserController(req, res) {
  const id = Number(req.params.id);
  if (!Number.isInteger(id)) {
    return res.status(400).json(createResponse(false, "Invalid user ID"));
  }

  try {
    // Check if user exists
    const existingUser = await getUserById(id);
    if (!existingUser) {
      return res.status(404).json(createResponse(false, "User not found"));
    }

    // Prevent deleting admin users (optional security measure)
    if (existingUser.role === "admin") {
      return res
        .status(403)
        .json(createResponse(false, "Cannot delete admin users"));
    }

    const deleted = await deleteUser(id);
    if (deleted) {
      return res
        .status(200)
        .json(createResponse(true, "User deleted successfully"));
    }
    return res.status(500).json(createResponse(false, "Failed to delete user"));
  } catch (err) {
    console.error("Delete user error:", err);
    return res
      .status(500)
      .json(createResponse(false, err.message || "Server error"));
  }
}

// Get all users (admin) - FIXED: Better response structure
export async function getAllUsersController(req, res) {
  try {
    const users = await getAllUsers();
    return res
      .status(200)
      .json(createResponse(true, "Users retrieved successfully", users));
  } catch (err) {
    console.error("Get all users error:", err);
    return res
      .status(500)
      .json(createResponse(false, err.message || "Server error"));
  }
}

// Get user by id
export async function getUserByIdController(req, res) {
  const id = Number(req.params.id);
  if (!Number.isInteger(id)) {
    return res.status(400).json(createResponse(false, "Invalid user ID"));
  }

  try {
    const user = await getUserById(id);
    if (user) {
      // Remove password_hash from response
      const { password_hash, ...sanitizedUser } = user;
      return res
        .status(200)
        .json(createResponse(true, "User found", sanitizedUser));
    }
    return res.status(404).json(createResponse(false, "User not found"));
  } catch (err) {
    console.error("Get user by ID error:", err);
    return res
      .status(500)
      .json(createResponse(false, err.message || "Server error"));
  }
}

// Get user by email
export async function getUserByEmailController(req, res) {
  const { email } = req.query;
  if (!email) {
    return res
      .status(400)
      .json(createResponse(false, "Email parameter is required"));
  }

  try {
    const user = await getUserByEmail(email);
    if (user) {
      // Remove password_hash from response
      const { password_hash, ...sanitizedUser } = user;
      return res
        .status(200)
        .json(createResponse(true, "User found", sanitizedUser));
    }
    return res.status(404).json(createResponse(false, "User not found"));
  } catch (err) {
    console.error("Get user by email error:", err);
    return res
      .status(500)
      .json(createResponse(false, err.message || "Server error"));
  }
}

// Change user password
export async function changeUserPasswordController(req, res) {
  const user_id = Number(req.params.id);
  const { oldPassword, newPassword } = req.body;

  if (!Number.isInteger(user_id)) {
    return res.status(400).json(createResponse(false, "Invalid user ID"));
  }

  if (!oldPassword || !newPassword) {
    return res
      .status(400)
      .json(
        createResponse(false, "Old password and new password are required")
      );
  }

  if (newPassword.length < 6) {
    return res
      .status(400)
      .json(
        createResponse(false, "New password must be at least 6 characters long")
      );
  }

  try {
    // Get user with hashed password
    const user = await getUserById(user_id);
    if (!user) {
      return res.status(404).json(createResponse(false, "User not found"));
    }

    if (!user.password_hash) {
      return res
        .status(400)
        .json(createResponse(false, "Cannot change password for OAuth users"));
    }

    // Verify old password
    const isMatch = await verifyPassword(oldPassword, user.password_hash);
    if (!isMatch) {
      return res
        .status(400)
        .json(createResponse(false, "Current password is incorrect"));
    }

    // Change password
    const updatedUser = await changeUserPassword({ user_id, newPassword });
    if (updatedUser) {
      // Remove password_hash from response
      const { password_hash, ...sanitizedUser } = updatedUser;
      return res
        .status(200)
        .json(
          createResponse(true, "Password changed successfully", sanitizedUser)
        );
    }
    return res
      .status(500)
      .json(createResponse(false, "Failed to change password"));
  } catch (err) {
    console.error("Change password error:", err);
    return res
      .status(500)
      .json(createResponse(false, err.message || "Server error"));
  }
}

// Get user by Google ID
export async function getUserByGoogleIdController(req, res) {
  const { googleId } = req.query;
  if (!googleId) {
    return res
      .status(400)
      .json(createResponse(false, "Google ID parameter is required"));
  }

  try {
    const user = await getUserbyGoogleId(googleId);
    if (user) {
      // Remove password_hash from response (though OAuth users shouldn't have one)
      const { password_hash, ...sanitizedUser } = user;
      return res
        .status(200)
        .json(createResponse(true, "User found", sanitizedUser));
    }
    return res.status(404).json(createResponse(false, "User not found"));
  } catch (err) {
    console.error("Get user by Google ID error:", err);
    return res
      .status(500)
      .json(createResponse(false, err.message || "Server error"));
  }
}

// Toggle user status - FIXED: Function name and import
export async function toggleUserStatus(req, res) {
  const id = Number(req.params.id);
  const { is_active } = req.body;

  if (!Number.isInteger(id)) {
    return res.status(400).json(createResponse(false, "Invalid user ID"));
  }

  if (typeof is_active !== "boolean") {
    return res
      .status(400)
      .json(createResponse(false, "is_active must be a boolean"));
  }

  try {
    const user = await toggleUserStatusModel(id, is_active);
    if (user) {
      return res
        .status(200)
        .json(createResponse(true, "User status updated successfully", user));
    } else {
      return res.status(404).json(createResponse(false, "User not found"));
    }
  } catch (err) {
    console.error("Toggle user status error:", err);
    return res
      .status(500)
      .json(createResponse(false, err.message || "Server error"));
  }
}

// Get all users for admin - FIXED: Function name and import
export async function getAllUsersAdmin(req, res) {
  try {
    const users = await getAllUsersAdminModel();
    return res
      .status(200)
      .json(createResponse(true, "Users fetched successfully", users));
  } catch (err) {
    console.error("Get all users admin error:", err);
    return res
      .status(500)
      .json(createResponse(false, err.message || "Server error"));
  }
}

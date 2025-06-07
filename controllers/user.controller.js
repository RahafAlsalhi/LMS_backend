import {
  createUser,
  updateUser,
  deleteUser,
  getAllUsers,
  getUserById,
  getUserByEmail,
  changeUserPassword,
  getUserbyGoogleId,
} from "../models/user.model.js";
import { createResponse } from "../utils/helper.js";
import { verifyPassword } from "../utils/auth.js";

// Create user
export async function createUserController(req, res) {
  try {
    const userInfo = { ...req.body };

    // Google Auth registration
    if (userInfo.oauth_provider === "google" && userInfo.oauth_id) {
      userInfo.password = null; // Ignore password for Google users
      userInfo.avatar = userInfo.avatar || null;

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
      userInfo.avatar = userInfo.avatar || null;

      // Validate required fields
      if (!userInfo.email || !userInfo.password || !userInfo.name) {
        return res
          .status(400)
          .json(
            createResponse(false, "Name, email, and password are required")
          );
      }
    }

    // Create user
    const user = await createUser(userInfo);
    if (user) {
      return res.status(201).json(createResponse(true, "User created", user));
    }
    return res.status(400).json(createResponse(false, "User not created"));
  } catch (err) {
    return res.status(500).json(createResponse(false, err.message));
  }
}

// Update user
export async function updateUserController(req, res) {
  const id = Number(req.params.id);
  if (!Number.isInteger(id)) {
    return res.status(400).json({ message: "Invalid User id " });
  }
  try {
    const user = await updateUser({ ...req.body, id });
    if (user) {
      return res.status(200).json(createResponse(true, "User updated", user));
    }
    return res.status(404).json(createResponse(false, "User not found"));
  } catch (err) {
    return res.status(500).json(createResponse(false, err.message));
  }
}

// Delete user
export async function deleteUserController(req, res) {
  const id = Number(req.params.id);
  if (!Number.isInteger(id)) {
    return res.status(400).json(createResponse(false, "Invalid user id"));
  }
  try {
    const deleted = await deleteUser(id);
    if (deleted) {
      return res.status(200).json(createResponse(true, "User deleted"));
    }
    return res.status(404).json(createResponse(false, "User not found"));
  } catch (err) {
    return res.status(500).json(createResponse(false, err.message));
  }
}

// Get all users (admin)
export async function getAllUsersController(req, res) {
  try {
    const users = await getAllUsers();
    return res.status(200).json(createResponse(true, "Users fetched", users));
  } catch (err) {
    return res.status(500).json(createResponse(false, err.message));
  }
}

// Get user by id
export async function getUserByIdController(req, res) {
  const id = Number(req.params.id);
  if (!Number.isInteger(id)) {
    return res.status(400).json(createResponse(false, "Invalid user id"));
  }
  try {
    const user = await getUserById(id);
    if (user) {
      return res.status(200).json(createResponse(true, "User found", user));
    }
    return res.status(404).json(createResponse(false, "User not found"));
  } catch (err) {
    return res.status(500).json(createResponse(false, err.message));
  }
}

// Get user by email
export async function getUserByEmailController(req, res) {
  const { email } = req.query;
  if (!email) {
    return res.status(400).json(createResponse(false, "Email is required"));
  }
  try {
    const user = await getUserByEmail(email);
    if (user) {
      return res.status(200).json(createResponse(true, "User found", user));
    }
    return res.status(404).json(createResponse(false, "User not found"));
  } catch (err) {
    return res.status(500).json(createResponse(false, err.message));
  }
}

// Change user password
export async function changeUserPasswordController(req, res) {
  const user_id = Number(req.params.id);
  const { oldPassword, newPassword } = req.body;

  if (!Number.isInteger(user_id) || !oldPassword || !newPassword) {
    return res.status(400).json(createResponse(false, "Invalid input"));
  }

  try {
    // 1. Get user with hashed password
    const user = await getUserById(user_id);
    if (!user || !user.password_hash) {
      return res.status(404).json(createResponse(false, "User not found"));
    }

    // 2. Compare old password using helper
    const isMatch = await verifyPassword(oldPassword, user.password_hash);
    if (!isMatch) {
      return res
        .status(400)
        .json(createResponse(false, "Old password does not match"));
    }

    // 3. Change password
    const updatedUser = await changeUserPassword({ user_id, newPassword });
    if (updatedUser) {
      return res
        .status(200)
        .json(createResponse(true, "Password changed", updatedUser));
    }
    return res.status(404).json(createResponse(false, "User not found"));
  } catch (err) {
    return res.status(500).json(createResponse(false, err.message));
  }
}

// Get user by Google ID
export async function getUserByGoogleIdController(req, res) {
  const { googleId } = req.query;
  if (!googleId) {
    return res.status(400).json(createResponse(false, "Google ID is required"));
  }
  try {
    const user = await getUserbyGoogleId(googleId);
    if (user) {
      return res.status(200).json(createResponse(true, "User found", user));
    }
    return res.status(404).json(createResponse(false, "User not found"));
  } catch (err) {
    return res.status(500).json(createResponse(false, err.message));
  }
}

import { query } from "../config/db.js";
import bcrypt from "bcryptjs";

// 1- create user
export async function createUser(userInfo) {
  try {
    let hashedPassword = null;
    if (userInfo.password) {
      hashedPassword = await bcrypt.hash(
        userInfo.password,
        Number(process.env.BCRYPT_SALT_ROUNDS)
      );
    }
    const result = await query(
      "INSERT INTO users (name, email, password_hash, role, avatar, oauth_provider, oauth_id) VALUES($1, $2, $3, $4, $5, $6, $7) RETURNING *",
      [
        userInfo.name,
        userInfo.email,
        hashedPassword,
        userInfo.role || "student",
        userInfo.avatar || null,
        userInfo.oauth_provider || null,
        userInfo.oauth_id || null,
      ]
    );

    if (result.rows[0]) {
      return result.rows[0];
    }
    return null;
  } catch (err) {
    if (err.code === "23505") {
      throw new Error("User already exists");
    }
    throw err;
  }
}

// 2- update User
export async function updateUser(userInfo) {
  try {
    let hashedPassword = null;
    if (userInfo.password) {
      hashedPassword = await bcrypt.hash(
        userInfo.password,
        Number(process.env.BCRYPT_SALT_ROUNDS)
      );
    }
    const result = await query(
      `UPDATE users 
       SET name = $1, 
           email = $2, 
           password_hash = COALESCE($3, password_hash), 
           role = $4,
           avatar = $5
       WHERE id = $6
       RETURNING *`,
      [
        userInfo.name,
        userInfo.email,
        hashedPassword,
        userInfo.role,
        userInfo.avatar || null,
        userInfo.id,
      ]
    );
    if (result.rows[0]) {
      return result.rows[0];
    }
    return null;
  } catch (err) {
    console.error(err.message);
    throw err;
  }
}

// 3- delete user
export async function deleteUser(id) {
  try {
    if (Number.isInteger(id)) {
      const result = await query("DELETE FROM users WHERE id = $1", [id]);
      if (result.rowCount > 0) {
        return true;
      }
      return false;
    } else {
      throw new Error("Invalid User id");
    }
  } catch (err) {
    console.error(err.message);
    throw err;
  }
}

// 4- get all users (for admin only)
export async function getAllUsers() {
  try {
    const allUsers = await query(
      "SELECT id, email, name, role, is_active, avatar FROM users"
    );
    return allUsers.rows;
  } catch (err) {
    console.error(err.message);
    throw err;
  }
}

// 5- get user by id
export async function getUserById(id) {
  try {
    if (Number.isInteger(id)) {
      const result = await query(
        "SELECT id, email, name, role, is_active, avatar, password_hash FROM users WHERE id = $1",
        [id]
      );
      if (!result.rows[0]) {
        return null;
      }
      return result.rows[0];
    } else {
      throw new Error("Invalid User id");
    }
  } catch (err) {
    console.error(err.message);
    throw err;
  }
}

// 6- get user by email
export async function getUserByEmail(email) {
  try {
    const result = await query(
      "SELECT id, email, name, role, is_active, avatar, password_hash FROM users WHERE email = $1",
      [email]
    );
    return result.rows[0] || null;
  } catch (err) {
    console.error(err.message);
    throw err;
  }
}

// 7- change user password
export async function changeUserPassword({ user_id, newPassword }) {
  try {
    const hashedPassword = await bcrypt.hash(
      newPassword,
      Number(process.env.BCRYPT_SALT_ROUNDS)
    );
    const result = await query(
      `UPDATE users SET password_hash = $1 WHERE id = $2 RETURNING *`,
      [hashedPassword, user_id]
    );
    return result.rows[0] || null;
  } catch (err) {
    console.error(err.message);
    throw err;
  }
}

// 8- get user by Google OAuth id
export async function getUserbyGoogleId(id) {
  try {
    const googleId = await query(
      "SELECT id, email, oauth_id, name, role, avatar FROM users WHERE oauth_id = $1",
      [id]
    );
    if (!googleId.rows[0]) {
      return null;
    }
    return googleId.rows[0];
  } catch (err) {
    console.error(err.message);
    throw err;
  }
}

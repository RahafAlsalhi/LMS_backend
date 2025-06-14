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
      "INSERT INTO users (name, email, password_hash, role, avatar_url, oauth_provider, oauth_id) VALUES($1, $2, $3, $4, $5, $6, $7) RETURNING *",
      [
        userInfo.name,
        userInfo.email,
        hashedPassword,
        userInfo.role || "student",
        userInfo.avatar_url || null,
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
SET name = COALESCE($1, name),
    email = COALESCE($2, email),
    password_hash = COALESCE($3, password_hash),
    role = $4,
    avatar_url = COALESCE($5, avatar_url),
    updated_at = NOW()
WHERE id = $6
RETURNING *`,
      [
        userInfo.name,
        userInfo.email,
        hashedPassword,
        userInfo.role,
        userInfo.avatar_url || null,
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

// 4- get all users (for admin only) - FIXED: Added missing id field
export async function getAllUsers() {
  try {
    const allUsers = await query(
      "SELECT id, email, name, role, is_active, avatar_url, created_at FROM users ORDER BY created_at DESC"
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
        "SELECT id, email, name, role, is_active, avatar_url, password_hash, created_at FROM users WHERE id = $1",
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
      "SELECT id, email, name, role, is_active, avatar_url, password_hash, created_at FROM users WHERE email = $1",
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
    const result = await query(
      "SELECT id, email, oauth_id, name, role, avatar_url, is_active FROM users WHERE oauth_id = $1",
      [id]
    );
    return result.rows[0] || null;
  } catch (err) {
    console.error("Get user by Google ID error:", err.message);
    throw err;
  }
}

// FIXED: Toggle user status function
export async function toggleUserStatus(id, isActive) {
  try {
    if (!Number.isInteger(id)) {
      throw new Error("Invalid User id");
    }
    const result = await query(
      `UPDATE users 
       SET is_active = $1,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $2 
       RETURNING id, email, name, role, is_active, avatar_url, created_at`,
      [isActive, id]
    );
    return result.rows[0] || null;
  } catch (err) {
    console.error(err);
    throw err;
  }
}

// Get all users with additional info for admin
export async function getAllUsersAdmin() {
  try {
    const result = await query(
      `SELECT 
        u.id,
        u.email,
        u.name,
        u.role,
        u.is_active,
        u.avatar_url,
        u.created_at,
        u.oauth_provider,
        COUNT(DISTINCT e.course_id) as enrolled_courses,
        COUNT(DISTINCT c.id) as created_courses
      FROM users u
      LEFT JOIN enrollments e ON u.id = e.user_id
      LEFT JOIN courses c ON u.id = c.instructor_id AND u.role = 'instructor'
      GROUP BY u.id
      ORDER BY u.created_at DESC`
    );
    return result.rows;
  } catch (err) {
    console.error(err);
    throw err;
  }
}

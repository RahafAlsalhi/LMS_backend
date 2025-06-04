import { query } from "../config/db.js";

// Create category
export async function createCategory(name) {
  try {
    const result = await query(
      `INSERT INTO categories (name) VALUES ($1) RETURNING *`,
      [name]
    );
    if (result.rows[0]) {
      return result.rows[0];
    }
    return null;
  } catch (err) {
    console.error(err);
    throw err;
  }
}

// Update category
export async function updateCategory({ id, name }) {
  try {
    const result = await query(
      `UPDATE categories SET name = $1 WHERE id = $2 RETURNING *`,
      [name, id]
    );
    if (result.rows[0]) {
      return result.rows[0];
    }
    return null;
  } catch (err) {
    console.error(err);
    throw err;
  }
}

// Delete category
export async function deleteCategory(id) {
  try {
    if (Number.isInteger(id)) {
      const result = await query(`DELETE FROM categories WHERE id = $1`, [id]);
      return result.rowCount > 0;
    } else {
      throw new Error("Invalid Category Id");
    }
  } catch (err) {
    console.error(err);
    throw err;
  }
}

// Get all categories
export async function getAllCategories() {
  try {
    const result = await query(
      `SELECT * FROM categories ORDER BY created_at DESC`
    );
    return result.rows;
  } catch (err) {
    console.error(err);
    throw err;
  }
}

// Get category by id
export async function getCategoryById(id) {
  try {
    if (Number.isInteger(id)) {
      const result = await query(`SELECT * FROM categories WHERE id = $1`, [
        id,
      ]);
      if (result.rows.length !== 0) {
        return result.rows[0];
      }
      return null;
    } else {
      throw new Error("Invalid Category Id");
    }
  } catch (err) {
    console.error(err);
    throw err;
  }
}

import { query } from "../config/db.js";

// Create module
export async function createModule(moduleInfo) {
  try {
    const newModule = await query(
      `INSERT INTO modules 
        (course_id, title, description, "order")
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [
        moduleInfo.course_id,
        moduleInfo.title,
        moduleInfo.description,
        moduleInfo.order,
      ]
    );
    if (newModule.rows[0]) {
      return newModule.rows[0];
    }
    return null;
  } catch (err) {
    console.error(err);
    throw err;
  }
}

// Update module
export async function updateModule(moduleInfo) {
  try {
    const updatedModule = await query(
      `UPDATE modules
         SET course_id = $1,
             title = $2,
             description = $3,
             "order" = $4,
             updated_at = CURRENT_TIMESTAMP
         WHERE id = $5
         RETURNING *`,
      [
        moduleInfo.course_id,
        moduleInfo.title,
        moduleInfo.description,
        moduleInfo.order,
        moduleInfo.id,
      ]
    );
    if (updatedModule.rows[0]) {
      return updatedModule.rows[0];
    }
    return null;
  } catch (err) {
    console.error(err);
    throw err;
  }
}

// Delete module
export async function deleteModule(id) {
  try {
    if (Number.isInteger(id)) {
      const deletedModules = await query("DELETE FROM modules WHERE id = $1", [
        id,
      ]);
      if (deletedModules.rowCount === 0) {
        return false;
      }
      return true;
    } else {
      throw new Error("Invalid Module Id");
    }
  } catch (err) {
    console.error(err);
    throw err;
  }
}

// Get all modules for a course
export async function getModulesByCourse(course_id) {
  try {
    if (Number.isInteger(course_id)) {
      const allModules = await query(
        `SELECT * FROM modules WHERE course_id = $1 ORDER BY "order" ASC`,
        [course_id]
      );
      return allModules.rows;
    } else {
      throw new Error("Invalid course id");
    }
  } catch (err) {
    console.error(err);
    throw err;
  }
}

// Get module by id
export async function getModuleById(id) {
  try {
    if (Number.isInteger(id)) {
      const result = await query("SELECT * FROM modules WHERE id = $1", [id]);
      if (result.rows.length !== 0) {
        return result.rows[0];
      }
      return null;
    } else {
      throw new Error("Invalid Module Id");
    }
  } catch (err) {
    console.error(err);
    throw err;
  }
}

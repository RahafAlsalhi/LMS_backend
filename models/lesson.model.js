import { query } from "../config/db.js";

// Create lesson
export async function createLesson(lessonInfo) {
  try {
    const result = await query(
      `INSERT INTO lessons 
        (module_id, title, content_type, content_url, duration, "order", is_free)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [
        lessonInfo.module_id,
        lessonInfo.title,
        lessonInfo.content_type,
        lessonInfo.content_url,
        lessonInfo.duration || 0,
        lessonInfo.order,
        lessonInfo.is_free || false,
      ]
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

// Update lesson
export async function updateLesson(lessonInfo) {
  if (!Number.isInteger(lessonInfo.id)) {
    throw new Error("Invalid id");
  }
  try {
    const result = await query(
      `UPDATE lessons
         SET module_id = $1,
             title = $2,
             content_type = $3,
             content_url = $4,
             duration = $5,
             "order" = $6,
             is_free = $7,
             updated_at = CURRENT_TIMESTAMP
         WHERE id = $8
         RETURNING *`,
      [
        lessonInfo.module_id,
        lessonInfo.title,
        lessonInfo.content_type,
        lessonInfo.content_url,
        lessonInfo.duration || 0,
        lessonInfo.order,
        lessonInfo.is_free || false,
        lessonInfo.id,
      ]
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

// Delete lesson
export async function deleteLesson(id) {
  if (!Number.isInteger(id)) {
    throw new Error("Invalid Lesson Id");
  }
  try {
    const result = await query("DELETE FROM lessons WHERE id = $1", [id]);
    return result.rowCount > 0;
  } catch (err) {
    console.error(err);
    throw err;
  }
}

// Get all lessons for a module
export async function getLessonsByModule(module_id) {
  if (!Number.isInteger(module_id)) {
    throw new Error("Invalid module Id");
  }
  try {
    const result = await query(
      `SELECT * FROM lessons WHERE module_id = $1 ORDER BY "order" ASC`,
      [module_id]
    );
    return result.rows;
  } catch (err) {
    console.error(err);
    throw err;
  }
}

// Get lesson by id
export async function getLessonById(id) {
  if (!Number.isInteger(id)) {
    throw new Error("Invalid Lesson Id");
  }
  try {
    const result = await query("SELECT * FROM lessons WHERE id = $1", [id]);
    if (result.rows.length !== 0) {
      return result.rows[0];
    }
    return null;
  } catch (err) {
    console.error(err);
    throw err;
  }
}

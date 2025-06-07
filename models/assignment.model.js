import { query } from "../config/db.js";

// Create assignment
export async function createAssignment(assignmentInfo) {
  try {
    const result = await query(
      `INSERT INTO assignments 
        (lesson_id, title, description, deadline, max_score)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [
        assignmentInfo.lesson_id,
        assignmentInfo.title,
        assignmentInfo.description,
        assignmentInfo.deadline,
        assignmentInfo.max_score || 100,
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

// Update assignment
export async function updateAssignment(assignmentInfo) {
  if (!Number.isInteger(assignmentInfo.id)) {
    throw new Error("Invalid assignment ID");
  }
  try {
    const result = await query(
      `UPDATE assignments
         SET lesson_id = $1,
             title = $2,
             description = $3,
             deadline = $4,
             max_score = $5,
             updated_at = CURRENT_TIMESTAMP
         WHERE id = $6
         RETURNING *`,
      [
        assignmentInfo.lesson_id,
        assignmentInfo.title,
        assignmentInfo.description,
        assignmentInfo.deadline,
        assignmentInfo.max_score || 100,
        assignmentInfo.id,
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

// Delete assignment
export async function deleteAssignment(id) {
  if (!Number.isInteger(id)) {
    throw new Error("Invalid Assignment Id");
  }
  try {
    const result = await query("DELETE FROM assignments WHERE id = $1", [id]);
    return result.rowCount > 0;
  } catch (err) {
    console.error(err);
    throw err;
  }
}

// Get all assignments for a lesson
export async function getAssignmentsByLesson(lesson_id) {
  if (!Number.isInteger(lesson_id)) {
    throw new Error("Invalid lesson ID");
  }
  try {
    const result = await query(
      `SELECT * FROM assignments WHERE lesson_id = $1 ORDER BY created_at ASC`,
      [lesson_id]
    );
    return result.rows;
  } catch (err) {
    console.error(err);
    throw err;
  }
}

// Get assignment by id
export async function getAssignmentById(id) {
  if (!Number.isInteger(id)) {
    throw new Error("Invalid Assignment Id");
  }
  try {
    const result = await query("SELECT * FROM assignments WHERE id = $1", [id]);
    return result.rows[0];
  } catch (err) {
    console.error(err);
    throw err;
  }
}

// Get all assignments (admin)
export async function getAllAssignments() {
  try {
    const result = await query(
      `SELECT a.*, l.title AS lesson_title, c.title AS course_title
       FROM assignments a
       JOIN lessons l ON a.lesson_id = l.id
       JOIN modules m ON l.module_id = m.id
       JOIN courses c ON m.course_id = c.id
       ORDER BY a.created_at ASC`
    );
    return result.rows;
  } catch (err) {
    console.error(err);
    throw err;
  }
}

import { query } from "../config/db.js";

// Create quiz
export async function createQuiz(quizInfo) {
  try {
    const result = await query(
      `INSERT INTO quizzes 
        (lesson_id, question, options, correct_answer, max_score)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [
        quizInfo.lesson_id,
        quizInfo.question,
        JSON.stringify(quizInfo.options),
        quizInfo.correct_answer,
        quizInfo.max_score || 10,
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

// Update quiz
export async function updateQuiz(quizInfo) {
  if (!Number.isInteger(quizInfo.id)) {
    throw new Error("Invalid quiz ID");
  }
  try {
    const result = await query(
      `UPDATE quizzes
         SET lesson_id = $1,
             question = $2,
             options = $3,
             correct_answer = $4,
             max_score = $5,
             updated_at = CURRENT_TIMESTAMP
         WHERE id = $6
         RETURNING *`,
      [
        quizInfo.lesson_id,
        quizInfo.question,
        JSON.stringify(quizInfo.options), // Store options as JSON instead of jsonb
        quizInfo.correct_answer,
        quizInfo.max_score || 10,
        quizInfo.id,
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

// Delete quiz
export async function deleteQuiz(id) {
  try {
    if (Number.isInteger(id)) {
      const result = await query("DELETE FROM quizzes WHERE id = $1", [id]);
      return result.rowCount > 0;
    } else {
      throw new Error("Invalid Quiz Id");
    }
  } catch (err) {
    console.error(err);
    throw err;
  }
}

// Get all quizzes for a lesson
export async function getQuizzesByLesson(lesson_id) {
  if (!Number.isInteger(lesson_id)) {
    throw new Error("Invalid lesson ID");
  }
  try {
    const result = await query(
      `SELECT * FROM quizzes WHERE lesson_id = $1 ORDER BY created_at ASC`,
      [lesson_id]
    );
    return result.rows;
  } catch (err) {
    console.error(err);
    throw err;
  }
}

// Get quiz by id
export async function getQuizById(id) {
  try {
    if (Number.isInteger(id)) {
      const result = await query("SELECT * FROM quizzes WHERE id = $1", [id]);
      if (result.rows.length !== 0) {
        return result.rows[0];
      }
      return null;
    } else {
      throw new Error("Invalid Quiz Id");
    }
  } catch (err) {
    console.error(err);
    throw err;
  }
}

// Get all quizzes for a user
export async function getQuizzesByUser(user_id) {
  try {
    const result = await query(
      `SELECT q.*
       FROM quizzes q
       JOIN lessons l ON q.lesson_id = l.id
       JOIN modules m ON l.module_id = m.id
       JOIN courses c ON m.course_id = c.id
       JOIN enrollments e ON e.course_id = c.id
       WHERE e.user_id = $1
       ORDER BY q.created_at ASC`,
      [user_id]
    );
    return result.rows;
  } catch (err) {
    console.error(err);
    throw err;
  }
}

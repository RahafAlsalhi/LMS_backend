import { query } from "../config/db.js";

// Create submission
export async function createSubmission(submissionInfo) {
  try {
    const result = await query(
      `INSERT INTO submissions 
        (assignment_id, user_id, submission_url, grade, feedback)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [
        submissionInfo.assignment_id,
        submissionInfo.user_id,
        submissionInfo.submission_url,
        submissionInfo.grade || null,
        submissionInfo.feedback || null,
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

// Update submission (grade/feedback)
export async function updateSubmission(submissionInfo) {
  if (!Number.isInteger(submissionInfo.id)) {
    throw new Error("Invalid submission ID");
  }
  try {
    const result = await query(
      `UPDATE submissions
         SET grade = $1,
             feedback = $2,
             updated_at = CURRENT_TIMESTAMP
         WHERE id = $3
         RETURNING *`,
      [submissionInfo.grade, submissionInfo.feedback, submissionInfo.id]
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

// Delete submission
export async function deleteSubmission(id) {
  if (!Number.isInteger(id)) {
    throw new Error("Invalid submission ID");
  }
  try {
    if (Number.isInteger(id)) {
      const result = await query("DELETE FROM submissions WHERE id = $1", [id]);
      return result.rowCount > 0;
    } else {
      throw new Error("Invalid Submission Id");
    }
  } catch (err) {
    console.error(err);
    throw err;
  }
}

// Get all submissions for an assignment
export async function getSubmissionsByAssignment(assignment_id) {
  try {
    const result = await query(
      `SELECT * FROM submissions WHERE assignment_id = $1 ORDER BY submitted_at ASC`,
      [assignment_id]
    );
    return result.rows;
  } catch (err) {
    console.error(err);
    throw err;
  }
}

// Get all submissions by a user
export async function getSubmissionsByUser(user_id) {
  try {
    const result = await query(
      `SELECT * FROM submissions WHERE user_id = $1 ORDER BY submitted_at ASC`,
      [user_id]
    );
    return result.rows;
  } catch (err) {
    console.error(err);
    throw err;
  }
}

// Get submission by id
export async function getSubmissionById(id) {
  try {
    if (Number.isInteger(id)) {
      const result = await query("SELECT * FROM submissions WHERE id = $1", [
        id,
      ]);
      if (result.rows.length !== 0) {
        return result.rows[0];
      }
      return null;
    } else {
      throw new Error("Invalid Submission Id");
    }
  } catch (err) {
    console.error(err);
    throw err;
  }
}

// Get all submissions for a user in a specific assignment
export async function getSubmissionsByUserAndAssignment(
  user_id,
  assignment_id
) {
  try {
    const result = await query(
      `SELECT * FROM submissions WHERE user_id = $1 AND assignment_id = $2 ORDER BY submitted_at ASC`,
      [user_id, assignment_id]
    );
    return result.rows;
  } catch (err) {
    console.error(err);
    throw err;
  }
}

// Get all submissions by a user for assignments in courses taught by this instructor
export async function getUserSubmissionsForInstructor(user_id, instructor_id) {
  try {
    const result = await query(
      `SELECT s.*, a.title AS assignment_title, c.title AS course_title, l.title AS lesson_title
       FROM submissions s
       JOIN assignments a ON s.assignment_id = a.id
       JOIN lessons l ON a.lesson_id = l.id
       JOIN modules m ON l.module_id = m.id
       JOIN courses c ON m.course_id = c.id
       WHERE s.user_id = $1 AND c.instructor_id = $2
       ORDER BY s.submitted_at DESC`,
      [user_id, instructor_id]
    );
    return result.rows;
  } catch (err) {
    console.error(err);
    throw err;
  }
}

// Get all submissions for an assignment from all users , used join because  want user details with each submission.
export async function getAllSubmissionsForAssignment(assignment_id) {
  if (!Number.isInteger(assignment_id)) {
    throw new Error("Invalid assignment ID");
  }
  try {
    const result = await query(
      `SELECT s.*, u.name AS user_name, u.email AS user_email
       FROM submissions s
       JOIN users u ON s.user_id = u.id
       WHERE s.assignment_id = $1
       ORDER BY s.submitted_at ASC`,
      [assignment_id]
    );
    return result.rows;
  } catch (err) {
    console.error(err);
    throw err;
  }
}

import { query } from "../config/db.js";

//courses:
export async function createCourse(courseInfo) {
  try {
    console.log("Creating course in database with data:", courseInfo);

    // Prepare arrays for JSON fields
    const learning_objectives = Array.isArray(courseInfo.learning_objectives)
      ? JSON.stringify(courseInfo.learning_objectives)
      : JSON.stringify([]);

    const prerequisites = Array.isArray(courseInfo.prerequisites)
      ? JSON.stringify(courseInfo.prerequisites)
      : JSON.stringify([]);

    const tags = Array.isArray(courseInfo.tags)
      ? JSON.stringify(courseInfo.tags)
      : JSON.stringify([]);

    const result = await query(
      `INSERT INTO courses 
       (title, description, thumbnail_url, instructor_id, category_id, 
        difficulty_level, duration, price, preview_video_url, 
        learning_objectives, prerequisites, target_audience, 
        language, tags, is_approved, is_published, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP) 
       RETURNING *`,
      [
        courseInfo.title,
        courseInfo.description,
        courseInfo.thumbnail_url || null,
        courseInfo.instructor_id,
        courseInfo.category_id,
        courseInfo.difficulty_level || "beginner",
        courseInfo.duration || 0,
        courseInfo.price || 0,
        courseInfo.preview_video_url || null,
        learning_objectives,
        prerequisites,
        courseInfo.target_audience || null,
        courseInfo.language || "English",
        tags,
        courseInfo.is_approved || false,
        courseInfo.is_published || false,
      ]
    );

    console.log("Course created successfully:", result.rows[0]);
    return result.rows[0] || null;
  } catch (err) {
    console.error("Error in createCourse model:", err);
    throw err;
  }
}

export async function updateCourse(courseInfo) {
  try {
    const updatedCourse = await query(
      `UPDATE courses
       SET title = $1,
            description=$2,
            thumbnail_url=$3,
            category_id=$4,
            updated_at = CURRENT_TIMESTAMP
            where id = $5
            RETURNING *`,
      [
        courseInfo.title,
        courseInfo.description,
        courseInfo.thumbnail_url,
        courseInfo.category_id,
        courseInfo.id,
      ]
    );
    if (updatedCourse.rows[0]) {
      return updatedCourse.rows[0];
    }
    return null;
  } catch (err) {
    console.error(err);
    throw err;
  }
}

export async function deleteCourse(id) {
  if (!Number.isInteger(id)) {
    throw new Error("Invalid Course Id");
  }
  try {
    const result = await query("DELETE FROM courses WHERE id = $1", [id]);
    return result.rowCount > 0;
  } catch (err) {
    console.error(err);
    throw err;
  }
}

export async function getAllCourses() {
  try {
    const allCourses = await query(
      `SELECT c.*, u.name as instructor_name, cat.name as category_name
       FROM courses c
       LEFT JOIN users u ON c.instructor_id = u.id
       LEFT JOIN categories cat ON c.category_id = cat.id
       WHERE c.is_published = TRUE
       ORDER BY c.created_at DESC`
    );
    return allCourses.rows;
  } catch (err) {
    console.error(err);
    throw err;
  }
}

export async function getCourseById(id) {
  if (!Number.isInteger(id)) {
    throw new Error("Invalid Course Id");
  }
  try {
    const course = await query(
      `SELECT c.*, u.name as instructor_name, cat.name as category_name
       FROM courses c
       LEFT JOIN users u ON c.instructor_id = u.id
       LEFT JOIN categories cat ON c.category_id = cat.id
       WHERE c.id = $1`,
      [id]
    );
    return course.rows[0];
  } catch (err) {
    console.error(err);
    throw err;
  }
}

export async function searchCourses(keyword) {
  try {
    const result = await query(
      `SELECT c.*, u.name as instructor_name, cat.name as category_name
       FROM courses c
       LEFT JOIN users u ON c.instructor_id = u.id
       LEFT JOIN categories cat ON c.category_id = cat.id
       WHERE LOWER(c.title) LIKE $1 
       AND c.is_published = TRUE
       ORDER BY c.created_at DESC`,
      [`%${keyword.toLowerCase()}%`]
    );
    return result.rows;
  } catch (err) {
    console.error(err);
    throw err;
  }
}

export async function getPendingCourses() {
  try {
    console.log("🔍 Fetching pending courses...");

    const result = await query(
      `SELECT 
        c.*, 
        u.name as instructor_name, 
        cat.name as category_name
      FROM courses c
      JOIN users u ON c.instructor_id = u.id
      LEFT JOIN categories cat ON c.category_id = cat.id
      WHERE c.is_approved = FALSE
      ORDER BY c.created_at DESC`
    );

    console.log("🔍 Found pending courses:", result.rowCount);
    console.log(
      "🔍 Courses returned:",
      result.rows.map((c) => ({
        id: c.id,
        title: c.title.substring(0, 30),
        is_approved: c.is_approved,
      }))
    );

    return result.rows;
  } catch (err) {
    console.error("❌ Error fetching pending courses:", err);
    throw err;
  }
}

export async function approveCourse(id) {
  if (!Number.isInteger(id)) {
    throw new Error("Invalid Course Id");
  }
  try {
    console.log("🔍 Approving course ID:", id);

    const beforeUpdate = await query(
      "SELECT id, title, is_approved FROM courses WHERE id = $1",
      [id]
    );
    console.log("🔍 Before approval:", beforeUpdate.rows[0]);

    const result = await query(
      `UPDATE courses 
       SET is_approved = TRUE, 
           is_published = TRUE,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $1 
       RETURNING *`,
      [id]
    );

    console.log("🔍 After approval:", {
      id: result.rows[0]?.id,
      title: result.rows[0]?.title,
      is_approved: result.rows[0]?.is_approved,
      is_published: result.rows[0]?.is_published,
    });

    return result.rows[0] || null;
  } catch (err) {
    console.error("❌ Error in approveCourse:", err);
    throw err;
  }
}

export async function rejectCourse(id) {
  if (!Number.isInteger(id)) {
    throw new Error("Invalid Course Id");
  }
  try {
    console.log("🔍 Rejecting course ID:", id);

    const result = await query(
      `UPDATE courses 
       SET is_approved = FALSE,
           is_published = FALSE,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $1 
       RETURNING *`,
      [id]
    );

    console.log("🔍 After rejection:", {
      id: result.rows[0]?.id,
      title: result.rows[0]?.title,
      is_approved: result.rows[0]?.is_approved,
      is_published: result.rows[0]?.is_published,
    });

    return result.rows[0] || null;
  } catch (err) {
    console.error("❌ Error in rejectCourse:", err);
    throw err;
  }
}

export async function getAllCoursesAdmin() {
  try {
    const result = await query(
      `SELECT 
        c.*,
        u.name as instructor_name,
        cat.name as category_name,
        COUNT(DISTINCT e.user_id) as enrollment_count
      FROM courses c
      JOIN users u ON c.instructor_id = u.id
      LEFT JOIN categories cat ON c.category_id = cat.id
      LEFT JOIN enrollments e ON c.id = e.course_id
      GROUP BY c.id, u.name, cat.name
      ORDER BY c.created_at DESC`
    );
    return result.rows;
  } catch (err) {
    console.error(err);
    throw err;
  }
}

export async function debugCourseStatuses() {
  try {
    const allCourses = await query(
      `SELECT id, title, is_approved, is_published 
       FROM courses 
       ORDER BY id`
    );

    console.log("🔍 ALL COURSES IN DATABASE:");
    allCourses.rows.forEach((course) => {
      console.log(
        `ID: ${course.id}, Title: ${course.title}, Approved: ${course.is_approved}, Published: ${course.is_published}`
      );
    });

    const pendingCount = allCourses.rows.filter(
      (c) => c.is_approved === false
    ).length;
    const approvedCount = allCourses.rows.filter(
      (c) => c.is_approved === true
    ).length;
    const nullCount = allCourses.rows.filter(
      (c) => c.is_approved === null
    ).length;

    console.log("🔍 SUMMARY:");
    console.log(`- Pending (false): ${pendingCount}`);
    console.log(`- Approved (true): ${approvedCount}`);
    console.log(`- Null: ${nullCount}`);

    return {
      all: allCourses.rows,
      pending: pendingCount,
      approved: approvedCount,
      null: nullCount,
    };
  } catch (err) {
    console.error("❌ Debug error:", err);
    throw err;
  }
}

import { query } from "../config/db.js";

//courses:
export async function createCourse(courseInfo) {
  try {
    const result = await query(
      `INSERT INTO courses 
       (title, description, thumbnail_url, instructor_id, category_id)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [
        courseInfo.title,
        courseInfo.description,
        courseInfo.thumbnail_url,
        courseInfo.instructor_id,
        courseInfo.category_id,
      ]
    );

    return result.rows[0] || null;
  } catch (err) {
    console.error(err);
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
            category_id=$4
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

//delete course:
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

//get all courses
export async function getAllCourses() {
  try {
    const allCourses = await query(
      "SELECT * FROM courses  ORDER BY created_at DESC"
    );
    return allCourses.rows;
  } catch (err) {
    console.error(err);
    throw err;
  }
}

//get course by Id
export async function getCourseById(id) {
  if (!Number.isInteger(id)) {
    throw new Error("Invalid Course Id");
  }
  try {
    const course = await query("SELECT * FROM courses where id = $1", [id]);
    return course.rows[0];
  } catch (err) {
    console.error(err);
    throw err;
  }
}

//search
export async function searchCourses(keyword) {
  try {
    const result = await query(
      `
    SELECT * FROM courses where lower(title) LIKE $1
  `,
      [`%${keyword.toLowerCase()}%`]
    );
    return result.rows;
  } catch (err) {
    console.error(err);
    throw err;
  }
}

import { query } from "../config/db.js";

//user enroll course
export async function enrollCourse({ user_id, course_id }) {
  try {
    if (Number.isInteger(user_id) && Number.isInteger(course_id)) {
      const isEnroller = await query(
        "Select * From enrollments WHERE user_id = $1 and course_id = $2",
        [user_id, course_id]
      );
      if (!isEnroller.rows[0]) {
        const enrolled = await query(
          "INSERT INTO enrollments (user_id, course_id, progress)VALUES($1, $2, $3) RETURNING * ",
          [user_id, course_id, 0]
        );
        return enrolled.rows[0];
      }
      return false;
    }
    return null;
  } catch (err) {
    console.error(err);
    throw err;
  }
}

//User unenroll course
export async function unenrollCourse({ user_id, course_id }) {
  try {
    if (Number.isInteger(user_id) && Number.isInteger(course_id)) {
      const isEnroller = await query(
        "SELECT * FROM enrollments WHERE user_id = $1 and course_id = $2",
        [user_id, course_id]
      );
      if (!isEnroller.rows[0]) {
        return false; //cant delete anything, not existed
      }
      await query(
        "DELETE FROM enrollments WHERE user_id = $1 AND course_id = $2",
        [user_id, course_id]
      );
      return true; //deleted
    }
    return null;
  } catch (err) {
    console.error(err);
    throw err;
  }
}

//get user enrollments
export async function getUserEnrollments(user_id) {
  try {
    if (Number.isInteger(user_id)) {
      const userCourses = await query(
        `SELECT courses.* 
          FROM courses 
          JOIN enrollments ON enrollments.course_id = courses.id
          WHERE enrollments.user_id = $1`,
        [user_id]
      );
      return userCourses.rows;
    }
    return [];
  } catch (err) {
    console.error(err);
    throw err;
  }
}

//search course
export async function isUserEnrolled({ user_id, course_id }) {
  try {
    if (Number.isInteger(user_id) && Number.isInteger(course_id)) {
      const userCourse = await query(
        `SELECT enrollments.*
          FROM enrollments 
          WHERE user_id = $1 AND course_id = $2`,
        [user_id, course_id]
      );
      return userCourse.rows.length > 0;
    }
    return false;
  } catch (err) {
    console.error(err);
    throw err;
  }
}

//for admin
export async function getAllEnrollments() {
  try {
    const allEnrollments = query("SELECT * FROM enrollments");
    return (await allEnrollments).rows;
  } catch (err) {
    console.error(err);
    throw err;
  }
}

// Get All Users Enrolled in a Course
export async function getCourseEnrollments(course_id) {
  try {
    if (Number.isInteger(course_id)) {
      const allEnrollments = await query(
        `SELECT users.* FROM users
      JOIN enrollments on enrollments.user_id = users.id
      WHERE enrollments.course_id = $1 `,
        [course_id]
      );
      return allEnrollments.rows;
    }
    return [];
  } catch (err) {
    console.error(err);
    throw err;
  }
}

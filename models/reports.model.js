import { query } from "../config/db.js";

// User activity report
export async function getUserActivityReport() {
  try {
    const result = await query(`
      SELECT 
        COUNT(*) FILTER (WHERE role = 'student') as total_students,
        COUNT(*) FILTER (WHERE role = 'instructor') as total_instructors,
        COUNT(*) FILTER (WHERE role = 'admin') as total_admins,
        COUNT(*) FILTER (WHERE is_active = true) as active_users,
        COUNT(*) FILTER (WHERE is_active = false) as inactive_users,
        COUNT(*) FILTER (WHERE created_at >= CURRENT_DATE - INTERVAL '30 days') as new_users_last_30_days,
        COUNT(*) FILTER (WHERE created_at >= CURRENT_DATE - INTERVAL '7 days') as new_users_last_7_days
      FROM users
    `);
    return result.rows[0];
  } catch (err) {
    console.error(err);
    throw err;
  }
}

// Course popularity report
export async function getCoursePopularityReport() {
  try {
    const result = await query(`
      SELECT 
        c.id,
        c.title,
        u.name as instructor_name,
        cat.name as category_name,
        COUNT(DISTINCT e.user_id) as enrollment_count,
        c.is_approved,
        c.is_published
      FROM courses c
      JOIN users u ON c.instructor_id = u.id
      LEFT JOIN categories cat ON c.category_id = cat.id
      LEFT JOIN enrollments e ON c.id = e.course_id
      GROUP BY c.id, u.name, cat.name
      ORDER BY enrollment_count DESC
      LIMIT 20
    `);
    return result.rows;
  } catch (err) {
    console.error(err);
    throw err;
  }
}

// Enrollment statistics
export async function getEnrollmentStats() {
  try {
    const result = await query(`
      SELECT 
        COUNT(*) as total_enrollments,
        COUNT(DISTINCT user_id) as unique_students,
        COUNT(DISTINCT course_id) as courses_with_enrollments,
        DATE_TRUNC('month', enrolled_at) as month,
        COUNT(*) as monthly_enrollments
      FROM enrollments
      WHERE enrolled_at >= CURRENT_DATE - INTERVAL '12 months'
      GROUP BY DATE_TRUNC('month', enrolled_at)
      ORDER BY month DESC
    `);
    return result.rows;
  } catch (err) {
    console.error(err);
    throw err;
  }
}

// Category statistics
export async function getCategoryStats() {
  try {
    const result = await query(`
      SELECT 
        cat.id,
        cat.name,
        COUNT(DISTINCT c.id) as course_count,
        COUNT(DISTINCT e.user_id) as student_count,
        COUNT(DISTINCT c.id) FILTER (WHERE c.is_approved = true) as approved_courses,
        COUNT(DISTINCT c.id) FILTER (WHERE c.is_approved = false) as pending_courses
      FROM categories cat
      LEFT JOIN courses c ON cat.id = c.category_id
      LEFT JOIN enrollments e ON c.id = e.course_id
      GROUP BY cat.id, cat.name
      ORDER BY course_count DESC
    `);
    return result.rows;
  } catch (err) {
    console.error(err);
    throw err;
  }
}

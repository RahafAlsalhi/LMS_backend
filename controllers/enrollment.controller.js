import * as EnrollmentModel from "../models/enrollment.model.js";
import { createResponse } from "../utils/helper.js";

// Enroll user in a course
export async function enrollCourse(req, res) {
  const user_id = Number(req.params.user_id);
  const course_id = Number(req.params.course_id);
  if (!Number.isInteger(user_id) || !Number.isInteger(course_id)) {
    return res
      .status(400)
      .json(createResponse(false, "Invalid user ID or course ID"));
  }
  try {
    const result = await EnrollmentModel.enrollCourse({ user_id, course_id });
    if (result) {
      return res
        .status(201)
        .json(createResponse(true, "User enrolled successfully"));
    } else {
      return res
        .status(409)
        .json(createResponse(false, "User already enrolled"));
    }
  } catch (err) {
    return res
      .status(500)
      .json(createResponse(false, "Server error", null, err.message));
  }
}

// Unenroll user from a course
export async function unenrollCourse(req, res) {
  const user_id = Number(req.params.user_id);
  const course_id = Number(req.params.course_id);
  if (!Number.isInteger(user_id) || !Number.isInteger(course_id)) {
    return res
      .status(400)
      .json(createResponse(false, "Invalid user ID or course ID"));
  }
  try {
    const result = await EnrollmentModel.unenrollCourse({ user_id, course_id });
    if (result) {
      return res
        .status(200)
        .json(createResponse(true, "Unenrolled successfully"));
    } else {
      return res
        .status(404)
        .json(
          createResponse(
            false,
            "User not enrolled",
            null,
            "Enrollment not found"
          )
        );
    }
  } catch (err) {
    return res
      .status(500)
      .json(createResponse(false, "Server error", null, err.message));
  }
}

// Get all courses a user is enrolled in
export async function getUserEnrollments(req, res) {
  const user_id = Number(req.params.user_id);
  if (!Number.isInteger(user_id)) {
    return res.status(400).json(createResponse(false, "Invalid user ID"));
  }
  try {
    const courses = await EnrollmentModel.getUserEnrollments(user_id);
    return res
      .status(200)
      .json(createResponse(true, "User enrollments fetched", courses));
  } catch (err) {
    return res
      .status(500)
      .json(createResponse(false, "Server error", null, err.message));
  }
}

// Check if user is enrolled in a course
export async function isUserEnrolled(req, res) {
  const user_id = Number(req.params.user_id);
  const course_id = Number(req.params.course_id);
  if (!Number.isInteger(user_id) || !Number.isInteger(course_id)) {
    return res
      .status(400)
      .json(createResponse(false, "Invalid user ID or course ID"));
  }
  try {
    const enrolled = await EnrollmentModel.isUserEnrolled({
      user_id,
      course_id,
    });
    return res
      .status(200)
      .json(createResponse(true, "Enrollment status fetched", { enrolled }));
  } catch (err) {
    return res
      .status(500)
      .json(createResponse(false, "Server error", null, err.message));
  }
}

// Get all enrollments (admin)
export async function getAllEnrollments(req, res) {
  try {
    const enrollments = await EnrollmentModel.getAllEnrollments();
    return res
      .status(200)
      .json(createResponse(true, "All enrollments fetched", enrollments));
  } catch (err) {
    return res
      .status(500)
      .json(createResponse(false, "Server error", null, err.message));
  }
}

// Get all users enrolled in a course
export async function getCourseEnrollments(req, res) {
  const course_id = Number(req.params.course_id);
  if (!Number.isInteger(course_id)) {
    return res.status(400).json(createResponse(false, "Invalid course ID"));
  }
  try {
    const users = await EnrollmentModel.getCourseEnrollments(course_id);
    return res
      .status(200)
      .json(createResponse(true, "Course enrollments fetched", users));
  } catch (err) {
    return res
      .status(500)
      .json(createResponse(false, "Server error", null, err.message));
  }
}

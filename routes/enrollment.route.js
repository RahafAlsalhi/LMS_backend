import express from "express";
import * as enrollmentController from "../controllers/enrollment.controller.js";
import { authenticateJWT } from "../middleware/auth.js";
import {
  requireAdmin,
  requireInstructorOrAdmin,
} from "../middleware/authorize.js";

const router = express.Router();

// Enroll user in a course (self or admin)
router.post(
  "/user/:user_id/course/:course_id",
  authenticateJWT,
  enrollmentController.enrollCourse
);

// Unenroll user from a course (self or admin)
router.delete(
  "/user/:user_id/course/:course_id",
  authenticateJWT,
  enrollmentController.unenrollCourse
);

// Get all courses a user is enrolled in (self or admin)
router.get(
  "/user/:user_id",
  authenticateJWT,
  enrollmentController.getUserEnrollments
);

// Check if user is enrolled in a course (self or admin)
router.get(
  "/user/:user_id/course/:course_id",
  authenticateJWT,
  enrollmentController.isUserEnrolled
);

// Get all enrollments (admin only)
router.get(
  "/get",
  authenticateJWT,
  requireAdmin,
  enrollmentController.getAllEnrollments
);

// Get all users enrolled in a course (instructor or admin)
router.get(
  "/get/:id",
  authenticateJWT,
  requireInstructorOrAdmin,
  enrollmentController.getCourseEnrollments
);

export default router;

import express from "express";
import { CourseSchema } from "../validation/course.Schema.js";
import { validateBody } from "../middleware/validateBody.js";
import { validateQuery } from "../middleware/validateQuery.js";
import { authenticateJWT } from "../middleware/auth.js";
import { CourseSearchSchema } from "../validation/search.Schema.js";
import {
  requireInstructorOrAdmin,
  requireAdmin,
} from "../middleware/authorize.js";
import * as courseController from "../controllers/course.controller.js";
const router = express.Router();
// Create a new course (instructor or admin only)
router.post(
  "/create",
  authenticateJWT,
  requireInstructorOrAdmin,
  validateBody(CourseSchema),
  courseController.createCourse
);

// Update a course (instructor or admin only)
router.put(
  "/edit/:id",
  authenticateJWT,
  requireInstructorOrAdmin,
  validateBody(CourseSchema),
  courseController.updateCourse
);

// Delete a course (instructor or admin only)
router.delete(
  "/delete/:id",
  authenticateJWT,
  requireInstructorOrAdmin,
  courseController.deleteCourse
);

// Get all courses (public)
router.get("/get", courseController.getAllCourses);

// Search courses (public)
router.get(
  "/search",
  validateQuery(CourseSearchSchema),
  courseController.searchCourses
);

// Get course by ID (public)
router.get("/get/:id", courseController.getCourseById);

// Admin routes
router.get(
  "/pending",
  authenticateJWT,
  requireAdmin,
  courseController.getPendingCourses
);

router.patch(
  "/:id/approve",
  authenticateJWT,
  requireAdmin,
  courseController.approveCourse
);

router.patch(
  "/:id/reject",
  authenticateJWT,
  requireAdmin,
  courseController.rejectCourse
);

router.get(
  "/admin/all",
  authenticateJWT,
  requireAdmin,
  courseController.getAllCoursesAdmin
);

export default router;

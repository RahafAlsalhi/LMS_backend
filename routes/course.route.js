import express from "express";
import { CourseSchema } from "../validation/course.Schema.js";
import { validateBody } from "../middleware/validateBody.js";
import { validateQuery } from "../middleware/validateQuery.js";
import { authenticateJWT } from "../middleware/auth.js";
import { CourseSearchSchema } from "../validation/search.Schema.js";
import { requireRole } from "../middleware/role.js";
import * as courseController from "../controllers/course.controller.js";
const router = express.Router();

// Create a new course (protected)
router.post(
  "/create",
  authenticateJWT,
  requireRole("instructor", "admin"),
  validateBody(CourseSchema),
  courseController.createCourse
);

// Update a course (protected)
router.put(
  "/edit/:id",
  authenticateJWT,
  requireRole("instructor", "admin"),
  validateBody(CourseSchema),
  courseController.updateCourse
);

// Delete a course (protected)
router.delete(
  "/delete/:id",
  authenticateJWT,
  // requireRole("instructor", "admin"),
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

export default router;

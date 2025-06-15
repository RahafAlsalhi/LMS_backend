import express from "express";
import {
  CourseSchema,
  CreateCourseSchema,
} from "../validation/course.Schema.js";
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

router.post(
  "/create",
  authenticateJWT,
  requireInstructorOrAdmin,
  validateBody(CreateCourseSchema),
  courseController.createCourse
);

router.put(
  "/edit/:id",
  authenticateJWT,
  requireInstructorOrAdmin,
  validateBody(CourseSchema),
  courseController.updateCourse
);

router.delete(
  "/delete/:id",
  authenticateJWT,
  requireInstructorOrAdmin,
  courseController.deleteCourse
);

router.get("/get", courseController.getAllCourses);

router.get(
  "/search",
  validateQuery(CourseSearchSchema),
  courseController.searchCourses
);

router.get("/get/:id", courseController.getCourseById);

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

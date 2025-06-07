import express from "express";
import * as lessonController from "../controllers/lesson.controller.js";
import { authenticateJWT } from "../middleware/auth.js";
import { requireRole } from "../middleware/role.js";

const router = express.Router();

// Create lesson (admin/instructor only)
router.post(
  "/create",
  authenticateJWT,
  requireRole("admin", "instructor"),
  lessonController.createLesson
);

// Update lesson (admin/instructor only)
router.put(
  "/update/:id",
  authenticateJWT,
  requireRole("admin", "instructor"),
  lessonController.updateLesson
);

// Delete lesson (admin/instructor only)
router.delete(
  "/delete/:id",
  authenticateJWT,
  requireRole("admin", "instructor"),
  lessonController.deleteLesson
);

// Get all lessons for a module (public)
router.get("/module/:module_id", lessonController.getLessonsByModule);

// Get lesson by ID (public)
router.get("/:id", lessonController.getLessonById);

export default router;

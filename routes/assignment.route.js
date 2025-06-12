import express from "express";
import * as assignmentController from "../controllers/assignment.controller.js";
import { authenticateJWT } from "../middleware/auth.js";
import {
  requireAdmin,
  requireInstructorOrAdmin,
} from "../middleware/authorize.js";
import { validateBody } from "../middleware/validateBody.js";
import { assignmentSchema } from "../validation/assignment.Schema.js";

const router = express.Router();

// Create assignment (admin/instructor only)
router.post(
  "/create",
  authenticateJWT,
  requireInstructorOrAdmin,
  validateBody(assignmentSchema),
  assignmentController.createAssignment
);

// Update assignment (admin/instructor only)
router.put(
  "/edit/:id",
  authenticateJWT,
  requireInstructorOrAdmin,
  validateBody(assignmentSchema),
  assignmentController.updateAssignment
);

// Delete assignment (admin/instructor only)
router.delete(
  "/delete/:id",
  authenticateJWT,
  requireInstructorOrAdmin,
  assignmentController.deleteAssignment
);

// Get all assignments by lesson (public)
router.get("/lesson/:lesson_id", assignmentController.getAssignmentsByLesson);

// Get assignment by ID (public)
router.get("/get/:id", assignmentController.getAssignmentById);

// Get all assignments (admin only)
router.get(
  "/get-all",
  authenticateJWT,
  requireAdmin,
  assignmentController.getAllAssignments
);

export default router;

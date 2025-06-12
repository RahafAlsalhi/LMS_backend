import express from "express";
import * as submissionController from "../controllers/submission.controller.js";
import { authenticateJWT } from "../middleware/auth.js";
import {
  requireStudent,
  requireInstructor,
  requireInstructorOrAdmin,
} from "../middleware/authorize.js";
import { validateBody } from "../middleware/validateBody.js";
import { submissionSchema } from "../validation/submission.Schema.js";

const router = express.Router();

// Create submission (students only)
router.post(
  "/create",
  authenticateJWT,
  requireStudent,
  validateBody(submissionSchema),
  submissionController.createSubmission
);

// Update submission (students only)
router.put(
  "/edit/:id",
  authenticateJWT,
  requireStudent,
  validateBody(submissionSchema),
  submissionController.updateSubmission
);

// Delete submission (students only)
router.delete(
  "/delete/:id",
  authenticateJWT,
  requireStudent,
  submissionController.deleteSubmission
);

// Get submission by ID (protected)
router.get("/:id", authenticateJWT, submissionController.getSubmissionById);

// Get all submissions for an assignment (instructor/admin only)
router.get(
  "/assignment/:assignment_id",
  authenticateJWT,
  requireInstructorOrAdmin,
  submissionController.getSubmissionsByAssignment
);

// Get all submissions by a user (instructor/admin only)
router.get(
  "/user/:user_id",
  authenticateJWT,
  requireInstructorOrAdmin,
  submissionController.getSubmissionsByUser
);

// Get submissions by user and assignment (instructor/admin only)
router.get(
  "/user/:user_id/assignment/:assignment_id",
  authenticateJWT,
  requireInstructorOrAdmin,
  submissionController.getSubmissionsByUserAndAssignment
);

// Get all submissions from one user for an instructor (instructor only)
router.get(
  "/user/:user_id/instructor/:instructor_id",
  authenticateJWT,
  requireInstructor,
  submissionController.getUserSubmissionsForInstructor
);

// Get all submissions with user details for a specific assignment (instructor/admin only)
router.get(
  "/assignment/:assignment_id/all",
  authenticateJWT,
  requireInstructorOrAdmin,
  submissionController.getAllSubmissionsForAssignment
);

export default router;

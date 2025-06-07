import express from "express";
import * as submissionController from "../controllers/submission.controller.js";
import { authenticateJWT } from "../middleware/auth.js";
import { requireRole } from "../middleware/role.js";
import { validateBody } from "../middleware/validateBody.js";
import { submissionSchema } from "../validation/submission.Schema.js";

const router = express.Router();

// Create submission (students only)
router.post(
  "/create",
  authenticateJWT,
  requireRole("student"),
  validateBody(submissionSchema),
  submissionController.createSubmission
);

// Update submission (students only)
router.put(
  "/edit/:id",
  authenticateJWT,
  requireRole("student"),
  validateBody(submissionSchema),
  submissionController.updateSubmission
);

// Delete submission (students only)
router.delete(
  "/delete/:id",
  authenticateJWT,
  requireRole("student"),
  submissionController.deleteSubmission
);

// Get submission by ID (protected)
router.get("/:id", authenticateJWT, submissionController.getSubmissionById);

// Get all submissions for an assignment (instructor/admin only)
router.get(
  "/assignment/:assignment_id",
  authenticateJWT,
  requireRole("admin", "instructor"),
  submissionController.getSubmissionsByAssignment
);

// Get all submissions by a user (instructor/admin only)
router.get(
  "/user/:user_id",
  authenticateJWT,
  requireRole("admin", "instructor"),
  submissionController.getSubmissionsByUser
);

// Get submissions by user and assignment (instructor/admin only)
router.get(
  "/user/:user_id/assignment/:assignment_id",
  authenticateJWT,
  requireRole("admin", "instructor"),
  submissionController.getSubmissionsByUserAndAssignment
);

// Get all submissions from one user for an instructor (instructor only)
router.get(
  "/user/:user_id/instructor/:instructor_id",
  authenticateJWT,
  requireRole("instructor"),
  submissionController.getUserSubmissionsForInstructor
);

// Get all submissions with user details for a specific assignment (instructor/admin only)
router.get(
  "/assignment/:assignment_id/all",
  authenticateJWT,
  requireRole("admin", "instructor"),
  submissionController.getAllSubmissionsForAssignment
);

export default router;

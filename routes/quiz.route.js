import express from "express";
import * as quizController from "../controllers/quiz.controller.js";
import { authenticateJWT } from "../middleware/auth.js";
import { requireRole } from "../middleware/role.js";
import { validateBody } from "../middleware/validateBody.js";
import { quizSchema } from "../validation/quiz.Schema.js";

const router = express.Router();

// Create quiz (admin/instructor only)
router.post(
  "/create",
  authenticateJWT,
    requireRole("admin", "instructor"),
  validateBody(quizSchema),
  quizController.createQuiz
);

// Update quiz (admin/instructor only)
router.put(
  "/update/:id",
  authenticateJWT,
 requireRole("admin", "instructor"),
  validateBody(quizSchema),
  quizController.updateQuiz
);

// Delete quiz (admin/instructor only)
router.delete(
  "/delete/:id",
  authenticateJWT,
  requireRole("admin", "instructor"),
  quizController.deleteQuiz
);

// Get all quizzes by lesson (public)
router.get("/lesson/:lesson_id", quizController.getQuizzesByLesson);

// Get quiz by ID (public)
router.get("/get/:id", quizController.getQuizById);

// Get all quizzes accessible by a user (protected)
router.get("/user/:user_id", authenticateJWT, quizController.getQuizzesByUser);

export default router;

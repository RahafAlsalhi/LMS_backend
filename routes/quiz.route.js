import express from "express";
import * as quizController from "../controllers/quiz.controller.js";
import { authenticateJWT } from "../middleware/auth.js";
import { requireInstructorOrAdmin } from "../middleware/authorize.js";
import { validateBody } from "../middleware/validateBody.js";
import { quizSchema } from "../validation/quiz.Schema.js";

const router = express.Router();

// Create quiz (admin/instructor only)
router.post(
  "/create",
  authenticateJWT,
  requireInstructorOrAdmin,
  validateBody(quizSchema),
  quizController.createQuiz
);

// Update quiz (admin/instructor only)
router.put(
  "/update/:id",
  authenticateJWT,
  requireInstructorOrAdmin,
  validateBody(quizSchema),
  quizController.updateQuiz
);

// Delete quiz (admin/instructor only)
router.delete(
  "/delete/:id",
  authenticateJWT,
  requireInstructorOrAdmin,
  quizController.deleteQuiz
);

// Get all quizzes by lesson (public)
router.get("/lesson/:lesson_id", quizController.getQuizzesByLesson);

// Get quiz by ID (public)
router.get("/get/:id", quizController.getQuizById);

// Get all quizzes accessible by a user (protected)
router.get("/user/:user_id", authenticateJWT, quizController.getQuizzesByUser);

export default router;

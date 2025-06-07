import * as QuizModel from "../models/quiz.model.js";
import { createResponse } from "../utils/helper.js";

// Create quiz
export async function createQuiz(req, res) {
  try {
    const quiz = await QuizModel.createQuiz(req.body);
    if (quiz) {
      return res
        .status(201)
        .json(createResponse(true, "Quiz created successfully", quiz));
    }
    return res.status(400).json(createResponse(false, "Quiz not created"));
  } catch (err) {
    return res
      .status(500)
      .json(createResponse(false, "Server error", null, err.message));
  }
}

// Update quiz
export async function updateQuiz(req, res) {
  const id = Number(req.params.id);
  if (!Number.isInteger(id)) {
    return res.status(400).json(createResponse(false, "Invalid quiz ID"));
  }

  try {
    const updatedQuiz = await QuizModel.updateQuiz({ ...req.body, id });
    if (updatedQuiz) {
      return res
        .status(200)
        .json(createResponse(true, "Quiz updated successfully", updatedQuiz));
    }
    return res.status(404).json(createResponse(false, "Quiz not found"));
  } catch (err) {
    return res
      .status(500)
      .json(createResponse(false, "Server error", null, err.message));
  }
}

// Delete quiz
export async function deleteQuiz(req, res) {
  const id = Number(req.params.id);
  if (!Number.isInteger(id)) {
    return res.status(400).json(createResponse(false, "Invalid quiz ID"));
  }

  try {
    const deleted = await QuizModel.deleteQuiz(id);
    if (deleted) {
      return res
        .status(200)
        .json(createResponse(true, "Quiz deleted successfully"));
    }
    return res.status(404).json(createResponse(false, "Quiz not found"));
  } catch (err) {
    return res
      .status(500)
      .json(createResponse(false, "Server error", null, err.message));
  }
}

// Get all quizzes by lesson
export async function getQuizzesByLesson(req, res) {
  const lesson_id = Number(req.params.lesson_id);
  if (!Number.isInteger(lesson_id)) {
    return res.status(400).json(createResponse(false, "Invalid lesson ID"));
  }

  try {
    const quizzes = await QuizModel.getQuizzesByLesson(lesson_id);
    return res
      .status(200)
      .json(createResponse(true, "Quizzes fetched successfully", quizzes));
  } catch (err) {
    return res
      .status(500)
      .json(createResponse(false, "Server error", null, err.message));
  }
}

// Get quiz by ID
export async function getQuizById(req, res) {
  const id = Number(req.params.id);
  if (!Number.isInteger(id)) {
    return res.status(400).json(createResponse(false, "Invalid quiz ID"));
  }

  try {
    const quiz = await QuizModel.getQuizById(id);
    if (quiz) {
      return res.status(200).json(createResponse(true, "Quiz found", quiz));
    }
    return res.status(404).json(createResponse(false, "Quiz not found"));
  } catch (err) {
    return res
      .status(500)
      .json(createResponse(false, "Server error", null, err.message));
  }
}

// Get all quizzes accessible by a user (via enrollments)
export async function getQuizzesByUser(req, res) {
  const user_id = Number(req.params.user_id);
  if (!Number.isInteger(user_id)) {
    return res.status(400).json(createResponse(false, "Invalid user ID"));
  }

  try {
    const quizzes = await QuizModel.getQuizzesByUser(user_id);
    return res
      .status(200)
      .json(createResponse(true, "User's quizzes fetched", quizzes));
  } catch (err) {
    return res
      .status(500)
      .json(createResponse(false, "Server error", null, err.message));
  }
}

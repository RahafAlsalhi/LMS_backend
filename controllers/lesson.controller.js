import * as LessonModel from "../models/lesson.model.js";
import { createResponse } from "../utils/helper.js";

// Create lesson
export async function createLesson(req, res) {
  try {
    const lesson = await LessonModel.createLesson(req.body);
    if (lesson) {
      return res
        .status(201)
        .json(createResponse(true, "Lesson created successfully", lesson));
    }
    return res.status(400).json(createResponse(false, "Lesson not created"));
  } catch (err) {
    return res
      .status(500)
      .json(createResponse(false, "Server error", null, err.message));
  }
}

// Update lesson
export async function updateLesson(req, res) {
  const id = Number(req.params.id);
  if (!Number.isInteger(id)) {
    return res.status(400).json(createResponse(false, "Invalid lesson ID"));
  }
  try {
    const lesson = await LessonModel.updateLesson({ ...req.body, id });
    if (lesson) {
      return res
        .status(200)
        .json(createResponse(true, "Lesson updated successfully", lesson));
    }
    return res.status(404).json(createResponse(false, "Lesson not found"));
  } catch (err) {
    return res
      .status(500)
      .json(createResponse(false, "Server error", null, err.message));
  }
}

// Delete lesson
export async function deleteLesson(req, res) {
  const id = Number(req.params.id);
  if (!Number.isInteger(id)) {
    return res.status(400).json(createResponse(false, "Invalid lesson ID"));
  }
  try {
    const deleted = await LessonModel.deleteLesson(id);
    if (deleted) {
      return res
        .status(200)
        .json(createResponse(true, "Lesson deleted successfully"));
    }
    return res.status(404).json(createResponse(false, "Lesson not found"));
  } catch (err) {
    return res
      .status(500)
      .json(createResponse(false, "Server error", null, err.message));
  }
}

// Get all lessons for a module
export async function getLessonsByModule(req, res) {
  const module_id = Number(req.params.module_id);
  if (!Number.isInteger(module_id)) {
    return res.status(400).json(createResponse(false, "Invalid module ID"));
  }
  try {
    const lessons = await LessonModel.getLessonsByModule(module_id);
    return res
      .status(200)
      .json(createResponse(true, "Lessons fetched successfully", lessons));
  } catch (err) {
    return res
      .status(500)
      .json(createResponse(false, "Server error", null, err.message));
  }
}

// Get lesson by ID
export async function getLessonById(req, res) {
  const id = Number(req.params.id);
  if (!Number.isInteger(id)) {
    return res.status(400).json(createResponse(false, "Invalid lesson ID"));
  }
  try {
    const lesson = await LessonModel.getLessonById(id);
    if (lesson) {
      return res
        .status(200)
        .json(createResponse(true, "Lesson fetched successfully", lesson));
    }
    return res.status(404).json(createResponse(false, "Lesson not found"));
  } catch (err) {
    return res
      .status(500)
      .json(createResponse(false, "Server error", null, err.message));
  }
}

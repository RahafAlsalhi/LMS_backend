import * as AssignmentModel from "../models/assignment.model.js";
import { createResponse } from "../utils/helper.js";

// Create assignment
export async function createAssignment(req, res) {
  try {
    const assignment = await AssignmentModel.createAssignment(req.body);
    if (assignment) {
      return res
        .status(201)
        .json(
          createResponse(true, "Assignment created successfully", assignment)
        );
    }
    return res
      .status(400)
      .json(createResponse(false, "Assignment not created"));
  } catch (err) {
    return res
      .status(500)
      .json(createResponse(false, "Server error", null, err.message));
  }
}

// Update assignment
export async function updateAssignment(req, res) {
  const id = Number(req.params.id);
  if (!Number.isInteger(id)) {
    return res.status(400).json(createResponse(false, "Invalid assignment ID"));
  }

  try {
    const updated = await AssignmentModel.updateAssignment({ ...req.body, id });
    if (updated) {
      return res
        .status(200)
        .json(createResponse(true, "Assignment updated successfully", updated));
    }
    return res.status(404).json(createResponse(false, "Assignment not found"));
  } catch (err) {
    return res
      .status(500)
      .json(createResponse(false, "Server error", null, err.message));
  }
}

// Delete assignment
export async function deleteAssignment(req, res) {
  const id = Number(req.params.id);
  if (!Number.isInteger(id)) {
    return res.status(400).json(createResponse(false, "Invalid assignment ID"));
  }

  try {
    const deleted = await AssignmentModel.deleteAssignment(id);
    if (deleted) {
      return res
        .status(200)
        .json(createResponse(true, "Assignment deleted successfully"));
    }
    return res.status(404).json(createResponse(false, "Assignment not found"));
  } catch (err) {
    return res
      .status(500)
      .json(createResponse(false, "Server error", null, err.message));
  }
}

// Get all assignments by lesson
export async function getAssignmentsByLesson(req, res) {
  const lesson_id = Number(req.params.lesson_id);
  if (!Number.isInteger(lesson_id)) {
    return res.status(400).json(createResponse(false, "Invalid lesson ID"));
  }

  try {
    const assignments = await AssignmentModel.getAssignmentsByLesson(lesson_id);
    return res
      .status(200)
      .json(createResponse(true, "Assignments fetched", assignments));
  } catch (err) {
    return res
      .status(500)
      .json(createResponse(false, "Server error", null, err.message));
  }
}

// Get assignment by ID
export async function getAssignmentById(req, res) {
  const id = Number(req.params.id);
  if (!Number.isInteger(id)) {
    return res.status(400).json(createResponse(false, "Invalid assignment ID"));
  }

  try {
    const assignment = await AssignmentModel.getAssignmentById(id);
    if (assignment) {
      return res
        .status(200)
        .json(createResponse(true, "Assignment found", assignment));
    }
    return res.status(404).json(createResponse(false, "Assignment not found"));
  } catch (err) {
    return res
      .status(500)
      .json(createResponse(false, "Server error", null, err.message));
  }
}

// Get all assignments (admin)
export async function getAllAssignments(req, res) {
  try {
    const assignments = await AssignmentModel.getAllAssignments();
    return res
      .status(200)
      .json(createResponse(true, "All assignments fetched", assignments));
  } catch (err) {
    return res
      .status(500)
      .json(createResponse(false, "Server error", null, err.message));
  }
}

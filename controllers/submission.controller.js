import * as SubmissionModel from "../models/submission.model.js";
import { createResponse } from "../utils/createResponse.js";

// Create submission
export async function createSubmission(req, res) {
  try {
    const submission = await SubmissionModel.createSubmission(req.body);
    if (submission) {
      return res
        .status(201)
        .json(
          createResponse(true, "Submission created successfully", submission)
        );
    }
    return res
      .status(400)
      .json(createResponse(false, "Submission not created"));
  } catch (err) {
    return res
      .status(500)
      .json(createResponse(false, "Server error", null, err.message));
  }
}

// Update submission
export async function updateSubmission(req, res) {
  const id = Number(req.params.id);
  if (!Number.isInteger(id)) {
    return res.status(400).json(createResponse(false, "Invalid submission ID"));
  }
  try {
    const submission = await SubmissionModel.updateSubmission({
      ...req.body,
      id,
    });
    if (submission) {
      return res
        .status(200)
        .json(
          createResponse(true, "Submission updated successfully", submission)
        );
    }
    return res.status(404).json(createResponse(false, "Submission not found"));
  } catch (err) {
    return res
      .status(500)
      .json(createResponse(false, "Server error", null, err.message));
  }
}

// Delete submission
export async function deleteSubmission(req, res) {
  const id = Number(req.params.id);
  if (!Number.isInteger(id)) {
    return res.status(400).json(createResponse(false, "Invalid submission ID"));
  }
  try {
    const deleted = await SubmissionModel.deleteSubmission(id);
    if (deleted) {
      return res
        .status(200)
        .json(createResponse(true, "Submission deleted successfully"));
    }
    return res.status(404).json(createResponse(false, "Submission not found"));
  } catch (err) {
    return res
      .status(500)
      .json(createResponse(false, "Server error", null, err.message));
  }
}

// Get submission by ID
export async function getSubmissionById(req, res) {
  const id = Number(req.params.id);
  if (!Number.isInteger(id)) {
    return res.status(400).json(createResponse(false, "Invalid submission ID"));
  }
  try {
    const submission = await SubmissionModel.getSubmissionById(id);
    if (submission) {
      return res
        .status(200)
        .json(createResponse(true, "Submission found", submission));
    }
    return res.status(404).json(createResponse(false, "Submission not found"));
  } catch (err) {
    return res
      .status(500)
      .json(createResponse(false, "Server error", null, err.message));
  }
}

// Get all submissions for an assignment
export async function getSubmissionsByAssignment(req, res) {
  const assignment_id = Number(req.params.assignment_id);
  if (!Number.isInteger(assignment_id)) {
    return res.status(400).json(createResponse(false, "Invalid assignment ID"));
  }
  try {
    const submissions = await SubmissionModel.getSubmissionsByAssignment(
      assignment_id
    );
    return res
      .status(200)
      .json(createResponse(true, "Submissions fetched", submissions));
  } catch (err) {
    return res
      .status(500)
      .json(createResponse(false, "Server error", null, err.message));
  }
}

// Get all submissions by a user
export async function getSubmissionsByUser(req, res) {
  const user_id = Number(req.params.user_id);
  if (!Number.isInteger(user_id)) {
    return res.status(400).json(createResponse(false, "Invalid user ID"));
  }
  try {
    const submissions = await SubmissionModel.getSubmissionsByUser(user_id);
    return res
      .status(200)
      .json(createResponse(true, "Submissions fetched", submissions));
  } catch (err) {
    return res
      .status(500)
      .json(createResponse(false, "Server error", null, err.message));
  }
}

// Get submissions by user and assignment
export async function getSubmissionsByUserAndAssignment(req, res) {
  const user_id = Number(req.params.user_id);
  const assignment_id = Number(req.params.assignment_id);
  if (!Number.isInteger(user_id) || !Number.isInteger(assignment_id)) {
    return res
      .status(400)
      .json(createResponse(false, "Invalid user or assignment ID"));
  }
  try {
    const submissions = await SubmissionModel.getSubmissionsByUserAndAssignment(
      user_id,
      assignment_id
    );
    return res
      .status(200)
      .json(createResponse(true, "Submissions fetched", submissions));
  } catch (err) {
    return res
      .status(500)
      .json(createResponse(false, "Server error", null, err.message));
  }
}

// Get all submissions from one user for an instructor
export async function getUserSubmissionsForInstructor(req, res) {
  const user_id = Number(req.params.user_id);
  const instructor_id = Number(req.params.instructor_id);
  if (!Number.isInteger(user_id) || !Number.isInteger(instructor_id)) {
    return res
      .status(400)
      .json(createResponse(false, "Invalid user or instructor ID"));
  }
  try {
    const submissions = await SubmissionModel.getUserSubmissionsForInstructor(
      user_id,
      instructor_id
    );
    return res
      .status(200)
      .json(createResponse(true, "Submissions fetched", submissions));
  } catch (err) {
    return res
      .status(500)
      .json(createResponse(false, "Server error", null, err.message));
  }
}

// Get all submissions with user details for a specific assignment
export async function getAllSubmissionsForAssignment(req, res) {
  const assignment_id = Number(req.params.assignment_id);
  if (!Number.isInteger(assignment_id)) {
    return res.status(400).json(createResponse(false, "Invalid assignment ID"));
  }
  try {
    const submissions = await SubmissionModel.getAllSubmissionsForAssignment(
      assignment_id
    );
    return res
      .status(200)
      .json(createResponse(true, "Submissions fetched", submissions));
  } catch (err) {
    return res
      .status(500)
      .json(createResponse(false, "Server error", null, err.message));
  }
}

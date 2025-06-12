import * as CourseModel from "../models/course.model.js";
import { createResponse } from "../utils/helper.js";

// Create a new course
export async function createCourse(req, res) {
  try {
    const course = await CourseModel.createCourse(req.body);
    if (course) {
      return res
        .status(201)
        .json(createResponse(true, "Course created successfully", course));
    } else {
      return res.status(400).json(createResponse(false, "Course not created"));
    }
  } catch (err) {
    return res
      .status(500)
      .json(createResponse(false, "Server error", null, err.message));
  }
}

// Update a course
export async function updateCourse(req, res) {
  const id = Number(req.params.id);
  if (!Number.isInteger(id)) {
    return res.status(400).json(createResponse(false, " Invalid course ID."));
  }
  try {
    const course = await CourseModel.updateCourse({
      ...req.body,
      id,
    });
    if (course) {
      return res
        .status(200)
        .json(createResponse(true, "Course updated successfully", course));
    } else {
      return res.status(404).json(createResponse(false, "Course not found"));
    }
  } catch (err) {
    return res
      .status(500)
      .json(createResponse(false, "Server error", null, err.message));
  }
}

// Delete a course
export async function deleteCourse(req, res) {
  const id = Number(req.params.id);
  if (!Number.isInteger(id)) {
    return res.status(400).json(createResponse(false, "Invalid course ID"));
  }
  try {
    const deleted = await CourseModel.deleteCourse(id);
    if (deleted) {
      return res
        .status(200)
        .json(createResponse(true, "Course deleted successfully"));
    } else {
      return res.status(404).json(createResponse(false, "Course not found"));
    }
  } catch (err) {
    return res
      .status(500)
      .json(createResponse(false, "Server error", null, err.message));
  }
}

// Get all courses
export async function getAllCourses(req, res) {
  try {
    const courses = await CourseModel.getAllCourses();
    return res
      .status(200)
      .json(createResponse(true, "Courses fetched successfully", courses));
  } catch (err) {
    return res
      .status(500)
      .json(createResponse(false, "Server error", null, err.message));
  }
}

// Get course by ID
export async function getCourseById(req, res) {
  const id = Number(req.params.id);
  if (!Number.isInteger(id)) {
    return res.status(400).json(createResponse(false, " Invalid course ID"));
  }
  try {
    const course = await CourseModel.getCourseById(id);
    if (course) {
      return res
        .status(200)
        .json(createResponse(true, "Course fetched successfully", course));
    } else {
      return res.status(404).json(createResponse(false, "Course not found"));
    }
  } catch (err) {
    return res
      .status(500)
      .json(createResponse(false, "Server error", null, err.message));
  }
}

// Search courses
export async function searchCourses(req, res) {
  try {
    const keyword = req.query.q || "";
    const courses = await CourseModel.searchCourses(keyword);
    if (!courses.length) {
      return res.status(404).json(createResponse(false, "No courses found"));
    }
    return res.status(200).json(createResponse(true, "Courses found", courses));
  } catch (err) {
    return res
      .status(500)
      .json(createResponse(false, "Server error", null, err.message));
  }
}

// Get pending courses
export async function getPendingCourses(req, res) {
  try {
    const courses = await CourseModel.getPendingCourses();
    return res
      .status(200)
      .json(
        createResponse(true, "Pending courses fetched successfully", courses)
      );
  } catch (err) {
    return res
      .status(500)
      .json(createResponse(false, "Server error", null, err.message));
  }
}

// Approve course
export async function approveCourse(req, res) {
  const id = Number(req.params.id);
  if (!Number.isInteger(id)) {
    return res.status(400).json(createResponse(false, "Invalid course ID"));
  }
  try {
    const course = await CourseModel.approveCourse(id);
    if (course) {
      return res
        .status(200)
        .json(createResponse(true, "Course approved successfully", course));
    } else {
      return res.status(404).json(createResponse(false, "Course not found"));
    }
  } catch (err) {
    return res
      .status(500)
      .json(createResponse(false, "Server error", null, err.message));
  }
}

// Reject course
export async function rejectCourse(req, res) {
  const id = Number(req.params.id);
  if (!Number.isInteger(id)) {
    return res.status(400).json(createResponse(false, "Invalid course ID"));
  }
  try {
    const course = await CourseModel.rejectCourse(id);
    if (course) {
      return res
        .status(200)
        .json(createResponse(true, "Course rejected successfully", course));
    } else {
      return res.status(404).json(createResponse(false, "Course not found"));
    }
  } catch (err) {
    return res
      .status(500)
      .json(createResponse(false, "Server error", null, err.message));
  }
}

// Get all courses for admin
export async function getAllCoursesAdmin(req, res) {
  try {
    const courses = await CourseModel.getAllCoursesAdmin();
    return res
      .status(200)
      .json(createResponse(true, "Courses fetched successfully", courses));
  } catch (err) {
    return res
      .status(500)
      .json(createResponse(false, "Server error", null, err.message));
  }
}

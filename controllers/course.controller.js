import * as CourseModel from "../models/course.model.js";
import { createResponse } from "../utils/helper.js";

// Replace your createCourse function in controllers/course.controller.js with this:

export async function createCourse(req, res) {
  try {
    console.log("📚 Create course endpoint hit!");
    console.log("Request body:", req.body);
    console.log("Authenticated user (req.user):", req.user);

    // DEBUG: Check what we actually have in req.user
    console.log("Available user properties:", Object.keys(req.user || {}));
    console.log("User ID variations:", {
      "req.user.id": req.user?.id,
      "req.user.user_id": req.user?.user_id,
      "req.user.userId": req.user?.userId,
      "typeof req.user.id": typeof req.user?.id,
    });

    // FIXED: Better instructor_id extraction with validation
    let instructor_id = null;

    if (req.user?.id) {
      instructor_id = parseInt(req.user.id);
    } else if (req.user?.user_id) {
      instructor_id = parseInt(req.user.user_id);
    } else if (req.user?.userId) {
      instructor_id = parseInt(req.user.userId);
    }

    console.log(
      "Extracted instructor_id:",
      instructor_id,
      "Type:",
      typeof instructor_id
    );

    // Validate instructor_id
    if (!instructor_id || isNaN(instructor_id) || instructor_id <= 0) {
      console.error("❌ Invalid instructor_id:", instructor_id);
      console.error("Full req.user object:", JSON.stringify(req.user, null, 2));

      return res.status(401).json(
        createResponse(
          false,
          "Authentication required - valid instructor ID not found",
          {
            debug: {
              user: req.user,
              extractedId: instructor_id,
              availableProps: Object.keys(req.user || {}),
            },
          }
        )
      );
    }

    // Validate required fields
    const { title, description, category_id } = req.body;
    if (!title || !description || !category_id) {
      return res
        .status(400)
        .json(
          createResponse(false, "Title, description, and category are required")
        );
    }

    // Prepare course data with EXPLICIT type conversion
    const courseData = {
      title: String(title).trim(),
      description: String(description).trim(),
      category_id: parseInt(category_id),
      instructor_id: instructor_id, // This is now guaranteed to be a valid number
      price: req.body.price ? parseFloat(req.body.price) : 0,
      duration: req.body.duration ? parseInt(req.body.duration) : 0,
      level: req.body.level || "Beginner",
      language: req.body.language || "English",
      thumbnail_url: req.body.thumbnail_url || null,
      is_approved: false,
      is_published: false,
    };

    console.log("Final course data to create:", courseData);
    console.log("Data types:", {
      title: typeof courseData.title,
      description: typeof courseData.description,
      category_id: typeof courseData.category_id,
      instructor_id: typeof courseData.instructor_id,
    });

    // Create the course
    const course = await CourseModel.createCourse(courseData);

    if (course) {
      return res
        .status(201)
        .json(
          createResponse(
            true,
            "Course created successfully and is pending approval",
            course
          )
        );
    } else {
      return res
        .status(400)
        .json(createResponse(false, "Failed to create course"));
    }
  } catch (err) {
    console.error("❌ Error in createCourse controller:", err);
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

export async function approveCourse(req, res) {
  try {
    const { id } = req.params;
    console.log("🔍 Approving course ID:", id);
    console.log("🔍 User:", req.user);

    if (!id || isNaN(parseInt(id))) {
      return res.status(400).json(createResponse(false, "Invalid course ID"));
    }

    const courseId = parseInt(id);

    // Check course exists and current status
    const existingCourse = await CourseModel.getCourseById(courseId);
    if (!existingCourse) {
      return res.status(404).json(createResponse(false, "Course not found"));
    }

    console.log("🔍 Course BEFORE approval:", {
      id: existingCourse.id,
      title: existingCourse.title,
      is_approved: existingCourse.is_approved,
      is_published: existingCourse.is_published,
    });

    // Approve the course
    const approvedCourse = await CourseModel.approveCourse(courseId);

    if (!approvedCourse) {
      return res
        .status(500)
        .json(createResponse(false, "Failed to approve course"));
    }

    console.log("🔍 Course AFTER approval:", {
      id: approvedCourse.id,
      title: approvedCourse.title,
      is_approved: approvedCourse.is_approved,
      is_published: approvedCourse.is_published,
    });

    // Double-check by fetching again
    const verifiedCourse = await CourseModel.getCourseById(courseId);
    console.log("🔍 VERIFICATION from DB:", {
      id: verifiedCourse.id,
      is_approved: verifiedCourse.is_approved,
      is_published: verifiedCourse.is_published,
    });

    return res
      .status(200)
      .json(
        createResponse(true, "Course approved successfully", approvedCourse)
      );
  } catch (error) {
    console.error("❌ Error approving course:", error);
    return res
      .status(500)
      .json(createResponse(false, "Server error", null, error.message));
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
// Add this to controllers/course.controller.js
export async function debugUser(req, res) {
  try {
    console.log("🔍 Debug user endpoint hit");
    console.log("Full req.user:", JSON.stringify(req.user, null, 2));

    const extractedId = parseInt(
      req.user?.id || req.user?.user_id || req.user?.userId
    );

    return res.json({
      success: true,
      debug: {
        user: req.user,
        userKeys: Object.keys(req.user || {}),
        extractedId: extractedId,
        isValidId: !isNaN(extractedId) && extractedId > 0,
        message: "Debug info for authentication",
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
}

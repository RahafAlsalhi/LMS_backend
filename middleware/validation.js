import { body, validationResult } from "express-validator";
import { createResponse } from "../utils/helper.js";

// Handle validation errors
export const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res
      .status(400)
      .json(createResponse(false, "Validation failed", null, errors.array()));
  }
  next();
};

// User registration validation
export const validateUserRegistration = [
  body("name")
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage("Name must be between 2 and 100 characters"),
  body("email")
    .isEmail()
    .normalizeEmail()
    .withMessage("Please provide a valid email"),
  body("password")
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters long")
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage(
      "Password must contain at least one uppercase letter, one lowercase letter, and one number"
    ),
  body("role")
    .optional()
    .isIn(["student", "instructor", "admin"])
    .withMessage("Role must be student, instructor, or admin"),
  handleValidationErrors,
];

// User login validation
export const validateUserLogin = [
  body("email")
    .isEmail()
    .normalizeEmail()
    .withMessage("Please provide a valid email"),
  body("password").notEmpty().withMessage("Password is required"),
  handleValidationErrors,
];

// User profile validation
export const validateUserProfile = [
  body("name")
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage("Name must be between 2 and 100 characters"),
  body("email")
    .optional()
    .isEmail()
    .normalizeEmail()
    .withMessage("Please provide a valid email"),
  handleValidationErrors,
];

// Course validation
export const validateCourse = [
  body("title")
    .trim()
    .isLength({ min: 3, max: 255 })
    .withMessage("Course title must be between 3 and 255 characters"),
  body("description")
    .optional()
    .trim()
    .isLength({ max: 2000 })
    .withMessage("Description cannot exceed 2000 characters"),
  body("category_id")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Category ID must be a positive integer"),
  body("duration_hours")
    .optional()
    .isInt({ min: 0 })
    .withMessage("Duration must be a non-negative integer"),
  body("level")
    .optional()
    .isIn(["beginner", "intermediate", "advanced"])
    .withMessage("Level must be beginner, intermediate, or advanced"),
  body("language")
    .optional()
    .isLength({ min: 2, max: 10 })
    .withMessage("Language code must be between 2 and 10 characters"),
  handleValidationErrors,
];

// Module validation
export const validateModule = [
  body("title")
    .trim()
    .isLength({ min: 3, max: 255 })
    .withMessage("Module title must be between 3 and 255 characters"),
  body("description")
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage("Description cannot exceed 1000 characters"),
  body("order")
    .isInt({ min: 1 })
    .withMessage("Order must be a positive integer"),
  handleValidationErrors,
];

// Lesson validation
export const validateLesson = [
  body("title")
    .trim()
    .isLength({ min: 3, max: 255 })
    .withMessage("Lesson title must be between 3 and 255 characters"),
  body("content_type")
    .isIn(["video", "quiz", "text"])
    .withMessage("Content type must be video, quiz, or text"),
  body("content_url")
    .optional()
    .isURL()
    .withMessage("Content URL must be a valid URL"),
  body("duration")
    .optional()
    .isInt({ min: 0 })
    .withMessage("Duration must be a non-negative integer"),
  body("order")
    .isInt({ min: 1 })
    .withMessage("Order must be a positive integer"),
  handleValidationErrors,
];

// Password change validation
export const validatePasswordChange = [
  body("currentPassword")
    .notEmpty()
    .withMessage("Current password is required"),
  body("newPassword")
    .isLength({ min: 8 })
    .withMessage("New password must be at least 8 characters long")
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage(
      "New password must contain at least one uppercase letter, one lowercase letter, and one number"
    ),
  body("confirmPassword").custom((value, { req }) => {
    if (value !== req.body.newPassword) {
      throw new Error("Password confirmation does not match new password");
    }
    return true;
  }),
  handleValidationErrors,
];

// Quiz validation
export const validateQuiz = [
  body("question")
    .trim()
    .isLength({ min: 10, max: 1000 })
    .withMessage("Question must be between 10 and 1000 characters"),
  body("options")
    .isArray({ min: 2, max: 6 })
    .withMessage("Quiz must have between 2 and 6 options"),
  body("correct_answer")
    .trim()
    .notEmpty()
    .withMessage("Correct answer is required"),
  body("max_score")
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage("Max score must be between 1 and 100"),
  handleValidationErrors,
];

// Assignment validation
export const validateAssignment = [
  body("title")
    .trim()
    .isLength({ min: 3, max: 255 })
    .withMessage("Assignment title must be between 3 and 255 characters"),
  body("description")
    .optional()
    .trim()
    .isLength({ max: 2000 })
    .withMessage("Description cannot exceed 2000 characters"),
  body("deadline")
    .optional()
    .isISO8601()
    .withMessage("Deadline must be a valid date"),
  body("max_score")
    .optional()
    .isInt({ min: 1, max: 1000 })
    .withMessage("Max score must be between 1 and 1000"),
  handleValidationErrors,
];

// Category validation
export const validateCategory = [
  body("name")
    .trim()
    .isLength({ min: 2, max: 255 })
    .withMessage("Category name must be between 2 and 255 characters"),
  handleValidationErrors,
];

// Email validation
export const validateEmail = [
  body("email")
    .isEmail()
    .normalizeEmail()
    .withMessage("Please provide a valid email"),
  handleValidationErrors,
];

// ID parameter validation
export const validateId = [
  body("id").isInt({ min: 1 }).withMessage("ID must be a positive integer"),
  handleValidationErrors,
];

export default {
  handleValidationErrors,
  validateUserRegistration,
  validateUserLogin,
  validateUserProfile,
  validateCourse,
  validateModule,
  validateLesson,
  validatePasswordChange,
  validateQuiz,
  validateAssignment,
  validateCategory,
  validateEmail,
  validateId,
};

// validation/user.Schema.js
import Joi from "joi";

// Schema for creating users
export const UserSchema = Joi.object({
  name: Joi.string().min(2).max(100).required().messages({
    "string.empty": "Name cannot be empty",
    "string.min": "Name must be at least 2 characters long",
    "string.max": "Name cannot exceed 100 characters",
    "any.required": "Name is required",
  }),

  email: Joi.string().email().required().messages({
    "string.email": "Please provide a valid email address",
    "string.empty": "Email cannot be empty",
    "any.required": "Email is required",
  }),

  password: Joi.string()
    .min(6)
    .when("oauth_provider", {
      is: Joi.exist(),
      then: Joi.optional(),
      otherwise: Joi.required(),
    })
    .messages({
      "string.min": "Password must be at least 6 characters long",
      "string.empty": "Password cannot be empty",
      "any.required": "Password is required",
    }),

  role: Joi.string()
    .valid("student", "instructor", "admin")
    .default("student")
    .messages({
      "any.only": "Role must be either student, instructor, or admin",
    }),

  avatar_url: Joi.string().uri().allow("", null).optional().messages({
    "string.uri": "Avatar URL must be a valid URL",
  }),

  oauth_provider: Joi.string().valid("google").optional(),
  oauth_id: Joi.string().optional(),
});

// Schema for updating users (no password)
export const UpdateUserSchema = Joi.object({
  name: Joi.string().min(2).max(100).optional().messages({
    "string.empty": "Name cannot be empty",
    "string.min": "Name must be at least 2 characters long",
    "string.max": "Name cannot exceed 100 characters",
  }),

  email: Joi.string().email().optional().messages({
    "string.email": "Please provide a valid email address",
    "string.empty": "Email cannot be empty",
  }),

  role: Joi.string()
    .valid("student", "instructor", "admin")
    .optional()
    .messages({
      "any.only": "Role must be either student, instructor, or admin",
    }),

  avatar_url: Joi.string().uri().allow("", null).optional().messages({
    "string.uri": "Avatar URL must be a valid URL",
  }),
});

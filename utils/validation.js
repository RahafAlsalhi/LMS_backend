import Joi from "joi";
import { createResponse } from "./helpers.js";

export const registerSchema = Joi.object({
  name: Joi.string().min(3).max(30).required(),
  email: Joi.string().email().required(),
  password: Joi.string()
    .min(8)
    .pattern(
      new RegExp("^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])(?=.{8,})")
    )
    .message(
      "Password must contain at least one uppercase, one lowercase, one number and one special character"
    )
    .required(),
});

export const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

export const changePasswordSchema = Joi.object({
  currentPassword: Joi.string().required(),
  newPassword: Joi.string()
    .min(8)
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])(?=.{8,})/)
    .required()
    .invalid(Joi.ref("currentPassword")) // Alternative to disallow
    .messages({
      "string.pattern.base":
        "Password must contain at least one uppercase, one lowercase, one number and one special character",
      "any.invalid": "New password cannot be the same as current password",
    }),
});

// Handle validation errors
export const handleValidationErrors = (schema) => (req, res, next) => {
  const { error, value } = schema.validate(req.body, { abortEarly: false });
  if (error) {
    return res.status(400).json(
      createResponse(
        false,
        "Validation failed",
        null,
        error.details.map((d) => d.message)
      )
    );
  }
  req.body = value;
  next();
};
// Joi schema for user profile validation
export const userProfileSchema = Joi.object({
  name: Joi.string().min(2).max(100).optional(),
  email: Joi.string().email().optional(),
});

// Middleware for user profile validation using Joi
export const validateUserProfile = handleValidationErrors(userProfileSchema);

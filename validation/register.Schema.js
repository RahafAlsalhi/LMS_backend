import Joi from "joi";

export const registerSchema = Joi.object({
  name: Joi.string().min(2).max(50).required().messages({
    "string.min": "Name must be at least 2 characters long",
    "string.max": "Name cannot exceed 50 characters",
    "any.required": "Name is required",
  }),

  email: Joi.string().email().required().messages({
    "string.email": "Please enter a valid email address",
    "any.required": "Email is required",
  }),
  password: Joi.string()
    .pattern(
      new RegExp(
        "^(?=.*[A-Z])(?=.*\\d)(?=.*[!@#$%^&*])[A-Za-z\\d!@#$%^&*]{8,}$"
      )
    )
    .min(8)
    .max(128)
    .required()
    .messages({
      "string.pattern.base":
        "Password must be at least 8 characters long, include at least one uppercase letter, one number, and one special character (!@#$%^&*).",
      "string.min": "Password must be at least 8 characters long",
      "any.required": "Password is required",
    }),
  role: Joi.string()
    .valid("student", "instructor", "admin")
    .default("student")
    .messages({
      "any.only": "Role must be student, instructor, or admin",
    }),
  avatar_url: Joi.string().uri().optional().allow(null, ""),

  oauth_provider: Joi.string().valid("google").optional().allow(null),

  oauth_id: Joi.string().optional().allow(null),
});

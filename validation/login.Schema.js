import Joi from "joi";

export const loginSchema = Joi.object({
  email: Joi.string()
    .email({ tlds: { allow: false } })
    .lowercase()
    .trim()
    .required()
    .messages({
      "string.email": "Please enter a valid email address.",
      "any.required": "Email is required.",
      "string.empty": "Email cannot be empty.",
    }),

  password: Joi.string().min(1).max(128).required().messages({
    "string.min": "Password is required.",
    "string.max": "Password is too long.",
    "any.required": "Password is required.",
    "string.empty": "Password cannot be empty.",
  }),
});

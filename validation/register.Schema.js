import Joi from "joi";

export const registerSchema = Joi.object({
  name: Joi.string()
    .pattern(/^[a-zA-Z0-9\s.,!?()'"-]+$/)
    .min(3)
    .max(255)
    .required()
    .messages({
      "string.min": "Name should be at least 3 characters.",
      "string.max": "Name should be no more than 50 characters.",
      "string.pattern.base": "Name contains invalid characters.",
      "any.required": "Name is required.",
    }),

  email: Joi.string().email().required().messages({
    "string.email": "Email must be a valid email address.",
    "any.required": "Email is required.",
  }),

  password: Joi.string()
    .pattern(
      new RegExp(
        "^(?=.*[A-Z])(?=.*\\d)(?=.*[!@#$%^&*])[A-Za-z\\d!@#$%^&*]{8,}$"
      )
    )
    .required()
    .messages({
      "string.pattern.base":
        "Password must be at least 8 characters long, include at least one uppercase letter, one number, and one special character (!@#$%^&*).",
      "any.required": "Password is required.",
    }),
});

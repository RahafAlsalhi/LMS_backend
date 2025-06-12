import Joi from "joi";

export const ModuleSchema = Joi.object({
  title: Joi.string()
    .pattern(/^[a-zA-Z0-9\s.,!?()'"-]+$/)
    .min(3)
    .max(100)
    .trim()
    .required()
    .messages({
      "string.pattern.base":
        "Title can only contain letters, numbers, and basic punctuation.",
    }),
  description: Joi.string().min(10).max(500).trim().required().messages({
    "string.min": "Description should be at least 10 characters.",
  }),
  order: Joi.number().integer().min(0).required().messages({
    "number.min": "order cannot be negative.",
  }),
  course_id: Joi.number().integer().required(),
  created_at: Joi.date().optional(),
  updated_at: Joi.date().optional(),
});

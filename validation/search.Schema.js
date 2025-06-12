import Joi from "joi";

export const CourseSearchSchema = Joi.object({
  q: Joi.string().trim().min(1).max(100).required().messages({
    "string.min": "Search query must be at least 1 character",
    "string.max": "Search query cannot exceed 100 characters",
  }),
  category_id: Joi.number().integer().optional(),
  level: Joi.string().valid("beginner", "intermediate", "advanced").optional(),
  page: Joi.number().integer().min(1).default(1).optional(),
  limit: Joi.number().integer().min(1).max(50).default(10).optional(),
});

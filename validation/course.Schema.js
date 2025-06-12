import Joi from "joi";

export const CourseSchema = Joi.object({
  title: Joi.string()
    .pattern(/^[a-zA-Z0-9\s.,!?()'"-]+$/)
    .min(3)
    .max(100)
    .trim()
    .required(),

  description: Joi.string().min(10).max(500).trim().required(),

  thumbnail_url: Joi.string().uri().optional().allow(null, ""),

  level: Joi.string().valid("beginner", "intermediate", "advanced").optional(),
  language: Joi.string().min(2).max(10).default("en").optional(),
  duration_hours: Joi.number().min(0).optional(),
  category_id: Joi.number().integer().optional(),

  is_approved: Joi.boolean().default(false),
  is_published: Joi.boolean().default(false),
  instructor_id: Joi.number().integer().required(),
  created_at: Joi.date().default(() => new Date()),
  updated_at: Joi.date().default(() => new Date()),
});

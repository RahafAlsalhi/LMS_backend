import Joi from "joi";

export const assignmentSchema = Joi.object({
  title: Joi.string().min(3).max(100).required().messages({
    "string.base": "Title must be a string.",
    "string.empty": "Title is required.",
    "string.min": "Title must be at least 3 characters.",
    "string.max": "Title must be at most 100 characters.",
    "any.required": "Title is required.",
  }),
  description: Joi.string().min(5).max(1000).required().messages({
    "string.base": "Description must be a string.",
    "string.empty": "Description is required.",
    "string.min": "Description must be at least 5 characters.",
    "string.max": "Description must be at most 1000 characters.",
    "any.required": "Description is required.",
  }),
  deadline: Joi.date().iso().required().messages({
    "date.base": "Deadline must be a valid date.",
    "date.format": "Deadline must be in ISO format.",
    "any.required": "Deadline is required.",
  }),
  lesson_id: Joi.number().integer().required().messages({
    "number.base": "Lesson ID must be a number.",
    "any.required": "Lesson ID is required.",
  }),
  max_score: Joi.number().integer().min(0).required().messages({
    "number.base": "Max score must be a number.",
    "number.min": "Max score cannot be negative.",
    "any.required": "Max score is required.",
  }),
});

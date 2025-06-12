import Joi from "joi";

export const categorySchema = Joi.object({
  name: Joi.string().trim().min(2).max(50).required().messages({
    "string.min": "Category name must be at least 2 characters",
    "string.max": "Category name cannot exceed 50 characters",
    "any.required": "Category name is required",
  }),
});

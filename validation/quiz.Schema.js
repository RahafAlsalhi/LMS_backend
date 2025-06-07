import Joi from "joi";

export const quizSchema = Joi.object({
  lesson_id: Joi.number().integer().required().messages({
    "number.base": "Lesson ID must be a number.",
    "any.required": "Lesson ID is required.",
  }),
  question: Joi.string().min(5).max(1000).required().messages({
    "string.base": "Question must be a string.",
    "string.empty": "Question is required.",
    "string.min": "Question must be at least 5 characters.",
    "string.max": "Question must be at most 1000 characters.",
    "any.required": "Question is required.",
  }),
  options: Joi.array()
    .items(Joi.string().min(1).max(255))
    .min(2)
    .required()
    .messages({
      "array.base": "Options must be an array of strings.",
      "array.min": "At least two options are required.",
      "any.required": "Options are required.",
    }),
  correct_answer: Joi.string().min(1).max(255).required().messages({
    "string.base": "Correct answer must be a string.",
    "string.empty": "Correct answer is required.",
    "any.required": "Correct answer is required.",
  }),
  max_score: Joi.number().integer().min(1).default(10).messages({
    "number.base": "Max score must be a number.",
    "number.min": "Max score must be at least 1.",
  }),
});

export default quizSchema;

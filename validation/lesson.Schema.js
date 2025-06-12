import Joi from "joi";

export const lessonSchema = Joi.object({
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
  order: Joi.number().integer().min(0).required().messages({
    "number.min": "Order cannot be negative.",
  }),
  content_type: Joi.string()
    .valid("video", "text", "quiz", "assignment")
    .required()
    .messages({
      "any.only": "Content type must be one of: video, text, quiz, assignment.",
    }),
  content_url: Joi.when("content_type", {
    is: "video",
    then: Joi.string().uri().required().messages({
      "string.uri": "Content URL must be a valid URI for video lessons.",
      "any.required": "Content URL is required for video lessons.",
    }),
    otherwise: Joi.string().uri().optional(),
  }),
  content_text: Joi.when("content_type", {
    is: "text",
    then: Joi.string().min(1).required().messages({
      "any.required": "Content text is required for text lessons.",
    }),
    otherwise: Joi.string().optional(),
  }),
  duration: Joi.number().min(0).optional(),
  is_free: Joi.boolean().optional(),
  module_id: Joi.number().integer().required(),
  created_at: Joi.date().optional(),
  updated_at: Joi.date().optional(),
});

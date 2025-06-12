import Joi from "joi";

export const submissionSchema = Joi.object({
  assignment_id: Joi.number().integer().required(),
  user_id: Joi.number().integer().required(),
  submission_url: Joi.string().uri().required().messages({
    "string.uri": "Submission URL must be a valid URL",
  }),
  submission_text: Joi.string().trim().optional(),
  grade: Joi.number().integer().min(0).max(100).optional(),
  feedback: Joi.string().trim().allow("").optional(),
  submitted_at: Joi.date().default(() => new Date()),
});

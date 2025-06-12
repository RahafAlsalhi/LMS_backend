import Joi from "joi";

export const enrollmentSchema = Joi.object({
  user_id: Joi.number().integer().required(),
  course_id: Joi.number().integer().required(),
  enrollment_date: Joi.date().default(() => new Date()),
  progress: Joi.number().min(0).max(100).default(0),
  completed: Joi.boolean().default(false),
});

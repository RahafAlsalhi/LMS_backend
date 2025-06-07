import Joi from "joi";

export const CourseSearchSchema = Joi.object({
  q: Joi.string().trim().min(1).required(),
});

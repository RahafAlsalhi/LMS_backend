import Joi from "joi";

export const submissionSchema = Joi.object({
  assignment_id: Joi.number().integer().required(),
  user_id: Joi.number().integer().required(),
  submission_url: Joi.string().uri().required(),
  grade: Joi.number().integer().min(0).optional(),
  feedback: Joi.string().allow("").optional(),
});
//export default submissionSchema;

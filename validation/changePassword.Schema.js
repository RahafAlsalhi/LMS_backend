import Joi from "joi";

export const ChangePasswordSchema = Joi.object({
  currentPassword: Joi.string().required().messages({
    "any.required": "Current password is required.",
    "string.empty": "Current password cannot be empty.",
  }),

  newPassword: Joi.string()
    .pattern(
      new RegExp(
        "^(?=.*[A-Z])(?=.*\\d)(?=.*[!@#$%^&*])[A-Za-z\\d!@#$%^&*]{8,}$"
      )
    )
    .min(8)
    .max(128)
    .required()
    .messages({
      "string.pattern.base":
        "New password must be at least 8 characters long, include at least one uppercase letter, one number, and one special character (!@#$%^&*).",
      "string.min": "New password must be at least 8 characters long.",
      "string.max": "New password should be no more than 128 characters.",
      "any.required": "New password is required.",
    }),

  confirmPassword: Joi.string()
    .valid(Joi.ref("newPassword"))
    .required()
    .messages({
      "any.only": "Password confirmation does not match new password.",
      "any.required": "Password confirmation is required.",
    }),
});

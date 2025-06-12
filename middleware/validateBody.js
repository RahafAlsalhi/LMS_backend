// middleware/validateBody.js - Request Body Validation
import { createResponse } from "../utils/helper.js";

// Validate request body using Joi schema
export const validateBody = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false, // Return all errors, not just the first one
      stripUnknown: true, // Remove unknown fields
      convert: true, // Convert strings to appropriate types
    });

    if (error) {
      const errorMessage = error.details
        .map((detail) => detail.message)
        .join(", ");

      return res
        .status(400)
        .json(createResponse(false, errorMessage, null, "Validation failed"));
    }

    // Replace req.body with sanitized value
    req.body = value;
    next();
  };
};

// Validate partial body (for PATCH requests)
export const validatePartialBody = (schema) => {
  return (req, res, next) => {
    // Make all fields optional for partial updates
    const partialSchema = schema.fork(
      Object.keys(schema.describe().keys),
      (field) => field.optional()
    );

    const { error, value } = partialSchema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true,
      convert: true,
    });

    if (error) {
      const errorMessage = error.details
        .map((detail) => detail.message)
        .join(", ");

      return res
        .status(400)
        .json(createResponse(false, errorMessage, null, "Validation failed"));
    }

    req.body = value;
    next();
  };
};

// Validate required fields only
export const validateRequiredFields = (requiredFields) => {
  return (req, res, next) => {
    const missingFields = requiredFields.filter(
      (field) =>
        !req.body.hasOwnProperty(field) ||
        req.body[field] === null ||
        req.body[field] === undefined ||
        (typeof req.body[field] === "string" && req.body[field].trim() === "")
    );

    if (missingFields.length > 0) {
      return res
        .status(400)
        .json(
          createResponse(
            false,
            `Missing required fields: ${missingFields.join(", ")}`,
            null,
            "Required fields validation failed"
          )
        );
    }

    next();
  };
};

export default {
  validateBody,
  validatePartialBody,
  validateRequiredFields,
};

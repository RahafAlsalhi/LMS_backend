// middleware/validateQuery.js - Query Parameter Validation
import { createResponse } from "../utils/helper.js";

// Validate query parameters
export const validateQuery = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.query, {
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
        .json(
          createResponse(false, errorMessage, null, "Query validation failed")
        );
    }

    req.query = value;
    next();
  };
};

// Validate URL parameters
export const validateParams = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.params, {
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
        .json(
          createResponse(
            false,
            errorMessage,
            null,
            "Parameter validation failed"
          )
        );
    }

    req.params = value;
    next();
  };
};

// Common pagination validation
export const validatePagination = (req, res, next) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const maxLimit = 100;

  if (page < 1) {
    return res
      .status(400)
      .json(createResponse(false, "Page must be greater than 0"));
  }

  if (limit < 1 || limit > maxLimit) {
    return res
      .status(400)
      .json(createResponse(false, `Limit must be between 1 and ${maxLimit}`));
  }

  req.pagination = {
    page,
    limit,
    offset: (page - 1) * limit,
  };

  next();
};

// Validate sort parameters
export const validateSort = (allowedFields) => {
  return (req, res, next) => {
    const { sort, order } = req.query;

    if (sort) {
      if (!allowedFields.includes(sort)) {
        return res
          .status(400)
          .json(
            createResponse(
              false,
              `Invalid sort field. Allowed fields: ${allowedFields.join(", ")}`
            )
          );
      }
    }

    if (order && !["asc", "desc"].includes(order.toLowerCase())) {
      return res
        .status(400)
        .json(createResponse(false, "Order must be 'asc' or 'desc'"));
    }

    req.sort = {
      field: sort || "created_at",
      order: (order || "desc").toLowerCase(),
    };

    next();
  };
};

export default {
  validateQuery,
  validateParams,
  validatePagination,
  validateSort,
};

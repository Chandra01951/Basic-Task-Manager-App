// middlewares/validateRequest.js — Input validation helpers
// Each exported function is an Express middleware that validates a specific
// request shape and calls next(ApiError) if validation fails, keeping
// controller code free of validation logic.

const ApiError = require('../utils/ApiError');

const VALID_STATUSES = ['todo', 'in-progress', 'done'];

/**
 * Validate the request body when creating a task.
 * title is mandatory; status must be one of the allowed enum values if provided.
 */
function validateCreateTask(req, _res, next) {
  const { title, status } = req.body;

  if (!title || typeof title !== 'string' || title.trim() === '') {
    return next(ApiError.badRequest('title is required and must be a non-empty string.'));
  }

  if (status !== undefined && !VALID_STATUSES.includes(status)) {
    return next(
      ApiError.badRequest(`status must be one of: ${VALID_STATUSES.join(', ')}.`)
    );
  }

  next();
}

/**
 * Validate the request body when updating a task.
 * At least one field must be present; status (if provided) must be valid.
 */
function validateUpdateTask(req, _res, next) {
  const { title, description, status, due_date } = req.body;

  const hasAtLeastOneField = [title, description, status, due_date].some(
    (v) => v !== undefined
  );

  if (!hasAtLeastOneField) {
    return next(ApiError.badRequest('At least one field must be provided to update.'));
  }

  if (title !== undefined && (typeof title !== 'string' || title.trim() === '')) {
    return next(ApiError.badRequest('title must be a non-empty string.'));
  }

  if (status !== undefined && !VALID_STATUSES.includes(status)) {
    return next(
      ApiError.badRequest(`status must be one of: ${VALID_STATUSES.join(', ')}.`)
    );
  }

  next();
}

module.exports = { validateCreateTask, validateUpdateTask };

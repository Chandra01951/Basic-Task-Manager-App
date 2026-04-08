// utils/ApiError.js — Custom operational error class
// Extending Error lets us attach an HTTP status code and a
// machine-readable `isOperational` flag so the error handler can
// distinguish anticipated errors (validation, not-found) from
// unexpected crashes and respond accordingly.

class ApiError extends Error {
  /**
   * @param {number} statusCode - HTTP status code (e.g. 400, 404)
   * @param {string} message    - Human-readable error message
   */
  constructor(statusCode, message) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true; // known, anticipated error
    Error.captureStackTrace(this, this.constructor);
  }

  static badRequest(msg) {
    return new ApiError(400, msg);
  }

  static notFound(msg = 'Resource not found') {
    return new ApiError(404, msg);
  }

  static internal(msg = 'Internal server error') {
    return new ApiError(500, msg);
  }
}

module.exports = ApiError;

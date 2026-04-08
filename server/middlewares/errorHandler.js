// middlewares/errorHandler.js — Central error handling middleware
// Must have exactly 4 parameters so Express treats it as an error handler.
// Operational errors (ApiError) are surfaced to the client with their
// status code; all other errors fall back to 500 to avoid leaking internals.

const ApiError = require('../utils/ApiError');

// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  // Log full stack in development; keep production logs cleaner
  if (process.env.NODE_ENV !== 'production') {
    console.error(err.stack || err.message);
  } else {
    console.error(`[${err.statusCode || 500}] ${err.message}`);
  }

  if (err instanceof ApiError && err.isOperational) {
    return res.status(err.statusCode).json({
      success: false,
      error: err.message,
    });
  }

  // Unhandled / unexpected errors
  res.status(500).json({
    success: false,
    error: 'An unexpected error occurred. Please try again later.',
  });
}

module.exports = errorHandler;

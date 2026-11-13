const AppError = require('../utils/AppError');
const { nodeEnv } = require('../config/env');

/** Handles requests that did not match any route. */
function notFound(req, res, next) {
  next(new AppError(`Route not found: ${req.method} ${req.originalUrl}`, 404));
}

/**
 * Converts any error into a consistent JSON response:
 * { success: false, message, details? }
 */
// eslint-disable-next-line no-unused-vars
function errorHandler(error, req, res, next) {
  let statusCode = error.statusCode || 500;
  let message = error.message;
  let details = error.details;

  if (error.name === 'ValidationError' && error.errors) {
    // Mongoose schema validation failed
    statusCode = 400;
    details = Object.values(error.errors).map((item) => item.message);
    message = details.join('. ');
  } else if (error.name === 'CastError') {
    statusCode = 400;
    message = `Invalid value for ${error.path}`;
  } else if (error.code === 11000) {
    // Unique index violation (e.g. duplicate email)
    statusCode = 409;
    message = 'That record already exists';
  } else if (error.type === 'entity.parse.failed') {
    statusCode = 400;
    message = 'Request body contains invalid JSON';
  }

  const isUnexpected = !error.isOperational && statusCode === 500;
  if (isUnexpected) {
    console.error(error);
    if (nodeEnv === 'production') message = 'Something went wrong on our side';
  }

  res.status(statusCode).json({
    success: false,
    message,
    ...(details ? { details } : {}),
    ...(nodeEnv !== 'production' && isUnexpected ? { stack: error.stack } : {}),
  });
}

module.exports = { notFound, errorHandler };

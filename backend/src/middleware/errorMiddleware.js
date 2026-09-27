const logger = require('../utils/logger');
const env = require('../config/env');

function notFoundHandler(req, res, next) {
  res.status(404).json({
    success: false,
    message: `Resource not found: [${req.method}] ${req.originalUrl}`
  });
}

function errorHandler(err, req, res, next) {
  logger.error(`Unhandled error during ${req.method} ${req.originalUrl}: ${err.message}`, err);

  if (err.name === 'ZodError' || (err.errors && Array.isArray(err.errors))) {
    const errorDetails = err.errors.map(e => ({
      field: Array.isArray(e.path) ? e.path.join('.') : e.field || 'input',
      message: e.message
    }));

    return res.status(400).json({
      success: false,
      message: 'Validation failed for request payload',
      errors: errorDetails
    });
  }

  const statusCode = err.statusCode || (res.statusCode && res.statusCode !== 200 ? res.statusCode : 500);

  res.status(statusCode).json({
    success: false,
    message: err.message || 'An internal server error occurred',
    errors: err.errors || null,
    ...(env.NODE_ENV === 'development' && { stack: err.stack })
  });
}

module.exports = {
  notFoundHandler,
  errorHandler
};

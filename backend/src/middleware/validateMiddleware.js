const { ZodError } = require('zod');

/**
 * Zod request validation middleware
 * Validates req.body against provided Zod schema
 */
function validateBody(schema) {
  return (req, res, next) => {
    try {
      req.body = schema.parse(req.body);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const errorDetails = error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message
        }));

        return res.status(400).json({
          success: false,
          message: 'Validation failed for request payload',
          errors: errorDetails
        });
      }
      next(error);
    }
  };
}

module.exports = {
  validateBody
};

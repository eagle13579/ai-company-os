const logger = require('./logger');

class ErrorHandler {
  static handleError(error, res) {
    logger.error('Error occurred:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    });

    const statusCode = error.statusCode || 500;
    const response = {
      success: false,
      error: {
        message: error.message || 'Internal server error',
        code: error.code || 'INTERNAL_ERROR',
        ...(process.env.NODE_ENV !== 'production' && { stack: error.stack })
      }
    };

    res.status(statusCode).json(response);
  }

  static asyncHandler(fn) {
    return async (req, res, next) => {
      try {
        await fn(req, res, next);
      } catch (error) {
        next(error);
      }
    };
  }
}

module.exports = ErrorHandler;
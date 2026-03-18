const config = require('../config/config');

class Logger {
  static info(message, context = {}) {
    console.log(`[INFO] ${new Date().toISOString()} - ${message}`, context);
  }

  static error(message, error = {}, context = {}) {
    console.error(`[ERROR] ${new Date().toISOString()} - ${message}`, {
      error,
      context,
    });
  }

  static debug(message, context = {}) {
    console.debug(`[DEBUG] ${new Date().toISOString()} - ${message}`, context);
  }

  static warn(message, context = {}) {
    console.warn(`[WARN] ${new Date().toISOString()} - ${message}`, context);
  }
}

class ErrorHandler {
  static createError(code, message, details = {}) {
    const error = new Error(message);
    error.code = code;
    error.details = details;
    return error;
  }

  static handleError(error, context = {}) {
    Logger.error('Error occurred', error, context);
    return {
      error: {
        code: error.code || 'UNKNOWN_ERROR',
        message: error.message,
        details: error.details || {},
      },
      status: 'failed',
    };
  }
}

class Validator {
  static validateGoals(goals) {
    if (!Array.isArray(goals)) {
      throw ErrorHandler.createError('INVALID_GOALS', 'Goals must be an array');
    }
    if (goals.length === 0) {
      throw ErrorHandler.createError(
        'EMPTY_GOALS',
        'Goals array cannot be empty'
      );
    }
    return true;
  }

  static validateConstraints(constraints) {
    if (!constraints || typeof constraints !== 'object') {
      throw ErrorHandler.createError(
        'INVALID_CONSTRAINTS',
        'Constraints must be an object'
      );
    }
    return true;
  }

  static validateResources(resources) {
    if (!Array.isArray(resources)) {
      throw ErrorHandler.createError(
        'INVALID_RESOURCES',
        'Resources must be an array'
      );
    }
    return true;
  }
}

class Utils {
  static generateId(prefix = 'id') {
    return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  static calculateSuccessRate(completed, total) {
    if (total === 0) return 0;
    return (completed / total) * 100;
  }

  static calculateAverage(values) {
    if (values.length === 0) return 0;
    const sum = values.reduce((acc, val) => acc + val, 0);
    return sum / values.length;
  }

  static calculateTrend(values) {
    if (values.length < 2) return 'insufficient_data';
    const first = values[0];
    const last = values[values.length - 1];
    const change = last - first;
    if (change > 5) return 'improving';
    else if (change < -5) return 'declining';
    else return 'stable';
  }

  static async sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  static async runParallel(tasks, concurrency = 4) {
    const results = [];
    const running = [];

    for (const task of tasks) {
      const promise = task();
      running.push(promise);

      if (running.length >= concurrency) {
        const completed = await Promise.race(running);
        running.splice(running.indexOf(promise), 1);
        results.push(completed);
      } else {
        promise.then((result) => results.push(result));
      }
    }

    const remaining = await Promise.all(running);
    results.push(...remaining);
    return results;
  }
}

module.exports = {
  Logger,
  ErrorHandler,
  Validator,
  Utils,
};

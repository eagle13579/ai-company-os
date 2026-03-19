const config = require('./config');
const logger = require('./logger');

class SecurityMiddleware {
  static authenticate(req, res, next) {
    if (!config.security.apiKey) {
      // 如果没有配置API密钥，则跳过认证
      return next();
    }

    const apiKey = req.headers['x-api-key'] || req.query.apiKey;
    if (!apiKey) {
      const error = new Error('API key is required');
      error.statusCode = 401;
      error.code = 'MISSING_API_KEY';
      return next(error);
    }

    if (apiKey !== config.security.apiKey) {
      const error = new Error('Invalid API key');
      error.statusCode = 401;
      error.code = 'INVALID_API_KEY';
      return next(error);
    }

    logger.info('API key authenticated successfully');
    next();
  }

  static validateInput(req, res, next) {
    // 基本的输入验证
    if (req.body) {
      try {
        // 检查是否为有效的JSON
        JSON.stringify(req.body);
      } catch (error) {
        const validationError = new Error('Invalid JSON format');
        validationError.statusCode = 400;
        validationError.code = 'INVALID_JSON';
        return next(validationError);
      }
    }
    next();
  }

  static cors(req, res, next) {
    if (config.security.enableCors) {
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-api-key');
    }
    
    if (req.method === 'OPTIONS') {
      return res.status(204).end();
    }
    
    next();
  }
}

module.exports = SecurityMiddleware;
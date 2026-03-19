const logger = require('../agent_gateway/logger');
const { ValidationError } = require('./errors');

class Validator {
  static validateRequest(request) {
    if (!request || typeof request !== 'object') {
      throw new ValidationError('Request must be an object');
    }

    // 检查请求大小
    const requestSize = JSON.stringify(request).length;
    if (requestSize > 1024 * 1024) { // 1MB limit
      throw new ValidationError('Request size exceeds limit (1MB)');
    }

    // 检查请求中的敏感字段
    this.checkSensitiveFields(request);

    return true;
  }

  static validateQuery(query) {
    if (!query || typeof query !== 'string') {
      throw new ValidationError('Query must be a string');
    }

    // 检查查询长度
    if (query.length > 1000) {
      throw new ValidationError('Query length exceeds limit (1000 characters)');
    }

    // 检查查询中的敏感内容
    this.checkSensitiveContent(query);

    return true;
  }

  static validateDataSource(source) {
    if (!source || typeof source !== 'object') {
      throw new ValidationError('Data source must be an object');
    }

    if (typeof source.fetch !== 'function') {
      throw new ValidationError('Data source must have a fetch method');
    }

    return true;
  }

  static validateVectorStore(store) {
    if (!store || typeof store !== 'object') {
      throw new ValidationError('Vector store must be an object');
    }

    if (typeof store.search !== 'function') {
      throw new ValidationError('Vector store must have a search method');
    }

    return true;
  }

  static validateModel(model) {
    if (!model || typeof model !== 'object') {
      throw new ValidationError('Model must be an object');
    }

    if (typeof model.generate !== 'function') {
      throw new ValidationError('Model must have a generate method');
    }

    return true;
  }

  static checkSensitiveFields(data) {
    const sensitiveFields = ['password', 'token', 'secret', 'key', 'credential'];
    const foundFields = [];

    function checkObject(obj) {
      for (const key in obj) {
        if (typeof obj[key] === 'object' && obj[key] !== null) {
          checkObject(obj[key]);
        } else if (typeof key === 'string') {
          const lowercaseKey = key.toLowerCase();
          if (sensitiveFields.some(sensitive => lowercaseKey.includes(sensitive))) {
            foundFields.push(key);
          }
        }
      }
    }

    checkObject(data);

    if (foundFields.length > 0) {
      logger.warn(`Sensitive fields detected: ${foundFields.join(', ')}`);
    }
  }

  static checkSensitiveContent(content) {
    // 检查SQL注入攻击
    const sqlInjectionPatterns = [
      /\bSELECT\b.*\bFROM\b/i,
      /\bINSERT\b.*\bINTO\b/i,
      /\bUPDATE\b.*\bSET\b/i,
      /\bDELETE\b.*\bFROM\b/i,
      /\bDROP\b.*\bTABLE\b/i,
      /\bALTER\b.*\bTABLE\b/i,
      /\bEXEC\b/i,
      /\bEXECUTE\b/i,
      /\bUNION\b.*\bSELECT\b/i
    ];

    for (const pattern of sqlInjectionPatterns) {
      if (pattern.test(content)) {
        logger.warn('Potential SQL injection detected in query');
        break;
      }
    }

    // 检查XSS攻击
    const xssPatterns = [
      /<script[^>]*>.*?<\/script>/i,
      /<iframe[^>]*>.*?<\/iframe>/i,
      /<img[^>]*onerror[^>]*>/i,
      /javascript:/i,
      /data:text\/html/i
    ];

    for (const pattern of xssPatterns) {
      if (pattern.test(content)) {
        logger.warn('Potential XSS attack detected in query');
        break;
      }
    }
  }

  static sanitizeInput(input) {
    if (typeof input === 'string') {
      // 转义HTML特殊字符
      return input
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
    } else if (typeof input === 'object' && input !== null) {
      // 递归处理对象
      for (const key in input) {
        input[key] = this.sanitizeInput(input[key]);
      }
    }
    return input;
  }
}

module.exports = Validator;
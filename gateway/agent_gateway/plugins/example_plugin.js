const logger = require('../logger');

const examplePlugin = {
  name: 'example_plugin',
  
  async preProcess(request) {
    logger.info('Example plugin pre-processing request');
    // 示例：添加请求时间戳
    request.timestamp = Date.now();
    // 示例：添加请求ID
    request.requestId = `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    return request;
  },
  
  async postProcess(result) {
    logger.info('Example plugin post-processing result');
    // 示例：添加处理时间戳
    result.processedAt = Date.now();
    return result;
  }
};

module.exports = examplePlugin;
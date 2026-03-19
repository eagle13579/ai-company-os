const logger = require('../../agent_gateway/logger');

const examplePlugin = {
  name: 'example_plugin',
  
  async preProcess(input) {
    logger.info('Example plugin pre-processing input');
    // 示例：添加处理时间戳
    if (typeof input === 'object' && input !== null) {
      input.processedAt = Date.now();
      input.processedBy = 'example_plugin';
    }
    // 示例：对查询进行处理
    if (typeof input === 'string') {
      input = input.trim();
    }
    return input;
  },
  
  async postProcess(result) {
    logger.info('Example plugin post-processing result');
    // 示例：添加处理信息
    if (result && typeof result === 'object') {
      result.processedByPlugin = 'example_plugin';
      result.processingTime = Date.now();
    }
    return result;
  }
};

module.exports = examplePlugin;
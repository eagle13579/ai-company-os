const dotenv = require('dotenv');
dotenv.config();

const config = {
  // 服务配置
  server: {
    port: process.env.TOOL_GATEWAY_PORT || 3001,
    host: process.env.TOOL_GATEWAY_HOST || 'localhost'
  },
  // 工具执行配置
  execution: {
    timeout: process.env.TOOL_EXECUTION_TIMEOUT || 30000, // 30秒
    maxConcurrentTools: process.env.TOOL_MAX_CONCURRENT || 5
  },
  // 安全配置
  security: {
    apiKey: process.env.TOOL_GATEWAY_API_KEY,
    enableCors: process.env.ENABLE_CORS === 'true' || true
  },
  // 日志配置
  logging: {
    level: process.env.LOG_LEVEL || 'info',
    format: process.env.LOG_FORMAT || 'json'
  }
};

module.exports = config;
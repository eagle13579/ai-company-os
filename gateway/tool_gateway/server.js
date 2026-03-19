const express = require('express');
const { toolRouter, toolRegistry, logger, config } = require('./index');

const app = express();

// 中间件
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 注册示例工具
const exampleTool = {
  description: '示例工具，返回问候消息',
  parameters: {
    name: {
      type: 'string',
      required: true,
      description: '要问候的名称'
    },
    age: {
      type: 'number',
      required: false,
      min: 0,
      max: 120,
      description: '年龄（可选）'
    }
  },
  async execute(params) {
    const { name, age } = params;
    let message = `Hello, ${name}!`;
    if (age) {
      message += ` You are ${age} years old.`;
    }
    return { message };
  }
};

toolRegistry.registerTool('example', exampleTool);

// 健康检查端点
app.get('/health', (req, res) => {
  res.json({
    success: true,
    data: {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      toolCount: toolRegistry.size()
    }
  });
});

// 注册工具路由
app.use('/api/tools', toolRouter);

// 启动服务器
const PORT = config.server.port;
app.listen(PORT, config.server.host, () => {
  logger.info(`Tool Gateway server running on http://${config.server.host}:${PORT}`);
  logger.info(`Health check: http://${config.server.host}:${PORT}/health`);
  logger.info(`API endpoints:`);
  logger.info(`  - POST /api/tools/execute - Execute a tool`);
  logger.info(`  - POST /api/tools/execute-multiple - Execute multiple tools`);
  logger.info(`  - GET /api/tools - List all tools`);
  logger.info(`  - GET /api/tools/:name - Get tool details`);
});

module.exports = app;
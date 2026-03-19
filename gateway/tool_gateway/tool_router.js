const express = require('express');
const router = express.Router();
const toolExecutor = require('./tool_executor');
const toolRegistry = require('./tool_registry');
const logger = require('./logger');
const ErrorHandler = require('./errorHandler');
const SecurityMiddleware = require('./security');

// 应用中间件
router.use(SecurityMiddleware.cors);
router.use(SecurityMiddleware.validateInput);
router.use(SecurityMiddleware.authenticate);

router.post('/execute', ErrorHandler.asyncHandler(async (req, res) => {
  const { tool, params } = req.body;
  
  if (!tool) {
    const error = new Error('Tool name is required');
    error.statusCode = 400;
    error.code = 'MISSING_TOOL_NAME';
    throw error;
  }

  logger.info('Received tool execution request', { tool });
  
  const result = await toolExecutor.executeToolWithValidation(tool, params);
  
  if (result.success) {
    res.json(result);
  } else {
    res.status(400).json(result);
  }
}));

router.post('/execute-multiple', ErrorHandler.asyncHandler(async (req, res) => {
  const { tools } = req.body;
  
  if (!Array.isArray(tools)) {
    const error = new Error('Tools must be an array');
    error.statusCode = 400;
    error.code = 'INVALID_TOOLS_FORMAT';
    throw error;
  }

  logger.info('Received multiple tool execution request', { toolCount: tools.length });
  
  const results = await toolExecutor.executeMultipleTools(tools);
  res.json({
    success: true,
    data: results
  });
}));

router.get('/tools', ErrorHandler.asyncHandler(async (req, res) => {
  logger.info('Received request for tool list');
  
  const tools = toolRegistry.getAllTools();
  res.json({
    success: true,
    data: tools
  });
}));

router.get('/tools/:name', ErrorHandler.asyncHandler(async (req, res) => {
  const { name } = req.params;
  logger.info('Received request for tool details', { tool: name });
  
  const tool = toolRegistry.getTool(name);
  
  if (!tool) {
    const error = new Error(`Tool "${name}" not found`);
    error.statusCode = 404;
    error.code = 'TOOL_NOT_FOUND';
    throw error;
  }

  res.json({
    success: true,
    data: {
      name,
      ...(tool.description && { description: tool.description }),
      ...(tool.parameters && { parameters: tool.parameters })
    }
  });
}));

// 全局错误处理中间件
router.use((error, req, res, next) => {
  ErrorHandler.handleError(error, res);
});

module.exports = router;
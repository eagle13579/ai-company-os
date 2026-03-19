const toolRegistry = require('./tool_registry');
const logger = require('./logger');
const config = require('./config');

class ToolExecutor {
  async executeTool(toolName, params = {}) {
    const tool = toolRegistry.getTool(toolName);
    if (!tool) {
      const error = new Error(`Tool "${toolName}" not found`);
      error.code = 'TOOL_NOT_FOUND';
      throw error;
    }

    logger.info(`Executing tool: ${toolName}`, { params: this.sanitizeParams(params) });

    try {
      // 添加超时处理
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => {
          reject(new Error(`Tool execution timed out after ${config.execution.timeout}ms`));
        }, config.execution.timeout);
      });

      const result = await Promise.race([
        tool.execute(params),
        timeoutPromise
      ]);

      logger.info(`Tool execution completed: ${toolName}`, { success: true });
      return {
        success: true,
        data: result
      };
    } catch (error) {
      logger.error(`Tool execution failed: ${toolName}`, {
        error: error.message,
        stack: error.stack
      });
      return {
        success: false,
        error: {
          message: error.message,
          code: error.code || 'EXECUTION_ERROR',
          stack: process.env.NODE_ENV === 'production' ? undefined : error.stack
        }
      };
    }
  }

  async executeMultipleTools(toolCalls) {
    if (!Array.isArray(toolCalls)) {
      const error = new Error('toolCalls must be an array');
      error.code = 'INVALID_INPUT';
      throw error;
    }

    logger.info(`Executing multiple tools: ${toolCalls.length} tools`);

    // 并行执行工具，限制并发数
    const results = [];
    const maxConcurrent = config.execution.maxConcurrentTools;
    let running = 0;
    let index = 0;

    return new Promise((resolve) => {
      const processNext = async () => {
        if (index >= toolCalls.length && running === 0) {
          logger.info(`All tools executed: ${results.length} results`);
          resolve(results);
          return;
        }

        while (running < maxConcurrent && index < toolCalls.length) {
          const call = toolCalls[index];
          index++;
          running++;

          (async () => {
            try {
              const { tool, params } = call;
              if (!tool) {
                results.push({
                  success: false,
                  error: { 
                    message: 'Tool name is required',
                    code: 'MISSING_TOOL_NAME'
                  }
                });
              } else {
                const result = await this.executeTool(tool, params);
                results.push(result);
              }
            } catch (error) {
              results.push({
                success: false,
                error: {
                  message: error.message,
                  code: error.code || 'EXECUTION_ERROR'
                }
              });
            } finally {
              running--;
              processNext();
            }
          })();
        }
      };

      processNext();
    });
  }

  validateToolParams(toolName, params) {
    const tool = toolRegistry.getTool(toolName);
    if (!tool) {
      const error = new Error(`Tool "${toolName}" not found`);
      error.code = 'TOOL_NOT_FOUND';
      throw error;
    }

    if (!tool.parameters) {
      return true;
    }

    const errors = [];
    for (const [paramName, paramConfig] of Object.entries(tool.parameters)) {
      if (paramConfig.required && params[paramName] === undefined) {
        errors.push(`Parameter "${paramName}" is required`);
      }

      if (paramConfig.type && params[paramName] !== undefined) {
        const actualType = typeof params[paramName];
        if (actualType !== paramConfig.type) {
          errors.push(`Parameter "${paramName}" must be of type "${paramConfig.type}", got "${actualType}"`);
        }
      }

      // 可以添加更多验证规则，如最小值、最大值、正则表达式等
      if (paramConfig.min && params[paramName] < paramConfig.min) {
        errors.push(`Parameter "${paramName}" must be at least ${paramConfig.min}`);
      }

      if (paramConfig.max && params[paramName] > paramConfig.max) {
        errors.push(`Parameter "${paramName}" must be at most ${paramConfig.max}`);
      }
    }

    if (errors.length > 0) {
      const error = new Error(errors.join('; '));
      error.code = 'INVALID_PARAMS';
      throw error;
    }

    return true;
  }

  async executeToolWithValidation(toolName, params = {}) {
    try {
      this.validateToolParams(toolName, params);
      return await this.executeTool(toolName, params);
    } catch (error) {
      logger.warn(`Tool validation failed: ${toolName}`, {
        error: error.message
      });
      return {
        success: false,
        error: {
          message: error.message,
          code: error.code || 'VALIDATION_ERROR'
        }
      };
    }
  }

  // 辅助方法：清理参数，避免日志中包含敏感信息
  sanitizeParams(params) {
    const sanitized = { ...params };
    // 可以根据需要添加敏感字段的清理逻辑
    return sanitized;
  }
}

const toolExecutor = new ToolExecutor();
module.exports = toolExecutor;
module.exports.ToolExecutor = ToolExecutor;
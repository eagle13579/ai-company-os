const logger = require('./logger');

class ToolRegistry {
  constructor() {
    this.tools = new Map();
    logger.info('ToolRegistry initialized');
  }

  registerTool(name, tool) {
    if (!name || !tool) {
      const error = new Error('Tool name and tool object are required');
      error.code = 'MISSING_REQUIRED_PARAMS';
      throw error;
    }
    if (typeof tool.execute !== 'function') {
      const error = new Error('Tool must have an execute method');
      error.code = 'INVALID_TOOL_STRUCTURE';
      throw error;
    }
    
    this.tools.set(name, tool);
    logger.info(`Tool registered: ${name}`, {
      description: tool.description,
      hasParameters: !!tool.parameters
    });
    return this;
  }

  unregisterTool(name) {
    const result = this.tools.delete(name);
    if (result) {
      logger.info(`Tool unregistered: ${name}`);
    } else {
      logger.warn(`Attempted to unregister non-existent tool: ${name}`);
    }
    return result;
  }

  getTool(name) {
    const tool = this.tools.get(name);
    if (!tool) {
      logger.debug(`Tool not found: ${name}`);
    }
    return tool;
  }

  getAllTools() {
    const tools = Array.from(this.tools.entries()).map(([name, tool]) => ({
      name,
      ...(tool.description && { description: tool.description }),
      ...(tool.parameters && { parameters: tool.parameters })
    }));
    logger.debug(`Retrieved all tools: ${tools.length} tools`);
    return tools;
  }

  hasTool(name) {
    return this.tools.has(name);
  }

  clear() {
    const count = this.tools.size;
    this.tools.clear();
    logger.info(`Cleared all tools: ${count} tools removed`);
  }

  size() {
    return this.tools.size;
  }
}

const toolRegistry = new ToolRegistry();
module.exports = toolRegistry;
module.exports.ToolRegistry = ToolRegistry;
class TaskGatewayError extends Error {
  constructor(code, message, details = {}) {
    super(message);
    this.name = 'TaskGatewayError';
    this.code = code;
    this.details = details;
    this.timestamp = new Date().toISOString();
  }
}

const ErrorCodes = {
  // 任务相关错误
  TASK_NOT_FOUND: 'TASK_NOT_FOUND',
  INVALID_TASK_INPUT: 'INVALID_TASK_INPUT',
  TASK_ALREADY_EXISTS: 'TASK_ALREADY_EXISTS',
  INVALID_TASK_STATUS: 'INVALID_TASK_STATUS',
  TASK_EXECUTION_FAILED: 'TASK_EXECUTION_FAILED',
  
  // 工作流相关错误
  WORKFLOW_NOT_FOUND: 'WORKFLOW_NOT_FOUND',
  INVALID_WORKFLOW_INPUT: 'INVALID_WORKFLOW_INPUT',
  WORKFLOW_VALIDATION_FAILED: 'WORKFLOW_VALIDATION_FAILED',
  CIRCULAR_DEPENDENCY: 'CIRCULAR_DEPENDENCY',
  
  // 队列相关错误
  QUEUE_FULL: 'QUEUE_FULL',
  QUEUE_ERROR: 'QUEUE_ERROR',
  
  // 存储相关错误
  STORAGE_ERROR: 'STORAGE_ERROR',
  REDIS_CONNECTION_ERROR: 'REDIS_CONNECTION_ERROR',
  
  // 系统错误
  INTERNAL_ERROR: 'INTERNAL_ERROR',
  NOT_IMPLEMENTED: 'NOT_IMPLEMENTED'
};

const ErrorMessages = {
  [ErrorCodes.TASK_NOT_FOUND]: 'Task not found',
  [ErrorCodes.INVALID_TASK_INPUT]: 'Invalid task input',
  [ErrorCodes.TASK_ALREADY_EXISTS]: 'Task with this id already exists',
  [ErrorCodes.INVALID_TASK_STATUS]: 'Invalid task status',
  [ErrorCodes.TASK_EXECUTION_FAILED]: 'Task execution failed',
  [ErrorCodes.WORKFLOW_NOT_FOUND]: 'Workflow not found',
  [ErrorCodes.INVALID_WORKFLOW_INPUT]: 'Invalid workflow input',
  [ErrorCodes.WORKFLOW_VALIDATION_FAILED]: 'Workflow validation failed',
  [ErrorCodes.CIRCULAR_DEPENDENCY]: 'Workflow contains circular dependencies',
  [ErrorCodes.QUEUE_FULL]: 'Task queue is full',
  [ErrorCodes.QUEUE_ERROR]: 'Queue operation error',
  [ErrorCodes.STORAGE_ERROR]: 'Storage operation error',
  [ErrorCodes.REDIS_CONNECTION_ERROR]: 'Redis connection error',
  [ErrorCodes.INTERNAL_ERROR]: 'Internal server error',
  [ErrorCodes.NOT_IMPLEMENTED]: 'Feature not implemented'
};

function createError(code, message = null, details = {}) {
  const errorMessage = message || ErrorMessages[code] || 'Unknown error';
  return new TaskGatewayError(code, errorMessage, details);
}

function handleError(error, context = {}) {
  console.error('Error occurred:', {
    error: {
      code: error.code,
      message: error.message,
      details: error.details
    },
    context,
    timestamp: new Date().toISOString()
  });

  if (error instanceof TaskGatewayError) {
    return {
      success: false,
      error: {
        code: error.code,
        message: error.message,
        details: error.details
      }
    };
  }

  return {
    success: false,
    error: {
      code: ErrorCodes.INTERNAL_ERROR,
      message: 'Internal server error',
      details: { originalError: error.message }
    }
  };
}

module.exports = {
  TaskGatewayError,
  ErrorCodes,
  ErrorMessages,
  createError,
  handleError
};
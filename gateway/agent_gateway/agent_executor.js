const logger = require('./logger');

class AgentExecutor {
  constructor(config = {}) {
    this.config = {
      maxConcurrentTasks: 5,
      ...config
    };
    this.executionQueue = [];
    this.runningTasks = new Map();
    this.maxConcurrentTasks = this.config.maxConcurrentTasks;
    logger.info('Agent Executor initialized with config:', this.config);
  }

  async execute(agent, request) {
    const taskId = this.generateTaskId();
    const task = {
      id: taskId,
      agent,
      request,
      status: 'pending',
      startTime: null,
      endTime: null,
      result: null,
      error: null
    };

    this.executionQueue.push(task);
    this.processQueue();

    return new Promise((resolve, reject) => {
      const checkTaskStatus = () => {
        const currentTask = this.runningTasks.get(taskId);
        if (currentTask) {
          if (currentTask.status === 'completed') {
            resolve(currentTask.result);
          } else if (currentTask.status === 'failed') {
            reject(new Error(currentTask.error));
          } else {
            setTimeout(checkTaskStatus, 100);
          }
        } else {
          const queuedTask = this.executionQueue.find(t => t.id === taskId);
          if (queuedTask) {
            setTimeout(checkTaskStatus, 100);
          } else {
            reject(new Error('Task not found'));
          }
        }
      };

      checkTaskStatus();
    });
  }

  processQueue() {
    while (this.runningTasks.size < this.maxConcurrentTasks && this.executionQueue.length > 0) {
      const task = this.executionQueue.shift();
      this.runTask(task);
    }
  }

  async runTask(task) {
    task.status = 'running';
    task.startTime = Date.now();
    this.runningTasks.set(task.id, task);

    try {
      task.result = await task.agent.execute(task.request);
      task.status = 'completed';
      task.endTime = Date.now();
    } catch (error) {
      task.status = 'failed';
      task.error = error.message;
      task.endTime = Date.now();
    } finally {
      this.runningTasks.delete(task.id);
      this.processQueue();
    }
  }

  generateTaskId() {
    return `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  getQueueSize() {
    return this.executionQueue.length;
  }

  getRunningTasksCount() {
    return this.runningTasks.size;
  }

  getTaskStatus(taskId) {
    const runningTask = this.runningTasks.get(taskId);
    if (runningTask) {
      return runningTask;
    }

    const queuedTask = this.executionQueue.find(task => task.id === taskId);
    return queuedTask || null;
  }

  cancelTask(taskId) {
    const taskIndex = this.executionQueue.findIndex(task => task.id === taskId);
    if (taskIndex !== -1) {
      this.executionQueue.splice(taskIndex, 1);
      return true;
    }

    return false;
  }

  setMaxConcurrentTasks(max) {
    this.maxConcurrentTasks = max;
    this.processQueue();
  }
}

module.exports = AgentExecutor;
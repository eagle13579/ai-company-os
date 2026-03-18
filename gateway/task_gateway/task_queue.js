const redis = require('redis');
const { createError, ErrorCodes } = require('./error_handler');

/**
 * 任务队列类
 * 负责管理任务队列、处理任务状态、实现任务重试
 */
class TaskQueue {
  constructor(options = {}) {
    this.queue = [];
    this.taskMap = new Map(); // 用于快速查找任务
    this.processingTasks = new Set();
    this.maxQueueSize = options.maxQueueSize || 1000; // 队列大小限制
    this.concurrencyLimit = options.concurrencyLimit || 10; // 并发限制

    // Redis配置
    this.redisClient = redis.createClient({
      url: process.env.REDIS_URL || 'redis://localhost:6379'
    });

    this.redisClient.connect().catch(err => {
      console.error('Redis connection error:', err);
    });

    this.loadFromRedis();
  }

  /**
   * 从Redis加载数据
   */
  async loadFromRedis() {
    try {
      const tasksData = await this.redisClient.get('task_queue');
      if (tasksData) {
        this.queue = JSON.parse(tasksData);
        // 重建任务映射
        this.queue.forEach(task => {
          this.taskMap.set(task.id, task);
        });
      }

      const processingData = await this.redisClient.get('processing_tasks');
      if (processingData) {
        this.processingTasks = new Set(JSON.parse(processingData));
      }
    } catch (err) {
      console.error('Error loading from Redis:', err);
    }
  }

  /**
   * 保存数据到Redis
   */
  async saveToRedis() {
    try {
      await this.redisClient.set('task_queue', JSON.stringify(this.queue));
      await this.redisClient.set('processing_tasks', JSON.stringify([...this.processingTasks]));
    } catch (err) {
      console.error('Error saving to Redis:', err);
    }
  }

  /**
   * 添加任务到队列
   * @param {Object} task - 任务对象
   * @returns {string} 任务ID
   */
  async addTask(task) {
    if (!task || typeof task !== 'object') {
      throw createError(ErrorCodes.INVALID_TASK_INPUT, 'Invalid task object');
    }

    if (!task.id) {
      throw createError(ErrorCodes.INVALID_TASK_INPUT, 'Task must have an id');
    }

    if (this.taskMap.has(task.id)) {
      throw createError(ErrorCodes.TASK_ALREADY_EXISTS, 'Task with this id already exists in queue');
    }

    if (this.queue.length >= this.maxQueueSize) {
      throw createError(ErrorCodes.QUEUE_FULL, 'Task queue is full');
    }

    this.queue.push(task);
    this.taskMap.set(task.id, task);
    this.sortByPriority();
    await this.saveToRedis();
    return task.id;
  }

  /**
   * 从队列中移除任务
   * @param {string} taskId - 任务ID
   * @returns {boolean} 是否成功移除
   */
  async removeTask(taskId) {
    const task = this.taskMap.get(taskId);
    if (!task) {
      return false;
    }

    const index = this.queue.findIndex(t => t.id === taskId);
    if (index === -1) {
      return false;
    }

    this.queue.splice(index, 1);
    this.taskMap.delete(taskId);
    this.processingTasks.delete(taskId);
    await this.saveToRedis();
    return true;
  }

  /**
   * 获取下一个待执行的任务
   * @returns {Object|null} 任务对象或null
   */
  async getNextTask() {
    // 检查并发限制
    if (this.processingTasks.size >= this.concurrencyLimit) {
      return null;
    }

    const availableTask = this.queue.find(task => 
      task.status === 'pending' && !this.processingTasks.has(task.id)
    );

    if (availableTask) {
      availableTask.status = 'processing';
      availableTask.startedAt = new Date().toISOString();
      this.processingTasks.add(availableTask.id);
      await this.saveToRedis();
      return availableTask;
    }

    return null;
  }

  /**
   * 完成任务
   * @param {string} taskId - 任务ID
   * @param {any} result - 任务结果
   * @returns {boolean} 是否成功完成
   */
  async completeTask(taskId, result = null) {
    const task = this.taskMap.get(taskId);
    if (!task) {
      return false;
    }

    task.status = 'completed';
    task.completedAt = new Date().toISOString();
    task.result = result;
    this.processingTasks.delete(taskId);
    await this.saveToRedis();
    return true;
  }

  /**
   * 处理失败任务
   * @param {string} taskId - 任务ID
   * @param {any} error - 错误信息
   * @returns {boolean} 是否成功处理
   */
  async failTask(taskId, error = null) {
    const task = this.taskMap.get(taskId);
    if (!task) {
      return false;
    }

    // 初始化重试相关字段
    task.retryCount = task.retryCount || 0;
    task.maxRetries = task.maxRetries || 3;
    task.retryDelay = task.retryDelay || 1000; // 默认1秒

    // 检查是否需要重试
    if (task.retryCount < task.maxRetries) {
      task.retryCount++;
      task.status = 'pending';
      task.lastFailedAt = new Date().toISOString();
      task.error = error;
      
      // 指数退避策略
      const delayMs = task.retryDelay * Math.pow(2, task.retryCount - 1);
      
      // 延迟后重试
      setTimeout(async () => {
        await this.saveToRedis();
      }, delayMs);
    } else {
      task.status = 'failed';
      task.failedAt = new Date().toISOString();
      task.error = error;
    }

    this.processingTasks.delete(taskId);
    await this.saveToRedis();
    return true;
  }

  /**
   * 手动重试任务
   * @param {string} taskId - 任务ID
   * @param {Object} options - 重试选项
   * @returns {boolean} 是否成功重试
   */
  async retryTask(taskId, options = {}) {
    const task = this.taskMap.get(taskId);
    if (!task) {
      return false;
    }

    // 重置重试计数
    task.retryCount = 0;
    task.status = 'pending';
    task.lastRetriedAt = new Date().toISOString();
    
    // 更新重试配置
    if (options.maxRetries) {
      task.maxRetries = options.maxRetries;
    }
    if (options.retryDelay) {
      task.retryDelay = options.retryDelay;
    }

    await this.saveToRedis();
    return true;
  }

  /**
   * 按优先级排序队列
   */
  sortByPriority() {
    this.queue.sort((a, b) => {
      if (a.priority !== b.priority) {
        return b.priority - a.priority;
      }
      return new Date(a.createdAt) - new Date(b.createdAt);
    });
  }

  /**
   * 根据状态获取任务
   * @param {string} status - 任务状态
   * @returns {Array} 任务数组
   */
  getTasksByStatus(status) {
    return this.queue.filter(task => task.status === status);
  }

  /**
   * 根据类型获取任务
   * @param {string} type - 任务类型
   * @returns {Array} 任务数组
   */
  getTasksByType(type) {
    return this.queue.filter(task => task.type === type);
  }

  /**
   * 根据ID获取任务
   * @param {string} taskId - 任务ID
   * @returns {Object|null} 任务对象或null
   */
  getTaskById(taskId) {
    return this.taskMap.get(taskId);
  }

  /**
   * 获取队列大小
   * @returns {number} 队列大小
   */
  getQueueSize() {
    return this.queue.length;
  }

  /**
   * 获取正在处理的任务数量
   * @returns {number} 正在处理的任务数量
   */
  getProcessingCount() {
    return this.processingTasks.size;
  }

  /**
   * 获取队列统计信息
   * @returns {Object} 统计信息
   */
  getStats() {
    const stats = {
      total: this.queue.length,
      pending: this.getTasksByStatus('pending').length,
      processing: this.getTasksByStatus('processing').length,
      completed: this.getTasksByStatus('completed').length,
      failed: this.getTasksByStatus('failed').length,
      paused: this.getTasksByStatus('paused').length,
      processingCount: this.processingTasks.size,
      successRate: this.calculateSuccessRate(),
      avgExecutionTime: this.calculateAvgExecutionTime(),
      retryRate: this.calculateRetryRate(),
      queueAge: this.calculateQueueAge(),
      maxQueueSize: this.maxQueueSize,
      concurrencyLimit: this.concurrencyLimit
    };

    return stats;
  }

  /**
   * 计算成功率
   * @returns {number} 成功率
   */
  calculateSuccessRate() {
    const completed = this.getTasksByStatus('completed').length;
    const failed = this.getTasksByStatus('failed').length;
    const total = completed + failed;
    return total > 0 ? Number(((completed / total) * 100).toFixed(2)) : 0;
  }

  /**
   * 计算平均执行时间
   * @returns {number} 平均执行时间（毫秒）
   */
  calculateAvgExecutionTime() {
    const completedTasks = this.getTasksByStatus('completed');
    if (completedTasks.length === 0) return 0;

    const totalTime = completedTasks.reduce((sum, task) => {
      if (task.startedAt && task.completedAt) {
        const startTime = new Date(task.startedAt).getTime();
        const endTime = new Date(task.completedAt).getTime();
        return sum + (endTime - startTime);
      }
      return sum;
    }, 0);

    return Math.round(totalTime / completedTasks.length);
  }

  /**
   * 计算重试率
   * @returns {number} 重试率
   */
  calculateRetryRate() {
    const tasksWithRetries = this.queue.filter(task => task.retryCount > 0).length;
    return this.queue.length > 0 ? Number(((tasksWithRetries / this.queue.length) * 100).toFixed(2)) : 0;
  }

  /**
   * 计算队列年龄
   * @returns {number} 队列年龄（毫秒）
   */
  calculateQueueAge() {
    if (this.queue.length === 0) return 0;

    const oldestTask = this.queue.reduce((oldest, task) => {
      const taskAge = new Date() - new Date(task.createdAt);
      return taskAge > oldest.age ? { age: taskAge, task } : oldest;
    }, { age: 0, task: null });

    return oldestTask.age;
  }

  /**
   * 获取详细统计信息
   * @returns {Object} 详细统计信息
   */
  getDetailedStats() {
    const stats = this.getStats();
    const taskTypeStats = {};
    const priorityStats = {};

    this.queue.forEach(task => {
      // 按任务类型统计
      if (!taskTypeStats[task.type]) {
        taskTypeStats[task.type] = {
          total: 0,
          completed: 0,
          failed: 0,
          pending: 0,
          processing: 0
        };
      }
      taskTypeStats[task.type].total++;
      taskTypeStats[task.type][task.status] = (taskTypeStats[task.type][task.status] || 0) + 1;

      // 按优先级统计
      const priority = task.priority.toString();
      if (!priorityStats[priority]) {
        priorityStats[priority] = {
          total: 0,
          completed: 0,
          failed: 0,
          pending: 0,
          processing: 0
        };
      }
      priorityStats[priority].total++;
      priorityStats[priority][task.status] = (priorityStats[priority][task.status] || 0) + 1;
    });

    return {
      ...stats,
      byType: taskTypeStats,
      byPriority: priorityStats
    };
  }

  /**
   * 暂停任务
   * @param {string} taskId - 任务ID
   * @returns {boolean} 是否成功暂停
   */
  async pauseTask(taskId) {
    const task = this.taskMap.get(taskId);
    if (!task || task.status !== 'processing') {
      return false;
    }

    task.status = 'paused';
    this.processingTasks.delete(taskId);
    await this.saveToRedis();
    return true;
  }

  /**
   * 恢复任务
   * @param {string} taskId - 任务ID
   * @returns {boolean} 是否成功恢复
   */
  async resumeTask(taskId) {
    const task = this.taskMap.get(taskId);
    if (!task || task.status !== 'paused') {
      return false;
    }

    task.status = 'processing';
    this.processingTasks.add(taskId);
    await this.saveToRedis();
    return true;
  }

  /**
   * 更新任务优先级
   * @param {string} taskId - 任务ID
   * @param {number} newPriority - 新优先级
   * @returns {boolean} 是否成功更新
   */
  async updateTaskPriority(taskId, newPriority) {
    const task = this.taskMap.get(taskId);
    if (!task) {
      return false;
    }

    task.priority = newPriority;
    this.sortByPriority();
    await this.saveToRedis();
    return true;
  }

  /**
   * 清空队列
   */
  async clear() {
    this.queue = [];
    this.taskMap.clear();
    this.processingTasks.clear();
    await this.saveToRedis();
  }

  /**
   * 设置队列大小限制
   * @param {number} maxSize - 最大队列大小
   */
  setMaxQueueSize(maxSize) {
    this.maxQueueSize = maxSize;
  }

  /**
   * 设置并发限制
   * @param {number} limit - 并发限制
   */
  setConcurrencyLimit(limit) {
    this.concurrencyLimit = limit;
  }
}

module.exports = TaskQueue;
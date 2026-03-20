const redis = require('redis');
const { createError, ErrorCodes } = require('./error_handler');

/**
 * 工作流构建器类
 * 负责构建和管理任务工作流，处理依赖关系
 */
class WorkflowBuilder {
  constructor() {
    this.workflows = new Map();
    this.redisClient = redis.createClient({
      url: process.env.REDIS_URL || 'redis://localhost:6379'
    });
    this.redisClient.connect().catch(err => {
      console.error('Redis connection error:', err);
    });
    this.loadFromRedis();
  }

  /**
   * 从Redis加载工作流数据
   */
  async loadFromRedis() {
    try {
      const workflowsData = await this.redisClient.get('workflows');
      if (workflowsData) {
        const workflowsArray = JSON.parse(workflowsData);
        workflowsArray.forEach(workflow => {
          this.workflows.set(workflow.id, workflow);
        });
      }
    } catch (err) {
      console.error('Error loading workflows from Redis:', err);
    }
  }

  /**
   * 保存工作流数据到Redis
   */
  async saveToRedis() {
    try {
      const workflowsArray = Array.from(this.workflows.values());
      await this.redisClient.set('workflows', JSON.stringify(workflowsArray));
    } catch (err) {
      console.error('Error saving workflows to Redis:', err);
    }
  }

  /**
   * 创建工作流
   * @param {string} name - 工作流名称
   * @param {Array} tasks - 任务数组
   * @returns {Object} 工作流对象
   */
  async createWorkflow(name, tasks = []) {
    if (!name || typeof name !== 'string') {
      throw createError(ErrorCodes.INVALID_WORKFLOW_INPUT, 'Workflow name is required');
    }

    const workflow = {
      id: this.generateWorkflowId(),
      name,
      tasks: [],
      status: 'created',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    if (tasks.length > 0) {
      tasks.forEach(task => {
        workflow.tasks.push(task);
      });
    }

    this.workflows.set(workflow.id, workflow);
    await this.saveToRedis();
    return workflow;
  }

  /**
   * 生成工作流ID
   * @returns {string} 工作流ID
   */
  generateWorkflowId() {
    return `workflow_${Date.now()}_${Math.floor(Math.random() * 10000)}`;
  }

  /**
   * 添加任务到工作流
   * @param {string} workflowId - 工作流ID
   * @param {Object} task - 任务对象
   * @returns {string} 任务ID
   */
  async addTaskToWorkflow(workflowId, task) {
    const workflow = this.workflows.get(workflowId);
    if (!workflow) {
      throw createError(ErrorCodes.WORKFLOW_NOT_FOUND, 'Workflow not found');
    }

    if (!task || typeof task !== 'object') {
      throw createError(ErrorCodes.INVALID_TASK_INPUT, 'Invalid task object');
    }

    workflow.tasks.push(task);
    workflow.updatedAt = new Date().toISOString();
    await this.saveToRedis();
    return task.id;
  }

  /**
   * 从工作流中移除任务
   * @param {string} workflowId - 工作流ID
   * @param {string} taskId - 任务ID
   * @returns {boolean} 是否成功移除
   */
  async removeTaskFromWorkflow(workflowId, taskId) {
    const workflow = this.workflows.get(workflowId);
    if (!workflow) {
      return false;
    }

    const index = workflow.tasks.findIndex(task => task.id === taskId);
    if (index === -1) {
      return false;
    }

    workflow.tasks.splice(index, 1);
    workflow.updatedAt = new Date().toISOString();
    await this.saveToRedis();
    return true;
  }

  /**
   * 构建依赖图
   * @param {string} workflowId - 工作流ID
   * @returns {Object} 依赖图
   */
  buildDependencyGraph(workflowId) {
    const workflow = this.workflows.get(workflowId);
    if (!workflow) {
      throw createError(ErrorCodes.WORKFLOW_NOT_FOUND, 'Workflow not found');
    }

    const graph = {
      nodes: [],
      edges: []
    };

    workflow.tasks.forEach(task => {
      graph.nodes.push({
        id: task.id,
        label: task.title,
        type: task.type,
        priority: task.priority,
        status: task.status
      });

      if (task.dependencies && task.dependencies.length > 0) {
        task.dependencies.forEach(depId => {
          graph.edges.push({
            source: depId,
            target: task.id
          });
        });
      }
    });

    return graph;
  }

  /**
   * 验证工作流
   * @param {string} workflowId - 工作流ID
   * @returns {boolean} 是否验证通过
   */
  async validateWorkflow(workflowId) {
    const workflow = this.workflows.get(workflowId);
    if (!workflow) {
      throw createError(ErrorCodes.WORKFLOW_NOT_FOUND, 'Workflow not found');
    }

    const taskIds = new Set(workflow.tasks.map(task => task.id));
    const validationErrors = [];

    // 验证依赖关系
    workflow.tasks.forEach(task => {
      if (task.dependencies) {
        task.dependencies.forEach(depId => {
          if (!taskIds.has(depId)) {
            validationErrors.push(`Task ${task.id} has invalid dependency ${depId}`);
          }
        });
      }
    });

    // 检测循环依赖
    const hasCycle = this.detectCycle(workflow.tasks);
    if (hasCycle) {
      validationErrors.push('Workflow contains circular dependencies');
    }

    if (validationErrors.length > 0) {
      throw createError(ErrorCodes.WORKFLOW_VALIDATION_FAILED, `Workflow validation failed: ${validationErrors.join(', ')}`);
    }

    return true;
  }

  /**
   * 检测循环依赖
   * @param {Array} tasks - 任务数组
   * @returns {boolean} 是否存在循环依赖
   */
  detectCycle(tasks) {
    const taskMap = new Map();
    tasks.forEach(task => taskMap.set(task.id, task));

    const visited = new Set();
    const recStack = new Set();

    const hasCycleUtil = (taskId) => {
      if (!visited.has(taskId)) {
        visited.add(taskId);
        recStack.add(taskId);

        const task = taskMap.get(taskId);
        if (task && task.dependencies) {
          for (const depId of task.dependencies) {
            if (!visited.has(depId) && hasCycleUtil(depId)) {
              return true;
            } else if (recStack.has(depId)) {
              return true;
            }
          }
        }
      }
      recStack.delete(taskId);
      return false;
    };

    for (const task of tasks) {
      if (hasCycleUtil(task.id)) {
        return true;
      }
    }

    return false;
  }

  /**
   * 根据ID获取工作流
   * @param {string} workflowId - 工作流ID
   * @returns {Object|null} 工作流对象或null
   */
  getWorkflowById(workflowId) {
    return this.workflows.get(workflowId);
  }

  /**
   * 获取所有工作流
   * @returns {Array} 工作流数组
   */
  getWorkflows() {
    return Array.from(this.workflows.values());
  }

  /**
   * 更新工作流状态
   * @param {string} workflowId - 工作流ID
   * @param {string} status - 新状态
   * @returns {boolean} 是否成功更新
   */
  async updateWorkflowStatus(workflowId, status) {
    const workflow = this.workflows.get(workflowId);
    if (!workflow) {
      return false;
    }

    workflow.status = status;
    workflow.updatedAt = new Date().toISOString();
    await this.saveToRedis();
    return true;
  }

  /**
   * 计算工作流进度
   * @param {string} workflowId - 工作流ID
   * @returns {number} 进度百分比
   */
  calculateWorkflowProgress(workflowId) {
    const workflow = this.workflows.get(workflowId);
    if (!workflow) {
      throw createError(ErrorCodes.WORKFLOW_NOT_FOUND, 'Workflow not found');
    }

    if (workflow.tasks.length === 0) {
      return 0;
    }

    const completedTasks = workflow.tasks.filter(task => task.status === 'completed').length;
    return Math.round((completedTasks / workflow.tasks.length) * 100);
  }

  /**
   * 获取下一个可执行的任务
   * @param {string} workflowId - 工作流ID
   * @returns {Array} 可执行任务数组
   */
  getNextTasks(workflowId) {
    const workflow = this.workflows.get(workflowId);
    if (!workflow) {
      throw createError(ErrorCodes.WORKFLOW_NOT_FOUND, 'Workflow not found');
    }

    const completedTaskIds = new Set(
      workflow.tasks.filter(task => task.status === 'completed').map(task => task.id)
    );

    return workflow.tasks.filter(task => {
      if (task.status !== 'pending') {
        return false;
      }

      if (!task.dependencies || task.dependencies.length === 0) {
        return true;
      }

      return task.dependencies.every(depId => completedTaskIds.has(depId));
    });
  }

  /**
   * 执行工作流
   * @param {string} workflowId - 工作流ID
   * @returns {Object} 工作流对象
   */
  async executeWorkflow(workflowId) {
    const workflow = this.workflows.get(workflowId);
    if (!workflow) {
      throw createError(ErrorCodes.WORKFLOW_NOT_FOUND, 'Workflow not found');
    }

    await this.validateWorkflow(workflowId);
    workflow.status = 'running';
    workflow.updatedAt = new Date().toISOString();
    workflow.startedAt = new Date().toISOString();
    await this.saveToRedis();

    return workflow;
  }

  /**
   * 完成工作流
   * @param {string} workflowId - 工作流ID
   * @returns {boolean} 是否成功完成
   */
  async completeWorkflow(workflowId) {
    const workflow = this.workflows.get(workflowId);
    if (!workflow) {
      return false;
    }

    const allCompleted = workflow.tasks.every(task => task.status === 'completed');
    if (!allCompleted) {
      return false;
    }

    workflow.status = 'completed';
    workflow.updatedAt = new Date().toISOString();
    workflow.completedAt = new Date().toISOString();
    await this.saveToRedis();
    return true;
  }

  /**
   * 取消工作流
   * @param {string} workflowId - 工作流ID
   * @returns {boolean} 是否成功取消
   */
  async cancelWorkflow(workflowId) {
    const workflow = this.workflows.get(workflowId);
    if (!workflow) {
      return false;
    }

    workflow.status = 'cancelled';
    workflow.updatedAt = new Date().toISOString();
    workflow.cancelledAt = new Date().toISOString();
    await this.saveToRedis();
    return true;
  }

  /**
   * 删除工作流
   * @param {string} workflowId - 工作流ID
   * @returns {boolean} 是否成功删除
   */
  async deleteWorkflow(workflowId) {
    const result = this.workflows.delete(workflowId);
    await this.saveToRedis();
    return result;
  }

  /**
   * 导出工作流
   * @param {string} workflowId - 工作流ID
   * @returns {string} 工作流JSON字符串
   */
  exportWorkflow(workflowId) {
    const workflow = this.workflows.get(workflowId);
    if (!workflow) {
      throw createError(ErrorCodes.WORKFLOW_NOT_FOUND, 'Workflow not found');
    }

    return JSON.stringify(workflow, null, 2);
  }

  /**
   * 导入工作流
   * @param {string|Object} workflowData - 工作流数据
   * @returns {Object} 导入的工作流对象
   */
  async importWorkflow(workflowData) {
    let workflow;
    try {
      workflow = typeof workflowData === 'string' ? JSON.parse(workflowData) : workflowData;
    } catch (error) {
      throw createError(ErrorCodes.INVALID_WORKFLOW_INPUT, 'Invalid workflow data');
    }

    if (!workflow.name || !Array.isArray(workflow.tasks)) {
      throw createError(ErrorCodes.INVALID_WORKFLOW_INPUT, 'Invalid workflow structure');
    }

    const newWorkflow = await this.createWorkflow(workflow.name, workflow.tasks);
    return newWorkflow;
  }

  /**
   * 获取工作流统计信息
   * @param {string} workflowId - 工作流ID
   * @returns {Object} 统计信息
   */
  getWorkflowStats(workflowId) {
    const workflow = this.workflows.get(workflowId);
    if (!workflow) {
      throw createError(ErrorCodes.WORKFLOW_NOT_FOUND, 'Workflow not found');
    }

    const stats = {
      totalTasks: workflow.tasks.length,
      completedTasks: workflow.tasks.filter(task => task.status === 'completed').length,
      pendingTasks: workflow.tasks.filter(task => task.status === 'pending').length,
      processingTasks: workflow.tasks.filter(task => task.status === 'processing').length,
      failedTasks: workflow.tasks.filter(task => task.status === 'failed').length,
      progress: this.calculateWorkflowProgress(workflowId),
      status: workflow.status,
      createdAt: workflow.createdAt,
      updatedAt: workflow.updatedAt,
      startedAt: workflow.startedAt,
      completedAt: workflow.completedAt,
      cancelledAt: workflow.cancelledAt
    };

    return stats;
  }
}

module.exports = WorkflowBuilder;
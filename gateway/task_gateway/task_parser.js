const { createError, ErrorCodes } = require('./error_handler');

/**
 * 任务解析器类
 * 负责解析任务请求、识别任务类型、计算优先级、拆解子任务
 */
class TaskParser {
  constructor() {
    this.taskTypes = {
      ANALYSIS: 'analysis',
      DEVELOPMENT: 'development',
      TESTING: 'testing',
      DEPLOYMENT: 'deployment',
      DOCUMENTATION: 'documentation'
    };

    // 任务类型识别规则
    this.typeRules = [
      { type: this.taskTypes.ANALYSIS, keywords: ['分析', 'analyze', 'analysis'] },
      { type: this.taskTypes.DEVELOPMENT, keywords: ['开发', 'develop', 'development', '实现', 'implement'] },
      { type: this.taskTypes.TESTING, keywords: ['测试', 'test', 'testing'] },
      { type: this.taskTypes.DEPLOYMENT, keywords: ['部署', 'deploy', 'deployment'] },
      { type: this.taskTypes.DOCUMENTATION, keywords: ['文档', 'document', 'documentation'] }
    ];

    // 任务模板
    this.taskTemplates = {
      [this.taskTypes.DEVELOPMENT]: [
        { title: '需求分析', priority: 'medium' },
        { title: '代码实现', priority: 'high' },
        { title: '测试验证', priority: 'medium' }
      ],
      [this.taskTypes.TESTING]: [
        { title: '编写测试用例', priority: 'medium' },
        { title: '执行测试', priority: 'high' },
        { title: '生成测试报告', priority: 'medium' }
      ],
      [this.taskTypes.DEPLOYMENT]: [
        { title: '部署准备', priority: 'medium' },
        { title: '执行部署', priority: 'high' },
        { title: '验证部署', priority: 'medium' }
      ],
      [this.taskTypes.DOCUMENTATION]: [
        { title: '文档规划', priority: 'low' },
        { title: '编写文档', priority: 'medium' },
        { title: '审核文档', priority: 'low' }
      ]
    };
  }

  /**
   * 解析单个任务
   * @param {Object} taskInput - 任务输入对象
   * @returns {Object} 解析后的任务对象
   */
  parseTask(taskInput) {
    if (!taskInput || typeof taskInput !== 'object') {
      throw createError(ErrorCodes.INVALID_TASK_INPUT, 'Invalid task input');
    }

    const task = {
      id: taskInput.id || this.generateTaskId(),
      title: taskInput.title || '',
      description: taskInput.description || '',
      type: this.determineTaskType(taskInput),
      priority: this.calculatePriority(taskInput),
      deadline: taskInput.deadline,
      dependencies: taskInput.dependencies || [],
      subtasks: this.decomposeTask(taskInput),
      createdAt: new Date().toISOString(),
      status: 'pending'
    };

    this.validateTask(task);
    return task;
  }

  /**
   * 生成任务ID
   * @returns {string} 任务ID
   */
  generateTaskId() {
    return `task_${Date.now()}_${Math.floor(Math.random() * 10000)}`;
  }

  /**
   * 确定任务类型
   * @param {Object} taskInput - 任务输入对象
   * @returns {string} 任务类型
   */
  determineTaskType(taskInput) {
    const text = (taskInput.description || taskInput.title || '').toLowerCase();
    
    for (const rule of this.typeRules) {
      if (rule.keywords.some(keyword => text.includes(keyword.toLowerCase()))) {
        return rule.type;
      }
    }
    
    return this.taskTypes.DEVELOPMENT;
  }

  /**
   * 计算任务优先级
   * @param {Object} taskInput - 任务输入对象
   * @returns {number} 优先级（1-3）
   */
  calculatePriority(taskInput) {
    // 如果明确指定了优先级，直接返回
    if (taskInput.priority) {
      const priorityMap = { high: 3, medium: 2, low: 1 };
      return priorityMap[taskInput.priority.toLowerCase()] || 2;
    }

    let priorityScore = 0;

    // 根据截止时间计算优先级
    if (taskInput.deadline) {
      const deadline = new Date(taskInput.deadline);
      const now = new Date();
      const daysUntilDeadline = Math.ceil((deadline - now) / (1000 * 60 * 60 * 24));
      
      if (daysUntilDeadline <= 0) priorityScore += 3; // 已过期
      else if (daysUntilDeadline === 1) priorityScore += 3;
      else if (daysUntilDeadline <= 3) priorityScore += 2;
      else if (daysUntilDeadline <= 7) priorityScore += 1;
    }

    // 有依赖的任务优先级更高
    if (taskInput.dependencies && taskInput.dependencies.length > 0) {
      priorityScore += 1;
    }

    // 确保优先级在1-3之间
    return Math.min(3, Math.max(1, priorityScore));
  }

  /**
   * 拆解任务为子任务
   * @param {Object} taskInput - 任务输入对象
   * @returns {Array} 子任务数组
   */
  decomposeTask(taskInput) {
    const taskType = this.determineTaskType(taskInput);
    const templates = this.taskTemplates[taskType] || [];
    
    return templates.map(template => ({
      id: this.generateTaskId(),
      title: template.title,
      status: 'pending',
      priority: taskInput.priority || template.priority,
      parentId: taskInput.id
    }));
  }

  /**
   * 验证任务
   * @param {Object} task - 任务对象
   */
  validateTask(task) {
    if (!task.title || task.title.trim() === '') {
      throw createError(ErrorCodes.INVALID_TASK_INPUT, 'Task title is required');
    }

    if (task.deadline) {
      const deadline = new Date(task.deadline);
      if (isNaN(deadline.getTime())) {
        throw createError(ErrorCodes.INVALID_TASK_INPUT, 'Invalid deadline format');
      }
    }

    if (task.dependencies && !Array.isArray(task.dependencies)) {
      throw createError(ErrorCodes.INVALID_TASK_INPUT, 'Dependencies must be an array');
    }

    if (task.subtasks && !Array.isArray(task.subtasks)) {
      throw createError(ErrorCodes.INVALID_TASK_INPUT, 'Subtasks must be an array');
    }
  }

  /**
   * 批量解析任务
   * @param {Array} tasks - 任务数组
   * @returns {Array} 解析后的任务数组
   */
  parseBatch(tasks) {
    if (!Array.isArray(tasks)) {
      throw createError(ErrorCodes.INVALID_TASK_INPUT, 'Input must be an array of tasks');
    }

    return tasks.map(task => this.parseTask(task));
  }

  /**
   * 添加自定义任务模板
   * @param {string} taskType - 任务类型
   * @param {Array} template - 模板数组
   */
  addTaskTemplate(taskType, template) {
    if (!this.taskTypes[taskType.toUpperCase()]) {
      throw createError(ErrorCodes.INVALID_TASK_INPUT, `Invalid task type: ${taskType}`);
    }

    if (!Array.isArray(template)) {
      throw createError(ErrorCodes.INVALID_TASK_INPUT, 'Template must be an array');
    }

    this.taskTemplates[taskType] = template;
  }
}

module.exports = TaskParser;
/**
 * Assistant Agent - 全球超级个人助理天才
 * 使命：帮助用户管理时间、任务和日程，让用户专注于最重要的事情
 * 职责：日程提醒、任务管理、计划安排、会议记录、信息整理
 */
const fs = require('fs');
const path = require('path');
const logger = require('./logger');

class AssistantAgent {
  /**
   * 构造函数
   * @param {Object} options - 配置选项
   * @param {string} options.logLevel - 日志级别
   * @param {string} options.dataDir - 数据存储目录
   */
  constructor(options = {}) {
    this.role = '全球超级个人助理天才';
    this.mission = '帮助用户管理时间、任务和日程，让用户专注于最重要的事情';
    this.responsibilities = ['日程提醒', '任务管理', '计划安排', '会议记录', '信息整理'];
    this.dataDir = options.dataDir || path.join(__dirname, 'data');
    this.options = options;
    this.plugins = [];
    
    this.taskPriorities = ['低', '中', '高'];
    this.taskStatuses = ['待办', '进行中', '已完成'];
    this.scheduleStatuses = ['确认', '暂定', '取消'];
    this.reminderImportance = ['普通', '重要', '紧急'];
    
    if (!fs.existsSync(this.dataDir)) {
      try {
        fs.mkdirSync(this.dataDir, { recursive: true });
        logger.info('Data directory created successfully', { dataDir: this.dataDir });
      } catch (error) {
        logger.error('Error creating data directory', { error: error.message });
      }
    }
    
    this.loadData();
  }

  /**
   * 注册插件
   * @param {Object} plugin - 插件对象
   */
  registerPlugin(plugin) {
    if (plugin && typeof plugin === 'object') {
      this.plugins.push(plugin);
      logger.info('Plugin registered successfully', {
        plugin: plugin.name || 'unknown',
      });
    }
  }

  /**
   * 执行插件的预处理
   * @param {string} request - 用户请求
   * @returns {string} - 处理后的请求
   */
  preProcessRequest(request) {
    this.plugins.forEach((plugin) => {
      if (plugin.preProcess) {
        try {
          request = plugin.preProcess(request);
        } catch (error) {
          logger.error('Error in plugin preProcess', { 
            plugin: plugin.name || 'unknown',
            error: error.message 
          });
        }
      }
    });
    return request;
  }

  /**
   * 执行插件的后处理
   * @param {string} response - 响应内容
   * @returns {string} - 处理后的响应
   */
  postProcessResponse(response) {
    this.plugins.forEach((plugin) => {
      if (plugin.postProcess) {
        try {
          response = plugin.postProcess(response);
        } catch (error) {
          logger.error('Error in plugin postProcess', { 
            plugin: plugin.name || 'unknown',
            error: error.message 
          });
        }
      }
    });
    return response;
  }

  /**
   * 加载数据
   */
  loadData() {
    try {
      const tasksFile = path.join(this.dataDir, 'tasks.json');
      const scheduleFile = path.join(this.dataDir, 'schedule.json');
      const remindersFile = path.join(this.dataDir, 'reminders.json');
      const meetingsFile = path.join(this.dataDir, 'meetings.json');
      
      this.tasks = fs.existsSync(tasksFile) ? JSON.parse(fs.readFileSync(tasksFile, 'utf8')) : [];
      this.schedule = fs.existsSync(scheduleFile) ? JSON.parse(fs.readFileSync(scheduleFile, 'utf8')) : [];
      this.reminders = fs.existsSync(remindersFile) ? JSON.parse(fs.readFileSync(remindersFile, 'utf8')) : [];
      this.meetings = fs.existsSync(meetingsFile) ? JSON.parse(fs.readFileSync(meetingsFile, 'utf8')) : [];
      
      logger.info('Data loaded successfully');
    } catch (error) {
      logger.error('Error loading data', { error: error.message });
      this.tasks = [];
      this.schedule = [];
      this.reminders = [];
      this.meetings = [];
    }
  }

  /**
   * 保存数据
   */
  saveData() {
    try {
      const tasksFile = path.join(this.dataDir, 'tasks.json');
      const scheduleFile = path.join(this.dataDir, 'schedule.json');
      const remindersFile = path.join(this.dataDir, 'reminders.json');
      const meetingsFile = path.join(this.dataDir, 'meetings.json');
      
      fs.writeFileSync(tasksFile, JSON.stringify(this.tasks, null, 2));
      fs.writeFileSync(scheduleFile, JSON.stringify(this.schedule, null, 2));
      fs.writeFileSync(remindersFile, JSON.stringify(this.reminders, null, 2));
      fs.writeFileSync(meetingsFile, JSON.stringify(this.meetings, null, 2));
      
      logger.info('Data saved successfully');
    } catch (error) {
      logger.error('Error saving data', { error: error.message });
    }
  }

  /**
   * 处理用户请求
   * @param {string} request - 用户请求
   * @returns {string} - 处理结果
   */
  processRequest(request) {
    const startTime = Date.now();
    try {
      if (!request || typeof request !== 'string') {
        logger.warn('Invalid request type', { type: typeof request });
        return '请提供有效的请求内容';
      }
      
      const processedRequest = this.preProcessRequest(request);
      const originalRequest = processedRequest;
      const lowerCaseRequest = processedRequest.toLowerCase();
      
      logger.info('Processing request', { request: originalRequest });
      
      let response;
      if (lowerCaseRequest.includes('添加任务')) {
        response = this.addTask(originalRequest);
      } else if (lowerCaseRequest.includes('添加日程')) {
        response = this.addSchedule(originalRequest);
      } else if (lowerCaseRequest.includes('添加提醒')) {
        response = this.addReminder(originalRequest);
      } else if (lowerCaseRequest.includes('添加会议')) {
        response = this.addMeeting(originalRequest);
      } else if (lowerCaseRequest.includes('更新任务')) {
        response = this.updateTask(originalRequest);
      } else if (lowerCaseRequest.includes('完成任务')) {
        response = this.completeTask(originalRequest);
      } else if (lowerCaseRequest.includes('搜索')) {
        response = this.search(originalRequest);
      } else if (lowerCaseRequest.includes('统计') || lowerCaseRequest.includes('分析')) {
        response = this.getStatistics();
      } else if (lowerCaseRequest.includes('日程')) {
        response = this.getSchedule();
      } else if (lowerCaseRequest.includes('任务') || lowerCaseRequest.includes('待办')) {
        response = this.getTasks();
      } else if (lowerCaseRequest.includes('提醒')) {
        response = this.getReminders();
      } else if (lowerCaseRequest.includes('计划') || lowerCaseRequest.includes('建议')) {
        response = this.getPlanSuggestions();
      } else if (lowerCaseRequest.includes('会议')) {
        response = this.processMeetingRequest(originalRequest);
      } else {
        response = this.getGeneralResponse();
      }
      
      const finalResponse = this.postProcessResponse(response);
      
      const endTime = Date.now();
      logger.info('Request processed successfully', { duration: endTime - startTime });
      return finalResponse;
    } catch (error) {
      const endTime = Date.now();
      logger.error('Error processing request', { 
        error: error.message, 
        stack: error.stack,
        duration: endTime - startTime 
      });
      return '处理请求时发生错误，请稍后再试';
    }
  }

  /**
   * 解析参数
   * @param {string} request - 用户请求
   * @param {Array} params - 参数列表
   * @returns {Object} - 解析后的参数
   */
  parseParams(request, params) {
    const result = {};
    let currentRequest = request;
    
    params.forEach(param => {
      const paramIndex = currentRequest.toLowerCase().indexOf(param.toLowerCase() + '：');
      if (paramIndex === -1) {
        const paramIndex2 = currentRequest.toLowerCase().indexOf(param.toLowerCase() + ':');
        if (paramIndex2 === -1) {
          return;
        }
      }
      
      const paramStartIndex = currentRequest.toLowerCase().indexOf(param.toLowerCase());
      if (paramStartIndex === -1) return;
      
      const colonIndex = currentRequest.indexOf(':', paramStartIndex);
      const colonIndex2 = currentRequest.indexOf('：', paramStartIndex);
      const actualColonIndex = colonIndex !== -1 ? colonIndex : colonIndex2;
      if (actualColonIndex === -1) return;
      
      let valueStartIndex = actualColonIndex + 1;
      while (valueStartIndex < currentRequest.length && /\s/.test(currentRequest[valueStartIndex])) {
        valueStartIndex++;
      }
      
      // 找到下一个参数的开始位置
      let valueEndIndex = currentRequest.length;
      for (const otherParam of params) {
        if (otherParam === param) continue;
        const otherParamIndex = currentRequest.toLowerCase().indexOf(otherParam.toLowerCase(), valueStartIndex);
        if (otherParamIndex !== -1 && otherParamIndex < valueEndIndex) {
          valueEndIndex = otherParamIndex;
        }
      }
      
      const value = currentRequest.substring(valueStartIndex, valueEndIndex).trim();
      if (value) {
        result[param] = value;
      }
    });
    
    return result;
  }

  /**
   * 添加任务
   * @param {string} request - 添加任务请求
   * @returns {string} - 添加结果
   */
  addTask(request) {
    try {
      const taskContent = request.replace('添加任务', '').trim();
      if (!taskContent) {
        logger.warn('Empty task content provided');
        return '请提供任务内容\n使用格式：添加任务 标题 [优先级:高|中|低] [截止:YYYY-MM-DD] [标签:标签1,标签2] [描述:任务描述]';
      }
      
      const params = this.parseParams(taskContent, ['优先级', '截止', '标签', '描述']);
      let title = taskContent;
      // 移除所有参数部分
      ['优先级', '截止', '标签', '描述'].forEach(param => {
        if (params[param]) {
          const regex = new RegExp(`${param}[:：]\s*${params[param]}`, 'i');
          title = title.replace(regex, '').trim();
        }
      });
      
      if (!title) {
        return '请提供任务标题\n';
      }
      
      const priority = params['优先级'] && this.taskPriorities.includes(params['优先级']) ? params['优先级'] : '中';
      const dueDate = params['截止'] || '';
      const tags = params['标签'] ? params['标签'].split(/[,，]/).map(t => t.trim()).filter(t => t) : [];
      const description = params['描述'] || '';
      
      const newTask = {
        id: Date.now(),
        title: title,
        description: description,
        priority: priority,
        status: '待办',
        dueDate: dueDate,
        tags: tags,
        completed: false,
        createdAt: new Date().toISOString().split('T')[0]
      };
      
      this.tasks.push(newTask);
      this.saveData();
      logger.info('Task added successfully', { task: newTask });
      
      let response = `任务已添加: ${title}\n`;
      response += `  优先级: ${priority}\n`;
      if (dueDate) response += `  截止日期: ${dueDate}\n`;
      if (tags.length > 0) response += `  标签: ${tags.join(', ')}\n`;
      if (description) response += `  描述: ${description}\n`;
      
      return response;
    } catch (error) {
      logger.error('Error adding task', { error: error.message });
      return '添加任务时发生错误，请稍后再试\n';
    }
  }

  /**
   * 更新任务
   * @param {string} request - 更新任务请求
   * @returns {string} - 更新结果
   */
  updateTask(request) {
    try {
      const taskContent = request.replace('更新任务', '').trim();
      if (!taskContent) {
        return '请提供任务ID和要更新的内容\n使用格式：更新任务 ID [标题:新标题] [优先级:高|中|低] [截止:YYYY-MM-DD] [状态:待办|进行中|已完成]';
      }
      
      const idMatch = taskContent.match(/^\s*(\d+)/);
      if (!idMatch) {
        return '请提供任务ID\n';
      }
      
      const taskId = parseInt(idMatch[1]);
      const taskIndex = this.tasks.findIndex(t => t.id === taskId);
      
      if (taskIndex === -1) {
        return `未找到ID为 ${taskId} 的任务\n`;
      }
      
      const params = this.parseParams(taskContent, ['标题', '优先级', '截止', '状态', '标签', '描述']);
      
      if (params['标题']) this.tasks[taskIndex].title = params['标题'];
      if (params['优先级'] && this.taskPriorities.includes(params['优先级'])) {
        this.tasks[taskIndex].priority = params['优先级'];
      }
      if (params['截止']) this.tasks[taskIndex].dueDate = params['截止'];
      if (params['状态'] && this.taskStatuses.includes(params['状态'])) {
        this.tasks[taskIndex].status = params['状态'];
        this.tasks[taskIndex].completed = params['状态'] === '已完成';
      }
      if (params['标签']) {
        this.tasks[taskIndex].tags = params['标签'].split(/[,，]/).map(t => t.trim()).filter(t => t);
      }
      if (params['描述']) {
        this.tasks[taskIndex].description = params['描述'];
      }
      
      this.saveData();
      logger.info('Task updated successfully', { taskId: taskId });
      return `任务 ${taskId} 已更新\n`;
    } catch (error) {
      logger.error('Error updating task', { error: error.message });
      return '更新任务时发生错误，请稍后再试\n';
    }
  }

  /**
   * 完成任务
   * @param {string} request - 完成任务请求
   * @returns {string} - 完成结果
   */
  completeTask(request) {
    try {
      const taskContent = request.replace('完成任务', '').trim();
      if (!taskContent) {
        return '请提供任务ID\n使用格式：完成任务 ID';
      }
      
      const idMatch = taskContent.match(/^\s*(\d+)/);
      if (!idMatch) {
        return '请提供有效的任务ID\n';
      }
      
      const taskId = parseInt(idMatch[1]);
      const taskIndex = this.tasks.findIndex(t => t.id === taskId);
      
      if (taskIndex === -1) {
        return `未找到ID为 ${taskId} 的任务\n`;
      }
      
      this.tasks[taskIndex].status = '已完成';
      this.tasks[taskIndex].completed = true;
      this.tasks[taskIndex].completedAt = new Date().toISOString().split('T')[0];
      
      this.saveData();
      logger.info('Task completed successfully', { taskId: taskId });
      return `任务 ${taskId} 已标记为完成\n`;
    } catch (error) {
      logger.error('Error completing task', { error: error.message });
      return '完成任务时发生错误，请稍后再试\n';
    }
  }

  /**
   * 获取待办事项
   * @returns {string} - 待办事项
   */
  getTasks() {
    const pendingTasks = this.tasks.filter(task => task.status !== '已完成');
    pendingTasks.sort((a, b) => {
      const priorityOrder = { '高': 0, '中': 1, '低': 2 };
      return priorityOrder[a.priority || '中'] - priorityOrder[b.priority || '中'];
    });
    
    let response = '【待办事项】\n';
    if (pendingTasks.length === 0) {
      response += '暂无待办事项\n';
    } else {
      pendingTasks.forEach((task, index) => {
        const priorityTag = `[${task.priority || '中'}]`;
        const statusTag = `[${task.status || '待办'}]`;
        response += `${index + 1}. ${statusTag}${priorityTag} ${task.title} (ID: ${task.id})\n`;
        if (task.description) {
          response += `     描述: ${task.description}\n`;
        }
        if (task.dueDate) {
          response += `     截止: ${task.dueDate}\n`;
        }
        if (task.tags && task.tags.length > 0) {
          response += `     标签: ${task.tags.join(', ')}\n`;
        }
      });
    }
    
    return response;
  }

  /**
   * 添加日程
   * @param {string} request - 添加日程请求
   * @returns {string} - 添加结果
   */
  addSchedule(request) {
    try {
      const scheduleContent = request.replace('添加日程', '').trim();
      if (!scheduleContent) {
        return '请提供日程内容\n使用格式：添加日程 标题 [时间:HH:MM] [日期:YYYY-MM-DD] [地点:地点] [参与者:参与者1,参与者2] [描述:描述] [状态:确认|暂定|取消]';
      }
      
      const params = this.parseParams(scheduleContent, ['时间', '日期', '地点', '参与者', '描述', '状态']);
      let title = scheduleContent;
      // 移除所有参数部分
      ['时间', '日期', '地点', '参与者', '描述', '状态'].forEach(param => {
        if (params[param]) {
          const regex = new RegExp(`${param}[:：]\s*${params[param]}`, 'i');
          title = title.replace(regex, '').trim();
        }
      });
      
      if (!title) {
        return '请提供日程标题\n';
      }
      
      const date = params['日期'] || new Date().toISOString().split('T')[0];
      const time = params['时间'] || '09:00';
      const location = params['地点'] || '';
      const attendees = params['参与者'] ? params['参与者'].split(/[,，]/).map(a => a.trim()).filter(a => a) : [];
      const description = params['描述'] || '';
      const status = params['状态'] && this.scheduleStatuses.includes(params['状态']) ? params['状态'] : '确认';
      
      const newSchedule = {
        id: Date.now(),
        title: title,
        date: date,
        time: time,
        location: location,
        attendees: attendees,
        description: description,
        status: status,
        createdAt: new Date().toISOString().split('T')[0]
      };
      
      this.schedule.push(newSchedule);
      this.saveData();
      logger.info('Schedule added successfully', { schedule: newSchedule });
      
      let response = `日程已添加: ${title}\n`;
      response += `  时间: ${date} ${time}\n`;
      response += `  状态: ${status}\n`;
      if (location) response += `  地点: ${location}\n`;
      if (attendees.length > 0) response += `  参与者: ${attendees.join(', ')}\n`;
      if (description) response += `  描述: ${description}\n`;
      
      return response;
    } catch (error) {
      logger.error('Error adding schedule', { error: error.message });
      return '添加日程时发生错误，请稍后再试\n';
    }
  }

  /**
   * 获取今日日程
   * @returns {string} - 今日日程
   */
  getSchedule() {
    const today = new Date().toISOString().split('T')[0];
    const todaySchedule = this.schedule.filter(item => item.date === today && item.status !== '取消');
    todaySchedule.sort((a, b) => a.time.localeCompare(b.time));
    
    let response = '【今日日程】\n';
    if (todaySchedule.length === 0) {
      response += '今日暂无日程安排\n';
    } else {
      todaySchedule.forEach(item => {
        const statusTag = item.status === '暂定' ? '[暂定]' : '';
        response += `${item.time} ${statusTag} - ${item.title} (ID: ${item.id})\n`;
        if (item.location) response += `     地点: ${item.location}\n`;
        if (item.description) response += `     描述: ${item.description}\n`;
        if (item.attendees && item.attendees.length > 0) {
          response += `     参与者: ${item.attendees.join(', ')}\n`;
        }
      });
    }
    
    return response;
  }

  /**
   * 添加提醒
   * @param {string} request - 添加提醒请求
   * @returns {string} - 添加结果
   */
  addReminder(request) {
    try {
      const reminderContent = request.replace('添加提醒', '').trim();
      if (!reminderContent) {
        return '请提供提醒内容\n使用格式：添加提醒 标题 [时间:HH:MM] [日期:YYYY-MM-DD] [重要性:普通|重要|紧急]';
      }
      
      const params = this.parseParams(reminderContent, ['时间', '日期', '重要性']);
      let title = reminderContent;
      // 移除所有参数部分
      ['时间', '日期', '重要性'].forEach(param => {
        if (params[param]) {
          const regex = new RegExp(`${param}[:：]\s*${params[param]}`, 'i');
          title = title.replace(regex, '').trim();
        }
      });
      
      if (!title) {
        return '请提供提醒标题\n';
      }
      
      const date = params['日期'] || new Date().toISOString().split('T')[0];
      const time = params['时间'] || '09:00';
      const importance = params['重要性'] && this.reminderImportance.includes(params['重要性']) ? params['重要性'] : '普通';
      
      const newReminder = {
        id: Date.now(),
        title: title,
        date: date,
        time: time,
        importance: importance,
        confirmed: false,
        createdAt: new Date().toISOString().split('T')[0]
      };
      
      this.reminders.push(newReminder);
      this.saveData();
      logger.info('Reminder added successfully', { reminder: newReminder });
      
      let response = `提醒已添加: ${title}\n`;
      response += `  时间: ${date} ${time}\n`;
      response += `  重要性: ${importance}\n`;
      
      return response;
    } catch (error) {
      logger.error('Error adding reminder', { error: error.message });
      return '添加提醒时发生错误，请稍后再试\n';
    }
  }

  /**
   * 获取重要提醒
   * @returns {string} - 重要提醒
   */
  getReminders() {
    const today = new Date().toISOString().split('T')[0];
    const upcomingReminders = this.reminders.filter(reminder => reminder.date >= today);
    upcomingReminders.sort((a, b) => {
      const importanceOrder = { '紧急': 0, '重要': 1, '普通': 2 };
      if (a.date !== b.date) return a.date.localeCompare(b.date);
      if (a.time !== b.time) return a.time.localeCompare(b.time);
      return importanceOrder[a.importance || '普通'] - importanceOrder[b.importance || '普通'];
    });
    
    let response = '【重要提醒】\n';
    if (upcomingReminders.length === 0) {
      response += '暂无重要提醒\n';
    } else {
      upcomingReminders.forEach(reminder => {
        const importanceTag = `[${reminder.importance || '普通'}]`;
        const confirmedTag = reminder.confirmed ? '[已确认]' : '';
        response += `${reminder.date} ${reminder.time} ${importanceTag}${confirmedTag} - ${reminder.title} (ID: ${reminder.id})\n`;
      });
    }
    
    return response;
  }

  /**
   * 添加会议
   * @param {string} request - 添加会议请求
   * @returns {string} - 添加结果
   */
  addMeeting(request) {
    try {
      const meetingContent = request.replace('添加会议', '').trim();
      if (!meetingContent) {
        return '请提供会议内容\n使用格式：添加会议 标题 [时间:HH:MM] [日期:YYYY-MM-DD] [地点:地点] [参与者:参与者1,参与者2] [议程:议程1;议程2] [持续时间:分钟]';
      }
      
      const params = this.parseParams(meetingContent, ['时间', '日期', '地点', '参与者', '议程', '持续时间']);
      let title = meetingContent;
      // 移除所有参数部分
      ['时间', '日期', '地点', '参与者', '议程', '持续时间'].forEach(param => {
        if (params[param]) {
          const regex = new RegExp(`${param}[:：]\s*${params[param]}`, 'i');
          title = title.replace(regex, '').trim();
        }
      });
      
      if (!title) {
        return '请提供会议标题\n';
      }
      
      const date = params['日期'] || new Date().toISOString().split('T')[0];
      const time = params['时间'] || '10:00';
      const location = params['地点'] || '';
      const attendees = params['参与者'] ? params['参与者'].split(/[,，]/).map(a => a.trim()).filter(a => a) : [];
      const agenda = params['议程'] ? params['议程'].split(/[;；]/).map(a => a.trim()).filter(a => a) : [];
      const duration = params['持续时间'] ? parseInt(params['持续时间']) : 60;
      
      const newMeeting = {
        id: Date.now(),
        title: title,
        date: date,
        time: time,
        location: location,
        attendees: attendees,
        agenda: agenda,
        duration: duration,
        content: '',
        actionItems: [],
        timeNodes: [],
        createdAt: new Date().toISOString().split('T')[0]
      };
      
      this.meetings.push(newMeeting);
      this.saveData();
      logger.info('Meeting added successfully', { meeting: newMeeting });
      
      let response = `会议已添加: ${title}\n`;
      response += `  时间: ${date} ${time}\n`;
      response += `  持续时间: ${duration} 分钟\n`;
      if (location) response += `  地点: ${location}\n`;
      if (attendees.length > 0) response += `  参与者: ${attendees.join(', ')}\n`;
      if (agenda.length > 0) response += `  议程: ${agenda.join('; ')}\n`;
      
      return response;
    } catch (error) {
      logger.error('Error adding meeting', { error: error.message });
      return '添加会议时发生错误，请稍后再试\n';
    }
  }

  /**
   * 处理会议请求
   * @param {string} request - 会议请求
   * @returns {string} - 处理结果
   */
  processMeetingRequest(request) {
    if (request.includes('记录') || request.includes('纪要')) {
      return this.getMeetingNotes();
    } else if (!request.includes('添加会议')) {
      return this.addMeeting('添加会议 ' + request);
    } else {
      return this.addMeeting(request);
    }
  }

  /**
   * 获取会议纪要
   * @returns {string} - 会议纪要
   */
  getMeetingNotes() {
    const latestMeeting = this.meetings[this.meetings.length - 1];
    
    if (!latestMeeting) {
      return '暂无会议记录\n';
    }
    
    let response = '【会议纪要】\n';
    response += `会议主题: ${latestMeeting.title}\n`;
    response += `时间: ${latestMeeting.date} ${latestMeeting.time}\n`;
    response += `持续时间: ${latestMeeting.duration || 60} 分钟\n`;
    response += `参会人员: ${latestMeeting.attendees && latestMeeting.attendees.length > 0 ? latestMeeting.attendees.join(', ') : '未指定'}\n`;
    if (latestMeeting.location) response += `地点: ${latestMeeting.location}\n`;
    if (latestMeeting.agenda && latestMeeting.agenda.length > 0) {
      response += `议程: ${latestMeeting.agenda.join('; ')}\n`;
    }
    response += `会议内容: ${latestMeeting.content || '未记录'}\n\n`;
    
    response += '【行动事项】\n';
    if (latestMeeting.actionItems && latestMeeting.actionItems.length > 0) {
      latestMeeting.actionItems.forEach((item, index) => {
        response += `${index + 1}. ${item}\n`;
      });
    } else {
      response += '暂无行动事项\n';
    }
    
    response += '【时间节点】\n';
    if (latestMeeting.timeNodes && latestMeeting.timeNodes.length > 0) {
      latestMeeting.timeNodes.forEach((node, index) => {
        response += `${index + 1}. ${node}\n`;
      });
    } else {
      response += '暂无时间节点\n';
    }
    
    return response;
  }

  /**
   * 搜索功能
   * @param {string} request - 搜索请求
   * @returns {string} - 搜索结果
   */
  search(request) {
    try {
      const keyword = request.replace('搜索', '').trim().toLowerCase();
      if (!keyword) {
        return '请提供搜索关键词\n使用格式：搜索 关键词';
      }
      
      let response = '【搜索结果】\n';
      let hasResults = false;
      
      const matchingTasks = this.tasks.filter(t => 
        t.title.toLowerCase().includes(keyword) || 
        (t.description && t.description.toLowerCase().includes(keyword)) ||
        (t.tags && t.tags.some(tag => tag.toLowerCase().includes(keyword)))
      );
      
      if (matchingTasks.length > 0) {
        hasResults = true;
        response += '\n=== 相关任务 ===\n';
        matchingTasks.forEach((task, index) => {
          response += `${index + 1}. [${task.priority || '中'}] ${task.title} (ID: ${task.id})\n`;
        });
      }
      
      const matchingSchedule = this.schedule.filter(s => 
        s.title.toLowerCase().includes(keyword) || 
        (s.description && s.description.toLowerCase().includes(keyword)) ||
        (s.location && s.location.toLowerCase().includes(keyword))
      );
      
      if (matchingSchedule.length > 0) {
        hasResults = true;
        response += '\n=== 相关日程 ===\n';
        matchingSchedule.forEach((item, index) => {
          response += `${index + 1}. ${item.date} ${item.time} - ${item.title} (ID: ${item.id})\n`;
        });
      }
      
      const matchingMeetings = this.meetings.filter(m => 
        m.title.toLowerCase().includes(keyword) || 
        (m.content && m.content.toLowerCase().includes(keyword)) ||
        (m.location && m.location.toLowerCase().includes(keyword))
      );
      
      if (matchingMeetings.length > 0) {
        hasResults = true;
        response += '\n=== 相关会议 ===\n';
        matchingMeetings.forEach((meeting, index) => {
          response += `${index + 1}. ${meeting.date} ${meeting.time} - ${meeting.title} (ID: ${meeting.id})\n`;
        });
      }
      
      if (!hasResults) {
        response += `未找到包含"${keyword}"的内容\n`;
      }
      
      return response;
    } catch (error) {
      logger.error('Error searching', { error: error.message });
      return '搜索时发生错误，请稍后再试\n';
    }
  }

  /**
   * 获取统计信息
   * @returns {string} - 统计信息
   */
  getStatistics() {
    try {
      const today = new Date().toISOString().split('T')[0];
      const thisMonth = today.substring(0, 7);
      
      const totalTasks = this.tasks.length;
      const completedTasks = this.tasks.filter(t => t.status === '已完成').length;
      const pendingTasks = totalTasks - completedTasks;
      const highPriorityTasks = this.tasks.filter(t => t.priority === '高' && t.status !== '已完成').length;
      const overdueTasks = this.tasks.filter(t => t.dueDate && t.dueDate < today && t.status !== '已完成').length;
      
      const todaySchedule = this.schedule.filter(s => s.date === today && s.status !== '取消').length;
      const thisMonthMeetings = this.meetings.filter(m => m.date.startsWith(thisMonth)).length;
      const upcomingReminders = this.reminders.filter(r => r.date >= today).length;
      
      let response = '【统计与分析】\n';
      response += '=== 任务统计 ===\n';
      response += `总任务数: ${totalTasks}\n`;
      response += `已完成: ${completedTasks}\n`;
      response += `待处理: ${pendingTasks}\n`;
      if (totalTasks > 0) {
        response += `完成率: ${Math.round((completedTasks / totalTasks) * 100)}%\n`;
      }
      response += `高优先级待办: ${highPriorityTasks}\n`;
      if (overdueTasks > 0) {
        response += `逾期任务: ${overdueTasks} (⚠️ 请及时处理)\n`;
      }
      
      response += '\n=== 日程统计 ===\n';
      response += `今日日程: ${todaySchedule}\n`;
      response += `本月会议: ${thisMonthMeetings}\n`;
      response += `待处理提醒: ${upcomingReminders}\n`;
      
      response += '\n=== 建议 ===\n';
      if (highPriorityTasks > 3) {
        response += '1. 高优先级任务较多，建议优先处理\n';
      }
      if (overdueTasks > 0) {
        response += '2. 有逾期任务，请尽快完成\n';
      }
      if (todaySchedule > 5) {
        response += '3. 今日日程较满，注意合理安排休息\n';
      }
      if (totalTasks > 0 && (completedTasks / totalTasks) < 0.3) {
        response += '4. 任务完成率较低，建议制定计划逐个完成\n';
      }
      
      return response;
    } catch (error) {
      logger.error('Error getting statistics', { error: error.message });
      return '获取统计信息时发生错误，请稍后再试\n';
    }
  }

  /**
   * 获取计划建议
   * @returns {string} - 计划建议
   */
  getPlanSuggestions() {
    const today = new Date().toISOString().split('T')[0];
    const highPriorityTasks = this.tasks.filter(t => t.priority === '高' && t.status !== '已完成');
    const overdueTasks = this.tasks.filter(t => t.dueDate && t.dueDate < today && t.status !== '已完成');
    
    let response = '【计划建议】\n';
    
    if (overdueTasks.length > 0) {
      response += '⚠️ 首先处理逾期任务：\n';
      overdueTasks.forEach((task, index) => {
        response += `  ${index + 1}. ${task.title} (原截止: ${task.dueDate})\n`;
      });
      response += '\n';
    }
    
    if (highPriorityTasks.length > 0) {
      response += '🎯 优先完成高优先级任务：\n';
      highPriorityTasks.forEach((task, index) => {
        response += `  ${index + 1}. ${task.title}`;
        if (task.dueDate) response += ` (截止: ${task.dueDate})`;
        response += '\n';
      });
      response += '\n';
    }
    
    response += '📋 一般建议：\n';
    response += '1. 优先完成截止日期较近的任务\n';
    response += '2. 合理安排会议时间，避免连续会议\n';
    response += '3. 为重要任务预留充足的时间\n';
    response += '4. 定期检查日程和任务，确保不遗漏\n';
    response += '5. 使用"统计"命令查看详细统计和分析\n';
    
    return response;
  }

  /**
   * 获取通用响应
   * @returns {string} - 通用响应
   */
  getGeneralResponse() {
    let response = '【今日日程】\n';
    const today = new Date().toISOString().split('T')[0];
    const todaySchedule = this.schedule.filter(item => item.date === today && item.status !== '取消');
    todaySchedule.sort((a, b) => a.time.localeCompare(b.time));
    
    if (todaySchedule.length === 0) {
      response += '今日暂无日程安排\n\n';
    } else {
      todaySchedule.forEach(item => {
        response += `${item.time} - ${item.title}\n`;
      });
      response += '\n';
    }
    
    const pendingTasks = this.tasks.filter(task => task.status !== '已完成');
    pendingTasks.sort((a, b) => {
      const priorityOrder = { '高': 0, '中': 1, '低': 2 };
      return priorityOrder[a.priority || '中'] - priorityOrder[b.priority || '中'];
    });
    
    response += '【待办事项】\n';
    if (pendingTasks.length === 0) {
      response += '暂无待办事项\n\n';
    } else {
      const showTasks = pendingTasks.slice(0, 5);
      showTasks.forEach((task, index) => {
        response += `${index + 1}. [${task.priority || '中'}] ${task.title}`;
        if (task.dueDate) response += ` (截止: ${task.dueDate})`;
        response += '\n';
      });
      if (pendingTasks.length > 5) {
        response += `... 还有 ${pendingTasks.length - 5} 个任务\n`;
      }
      response += '\n';
    }
    
    const upcomingReminders = this.reminders.filter(reminder => reminder.date >= today);
    upcomingReminders.sort((a, b) => {
      const importanceOrder = { '紧急': 0, '重要': 1, '普通': 2 };
      if (a.date !== b.date) return a.date.localeCompare(b.date);
      return importanceOrder[a.importance || '普通'] - importanceOrder[b.importance || '普通'];
    });
    
    response += '【重要提醒】\n';
    if (upcomingReminders.length === 0) {
      response += '暂无重要提醒\n\n';
    } else {
      const showReminders = upcomingReminders.slice(0, 3);
      showReminders.forEach(reminder => {
        response += `${reminder.date} ${reminder.time} [${reminder.importance || '普通'}] - ${reminder.title}\n`;
      });
      if (upcomingReminders.length > 3) {
        response += `... 还有 ${upcomingReminders.length - 3} 个提醒\n`;
      }
      response += '\n';
    }
    
    response += '【可用命令】\n';
    response += '• 添加任务 标题 [优先级:高|中|低] [截止:YYYY-MM-DD] [标签:标签1,标签2] [描述:描述]\n';
    response += '• 添加日程 标题 [时间:HH:MM] [日期:YYYY-MM-DD] [地点:地点] [参与者:参与者1,参与者2]\n';
    response += '• 添加提醒 标题 [时间:HH:MM] [日期:YYYY-MM-DD] [重要性:普通|重要|紧急]\n';
    response += '• 添加会议 标题 [时间:HH:MM] [日期:YYYY-MM-DD] [地点:地点] [参与者:参与者1,参与者2] [议程:议程1;议程2] [持续时间:分钟]\n';
    response += '• 更新任务 ID [标题:新标题] [优先级:高|中|低] [状态:待办|进行中|已完成]\n';
    response += '• 完成任务 ID\n';
    response += '• 搜索 关键词\n';
    response += '• 统计\n';
    response += '• 今日日程 / 待办事项 / 重要提醒 / 会议纪要 / 计划建议\n';
    
    return response;
  }
}

module.exports = AssistantAgent;
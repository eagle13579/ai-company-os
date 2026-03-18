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
    
    // 确保数据目录存在
    if (!fs.existsSync(this.dataDir)) {
      try {
        fs.mkdirSync(this.dataDir, { recursive: true });
        logger.info('Data directory created successfully', { dataDir: this.dataDir });
      } catch (error) {
        logger.error('Error creating data directory', { error: error.message });
      }
    }
    
    // 加载数据
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
      // 加载失败时使用空数据
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
      
      // 执行插件的预处理
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
      
      // 执行插件的后处理
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
   * 获取今日日程
   * @returns {string} - 今日日程
   */
  getSchedule() {
    const today = new Date().toISOString().split('T')[0];
    const todaySchedule = this.schedule.filter(item => item.date === today);
    
    let response = '【今日日程】\n';
    if (todaySchedule.length === 0) {
      response += '今日暂无日程安排\n';
    } else {
      todaySchedule.forEach(item => {
        response += `${item.time} - ${item.title}\n`;
      });
    }
    
    return response;
  }

  /**
   * 获取待办事项
   * @returns {string} - 待办事项
   */
  getTasks() {
    const pendingTasks = this.tasks.filter(task => !task.completed);
    
    let response = '【待办事项】\n';
    if (pendingTasks.length === 0) {
      response += '暂无待办事项\n';
    } else {
      pendingTasks.forEach((task, index) => {
        response += `${index + 1}. ${task.title}${task.dueDate ? ` (截止: ${task.dueDate})` : ''}\n`;
      });
    }
    
    return response;
  }

  /**
   * 获取重要提醒
   * @returns {string} - 重要提醒
   */
  getReminders() {
    const today = new Date().toISOString().split('T')[0];
    const upcomingReminders = this.reminders.filter(reminder => reminder.date >= today);
    
    let response = '【重要提醒】\n';
    if (upcomingReminders.length === 0) {
      response += '暂无重要提醒\n';
    } else {
      upcomingReminders.sort((a, b) => a.date.localeCompare(b.date));
      upcomingReminders.forEach(reminder => {
        response += `${reminder.date} ${reminder.time} - ${reminder.title}\n`;
      });
    }
    
    return response;
  }

  /**
   * 获取计划建议
   * @returns {string} - 计划建议
   */
  getPlanSuggestions() {
    let response = '【计划建议】\n';
    response += '1. 优先完成截止日期较近的任务\n';
    response += '2. 合理安排会议时间，避免连续会议\n';
    response += '3. 为重要任务预留充足的时间\n';
    response += '4. 定期检查日程和任务，确保不遗漏\n';
    
    return response;
  }

  /**
   * 处理会议请求
   * @param {string} request - 会议请求
   * @returns {string} - 处理结果
   */
  processMeetingRequest(request) {
    // 简单的会议信息提取逻辑
    if (request.includes('记录') || request.includes('纪要')) {
      return this.getMeetingNotes();
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
    response += `参会人员: ${latestMeeting.attendees || '未指定'}\n`;
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
   * 添加任务
   * @param {string} request - 添加任务请求
   * @returns {string} - 添加结果
   */
  addTask(request) {
    try {
      // 简单的任务提取逻辑
      const taskTitle = request.replace('添加任务', '').trim();
      if (taskTitle) {
        const newTask = {
          id: Date.now(),
          title: taskTitle,
          completed: false,
          createdAt: new Date().toISOString().split('T')[0]
        };
        this.tasks.push(newTask);
        this.saveData();
        logger.info('Task added successfully', { task: newTask });
        return `任务已添加: ${taskTitle}\n`;
      }
      logger.warn('Empty task title provided');
      return '请提供任务内容\n';
    } catch (error) {
      logger.error('Error adding task', { error: error.message });
      return '添加任务时发生错误，请稍后再试\n';
    }
  }

  /**
   * 添加日程
   * @param {string} request - 添加日程请求
   * @returns {string} - 添加结果
   */
  addSchedule(request) {
    try {
      // 简单的日程提取逻辑
      const scheduleInfo = request.replace('添加日程', '').trim();
      if (scheduleInfo) {
        const newSchedule = {
          id: Date.now(),
          title: scheduleInfo,
          date: new Date().toISOString().split('T')[0],
          time: '09:00'
        };
        this.schedule.push(newSchedule);
        this.saveData();
        logger.info('Schedule added successfully', { schedule: newSchedule });
        return `日程已添加: ${scheduleInfo}\n`;
      }
      logger.warn('Empty schedule info provided');
      return '请提供日程内容\n';
    } catch (error) {
      logger.error('Error adding schedule', { error: error.message });
      return '添加日程时发生错误，请稍后再试\n';
    }
  }

  /**
   * 添加提醒
   * @param {string} request - 添加提醒请求
   * @returns {string} - 添加结果
   */
  addReminder(request) {
    try {
      // 简单的提醒提取逻辑
      const reminderInfo = request.replace('添加提醒', '').trim();
      if (reminderInfo) {
        const newReminder = {
          id: Date.now(),
          title: reminderInfo,
          date: new Date().toISOString().split('T')[0],
          time: '09:00'
        };
        this.reminders.push(newReminder);
        this.saveData();
        logger.info('Reminder added successfully', { reminder: newReminder });
        return `提醒已添加: ${reminderInfo}\n`;
      }
      logger.warn('Empty reminder info provided');
      return '请提供提醒内容\n';
    } catch (error) {
      logger.error('Error adding reminder', { error: error.message });
      return '添加提醒时发生错误，请稍后再试\n';
    }
  }

  /**
   * 添加会议
   * @param {string} request - 添加会议请求
   * @returns {string} - 添加结果
   */
  addMeeting(request) {
    try {
      // 简单的会议提取逻辑
      const meetingInfo = request.replace('会议', '').trim();
      if (meetingInfo) {
        const newMeeting = {
          id: Date.now(),
          title: meetingInfo,
          date: new Date().toISOString().split('T')[0],
          time: '10:00',
          attendees: '',
          content: '',
          actionItems: [],
          timeNodes: []
        };
        this.meetings.push(newMeeting);
        this.saveData();
        logger.info('Meeting added successfully', { meeting: newMeeting });
        return `会议已添加: ${meetingInfo}\n`;
      }
      logger.warn('Empty meeting info provided');
      return '请提供会议内容\n';
    } catch (error) {
      logger.error('Error adding meeting', { error: error.message });
      return '添加会议时发生错误，请稍后再试\n';
    }
  }

  /**
   * 获取通用响应
   * @returns {string} - 通用响应
   */
  getGeneralResponse() {
    let response = '【今日日程】\n';
    response += '今日暂无日程安排\n\n';
    
    response += '【待办事项】\n';
    response += '暂无待办事项\n\n';
    
    response += '【重要提醒】\n';
    response += '暂无重要提醒\n\n';
    
    response += '【计划建议】\n';
    response += '1. 优先完成截止日期较近的任务\n';
    response += '2. 合理安排会议时间，避免连续会议\n';
    response += '3. 为重要任务预留充足的时间\n';
    response += '4. 定期检查日程和任务，确保不遗漏\n';
    
    return response;
  }
}

module.exports = AssistantAgent;
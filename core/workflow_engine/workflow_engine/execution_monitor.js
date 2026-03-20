class ExecutionMonitor {
  constructor(persistence = null) {
    this.workflows = new Map();
    this.logs = [];
    this.events = new Map();
    this.metrics = {
      totalWorkflows: 0,
      completedWorkflows: 0,
      failedWorkflows: 0,
      runningWorkflows: 0,
      averageExecutionTime: 0,
      successRate: 0,
      totalSteps: 0,
      completedSteps: 0,
      failedSteps: 0
    };
    this.alerts = [];
    this.alertConfig = {
      workflowTimeout: 3600000, // 1小时
      stepTimeout: 300000, // 5分钟
      errorThreshold: 3, // 错误阈值
      notificationHandlers: [],
      alertLevels: ['info', 'warning', 'error', 'critical']
    };
    this.timeoutTimers = new Map();
    this.persistence = persistence;
    this.executionTimes = [];
    this.loadMetrics();
  }

  registerAlertNotification(handler) {
    this.alertConfig.notificationHandlers.push(handler);
  }

  setAlertConfig(config) {
    this.alertConfig = { ...this.alertConfig, ...config };
  }

  loadMetrics() {
    if (this.persistence) {
      try {
        const metrics = this.persistence.loadMetrics();
        if (metrics) {
          this.metrics = { ...this.metrics, ...metrics };
        }
      } catch (error) {
        this.log('error', 'Failed to load metrics', { error: error.message });
      }
    }
  }

  saveMetrics() {
    if (this.persistence) {
      try {
        this.persistence.saveMetrics(this.metrics);
      } catch (error) {
        this.log('error', 'Failed to save metrics', { error: error.message });
      }
    }
  }

  updateMetrics() {
    // 计算成功率
    const total = this.metrics.completedWorkflows + this.metrics.failedWorkflows;
    this.metrics.successRate = total > 0 ? (this.metrics.completedWorkflows / total) * 100 : 0;
    
    // 计算平均执行时间
    if (this.executionTimes.length > 0) {
      const sum = this.executionTimes.reduce((acc, time) => acc + time, 0);
      this.metrics.averageExecutionTime = sum / this.executionTimes.length;
    }
    
    this.saveMetrics();
  }

  getHealthStatus() {
    const healthStatus = {
      status: 'healthy',
      metrics: this.metrics,
      alerts: this.getAlerts(10, 'error'),
      runningWorkflows: Array.from(this.workflows.values()).filter(w => w.status === 'running').length,
      timestamp: new Date()
    };
    
    // 检查健康状态
    if (this.metrics.failedWorkflows > this.metrics.completedWorkflows) {
      healthStatus.status = 'unhealthy';
    } else if (this.getAlerts(5, 'error').length > 0) {
      healthStatus.status = 'degraded';
    }
    
    return healthStatus;
  }

  checkSystemHealth() {
    const health = this.getHealthStatus();
    if (health.status !== 'healthy') {
      this.createAlert('warning', `System health status: ${health.status}`, health);
    }
    return health;
  }

  createAlert(level, message, data = {}) {
    const alert = {
      id: `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      level,
      message,
      data,
      timestamp: new Date()
    };
    this.alerts.push(alert);
    this.notifyAlert(alert);
    return alert;
  }

  notifyAlert(alert) {
    for (const handler of this.alertConfig.notificationHandlers) {
      try {
        handler(alert);
      } catch (error) {
        console.error('Error in alert notification handler:', error);
      }
    }
  }

  checkWorkflowTimeout(workflowId) {
    const workflow = this.workflows.get(workflowId);
    if (!workflow) return;

    if (workflow.status === 'running' && workflow.startedAt) {
      const elapsed = Date.now() - workflow.startedAt.getTime();
      if (elapsed > this.alertConfig.workflowTimeout) {
        this.createAlert('error', `Workflow ${workflowId} has timed out`, {
          workflowId,
          elapsed,
          timeout: this.alertConfig.workflowTimeout
        });
      }
    }
  }

  checkStepTimeout(workflowId, stepId) {
    const workflow = this.workflows.get(workflowId);
    if (!workflow) return;

    const step = workflow.steps.find(s => s.id === stepId);
    if (step && step.status === 'running' && step.startTime) {
      const elapsed = Date.now() - step.startTime.getTime();
      if (elapsed > this.alertConfig.stepTimeout) {
        this.createAlert('error', `Step ${stepId} in workflow ${workflowId} has timed out`, {
          workflowId,
          stepId,
          elapsed,
          timeout: this.alertConfig.stepTimeout
        });
      }
    }
  }

  checkErrorThreshold() {
    const recentErrors = this.logs.filter(log => 
      log.level === 'error' && 
      Date.now() - new Date(log.timestamp).getTime() < 3600000 // 1小时内
    );

    if (recentErrors.length >= this.alertConfig.errorThreshold) {
      this.createAlert('error', `Error threshold reached: ${recentErrors.length} errors in the last hour`, {
        errorCount: recentErrors.length,
        threshold: this.alertConfig.errorThreshold
      });
    }
  }

  registerWorkflow(workflow) {
    this.workflows.set(workflow.id, {
      ...workflow,
      steps: workflow.steps.map(step => ({
        ...step,
        startTime: null,
        endTime: null
      }))
    });
    this.metrics.totalWorkflows++;
    this.log('info', `Workflow ${workflow.id} registered`, { workflowId: workflow.id, workflowName: workflow.name });
  }

  updateWorkflowStatus(workflowId, status, error = null) {
    const workflow = this.workflows.get(workflowId);
    if (!workflow) {
      return;
    }

    const previousStatus = workflow.status;
    workflow.status = status;
    
    if (status === 'running') {
      this.metrics.runningWorkflows++;
      // 设置工作流超时检测
      this.timeoutTimers.set(`workflow_${workflowId}`, setInterval(() => {
        this.checkWorkflowTimeout(workflowId);
      }, 60000)); // 每分钟检查一次
    } else if (status === 'completed') {
      this.metrics.runningWorkflows--;
      this.metrics.completedWorkflows++;
      workflow.completedAt = new Date();
      // 计算执行时间
      if (workflow.startedAt) {
        const executionTime = workflow.completedAt.getTime() - workflow.startedAt.getTime();
        this.executionTimes.push(executionTime);
        // 只保留最近100个执行时间
        if (this.executionTimes.length > 100) {
          this.executionTimes.shift();
        }
      }
      // 清除超时检测
      this.clearTimeoutTimer(`workflow_${workflowId}`);
      // 更新指标
      this.updateMetrics();
    } else if (status === 'failed') {
      this.metrics.runningWorkflows--;
      this.metrics.failedWorkflows++;
      workflow.error = error;
      // 清除超时检测
      this.clearTimeoutTimer(`workflow_${workflowId}`);
      // 检查错误阈值
      this.checkErrorThreshold();
      // 更新指标
      this.updateMetrics();
    } else if (status === 'stopped') {
      this.metrics.runningWorkflows--;
      // 清除超时检测
      this.clearTimeoutTimer(`workflow_${workflowId}`);
    }

    this.log('info', `Workflow ${workflowId} status updated from ${previousStatus} to ${status}`, { 
      workflowId, 
      previousStatus, 
      status, 
      error 
    });
    this.emitEvent('workflowStatusChanged', { workflowId, previousStatus, status, error });
  }

  clearTimeoutTimer(timerId) {
    if (this.timeoutTimers.has(timerId)) {
      clearInterval(this.timeoutTimers.get(timerId));
      this.timeoutTimers.delete(timerId);
    }
  }

  updateStepStatus(workflowId, stepId, status, result = null) {
    const workflow = this.workflows.get(workflowId);
    if (!workflow) {
      return;
    }

    const step = workflow.steps.find(s => s.id === stepId);
    if (!step) {
      return;
    }

    const previousStatus = step.status;
    step.status = status;
    
    if (status === 'running') {
      this.metrics.totalSteps++;
      step.startTime = new Date();
      // 设置步骤超时检测
      this.timeoutTimers.set(`step_${workflowId}_${stepId}`, setInterval(() => {
        this.checkStepTimeout(workflowId, stepId);
      }, 30000)); // 每30秒检查一次
    } else if (status === 'completed') {
      this.metrics.completedSteps++;
      step.endTime = new Date();
      step.result = result;
      // 清除步骤超时检测
      this.clearTimeoutTimer(`step_${workflowId}_${stepId}`);
      // 更新指标
      this.updateMetrics();
    } else if (status === 'failed') {
      this.metrics.failedSteps++;
      step.endTime = new Date();
      step.result = result;
      // 清除步骤超时检测
      this.clearTimeoutTimer(`step_${workflowId}_${stepId}`);
      // 更新指标
      this.updateMetrics();
    }

    this.log('info', `Step ${stepId} in workflow ${workflowId} status updated from ${previousStatus} to ${status}`, { 
      workflowId, 
      stepId, 
      previousStatus, 
      status, 
      result 
    });
    this.emitEvent('stepStatusChanged', { workflowId, stepId, previousStatus, status, result });
  }

  log(level, message, data = {}) {
    const logEntry = {
      timestamp: new Date(),
      level,
      message,
      data
    };
    this.logs.push(logEntry);
    // 可以根据需要将日志写入文件或发送到其他系统
    console[level](`[${logEntry.timestamp.toISOString()}] ${message}`, data);
  }

  getWorkflowStatus(workflowId) {
    return this.workflows.get(workflowId);
  }

  getAllWorkflowsStatus() {
    return Array.from(this.workflows.values());
  }

  getLogs(limit = 100, level = null) {
    let filteredLogs = this.logs;
    if (level) {
      filteredLogs = filteredLogs.filter(log => log.level === level);
    }
    return filteredLogs.slice(-limit);
  }

  getMetrics() {
    return { ...this.metrics };
  }

  on(event, callback) {
    if (!this.events.has(event)) {
      this.events.set(event, []);
    }
    this.events.get(event).push(callback);
  }

  off(event, callback) {
    if (!this.events.has(event)) {
      return;
    }
    const callbacks = this.events.get(event);
    const index = callbacks.indexOf(callback);
    if (index > -1) {
      callbacks.splice(index, 1);
    }
  }

  emitEvent(event, data) {
    if (!this.events.has(event)) {
      return;
    }
    this.events.get(event).forEach(callback => {
      try {
        callback(data);
      } catch (error) {
        this.log('error', `Error in event callback for ${event}`, { error: error.message });
      }
    });
  }

  clearLogs() {
    this.logs = [];
  }

  removeWorkflow(workflowId) {
    this.workflows.delete(workflowId);
    this.log('info', `Workflow ${workflowId} removed from monitor`, { workflowId });
  }

  getAlerts(limit = 100, level = null) {
    let filteredAlerts = this.alerts;
    if (level) {
      filteredAlerts = filteredAlerts.filter(alert => alert.level === level);
    }
    return filteredAlerts.slice(-limit);
  }

  clearAlerts() {
    this.alerts = [];
  }
}

module.exports = ExecutionMonitor;
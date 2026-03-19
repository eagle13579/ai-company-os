const logger = require('./logger');

class AgentMonitor {
  constructor(config = {}) {
    this.config = {
      alertThresholds: {
        errorRate: 0.1,
        responseTime: 5000,
        queueSize: 100
      },
      monitoringInterval: 5000,
      ...config
    };
    this.agentStats = new Map();
    this.alertThresholds = this.config.alertThresholds;
    this.alerts = [];
    this.monitoringInterval = null;
    logger.info('Agent Monitor initialized with config:', this.config);
  }

  startMonitoring(interval = 5000) {
    this.monitoringInterval = setInterval(() => {
      this.checkAgentHealth();
      this.checkAlertConditions();
    }, interval);
  }

  stopMonitoring() {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
    }
  }

  recordAgentActivity(agentId, activity) {
    if (!this.agentStats.has(agentId)) {
      this.agentStats.set(agentId, {
        agentId,
        totalRequests: 0,
        successfulRequests: 0,
        failedRequests: 0,
        totalResponseTime: 0,
        averageResponseTime: 0,
        lastActivity: null,
        errorRate: 0
      });
      logger.info(`Created stats for agent ${agentId}`);
    }

    const stats = this.agentStats.get(agentId);
    stats.totalRequests++;
    stats.lastActivity = Date.now();

    if (activity.success) {
      stats.successfulRequests++;
      stats.totalResponseTime += activity.responseTime || 0;
      stats.averageResponseTime = stats.totalResponseTime / stats.successfulRequests;
      logger.debug(`Agent ${agentId} successful request, response time: ${activity.responseTime}ms`);
    } else {
      stats.failedRequests++;
      logger.debug(`Agent ${agentId} failed request`);
    }

    stats.errorRate = stats.failedRequests / stats.totalRequests;
    this.agentStats.set(agentId, stats);
    logger.debug(`Agent ${agentId} stats updated:`, stats);
  }

  checkAgentHealth() {
    const now = Date.now();
    for (const [agentId, stats] of this.agentStats.entries()) {
      if (stats.lastActivity && (now - stats.lastActivity) > 300000) { // 5 minutes
        this.addAlert({
          agentId,
          type: 'inactivity',
          message: `Agent ${agentId} has been inactive for more than 5 minutes`,
          timestamp: now
        });
        logger.warn(`Agent ${agentId} is inactive`);
      }
    }
  }

  checkAlertConditions() {
    for (const [agentId, stats] of this.agentStats.entries()) {
      if (stats.errorRate > this.alertThresholds.errorRate) {
        this.addAlert({
          agentId,
          type: 'high_error_rate',
          message: `Agent ${agentId} has high error rate: ${(stats.errorRate * 100).toFixed(2)}%`,
          timestamp: Date.now()
        });
        logger.warn(`Agent ${agentId} has high error rate: ${(stats.errorRate * 100).toFixed(2)}%`);
      }

      if (stats.averageResponseTime > this.alertThresholds.responseTime) {
        this.addAlert({
          agentId,
          type: 'slow_response',
          message: `Agent ${agentId} has slow response time: ${stats.averageResponseTime.toFixed(2)}ms`,
          timestamp: Date.now()
        });
        logger.warn(`Agent ${agentId} has slow response time: ${stats.averageResponseTime.toFixed(2)}ms`);
      }
    }
  }

  addAlert(alert) {
    this.alerts.push(alert);
    if (this.alerts.length > 100) {
      this.alerts.shift();
    }
    logger.info('New alert added:', alert);
  }

  getAgentStats(agentId) {
    return this.agentStats.get(agentId) || null;
  }

  getAllAgentStats() {
    return Array.from(this.agentStats.values());
  }

  getAlerts() {
    return this.alerts;
  }

  clearAlerts() {
    this.alerts = [];
  }

  setAlertThresholds(thresholds) {
    this.alertThresholds = { ...this.alertThresholds, ...thresholds };
  }

  getSystemHealth() {
    const totalAgents = this.agentStats.size;
    const healthyAgents = Array.from(this.agentStats.values()).filter(
      stats => stats.errorRate < this.alertThresholds.errorRate
    ).length;

    return {
      totalAgents,
      healthyAgents,
      healthPercentage: totalAgents > 0 ? (healthyAgents / totalAgents) * 100 : 0,
      totalAlerts: this.alerts.length
    };
  }
}

module.exports = AgentMonitor;
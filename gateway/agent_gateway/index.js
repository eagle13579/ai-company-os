const { AgentRouter, RouteRule } = require('./agent_router');
const AgentExecutor = require('./agent_executor');
const AgentMonitor = require('./agent_monitor');
const logger = require('./logger');

class AgentGateway {
  constructor(config = {}) {
    this.config = {
      maxConcurrentTasks: 5,
      monitoringInterval: 5000,
      logLevel: 'info',
      ...config
    };
    this.router = new AgentRouter();
    this.executor = new AgentExecutor(this.config);
    this.monitor = new AgentMonitor(this.config);
    this.plugins = [];
    logger.level = this.config.logLevel;
    logger.info('Agent Gateway initialized with config:', this.config);
  }

  registerAgent(agentId, agent) {
    this.router.registerAgent(agentId, agent);
    logger.info(`Agent ${agentId} registered`);
  }

  registerRule(rule) {
    this.router.registerRule(rule);
    logger.info('Route rule registered');
  }

  registerPlugin(plugin) {
    this.plugins.push(plugin);
    logger.info(`Plugin ${plugin.name || 'unknown'} registered`);
  }

  async processRequest(request) {
    const startTime = Date.now();
    logger.info('Processing request:', request);

    // 执行插件预处理
    for (const plugin of this.plugins) {
      if (plugin.preProcess) {
        try {
          request = await plugin.preProcess(request);
        } catch (error) {
          logger.error(`Plugin preProcess error: ${error.message}`);
        }
      }
    }

    const result = await this.router.routeRequest(request);
    const responseTime = Date.now() - startTime;

    if (result.success) {
      this.monitor.recordAgentActivity(result.agentId, {
        success: true,
        responseTime
      });
      logger.info(`Request processed by agent ${result.agentId} in ${responseTime}ms`);
    } else {
      this.monitor.recordAgentActivity('unknown', {
        success: false,
        responseTime
      });
      logger.error(`Request failed: ${result.error}`);
    }

    // 执行插件后处理
    for (const plugin of this.plugins) {
      if (plugin.postProcess) {
        try {
          await plugin.postProcess(result);
        } catch (error) {
          logger.error(`Plugin postProcess error: ${error.message}`);
        }
      }
    }

    return result;
  }

  startMonitoring(interval) {
    this.monitor.startMonitoring(interval || this.config.monitoringInterval);
    logger.info(`Monitoring started with interval ${interval || this.config.monitoringInterval}ms`);
  }

  stopMonitoring() {
    this.monitor.stopMonitoring();
    logger.info('Monitoring stopped');
  }

  getSystemHealth() {
    const health = this.monitor.getSystemHealth();
    logger.debug('System health:', health);
    return health;
  }

  getAgentStats(agentId) {
    const stats = this.monitor.getAgentStats(agentId);
    logger.debug(`Agent ${agentId} stats:`, stats);
    return stats;
  }

  getAllAgentStats() {
    const stats = this.monitor.getAllAgentStats();
    logger.debug('All agent stats:', stats);
    return stats;
  }

  getAlerts() {
    const alerts = this.monitor.getAlerts();
    logger.debug('Alerts:', alerts);
    return alerts;
  }

  setAlertThresholds(thresholds) {
    this.monitor.setAlertThresholds(thresholds);
    logger.info('Alert thresholds updated:', thresholds);
  }

  setMaxConcurrentTasks(max) {
    this.executor.setMaxConcurrentTasks(max);
    logger.info(`Max concurrent tasks set to ${max}`);
  }

  getQueueSize() {
    const size = this.executor.getQueueSize();
    logger.debug(`Queue size: ${size}`);
    return size;
  }

  getRunningTasksCount() {
    const count = this.executor.getRunningTasksCount();
    logger.debug(`Running tasks count: ${count}`);
    return count;
  }

  getAgentInfo() {
    return {
      version: '1.0.0',
      agents: this.router.getAvailableAgents(),
      plugins: this.plugins.map(p => p.name || 'anonymous'),
      config: this.config
    };
  }
}

module.exports = {
  AgentGateway,
  AgentRouter,
  RouteRule,
  AgentExecutor,
  AgentMonitor
};
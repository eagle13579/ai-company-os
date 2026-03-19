const logger = require('../agent_gateway/logger');

class Monitor {
  constructor() {
    this.metrics = {
      dataRequests: 0,
      ragQueries: 0,
      cacheHits: 0,
      cacheMisses: 0,
      errors: 0,
      totalResponseTime: 0,
      averageResponseTime: 0
    };
    this.startTime = Date.now();
    this.healthChecks = [];
  }

  recordDataRequest() {
    this.metrics.dataRequests++;
  }

  recordRagQuery() {
    this.metrics.ragQueries++;
  }

  recordCacheHit() {
    this.metrics.cacheHits++;
  }

  recordCacheMiss() {
    this.metrics.cacheMisses++;
  }

  recordError() {
    this.metrics.errors++;
  }

  recordResponseTime(time) {
    this.metrics.totalResponseTime += time;
    const totalRequests = this.metrics.dataRequests + this.metrics.ragQueries;
    if (totalRequests > 0) {
      this.metrics.averageResponseTime = this.metrics.totalResponseTime / totalRequests;
    }
  }

  addHealthCheck(check) {
    this.healthChecks.push(check);
  }

  async checkHealth() {
    const healthChecks = [];
    
    for (const check of this.healthChecks) {
      try {
        const result = await (check.check ? check.check() : check());
        healthChecks.push({
          name: check.name || 'unnamed',
          status: 'healthy',
          result
        });
      } catch (error) {
        healthChecks.push({
          name: check.name || 'unnamed',
          status: 'unhealthy',
          error: error.message
        });
      }
    }

    const isHealthy = healthChecks.every(check => check.status === 'healthy');

    return {
      status: isHealthy ? 'healthy' : 'unhealthy',
      checks: healthChecks,
      uptime: Date.now() - this.startTime,
      metrics: this.metrics
    };
  }

  getMetrics() {
    return {
      ...this.metrics,
      uptime: Date.now() - this.startTime,
      cacheHitRate: this.metrics.cacheHits + this.metrics.cacheMisses > 0 
        ? (this.metrics.cacheHits / (this.metrics.cacheHits + this.metrics.cacheMisses)) * 100 
        : 0
    };
  }

  resetMetrics() {
    this.metrics = {
      dataRequests: 0,
      ragQueries: 0,
      cacheHits: 0,
      cacheMisses: 0,
      errors: 0,
      totalResponseTime: 0,
      averageResponseTime: 0
    };
    logger.info('Metrics reset');
  }
}

module.exports = Monitor;
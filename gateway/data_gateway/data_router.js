const logger = require('../agent_gateway/logger');
const { DataSourceError, ValidationError } = require('./errors');

class DataRouter {
  constructor() {
    this.dataSources = new Map();
    this.rules = [];
  }

  registerDataSource(sourceId, source) {
    if (!sourceId || typeof sourceId !== 'string') {
      throw new ValidationError('Invalid data source ID');
    }
    if (!source || typeof source.fetch !== 'function') {
      throw new ValidationError('Invalid data source: must have a fetch method');
    }
    this.dataSources.set(sourceId, source);
    logger.info(`Data source ${sourceId} registered`);
  }

  registerRule(rule) {
    if (!rule || typeof rule.matches !== 'function') {
      throw new ValidationError('Invalid rule: must have a matches method');
    }
    this.rules.push(rule);
    logger.info('Data route rule registered');
  }

  async routeDataRequest(request) {
    try {
      if (!request) {
        throw new ValidationError('Request cannot be null or undefined');
      }

      const sourceId = this.selectDataSource(request);
      if (!sourceId) {
        throw new DataSourceError('No suitable data source found for the request', 'NO_SUITABLE_DATA_SOURCE');
      }

      const source = this.dataSources.get(sourceId);
      if (!source) {
        throw new DataSourceError(`Data source ${sourceId} not found`, 'DATA_SOURCE_NOT_FOUND');
      }

      const response = await source.fetch(request);
      return {
        success: true,
        sourceId,
        response
      };
    } catch (error) {
      logger.error(`Data routing error: ${error.message}`, {
        code: error.code,
        status: error.status
      });
      return {
        success: false,
        error: error.message,
        code: error.code || 'UNKNOWN_ERROR',
        status: error.status || 500
      };
    }
  }

  selectDataSource(request) {
    for (const rule of this.rules) {
      if (rule.matches(request)) {
        return rule.sourceId;
      }
    }
    return null;
  }

  getAvailableDataSources() {
    return Array.from(this.dataSources.keys());
  }

  getDataSource(sourceId) {
    return this.dataSources.get(sourceId);
  }
}

class DataRouteRule {
  constructor(sourceId, condition) {
    this.sourceId = sourceId;
    this.condition = condition;
  }

  matches(request) {
    return this.condition(request);
  }
}

module.exports = {
  DataRouter,
  DataRouteRule
};
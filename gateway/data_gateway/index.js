const { DataRouter, DataRouteRule } = require('./data_router');
const RAGEngine = require('./rag_engine');
const CacheManager = require('./cache_manager');
const { ValidationError, DataGatewayError, CacheError } = require('./errors');
const logger = require('../agent_gateway/logger');
const Validator = require('./validator');
const Monitor = require('./monitor');

class DataGateway {
  constructor(config = {}) {
    this.config = {
      ...config
    };
    this.dataRouter = new DataRouter();
    this.ragEngine = new RAGEngine(config.rag || {});
    this.cacheManager = new CacheManager(config.cache || {});
    this.plugins = [];
    this.monitor = new Monitor();
    this.setupHealthChecks();
    logger.info('Data Gateway initialized with config:', this.config);
  }

  setupHealthChecks() {
    // 添加缓存健康检查
    this.monitor.addHealthCheck({
      name: 'cache_health',
      check: async () => {
        const stats = await this.getCacheStats();
        return stats;
      }
    });

    // 添加数据源健康检查
    this.monitor.addHealthCheck({
      name: 'data_sources_health',
      check: async () => {
        const sources = this.getAvailableDataSources();
        return { sources, count: sources.length };
      }
    });

    // 添加向量存储健康检查
    this.monitor.addHealthCheck({
      name: 'vector_stores_health',
      check: async () => {
        const stores = this.getAvailableVectorStores();
        return { stores, count: stores.length };
      }
    });
  }

  registerDataSource(sourceId, source) {
    if (!sourceId || typeof sourceId !== 'string') {
      throw new ValidationError('Invalid data source ID');
    }
    Validator.validateDataSource(source);
    this.dataRouter.registerDataSource(sourceId, source);
  }

  registerRule(rule) {
    this.dataRouter.registerRule(rule);
  }

  registerVectorStore(storeId, vectorStore) {
    if (!storeId || typeof storeId !== 'string') {
      throw new ValidationError('Invalid vector store ID');
    }
    Validator.validateVectorStore(vectorStore);
    this.ragEngine.registerVectorStore(storeId, vectorStore);
  }

  registerPlugin(plugin) {
    if (!plugin) {
      throw new ValidationError('Plugin cannot be null or undefined');
    }
    this.plugins.push(plugin);
    logger.info(`Plugin ${plugin.name || 'anonymous'} registered`);
  }

  async routeDataRequest(request) {
    const startTime = Date.now();
    this.monitor.recordDataRequest();
    
    try {
      // 输入验证
      Validator.validateRequest(request);
      
      // 输入 sanitization
      request = Validator.sanitizeInput(request);

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

      // 尝试从缓存获取
      const cacheKey = this.generateCacheKey('data', request);
      let cachedResult;
      try {
        cachedResult = await this.cacheManager.get(cacheKey);
        if (cachedResult) {
          logger.debug('Cache hit for data request');
          this.monitor.recordCacheHit();
          const responseTime = Date.now() - startTime;
          this.monitor.recordResponseTime(responseTime);
          return cachedResult;
        } else {
          this.monitor.recordCacheMiss();
        }
      } catch (error) {
        logger.warn(`Cache error: ${error.message}, falling back to direct request`);
      }

      // 路由请求
      const result = await this.dataRouter.routeDataRequest(request);
      
      // 缓存结果
      if (result.success) {
        try {
          await this.cacheManager.set(cacheKey, result);
        } catch (error) {
          logger.warn(`Cache set error: ${error.message}`);
        }
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

      const responseTime = Date.now() - startTime;
      this.monitor.recordResponseTime(responseTime);
      return result;
    } catch (error) {
      this.monitor.recordError();
      const responseTime = Date.now() - startTime;
      this.monitor.recordResponseTime(responseTime);
      
      logger.error(`Data route request error: ${error.message}`, {
        code: error.code,
        status: error.status
      });
      return {
        success: false,
        error: error.message,
        code: error.code || 'DATA_ROUTE_ERROR',
        status: error.status || 500
      };
    }
  }

  async ragQuery(storeId, query, model, options = {}) {
    const startTime = Date.now();
    this.monitor.recordRagQuery();
    
    try {
      if (!storeId) {
        throw new ValidationError('Vector store ID is required');
      }
      if (!query) {
        throw new ValidationError('Query is required');
      }
      if (!model) {
        throw new ValidationError('Model is required');
      }

      // 输入验证
      Validator.validateQuery(query);
      Validator.validateModel(model);
      
      // 输入 sanitization
      query = Validator.sanitizeInput(query);

      // 执行插件预处理
      for (const plugin of this.plugins) {
        if (plugin.preProcess) {
          try {
            query = await plugin.preProcess(query);
          } catch (error) {
            logger.error(`Plugin preProcess error: ${error.message}`);
          }
        }
      }

      // 尝试从缓存获取
      const cacheKey = this.generateCacheKey('rag', { storeId, query });
      let cachedResult;
      try {
        cachedResult = await this.cacheManager.get(cacheKey);
        if (cachedResult) {
          logger.debug('Cache hit for RAG query');
          this.monitor.recordCacheHit();
          const responseTime = Date.now() - startTime;
          this.monitor.recordResponseTime(responseTime);
          return cachedResult;
        } else {
          this.monitor.recordCacheMiss();
        }
      } catch (error) {
        logger.warn(`Cache error: ${error.message}, falling back to direct RAG`);
      }

      // 执行RAG查询
      const result = await this.ragEngine.ragPipeline(storeId, query, model, options);
      
      // 缓存结果
      if (result.success) {
        try {
          await this.cacheManager.set(cacheKey, result);
        } catch (error) {
          logger.warn(`Cache set error: ${error.message}`);
        }
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

      const responseTime = Date.now() - startTime;
      this.monitor.recordResponseTime(responseTime);
      return result;
    } catch (error) {
      this.monitor.recordError();
      const responseTime = Date.now() - startTime;
      this.monitor.recordResponseTime(responseTime);
      
      logger.error(`RAG query error: ${error.message}`, {
        code: error.code,
        status: error.status
      });
      return {
        success: false,
        error: error.message,
        code: error.code || 'RAG_QUERY_ERROR',
        status: error.status || 500
      };
    }
  }

  generateCacheKey(prefix, data) {
    return `${prefix}_${JSON.stringify(data)}`;
  }

  async getCacheStats() {
    try {
      return await this.cacheManager.getStats();
    } catch (error) {
      logger.error(`Get cache stats error: ${error.message}`);
      return { error: error.message };
    }
  }

  async clearCache() {
    try {
      await this.cacheManager.clear();
    } catch (error) {
      logger.error(`Clear cache error: ${error.message}`);
      throw new CacheError(`Failed to clear cache: ${error.message}`, 'CLEAR_CACHE_ERROR');
    }
  }

  getAvailableDataSources() {
    return this.dataRouter.getAvailableDataSources();
  }

  getAvailableVectorStores() {
    return this.ragEngine.getAvailableVectorStores();
  }

  async getGatewayInfo() {
    try {
      const cacheStats = await this.getCacheStats();
      const metrics = this.monitor.getMetrics();
      const health = await this.checkHealth();
      return {
        version: '1.0.0',
        dataSources: this.getAvailableDataSources(),
        vectorStores: this.getAvailableVectorStores(),
        cacheStats,
        metrics,
        health: health.status,
        config: this.config
      };
    } catch (error) {
      logger.error(`Get gateway info error: ${error.message}`);
      return {
        version: '1.0.0',
        dataSources: this.getAvailableDataSources(),
        vectorStores: this.getAvailableVectorStores(),
        cacheStats: { error: error.message },
        metrics: this.monitor.getMetrics(),
        health: 'error',
        config: this.config
      };
    }
  }

  getMetrics() {
    return this.monitor.getMetrics();
  }

  async checkHealth() {
    return this.monitor.checkHealth();
  }

  resetMetrics() {
    this.monitor.resetMetrics();
  }
}

module.exports = {
  DataGateway,
  DataRouter,
  DataRouteRule,
  RAGEngine,
  CacheManager
};
const redis = require('redis');
const logger = require('../agent_gateway/logger');
const { CacheError } = require('./errors');

class RedisCache {
  constructor(config = {}) {
    this.config = {
      host: 'localhost',
      port: 6379,
      password: '',
      db: 0,
      ttl: 3600,
      ...config
    };
    this.client = null;
    this.connected = false;
    this.init();
  }

  async init() {
    try {
      this.client = redis.createClient({
        url: `redis://${this.config.host}:${this.config.port}`,
        password: this.config.password,
        database: this.config.db
      });

      this.client.on('error', (error) => {
        logger.error(`Redis error: ${error.message}`);
        this.connected = false;
      });

      this.client.on('connect', () => {
        logger.info('Redis connected');
        this.connected = true;
      });

      await this.client.connect();
      logger.info('Redis cache initialized');
    } catch (error) {
      logger.error(`Failed to initialize Redis: ${error.message}`);
      this.connected = false;
    }
  }

  async set(key, value, ttl = this.config.ttl) {
    try {
      if (!this.connected) {
        throw new CacheError('Redis not connected');
      }

      const stringValue = JSON.stringify(value);
      await this.client.set(key, stringValue, { EX: ttl });
      logger.debug(`Redis set: ${key} with TTL ${ttl}`);
    } catch (error) {
      logger.error(`Redis set error: ${error.message}`);
      throw new CacheError(`Failed to set Redis cache: ${error.message}`, 'REDIS_SET_ERROR');
    }
  }

  async get(key) {
    try {
      if (!this.connected) {
        throw new CacheError('Redis not connected');
      }

      const value = await this.client.get(key);
      if (value === null) {
        logger.debug(`Redis miss: ${key}`);
        return null;
      }

      const parsedValue = JSON.parse(value);
      logger.debug(`Redis hit: ${key}`);
      return parsedValue;
    } catch (error) {
      logger.error(`Redis get error: ${error.message}`);
      throw new CacheError(`Failed to get Redis cache: ${error.message}`, 'REDIS_GET_ERROR');
    }
  }

  async delete(key) {
    try {
      if (!this.connected) {
        throw new CacheError('Redis not connected');
      }

      await this.client.del(key);
      logger.debug(`Redis delete: ${key}`);
    } catch (error) {
      logger.error(`Redis delete error: ${error.message}`);
      throw new CacheError(`Failed to delete Redis cache: ${error.message}`, 'REDIS_DELETE_ERROR');
    }
  }

  async clear() {
    try {
      if (!this.connected) {
        throw new CacheError('Redis not connected');
      }

      await this.client.flushDb();
      logger.info('Redis cache cleared');
    } catch (error) {
      logger.error(`Redis clear error: ${error.message}`);
      throw new CacheError(`Failed to clear Redis cache: ${error.message}`, 'REDIS_CLEAR_ERROR');
    }
  }

  async getSize() {
    try {
      if (!this.connected) {
        throw new CacheError('Redis not connected');
      }

      const keys = await this.client.keys('*');
      return keys.length;
    } catch (error) {
      logger.error(`Redis getSize error: ${error.message}`);
      throw new CacheError(`Failed to get Redis size: ${error.message}`, 'REDIS_SIZE_ERROR');
    }
  }

  isConnected() {
    return this.connected;
  }

  async disconnect() {
    if (this.client) {
      await this.client.disconnect();
      this.connected = false;
      logger.info('Redis disconnected');
    }
  }
}

module.exports = RedisCache;
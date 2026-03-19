const logger = require('../agent_gateway/logger');
const { CacheError, ValidationError } = require('./errors');
const RedisCache = require('./redis_cache');

class CacheManager {
  constructor(config = {}) {
    this.config = {
      defaultTTL: 3600000, // 1 hour in milliseconds
      maxSize: 1000,
      useRedis: false,
      redis: {},
      ...config
    };
    this.cache = new Map();
    this.accessTimes = new Map();
    this.redisCache = null;
    
    if (this.config.useRedis) {
      this.redisCache = new RedisCache(this.config.redis);
    }
    
    logger.info('Cache Manager initialized with config:', this.config);
  }

  async set(key, value, ttl = this.config.defaultTTL) {
    try {
      if (!key) {
        throw new ValidationError('Cache key is required');
      }
      if (ttl < 0) {
        throw new ValidationError('TTL must be non-negative');
      }

      // 尝试使用Redis缓存
      if (this.redisCache) {
        try {
          await this.redisCache.set(key, value, Math.floor(ttl / 1000));
          return;
        } catch (redisError) {
          logger.warn(`Redis set failed, falling back to memory cache: ${redisError.message}`);
        }
      }

      // 回退到内存缓存
      const now = Date.now();
      const expiry = now + ttl;
      
      this.cache.set(key, { value, expiry });
      this.accessTimes.set(key, now);
      
      this.evictIfNeeded();
      logger.debug(`Cached ${key} with TTL ${ttl}ms`);
    } catch (error) {
      logger.error(`Cache set error: ${error.message}`, {
        code: error.code,
        status: error.status
      });
      throw new CacheError(`Failed to set cache: ${error.message}`, 'CACHE_SET_ERROR');
    }
  }

  async get(key) {
    try {
      if (!key) {
        throw new ValidationError('Cache key is required');
      }

      // 尝试使用Redis缓存
      if (this.redisCache) {
        try {
          const value = await this.redisCache.get(key);
          if (value !== null) {
            return value;
          }
        } catch (redisError) {
          logger.warn(`Redis get failed, falling back to memory cache: ${redisError.message}`);
        }
      }

      // 回退到内存缓存
      const now = Date.now();
      const item = this.cache.get(key);
      
      if (!item) {
        logger.debug(`Cache miss for ${key}`);
        return null;
      }

      if (now > item.expiry) {
        this.cache.delete(key);
        this.accessTimes.delete(key);
        logger.debug(`Cache expired for ${key}`);
        return null;
      }

      this.accessTimes.set(key, now);
      logger.debug(`Cache hit for ${key}`);
      return item.value;
    } catch (error) {
      logger.error(`Cache get error: ${error.message}`, {
        code: error.code,
        status: error.status
      });
      throw new CacheError(`Failed to get cache: ${error.message}`, 'CACHE_GET_ERROR');
    }
  }

  async delete(key) {
    try {
      // 尝试使用Redis缓存
      if (this.redisCache) {
        try {
          await this.redisCache.delete(key);
        } catch (redisError) {
          logger.warn(`Redis delete failed, falling back to memory cache: ${redisError.message}`);
        }
      }

      // 回退到内存缓存
      const deleted = this.cache.delete(key);
      this.accessTimes.delete(key);
      if (deleted) {
        logger.debug(`Deleted ${key} from cache`);
      }
      return deleted;
    } catch (error) {
      logger.error(`Cache delete error: ${error.message}`);
      throw new CacheError(`Failed to delete cache: ${error.message}`, 'CACHE_DELETE_ERROR');
    }
  }

  async clear() {
    try {
      // 尝试使用Redis缓存
      if (this.redisCache) {
        try {
          await this.redisCache.clear();
        } catch (redisError) {
          logger.warn(`Redis clear failed, falling back to memory cache: ${redisError.message}`);
        }
      }

      // 回退到内存缓存
      const size = this.cache.size;
      this.cache.clear();
      this.accessTimes.clear();
      logger.info(`Cleared ${size} items from cache`);
    } catch (error) {
      logger.error(`Cache clear error: ${error.message}`);
      throw new CacheError(`Failed to clear cache: ${error.message}`, 'CACHE_CLEAR_ERROR');
    }
  }

  evictIfNeeded() {
    if (this.cache.size > this.config.maxSize) {
      const sortedKeys = Array.from(this.accessTimes.entries())
        .sort((a, b) => a[1] - b[1])
        .map(([key]) => key);
      
      const toRemove = this.cache.size - this.config.maxSize;
      for (let i = 0; i < toRemove; i++) {
        const key = sortedKeys[i];
        this.cache.delete(key);
        this.accessTimes.delete(key);
      }
      
      logger.info(`Evicted ${toRemove} items from cache`);
    }
  }

  async getSize() {
    try {
      // 尝试使用Redis缓存
      if (this.redisCache) {
        try {
          return await this.redisCache.getSize();
        } catch (redisError) {
          logger.warn(`Redis getSize failed, falling back to memory cache: ${redisError.message}`);
        }
      }

      // 回退到内存缓存
      return this.cache.size;
    } catch (error) {
      logger.error(`Cache getSize error: ${error.message}`);
      throw new CacheError(`Failed to get cache size: ${error.message}`, 'CACHE_SIZE_ERROR');
    }
  }

  async getStats() {
    try {
      let size = this.cache.size;
      
      // 尝试使用Redis缓存
      if (this.redisCache) {
        try {
          size = await this.redisCache.getSize();
        } catch (redisError) {
          logger.warn(`Redis getSize failed, falling back to memory cache: ${redisError.message}`);
        }
      }

      return {
        size,
        maxSize: this.config.maxSize,
        defaultTTL: this.config.defaultTTL,
        useRedis: this.config.useRedis,
        redisConnected: this.redisCache ? this.redisCache.isConnected() : false
      };
    } catch (error) {
      logger.error(`Cache getStats error: ${error.message}`);
      return {
        size: this.cache.size,
        maxSize: this.config.maxSize,
        defaultTTL: this.config.defaultTTL,
        useRedis: this.config.useRedis,
        redisConnected: false,
        error: error.message
      };
    }
  }

  async has(key) {
    try {
      // 尝试使用Redis缓存
      if (this.redisCache) {
        try {
          const value = await this.redisCache.get(key);
          return value !== null;
        } catch (redisError) {
          logger.warn(`Redis has failed, falling back to memory cache: ${redisError.message}`);
        }
      }

      // 回退到内存缓存
      const item = this.cache.get(key);
      if (!item) return false;
      
      const now = Date.now();
      if (now > item.expiry) {
        this.cache.delete(key);
        this.accessTimes.delete(key);
        return false;
      }
      
      return true;
    } catch (error) {
      logger.error(`Cache has error: ${error.message}`);
      return false;
    }
  }
}

module.exports = CacheManager;
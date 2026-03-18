/**
 * ModelGateway class - Main class for model management, routing, and cost tracking
 */
import ModelRouter from './model_router.js';
import CostTracker from './cost_tracker.js';
import LoadBalancer from './load_balancer.js';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import LRU from 'lru-cache';

// Load environment variables
dotenv.config();

// JWT configuration
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-here';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';

// Cache configuration
const CACHE_MAX_SIZE = parseInt(process.env.CACHE_MAX_SIZE) || 1000;
const CACHE_TTL = parseInt(process.env.CACHE_TTL) || 3600000;

/**
 * GatewayError class - Custom error class for consistent error responses
 */
export class GatewayError extends Error {
  /**
   * Constructor
   * @param {string} message - Error message
   * @param {number} statusCode - HTTP status code
   * @param {any} details - Additional error details
   */
  constructor(message, statusCode = 500, details = null) {
    super(message);
    this.statusCode = statusCode;
    this.details = details;
    this.name = 'GatewayError';
  }

  /**
   * Convert error to JSON format
   * @returns {object} JSON representation of the error
   */
  toJSON() {
    return {
      success: false,
      error: this.message,
      details: this.details,
      statusCode: this.statusCode
    };
  }
}

/**
 * Error response helper function
 * @param {string} message - Error message
 * @param {number} statusCode - HTTP status code
 * @param {any} details - Additional error details
 * @returns {GatewayError} GatewayError instance
 */
export const errorResponse = (message, statusCode = 500, details = null) => {
  return new GatewayError(message, statusCode, details);
};

/**
 * ModelGateway class - Main class for model management
 */
export default class ModelGateway {
  /**
   * Constructor
   */
  constructor() {
    // Initialize components
    this.modelRouter = new ModelRouter();
    this.costTracker = new CostTracker();
    this.loadBalancer = new LoadBalancer();
    // Set configuration from environment variables
    this.timeout = parseInt(process.env.MODEL_GATEWAY_TIMEOUT) || 30000;
    this.maxRetries = parseInt(process.env.MODEL_GATEWAY_MAX_RETRIES) || 3;
    // Initialize LRU cache
    this.cache = new LRU({
      max: CACHE_MAX_SIZE,
      ttl: CACHE_TTL,
      updateAgeOnGet: true
    });
  }

  /**
   * Register a model
   * @param {string} modelId - Model ID
   * @param {object} modelConfig - Model configuration
   * @param {number} weight - Model weight for load balancing
   */
  registerModel(modelId, modelConfig, weight = 1) {
    this.modelRouter.registerModel(modelId, modelConfig);
    this.loadBalancer.registerModel(modelId, weight);
  }

  /**
   * Remove a model
   * @param {string} modelId - Model ID
   * @returns {boolean} True if model was removed, false otherwise
   */
  removeModel(modelId) {
    this.modelRouter.removeModel(modelId);
    return this.loadBalancer.removeModel(modelId);
  }

  /**
   * Add a routing rule
   * @param {function} condition - Routing condition function
   * @param {string} modelId - Model ID to route to
   */
  addRoutingRule(condition, modelId) {
    this.modelRouter.addRoutingRule(condition, modelId);
  }

  /**
   * Process a request
   * @param {object} request - Request object
   * @returns {Promise<any>} Model response
   */
  async processRequest(request) {
    try {
      // Route the request
      const route = this.modelRouter.routeRequest(request);
      const { modelId, modelConfig } = route;

      // Check rate limit
      if (!this.costTracker.checkRateLimit(modelId)) {
        throw errorResponse(`Rate limit exceeded for model ${modelId}`, 429);
      }

      // Select a healthy model
      const selectedModel = this.loadBalancer.selectModel([modelId]);
      if (!selectedModel) {
        throw errorResponse(`No healthy models available`, 503);
      }

      // Retry mechanism
      let retries = 0;
      while (retries <= this.maxRetries) {
        try {
          const start = Date.now();
          
          // Add timeout to the request
          const timeoutPromise = new Promise((_, reject) => 
            setTimeout(() => reject(errorResponse(`Request timeout after ${this.timeout}ms`, 408)), this.timeout)
          );

          // Execute the model with timeout
          const response = await Promise.race([
            modelConfig.execute(request),
            timeoutPromise
          ]);
          
          const duration = Date.now() - start;

          // Calculate and track cost
          const cost = this.calculateCost(modelId, duration, request);
          this.costTracker.addCost(modelId, cost, {
            duration,
            requestSize: JSON.stringify(request).length
          });
          this.loadBalancer.updateModelLoad(modelId, duration);
          this.loadBalancer.setHealthy(modelId, true);

          return response;
        } catch (error) {
          // Mark model as unhealthy
          this.loadBalancer.setHealthy(modelId, false);
          
          // Throw error if max retries reached
          if (retries >= this.maxRetries) {
            throw errorResponse(`Failed to process request after ${this.maxRetries} retries`, 500, error.message);
          }
          
          // Retry with backoff
          retries++;
          console.warn(`Request failed, retrying ${retries}/${this.maxRetries}...`);
          await new Promise(resolve => setTimeout(resolve, 1000 * retries));
        }
      }
    } catch (error) {
      // Ensure consistent error format
      if (error instanceof GatewayError) {
        throw error;
      } else {
        throw errorResponse(`Internal server error`, 500, error.message);
      }
    }
  }

  /**
   * Calculate cost for a model request
   * @param {string} modelId - Model ID
   * @param {number} duration - Request duration in milliseconds
   * @param {object} request - Request object
   * @returns {number} Calculated cost
   */
  calculateCost(modelId, duration, request) {
    const modelConfig = this.modelRouter.getModel(modelId);
    if (!modelConfig || !modelConfig.costPerSecond) {
      return 0;
    }

    return (duration / 1000) * modelConfig.costPerSecond;
  }

  /**
   * Get model statistics
   * @returns {object} Model statistics
   */
  getModelStats() {
    return {
      models: this.modelRouter.getAllModels(),
      costs: this.costTracker.getAllCosts(),
      load: this.loadBalancer.getModelStats(),
      totalCost: this.costTracker.getTotalCost(),
      cacheStats: {
        size: this.cache.size,
        max: this.cache.max
      }
    };
  }

  /**
   * Get system statistics
   * @returns {object} System statistics
   */
  getSystemStats() {
    return {
      memory: process.memoryUsage(),
      uptime: process.uptime(),
      cache: {
        size: this.cache.size,
        max: this.cache.max
      }
    };
  }

  /**
   * Set rate limit for a model
   * @param {string} modelId - Model ID
   * @param {number} limit - Maximum number of requests
   * @param {number} windowMs - Time window in milliseconds
   */
  setRateLimit(modelId, limit, windowMs) {
    this.costTracker.setRateLimit(modelId, limit, windowMs);
  }

  /**
   * Set load balancing strategy
   * @param {string} strategy - Load balancing strategy
   */
  setLoadBalancingStrategy(strategy) {
    this.loadBalancer.setStrategy(strategy);
  }

  /**
   * Start health checks
   * @param {function} healthCheckFn - Health check function
   * @param {number} intervalMs - Interval in milliseconds
   */
  startHealthChecks(healthCheckFn, intervalMs = 30000) {
    this.loadBalancer.startHealthChecks(healthCheckFn, intervalMs);
  }

  /**
   * Stop health checks
   */
  stopHealthChecks() {
    this.loadBalancer.stopHealthChecks();
  }

  /**
   * Generate JWT token
   * @param {object} payload - Token payload
   * @returns {string} JWT token
   */
  generateToken(payload) {
    return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
  }

  /**
   * Verify JWT token
   * @param {string} token - JWT token
   * @returns {object} Decoded payload
   */
  verifyToken(token) {
    try {
      return jwt.verify(token, JWT_SECRET);
    } catch (error) {
      throw errorResponse('Invalid or expired token', 401);
    }
  }

  /**
   * Authentication middleware
   * @param {object} req - Express request object
   * @param {object} res - Express response object
   * @param {function} next - Express next function
   */
  authenticate(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    
    if (!token) {
      return res.status(401).json(errorResponse('Access token required', 401).toJSON());
    }
    
    try {
      const user = this.verifyToken(token);
      req.user = user;
      next();
    } catch (error) {
      return res.status(401).json(error.toJSON());
    }
  }

  /**
   * Role-based authorization middleware
   * @param {string} role - Required role
   * @returns {function} Middleware function
   */
  requireRole(role) {
    return (req, res, next) => {
      if (!req.user || req.user.role !== role) {
        return res.status(403).json(errorResponse('Insufficient permissions', 403).toJSON());
      }
      next();
    };
  }

  /**
   * Validate request data
   * @param {object} request - Request object to validate
   * @param {object} schema - Validation schema
   * @returns {object} Validation result
   */
  validateRequest(request, schema) {
    const errors = [];
    
    // Check required fields
    if (schema.required) {
      for (const field of schema.required) {
        if (!request[field]) {
          errors.push(`Required field ${field} is missing`);
        }
      }
    }
    
    // Check field types
    if (schema.types) {
      for (const [field, type] of Object.entries(schema.types)) {
        if (request[field] && typeof request[field] !== type) {
          errors.push(`Field ${field} must be of type ${type}`);
        }
      }
    }
    
    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * Request validation middleware
   * @param {object} schema - Validation schema
   * @returns {function} Middleware function
   */
  validate(schema) {
    return (req, res, next) => {
      const validation = this.validateRequest(req.body || req, schema);
      if (!validation.valid) {
        return res.status(400).json(errorResponse('Validation error', 400, validation.errors).toJSON());
      }
      next();
    };
  }

  /**
   * Set cache value
   * @param {string} key - Cache key
   * @param {any} value - Cache value
   * @param {number} ttl - Time to live in milliseconds
   */
  setCache(key, value, ttl = CACHE_TTL) {
    this.cache.set(key, value, { ttl });
  }

  /**
   * Get cache value
   * @param {string} key - Cache key
   * @returns {any} Cached value or null if not found or expired
   */
  getCache(key) {
    return this.cache.get(key) || null;
  }

  /**
   * Clear cache
   * @param {string} key - Cache key (optional, clears all if not provided)
   */
  clearCache(key) {
    if (key) {
      this.cache.delete(key);
    } else {
      this.cache.clear();
    }
  }

  /**
   * Cache middleware
   * @param {number} ttl - Time to live in milliseconds
   * @returns {function} Middleware function
   */
  cacheMiddleware(ttl = CACHE_TTL) {
    return (req, res, next) => {
      const key = req.originalUrl || JSON.stringify(req.body);
      const cached = this.getCache(key);

      if (cached) {
        res.set('X-Cache', 'HIT');
        return res.json(cached);
      }

      const originalSend = res.json;
      res.json = function(data) {
        this.set('X-Cache', 'MISS');
        originalSend.call(this, data);
      };

      next();
    };
  }

  /**
   * Process request with cache
   * @param {object} request - Request object
   * @param {number} ttl - Time to live in milliseconds
   * @returns {Promise<any>} Model response
   */
  async processRequestWithCache(request, ttl = CACHE_TTL) {
    const cacheKey = JSON.stringify(request);
    const cachedResponse = this.getCache(cacheKey);

    if (cachedResponse) {
      return cachedResponse;
    }

    const response = await this.processRequest(request);
    this.setCache(cacheKey, response, ttl);
    return response;
  }
}

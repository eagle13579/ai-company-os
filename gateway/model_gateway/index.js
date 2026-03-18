/**
 * ModelGateway class - Main class for model management, routing, and cost tracking
 */
const ModelRouter = require('./model_router');
const CostTracker = require('./cost_tracker');
const LoadBalancer = require('./load_balancer');
const dotenv = require('dotenv');
const jwt = require('jsonwebtoken');

// Load environment variables
dotenv.config();

// JWT configuration
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-here';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';

/**
 * GatewayError class - Custom error class for consistent error responses
 */
class GatewayError extends Error {
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
const errorResponse = (message, statusCode = 500, details = null) => {
  return new GatewayError(message, statusCode, details);
};

/**
 * ModelGateway class - Main class for model management
 */
class ModelGateway {
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
    // Initialize cache
    this.cache = new Map();
  }

  /**
   * Register a model
   * @param {string} modelId - Model ID
   * @param {object} modelConfig - Model configuration
   */
  registerModel(modelId, modelConfig) {
    this.modelRouter.registerModel(modelId, modelConfig);
    this.loadBalancer.registerModel(modelId);
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
      const load = this.loadBalancer.selectModel([modelId]);
      if (!load) {
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
          this.costTracker.addCost(modelId, cost);
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
      totalCost: this.costTracker.getTotalCost()
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
  setCache(key, value, ttl = 3600000) { // Default 1 hour
    const expiration = Date.now() + ttl;
    this.cache.set(key, { value, expiration });
  }

  /**
   * Get cache value
   * @param {string} key - Cache key
   * @returns {any} Cached value or null if not found or expired
   */
  getCache(key) {
    const item = this.cache.get(key);
    if (!item) {
      return null;
    }

    if (Date.now() > item.expiration) {
      this.cache.delete(key);
      return null;
    }

    return item.value;
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
  cacheMiddleware(ttl = 3600000) {
    return (req, res, next) => {
      const key = req.originalUrl || JSON.stringify(req.body);
      const cached = this.getCache(key);

      if (cached) {
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
  async processRequestWithCache(request, ttl = 3600000) {
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

module.exports = ModelGateway;
module.exports.GatewayError = GatewayError;
module.exports.errorResponse = errorResponse;
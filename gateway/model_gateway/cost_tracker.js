/**
 * CostTracker class - Tracks model usage costs and rate limits
 */
export default class CostTracker {
  /**
   * Constructor
   */
  constructor() {
    // Map to store model costs
    this.costs = new Map();
    // Map to store rate limits
    this.rateLimits = new Map();
  }

  /**
   * Add cost for a model
   * @param {string} modelId - Model ID
   * @param {number} cost - Cost to add
   * @param {object} metadata - Additional metadata for the cost
   */
  addCost(modelId, cost, metadata = {}) {
    if (!this.costs.has(modelId)) {
      this.costs.set(modelId, { 
        total: 0, 
        calls: 0,
        metadata: []
      });
    }

    const modelCost = this.costs.get(modelId);
    modelCost.total += cost;
    modelCost.calls += 1;
    modelCost.metadata.push({ ...metadata, timestamp: Date.now(), cost });

    this.costs.set(modelId, modelCost);
  }

  /**
   * Get cost for a model
   * @param {string} modelId - Model ID
   * @returns {object} Object containing total cost and call count
   */
  getCost(modelId) {
    return this.costs.get(modelId) || { total: 0, calls: 0, metadata: [] };
  }

  /**
   * Get all model costs
   * @returns {array} Array of cost objects
   */
  getAllCosts() {
    return Array.from(this.costs.entries()).map(([modelId, cost]) => ({
      modelId,
      ...cost
    }));
  }

  /**
   * Set rate limit for a model
   * @param {string} modelId - Model ID
   * @param {number} limit - Maximum number of requests
   * @param {number} windowMs - Time window in milliseconds
   */
  setRateLimit(modelId, limit, windowMs) {
    this.rateLimits.set(modelId, {
      limit,
      windowMs,
      calls: [],
      lastReset: Date.now()
    });
  }

  /**
   * Check if a request is within rate limit
   * @param {string} modelId - Model ID
   * @returns {boolean} True if within rate limit, false otherwise
   */
  checkRateLimit(modelId) {
    const rateLimit = this.rateLimits.get(modelId);
    if (!rateLimit) {
      return true;
    }

    const now = Date.now();
    // Reset if window has passed
    if (now - rateLimit.lastReset > rateLimit.windowMs) {
      rateLimit.calls = [];
      rateLimit.lastReset = now;
    }

    // Filter out calls outside the window
    rateLimit.calls = rateLimit.calls.filter(callTime => now - callTime <= rateLimit.windowMs);

    // Check if limit is exceeded
    if (rateLimit.calls.length >= rateLimit.limit) {
      return false;
    }

    // Add current call
    rateLimit.calls.push(now);
    this.rateLimits.set(modelId, rateLimit);
    return true;
  }

  /**
   * Check rate limit status for a model
   * @param {string} modelId - Model ID
   * @returns {object} Rate limit status
   */
  getRateLimitStatus(modelId) {
    const rateLimit = this.rateLimits.get(modelId);
    if (!rateLimit) {
      return { limited: false, remaining: Infinity, reset: null };
    }

    const now = Date.now();
    // Reset if window has passed
    if (now - rateLimit.lastReset > rateLimit.windowMs) {
      rateLimit.calls = [];
      rateLimit.lastReset = now;
    }

    // Filter out calls outside the window
    rateLimit.calls = rateLimit.calls.filter(callTime => now - callTime <= rateLimit.windowMs);

    return {
      limited: rateLimit.calls.length >= rateLimit.limit,
      remaining: Math.max(0, rateLimit.limit - rateLimit.calls.length),
      reset: rateLimit.lastReset + rateLimit.windowMs
    };
  }

  /**
   * Get total cost across all models
   * @returns {number} Total cost
   */
  getTotalCost() {
    return Array.from(this.costs.values()).reduce((total, cost) => total + cost.total, 0);
  }

  /**
   * Reset all costs
   */
  resetCosts() {
    this.costs.clear();
  }

  /**
   * Reset costs for a specific model
   * @param {string} modelId - Model ID
   */
  resetModelCosts(modelId) {
    this.costs.delete(modelId);
  }

  /**
   * Reset all rate limits
   */
  resetRateLimits() {
    this.rateLimits.clear();
  }

  /**
   * Reset rate limit for a specific model
   * @param {string} modelId - Model ID
   */
  resetModelRateLimit(modelId) {
    this.rateLimits.delete(modelId);
  }
}
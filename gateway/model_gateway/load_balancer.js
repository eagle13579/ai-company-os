/**
 * LoadBalancer class - Manages model load balancing and health monitoring
 */
export default class LoadBalancer {
  /**
   * Constructor
   */
  constructor() {
    // Map to store model statistics
    this.modelStats = new Map();
    // Load balancing strategy
    this.strategy = 'roundRobin';
    // Current index for round robin strategy
    this.currentIndex = 0;
    // Health check interval
    this.healthCheckInterval = null;
  }

  /**
   * Register a model for load balancing
   * @param {string} modelId - Model ID
   * @param {number} weight - Model weight for weighted round robin (default: 1)
   */
  registerModel(modelId, weight = 1) {
    if (!this.modelStats.has(modelId)) {
      this.modelStats.set(modelId, {
        load: 0,
        lastUsed: Date.now(),
        healthy: true,
        weight,
        currentWeight: weight
      });
    }
  }

  /**
   * Remove a model from load balancing
   * @param {string} modelId - Model ID
   * @returns {boolean} True if model was removed, false otherwise
   */
  removeModel(modelId) {
    return this.modelStats.delete(modelId);
  }

  /**
   * Update model load
   * @param {string} modelId - Model ID
   * @param {number} load - Load value
   */
  updateModelLoad(modelId, load) {
    const stats = this.modelStats.get(modelId);
    if (stats) {
      stats.load = load;
      stats.lastUsed = Date.now();
      this.modelStats.set(modelId, stats);
    }
  }

  /**
   * Set model health status
   * @param {string} modelId - Model ID
   * @param {boolean} healthy - Health status
   */
  setHealthy(modelId, healthy) {
    const stats = this.modelStats.get(modelId);
    if (stats) {
      stats.healthy = healthy;
      this.modelStats.set(modelId, stats);
    }
  }

  /**
   * Set load balancing strategy
   * @param {string} strategy - Strategy name ('roundRobin', 'leastLoad', 'leastRecentlyUsed', 'weightedRoundRobin')
   */
  setStrategy(strategy) {
    this.strategy = strategy;
  }

  /**
   * Select a model based on the current strategy
   * @param {array} availableModels - Array of available model IDs
   * @returns {string|null} Selected model ID or null if no healthy models
   */
  selectModel(availableModels) {
    // Filter out unhealthy models
    const healthyModels = availableModels.filter(modelId => {
      const stats = this.modelStats.get(modelId);
      return stats && stats.healthy;
    });

    if (healthyModels.length === 0) {
      return null;
    }

    // Select model based on strategy
    switch (this.strategy) {
      case 'roundRobin':
        return this.roundRobin(healthyModels);
      case 'leastLoad':
        return this.leastLoad(healthyModels);
      case 'leastRecentlyUsed':
        return this.leastRecentlyUsed(healthyModels);
      case 'weightedRoundRobin':
        return this.weightedRoundRobin(healthyModels);
      default:
        return this.roundRobin(healthyModels);
    }
  }

  /**
   * Round robin selection strategy
   * @param {array} healthyModels - Array of healthy model IDs
   * @returns {string} Selected model ID
   */
  roundRobin(healthyModels) {
    const selected = healthyModels[this.currentIndex % healthyModels.length];
    this.currentIndex++;
    return selected;
  }

  /**
   * Least load selection strategy
   * @param {array} healthyModels - Array of healthy model IDs
   * @returns {string} Selected model ID
   */
  leastLoad(healthyModels) {
    let selectedModel = healthyModels[0];
    let minLoad = this.modelStats.get(selectedModel).load;

    for (const modelId of healthyModels) {
      const load = this.modelStats.get(modelId).load;
      if (load < minLoad) {
        minLoad = load;
        selectedModel = modelId;
      }
    }

    return selectedModel;
  }

  /**
   * Least recently used selection strategy
   * @param {array} healthyModels - Array of healthy model IDs
   * @returns {string} Selected model ID
   */
  leastRecentlyUsed(healthyModels) {
    let selectedModel = healthyModels[0];
    let earliestTime = this.modelStats.get(selectedModel).lastUsed;

    for (const modelId of healthyModels) {
      const lastUsed = this.modelStats.get(modelId).lastUsed;
      if (lastUsed < earliestTime) {
        earliestTime = lastUsed;
        selectedModel = modelId;
      }
    }

    return selectedModel;
  }

  /**
   * Weighted round robin selection strategy
   * @param {array} healthyModels - Array of healthy model IDs
   * @returns {string} Selected model ID
   */
  weightedRoundRobin(healthyModels) {
    let totalWeight = 0;
    let bestModel = null;
    let bestWeight = -1;

    for (const modelId of healthyModels) {
      const stats = this.modelStats.get(modelId);
      stats.currentWeight += stats.weight;
      totalWeight += stats.weight;

      if (stats.currentWeight > bestWeight) {
        bestWeight = stats.currentWeight;
        bestModel = modelId;
      }

      this.modelStats.set(modelId, stats);
    }

    if (bestModel) {
      const stats = this.modelStats.get(bestModel);
      stats.currentWeight -= totalWeight;
      this.modelStats.set(bestModel, stats);
    }

    return bestModel;
  }

  /**
   * Get model statistics
   * @returns {array} Array of model stats objects
   */
  getModelStats() {
    return Array.from(this.modelStats.entries()).map(([modelId, stats]) => ({
      modelId,
      ...stats
    }));
  }

  /**
   * Get model health status
   * @param {string} modelId - Model ID
   * @returns {boolean} Health status
   */
  getModelHealth(modelId) {
    const stats = this.modelStats.get(modelId);
    return stats ? stats.healthy : false;
  }

  /**
   * Start health check interval
   * @param {function} healthCheckFn - Health check function to execute
   * @param {number} intervalMs - Interval in milliseconds
   */
  startHealthChecks(healthCheckFn, intervalMs = 30000) {
    this.stopHealthChecks();
    this.healthCheckInterval = setInterval(() => {
      for (const [modelId, stats] of this.modelStats.entries()) {
        healthCheckFn(modelId).then(healthy => {
          this.setHealthy(modelId, healthy);
        }).catch(() => {
          this.setHealthy(modelId, false);
        });
      }
    }, intervalMs);
  }

  /**
   * Stop health check interval
   */
  stopHealthChecks() {
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
      this.healthCheckInterval = null;
    }
  }

  /**
   * Reset all statistics
   */
  resetStats() {
    this.modelStats.clear();
    this.currentIndex = 0;
  }
}
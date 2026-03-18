/**
 * LoadBalancer class - Manages model load balancing and health monitoring
 */
class LoadBalancer {
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
  }

  /**
   * Register a model for load balancing
   * @param {string} modelId - Model ID
   */
  registerModel(modelId) {
    if (!this.modelStats.has(modelId)) {
      this.modelStats.set(modelId, {
        load: 0,
        lastUsed: Date.now(),
        healthy: true
      });
    }
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
   * @param {string} strategy - Strategy name ('roundRobin', 'leastLoad', 'leastRecentlyUsed')
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
   * Reset all statistics
   */
  resetStats() {
    this.modelStats.clear();
    this.currentIndex = 0;
  }
}

module.exports = LoadBalancer;
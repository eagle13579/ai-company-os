/**
 * ModelRouter class - Handles model registration and routing
 */
export default class ModelRouter {
  /**
   * Constructor
   */
  constructor() {
    // Map to store registered models
    this.models = new Map();
    // Array to store routing rules
    this.routingRules = [];
  }

  /**
   * Register a model with configuration
   * @param {string} modelId - Unique identifier for the model
   * @param {object} modelConfig - Model configuration object
   */
  registerModel(modelId, modelConfig) {
    this.models.set(modelId, modelConfig);
  }

  /**
   * Remove a model by ID
   * @param {string} modelId - Model ID to remove
   * @returns {boolean} True if model was removed, false otherwise
   */
  removeModel(modelId) {
    return this.models.delete(modelId);
  }

  /**
   * Clear all models and routing rules
   */
  clear() {
    this.models.clear();
    this.routingRules = [];
  }

  /**
   * Add a routing rule
   * @param {function} condition - Function that evaluates to true if the rule should be applied
   * @param {string} modelId - Model ID to route to if condition is true
   */
  addRoutingRule(condition, modelId) {
    this.routingRules.push({ condition, modelId });
  }

  /**
   * Route a request to the appropriate model
   * @param {object} request - Request object to route
   * @returns {object} Object containing modelId and modelConfig
   */
  routeRequest(request) {
    // Check each routing rule
    for (const rule of this.routingRules) {
      if (rule.condition(request)) {
        const modelConfig = this.models.get(rule.modelId);
        if (modelConfig) {
          return { modelId: rule.modelId, modelConfig };
        }
      }
    }

    // Fallback to default model if no rules match
    return this.getDefaultModel();
  }

  /**
   * Get the default model (first registered model)
   * @returns {object} Object containing modelId and modelConfig
   * @throws {Error} If no models are registered
   */
  getDefaultModel() {
    if (this.models.size === 0) {
      throw new Error('No models registered');
    }

    // Return the first registered model
    return { modelId: this.models.keys().next().value, modelConfig: this.models.values().next().value };
  }

  /**
   * Get a model by ID
   * @param {string} modelId - Model ID
   * @returns {object|null} Model configuration or null if not found
   */
  getModel(modelId) {
    return this.models.get(modelId);
  }

  /**
   * Get all registered models
   * @returns {array} Array of model objects with their IDs
   */
  getAllModels() {
    return Array.from(this.models.entries()).map(([id, config]) => ({ id, ...config }));
  }
}
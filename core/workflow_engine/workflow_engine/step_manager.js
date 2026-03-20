class StepManager {
  constructor() {
    this.stepHandlers = new Map();
    this.registerDefaultHandlers();
  }

  registerStepHandler(type, handler) {
    this.stepHandlers.set(type, handler);
  }

  registerDefaultHandlers() {
    // 注册默认的步骤处理器
    this.registerStepHandler('function', this.executeFunctionStep.bind(this));
    this.registerStepHandler('asyncFunction', this.executeAsyncFunctionStep.bind(this));
    this.registerStepHandler('http', this.executeHttpStep.bind(this));
  }

  async executeStep(step) {
    const handler = this.stepHandlers.get(step.type);
    if (!handler) {
      throw new Error(`No handler registered for step type: ${step.type}`);
    }

    const maxRetries = step.retries?.max || 0;
    const retryInterval = step.retries?.interval || 1000;
    let retries = 0;

    while (true) {
      try {
        return await handler(step);
      } catch (error) {
        if (retries < maxRetries) {
          retries++;
          console.log(`Step ${step.id} failed, retrying ${retries}/${maxRetries}...`);
          await new Promise(resolve => setTimeout(resolve, retryInterval));
        } else {
          throw new Error(`Error executing step ${step.id}: ${error.message}`);
        }
      }
    }
  }

  executeFunctionStep(step) {
    if (typeof step.func !== 'function') {
      throw new Error('Function step requires a func property');
    }

    return step.func(step.params || {});
  }

  async executeAsyncFunctionStep(step) {
    if (typeof step.func !== 'function') {
      throw new Error('Async function step requires a func property');
    }

    return await step.func(step.params || {});
  }

  async executeHttpStep(step) {
    const { url, method = 'GET', headers = {}, body, timeout = 30000 } = step.params || {};

    if (!url) {
      throw new Error('HTTP step requires a url property');
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await fetch(url, {
        method,
        headers,
        body: body ? JSON.stringify(body) : undefined,
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP error: ${response.status} ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      clearTimeout(timeoutId);
      throw error;
    }
  }

  getRegisteredHandlers() {
    return Array.from(this.stepHandlers.keys());
  }

  unregisterStepHandler(type) {
    this.stepHandlers.delete(type);
  }
}

module.exports = StepManager;
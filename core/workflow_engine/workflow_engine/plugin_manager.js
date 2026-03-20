class PluginManager {
  constructor() {
    this.plugins = new Map();
    this.hooks = new Map();
  }

  registerPlugin(name, plugin) {
    if (!name || !plugin) {
      throw new Error('Plugin name and plugin object are required');
    }

    this.plugins.set(name, plugin);
    
    // 注册插件的钩子
    if (plugin.hooks) {
      for (const [hookName, hookFn] of Object.entries(plugin.hooks)) {
        if (!this.hooks.has(hookName)) {
          this.hooks.set(hookName, []);
        }
        this.hooks.get(hookName).push(hookFn);
      }
    }

    console.log(`Plugin ${name} registered successfully`);
  }

  unregisterPlugin(name) {
    const plugin = this.plugins.get(name);
    if (plugin && plugin.hooks) {
      // 移除插件的钩子
      for (const [hookName, hookFn] of Object.entries(plugin.hooks)) {
        if (this.hooks.has(hookName)) {
          const hookFns = this.hooks.get(hookName);
          const index = hookFns.indexOf(hookFn);
          if (index > -1) {
            hookFns.splice(index, 1);
          }
        }
      }
    }

    this.plugins.delete(name);
    console.log(`Plugin ${name} unregistered successfully`);
  }

  getPlugin(name) {
    return this.plugins.get(name);
  }

  getAllPlugins() {
    return Array.from(this.plugins.entries());
  }

  async executeHook(hookName, ...args) {
    if (!this.hooks.has(hookName)) {
      return [];
    }

    const hookFns = this.hooks.get(hookName);
    const results = [];

    for (const hookFn of hookFns) {
      try {
        const result = await hookFn(...args);
        results.push(result);
      } catch (error) {
        console.error(`Error executing hook ${hookName}:`, error);
      }
    }

    return results;
  }

  loadPlugins(plugins) {
    if (Array.isArray(plugins)) {
      for (const plugin of plugins) {
        if (plugin.name && plugin.plugin) {
          this.registerPlugin(plugin.name, plugin.plugin);
        }
      }
    }
  }

  // 内置钩子类型
  getAvailableHooks() {
    return [
      'beforeWorkflowCreate',
      'afterWorkflowCreate',
      'beforeWorkflowStart',
      'afterWorkflowStart',
      'beforeWorkflowComplete',
      'afterWorkflowComplete',
      'beforeWorkflowFail',
      'afterWorkflowFail',
      'beforeStepExecute',
      'afterStepExecute',
      'beforeStepRollback',
      'afterStepRollback'
    ];
  }
}

module.exports = PluginManager;
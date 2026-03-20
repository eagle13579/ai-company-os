const IDecisionEngine = require('./interfaces/IDecisionEngine');
const config = require('./config/config');
const { Logger, ErrorHandler, Utils } = require('./utils/utils');

class DecisionEngine extends IDecisionEngine {
  constructor() {
    super();
    this.resourceUtilization = new Map();
  }

  async allocateResources(tasks, resources) {
    try {
      Logger.info('Allocating resources', {
        taskCount: tasks.length,
        resourceCount: resources.length,
      });

      const allocation = {
        id: Utils.generateId('allocation'),
        tasks: [],
        resources: [],
        created_at: new Date().toISOString(),
      };

      for (const task of tasks) {
        const allocatedResources = this.findSuitableResources(task, resources);
        if (allocatedResources.length > 0) {
          const taskAllocation = {
            task_id: task.id,
            resources: allocatedResources.map((r) => r.id),
            status: 'allocated',
          };
          allocation.tasks.push(taskAllocation);

          allocatedResources.forEach((resource) => {
            this.updateResourceUtilization(resource.id, task.id);
          });
        }
      }

      allocation.resources = resources.map((resource) => ({
        id: resource.id,
        name: resource.name,
        type: resource.type,
        utilization: this.resourceUtilization.get(resource.id) || 0,
      }));

      Logger.info('Resource allocation completed', {
        allocatedTasks: allocation.tasks.length,
      });
      return allocation;
    } catch (error) {
      Logger.error('Failed to allocate resources', error);
      throw error;
    }
  }

  findSuitableResources(task, resources) {
    const suitableResources = [];

    for (const resource of resources) {
      if (
        this.isResourceSuitable(resource, task) &&
        this.isResourceAvailable(resource)
      ) {
        suitableResources.push(resource);
        if (suitableResources.length >= this.getRequiredResourceCount(task)) {
          break;
        }
      }
    }

    return suitableResources;
  }

  isResourceSuitable(resource, task) {
    const skillRequirements = this.getTaskSkillRequirements(task);
    return skillRequirements.some((skill) => resource.skills.includes(skill));
  }

  isResourceAvailable(resource) {
    const utilization = this.resourceUtilization.get(resource.id) || 0;
    return utilization < resource.capacity || resource.capacity === -1;
  }

  getTaskSkillRequirements(task) {
    return config.taskSkills[task.name] || ['general'];
  }

  getRequiredResourceCount(task) {
    return (
      config.taskResourceRequirements[task.name] ||
      config.defaults.resourceCount
    );
  }

  updateResourceUtilization(resourceId, taskId) {
    const currentUtilization = this.resourceUtilization.get(resourceId) || 0;
    this.resourceUtilization.set(resourceId, currentUtilization + 1);
  }

  async makeDecision(decisionContext) {
    try {
      Logger.info('Making decision', {
        optionCount: decisionContext.options.length,
      });

      const options = decisionContext.options;
      const criteria = decisionContext.criteria;

      const evaluatedOptions = options.map((option) => ({
        ...option,
        score: this.evaluateOption(option, criteria),
      }));

      const bestOption = evaluatedOptions.sort((a, b) => b.score - a.score)[0];

      const decision = {
        decision: bestOption,
        alternatives: evaluatedOptions.slice(1),
        reasoning: this.generateDecisionReasoning(bestOption, criteria),
        timestamp: new Date().toISOString(),
      };

      Logger.info('Decision made successfully', {
        bestOption: bestOption.name,
      });
      return decision;
    } catch (error) {
      Logger.error('Failed to make decision', error);
      throw error;
    }
  }

  evaluateOption(option, criteria) {
    let score = 0;

    for (const [criterion, weight] of Object.entries(criteria)) {
      if (option[criterion]) {
        score += option[criterion] * weight;
      }
    }

    return score;
  }

  generateDecisionReasoning(option, criteria) {
    const reasoning = [];

    for (const [criterion, weight] of Object.entries(criteria)) {
      if (option[criterion]) {
        reasoning.push(
          `${criterion}: ${option[criterion]} (weight: ${weight})`
        );
      }
    }

    return reasoning;
  }

  async resolveConflict(conflicts) {
    try {
      Logger.info('Resolving conflicts', { conflictCount: conflicts.length });
      const resolutions = [];

      for (const conflict of conflicts) {
        const resolution = this.mediateConflict(conflict);
        resolutions.push(resolution);
      }

      const result = {
        conflicts,
        resolutions,
        timestamp: new Date().toISOString(),
      };

      Logger.info('Conflicts resolved', {
        resolutionCount: resolutions.length,
      });
      return result;
    } catch (error) {
      Logger.error('Failed to resolve conflicts', error);
      throw error;
    }
  }

  mediateConflict(conflict) {
    switch (conflict.type) {
      case 'resource_conflict':
        return this.resolveResourceConflict(conflict);
      case 'priority_conflict':
        return this.resolvePriorityConflict(conflict);
      case 'schedule_conflict':
        return this.resolveScheduleConflict(conflict);
      default:
        return {
          conflict,
          resolution: 'default_resolution',
          reasoning: 'Default conflict resolution applied',
        };
    }
  }

  resolveResourceConflict(conflict) {
    const resources = conflict.resources;
    const tasks = conflict.tasks;

    const prioritizedTasks = tasks.sort((a, b) => b.priority - a.priority);
    const allocation = [];

    for (const task of prioritizedTasks) {
      const availableResources = resources.filter(
        (r) => !allocation.some((a) => a.resourceId === r.id)
      );
      if (availableResources.length > 0) {
        allocation.push({
          taskId: task.id,
          resourceId: availableResources[0].id,
        });
      }
    }

    return {
      conflict,
      resolution: 'resource_allocation',
      allocation,
      reasoning: 'Resources allocated based on task priority',
    };
  }

  resolvePriorityConflict(conflict) {
    const tasks = conflict.tasks;
    const prioritizedTasks = tasks.sort((a, b) => b.priority - a.priority);

    return {
      conflict,
      resolution: 'priority_assignment',
      prioritizedTasks,
      reasoning: 'Tasks prioritized based on urgency and impact',
    };
  }

  resolveScheduleConflict(conflict) {
    const tasks = conflict.tasks;
    const sortedTasks = tasks.sort(
      (a, b) => new Date(a.deadline) - new Date(b.deadline)
    );

    return {
      conflict,
      resolution: 'schedule_adjustment',
      schedule: sortedTasks.map((task, index) => ({
        ...task,
        start_time: this.calculateStartTime(index),
      })),
      reasoning: 'Tasks scheduled based on deadline',
    };
  }

  calculateStartTime(index) {
    const start = new Date();
    start.setHours(start.getHours() + index * 2);
    return start.toISOString();
  }

  async optimizeResourceUsage(resources, tasks) {
    try {
      Logger.info('Optimizing resource usage', {
        resourceCount: resources.length,
        taskCount: tasks.length,
      });

      const optimization = {
        id: Utils.generateId('optimization'),
        resources: [],
        tasks: [],
        savings: 0,
        timestamp: new Date().toISOString(),
      };

      const resourceUtilization = this.calculateResourceUtilization(
        resources,
        tasks
      );
      const optimizedResources = this.reduceResourceWaste(resourceUtilization);

      optimization.resources = optimizedResources;
      optimization.savings = this.calculateSavings(
        resources,
        optimizedResources
      );

      Logger.info('Resource usage optimized', {
        savings: optimization.savings,
      });
      return optimization;
    } catch (error) {
      Logger.error('Failed to optimize resource usage', error);
      throw error;
    }
  }

  calculateResourceUtilization(resources, tasks) {
    return resources.map((resource) => ({
      ...resource,
      utilization: this.resourceUtilization.get(resource.id) || 0,
      efficiency: this.calculateResourceEfficiency(resource, tasks),
    }));
  }

  calculateResourceEfficiency(resource, tasks) {
    const utilization = this.resourceUtilization.get(resource.id) || 0;
    return resource.capacity > 0 ? (utilization / resource.capacity) * 100 : 0;
  }

  reduceResourceWaste(resourceUtilization) {
    return resourceUtilization.map((resource) => {
      if (resource.efficiency < config.thresholds.resourceEfficiency.low) {
        return {
          ...resource,
          optimized_capacity: Math.max(1, Math.floor(resource.capacity * 0.7)),
        };
      }
      return resource;
    });
  }

  calculateSavings(originalResources, optimizedResources) {
    let savings = 0;
    for (let i = 0; i < originalResources.length; i++) {
      const original = originalResources[i];
      const optimized = optimizedResources[i];
      if (optimized.optimized_capacity) {
        savings += original.capacity - optimized.optimized_capacity;
      }
    }
    return savings;
  }
}

module.exports = DecisionEngine;

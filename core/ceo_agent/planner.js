const IPlanner = require('./interfaces/IPlanner');
const config = require('./config/config');
const { Logger, ErrorHandler, Utils } = require('./utils/utils');

class Planner extends IPlanner {
  constructor() {
    super();
    this.taskCounter = 0;
  }

  async createPlan(goals, constraints) {
    try {
      Logger.info('Creating plan', {
        goals: goals.length,
        constraints: Object.keys(constraints),
      });

      const plan = {
        id: Utils.generateId('plan'),
        goals,
        constraints,
        created_at: new Date().toISOString(),
        status: 'created',
      };

      Logger.info('Plan created successfully', { planId: plan.id });
      return plan;
    } catch (error) {
      Logger.error('Failed to create plan', error);
      throw error;
    }
  }

  async breakdownTasks(strategy) {
    try {
      Logger.info('Breaking down tasks for strategy', {
        strategyId: strategy.id,
        goalCount: strategy.goals.length,
      });
      const tasks = [];

      for (const goal of strategy.goals) {
        const subtasks = this.generateTasksForGoal(goal, strategy.constraints);
        tasks.push(...subtasks);
      }

      const prioritizedTasks = this.prioritizeTasks(tasks);
      const tasksWithDependencies = this.addDependencies(prioritizedTasks);

      Logger.info('Task breakdown completed', {
        totalTasks: tasksWithDependencies.length,
      });
      return tasksWithDependencies;
    } catch (error) {
      Logger.error('Failed to break down tasks', error);
      throw error;
    }
  }

  generateTasksForGoal(goal, constraints) {
    const tasks = [];
    const taskTypeConfig = config.taskTypes[goal.type];

    if (taskTypeConfig) {
      for (const taskConfig of taskTypeConfig.tasks) {
        tasks.push(
          this.createTask(
            taskConfig.name,
            taskConfig.description,
            taskConfig.priority
          )
        );
      }
    } else {
      tasks.push(
        this.createTask('Generic task', `Work on ${goal.description}`, 1)
      );
    }

    return tasks;
  }

  createTask(name, description, priority) {
    this.taskCounter++;
    return {
      id: Utils.generateId('task'),
      name,
      description,
      priority,
      status: 'pending',
      estimated_duration: this.estimateDuration(name),
      created_at: new Date().toISOString(),
    };
  }

  estimateDuration(taskName) {
    return config.taskDurations[taskName] || config.defaults.taskDuration;
  }

  prioritizeTasks(tasks) {
    return tasks.sort((a, b) => b.priority - a.priority);
  }

  addDependencies(tasks) {
    const taskMap = new Map();
    tasks.forEach((task) => taskMap.set(task.id, task));

    for (let i = 1; i < tasks.length; i++) {
      tasks[i].dependencies = [tasks[i - 1].id];
    }

    return tasks;
  }

  async updateTaskStatus(taskId, status) {
    try {
      Logger.info('Updating task status', { taskId, status });
      return {
        taskId,
        status,
        updated_at: new Date().toISOString(),
      };
    } catch (error) {
      Logger.error('Failed to update task status', error, { taskId, status });
      throw error;
    }
  }

  async generateTimeline(tasks) {
    try {
      Logger.info('Generating timeline', { taskCount: tasks.length });
      const timeline = {
        start_date: new Date().toISOString(),
        end_date: this.calculateEndDate(tasks),
        tasks: tasks.map((task) => ({
          ...task,
          start_date: this.calculateTaskStartDate(task, tasks),
          end_date: this.calculateTaskEndDate(task),
        })),
      };

      Logger.info('Timeline generated successfully', {
        startDate: timeline.start_date,
        endDate: timeline.end_date,
      });
      return timeline;
    } catch (error) {
      Logger.error('Failed to generate timeline', error);
      throw error;
    }
  }

  calculateEndDate(tasks) {
    const totalDuration = tasks.reduce(
      (sum, task) => sum + task.estimated_duration,
      0
    );
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + totalDuration);
    return endDate.toISOString();
  }

  calculateTaskStartDate(task, tasks) {
    if (!task.dependencies || task.dependencies.length === 0) {
      return new Date().toISOString();
    }

    const dependency = tasks.find((t) => t.id === task.dependencies[0]);
    if (dependency) {
      const startDate = new Date(dependency.end_date || new Date());
      startDate.setDate(startDate.getDate() + 1);
      return startDate.toISOString();
    }

    return new Date().toISOString();
  }

  calculateTaskEndDate(task) {
    const endDate = new Date(task.start_date || new Date());
    endDate.setDate(endDate.getDate() + task.estimated_duration);
    return endDate.toISOString();
  }
}

module.exports = Planner;

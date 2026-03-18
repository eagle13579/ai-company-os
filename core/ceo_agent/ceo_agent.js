const { Logger, ErrorHandler, Validator, Utils } = require('./utils/utils');
const IPlanner = require('./interfaces/IPlanner');
const IDecisionEngine = require('./interfaces/IDecisionEngine');
const IReviewEngine = require('./interfaces/IReviewEngine');

class CEOAgent {
  constructor() {
    this.planner = null;
    this.decisionEngine = null;
    this.reviewEngine = null;
  }

  setPlanner(planner) {
    if (!(planner instanceof IPlanner)) {
      throw ErrorHandler.createError(
        'INVALID_PLANNER',
        'Planner must implement IPlanner interface'
      );
    }
    this.planner = planner;
    Logger.info('Planner set successfully');
  }

  setDecisionEngine(decisionEngine) {
    if (!(decisionEngine instanceof IDecisionEngine)) {
      throw ErrorHandler.createError(
        'INVALID_DECISION_ENGINE',
        'Decision engine must implement IDecisionEngine interface'
      );
    }
    this.decisionEngine = decisionEngine;
    Logger.info('Decision engine set successfully');
  }

  setReviewEngine(reviewEngine) {
    if (!(reviewEngine instanceof IReviewEngine)) {
      throw ErrorHandler.createError(
        'INVALID_REVIEW_ENGINE',
        'Review engine must implement IReviewEngine interface'
      );
    }
    this.reviewEngine = reviewEngine;
    Logger.info('Review engine set successfully');
  }

  async strategicPlanning(goals, constraints) {
    try {
      Validator.validateGoals(goals);
      Validator.validateConstraints(constraints);

      if (!this.planner) {
        throw ErrorHandler.createError(
          'PLANNER_NOT_INITIALIZED',
          'Planner not initialized'
        );
      }

      Logger.info('Starting strategic planning', {
        goals: goals.length,
        constraints: Object.keys(constraints),
      });
      const plan = await this.planner.createPlan(goals, constraints);
      Logger.info('Strategic planning completed successfully', {
        planId: plan.id,
      });
      return plan;
    } catch (error) {
      return ErrorHandler.handleError(error, { action: 'strategicPlanning' });
    }
  }

  async taskBreakdown(strategy) {
    try {
      if (!this.planner) {
        throw ErrorHandler.createError(
          'PLANNER_NOT_INITIALIZED',
          'Planner not initialized'
        );
      }

      Logger.info('Starting task breakdown', { strategyId: strategy.id });
      const tasks = await this.planner.breakdownTasks(strategy);
      Logger.info('Task breakdown completed successfully', {
        taskCount: tasks.length,
      });
      return tasks;
    } catch (error) {
      return ErrorHandler.handleError(error, { action: 'taskBreakdown' });
    }
  }

  async resourceAllocation(tasks, resources) {
    try {
      Validator.validateResources(resources);

      if (!this.decisionEngine) {
        throw ErrorHandler.createError(
          'DECISION_ENGINE_NOT_INITIALIZED',
          'Decision engine not initialized'
        );
      }

      Logger.info('Starting resource allocation', {
        taskCount: tasks.length,
        resourceCount: resources.length,
      });
      const allocation = await this.decisionEngine.allocateResources(
        tasks,
        resources
      );
      Logger.info('Resource allocation completed successfully', {
        allocatedTasks: allocation.tasks.length,
      });
      return allocation;
    } catch (error) {
      return ErrorHandler.handleError(error, { action: 'resourceAllocation' });
    }
  }

  async executePlan(plan) {
    try {
      Logger.info('Starting plan execution', {
        planId: plan.id,
        taskCount: plan.tasks.length,
      });

      const taskPromises = plan.tasks.map((task) => async () => {
        try {
          const result = await this.executeTask(task);
          Logger.info('Task executed successfully', {
            taskId: task.id,
            taskName: task.name,
          });
          return { task, result, status: 'completed' };
        } catch (error) {
          Logger.error('Task execution failed', error, {
            taskId: task.id,
            taskName: task.name,
          });
          return { task, error: error.message, status: 'failed' };
        }
      });

      const results = await Utils.runParallel(taskPromises, 4);

      Logger.info('Plan execution completed', {
        totalTasks: results.length,
        completedTasks: results.filter((r) => r.status === 'completed').length,
      });
      return results;
    } catch (error) {
      return ErrorHandler.handleError(error, { action: 'executePlan' });
    }
  }

  async executeTask(task) {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(`Task ${task.id} executed successfully`);
      }, 1000);
    });
  }

  async reviewResults(results) {
    try {
      if (!this.reviewEngine) {
        throw ErrorHandler.createError(
          'REVIEW_ENGINE_NOT_INITIALIZED',
          'Review engine not initialized'
        );
      }

      Logger.info('Starting results review', { resultCount: results.length });
      const review = await this.reviewEngine.evaluateResults(results);
      Logger.info('Results review completed successfully', {
        reviewId: review.id,
        successRate: review.success_rate,
      });
      return review;
    } catch (error) {
      return ErrorHandler.handleError(error, { action: 'reviewResults' });
    }
  }

  async runStrategy(goals, constraints, resources) {
    try {
      Logger.info('Starting strategy run', {
        goals: goals.length,
        resources: resources.length,
      });

      const strategy = await this.strategicPlanning(goals, constraints);
      if (strategy.status === 'failed') return strategy;

      const tasks = await this.taskBreakdown(strategy);
      if (tasks.status === 'failed') return tasks;

      const allocation = await this.resourceAllocation(tasks, resources);
      if (allocation.status === 'failed') return allocation;

      const plan = {
        strategy,
        tasks,
        allocation,
      };

      const results = await this.executePlan(plan);
      const review = await this.reviewResults(results);

      const result = {
        plan,
        results,
        review,
        status: 'completed',
      };

      Logger.info('Strategy run completed successfully', {
        successRate: review.success_rate,
      });
      return result;
    } catch (error) {
      return ErrorHandler.handleError(error, { action: 'runStrategy' });
    }
  }
}

module.exports = CEOAgent;

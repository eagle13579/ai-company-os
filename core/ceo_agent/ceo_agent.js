const { Logger, ErrorHandler, Validator, Utils } = require('./utils/utils');
const IPlanner = require('./interfaces/IPlanner');
const IDecisionEngine = require('./interfaces/IDecisionEngine');
const IReviewEngine = require('./interfaces/IReviewEngine');
const RiskManager = require('./risk_manager');
const TalentManager = require('./talent_manager');
const StakeholderManager = require('./stakeholder_manager');

class CEOAgent {
  constructor() {
    this.planner = null;
    this.decisionEngine = null;
    this.reviewEngine = null;
    this.riskManager = new RiskManager();
    this.talentManager = new TalentManager();
    this.stakeholderManager = new StakeholderManager();
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

      // 风险评估
      const riskAssessment = await this.assessRisks(strategy);
      if (riskAssessment.status === 'failed') return riskAssessment;

      const tasks = await this.taskBreakdown(strategy);
      if (tasks.status === 'failed') return tasks;

      const allocation = await this.resourceAllocation(tasks, resources);
      if (allocation.status === 'failed') return allocation;

      const plan = {
        id: strategy.id,
        strategy,
        tasks,
        allocation,
        riskAssessment,
      };

      const results = await this.executePlan(plan);
      const review = await this.reviewResults(results);

      // 人才管理
      const talentAssessment = await this.assessTalent(resources);
      if (talentAssessment.status === 'failed') return talentAssessment;
      
      const developmentPlan = await this.createDevelopmentPlan(talentAssessment);
      if (developmentPlan.status === 'failed') return developmentPlan;

      // 利益相关者管理
      const stakeholderAnalysis = await this.analyzeStakeholders();
      if (stakeholderAnalysis.status === 'failed') return stakeholderAnalysis;
      
      const communicationPlan = await this.createCommunicationPlan(stakeholderAnalysis);
      if (communicationPlan.status === 'failed') return communicationPlan;

      const result = {
        status: 'success',
        plan,
        results,
        review,
        riskAssessment,
        talentAssessment,
        developmentPlan,
        stakeholderAnalysis,
        communicationPlan,
      };

      Logger.info('Strategy run completed successfully', {
        successRate: review.success_rate,
      });
      return result;
    } catch (error) {
      Logger.error('Strategy run failed', error);
      return ErrorHandler.handleError(error, { action: 'runStrategy' });
    }
  }

  async assessRisks(strategy) {
    try {
      Logger.info('Assessing risks for strategy', { strategyId: strategy.id });
      const riskAssessment = await this.riskManager.assessRisks(strategy);
      const mitigationPlan = await this.riskManager.developMitigationPlan(riskAssessment.risks);
      
      return {
        status: 'success',
        riskAssessment,
        mitigationPlan
      };
    } catch (error) {
      return ErrorHandler.handleError(error, { action: 'assessRisks' });
    }
  }

  async assessTalent(resources) {
    try {
      Logger.info('Assessing talent', { resourceCount: resources.length });
      const talentAssessment = await this.talentManager.assessTalent(resources);
      
      return {
        status: 'success',
        talentAssessment
      };
    } catch (error) {
      return ErrorHandler.handleError(error, { action: 'assessTalent' });
    }
  }

  async createDevelopmentPlan(talentAssessment) {
    try {
      Logger.info('Creating development plan');
      const developmentPlan = await this.talentManager.createDevelopmentPlan(talentAssessment.talentAssessment);
      
      return {
        status: 'success',
        developmentPlan
      };
    } catch (error) {
      return ErrorHandler.handleError(error, { action: 'createDevelopmentPlan' });
    }
  }

  async analyzeStakeholders() {
    try {
      Logger.info('Analyzing stakeholders');
      const stakeholderAnalysis = await this.stakeholderManager.analyzeStakeholders();
      
      return {
        status: 'success',
        stakeholderAnalysis
      };
    } catch (error) {
      return ErrorHandler.handleError(error, { action: 'analyzeStakeholders' });
    }
  }

  async createCommunicationPlan(stakeholderAnalysis) {
    try {
      Logger.info('Creating communication plan');
      const communicationPlan = await this.stakeholderManager.createCommunicationPlan(stakeholderAnalysis.stakeholderAnalysis);
      
      return {
        status: 'success',
        communicationPlan
      };
    } catch (error) {
      return ErrorHandler.handleError(error, { action: 'createCommunicationPlan' });
    }
  }

  async getDashboard() {
    try {
      Logger.info('Generating dashboard');
      
      return {
        status: 'success',
        dashboard: {
          riskManager: {
            totalRisks: this.riskManager.risks?.length || 0
          },
          talentManager: {
            totalAssessments: this.talentManager.talentAssessments?.length || 0
          },
          stakeholderManager: {
            totalStakeholders: this.stakeholderManager.stakeholders?.length || 0
          },
          generatedAt: new Date().toISOString()
        }
      };
    } catch (error) {
      return ErrorHandler.handleError(error, { action: 'getDashboard' });
    }
  }
}

module.exports = CEOAgent;

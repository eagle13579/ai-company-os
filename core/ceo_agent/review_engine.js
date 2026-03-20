const IReviewEngine = require('./interfaces/IReviewEngine');
const config = require('./config/config');
const { Logger, ErrorHandler, Utils } = require('./utils/utils');

class ReviewEngine extends IReviewEngine {
  constructor() {
    super();
    this.reviewHistory = [];
  }

  async evaluateResults(results) {
    try {
      Logger.info('Evaluating results', { resultCount: results.length });

      const review = {
        id: Utils.generateId('review'),
        total_tasks: results.length,
        completed_tasks: 0,
        failed_tasks: 0,
        success_rate: 0,
        metrics: {},
        recommendations: [],
        timestamp: new Date().toISOString(),
      };

      for (const result of results) {
        if (result.status === 'completed') {
          review.completed_tasks++;
        } else if (result.status === 'failed') {
          review.failed_tasks++;
        }
      }

      review.success_rate = Utils.calculateSuccessRate(
        review.completed_tasks,
        review.total_tasks
      );
      review.metrics = this.calculateMetrics(results);
      review.recommendations = this.generateRecommendations(results, review);

      this.reviewHistory.push(review);
      Logger.info('Results evaluated successfully', {
        reviewId: review.id,
        successRate: review.success_rate,
      });
      return review;
    } catch (error) {
      Logger.error('Failed to evaluate results', error);
      throw error;
    }
  }

  calculateMetrics(results) {
    const metrics = {
      average_completion_time: 0,
      task_type_distribution: {},
      error_distribution: {},
      resource_usage: {},
    };

    let totalTime = 0;
    let completedCount = 0;

    for (const result of results) {
      if (result.status === 'completed') {
        totalTime += 1; // 简化处理，实际应根据实际执行时间
        completedCount++;

        const taskType = this.extractTaskType(result.task.name);
        metrics.task_type_distribution[taskType] =
          (metrics.task_type_distribution[taskType] || 0) + 1;
      } else if (result.status === 'failed') {
        const errorType = this.classifyError(result.error);
        metrics.error_distribution[errorType] =
          (metrics.error_distribution[errorType] || 0) + 1;
      }
    }

    if (completedCount > 0) {
      metrics.average_completion_time = totalTime / completedCount;
    }

    return metrics;
  }

  extractTaskType(taskName) {
    return config.taskTypeMap[taskName] || 'general';
  }

  classifyError(errorMessage) {
    if (errorMessage.includes('resource')) {
      return config.errorTypes.resource;
    } else if (errorMessage.includes('timeout')) {
      return config.errorTypes.timeout;
    } else if (errorMessage.includes('permission')) {
      return config.errorTypes.permission;
    } else {
      return config.errorTypes.general;
    }
  }

  generateRecommendations(results, review) {
    const recommendations = [];

    if (review.success_rate < config.thresholds.successRate.low) {
      recommendations.push(
        'Improve task execution monitoring and error handling'
      );
    }

    if (review.failed_tasks > 0) {
      recommendations.push(
        'Investigate and address root causes of failed tasks'
      );
    }

    const errorDistribution = review.metrics.error_distribution;
    for (const [errorType, count] of Object.entries(errorDistribution)) {
      if (count > 1) {
        recommendations.push(`Address repeated ${errorType} issues`);
      }
    }

    const taskTypeDistribution = review.metrics.task_type_distribution;
    const mostFrequentType = Object.entries(taskTypeDistribution).sort(
      (a, b) => b[1] - a[1]
    )[0];
    if (mostFrequentType && mostFrequentType[1] > 2) {
      recommendations.push(
        `Streamline processes for ${mostFrequentType[0]} tasks`
      );
    }

    if (review.success_rate > config.thresholds.successRate.high) {
      recommendations.push(
        'Maintain current execution standards and document best practices'
      );
    }

    return recommendations;
  }

  async generateReport(reviewId) {
    try {
      Logger.info('Generating report', { reviewId });

      const review = this.reviewHistory.find((r) => r.id === reviewId);
      if (!review) {
        throw ErrorHandler.createError('REVIEW_NOT_FOUND', 'Review not found');
      }

      const report = {
        id: Utils.generateId('report'),
        review_id: review.id,
        title: `Performance Review Report - ${new Date(review.timestamp).toLocaleDateString()}`,
        summary: this.generateSummary(review),
        detailed_metrics: review.metrics,
        recommendations: review.recommendations,
        action_items: this.generateActionItems(review.recommendations),
        generated_at: new Date().toISOString(),
      };

      Logger.info('Report generated successfully', { reportId: report.id });
      return report;
    } catch (error) {
      Logger.error('Failed to generate report', error, { reviewId });
      throw error;
    }
  }

  generateSummary(review) {
    return `
      Performance Review Summary:
      - Total Tasks: ${review.total_tasks}
      - Completed Tasks: ${review.completed_tasks}
      - Failed Tasks: ${review.failed_tasks}
      - Success Rate: ${review.success_rate.toFixed(2)}%
      - Key Metrics: ${JSON.stringify(review.metrics)}
      - Recommendations: ${review.recommendations.length} items
    `;
  }

  generateActionItems(recommendations) {
    return recommendations.map((recommendation, index) => ({
      id: Utils.generateId('action'),
      description: recommendation,
      priority: this.calculateActionPriority(recommendation),
      status: 'pending',
      due_date: this.calculateDueDate(),
    }));
  }

  calculateActionPriority(recommendation) {
    if (
      recommendation.includes('Improve') ||
      recommendation.includes('Address')
    ) {
      return 'high';
    } else if (
      recommendation.includes('Streamline') ||
      recommendation.includes('Maintain')
    ) {
      return 'medium';
    } else {
      return 'low';
    }
  }

  calculateDueDate() {
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + config.defaults.actionDueDays);
    return dueDate.toISOString();
  }

  async compareReviews(reviewId1, reviewId2) {
    try {
      Logger.info('Comparing reviews', { reviewId1, reviewId2 });

      const review1 = this.reviewHistory.find((r) => r.id === reviewId1);
      const review2 = this.reviewHistory.find((r) => r.id === reviewId2);

      if (!review1 || !review2) {
        throw ErrorHandler.createError(
          'REVIEWS_NOT_FOUND',
          'One or both reviews not found'
        );
      }

      const comparison = {
        id: Utils.generateId('comparison'),
        review1_id: reviewId1,
        review2_id: reviewId2,
        success_rate_change: review2.success_rate - review1.success_rate,
        task_completion_change:
          review2.completed_tasks - review1.completed_tasks,
        improvement_areas: this.identifyImprovementAreas(review1, review2),
        regression_areas: this.identifyRegressionAreas(review1, review2),
        generated_at: new Date().toISOString(),
      };

      Logger.info('Reviews compared successfully', {
        comparisonId: comparison.id,
      });
      return comparison;
    } catch (error) {
      Logger.error('Failed to compare reviews', error, {
        reviewId1,
        reviewId2,
      });
      throw error;
    }
  }

  identifyImprovementAreas(review1, review2) {
    const improvements = [];

    if (review2.success_rate > review1.success_rate) {
      improvements.push('Overall success rate improved');
    }

    if (review2.failed_tasks < review1.failed_tasks) {
      improvements.push('Fewer failed tasks');
    }

    const errorTypes1 = Object.keys(review1.metrics.error_distribution);
    const errorTypes2 = Object.keys(review2.metrics.error_distribution);
    const resolvedErrors = errorTypes1.filter(
      (type) => !errorTypes2.includes(type)
    );
    if (resolvedErrors.length > 0) {
      improvements.push(`Resolved error types: ${resolvedErrors.join(', ')}`);
    }

    return improvements;
  }

  identifyRegressionAreas(review1, review2) {
    const regressions = [];

    if (review2.success_rate < review1.success_rate) {
      regressions.push('Overall success rate decreased');
    }

    if (review2.failed_tasks > review1.failed_tasks) {
      regressions.push('More failed tasks');
    }

    const errorTypes1 = Object.keys(review1.metrics.error_distribution);
    const errorTypes2 = Object.keys(review2.metrics.error_distribution);
    const newErrors = errorTypes2.filter((type) => !errorTypes1.includes(type));
    if (newErrors.length > 0) {
      regressions.push(`New error types: ${newErrors.join(', ')}`);
    }

    return regressions;
  }

  async getHistoricalTrends() {
    try {
      Logger.info('Getting historical trends', {
        reviewCount: this.reviewHistory.length,
      });

      if (this.reviewHistory.length < 2) {
        Logger.warn('Insufficient historical data for trend analysis');
        return {
          message: 'Insufficient historical data for trend analysis',
          data: this.reviewHistory,
        };
      }

      const trends = {
        success_rate: {
          values: this.reviewHistory.map((r) => r.success_rate),
          average: Utils.calculateAverage(
            this.reviewHistory.map((r) => r.success_rate)
          ),
          trend: Utils.calculateTrend(
            this.reviewHistory.map((r) => r.success_rate)
          ),
        },
        task_completion: {
          values: this.reviewHistory.map((r) => r.completed_tasks),
          average: Utils.calculateAverage(
            this.reviewHistory.map((r) => r.completed_tasks)
          ),
          trend: Utils.calculateTrend(
            this.reviewHistory.map((r) => r.completed_tasks)
          ),
        },
        error_rate: {
          values: this.reviewHistory.map(
            (r) => (r.failed_tasks / r.total_tasks) * 100
          ),
          average: Utils.calculateAverage(
            this.reviewHistory.map(
              (r) => (r.failed_tasks / r.total_tasks) * 100
            )
          ),
          trend: Utils.calculateTrend(
            this.reviewHistory.map(
              (r) => (r.failed_tasks / r.total_tasks) * 100
            )
          ),
        },
        data: this.reviewHistory,
        generated_at: new Date().toISOString(),
      };

      Logger.info('Historical trends calculated successfully');
      return trends;
    } catch (error) {
      Logger.error('Failed to get historical trends', error);
      throw error;
    }
  }

  async validatePlan(plan) {
    try {
      Logger.info('Validating plan', { planId: plan.id });

      const validation = {
        id: Utils.generateId('validation'),
        plan_id: plan.id,
        valid: true,
        issues: [],
        recommendations: [],
        timestamp: new Date().toISOString(),
      };

      if (!plan.tasks || plan.tasks.length === 0) {
        validation.valid = false;
        validation.issues.push('No tasks defined in the plan');
      }

      if (plan.tasks && plan.tasks.length > config.thresholds.taskLimit) {
        validation.issues.push(
          `Plan has too many tasks (more than ${config.thresholds.taskLimit})`
        );
        validation.recommendations.push(
          'Consider breaking down the plan into smaller sub-plans'
        );
      }

      const dependencyIssues = this.checkTaskDependencies(plan.tasks);
      if (dependencyIssues.length > 0) {
        validation.valid = false;
        validation.issues.push(...dependencyIssues);
      }

      const resourceIssues = this.checkResourceAllocation(plan.allocation);
      if (resourceIssues.length > 0) {
        validation.valid = false;
        validation.issues.push(...resourceIssues);
      }

      Logger.info('Plan validated', {
        valid: validation.valid,
        issues: validation.issues.length,
      });
      return validation;
    } catch (error) {
      Logger.error('Failed to validate plan', error, { planId: plan.id });
      throw error;
    }
  }

  checkTaskDependencies(tasks) {
    const issues = [];
    const taskIds = new Set(tasks.map((t) => t.id));

    for (const task of tasks) {
      if (task.dependencies) {
        for (const dependency of task.dependencies) {
          if (!taskIds.has(dependency)) {
            issues.push(`Task ${task.id} has invalid dependency ${dependency}`);
          }
        }
      }
    }

    return issues;
  }

  checkResourceAllocation(allocation) {
    const issues = [];

    if (allocation && allocation.tasks) {
      const unallocatedTasks = allocation.tasks.filter(
        (t) => t.resources.length === 0
      );
      if (unallocatedTasks.length > 0) {
        issues.push(
          `${unallocatedTasks.length} tasks have no resources allocated`
        );
      }
    }

    return issues;
  }
}

module.exports = ReviewEngine;

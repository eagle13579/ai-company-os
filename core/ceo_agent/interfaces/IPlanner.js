class IPlanner {
  async createPlan(goals, constraints) {
    throw new Error('Method not implemented');
  }

  async breakdownTasks(strategy) {
    throw new Error('Method not implemented');
  }

  async generateTimeline(tasks) {
    throw new Error('Method not implemented');
  }

  async updateTaskStatus(taskId, status) {
    throw new Error('Method not implemented');
  }
}

module.exports = IPlanner;

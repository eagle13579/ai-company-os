class IReviewEngine {
  async evaluateResults(results) {
    throw new Error('Method not implemented');
  }

  async generateReport(reviewId) {
    throw new Error('Method not implemented');
  }

  async compareReviews(reviewId1, reviewId2) {
    throw new Error('Method not implemented');
  }

  async getHistoricalTrends() {
    throw new Error('Method not implemented');
  }

  async validatePlan(plan) {
    throw new Error('Method not implemented');
  }
}

module.exports = IReviewEngine;

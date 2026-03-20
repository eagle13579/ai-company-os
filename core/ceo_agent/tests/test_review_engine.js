const ReviewEngine = require('../review_engine');

describe('ReviewEngine', () => {
  let reviewEngine;

  beforeEach(() => {
    reviewEngine = new ReviewEngine();
  });

  test('should evaluate results and calculate success rate', async () => {
    const results = [
      {
        task: { id: 'task_1', name: 'Market research' },
        result: 'Success',
        status: 'completed',
      },
      {
        task: { id: 'task_2', name: 'Competitor analysis' },
        result: 'Success',
        status: 'completed',
      },
      {
        task: { id: 'task_3', name: 'Market entry strategy' },
        error: 'Resource error',
        status: 'failed',
      },
    ];

    const review = await reviewEngine.evaluateResults(results);

    expect(review).toBeDefined();
    expect(review.id).toBeDefined();
    expect(review.total_tasks).toBe(3);
    expect(review.completed_tasks).toBe(2);
    expect(review.failed_tasks).toBe(1);
    expect(review.success_rate).toBeCloseTo(66.67);
  });

  test('should generate a report based on review', async () => {
    const results = [
      {
        task: { id: 'task_1', name: 'Market research' },
        result: 'Success',
        status: 'completed',
      },
      {
        task: { id: 'task_2', name: 'Competitor analysis' },
        result: 'Success',
        status: 'completed',
      },
    ];

    const review = await reviewEngine.evaluateResults(results);
    const report = await reviewEngine.generateReport(review.id);

    expect(report).toBeDefined();
    expect(report.id).toBeDefined();
    expect(report.review_id).toBe(review.id);
    expect(report.title).toBeDefined();
    expect(report.recommendations).toBeDefined();
  });

  test('should compare two reviews', async () => {
    const results1 = [
      {
        task: { id: 'task_1', name: 'Market research' },
        result: 'Success',
        status: 'completed',
      },
      {
        task: { id: 'task_2', name: 'Competitor analysis' },
        error: 'Error',
        status: 'failed',
      },
    ];

    const results2 = [
      {
        task: { id: 'task_1', name: 'Market research' },
        result: 'Success',
        status: 'completed',
      },
      {
        task: { id: 'task_2', name: 'Competitor analysis' },
        result: 'Success',
        status: 'completed',
      },
    ];

    const review1 = await reviewEngine.evaluateResults(results1);
    const review2 = await reviewEngine.evaluateResults(results2);

    const comparison = await reviewEngine.compareReviews(
      review1.id,
      review2.id
    );

    expect(comparison).toBeDefined();
    expect(comparison.review1_id).toBe(review1.id);
    expect(comparison.review2_id).toBe(review2.id);
    expect(comparison.success_rate_change).toBe(50);
  });

  test('should get historical trends', async () => {
    const results1 = [
      {
        task: { id: 'task_1', name: 'Market research' },
        result: 'Success',
        status: 'completed',
      },
      {
        task: { id: 'task_2', name: 'Competitor analysis' },
        error: 'Error',
        status: 'failed',
      },
    ];

    const results2 = [
      {
        task: { id: 'task_1', name: 'Market research' },
        result: 'Success',
        status: 'completed',
      },
      {
        task: { id: 'task_2', name: 'Competitor analysis' },
        result: 'Success',
        status: 'completed',
      },
    ];

    await reviewEngine.evaluateResults(results1);
    await reviewEngine.evaluateResults(results2);

    const trends = await reviewEngine.getHistoricalTrends();

    expect(trends).toBeDefined();
    expect(trends.success_rate).toBeDefined();
    expect(trends.task_completion).toBeDefined();
    expect(trends.error_rate).toBeDefined();
  });

  test('should validate a plan', async () => {
    const plan = {
      id: 'plan_1',
      tasks: [
        { id: 'task_1', name: 'Market research', dependencies: [] },
        { id: 'task_2', name: 'Competitor analysis', dependencies: ['task_1'] },
      ],
      allocation: {
        tasks: [
          { task_id: 'task_1', resources: ['resource_1'] },
          { task_id: 'task_2', resources: ['resource_2'] },
        ],
      },
    };

    const validation = await reviewEngine.validatePlan(plan);

    expect(validation).toBeDefined();
    expect(validation.plan_id).toBe(plan.id);
    expect(validation.valid).toBe(true);
  });
});

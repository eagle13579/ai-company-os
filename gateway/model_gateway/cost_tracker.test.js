const CostTracker = require('./cost_tracker');

describe('CostTracker', () => {
  let costTracker;

  beforeEach(() => {
    costTracker = new CostTracker();
  });

  test('should add cost for a model', () => {
    costTracker.addCost('test-model', 0.1);
    const cost = costTracker.getCost('test-model');
    expect(cost.total).toBe(0.1);
    expect(cost.calls).toBe(1);
  });

  test('should accumulate costs for a model', () => {
    costTracker.addCost('test-model', 0.1);
    costTracker.addCost('test-model', 0.2);
    const cost = costTracker.getCost('test-model');
    expect(cost.total).toBeCloseTo(0.3);
    expect(cost.calls).toBe(2);
  });

  test('should return default cost when model not found', () => {
    const cost = costTracker.getCost('non-existent-model');
    expect(cost.total).toBe(0);
    expect(cost.calls).toBe(0);
  });

  test('should get all costs', () => {
    costTracker.addCost('model1', 0.1);
    costTracker.addCost('model2', 0.2);
    const costs = costTracker.getAllCosts();
    expect(costs).toHaveLength(2);
    expect(costs[0]).toEqual({ modelId: 'model1', total: 0.1, calls: 1 });
    expect(costs[1]).toEqual({ modelId: 'model2', total: 0.2, calls: 1 });
  });

  test('should check rate limit', () => {
    costTracker.setRateLimit('test-model', 2, 1000);
    expect(costTracker.checkRateLimit('test-model')).toBe(true);
    expect(costTracker.checkRateLimit('test-model')).toBe(true);
    expect(costTracker.checkRateLimit('test-model')).toBe(false); // Exceeded limit
  });

  test('should reset rate limit after window', async () => {
    costTracker.setRateLimit('test-model', 1, 100);
    expect(costTracker.checkRateLimit('test-model')).toBe(true);
    expect(costTracker.checkRateLimit('test-model')).toBe(false);
    
    // Wait for window to pass
    await new Promise(resolve => setTimeout(resolve, 150));
    expect(costTracker.checkRateLimit('test-model')).toBe(true);
  });

  test('should get total cost', () => {
    costTracker.addCost('model1', 0.1);
    costTracker.addCost('model2', 0.2);
    expect(costTracker.getTotalCost()).toBeCloseTo(0.3);
  });

  test('should reset costs', () => {
    costTracker.addCost('model1', 0.1);
    costTracker.resetCosts();
    const cost = costTracker.getCost('model1');
    expect(cost.total).toBe(0);
    expect(cost.calls).toBe(0);
  });
});
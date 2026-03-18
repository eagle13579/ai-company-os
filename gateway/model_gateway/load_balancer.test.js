const LoadBalancer = require('./load_balancer');

describe('LoadBalancer', () => {
  let loadBalancer;

  beforeEach(() => {
    loadBalancer = new LoadBalancer();
  });

  test('should register a model', () => {
    loadBalancer.registerModel('test-model');
    const stats = loadBalancer.getModelStats();
    expect(stats).toHaveLength(1);
    expect(stats[0].modelId).toBe('test-model');
    expect(stats[0].healthy).toBe(true);
  });

  test('should update model load', () => {
    loadBalancer.registerModel('test-model');
    loadBalancer.updateModelLoad('test-model', 100);
    const stats = loadBalancer.getModelStats();
    expect(stats[0].load).toBe(100);
  });

  test('should set model health status', () => {
    loadBalancer.registerModel('test-model');
    loadBalancer.setHealthy('test-model', false);
    const stats = loadBalancer.getModelStats();
    expect(stats[0].healthy).toBe(false);
  });

  test('should select model using round robin strategy', () => {
    loadBalancer.registerModel('model1');
    loadBalancer.registerModel('model2');
    loadBalancer.setStrategy('roundRobin');
    
    expect(loadBalancer.selectModel(['model1', 'model2'])).toBe('model1');
    expect(loadBalancer.selectModel(['model1', 'model2'])).toBe('model2');
    expect(loadBalancer.selectModel(['model1', 'model2'])).toBe('model1');
  });

  test('should select model with least load', () => {
    loadBalancer.registerModel('model1');
    loadBalancer.registerModel('model2');
    loadBalancer.updateModelLoad('model1', 100);
    loadBalancer.updateModelLoad('model2', 50);
    loadBalancer.setStrategy('leastLoad');
    
    expect(loadBalancer.selectModel(['model1', 'model2'])).toBe('model2');
  });

  test('should select least recently used model', () => {
    loadBalancer.registerModel('model1');
    loadBalancer.registerModel('model2');
    
    // Use model1
    loadBalancer.updateModelLoad('model1', 100);
    
    // Wait a bit
    setTimeout(() => {}, 10);
    
    // Use model2
    loadBalancer.updateModelLoad('model2', 100);
    
    loadBalancer.setStrategy('leastRecentlyUsed');
    expect(loadBalancer.selectModel(['model1', 'model2'])).toBe('model1');
  });

  test('should return null when no healthy models', () => {
    loadBalancer.registerModel('model1');
    loadBalancer.setHealthy('model1', false);
    expect(loadBalancer.selectModel(['model1'])).toBe(null);
  });

  test('should reset stats', () => {
    loadBalancer.registerModel('model1');
    loadBalancer.resetStats();
    const stats = loadBalancer.getModelStats();
    expect(stats).toHaveLength(0);
  });
});
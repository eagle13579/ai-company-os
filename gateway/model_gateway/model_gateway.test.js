import ModelGateway from './index.js';

describe('ModelGateway', () => {
  let gateway;

  beforeEach(() => {
    gateway = new ModelGateway();
  });

  test('should register a model', () => {
    const modelConfig = {
      name: 'Test Model',
      costPerSecond: 0.0001,
      execute: async (request) => `Response: ${request.prompt}`
    };
    gateway.registerModel('test-model', modelConfig);
    const stats = gateway.getModelStats();
    expect(stats.models).toHaveLength(1);
    expect(stats.models[0].id).toBe('test-model');
  });

  test('should add a routing rule', () => {
    const modelConfig1 = {
      name: 'Model 1',
      costPerSecond: 0.0001,
      execute: async (request) => `Response from Model 1: ${request.prompt}`
    };
    
    const modelConfig2 = {
      name: 'Model 2',
      costPerSecond: 0.00005,
      execute: async (request) => `Response from Model 2: ${request.prompt}`
    };
    
    gateway.registerModel('model1', modelConfig1);
    gateway.registerModel('model2', modelConfig2);
    
    gateway.addRoutingRule((req) => req.priority === 'high', 'model1');
    gateway.addRoutingRule((req) => req.priority === 'low', 'model2');
    
    return Promise.all([
      gateway.processRequest({ prompt: 'Test', priority: 'high' }),
      gateway.processRequest({ prompt: 'Test', priority: 'low' })
    ]).then(([highResponse, lowResponse]) => {
      expect(highResponse).toBe('Response from Model 1: Test');
      expect(lowResponse).toBe('Response from Model 2: Test');
    });
  });

  test('should handle rate limit', async () => {
    const modelConfig = {
      name: 'Test Model',
      costPerSecond: 0.0001,
      execute: async (request) => `Response: ${request.prompt}`
    };
    
    gateway.registerModel('test-model', modelConfig);
    gateway.setRateLimit('test-model', 2, 1000);
    
    // First two requests should succeed
    await gateway.processRequest({ prompt: 'Test 1' });
    await gateway.processRequest({ prompt: 'Test 2' });
    
    // Third request should fail with rate limit error
    await expect(gateway.processRequest({ prompt: 'Test 3' })).rejects.toThrow('Rate limit exceeded');
  });

  test('should handle model failure and retry', async () => {
    let callCount = 0;
    const modelConfig = {
      name: 'Test Model',
      costPerSecond: 0.0001,
      execute: async (request) => {
        callCount++;
        if (callCount < 3) {
          throw new Error('Temporary error');
        }
        return `Response: ${request.prompt}`;
      }
    };
    
    gateway.registerModel('test-model', modelConfig);
    
    const response = await gateway.processRequest({ prompt: 'Test' });
    expect(response).toBe('Response: Test');
    expect(callCount).toBe(3); // Should have retried 2 times
  });

  test('should get model stats', async () => {
    const modelConfig = {
      name: 'Test Model',
      costPerSecond: 0.0001,
      execute: async (request) => {
        // Add a small delay to ensure duration is not zero
        await new Promise(resolve => setTimeout(resolve, 10));
        return `Response: ${request.prompt}`;
      }
    };
    
    gateway.registerModel('test-model', modelConfig);
    await gateway.processRequest({ prompt: 'Test' });
    
    const stats = gateway.getModelStats();
    expect(stats.models).toHaveLength(1);
    expect(stats.costs).toHaveLength(1);
    expect(stats.load).toHaveLength(1);
    // Check that cost is tracked (calls should be at least 1)
    expect(stats.costs[0].calls).toBeGreaterThan(0);
  });

  test('should set load balancing strategy', () => {
    const modelConfig1 = {
      name: 'Model 1',
      costPerSecond: 0.0001,
      execute: async (request) => `Response from Model 1: ${request.prompt}`
    };
    
    const modelConfig2 = {
      name: 'Model 2',
      costPerSecond: 0.00005,
      execute: async (request) => `Response from Model 2: ${request.prompt}`
    };
    
    gateway.registerModel('model1', modelConfig1);
    gateway.registerModel('model2', modelConfig2);
    
    gateway.setLoadBalancingStrategy('leastLoad');
    // No error should be thrown
    expect(() => gateway.setLoadBalancingStrategy('leastLoad')).not.toThrow();
  });
});
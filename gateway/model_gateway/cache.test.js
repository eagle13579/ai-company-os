import ModelGateway from './index.js';

describe('Cache', () => {
  let gateway;

  beforeEach(() => {
    gateway = new ModelGateway();
  });

  test('should set and get cache value', () => {
    gateway.setCache('test-key', 'test-value');
    const value = gateway.getCache('test-key');
    expect(value).toBe('test-value');
  });

  test('should return null for non-existent cache key', () => {
    const value = gateway.getCache('non-existent-key');
    expect(value).toBe(null);
  });

  test('should return null for expired cache', async () => {
    gateway.setCache('test-key', 'test-value', 100); // 100ms TTL
    await new Promise(resolve => setTimeout(resolve, 150));
    const value = gateway.getCache('test-key');
    expect(value).toBe(null);
  });

  test('should clear cache by key', () => {
    gateway.setCache('test-key1', 'test-value1');
    gateway.setCache('test-key2', 'test-value2');
    gateway.clearCache('test-key1');
    expect(gateway.getCache('test-key1')).toBe(null);
    expect(gateway.getCache('test-key2')).toBe('test-value2');
  });

  test('should clear all cache', () => {
    gateway.setCache('test-key1', 'test-value1');
    gateway.setCache('test-key2', 'test-value2');
    gateway.clearCache();
    expect(gateway.getCache('test-key1')).toBe(null);
    expect(gateway.getCache('test-key2')).toBe(null);
  });

  test('should create cache middleware', () => {
    const middleware = gateway.cacheMiddleware();
    expect(typeof middleware).toBe('function');
  });

  test('should process request with cache', async () => {
    const modelConfig = {
      name: 'Test Model',
      costPerSecond: 0.0001,
      execute: async (request) => `Response: ${request.prompt}`
    };
    
    gateway.registerModel('test-model', modelConfig);
    
    // First request (should not be cached)
    const response1 = await gateway.processRequestWithCache({ prompt: 'Test' });
    expect(response1).toBe('Response: Test');
    
    // Second request (should be cached)
    const response2 = await gateway.processRequestWithCache({ prompt: 'Test' });
    expect(response2).toBe('Response: Test');
  });
});
const ModelRouter = require('./model_router');

describe('ModelRouter', () => {
  let modelRouter;

  beforeEach(() => {
    modelRouter = new ModelRouter();
  });

  test('should register a model', () => {
    const modelConfig = { name: 'Test Model', costPerSecond: 0.0001 };
    modelRouter.registerModel('test-model', modelConfig);
    expect(modelRouter.getModel('test-model')).toEqual(modelConfig);
  });

  test('should add a routing rule', () => {
    const modelConfig = { name: 'Test Model', costPerSecond: 0.0001 };
    modelRouter.registerModel('test-model', modelConfig);
    
    const condition = (req) => req.type === 'test';
    modelRouter.addRoutingRule(condition, 'test-model');
    
    const request = { type: 'test' };
    const route = modelRouter.routeRequest(request);
    expect(route.modelId).toBe('test-model');
  });

  test('should route to default model when no rules match', () => {
    const modelConfig1 = { name: 'Model 1', costPerSecond: 0.0001 };
    const modelConfig2 = { name: 'Model 2', costPerSecond: 0.00005 };
    
    modelRouter.registerModel('model1', modelConfig1);
    modelRouter.registerModel('model2', modelConfig2);
    
    const condition = (req) => req.type === 'test';
    modelRouter.addRoutingRule(condition, 'model1');
    
    const request = { type: 'other' };
    const route = modelRouter.routeRequest(request);
    expect(route.modelId).toBe('model1'); // First registered model is default
  });

  test('should throw error when no models registered', () => {
    expect(() => modelRouter.getDefaultModel()).toThrow('No models registered');
  });

  test('should get all models', () => {
    const modelConfig1 = { name: 'Model 1', costPerSecond: 0.0001 };
    const modelConfig2 = { name: 'Model 2', costPerSecond: 0.00005 };
    
    modelRouter.registerModel('model1', modelConfig1);
    modelRouter.registerModel('model2', modelConfig2);
    
    const models = modelRouter.getAllModels();
    expect(models).toHaveLength(2);
    expect(models[0]).toEqual({ id: 'model1', name: 'Model 1', costPerSecond: 0.0001 });
    expect(models[1]).toEqual({ id: 'model2', name: 'Model 2', costPerSecond: 0.00005 });
  });
});
import ModelGateway from './index.js';

describe('Request Validation', () => {
  let gateway;

  beforeEach(() => {
    gateway = new ModelGateway();
  });

  test('should validate request with required fields', () => {
    const schema = {
      required: ['prompt'],
      types: {
        prompt: 'string'
      }
    };

    const validRequest = { prompt: 'Test prompt' };
    const invalidRequest = {};

    const validResult = gateway.validateRequest(validRequest, schema);
    const invalidResult = gateway.validateRequest(invalidRequest, schema);

    expect(validResult.valid).toBe(true);
    expect(validResult.errors).toHaveLength(0);
    expect(invalidResult.valid).toBe(false);
    expect(invalidResult.errors).toHaveLength(1);
    expect(invalidResult.errors[0]).toBe('Required field prompt is missing');
  });

  test('should validate request with type checks', () => {
    const schema = {
      types: {
        prompt: 'string',
        priority: 'string'
      }
    };

    const validRequest = { prompt: 'Test prompt', priority: 'high' };
    const invalidRequest = { prompt: 'Test prompt', priority: 123 };

    const validResult = gateway.validateRequest(validRequest, schema);
    const invalidResult = gateway.validateRequest(invalidRequest, schema);

    expect(validResult.valid).toBe(true);
    expect(validResult.errors).toHaveLength(0);
    expect(invalidResult.valid).toBe(false);
    expect(invalidResult.errors).toHaveLength(1);
    expect(invalidResult.errors[0]).toBe('Field priority must be of type string');
  });

  test('should create validation middleware', () => {
    const schema = {
      required: ['prompt']
    };
    const middleware = gateway.validate(schema);
    expect(typeof middleware).toBe('function');
  });
});
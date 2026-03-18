const ModelGateway = require('./index');

describe('Authentication', () => {
  let gateway;

  beforeEach(() => {
    gateway = new ModelGateway();
  });

  test('should generate a JWT token', () => {
    const payload = { userId: '123', role: 'user' };
    const token = gateway.generateToken(payload);
    expect(typeof token).toBe('string');
    expect(token.length).toBeGreaterThan(0);
  });

  test('should verify a valid JWT token', () => {
    const payload = { userId: '123', role: 'user' };
    const token = gateway.generateToken(payload);
    const decoded = gateway.verifyToken(token);
    expect(decoded.userId).toBe('123');
    expect(decoded.role).toBe('user');
  });

  test('should throw error for invalid token', () => {
    expect(() => gateway.verifyToken('invalid-token')).toThrow('Invalid or expired token');
  });

  test('should create authenticate middleware', () => {
    const middleware = gateway.authenticate;
    expect(typeof middleware).toBe('function');
  });

  test('should create requireRole middleware', () => {
    const middleware = gateway.requireRole('admin');
    expect(typeof middleware).toBe('function');
  });
});
/**
 * Tech Agent 测试文件
 */
const TechAgent = require('./tech_agent');

// 测试用例
describe('Tech Agent', () => {
  let techAgent;

  beforeEach(() => {
    techAgent = new TechAgent();
  });

  test('should initialize with correct properties', () => {
    expect(techAgent.role).toBe('技术全球超级技天才');
    expect(techAgent.mission).toBe('为AI公司提供稳定、可扩展的技术底座');
    expect(techAgent.responsibilities).toEqual(['技术架构设计', 'AI系统开发', 'API能力建设', '系统稳定性保障', '技术可扩展性规划']);
    expect(techAgent.thoughtModel).toEqual(['业务需求', '技术架构', '系统实现', '稳定运行', '持续升级']);
    expect(techAgent.principles).toEqual(['优先稳定', '避免过度复杂', '优先可扩展架构', '技术必须服务业务']);
    expect(techAgent.options).toHaveProperty('logLevel', 'info');
    expect(techAgent.options).toHaveProperty('timeout', 30000);
    expect(techAgent.options).toHaveProperty('enableCaching', false);
    expect(techAgent.options).toHaveProperty('cacheTTL', 3600000);
    expect(techAgent.plugins).toEqual([]);
  });

  test('should initialize with custom options', () => {
    const customOptions = { logLevel: 'debug' };
    const customTechAgent = new TechAgent(customOptions);
    expect(customTechAgent.options.logLevel).toBe('debug');
    expect(customTechAgent.options).toHaveProperty('timeout', 30000);
    expect(customTechAgent.options).toHaveProperty('enableCaching', false);
    expect(customTechAgent.options).toHaveProperty('cacheTTL', 3600000);
  });

  test('should register plugin', () => {
    const plugin = {
      name: 'test-plugin',
      preProcess: (data) => data,
      postProcess: (analysis) => analysis
    };
    techAgent.registerPlugin(plugin);
    expect(techAgent.plugins).toContain(plugin);
  });

  test('should execute plugins', () => {
    let preProcessCalled = false;
    let postProcessCalled = false;
    
    const plugin = {
      name: 'test-plugin',
      preProcess: (data) => {
        preProcessCalled = true;
        return { ...data, processed: true };
      },
      postProcess: (analysis) => {
        postProcessCalled = true;
        return { ...analysis, processed: true };
      }
    };
    
    techAgent.registerPlugin(plugin);
    
    const testData = {
      businessRequirement: '开发一个AI驱动的客户服务系统',
    };
    
    const result = techAgent.analyzeTechnology(testData);
    
    expect(preProcessCalled).toBe(true);
    expect(postProcessCalled).toBe(true);
    expect(result.processed).toBe(true);
  });

  test('should analyze technology with complete data', () => {
    const testData = {
      businessRequirement: '开发一个AI驱动的客户服务系统',
      technicalArchitecture: '微服务架构',
      systemImplementation: '使用Node.js和Python',
      stabilityMeasures: '监控系统和自动扩容',
      scalabilityPlan: '水平扩展架构',
    };

    const result = techAgent.analyzeTechnology(testData);

    expect(result['【技术需求】']).toBe('开发一个AI驱动的客户服务系统');
    expect(result['【系统架构】']).toBe('微服务架构');
    expect(result['【实现方案】']).toBe('使用Node.js和Python');
    expect(result['【技术风险】']).toEqual(expect.arrayContaining(['性能风险：AI模型推理可能面临性能瓶颈']));
    expect(result['【技术路线图】']).toBe('水平扩展架构');
  });

  test('should analyze technology with minimal data', () => {
    const testData = {
      businessRequirement: '开发一个AI驱动的客户服务系统',
    };

    const result = techAgent.analyzeTechnology(testData);

    expect(result['【技术需求】']).toBe('开发一个AI驱动的客户服务系统');
    expect(result['【系统架构】']).toHaveProperty('architecture');
    expect(result['【实现方案】']).toHaveProperty('technologyStack');
    expect(result['【技术风险】']).toEqual(expect.arrayContaining(['系统稳定性风险：缺乏稳定性保障措施']));
    expect(result['【技术路线图】']).toHaveProperty('phase1');
  });

  test('should handle invalid input', () => {
    const result1 = techAgent.analyzeTechnology(null);
    expect(result1.error).toBe('Invalid input data: data must be an object');
    
    const result2 = techAgent.analyzeTechnology('string');
    expect(result2.error).toBe('Invalid input data: data must be an object');
    
    const result3 = techAgent.analyzeTechnology([]);
    expect(result3.error).toBe('Invalid input data: data must be an object');
    
    const result4 = techAgent.analyzeTechnology({});
    expect(result4.error).toBe('Invalid input data: businessRequirement is required');
  });

  test('should provide technical recommendations', () => {
    const testData = {
      businessRequirement: '开发一个AI驱动的客户服务系统',
    };

    const recommendations = techAgent.provideTechnicalRecommendations(testData);

    expect(Array.isArray(recommendations)).toBe(true);
    expect(recommendations.length).toBeGreaterThan(0);
    expect(recommendations).toContain('采用微服务架构，提高系统灵活性和可维护性');
  });

  test('should evaluate feasibility', () => {
    const testData = {
      businessRequirement: '开发一个AI驱动的客户服务系统',
    };

    const feasibility = techAgent.evaluateFeasibility(testData);

    expect(feasibility).toHaveProperty('technicalFeasibility');
    expect(feasibility).toHaveProperty('resourceRequirements');
    expect(feasibility).toHaveProperty('timelineEstimate');
    expect(feasibility).toHaveProperty('costEstimate');
    expect(feasibility).toHaveProperty('riskAssessment');
    expect(feasibility).toHaveProperty('timestamp');
  });

  test('should handle feasibility evaluation error', () => {
    const feasibility = techAgent.evaluateFeasibility({});
    expect(feasibility.technicalFeasibility).toBe('无法评估');
    expect(feasibility.error).toBe('Invalid input data: businessRequirement is required');
  });

  test('should perform health check', () => {
    const healthStatus = techAgent.healthCheck();
    expect(healthStatus.status).toBe('healthy');
    expect(healthStatus).toHaveProperty('timestamp');
    expect(healthStatus).toHaveProperty('version');
    expect(healthStatus).toHaveProperty('plugins');
  });

  test('should get version information', () => {
    const versionInfo = techAgent.getVersion();
    expect(versionInfo.version).toBe('1.0.0');
    expect(versionInfo.name).toBe('Tech Agent');
    expect(versionInfo.role).toBe('技术全球超级技天才');
  });

  test('should remove plugin', () => {
    const plugin1 = { name: 'plugin1', preProcess: (data) => data };
    const plugin2 = { name: 'plugin2', preProcess: (data) => data };
    
    techAgent.registerPlugin(plugin1);
    techAgent.registerPlugin(plugin2);
    expect(techAgent.plugins.length).toBe(2);
    
    const removed = techAgent.removePlugin('plugin1');
    expect(removed).toBe(true);
    expect(techAgent.plugins.length).toBe(1);
    expect(techAgent.plugins[0].name).toBe('plugin2');
  });

  test('should clear all plugins', () => {
    const plugin1 = { name: 'plugin1', preProcess: (data) => data };
    const plugin2 = { name: 'plugin2', preProcess: (data) => data };
    
    techAgent.registerPlugin(plugin1);
    techAgent.registerPlugin(plugin2);
    expect(techAgent.plugins.length).toBe(2);
    
    techAgent.clearPlugins();
    expect(techAgent.plugins.length).toBe(0);
  });

  test('should handle error', () => {
    const error = new Error('Test error');
    const errorInfo = techAgent.handleError(error, 'test context');
    expect(errorInfo.message).toBe('Test error');
    expect(errorInfo.context).toBe('test context');
    expect(errorInfo).toHaveProperty('timestamp');
    expect(errorInfo).toHaveProperty('correlationId');
  });

  test('should use custom options', () => {
    const customOptions = { logLevel: 'debug', enableCaching: true };
    const customTechAgent = new TechAgent(customOptions);
    expect(customTechAgent.options.logLevel).toBe('debug');
    expect(customTechAgent.options.enableCaching).toBe(true);
  });
});
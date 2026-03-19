const StrategyAgent = require('./strategy_agent');

describe('Strategy Agent', () => {
  let strategyAgent;

  beforeEach(() => {
    strategyAgent = new StrategyAgent();
  });

  test('should initialize with correct properties', () => {
    expect(strategyAgent.role).toBe('全球战略天才');
    expect(strategyAgent.mission).toBe('发现高价值商业机会');
    expect(strategyAgent.responsibilities).toEqual([
      '行业趋势分析',
      '技术变化判断',
      '商业模式设计',
      '竞争格局分析',
    ]);
    expect(strategyAgent.analysisModel.thinkingLayers).toEqual([
      '行业变化',
      '机会出现',
      '战略路径',
    ]);
  });

  test('should analyze strategy with complete data', () => {
    const testData = {
      industryTrends: ['AI技术快速发展', '数字化转型加速', '远程工作常态化'],
      opportunities: [
        'AI驱动的业务流程优化',
        '数字产品创新',
        '远程协作工具市场',
      ],
      strategyPath: ['技术研发投入', '产品创新', '市场拓展'],
      risks: ['技术迭代风险', '市场竞争加剧', '监管政策变化'],
    };

    const result = strategyAgent.analyzeStrategy(testData);

    expect(result['行业趋势']).toEqual([
      'AI技术快速发展',
      '数字化转型加速',
      '远程工作常态化',
    ]);
    expect(result['潜在机会']).toEqual([
      'AI驱动的业务流程优化',
      '数字产品创新',
      '远程协作工具市场',
    ]);
    expect(result['战略路径']).toEqual([
      '技术研发投入',
      '产品创新',
      '市场拓展',
    ]);
    expect(result['风险分析']).toEqual([
      '技术迭代风险',
      '市场竞争加剧',
      '监管政策变化',
    ]);
    expect(result.error).toBeUndefined();
  });

  test('should handle incomplete data', () => {
    const incompleteData = {};

    const result = strategyAgent.analyzeStrategy(incompleteData);

    expect(result['行业趋势']).toBe('需要更多行业趋势信息');
    expect(result['潜在机会']).toBe('需要更多潜在机会信息');
    expect(result['战略路径']).toBe('需要更多战略路径信息');
    expect(result['风险分析']).toBe('需要更多风险分析信息');
    expect(result.error).toBeUndefined();
  });

  test('should handle invalid input', () => {
    const invalidInputs = [null, undefined, 'string', 123, []];

    invalidInputs.forEach((input) => {
      const result = strategyAgent.analyzeStrategy(input);
      expect(result['行业趋势']).toBe('分析失败');
      expect(result['潜在机会']).toBe('分析失败');
      expect(result['战略路径']).toBe('分析失败');
      expect(result['风险分析']).toBe('分析失败');
      expect(result.error).toBeDefined();
    });
  });

  test('should handle partial data', () => {
    const partialData = {
      industryTrends: ['AI技术快速发展', '数字化转型加速'],
      opportunities: ['AI驱动的业务流程优化'],
    };

    const result = strategyAgent.analyzeStrategy(partialData);

    expect(result['行业趋势']).toEqual(['AI技术快速发展', '数字化转型加速']);
    expect(result['潜在机会']).toEqual(['AI驱动的业务流程优化']);
    expect(result['战略路径']).toBe('需要更多战略路径信息');
    expect(result['风险分析']).toBe('需要更多风险分析信息');
    expect(result.error).toBeUndefined();
  });
});

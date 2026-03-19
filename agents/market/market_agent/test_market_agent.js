const MarketAgent = require('./market_agent');

describe('Market Agent', () => {
  let marketAgent;

  beforeEach(() => {
    marketAgent = new MarketAgent();
  });

  test('should initialize with correct properties', () => {
    expect(marketAgent.role).toBe('全球市场营销天才');
    expect(marketAgent.mission).toBe('持续发现客户需求');
    expect(marketAgent.responsibilities).toEqual([
      '客户洞察',
      '需求挖掘',
      '市场验证',
      '增长策略',
    ]);
    expect(marketAgent.analysisModel.customerNeeds).toEqual([
      '表面需求',
      '效率需求',
      '商业需求',
    ]);
  });

  test('should analyze market with complete data', () => {
    const testData = {
      customer: '中小型企业主',
      painPoints: ['市场营销成本高', '客户获取困难', '品牌知名度低'],
      marketSize: '全球中小企业市场规模约 10 万亿美元',
      growthOpportunities: ['数字化营销', '内容营销', '社交媒体推广'],
      recommendations: [
        '建立数字化营销体系',
        '优化内容营销策略',
        '加强社交媒体互动',
      ],
    };

    const result = marketAgent.analyzeMarket(testData);

    expect(result['客户是谁']).toBe('中小型企业主');
    expect(result['客户痛点']).toEqual([
      '市场营销成本高',
      '客户获取困难',
      '品牌知名度低',
    ]);
    expect(result['市场规模']).toBe('全球中小企业市场规模约 10 万亿美元');
    expect(result['增长机会']).toEqual([
      '数字化营销',
      '内容营销',
      '社交媒体推广',
    ]);
    expect(result['建议行动']).toEqual([
      '建立数字化营销体系',
      '优化内容营销策略',
      '加强社交媒体互动',
    ]);
    expect(result.error).toBeUndefined();
  });

  test('should handle incomplete data', () => {
    const incompleteData = {};

    const result = marketAgent.analyzeMarket(incompleteData);

    expect(result['客户是谁']).toBe('需要更多客户信息');
    expect(result['客户痛点']).toBe('需要更多痛点信息');
    expect(result['市场规模']).toBe('需要更多市场规模信息');
    expect(result['增长机会']).toBe('需要更多增长机会信息');
    expect(result['建议行动']).toBe('需要更多信息来生成建议');
    expect(result.error).toBeUndefined();
  });

  test('should handle invalid input', () => {
    const invalidInputs = [null, undefined, 'string', 123, []];

    invalidInputs.forEach((input) => {
      const result = marketAgent.analyzeMarket(input);
      expect(result['客户是谁']).toBe('分析失败');
      expect(result['客户痛点']).toBe('分析失败');
      expect(result['市场规模']).toBe('分析失败');
      expect(result['增长机会']).toBe('分析失败');
      expect(result['建议行动']).toBe('分析失败');
      expect(result.error).toBeDefined();
    });
  });

  test('should handle partial data', () => {
    const partialData = {
      customer: '中小型企业主',
      painPoints: ['市场营销成本高'],
    };

    const result = marketAgent.analyzeMarket(partialData);

    expect(result['客户是谁']).toBe('中小型企业主');
    expect(result['客户痛点']).toEqual(['市场营销成本高']);
    expect(result['市场规模']).toBe('需要更多市场规模信息');
    expect(result['增长机会']).toBe('需要更多增长机会信息');
    expect(result['建议行动']).toBe('需要更多信息来生成建议');
    expect(result.error).toBeUndefined();
  });
});

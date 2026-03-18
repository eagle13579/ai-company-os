const SalesAgent = require('./sales_agent');

describe('Sales Agent', () => {
  let salesAgent;

  beforeEach(() => {
    salesAgent = new SalesAgent();
  });

  test('should initialize with correct properties', () => {
    expect(salesAgent.role).toBe('全球销售天才');
    expect(salesAgent.mission).toBe('把产品卖出去');
    expect(salesAgent.responsibilities).toEqual([
      '客户开发',
      '销售策略',
      '成交路径',
      '渠道拓展',
    ]);
    expect(salesAgent.thoughtModel).toEqual([
      '客户来源',
      '销售话术',
      '成交策略',
      '复购增长',
    ]);
    expect(salesAgent.defaultSalesPath).toBe(
      '了解需求 → 产品演示 → 方案定制 → 签约成交'
    );
    expect(salesAgent.defaultClosingStrategies).toEqual([
      '限时优惠',
      '分期付款',
      '免费试用',
      '增值服务',
    ]);
    expect(salesAgent.defaultChannels).toEqual([
      '线上推广',
      '行业展会',
      '合作伙伴',
      '电话销售',
      '内容营销',
    ]);
  });

  test('should analyze sales with complete data', () => {
    const testData = {
      product: 'AI智能助手',
      targetCustomer: '中小型企业主',
      salesPath: '了解需求 → 产品演示 → 方案定制 → 签约成交',
      closingStrategy: '限时优惠 + 分期付款',
      channelSuggestions: ['线上推广', '行业展会', '合作伙伴'],
      estimatedRevenue: '首年预计收入 500 万元',
      conversionRate: 0.15,
      customerAcquisitionCost: 500,
    };

    const result = salesAgent.analyzeSales(testData);

    expect(result['【目标客户】']).toBe('中小型企业主');
    expect(result['【销售路径】']).toBe(
      '了解需求 → 产品演示 → 方案定制 → 签约成交'
    );
    expect(result['【成交策略】']).toBe('限时优惠 + 分期付款');
    expect(result['【渠道建议】']).toEqual([
      '线上推广',
      '行业展会',
      '合作伙伴',
    ]);
    expect(result['【预估收入】']).toBe('首年预计收入 500 万元');
    expect(result['【销售建议】']).toBeDefined();
    expect(result['【市场洞察】']).toBeDefined();
    expect(result.error).toBeUndefined();
  });

  test('should handle incomplete data with defaults', () => {
    const incompleteData = {
      product: 'AI智能助手',
    };

    const result = salesAgent.analyzeSales(incompleteData);

    expect(result['【目标客户】']).toBe('需要更多目标客户信息');
    expect(result['【销售路径】']).toBe(
      '了解需求 → 产品演示 → 方案定制 → 签约成交'
    );
    expect(result['【成交策略】']).toBe(
      '限时优惠 + 分期付款 + 免费试用 + 增值服务'
    );
    expect(result['【渠道建议】']).toEqual([
      '线上推广',
      '行业展会',
      '合作伙伴',
      '电话销售',
      '内容营销',
    ]);
    expect(result['【预估收入】']).toBe('需要更多预估收入信息');
    expect(result['【销售建议】']).toBeDefined();
    expect(result['【市场洞察】']).toBeDefined();
    expect(result.error).toBeUndefined();
  });

  test('should handle invalid input', () => {
    const invalidInputs = [null, undefined, 'string', 123, []];

    invalidInputs.forEach((input) => {
      const result = salesAgent.analyzeSales(input);
      expect(result['【目标客户】']).toBe('分析失败');
      expect(result['【销售路径】']).toBe('分析失败');
      expect(result['【成交策略】']).toBe('分析失败');
      expect(result['【渠道建议】']).toBe('分析失败');
      expect(result['【预估收入】']).toBe('分析失败');
      expect(result['【销售建议】']).toBe('分析失败');
      expect(result['【市场洞察】']).toBe('分析失败');
      expect(result.error).toBeDefined();
    });
  });

  test('should handle partial data', () => {
    const partialData = {
      product: 'AI智能助手',
      targetCustomer: '中小型企业主',
      salesPath: '了解需求 → 产品演示 → 方案定制 → 签约成交',
    };

    const result = salesAgent.analyzeSales(partialData);

    expect(result['【目标客户】']).toBe('中小型企业主');
    expect(result['【销售路径】']).toBe(
      '了解需求 → 产品演示 → 方案定制 → 签约成交'
    );
    expect(result['【成交策略】']).toBe(
      '限时优惠 + 分期付款 + 免费试用 + 增值服务'
    );
    expect(result['【渠道建议】']).toEqual([
      '线上推广',
      '行业展会',
      '合作伙伴',
      '电话销售',
      '内容营销',
    ]);
    expect(result['【预估收入】']).toBe('需要更多预估收入信息');
    expect(result['【销售建议】']).toBeDefined();
    expect(result['【市场洞察】']).toBeDefined();
    expect(result.error).toBeUndefined();
  });

  test('should estimate revenue based on conversion rate and CAC', () => {
    const testData = {
      product: 'AI智能助手',
      conversionRate: 0.1,
      customerAcquisitionCost: 1000,
    };

    const result = salesAgent.analyzeSales(testData);

    expect(result['【预估收入】']).toContain('基于当前数据预估收入');
    expect(result['【预估收入】']).toContain('元');
  });

  test('should generate sales recommendations', () => {
    const testData = {
      product: 'AI智能助手',
    };

    const result = salesAgent.analyzeSales(testData);

    expect(result['【销售建议】']).toBeDefined();
    expect(Array.isArray(result['【销售建议】'])).toBe(true);
    expect(result['【销售建议】'].length).toBeGreaterThan(0);
  });

  test('should generate market insights', () => {
    const testData = {
      product: 'AI智能助手',
      targetCustomer: '中小型企业主',
      conversionRate: 0.15,
    };

    const result = salesAgent.analyzeSales(testData);

    expect(result['【市场洞察】']).toBeDefined();
    expect(Array.isArray(result['【市场洞察】'])).toBe(true);
    expect(result['【市场洞察】'].length).toBeGreaterThan(0);
  });

  test('should throw error when product is missing', () => {
    const testData = {};

    const result = salesAgent.analyzeSales(testData);

    expect(result.error).toBeDefined();
    expect(result.error).toContain('product is required');
  });
});

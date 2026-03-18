/**
 * Finance Agent 测试文件
 */
const FinanceAgent = require('./finance_agent');

describe('FinanceAgent', () => {
  let financeAgent;

  beforeEach(() => {
    financeAgent = new FinanceAgent();
  });

  describe('构造函数', () => {
    test('应该正确初始化 Finance Agent', () => {
      expect(financeAgent.role).toBe('全球超级资本天才');
      expect(financeAgent.mission).toBe('用资本结构放大商业价值');
      expect(financeAgent.responsibilities).toEqual(['股权设计', '合作结构', '融资策略', '估值路径']);
      expect(financeAgent.analysisModel.capitalStructure).toEqual(['资源', '结构', '资本', '估值']);
      expect(financeAgent.options).toEqual({
        enableLogging: true,
        logLevel: 'info',
      });
      expect(financeAgent.plugins).toEqual([]);
    });

    test('应该接受配置选项并覆盖默认值', () => {
      const options = { 
        enableLogging: false, 
        logLevel: 'debug',
        customOption: 'value'
      };
      const agentWithOptions = new FinanceAgent(options);
      expect(agentWithOptions.options).toEqual({
        enableLogging: false,
        logLevel: 'debug',
        customOption: 'value'
      });
    });
  });

  describe('registerPlugin 方法', () => {
    test('应该正确注册插件', () => {
      const plugin = { name: 'test-plugin' };
      financeAgent.registerPlugin(plugin);
      expect(financeAgent.plugins).toContain(plugin);
    });

    test('应该忽略无效插件', () => {
      financeAgent.registerPlugin(null);
      financeAgent.registerPlugin('not an object');
      expect(financeAgent.plugins).toEqual([]);
    });
  });

  describe('analyzeFinance 方法', () => {
    test('应该正确分析完整的财务数据', () => {
      const testData = {
        partnership: {
          model: '合资模式',
          profitShare: '50:50',
          responsibilities: '各自负责擅长领域',
          exitStrategy: '3年内可退出',
        },
        equity: {
          structure: '创始人60%，投资者40%',
          founderStake: '60%',
          optionPool: '15%',
          votingRights: '一股一票',
        },
        financing: {
          rounds: '种子轮、A轮、B轮',
          targetAmount: '1000万',
          investorTypes: '天使投资人、VC',
          terms: '估值5000万',
        },
        valuation: {
          current: '5000万',
          growthExpectations: '每年30%',
          keyMetrics: 'ARR、用户增长',
          exitValuation: '5亿',
        },
        risks: ['市场风险', '技术风险', '团队风险'],
      };

      const result = financeAgent.analyzeFinance(testData);

      expect(result.合作结构).toEqual({
        合作模式: '合资模式',
        利益分配: '50:50',
        责任划分: '各自负责擅长领域',
        退出机制: '3年内可退出',
      });
      expect(result.股权设计).toEqual({
        股权结构: '创始人60%，投资者40%',
        创始人持股: '60%',
        期权池: '15%',
        表决权: '一股一票',
      });
      expect(result.融资策略).toEqual({
        融资轮次: '种子轮、A轮、B轮',
        目标金额: '1000万',
        投资者类型: '天使投资人、VC',
        融资条件: '估值5000万',
      });
      expect(result.估值路径).toEqual({
        当前估值: '5000万',
        增长预期: '每年30%',
        关键指标: 'ARR、用户增长',
        退出估值: '5亿',
      });
      expect(result.风险).toEqual(['市场风险', '技术风险', '团队风险']);
    });

    test('应该处理缺失数据的情况', () => {
      const testData = {};

      const result = financeAgent.analyzeFinance(testData);

      expect(result.合作结构).toBe('需要更多合作结构信息');
      expect(result.股权设计).toBe('需要更多股权设计信息');
      expect(result.融资策略).toBe('需要更多融资策略信息');
      expect(result.估值路径).toBe('需要更多估值路径信息');
      expect(result.风险).toBe('需要更多风险信息');
    });

    test('应该处理无效输入的情况', () => {
      const result1 = financeAgent.analyzeFinance(null);
      const result2 = financeAgent.analyzeFinance([]);
      const result3 = financeAgent.analyzeFinance('string');

      expect(result1.error).toBe('Invalid input data: data must be an object');
      expect(result2.error).toBe('Invalid input data: data must be an object');
      expect(result3.error).toBe('Invalid input data: data must be an object');
    });

    test('应该执行插件的预处理和后处理', () => {
      let preProcessCalled = false;
      let postProcessCalled = false;

      const testPlugin = {
        name: 'test-plugin',
        preProcess: (data) => {
          preProcessCalled = true;
          return { ...data, test: 'preprocessed' };
        },
        postProcess: (analysis) => {
          postProcessCalled = true;
          return { ...analysis, test: 'postprocessed' };
        },
      };

      financeAgent.registerPlugin(testPlugin);

      const testData = {
        partnership: { model: '合资模式' },
        equity: { structure: '创始人60%' },
        financing: { rounds: '种子轮' },
        valuation: { current: '1000万' },
        risks: ['市场风险'],
      };

      const result = financeAgent.analyzeFinance(testData);

      expect(preProcessCalled).toBe(true);
      expect(postProcessCalled).toBe(true);
      expect(result.test).toBe('postprocessed');
    });

    test('应该处理插件执行错误', () => {
      const errorPlugin = {
        name: 'error-plugin',
        preProcess: () => {
          throw new Error('Plugin error');
        },
        postProcess: () => {
          throw new Error('Plugin error');
        },
      };

      financeAgent.registerPlugin(errorPlugin);

      const testData = {
        partnership: { model: '合资模式' },
        equity: { structure: '创始人60%' },
        financing: { rounds: '种子轮' },
        valuation: { current: '1000万' },
        risks: ['市场风险'],
      };

      // 应该仍然能够执行完成，不会因为插件错误而中断
      const result = financeAgent.analyzeFinance(testData);
      expect(result.合作结构).toEqual({
        合作模式: '合资模式',
        利益分配: '需要更多信息',
        责任划分: '需要更多信息',
        退出机制: '需要更多信息',
      });
    });
  });

  describe('analyzePartnership 方法', () => {
    test('应该正确分析合作结构', () => {
      const testData = {
        partnership: {
          model: '合资模式',
          profitShare: '50:50',
        },
      };

      const result = financeAgent.analyzePartnership(testData);

      expect(result).toEqual({
        合作模式: '合资模式',
        利益分配: '50:50',
        责任划分: '需要更多信息',
        退出机制: '需要更多信息',
      });
    });

    test('应该处理缺失合作结构数据的情况', () => {
      const testData = {};
      const result = financeAgent.analyzePartnership(testData);
      expect(result).toBe('需要更多合作结构信息');
    });
  });

  describe('analyzeEquity 方法', () => {
    test('应该正确分析股权设计', () => {
      const testData = {
        equity: {
          structure: '创始人60%，投资者40%',
          founderStake: '60%',
        },
      };

      const result = financeAgent.analyzeEquity(testData);

      expect(result).toEqual({
        股权结构: '创始人60%，投资者40%',
        创始人持股: '60%',
        期权池: '需要更多信息',
        表决权: '需要更多信息',
      });
    });

    test('应该处理缺失股权设计数据的情况', () => {
      const testData = {};
      const result = financeAgent.analyzeEquity(testData);
      expect(result).toBe('需要更多股权设计信息');
    });
  });

  describe('analyzeFinancing 方法', () => {
    test('应该正确分析融资策略', () => {
      const testData = {
        financing: {
          rounds: '种子轮、A轮',
          targetAmount: '500万',
        },
      };

      const result = financeAgent.analyzeFinancing(testData);

      expect(result).toEqual({
        融资轮次: '种子轮、A轮',
        目标金额: '500万',
        投资者类型: '需要更多信息',
        融资条件: '需要更多信息',
      });
    });

    test('应该处理缺失融资策略数据的情况', () => {
      const testData = {};
      const result = financeAgent.analyzeFinancing(testData);
      expect(result).toBe('需要更多融资策略信息');
    });
  });

  describe('analyzeValuation 方法', () => {
    test('应该正确分析估值路径', () => {
      const testData = {
        valuation: {
          current: '3000万',
          growthExpectations: '每年25%',
        },
      };

      const result = financeAgent.analyzeValuation(testData);

      expect(result).toEqual({
        当前估值: '3000万',
        增长预期: '每年25%',
        关键指标: '需要更多信息',
        退出估值: '需要更多信息',
      });
    });

    test('应该处理缺失估值路径数据的情况', () => {
      const testData = {};
      const result = financeAgent.analyzeValuation(testData);
      expect(result).toBe('需要更多估值路径信息');
    });
  });

  describe('analyzeRisks 方法', () => {
    test('应该正确分析风险', () => {
      const testData = {
        risks: ['市场风险', '技术风险', '团队风险'],
      };

      const result = financeAgent.analyzeRisks(testData);

      expect(result).toEqual(['市场风险', '技术风险', '团队风险']);
    });

    test('应该处理空风险数组的情况', () => {
      const testData = {
        risks: [],
      };
      const result = financeAgent.analyzeRisks(testData);
      expect(result).toBe('风险数据格式错误');
    });

    test('应该处理无效风险格式的情况', () => {
      const testData = {
        risks: '不是数组',
      };
      const result = financeAgent.analyzeRisks(testData);
      expect(result).toBe('风险数据格式错误');
    });

    test('应该处理缺失风险数据的情况', () => {
      const testData = {};
      const result = financeAgent.analyzeRisks(testData);
      expect(result).toBe('需要更多风险信息');
    });
  });

  describe('getAgentInfo 方法', () => {
    test('应该返回完整的 Agent 信息', () => {
      const info = financeAgent.getAgentInfo();
      expect(info.role).toBe('全球超级资本天才');
      expect(info.mission).toBe('用资本结构放大商业价值');
      expect(info.responsibilities).toEqual(['股权设计', '合作结构', '融资策略', '估值路径']);
      expect(info.analysisModel.capitalStructure).toEqual(['资源', '结构', '资本', '估值']);
      expect(info.options).toEqual({
        enableLogging: true,
        logLevel: 'info',
      });
      expect(info.pluginCount).toBe(0);
    });

    test('应该包含插件数量信息', () => {
      const plugin = { name: 'test-plugin' };
      financeAgent.registerPlugin(plugin);
      const info = financeAgent.getAgentInfo();
      expect(info.pluginCount).toBe(1);
    });
  });

  describe('_validateField 方法', () => {
    test('应该验证有效字段', () => {
      const testData = {
        partnership: {
          model: '合资模式',
        },
      };
      const result = financeAgent._validateField(testData, 'partnership.model', 'string');
      expect(result).toBe(true);
    });

    test('应该验证无效字段类型', () => {
      const testData = {
        partnership: {
          model: 123, // 不是字符串
        },
      };
      const result = financeAgent._validateField(testData, 'partnership.model', 'string');
      expect(result).toBe(false);
    });

    test('应该处理不存在的字段', () => {
      const testData = {
        partnership: {},
      };
      const result = financeAgent._validateField(testData, 'partnership.nonexistent', 'string');
      expect(result).toBe(false);
    });
  });
});
const KnowledgeAgent = require('./knowlege_agent');
const { KnowledgeUtils } = require('./knowlege_agent');

describe('Knowledge Agent', () => {
  let agent;

  beforeEach(() => {
    agent = new KnowledgeAgent();
  });

  test('should initialize with correct properties', () => {
    expect(agent.name).toBe('Knowledge Lobster');
    expect(agent.nickname).toBe('小库');
    expect(agent.identity).toBe('知识架构师');
    expect(agent.mission).toBe('整理、结构化、进化我的知识体系');
    expect(agent.personality).toBe('理性、严谨、结构化');
    expect(agent.thoughtPattern).toBe('MECE + 第一性原理');
    expect(agent.signature).toBe('🦞📚');
  });

  test('should initialize with custom options', () => {
    const customStructure = {
      '知识宇宙': {
        '科技': {
          '模型': [],
          '案例': []
        }
      }
    };
    
    const customAgent = new KnowledgeAgent({
      knowledgeStructure: customStructure,
      plugins: []
    });
    
    expect(customAgent.knowledgeStructure).toEqual(customStructure);
    expect(customAgent.plugins).toEqual([]);
  });

  test('should register plugin successfully', () => {
    const plugin = {
      name: 'test-plugin',
      preProcess: (data) => data,
      postProcess: (result) => result
    };
    
    const result = agent.registerPlugin(plugin);
    expect(result).toBe(true);
    expect(agent.getPlugins()).toContain(plugin);
  });

  test('should handle invalid plugin', () => {
    const result = agent.registerPlugin('invalid-plugin');
    expect(result).toBe(false);
    expect(agent.getPlugins()).toHaveLength(0);
  });

  test('should capture knowledge successfully', () => {
    const content = 'OpenAI正在做Agent生态。Agent是AI的未来发展方向。通过Agent，用户可以更自然地与AI交互。';
    const result = agent.capture(content);

    expect(result.status).toBe('success');
    expect(result.message).toBe('知识捕获成功');
    expect(result.data).toHaveProperty('coreConclusion');
    expect(result.data).toHaveProperty('keyLogic');
    expect(result.data).toHaveProperty('model');
    expect(result.data).toHaveProperty('application');
  });

  test('should handle long content warning', () => {
    const longContent = 'a'.repeat(10001);
    expect(() => agent.capture(longContent)).not.toThrow();
  });

  test('should structure knowledge correctly', () => {
    const content = 'PSOS是一个产品战略框架。它包括四个核心要素：问题、解决方案、目标用户、商业模式。通过PSOS框架，企业可以更清晰地定义产品战略。';
    const result = agent.structure(content);

    expect(result).toHaveProperty('核心观点');
    expect(result).toHaveProperty('关键逻辑');
    expect(result).toHaveProperty('模型');
    expect(result).toHaveProperty('应用');
  });

  test('should link concepts', () => {
    // 先捕获一些知识来建立连接
    agent.capture('AI Agent是未来的发展方向。Agent可以帮助用户自动化完成任务。');
    agent.capture('PSOS是产品战略框架。它可以帮助企业定义产品方向。');

    const result = agent.link('AI');
    expect(result.concept).toBe('AI');
    expect(Array.isArray(result.connections)).toBe(true);
    expect(result).toHaveProperty('connectionsCount');
  });

  test('should query knowledge with options', () => {
    // 先捕获一些知识
    agent.capture('AI出海有多种模式。包括直接出海、通过合作伙伴出海、在当地建立团队等。');
    agent.capture('字节跳动的出海模式非常成功。它通过本地化运营和产品创新取得了全球市场的认可。');

    const result = agent.query('出海', { limit: 5, domain: 'AI' });
    expect(result).toHaveProperty('模型');
    expect(result).toHaveProperty('案例');
    expect(result).toHaveProperty('策略');
    expect(result).toHaveProperty('totalResults');
  });

  test('should perform weekly evolution', () => {
    // 先添加一些知识
    agent.capture('AI正在改变世界。');
    agent.capture('AI正在改变世界。'); // 重复内容

    const result = agent.weeklyEvolution();
    expect(result.status).toBe('success');
    expect(result.message).toBe('周进化完成');
    expect(result).toHaveProperty('duration');
  });

  test('should perform monthly upgrade', () => {
    // 先添加一些模型
    agent.capture('AI模型v1正在发展。');

    const result = agent.monthlyUpgrade();
    expect(result.status).toBe('success');
    expect(result.message).toBe('月升级完成');
    expect(result).toHaveProperty('duration');
  });

  test('should perform yearly upgrade', () => {
    const result = agent.yearlyUpgrade();
    expect(result.status).toBe('success');
    expect(result.message).toBe('年升级完成');
    expect(Array.isArray(result.data)).toBe(true);
    expect(result).toHaveProperty('duration');
  });

  test('should get knowledge structure', () => {
    const structure = agent.getKnowledgeStructure();
    expect(structure).toHaveProperty('知识宇宙');
    expect(structure['知识宇宙']).toHaveProperty('AI');
    expect(structure['知识宇宙']).toHaveProperty('商业');
    expect(structure['知识宇宙']).toHaveProperty('资本');
  });

  test('should get knowledge graph', () => {
    // 先捕获一些知识
    agent.capture('AI和商业的结合是未来的趋势。');
    const graph = agent.getKnowledgeGraph();
    expect(typeof graph).toBe('object');
  });

  test('should get knowledge pools', () => {
    const pools = agent.getKnowledgePools();
    expect(pools).toHaveProperty('variablePool');
    expect(pools).toHaveProperty('modelPool');
    expect(pools).toHaveProperty('decisionValidationPool');
  });

  test('should get performance stats', () => {
    const stats = agent.getPerformanceStats();
    expect(stats).toHaveProperty('captureCount');
    expect(stats).toHaveProperty('structureCount');
    expect(stats).toHaveProperty('linkCount');
    expect(stats).toHaveProperty('queryCount');
    expect(stats).toHaveProperty('evolutionCount');
  });

  test('should reset performance stats', () => {
    agent.capture('测试内容');
    expect(agent.getPerformanceStats().captureCount).toBe(1);
    
    agent.resetPerformanceStats();
    expect(agent.getPerformanceStats().captureCount).toBe(0);
  });

  test('should export knowledge as json', () => {
    agent.capture('测试内容');
    const exportResult = agent.exportKnowledge('json');
    expect(typeof exportResult).toBe('string');
    expect(() => JSON.parse(exportResult)).not.toThrow();
  });

  test('should export knowledge as object', () => {
    agent.capture('测试内容');
    const exportResult = agent.exportKnowledge('object');
    expect(typeof exportResult).toBe('object');
    expect(exportResult).toHaveProperty('knowledgeStructure');
    expect(exportResult).toHaveProperty('knowledgeGraph');
    expect(exportResult).toHaveProperty('knowledgePools');
  });

  test('should import knowledge', () => {
    // 先导出一些知识
    agent.capture('测试内容');
    const exportData = agent.exportKnowledge('object');
    
    // 创建新的agent并导入
    const newAgent = new KnowledgeAgent();
    const importResult = newAgent.importKnowledge(exportData);
    
    expect(importResult.status).toBe('success');
    expect(importResult.message).toBe('知识导入成功');
  });

  test('should throw error when capturing empty content', () => {
    expect(() => agent.capture('')).toThrow('捕获内容不能为空');
    expect(() => agent.capture(null)).toThrow('捕获内容不能为空');
  });

  test('should throw error when structuring empty content', () => {
    expect(() => agent.structure('')).toThrow('结构化内容不能为空');
    expect(() => agent.structure(null)).toThrow('结构化内容不能为空');
  });

  test('should throw error when linking empty concept', () => {
    expect(() => agent.link('')).toThrow('连接概念不能为空');
    expect(() => agent.link(null)).toThrow('连接概念不能为空');
  });

  test('should throw error when querying empty topic', () => {
    expect(() => agent.query('')).toThrow('查询主题不能为空');
    expect(() => agent.query(null)).toThrow('查询主题不能为空');
  });

  test('should handle plugin preProcess and postProcess', () => {
    const plugin = {
      name: 'test-plugin',
      preProcess: (content) => content + ' (processed)',
      postProcess: (result) => {
        result.processed = true;
        return result;
      }
    };
    
    agent.registerPlugin(plugin);
    
    const content = '测试内容';
    const result = agent.capture(content);
    
    expect(result.processed).toBe(true);
    expect(result.data.originalContent).toBe('测试内容 (processed)');
  });

  test('should handle plugin errors gracefully', () => {
    const plugin = {
      name: 'error-plugin',
      preProcess: () => {
        throw new Error('Plugin error');
      }
    };
    
    agent.registerPlugin(plugin);
    
    // 应该仍然能够正常工作，即使插件出错
    expect(() => agent.capture('测试内容')).not.toThrow();
  });

  test('should handle invalid category', () => {
    // 测试无效分类的情况
    const customStructure = {
      '知识宇宙': {
        'AI': {}
      }
    };
    
    const customAgent = new KnowledgeAgent({
      knowledgeStructure: customStructure
    });
    
    // 这应该不会抛出错误，而是存储到默认分类
    expect(() => {
      customAgent.capture('测试内容');
    }).not.toThrow();
  });

  test('should handle unsupported export format', () => {
    expect(() => agent.exportKnowledge('unsupported')).toThrow('Unsupported export format');
  });

  test('should handle invalid import data', () => {
    expect(() => agent.importKnowledge('invalid json')).toThrow();
  });
});

describe('KnowledgeUtils', () => {
  test('should extract model from content', () => {
    const content = 'PSOS是一个产品战略框架';
    const model = KnowledgeUtils.extractModel(content);
    expect(model).toBe('PSOS框架');
  });

  test('should return default model when no model found', () => {
    const content = '这是一段没有模型的内容';
    const model = KnowledgeUtils.extractModel(content);
    expect(model).toBe('通用模型');
  });

  test('should extract concepts from content', () => {
    const content = 'AI和商业的结合是未来的趋势';
    const concepts = KnowledgeUtils.extractConcepts(content);
    expect(Array.isArray(concepts)).toBe(true);
    expect(concepts.length).toBeGreaterThan(0);
  });

  test('should process content into structured knowledge', () => {
    const content = 'OpenAI正在做Agent生态。Agent是AI的未来发展方向。通过Agent，用户可以更自然地与AI交互。';
    const structuredKnowledge = KnowledgeUtils.processContent(content);
    expect(structuredKnowledge).toHaveProperty('coreConclusion');
    expect(structuredKnowledge).toHaveProperty('keyLogic');
    expect(structuredKnowledge).toHaveProperty('model');
    expect(structuredKnowledge).toHaveProperty('application');
  });

  test('should auto classify knowledge', () => {
    const knowledge = {
      originalContent: 'AI正在改变世界'
    };
    const category = KnowledgeUtils.autoClassify(knowledge);
    expect(Array.isArray(category)).toBe(true);
    expect(category[0]).toBe('AI');
  });

  test('should determine subcategory', () => {
    expect(KnowledgeUtils.determineSubCategory('这是一个模型')).toBe('模型');
    expect(KnowledgeUtils.determineSubCategory('这是一个案例')).toBe('案例');
    expect(KnowledgeUtils.determineSubCategory('这是一个方法论')).toBe('方法论');
    expect(KnowledgeUtils.determineSubCategory('这是一些数据')).toBe('数据');
    expect(KnowledgeUtils.determineSubCategory('这是其他内容')).toBe('案例');
  });
});
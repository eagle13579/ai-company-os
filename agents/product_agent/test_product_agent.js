/**
 * Product Agent 测试文件
 */
const ProductAgent = require('./product_agent');

// 测试用例
describe('ProductAgent', () => {
  let productAgent;

  beforeEach(() => {
    productAgent = new ProductAgent();
  });

  describe('构造函数', () => {
    test('应该正确初始化属性', () => {
      expect(productAgent.role).toBe('全球产品天才');
      expect(productAgent.mission).toBe('把市场需求变成产品');
      expect(productAgent.responsibilities).toEqual([
        '产品设计',
        'MVP方案',
        '功能规划',
        '用户体验优化',
      ]);
      expect(productAgent.analysisModel.productDevelopment).toEqual([
        '需求分析',
        '解决方案设计',
        'MVP规划',
        '产品路线图',
      ]);
    });
  });

  describe('analyzeProductDevelopment 方法', () => {
    test('应该正确分析产品研发数据', () => {
      const testData = {
        needs: '用户需要一个智能助手来管理日常任务',
        solution: '开发一个AI驱动的任务管理应用',
        mvp: '实现基本的任务创建、编辑和提醒功能',
        features: ['任务管理', '智能提醒', '数据分析', '集成第三方服务'],
        roadmap: [
          'Q1: MVP发布',
          'Q2: 功能扩展',
          'Q3: 用户反馈优化',
          'Q4: 企业级功能',
        ],
      };

      const result = productAgent.analyzeProductDevelopment(testData);

      expect(result).toEqual({
        核心需求: '用户需要一个智能助手来管理日常任务',
        解决方案: '开发一个AI驱动的任务管理应用',
        MVP设计: '实现基本的任务创建、编辑和提醒功能',
        功能优先级: ['任务管理', '智能提醒', '数据分析', '集成第三方服务'],
        产品路线: [
          'Q1: MVP发布',
          'Q2: 功能扩展',
          'Q3: 用户反馈优化',
          'Q4: 企业级功能',
        ],
      });
    });

    test('应该处理无效输入', () => {
      const invalidData = 'not an object';
      const result = productAgent.analyzeProductDevelopment(invalidData);

      expect(result.error).toBe('Invalid input data: data must be an object');
    });

    test('应该处理缺失数据', () => {
      const partialData = {
        needs: '用户需要一个智能助手来管理日常任务',
      };

      const result = productAgent.analyzeProductDevelopment(partialData);

      expect(result.核心需求).toBe('用户需要一个智能助手来管理日常任务');
      expect(result.解决方案).toBe('需要更多解决方案信息');
      expect(result.MVP设计).toBe('需要更多MVP设计信息');
      expect(result.功能优先级).toBe('需要更多功能信息');
      expect(result.产品路线).toBe('需要更多产品路线信息');
    });
  });

  describe('identifyCoreNeeds 方法', () => {
    test('应该返回提供的需求', () => {
      const data = { needs: '测试需求' };
      expect(productAgent.identifyCoreNeeds(data)).toBe('测试需求');
    });

    test('应该处理缺失需求', () => {
      const data = {};
      expect(productAgent.identifyCoreNeeds(data)).toBe('需要更多需求信息');
    });
  });

  describe('designSolution 方法', () => {
    test('应该返回提供的解决方案', () => {
      const data = { solution: '测试解决方案' };
      expect(productAgent.designSolution(data)).toBe('测试解决方案');
    });

    test('应该处理缺失解决方案', () => {
      const data = {};
      expect(productAgent.designSolution(data)).toBe('需要更多解决方案信息');
    });
  });

  describe('designMVP 方法', () => {
    test('应该返回提供的MVP设计', () => {
      const data = { mvp: '测试MVP设计' };
      expect(productAgent.designMVP(data)).toBe('测试MVP设计');
    });

    test('应该处理缺失MVP设计', () => {
      const data = {};
      expect(productAgent.designMVP(data)).toBe('需要更多MVP设计信息');
    });
  });

  describe('prioritizeFeatures 方法', () => {
    test('应该返回提供的功能列表', () => {
      const features = ['功能1', '功能2'];
      const data = { features };
      expect(productAgent.prioritizeFeatures(data)).toEqual(features);
    });

    test('应该处理缺失功能列表', () => {
      const data = {};
      expect(productAgent.prioritizeFeatures(data)).toBe('需要更多功能信息');
    });
  });

  describe('createProductRoadmap 方法', () => {
    test('应该返回提供的产品路线', () => {
      const roadmap = ['阶段1', '阶段2'];
      const data = { roadmap };
      expect(productAgent.createProductRoadmap(data)).toEqual(roadmap);
    });

    test('应该处理缺失产品路线', () => {
      const data = {};
      expect(productAgent.createProductRoadmap(data)).toBe(
        '需要更多产品路线信息'
      );
    });
  });
});

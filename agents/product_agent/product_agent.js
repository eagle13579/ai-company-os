/**
 * Product Agent - 全球产品天才
 * 使命：把市场需求变成产品
 * 职责：产品设计、MVP方案、功能规划、用户体验优化
 */
const winston = require('winston');

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'product_agent.log' }),
  ],
});

class ProductAgent {
  /**
   * 构造函数
   */
  constructor() {
    this.role = '全球产品天才';
    this.mission = '把市场需求变成产品';
    this.responsibilities = ['产品设计', 'MVP方案', '功能规划', '用户体验优化'];
    this.analysisModel = {
      productDevelopment: ['需求分析', '解决方案设计', 'MVP规划', '产品路线图'],
    };
  }

  /**
   * 执行产品研发分析
   * @param {Object} data - 产品研发分析数据
   * @param {string} data.needs - 核心需求
   * @param {string} data.solution - 解决方案
   * @param {string} data.mvp - MVP设计
   * @param {Array} data.features - 功能优先级
   * @param {Array} data.roadmap - 产品路线
   * @returns {Object} 产品研发分析结果
   */
  analyzeProductDevelopment(data) {
    try {
      // 输入验证
      if (!data || typeof data !== 'object' || Array.isArray(data)) {
        throw new Error('Invalid input data: data must be an object');
      }

      logger.info('Starting product development analysis', {
        data: {
          needs: data.needs ? 'provided' : 'missing',
          solution: data.solution ? 'provided' : 'missing',
          mvp: data.mvp ? 'provided' : 'missing',
          features: data.features ? 'provided' : 'missing',
          roadmap: data.roadmap ? 'provided' : 'missing',
        },
      });

      const analysis = {
        核心需求: this.identifyCoreNeeds(data),
        解决方案: this.designSolution(data),
        MVP设计: this.designMVP(data),
        功能优先级: this.prioritizeFeatures(data),
        产品路线: this.createProductRoadmap(data),
      };

      logger.info('Product development analysis completed successfully');
      return analysis;
    } catch (error) {
      logger.error('Product development analysis error:', {
        error: error.message,
        stack: error.stack,
      });
      return {
        核心需求: '分析失败',
        解决方案: '分析失败',
        MVP设计: '分析失败',
        功能优先级: '分析失败',
        产品路线: '分析失败',
        error: error.message,
      };
    }
  }

  /**
   * 识别核心需求
   * @param {Object} data - 输入数据
   * @returns {string} 核心需求
   */
  identifyCoreNeeds(data) {
    try {
      if (!data) {
        return '需要更多需求信息';
      }

      if (typeof data.needs === 'string' && data.needs.trim()) {
        return data.needs.trim();
      }

      return '需要更多需求信息';
    } catch (error) {
      logger.error('Error identifying core needs:', { error: error.message });
      return '需要更多需求信息';
    }
  }

  /**
   * 设计解决方案
   * @param {Object} data - 输入数据
   * @returns {string} 解决方案
   */
  designSolution(data) {
    try {
      if (!data) {
        return '需要更多解决方案信息';
      }

      if (typeof data.solution === 'string' && data.solution.trim()) {
        return data.solution.trim();
      }

      return '需要更多解决方案信息';
    } catch (error) {
      logger.error('Error designing solution:', { error: error.message });
      return '需要更多解决方案信息';
    }
  }

  /**
   * 设计MVP
   * @param {Object} data - 输入数据
   * @returns {string} MVP设计
   */
  designMVP(data) {
    try {
      if (!data) {
        return '需要更多MVP设计信息';
      }

      if (typeof data.mvp === 'string' && data.mvp.trim()) {
        return data.mvp.trim();
      }

      return '需要更多MVP设计信息';
    } catch (error) {
      logger.error('Error designing MVP:', { error: error.message });
      return '需要更多MVP设计信息';
    }
  }

  /**
   * 优先级排序功能
   * @param {Object} data - 输入数据
   * @returns {Array|string} 功能优先级
   */
  prioritizeFeatures(data) {
    try {
      if (!data) {
        return '需要更多功能信息';
      }

      if (Array.isArray(data.features) && data.features.length > 0) {
        // 过滤无效元素
        return data.features.filter(
          (feature) => typeof feature === 'string' && feature.trim()
        );
      }

      return '需要更多功能信息';
    } catch (error) {
      logger.error('Error prioritizing features:', { error: error.message });
      return '需要更多功能信息';
    }
  }

  /**
   * 创建产品路线图
   * @param {Object} data - 输入数据
   * @returns {Array|string} 产品路线
   */
  createProductRoadmap(data) {
    try {
      if (!data) {
        return '需要更多产品路线信息';
      }

      if (Array.isArray(data.roadmap) && data.roadmap.length > 0) {
        // 过滤无效元素
        return data.roadmap.filter(
          (item) => typeof item === 'string' && item.trim()
        );
      }

      return '需要更多产品路线信息';
    } catch (error) {
      logger.error('Error creating product roadmap:', { error: error.message });
      return '需要更多产品路线信息';
    }
  }
}

module.exports = ProductAgent;

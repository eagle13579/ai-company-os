/**
 * Sales Agent - 全球销售天才
 * 使命：把产品卖出去
 * 职责：客户开发、销售策略、成交路径、渠道拓展
 */
class SalesAgent {
  /**
   * 构造函数
   */
  constructor() {
    this.role = '全球销售天才';
    this.mission = '把产品卖出去';
    this.responsibilities = ['客户开发', '销售策略', '成交路径', '渠道拓展'];
    this.thoughtModel = ['客户来源', '销售话术', '成交策略', '复购增长'];
    this.defaultSalesPath = '了解需求 → 产品演示 → 方案定制 → 签约成交';
    this.defaultClosingStrategies = [
      '限时优惠',
      '分期付款',
      '免费试用',
      '增值服务',
    ];
    this.defaultChannels = [
      '线上推广',
      '行业展会',
      '合作伙伴',
      '电话销售',
      '内容营销',
    ];
  }

  /**
   * 执行销售分析
   * @param {Object} data - 销售分析数据
   * @param {string} data.product - 产品信息
   * @param {string} data.targetCustomer - 目标客户
   * @param {string} data.salesPath - 销售路径
   * @param {string} data.closingStrategy - 成交策略
   * @param {string} data.channelSuggestions - 渠道建议
   * @param {string} data.estimatedRevenue - 预估收入
   * @param {number} data.customerAcquisitionCost - 客户获取成本
   * @param {number} data.conversionRate - 转化率
   * @returns {Object} 销售分析结果
   */
  analyzeSales(data) {
    try {
      this.validateInput(data);

      const analysis = {
        '【目标客户】': this.identifyTargetCustomer(data),
        '【销售路径】': this.defineSalesPath(data),
        '【成交策略】': this.developClosingStrategy(data),
        '【渠道建议】': this.suggestChannels(data),
        '【预估收入】': this.estimateRevenue(data),
        '【销售建议】': this.generateSalesRecommendations(data),
        '【市场洞察】': this.generateMarketInsights(data),
      };

      return analysis;
    } catch (error) {
      // 使用 console.error 是为了方便调试，符合项目其他部分的做法
      console.error('Sales analysis error:', error.message);
      return {
        '【目标客户】': '分析失败',
        '【销售路径】': '分析失败',
        '【成交策略】': '分析失败',
        '【渠道建议】': '分析失败',
        '【预估收入】': '分析失败',
        '【销售建议】': '分析失败',
        '【市场洞察】': '分析失败',
        error: error.message,
      };
    }
  }

  /**
   * 验证输入数据
   * @param {Object} data - 输入数据
   * @throws {Error} 如果输入数据无效
   */
  validateInput(data) {
    if (!data || typeof data !== 'object' || Array.isArray(data)) {
      throw new Error('Invalid input data: data must be an object');
    }

    // 验证必要字段
    if (!data.product) {
      throw new Error('Invalid input data: product is required');
    }
  }

  /**
   * 识别目标客户
   * @param {Object} data - 输入数据
   * @returns {string} 目标客户信息
   */
  identifyTargetCustomer(data) {
    if (data.targetCustomer) {
      return data.targetCustomer;
    }
    return '需要更多目标客户信息';
  }

  /**
   * 定义销售路径
   * @param {Object} data - 输入数据
   * @returns {string} 销售路径
   */
  defineSalesPath(data) {
    if (data.salesPath) {
      return data.salesPath;
    }
    return this.defaultSalesPath;
  }

  /**
   * 制定成交策略
   * @param {Object} data - 输入数据
   * @returns {string} 成交策略
   */
  developClosingStrategy(data) {
    if (data.closingStrategy) {
      return data.closingStrategy;
    }
    return this.defaultClosingStrategies.join(' + ');
  }

  /**
   * 提供渠道建议
   * @param {Object} data - 输入数据
   * @returns {string} 渠道建议
   */
  suggestChannels(data) {
    if (data.channelSuggestions) {
      return data.channelSuggestions;
    }
    return this.defaultChannels;
  }

  /**
   * 预估收入
   * @param {Object} data - 输入数据
   * @returns {string} 预估收入
   */
  estimateRevenue(data) {
    if (data.estimatedRevenue) {
      return data.estimatedRevenue;
    }

    // 基于转化率和客户获取成本估算收入
    if (data.conversionRate && data.customerAcquisitionCost) {
      const estimatedCustomers = 1000; // 假设潜在客户数量
      const convertedCustomers = estimatedCustomers * data.conversionRate;
      const averageRevenuePerCustomer = data.customerAcquisitionCost * 3; // 假设收入是获客成本的3倍
      const totalRevenue = convertedCustomers * averageRevenuePerCustomer;
      return `基于当前数据预估收入: ${totalRevenue.toFixed(2)} 元`;
    }

    return '需要更多预估收入信息';
  }

  /**
   * 生成销售建议
   * @param {Object} data - 输入数据
   * @returns {Array} 销售建议
   */
  generateSalesRecommendations(data) {
    const recommendations = [];

    if (!data.targetCustomer) {
      recommendations.push('建议明确目标客户群体，以便制定更精准的销售策略');
    }

    if (!data.salesPath) {
      recommendations.push('建议优化销售路径，提高销售效率');
    }

    if (!data.closingStrategy) {
      recommendations.push('建议制定有效的成交策略，提高转化率');
    }

    if (!data.channelSuggestions) {
      recommendations.push('建议拓展销售渠道，增加客户触达');
    }

    if (data.conversionRate && data.conversionRate < 0.1) {
      recommendations.push('转化率较低，建议优化销售流程和话术');
    }

    if (data.customerAcquisitionCost && data.customerAcquisitionCost > 1000) {
      recommendations.push('客户获取成本较高，建议优化获客渠道');
    }

    return recommendations.length > 0
      ? recommendations
      : ['当前销售策略良好，建议保持并持续优化'];
  }

  /**
   * 生成市场洞察
   * @param {Object} data - 输入数据
   * @returns {Array} 市场洞察
   */
  generateMarketInsights(data) {
    const insights = [];

    if (data.product) {
      insights.push(`产品 ${data.product} 具有市场潜力，建议加强市场推广`);
    }

    if (data.targetCustomer) {
      insights.push(
        `目标客户 ${data.targetCustomer} 是一个有价值的市场 segment`
      );
    }

    if (data.conversionRate) {
      insights.push(
        `当前转化率为 ${(data.conversionRate * 100).toFixed(2)}%，处于行业${data.conversionRate > 0.1 ? '较高' : '较低'}水平`
      );
    }

    return insights.length > 0
      ? insights
      : ['建议收集更多市场数据以获得更深入的洞察'];
  }
}

module.exports = SalesAgent;

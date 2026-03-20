/**
 * Finance Agent - 全球超级资本天才
 * 使命：用资本结构放大商业价值
 * 职责：股权设计、合作结构、融资策略、估值路径
 */
const logger = require('./logger');

class FinanceAgent {
  /**
   * 构造函数
   * @param {Object} options - 配置选项
   * @param {boolean} options.enableLogging - 是否启用日志
   * @param {string} options.logLevel - 日志级别
   */
  constructor(options = {}) {
    this.role = '全球超级资本天才';
    this.mission = '用资本结构放大商业价值';
    this.responsibilities = ['股权设计', '合作结构', '融资策略', '估值路径'];
    this.analysisModel = {
      capitalStructure: ['资源', '结构', '资本', '估值'],
    };
    this.options = {
      enableLogging: true,
      logLevel: 'info',
      ...options,
    };
    this.plugins = [];
  }

  /**
   * 注册插件
   * @param {Object} plugin - 插件对象
   * @param {function} plugin.preProcess - 预处理函数
   * @param {function} plugin.postProcess - 后处理函数
   * @param {string} plugin.name - 插件名称
   */
  registerPlugin(plugin) {
    if (plugin && typeof plugin === 'object') {
      this.plugins.push(plugin);
      logger.info('Plugin registered successfully', {
        plugin: plugin.name || 'unknown',
      });
    }
  }

  /**
   * 验证字段格式
   * @param {Object} data - 数据对象
   * @param {string} fieldPath - 字段路径
   * @param {string} expectedType - 期望类型
   * @returns {boolean} 是否验证通过
   */
  _validateField(data, fieldPath, expectedType) {
    try {
      const fields = fieldPath.split('.');
      let current = data;
      
      for (const field of fields) {
        if (!current || typeof current !== 'object') {
          return false;
        }
        current = current[field];
      }
      
      if (current === undefined) {
        return false;
      }
      
      if (typeof current !== expectedType) {
        logger.warn(`Invalid ${fieldPath} format, expected ${expectedType}`, {
          actualType: typeof current,
        });
        return false;
      }
      
      return true;
    } catch (error) {
      logger.error('Error validating field:', {
        error: error.message,
        fieldPath,
      });
      return false;
    }
  }

  /**
   * 执行财务分析
   * @param {Object} data - 财务分析数据
   * @param {Object} data.partnership - 合作结构数据
   * @param {Object} data.equity - 股权设计数据
   * @param {Object} data.financing - 融资策略数据
   * @param {Object} data.valuation - 估值路径数据
   * @param {Array} data.risks - 风险因素
   * @returns {Object} 财务分析结果
   */
  analyzeFinance(data) {
    const startTime = Date.now();
    try {
      // 输入验证
      if (!data || typeof data !== 'object' || Array.isArray(data)) {
        throw new Error('Invalid input data: data must be an object');
      }

      // 执行插件的预处理
      this.plugins.forEach((plugin) => {
        if (plugin.preProcess) {
          try {
            data = plugin.preProcess(data);
          } catch (error) {
            logger.error('Plugin preProcess error:', {
              plugin: plugin.name || 'unknown',
              error: error.message,
            });
          }
        }
      });

      logger.info('Starting finance analysis', {
        data: {
          partnership: data.partnership ? 'provided' : 'missing',
          equity: data.equity ? 'provided' : 'missing',
          financing: data.financing ? 'provided' : 'missing',
          valuation: data.valuation ? 'provided' : 'missing',
          risks: data.risks ? 'provided' : 'missing',
        },
      });

      let analysis = {
        合作结构: this.analyzePartnership(data),
        股权设计: this.analyzeEquity(data),
        融资策略: this.analyzeFinancing(data),
        估值路径: this.analyzeValuation(data),
        风险: this.analyzeRisks(data),
      };

      // 执行插件的后处理
      this.plugins.forEach((plugin) => {
        if (plugin.postProcess) {
          try {
            analysis = plugin.postProcess(analysis);
          } catch (error) {
            logger.error('Plugin postProcess error:', {
              plugin: plugin.name || 'unknown',
              error: error.message,
            });
          }
        }
      });

      const endTime = Date.now();
      logger.info('Finance analysis completed successfully', {
        duration: endTime - startTime,
      });
      return analysis;
    } catch (error) {
      const endTime = Date.now();
      logger.error('Finance analysis error:', {
        error: error.message,
        stack: error.stack,
        duration: endTime - startTime,
      });
      return {
        合作结构: '分析失败',
        股权设计: '分析失败',
        融资策略: '分析失败',
        估值路径: '分析失败',
        风险: '分析失败',
        error: error.message,
      };
    }
  }

  /**
   * 分析合作结构
   * @param {Object} data - 输入数据
   * @returns {Object|string} 合作结构分析
   */
  analyzePartnership(data) {
    try {
      if (!data) {
        return '需要更多合作结构信息';
      }

      if (data.partnership && typeof data.partnership === 'object') {
        // 验证具体字段格式
        this._validateField(data, 'partnership.model', 'string');
        this._validateField(data, 'partnership.profitShare', 'string');
        this._validateField(data, 'partnership.responsibilities', 'string');
        this._validateField(data, 'partnership.exitStrategy', 'string');

        return {
          合作模式: data.partnership.model || '需要更多信息',
          利益分配: data.partnership.profitShare || '需要更多信息',
          责任划分: data.partnership.responsibilities || '需要更多信息',
          退出机制: data.partnership.exitStrategy || '需要更多信息',
        };
      }

      return '需要更多合作结构信息';
    } catch (error) {
      logger.error('Error analyzing partnership:', { error: error.message });
      return '需要更多合作结构信息';
    }
  }

  /**
   * 分析股权设计
   * @param {Object} data - 输入数据
   * @returns {Object|string} 股权设计分析
   */
  analyzeEquity(data) {
    try {
      if (!data) {
        return '需要更多股权设计信息';
      }

      if (data.equity && typeof data.equity === 'object') {
        // 验证具体字段格式
        this._validateField(data, 'equity.structure', 'string');
        this._validateField(data, 'equity.founderStake', 'string');
        this._validateField(data, 'equity.optionPool', 'string');
        this._validateField(data, 'equity.votingRights', 'string');

        return {
          股权结构: data.equity.structure || '需要更多信息',
          创始人持股: data.equity.founderStake || '需要更多信息',
          期权池: data.equity.optionPool || '需要更多信息',
          表决权: data.equity.votingRights || '需要更多信息',
        };
      }

      return '需要更多股权设计信息';
    } catch (error) {
      logger.error('Error analyzing equity:', { error: error.message });
      return '需要更多股权设计信息';
    }
  }

  /**
   * 分析融资策略
   * @param {Object} data - 输入数据
   * @returns {Object|string} 融资策略分析
   */
  analyzeFinancing(data) {
    try {
      if (!data) {
        return '需要更多融资策略信息';
      }

      if (data.financing && typeof data.financing === 'object') {
        // 验证具体字段格式
        this._validateField(data, 'financing.rounds', 'string');
        this._validateField(data, 'financing.targetAmount', 'string');
        this._validateField(data, 'financing.investorTypes', 'string');
        this._validateField(data, 'financing.terms', 'string');

        return {
          融资轮次: data.financing.rounds || '需要更多信息',
          目标金额: data.financing.targetAmount || '需要更多信息',
          投资者类型: data.financing.investorTypes || '需要更多信息',
          融资条件: data.financing.terms || '需要更多信息',
        };
      }

      return '需要更多融资策略信息';
    } catch (error) {
      logger.error('Error analyzing financing:', { error: error.message });
      return '需要更多融资策略信息';
    }
  }

  /**
   * 分析估值路径
   * @param {Object} data - 输入数据
   * @returns {Object|string} 估值路径分析
   */
  analyzeValuation(data) {
    try {
      if (!data) {
        return '需要更多估值路径信息';
      }

      if (data.valuation && typeof data.valuation === 'object') {
        // 验证具体字段格式
        this._validateField(data, 'valuation.current', 'string');
        this._validateField(data, 'valuation.growthExpectations', 'string');
        this._validateField(data, 'valuation.keyMetrics', 'string');
        this._validateField(data, 'valuation.exitValuation', 'string');

        return {
          当前估值: data.valuation.current || '需要更多信息',
          增长预期: data.valuation.growthExpectations || '需要更多信息',
          关键指标: data.valuation.keyMetrics || '需要更多信息',
          退出估值: data.valuation.exitValuation || '需要更多信息',
        };
      }

      return '需要更多估值路径信息';
    } catch (error) {
      logger.error('Error analyzing valuation:', { error: error.message });
      return '需要更多估值路径信息';
    }
  }

  /**
   * 分析风险
   * @param {Object} data - 输入数据
   * @returns {Array|string} 风险分析
   */
  analyzeRisks(data) {
    try {
      if (!data) {
        return '需要更多风险信息';
      }

      if (data.risks) {
        if (Array.isArray(data.risks) && data.risks.length > 0) {
          // 过滤无效元素
          return data.risks.filter(
            (risk) => typeof risk === 'string' && risk.trim()
          );
        } else {
          logger.warn('Invalid risks format, expected array', {
            actualType: typeof data.risks,
          });
          return '风险数据格式错误';
        }
      }

      return '需要更多风险信息';
    } catch (error) {
      logger.error('Error analyzing risks:', { error: error.message });
      return '需要更多风险信息';
    }
  }

  /**
   * 获取 Agent 信息
   * @returns {Object} Agent 信息
   */
  getAgentInfo() {
    return {
      role: this.role,
      mission: this.mission,
      responsibilities: this.responsibilities,
      analysisModel: this.analysisModel,
      options: this.options,
      pluginCount: this.plugins.length,
    };
  }
}

module.exports = FinanceAgent;
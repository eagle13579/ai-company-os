const { Logger, ErrorHandler, Utils } = require('./utils/utils');

class RiskManager {
  constructor() {
    this.risks = [];
    this.mitigationPlans = [];
  }

  async assessRisks(strategy) {
    try {
      Logger.info('Assessing risks for strategy', { strategyId: strategy.id });
      
      const identifiedRisks = this.identifyRisks(strategy);
      const assessedRisks = this.evaluateRisks(identifiedRisks);
      const categorizedRisks = this.categorizeRisks(assessedRisks);
      
      this.risks = [...this.risks, ...categorizedRisks.all];
      
      Logger.info('Risk assessment completed', {
        totalRisks: categorizedRisks.all.length,
        highRisks: categorizedRisks.high.length,
        mediumRisks: categorizedRisks.medium.length,
        lowRisks: categorizedRisks.low.length
      });
      
      return {
        risks: categorizedRisks.all,
        highRisks: categorizedRisks.high,
        mediumRisks: categorizedRisks.medium,
        lowRisks: categorizedRisks.low,
        riskScore: this.calculateRiskScore(categorizedRisks),
        assessmentDate: new Date().toISOString()
      };
    } catch (error) {
      Logger.error('Failed to assess risks', error);
      throw error;
    }
  }

  identifyRisks(strategy) {
    const risks = [];
    
    // 市场风险
    risks.push({
      id: Utils.generateId('risk'),
      type: 'market',
      description: '市场需求变化',
      source: '战略规划',
      potentialImpact: 70,
      probability: 60
    });
    
    // 竞争风险
    risks.push({
      id: Utils.generateId('risk'),
      type: 'competitive',
      description: '竞争对手策略变化',
      source: '战略规划',
      potentialImpact: 65,
      probability: 55
    });
    
    // 资源风险
    risks.push({
      id: Utils.generateId('risk'),
      type: 'resource',
      description: '资源不足',
      source: '资源分配',
      potentialImpact: 60,
      probability: 50
    });
    
    // 时间风险
    risks.push({
      id: Utils.generateId('risk'),
      type: 'time',
      description: '项目延期',
      source: '时间规划',
      potentialImpact: 55,
      probability: 45
    });
    
    // 技术风险
    risks.push({
      id: Utils.generateId('risk'),
      type: 'technical',
      description: '技术实现困难',
      source: '技术规划',
      potentialImpact: 50,
      probability: 40
    });
    
    return risks;
  }

  evaluateRisks(risks) {
    return risks.map(risk => ({
      ...risk,
      riskScore: (risk.potentialImpact * risk.probability) / 100,
      riskLevel: this.calculateRiskLevel(risk.potentialImpact, risk.probability)
    }));
  }

  calculateRiskLevel(impact, probability) {
    const score = (impact * probability) / 100;
    if (score >= 60) return 'high';
    if (score >= 30) return 'medium';
    return 'low';
  }

  categorizeRisks(risks) {
    const high = risks.filter(risk => risk.riskLevel === 'high');
    const medium = risks.filter(risk => risk.riskLevel === 'medium');
    const low = risks.filter(risk => risk.riskLevel === 'low');
    
    return { all: risks, high, medium, low };
  }

  calculateRiskScore(categorizedRisks) {
    const highScore = categorizedRisks.high.length * 3;
    const mediumScore = categorizedRisks.medium.length * 2;
    const lowScore = categorizedRisks.low.length * 1;
    const totalScore = highScore + mediumScore + lowScore;
    const maxScore = categorizedRisks.all.length * 3;
    
    return maxScore > 0 ? Math.round((totalScore / maxScore) * 100) : 0;
  }

  async developMitigationPlan(risks) {
    try {
      Logger.info('Developing mitigation plan', { riskCount: risks.length });
      
      const mitigationPlan = {
        id: Utils.generateId('mitigation'),
        risks: [],
        strategies: [],
        timeline: this.generateMitigationTimeline(),
        createdDate: new Date().toISOString()
      };
      
      risks.forEach(risk => {
        const strategy = this.generateMitigationStrategy(risk);
        mitigationPlan.risks.push(risk);
        mitigationPlan.strategies.push(strategy);
      });
      
      this.mitigationPlans.push(mitigationPlan);
      
      Logger.info('Mitigation plan developed', { planId: mitigationPlan.id });
      return mitigationPlan;
    } catch (error) {
      Logger.error('Failed to develop mitigation plan', error);
      throw error;
    }
  }

  generateMitigationStrategy(risk) {
    const strategies = {
      high: ['避免风险', '转移风险', '减轻风险'],
      medium: ['减轻风险', '监控风险'],
      low: ['接受风险', '监控风险']
    };
    
    return {
      id: Utils.generateId('strategy'),
      riskId: risk.id,
      riskDescription: risk.description,
      strategies: strategies[risk.riskLevel] || strategies.low,
      responsible: 'Risk Manager',
      timeline: this.getStrategyTimeline(risk.riskLevel),
      status: 'pending'
    };
  }

  getStrategyTimeline(riskLevel) {
    const durations = { high: 7, medium: 14, low: 30 };
    const duration = durations[riskLevel] || 14;
    
    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + duration);
    
    return {
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      duration
    };
  }

  generateMitigationTimeline() {
    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + 90);
    
    return {
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      milestones: [
        {
          name: '风险识别与评估',
          date: startDate.toISOString()
        },
        {
          name: '缓解策略实施',
          date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          name: '风险监控',
          date: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          name: '效果评估',
          date: endDate.toISOString()
        }
      ]
    };
  }

  async monitorRisks(risks) {
    try {
      Logger.info('Monitoring risks', { riskCount: risks.length });
      
      const monitoredRisks = risks.map(risk => ({
        ...risk,
        status: this.assessRiskStatus(risk),
        trend: this.assessRiskTrend(risk),
        lastMonitored: new Date().toISOString(),
        mitigationProgress: this.calculateMitigationProgress(risk)
      }));
      
      Logger.info('Risk monitoring completed', { monitoredCount: monitoredRisks.length });
      return monitoredRisks;
    } catch (error) {
      Logger.error('Failed to monitor risks', error);
      throw error;
    }
  }

  assessRiskStatus(risk) {
    const statuses = ['active', 'mitigated', 'resolved'];
    return statuses[Math.floor(Math.random() * statuses.length)];
  }

  assessRiskTrend(risk) {
    const trends = ['increasing', 'stable', 'decreasing'];
    return trends[Math.floor(Math.random() * trends.length)];
  }

  calculateMitigationProgress(risk) {
    return Math.floor(Math.random() * 101);
  }
}

module.exports = RiskManager;
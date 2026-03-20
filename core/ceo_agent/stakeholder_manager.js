const { Logger, ErrorHandler, Utils } = require('./utils/utils');

class StakeholderManager {
  constructor() {
    this.stakeholders = [];
    this.communicationPlans = [];
  }

  async analyzeStakeholders() {
    try {
      Logger.info('Analyzing stakeholders');
      
      const identifiedStakeholders = this.identifyStakeholders();
      const assessedStakeholders = this.assessStakeholders(identifiedStakeholders);
      const categorizedStakeholders = this.categorizeStakeholders(assessedStakeholders);
      
      this.stakeholders = [...this.stakeholders, ...assessedStakeholders];
      
      Logger.info('Stakeholder analysis completed', {
        totalStakeholders: assessedStakeholders.length,
        highPriority: categorizedStakeholders.high.length,
        mediumPriority: categorizedStakeholders.medium.length,
        lowPriority: categorizedStakeholders.low.length
      });
      
      return {
        stakeholders: assessedStakeholders,
        highPriority: categorizedStakeholders.high,
        mediumPriority: categorizedStakeholders.medium,
        lowPriority: categorizedStakeholders.low,
        stakeholderMap: this.generateStakeholderMap(assessedStakeholders),
        analysisDate: new Date().toISOString()
      };
    } catch (error) {
      Logger.error('Failed to analyze stakeholders', error);
      throw error;
    }
  }

  identifyStakeholders() {
    return [
      {
        id: 's1',
        name: '股东',
        type: 'internal',
        interest: 'financial returns',
        influence: 'high',
        expectations: ['profit growth', 'dividends', 'share price appreciation']
      },
      {
        id: 's2',
        name: '员工',
        type: 'internal',
        interest: 'job security',
        influence: 'medium',
        expectations: ['fair compensation', 'career growth', 'safe working environment']
      },
      {
        id: 's3',
        name: '客户',
        type: 'external',
        interest: 'product quality',
        influence: 'high',
        expectations: ['high quality products', 'good customer service', 'competitive pricing']
      },
      {
        id: 's4',
        name: '供应商',
        type: 'external',
        interest: 'business relationship',
        influence: 'medium',
        expectations: ['timely payments', 'long-term partnership', 'fair treatment']
      },
      {
        id: 's5',
        name: '政府',
        type: 'external',
        interest: 'regulatory compliance',
        influence: 'high',
        expectations: ['tax compliance', 'regulatory adherence', 'social responsibility']
      },
      {
        id: 's6',
        name: '社区',
        type: 'external',
        interest: 'social impact',
        influence: 'low',
        expectations: ['environmental responsibility', 'community engagement', 'ethical practices']
      }
    ];
  }

  assessStakeholders(stakeholders) {
    return stakeholders.map(stakeholder => ({
      ...stakeholder,
      importance: this.calculateImportance(stakeholder),
      satisfaction: this.calculateSatisfaction(stakeholder),
      risk: this.calculateRisk(stakeholder),
      priority: this.calculatePriority(stakeholder)
    }));
  }

  calculateImportance(stakeholder) {
    const influenceScore = {
      high: 3,
      medium: 2,
      low: 1
    }[stakeholder.influence] || 2;
    
    const interestScore = stakeholder.expectations.length;
    return influenceScore * (interestScore / 3);
  }

  calculateSatisfaction(stakeholder) {
    return Math.floor(Math.random() * 30) + 70; // 70-100
  }

  calculateRisk(stakeholder) {
    const importance = this.calculateImportance(stakeholder);
    const satisfaction = this.calculateSatisfaction(stakeholder);
    
    if (importance > 2.5 && satisfaction < 80) return 'high';
    if (importance > 1.5 && satisfaction < 75) return 'medium';
    return 'low';
  }

  calculatePriority(stakeholder) {
    const importance = this.calculateImportance(stakeholder);
    const risk = this.calculateRisk(stakeholder);
    
    if (importance > 2.5 || risk === 'high') return 'high';
    if (importance > 1.5 || risk === 'medium') return 'medium';
    return 'low';
  }

  categorizeStakeholders(stakeholders) {
    const high = stakeholders.filter(s => s.priority === 'high');
    const medium = stakeholders.filter(s => s.priority === 'medium');
    const low = stakeholders.filter(s => s.priority === 'low');
    
    return { high, medium, low };
  }

  generateStakeholderMap(stakeholders) {
    return stakeholders.map(stakeholder => ({
      id: stakeholder.id,
      name: stakeholder.name,
      quadrant: this.determineQuadrant(stakeholder),
      importance: stakeholder.importance,
      satisfaction: stakeholder.satisfaction
    }));
  }

  determineQuadrant(stakeholder) {
    const importance = stakeholder.importance;
    const satisfaction = stakeholder.satisfaction;
    
    if (importance > 2 && satisfaction < 80) return '高重要性-低满意度';
    if (importance > 2 && satisfaction >= 80) return '高重要性-高满意度';
    if (importance <= 2 && satisfaction < 80) return '低重要性-低满意度';
    return '低重要性-高满意度';
  }

  async createCommunicationPlan(stakeholderAnalysis) {
    try {
      Logger.info('Creating communication plan', { stakeholderCount: stakeholderAnalysis.stakeholders.length });
      
      const plans = stakeholderAnalysis.stakeholders.map(stakeholder => ({
        id: Utils.generateId('plan'),
        stakeholderId: stakeholder.id,
        stakeholderName: stakeholder.name,
        priority: stakeholder.priority,
        communicationObjectives: this.generateCommunicationObjectives(stakeholder),
        communicationChannels: this.generateCommunicationChannels(stakeholder),
        communicationFrequency: this.generateCommunicationFrequency(stakeholder),
        keyMessages: this.generateKeyMessages(stakeholder),
        responsible: this.assignResponsibility(stakeholder),
        timeline: this.generateCommunicationTimeline(stakeholder.priority),
        createdDate: new Date().toISOString()
      }));
      
      this.communicationPlans = [...this.communicationPlans, ...plans];
      
      Logger.info('Communication plan created', { planCount: plans.length });
      return {
        plans,
        prioritizedPlans: this.prioritizeCommunicationPlans(plans),
        resourceRequirements: this.calculateCommunicationResources(plans),
        successMetrics: this.defineSuccessMetrics(plans)
      };
    } catch (error) {
      Logger.error('Failed to create communication plan', error);
      throw error;
    }
  }

  generateCommunicationObjectives(stakeholder) {
    const objectives = [];
    
    if (stakeholder.satisfaction < 80) {
      objectives.push('提高满意度');
    }
    
    objectives.push('保持定期沟通');
    objectives.push('及时传递重要信息');
    
    return objectives;
  }

  generateCommunicationChannels(stakeholder) {
    const channels = {
      high: ['face-to-face meetings', 'executive briefings', 'personal emails'],
      medium: ['regular newsletters', 'virtual meetings', 'phone calls'],
      low: ['company website', 'social media', 'annual reports']
    };
    
    return channels[stakeholder.priority] || channels.medium;
  }

  generateCommunicationFrequency(stakeholder) {
    const frequency = {
      high: 'monthly',
      medium: 'quarterly',
      low: 'annually'
    };
    
    return frequency[stakeholder.priority] || 'quarterly';
  }

  generateKeyMessages(stakeholder) {
    const messages = {
      '股东': ['公司财务表现', '战略发展计划', '股息政策'],
      '员工': ['公司发展前景', '职业发展机会', '薪酬福利政策'],
      '客户': ['产品创新', '服务改进', '客户反馈响应'],
      '供应商': ['长期合作计划', '付款政策', '质量要求'],
      '政府': ['合规情况', '税收贡献', '社会责任'],
      '社区': ['环保举措', '社区投资', '就业机会']
    };
    
    return messages[stakeholder.name] || ['公司最新动态', '合作机会'];
  }

  assignResponsibility(stakeholder) {
    const responsibilities = {
      '股东': 'CEO',
      '员工': 'HR Director',
      '客户': 'Customer Service Director',
      '供应商': 'Procurement Director',
      '政府': 'Legal Director',
      '社区': 'Corporate Social Responsibility Manager'
    };
    
    return responsibilities[stakeholder.name] || 'General Manager';
  }

  generateCommunicationTimeline(priority) {
    const frequency = {
      high: 30,
      medium: 90,
      low: 365
    }[priority] || 90;
    
    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + frequency);
    
    return {
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      frequency: this.generateCommunicationFrequency({ priority })
    };
  }

  prioritizeCommunicationPlans(plans) {
    const priorityOrder = { high: 3, medium: 2, low: 1 };
    return [...plans].sort((a, b) => priorityOrder[b.priority] - priorityOrder[a.priority]);
  }

  calculateCommunicationResources(plans) {
    const highPriorityPlans = plans.filter(p => p.priority === 'high').length;
    const mediumPriorityPlans = plans.filter(p => p.priority === 'medium').length;
    const lowPriorityPlans = plans.filter(p => p.priority === 'low').length;
    
    const hours = highPriorityPlans * 10 + mediumPriorityPlans * 5 + lowPriorityPlans * 2;
    
    return {
      hours,
      estimatedCost: hours * 150,
      requiredRoles: ['Communications Specialist', 'Relationship Manager', 'Executive Assistant']
    };
  }

  defineSuccessMetrics(plans) {
    return {
      stakeholderSatisfaction: '提升10%',
      communicationEffectiveness: '90%+ positive feedback',
      responseTime: '24 hours for high priority',
      engagementRate: '75%+ participation in communications'
    };
  }

  async monitorStakeholderRelations(stakeholders, feedbackData) {
    try {
      Logger.info('Monitoring stakeholder relations', { stakeholderCount: stakeholders.length });
      
      const monitoredStakeholders = stakeholders.map(stakeholder => {
        const feedback = feedbackData[stakeholder.id] || {};
        
        return {
          ...stakeholder,
          currentSatisfaction: feedback.satisfaction || stakeholder.satisfaction,
          feedback: feedback.comments || [],
          lastUpdated: new Date().toISOString(),
          actionItems: feedback.actionItems || []
        };
      });
      
      Logger.info('Stakeholder relations monitored', { monitoredCount: monitoredStakeholders.length });
      return monitoredStakeholders;
    } catch (error) {
      Logger.error('Failed to monitor stakeholder relations', error);
      throw error;
    }
  }
}

module.exports = StakeholderManager;
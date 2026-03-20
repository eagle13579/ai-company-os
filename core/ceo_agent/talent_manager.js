const { Logger, ErrorHandler, Utils } = require('./utils/utils');

class TalentManager {
  constructor() {
    this.talentAssessments = [];
    this.developmentPlans = [];
  }

  async assessTalent(resources) {
    try {
      Logger.info('Assessing talent', { resourceCount: resources.length });
      
      const assessments = resources.map(resource => ({
        id: resource.id || Utils.generateId('talent'),
        name: resource.name,
        role: resource.role || 'general',
        skills: resource.skills || [],
        performance: this.evaluatePerformance(resource),
        potential: this.evaluatePotential(resource),
        strengths: this.identifyStrengths(resource),
        weaknesses: this.identifyWeaknesses(resource),
        overallScore: this.calculateOverallScore(resource),
        assessmentDate: new Date().toISOString()
      }));
      
      const categorizedTalent = this.categorizeTalent(assessments);
      
      this.talentAssessments = [...this.talentAssessments, ...assessments];
      
      Logger.info('Talent assessment completed', {
        totalAssessments: assessments.length,
        highPerformers: categorizedTalent.high.length,
        mediumPerformers: categorizedTalent.medium.length,
        lowPerformers: categorizedTalent.low.length
      });
      
      return {
        assessments,
        highPerformers: categorizedTalent.high,
        mediumPerformers: categorizedTalent.medium,
        lowPerformers: categorizedTalent.low,
        averageScore: this.calculateAverageScore(assessments),
        skillGaps: this.identifySkillGaps(assessments)
      };
    } catch (error) {
      Logger.error('Failed to assess talent', error);
      throw error;
    }
  }

  evaluatePerformance(resource) {
    return resource.performance || Math.floor(Math.random() * 40) + 60; // 60-100
  }

  evaluatePotential(resource) {
    return resource.potential || Math.floor(Math.random() * 30) + 70; // 70-100
  }

  identifyStrengths(resource) {
    const strengths = [];
    
    if (resource.skills) {
      if (resource.skills.includes('leadership')) strengths.push('领导能力');
      if (resource.skills.includes('communication')) strengths.push('沟通能力');
      if (resource.skills.includes('technical')) strengths.push('技术能力');
      if (resource.skills.includes('creativity')) strengths.push('创造力');
      if (resource.skills.includes('analytical')) strengths.push('分析能力');
    }
    
    return strengths.length > 0 ? strengths : ['通用能力'];
  }

  identifyWeaknesses(resource) {
    const allSkills = ['leadership', 'communication', 'technical', 'creativity', 'analytical'];
    const missingSkills = allSkills.filter(skill => !resource.skills?.includes(skill));
    
    const skillMap = {
      leadership: '领导能力',
      communication: '沟通能力',
      technical: '技术能力',
      creativity: '创造力',
      analytical: '分析能力'
    };
    
    return missingSkills.map(skill => skillMap[skill] || skill);
  }

  calculateOverallScore(resource) {
    const performance = this.evaluatePerformance(resource);
    const potential = this.evaluatePotential(resource);
    return Math.round((performance * 0.6 + potential * 0.4));
  }

  categorizeTalent(assessments) {
    const high = assessments.filter(a => a.overallScore >= 85);
    const medium = assessments.filter(a => a.overallScore >= 70 && a.overallScore < 85);
    const low = assessments.filter(a => a.overallScore < 70);
    
    return { high, medium, low };
  }

  calculateAverageScore(assessments) {
    if (assessments.length === 0) return 0;
    const sum = assessments.reduce((acc, a) => acc + a.overallScore, 0);
    return Math.round(sum / assessments.length);
  }

  identifySkillGaps(assessments) {
    const skillCounts = {};
    
    assessments.forEach(a => {
      a.skills.forEach(skill => {
        skillCounts[skill] = (skillCounts[skill] || 0) + 1;
      });
    });
    
    const totalResources = assessments.length;
    const gaps = [];
    
    Object.entries(skillCounts).forEach(([skill, count]) => {
      const coverage = (count / totalResources) * 100;
      if (coverage < 50) {
        gaps.push({
          skill,
          coverage: Math.round(coverage),
          priority: coverage < 25 ? 'high' : 'medium'
        });
      }
    });
    
    return gaps;
  }

  async createDevelopmentPlan(talentAssessment) {
    try {
      Logger.info('Creating development plans', { assessmentCount: talentAssessment.assessments.length });
      
      const plans = talentAssessment.assessments.map(assessment => ({
        id: Utils.generateId('plan'),
        talentId: assessment.id,
        name: assessment.name,
        currentRole: assessment.role,
        strengths: assessment.strengths,
        weaknesses: assessment.weaknesses,
        developmentGoals: this.generateDevelopmentGoals(assessment),
        trainingPlan: this.generateTrainingPlan(assessment),
        careerPath: this.generateCareerPath(assessment),
        timeline: this.generateDevelopmentTimeline(assessment.overallScore),
        createdDate: new Date().toISOString()
      }));
      
      this.developmentPlans = [...this.developmentPlans, ...plans];
      
      Logger.info('Development plans created', { planCount: plans.length });
      return {
        plans,
        prioritizedPlans: this.prioritizeDevelopmentPlans(plans),
        resourceRequirements: this.calculateResourceRequirements(plans),
        expectedOutcomes: this.calculateExpectedOutcomes(plans)
      };
    } catch (error) {
      Logger.error('Failed to create development plans', error);
      throw error;
    }
  }

  generateDevelopmentGoals(assessment) {
    const goals = [];
    
    assessment.weaknesses.forEach(weakness => {
      goals.push({
        id: Utils.generateId('goal'),
        description: `提高${weakness}`,
        priority: 'high',
        target: '3-6 months'
      });
    });
    
    if (assessment.strengths.length > 0) {
      goals.push({
        id: Utils.generateId('goal'),
        description: `进一步发展${assessment.strengths[0]}`,
        priority: 'medium',
        target: '6-12 months'
      });
    }
    
    return goals;
  }

  generateTrainingPlan(assessment) {
    const trainingModules = [];
    
    assessment.weaknesses.forEach(weakness => {
      trainingModules.push({
        id: Utils.generateId('training'),
        name: `${weakness}培训`,
        type: 'workshop',
        duration: '2 days',
        priority: 'high'
      });
    });
    
    return trainingModules;
  }

  generateCareerPath(assessment) {
    const paths = [];
    
    if (assessment.overallScore >= 85) {
      paths.push('高级管理岗位', '专家岗位', '跨部门领导');
    } else if (assessment.overallScore >= 70) {
      paths.push('中级管理岗位', '高级专业岗位');
    } else {
      paths.push('专业技能提升', '基础管理岗位');
    }
    
    return paths;
  }

  generateDevelopmentTimeline(score) {
    const duration = score >= 85 ? 6 : score >= 70 ? 9 : 12;
    
    const startDate = new Date();
    const endDate = new Date();
    endDate.setMonth(endDate.getMonth() + duration);
    
    return {
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      duration: `${duration} months`
    };
  }

  prioritizeDevelopmentPlans(plans) {
    return [...plans].sort((a, b) => {
      const scoreA = a.developmentGoals.filter(g => g.priority === 'high').length;
      const scoreB = b.developmentGoals.filter(g => g.priority === 'high').length;
      return scoreB - scoreA;
    });
  }

  calculateResourceRequirements(plans) {
    const trainingHours = plans.reduce((sum, plan) => sum + plan.trainingPlan.length * 16, 0);
    const mentoringHours = plans.length * 10;
    
    return {
      trainingHours,
      mentoringHours,
      totalHours: trainingHours + mentoringHours,
      estimatedCost: (trainingHours + mentoringHours) * 100
    };
  }

  calculateExpectedOutcomes(plans) {
    return {
      improvedPerformance: '20% average improvement',
      skillDevelopment: '80% of identified gaps addressed',
      retentionImprovement: '15% reduction in turnover',
      promotionReadiness: `${plans.filter(p => p.overallScore >= 85).length} employees ready for promotion`
    };
  }

  async trackDevelopmentProgress(plans, progressData) {
    try {
      Logger.info('Tracking development progress', { planCount: plans.length });
      
      const trackedPlans = plans.map(plan => {
        const progress = progressData[plan.talentId] || {};
        
        return {
          ...plan,
          progress: {
            overall: progress.overall || 0,
            goals: progress.goals || [],
            training: progress.training || [],
            lastUpdated: new Date().toISOString()
          }
        };
      });
      
      Logger.info('Development progress tracked', { trackedCount: trackedPlans.length });
      return trackedPlans;
    } catch (error) {
      Logger.error('Failed to track development progress', error);
      throw error;
    }
  }
}

module.exports = TalentManager;
const CEOAgent = require('./ceo_agent');
const Planner = require('./planner');
const DecisionEngine = require('./decision_engine');
const ReviewEngine = require('./review_engine');

async function testCEOAgentComplete() {
  console.log('=== CEO Agent 完整功能测试开始 ===');
  
  // 创建CEO Agent实例
  const ceoAgent = new CEOAgent();
  
  // 设置核心引擎
  ceoAgent.setPlanner(new Planner());
  ceoAgent.setDecisionEngine(new DecisionEngine());
  ceoAgent.setReviewEngine(new ReviewEngine());
  
  // 初始化资源
  const resources = [
    { id: 'r1', name: 'Alice', role: 'Manager', skills: ['leadership', 'communication', 'strategic'] },
    { id: 'r2', name: 'Bob', role: 'Developer', skills: ['technical', 'problem-solving', 'coding'] },
    { id: 'r3', name: 'Charlie', role: 'Marketer', skills: ['marketing', 'creativity', 'communication'] },
    { id: 'r4', name: 'David', role: 'Analyst', skills: ['analytical', 'data', 'research'] }
  ];
  
  // 创建战略
  const goals = [
    { id: 'g1', name: '市场扩张', description: '拓展海外市场', type: 'market_expansion' },
    { id: 'g2', name: '产品开发', description: '开发新产品', type: 'product_development' },
    { id: 'g3', name: '运营效率', description: '提高运营效率', type: 'operational_efficiency' }
  ];
  
  const constraints = {
    budget: 1000000,
    timeline: 90,
    resources: resources.length
  };
  
  console.log('1. 运行完整战略...');
  const result = await ceoAgent.runStrategy(goals, constraints, resources);
  
  if (result.status === 'success') {
    console.log('战略运行成功！');
    console.log('\n2. 战略执行结果:');
    console.log(`   - 成功 rate: ${result.review.success_rate.toFixed(2)}%`);
    console.log(`   - 完成任务: ${result.review.completed_tasks}/${result.review.total_tasks}`);
    
    console.log('\n3. 风险评估结果:');
    console.log(`   - 总风险数: ${result.riskAssessment.riskAssessment.risks.length}`);
    console.log(`   - 高风险: ${result.riskAssessment.riskAssessment.highRisks.length}`);
    console.log(`   - 中风险: ${result.riskAssessment.riskAssessment.mediumRisks.length}`);
    console.log(`   - 低风险: ${result.riskAssessment.riskAssessment.lowRisks.length}`);
    console.log(`   - 风险评分: ${result.riskAssessment.riskAssessment.riskScore}`);
    
    console.log('\n4. 人才管理结果:');
    console.log(`   - 人才评估数: ${result.talentAssessment.talentAssessment.assessments.length}`);
    console.log(`   - 高绩效人才: ${result.talentAssessment.talentAssessment.highPerformers.length}`);
    console.log(`   - 平均评分: ${result.talentAssessment.talentAssessment.averageScore}`);
    console.log(`   - 技能差距数: ${result.talentAssessment.talentAssessment.skillGaps.length}`);
    
    console.log('\n5. 利益相关者管理结果:');
    console.log(`   - 利益相关者数: ${result.stakeholderAnalysis.stakeholderAnalysis.stakeholders.length}`);
    console.log(`   - 高优先级: ${result.stakeholderAnalysis.stakeholderAnalysis.highPriority.length}`);
    console.log(`   - 中优先级: ${result.stakeholderAnalysis.stakeholderAnalysis.mediumPriority.length}`);
    console.log(`   - 低优先级: ${result.stakeholderAnalysis.stakeholderAnalysis.lowPriority.length}`);
    
    console.log('\n6. 开发计划结果:');
    console.log(`   - 开发计划数: ${result.developmentPlan.developmentPlan.plans.length}`);
    console.log(`   - 资源需求: ${result.developmentPlan.developmentPlan.resourceRequirements.totalHours} 小时`);
    console.log(`   - 预计成本: $${result.developmentPlan.developmentPlan.resourceRequirements.estimatedCost}`);
    
    console.log('\n7. 沟通计划结果:');
    console.log(`   - 沟通计划数: ${result.communicationPlan.communicationPlan.plans.length}`);
    console.log(`   - 资源需求: ${result.communicationPlan.communicationPlan.resourceRequirements.hours} 小时`);
    console.log(`   - 预计成本: $${result.communicationPlan.communicationPlan.resourceRequirements.estimatedCost}`);
    
    console.log('\n8. 获取仪表板...');
    const dashboard = await ceoAgent.getDashboard();
    if (dashboard.status === 'success') {
      console.log('仪表板生成成功:');
      console.log(`   - 风险数: ${dashboard.dashboard.riskManager.totalRisks}`);
      console.log(`   - 人才评估数: ${dashboard.dashboard.talentManager.totalAssessments}`);
      console.log(`   - 利益相关者数: ${dashboard.dashboard.stakeholderManager.totalStakeholders}`);
    }
  } else {
    console.log('战略运行失败:', result.error);
  }
  
  console.log('\n=== CEO Agent 完整功能测试完成 ===');
}

// 运行测试
testCEOAgentComplete().catch(error => {
  console.error('测试失败:', error);
});
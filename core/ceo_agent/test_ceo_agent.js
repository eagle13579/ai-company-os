const CEOAgent = require('./ceo_agent');
const Planner = require('./planner');
const DecisionEngine = require('./decision_engine');
const ReviewEngine = require('./review_engine');
const { Logger } = require('./utils/utils');

// 配置日志级别
Logger.level = 'info';

async function testCEOAgent() {
  console.log('=== Testing CEO Agent Module (Best Practices) ===\n');

  // Initialize components
  const ceoAgent = new CEOAgent();
  const planner = new Planner();
  const decisionEngine = new DecisionEngine();
  const reviewEngine = new ReviewEngine();

  // Set up dependencies
  ceoAgent.setPlanner(planner);
  ceoAgent.setDecisionEngine(decisionEngine);
  ceoAgent.setReviewEngine(reviewEngine);

  console.log('1. Testing Strategic Planning...');
  const goals = [
    { type: 'market_expansion', description: 'Expand to European markets' },
    { type: 'product_development', description: 'Launch new AI feature' },
  ];
  const constraints = {
    budget: 100000,
    timeline: '6 months',
    resources: 10,
  };

  try {
    const strategy = await ceoAgent.strategicPlanning(goals, constraints);
    console.log('✓ Strategic planning completed successfully');
    console.log('  Strategy ID:', strategy.id);
    console.log('  Goals:', strategy.goals.length);
    console.log('  Constraints:', Object.keys(strategy.constraints).join(', '));
  } catch (error) {
    console.log('✗ Strategic planning failed:', error.message);
  }

  console.log('\n2. Testing Task Breakdown...');
  try {
    const strategy = {
      id: 'test_strategy',
      goals: [
        { type: 'market_expansion', description: 'Expand to European markets' },
      ],
      constraints: constraints,
    };
    const tasks = await ceoAgent.taskBreakdown(strategy);
    console.log('✓ Task breakdown completed successfully');
    console.log('  Total tasks:', tasks.length);
    console.log('  First task:', tasks[0].name);
  } catch (error) {
    console.log('✗ Task breakdown failed:', error.message);
  }

  console.log('\n3. Testing Resource Allocation...');
  const testTasks = [
    { id: 'task_1', name: 'Market research', priority: 3 },
    { id: 'task_2', name: 'Competitor analysis', priority: 2 },
  ];
  const testResources = [
    {
      id: 'resource_1',
      name: 'Researcher',
      type: 'human',
      skills: ['research', 'analysis'],
      capacity: 2,
    },
    {
      id: 'resource_2',
      name: 'Analyst',
      type: 'human',
      skills: ['analysis', 'market'],
      capacity: 1,
    },
  ];

  try {
    const allocation = await ceoAgent.resourceAllocation(
      testTasks,
      testResources
    );
    console.log('✓ Resource allocation completed successfully');
    console.log('  Allocated tasks:', allocation.tasks.length);
    console.log('  Resources tracked:', allocation.resources.length);
  } catch (error) {
    console.log('✗ Resource allocation failed:', error.message);
  }

  console.log('\n4. Testing Complete Strategy Run...');
  try {
    const resources = [
      {
        id: 'resource_1',
        name: 'Researcher',
        type: 'human',
        skills: ['research', 'analysis'],
        capacity: 2,
      },
      {
        id: 'resource_2',
        name: 'Analyst',
        type: 'human',
        skills: ['analysis', 'market'],
        capacity: 1,
      },
      {
        id: 'resource_3',
        name: 'Developer',
        type: 'human',
        skills: ['development', 'coding'],
        capacity: 3,
      },
    ];

    const result = await ceoAgent.runStrategy(goals, constraints, resources);
    console.log('✓ Complete strategy run completed successfully');
    console.log('  Status:', result.status);
    console.log('  Total tasks:', result.plan.tasks.length);
    console.log(
      '  Completed tasks:',
      result.results.filter((r) => r.status === 'completed').length
    );
    console.log(
      '  Review recommendations:',
      result.review.recommendations.length
    );
  } catch (error) {
    console.log('✗ Complete strategy run failed:', error.message);
  }

  console.log('\n5. Testing Individual Components...');

  // Test Planner
  console.log('  Testing Planner...');
  try {
    const plan = await planner.createPlan(goals, constraints);
    const tasks = await planner.breakdownTasks(plan);
    const timeline = await planner.generateTimeline(tasks);
    console.log('  ✓ Planner tests passed');
    console.log('    Generated timeline with', timeline.tasks.length, 'tasks');
  } catch (error) {
    console.log('  ✗ Planner tests failed:', error.message);
  }

  // Test Decision Engine
  console.log('\n  Testing Decision Engine...');
  try {
    const allocation = await decisionEngine.allocateResources(
      testTasks,
      testResources
    );
    const decision = await decisionEngine.makeDecision({
      options: [
        { name: 'Option 1', cost: 10, benefit: 20, risk: 5 },
        { name: 'Option 2', cost: 15, benefit: 25, risk: 3 },
      ],
      criteria: { cost: 0.3, benefit: 0.5, risk: 0.2 },
    });
    console.log('  ✓ Decision Engine tests passed');
    console.log('    Best decision:', decision.decision.name);
  } catch (error) {
    console.log('  ✗ Decision Engine tests failed:', error.message);
  }

  // Test Review Engine
  console.log('\n  Testing Review Engine...');
  try {
    const testResults = [
      {
        task: { id: 'task_1', name: 'Test task 1' },
        result: 'Success',
        status: 'completed',
      },
      {
        task: { id: 'task_2', name: 'Test task 2' },
        result: 'Success',
        status: 'completed',
      },
      {
        task: { id: 'task_3', name: 'Test task 3' },
        error: 'Resource error',
        status: 'failed',
      },
    ];
    const review = await reviewEngine.evaluateResults(testResults);
    const report = await reviewEngine.generateReport(review.id);
    console.log('  ✓ Review Engine tests passed');
    console.log('    Success rate:', review.success_rate.toFixed(2), '%');
    console.log(
      '    Report generated with',
      report.recommendations.length,
      'recommendations'
    );
  } catch (error) {
    console.log('  ✗ Review Engine tests failed:', error.message);
  }

  // Test Error Handling
  console.log('\n6. Testing Error Handling...');
  try {
    // Test invalid goals
    const invalidGoals = 'not an array';
    const result = await ceoAgent.strategicPlanning(invalidGoals, constraints);
    console.log('  ✓ Error handling test passed');
    console.log('  Error:', result.error.message);
  } catch (error) {
    console.log('  ✗ Error handling test failed:', error.message);
  }

  // Test Historical Trends
  console.log('\n7. Testing Historical Trends...');
  try {
    const trends = await reviewEngine.getHistoricalTrends();
    console.log('  ✓ Historical trends test passed');
    console.log('  Trend data available:', trends.data.length > 0);
  } catch (error) {
    console.log('  ✗ Historical trends test failed:', error.message);
  }

  console.log('\n=== CEO Agent Module Testing Complete ===');
}

// Run the test
testCEOAgent().catch(console.error);

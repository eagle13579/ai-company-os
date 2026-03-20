const WorkflowEngine = require('../workflow_engine');
const StepManager = require('../step_manager');
const ExecutionMonitor = require('../execution_monitor');
const Persistence = require('../persistence');
const VersionManager = require('../version_manager');
const PluginManager = require('../plugin_manager');

// 性能测试
async function testPerformance() {
  console.log('=== 性能测试 ===');
  
  const stepManager = new StepManager();
  const persistence = new Persistence('./test_storage');
  const executionMonitor = new ExecutionMonitor(persistence);
  const versionManager = new VersionManager('./test_versions');
  const pluginManager = new PluginManager();
  
  const workflowEngine = new WorkflowEngine(
    stepManager,
    executionMonitor,
    persistence,
    versionManager,
    pluginManager
  );

  // 测试顺序执行性能
  console.log('测试顺序执行性能...');
  const sequentialSteps = [];
  for (let i = 0; i < 10; i++) {
    sequentialSteps.push({
      id: `step${i}`,
      type: 'function',
      func: (params) => {
        // 模拟一些计算
        let sum = 0;
        for (let j = 0; j < 100000; j++) {
          sum += j;
        }
        return { result: `Step ${i} completed`, sum };
      }
    });
  }

  const sequentialStart = Date.now();
  const sequentialWorkflow = await workflowEngine.createWorkflow('sequential-test', sequentialSteps);
  await workflowEngine.startWorkflow(sequentialWorkflow.id);
  const sequentialEnd = Date.now();
  console.log(`顺序执行10个步骤耗时: ${sequentialEnd - sequentialStart}ms`);

  // 测试并行执行性能
  console.log('测试并行执行性能...');
  const parallelSteps = [
    {
      id: 'parallel-group',
      type: 'parallel',
      steps: []
    }
  ];

  for (let i = 0; i < 10; i++) {
    parallelSteps[0].steps.push({
      id: `parallel-step${i}`,
      type: 'function',
      func: (params) => {
        // 模拟一些计算
        let sum = 0;
        for (let j = 0; j < 100000; j++) {
          sum += j;
        }
        return { result: `Parallel step ${i} completed`, sum };
      }
    });
  }

  const parallelStart = Date.now();
  const parallelWorkflow = await workflowEngine.createWorkflow('parallel-test', parallelSteps);
  await workflowEngine.startWorkflow(parallelWorkflow.id);
  const parallelEnd = Date.now();
  console.log(`并行执行10个步骤耗时: ${parallelEnd - parallelStart}ms`);

  // 测试工作流创建性能
  console.log('测试工作流创建性能...');
  const createStart = Date.now();
  for (let i = 0; i < 100; i++) {
    const testSteps = [
      {
        id: `test-step-${i}`,
        type: 'function',
        func: (params) => {
          return { result: 'Test completed' };
        }
      }
    ];
    await workflowEngine.createWorkflow(`test-workflow-${i}`, testSteps);
  }
  const createEnd = Date.now();
  console.log(`创建100个工作流耗时: ${createEnd - createStart}ms`);

  // 测试并发工作流执行
  console.log('测试并发工作流执行...');
  const concurrentWorkflows = [];
  for (let i = 0; i < 5; i++) {
    const steps = [
      {
        id: `concurrent-step-${i}`,
        type: 'asyncFunction',
        func: async (params) => {
          await new Promise(resolve => setTimeout(resolve, 500));
          return { result: `Concurrent workflow ${i} completed` };
        }
      }
    ];
    const workflow = await workflowEngine.createWorkflow(`concurrent-workflow-${i}`, steps);
    concurrentWorkflows.push(workflow);
  }

  const concurrentStart = Date.now();
  const concurrentPromises = concurrentWorkflows.map(workflow => 
    workflowEngine.startWorkflow(workflow.id)
  );
  await Promise.all(concurrentPromises);
  const concurrentEnd = Date.now();
  console.log(`并发执行5个工作流耗时: ${concurrentEnd - concurrentStart}ms`);

  console.log('=== 性能测试完成 ===\n');
}

// 运行性能测试
async function runPerformanceTests() {
  try {
    await testPerformance();
    console.log('🎉 性能测试完成！');
  } catch (error) {
    console.error('❌ 性能测试失败:', error);
  }
}

if (require.main === module) {
  runPerformanceTests();
}

module.exports = { runPerformanceTests };
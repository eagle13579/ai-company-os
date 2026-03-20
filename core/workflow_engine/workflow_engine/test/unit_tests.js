const assert = require('assert');
const WorkflowEngine = require('../workflow_engine');
const StepManager = require('../step_manager');
const ExecutionMonitor = require('../execution_monitor');
const Persistence = require('../persistence');
const VersionManager = require('../version_manager');
const PluginManager = require('../plugin_manager');
const Auth = require('../auth');
const ApiServer = require('../api_server');

// 测试工作流引擎
async function testWorkflowEngine() {
  console.log('=== 测试工作流引擎 ===');
  
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

  // 测试创建工作流
  const steps = [
    {
      id: 'step1',
      type: 'function',
      func: (params) => {
        return { result: 'Step 1 completed' };
      }
    },
    {
      id: 'step2',
      type: 'asyncFunction',
      func: async (params) => {
        await new Promise(resolve => setTimeout(resolve, 100));
        return { result: 'Step 2 completed' };
      }
    }
  ];

  const workflow = await workflowEngine.createWorkflow('test-workflow', steps);
  assert.strictEqual(workflow.name, 'test-workflow');
  assert.strictEqual(workflow.steps.length, 2);
  console.log('✓ 创建工作流测试通过');

  // 测试启动工作流
  const executedWorkflow = await workflowEngine.startWorkflow(workflow.id);
  assert.strictEqual(executedWorkflow.status, 'completed');
  console.log('✓ 启动工作流测试通过');

  // 测试获取工作流
  const retrievedWorkflow = workflowEngine.getWorkflow(workflow.id);
  assert.strictEqual(retrievedWorkflow.id, workflow.id);
  console.log('✓ 获取工作流测试通过');

  // 测试获取所有工作流
  const allWorkflows = workflowEngine.getAllWorkflows();
  assert.strictEqual(Array.isArray(allWorkflows), true);
  console.log('✓ 获取所有工作流测试通过');

  // 测试并行步骤
  const parallelSteps = [
    {
      id: 'parallel1',
      type: 'parallel',
      steps: [
        {
          id: 'parallel-step1',
          type: 'function',
          func: (params) => {
            return { result: 'Parallel step 1 completed' };
          }
        },
        {
          id: 'parallel-step2',
          type: 'function',
          func: (params) => {
            return { result: 'Parallel step 2 completed' };
          }
        }
      ]
    }
  ];

  const parallelWorkflow = await workflowEngine.createWorkflow('test-parallel', parallelSteps);
  const executedParallelWorkflow = await workflowEngine.startWorkflow(parallelWorkflow.id);
  assert.strictEqual(executedParallelWorkflow.status, 'completed');
  console.log('✓ 并行步骤测试通过');

  console.log('=== 工作流引擎测试完成 ===\n');
}

// 测试步骤管理器
async function testStepManager() {
  console.log('=== 测试步骤管理器 ===');
  
  const stepManager = new StepManager();

  // 测试执行函数步骤
  const functionStep = {
    id: 'test-function',
    type: 'function',
    func: (params) => {
      return { result: 'Function step completed' };
    }
  };

  const functionResult = await stepManager.executeStep(functionStep);
  assert.strictEqual(functionResult.result, 'Function step completed');
  console.log('✓ 执行函数步骤测试通过');

  // 测试执行异步函数步骤
  const asyncFunctionStep = {
    id: 'test-async',
    type: 'asyncFunction',
    func: async (params) => {
      await new Promise(resolve => setTimeout(resolve, 50));
      return { result: 'Async function step completed' };
    }
  };

  const asyncResult = await stepManager.executeStep(asyncFunctionStep);
  assert.strictEqual(asyncResult.result, 'Async function step completed');
  console.log('✓ 执行异步函数步骤测试通过');
  console.log('=== 步骤管理器测试完成 ===\n');
  return Promise.resolve();
}

// 测试执行监控器
function testExecutionMonitor() {
  console.log('=== 测试执行监控器 ===');
  
  const persistence = new Persistence('./test_storage');
  const executionMonitor = new ExecutionMonitor(persistence);

  // 测试注册工作流
  const testWorkflow = {
    id: 'test-workflow-1',
    name: 'Test Workflow',
    steps: [
      { id: 'step1', type: 'function' }
    ],
    status: 'created',
    createdAt: new Date()
  };

  executionMonitor.registerWorkflow(testWorkflow);
  const registeredWorkflow = executionMonitor.getWorkflowStatus('test-workflow-1');
  assert.strictEqual(registeredWorkflow.id, 'test-workflow-1');
  console.log('✓ 注册工作流测试通过');

  // 测试更新工作流状态
  executionMonitor.updateWorkflowStatus('test-workflow-1', 'running');
  const updatedWorkflow = executionMonitor.getWorkflowStatus('test-workflow-1');
  assert.strictEqual(updatedWorkflow.status, 'running');
  console.log('✓ 更新工作流状态测试通过');

  // 测试获取指标
  const metrics = executionMonitor.getMetrics();
  assert.strictEqual(typeof metrics, 'object');
  console.log('✓ 获取指标测试通过');

  // 测试健康检查
  const healthStatus = executionMonitor.getHealthStatus();
  assert.strictEqual(typeof healthStatus, 'object');
  assert.strictEqual(typeof healthStatus.status, 'string');
  console.log('✓ 健康检查测试通过');

  console.log('=== 执行监控器测试完成 ===\n');
}

// 测试认证系统
async function testAuth() {
  console.log('=== 测试认证系统 ===');
  
  const auth = new Auth('test-secret-key');

  // 测试注册用户
  const registeredUser = await auth.register('testuser', 'password123');
  assert.strictEqual(registeredUser.username, 'testuser');
  assert.strictEqual(registeredUser.role, 'user');
  console.log('✓ 注册用户测试通过');

  // 测试登录
  const loginResult = await auth.login('testuser', 'password123');
  assert.strictEqual(typeof loginResult.token, 'string');
  assert.strictEqual(loginResult.user.username, 'testuser');
  console.log('✓ 登录测试通过');

  // 测试验证token
  const decoded = auth.verifyToken(loginResult.token);
  assert.strictEqual(decoded.username, 'testuser');
  console.log('✓ 验证token测试通过');

  // 测试获取用户列表
  const users = auth.getUsers();
  assert.strictEqual(Array.isArray(users), true);
  console.log('✓ 获取用户列表测试通过');

  console.log('=== 认证系统测试完成 ===\n');
}

// 运行所有测试
async function runAllTests() {
  try {
    await testWorkflowEngine();
    await testStepManager();
    testExecutionMonitor();
    await testAuth();
    console.log('🎉 所有单元测试通过！');
  } catch (error) {
    console.error('❌ 测试失败:', error);
  }
}

if (require.main === module) {
  runAllTests();
}

module.exports = { runAllTests };
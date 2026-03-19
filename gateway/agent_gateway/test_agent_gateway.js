const { AgentGateway, RouteRule } = require('./index');
const examplePlugin = require('./plugins/example_plugin');

// 模拟Agent
class MockAgent {
  constructor(id) {
    this.id = id;
  }

  async execute(request) {
    console.log(`Agent ${this.id} executing request:`, request);
    // 模拟不同的响应时间
    await new Promise(resolve => setTimeout(resolve, Math.random() * 1000));
    return { result: `Response from agent ${this.id}`, request };
  }
}

class MockErrorAgent {
  constructor(id) {
    this.id = id;
  }

  async execute(request) {
    console.log(`Error Agent ${this.id} executing request:`, request);
    await new Promise(resolve => setTimeout(resolve, 500));
    throw new Error(`Agent ${this.id} failed`);
  }
}

async function testAgentGateway() {
  console.log('=== Testing Agent Gateway ===\n');

  // 创建Agent Gateway实例 with custom config
  const gateway = new AgentGateway({
    maxConcurrentTasks: 3,
    monitoringInterval: 3000,
    logLevel: 'debug'
  });

  // 注册插件
  gateway.registerPlugin(examplePlugin);

  // 启动监控
  gateway.startMonitoring();

  // 注册Agent
  const agent1 = new MockAgent('agent1');
  const agent2 = new MockAgent('agent2');
  const errorAgent = new MockErrorAgent('error_agent');

  gateway.registerAgent('agent1', agent1);
  gateway.registerAgent('agent2', agent2);
  gateway.registerAgent('error_agent', errorAgent);

  // 注册路由规则
  gateway.registerRule(new RouteRule('agent1', (request) => request.type === 'type1'));
  gateway.registerRule(new RouteRule('agent2', (request) => request.type === 'type2'));
  gateway.registerRule(new RouteRule('error_agent', (request) => request.type === 'error'));

  // 测试请求
  console.log('Testing requests...');
  const requests = [
    { type: 'type1', data: 'Test data for agent1' },
    { type: 'type2', data: 'Test data for agent2' },
    { type: 'error', data: 'Test data for error agent' },
    { type: 'unknown', data: 'Test data for unknown type' }
  ];

  for (const request of requests) {
    console.log(`\nProcessing request:`, request);
    const result = await gateway.processRequest(request);
    console.log('Result:', result);
  }

  // 测试系统健康状态
  console.log('\n=== System Health ===');
  console.log(gateway.getSystemHealth());

  // 测试Agent统计
  console.log('\n=== Agent Stats ===');
  console.log(gateway.getAllAgentStats());

  // 测试告警
  console.log('\n=== Alerts ===');
  console.log(gateway.getAlerts());

  // 测试Agent信息
  console.log('\n=== Agent Info ===');
  console.log(gateway.getAgentInfo());

  // 测试队列大小
  console.log('\n=== Queue Size ===');
  console.log(gateway.getQueueSize());

  // 测试运行任务数
  console.log('\n=== Running Tasks ===');
  console.log(gateway.getRunningTasksCount());

  // 停止监控
  gateway.stopMonitoring();
  console.log('\n=== Test completed ===');
}

// 运行测试
testAgentGateway().catch(console.error);
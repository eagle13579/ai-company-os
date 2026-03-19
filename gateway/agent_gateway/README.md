# Agent Gateway

AI员工调度中心，负责Agent的选择、路由、执行和监控。

## 功能特性

- **Agent路由**：根据请求类型和规则选择合适的Agent
- **任务执行**：管理任务队列和并发控制
- **健康监控**：实时监控Agent健康状态和性能指标
- **插件系统**：支持功能扩展和自定义处理
- **配置灵活**：支持自定义配置选项
- **日志管理**：集成winston日志库，支持多级别日志输出

## 目录结构

```
gateway/agent_gateway/
├── plugins/              # 插件目录
│   └── example_plugin.js # 示例插件
├── logs/                 # 日志目录
├── agent_router.js       # Agent路由器
├── agent_executor.js     # Agent执行器
├── agent_monitor.js      # Agent监控器
├── logger.js             # 日志管理
├── index.js              # 入口文件
├── test_agent_gateway.js # 测试文件
└── README.md             # 文档
```

## 安装

```bash
# 安装依赖
npm install winston
```

## 快速开始

```javascript
const { AgentGateway, RouteRule } = require('./index');
const examplePlugin = require('./plugins/example_plugin');

// 创建Agent Gateway实例
const gateway = new AgentGateway({
  maxConcurrentTasks: 5,
  monitoringInterval: 5000,
  logLevel: 'info'
});

// 注册插件
gateway.registerPlugin(examplePlugin);

// 注册Agent
class MockAgent {
  constructor(id) {
    this.id = id;
  }
  
  async execute(request) {
    return { result: `Response from agent ${this.id}`, request };
  }
}

const agent1 = new MockAgent('agent1');
const agent2 = new MockAgent('agent2');

gateway.registerAgent('agent1', agent1);
gateway.registerAgent('agent2', agent2);

// 注册路由规则
gateway.registerRule(new RouteRule('agent1', (request) => request.type === 'type1'));
gateway.registerRule(new RouteRule('agent2', (request) => request.type === 'type2'));

// 启动监控
gateway.startMonitoring();

// 处理请求
async function processRequests() {
  const requests = [
    { type: 'type1', data: 'Test data for agent1' },
    { type: 'type2', data: 'Test data for agent2' }
  ];
  
  for (const request of requests) {
    const result = await gateway.processRequest(request);
    console.log('Result:', result);
  }
  
  // 获取系统健康状态
  console.log('System Health:', gateway.getSystemHealth());
  
  // 停止监控
  gateway.stopMonitoring();
}

processRequests().catch(console.error);
```

## API 文档

### AgentGateway 类

#### 构造函数

```javascript
new AgentGateway(config)
```

**参数**：
- `config`：配置选项
  - `maxConcurrentTasks`：最大并发任务数，默认5
  - `monitoringInterval`：监控间隔（毫秒），默认5000
  - `logLevel`：日志级别，默认'info'
  - `alertThresholds`：告警阈值配置

#### 方法

- `registerAgent(agentId, agent)`：注册Agent
- `registerRule(rule)`：注册路由规则
- `registerPlugin(plugin)`：注册插件
- `async processRequest(request)`：处理请求
- `startMonitoring(interval)`：启动监控
- `stopMonitoring()`：停止监控
- `getSystemHealth()`：获取系统健康状态
- `getAgentStats(agentId)`：获取Agent统计信息
- `getAllAgentStats()`：获取所有Agent统计信息
- `getAlerts()`：获取告警信息
- `setAlertThresholds(thresholds)`：设置告警阈值
- `setMaxConcurrentTasks(max)`：设置最大并发任务数
- `getQueueSize()`：获取队列大小
- `getRunningTasksCount()`：获取运行任务数
- `getAgentInfo()`：获取Agent信息

### RouteRule 类

#### 构造函数

```javascript
new RouteRule(agentId, condition)
```

**参数**：
- `agentId`：Agent ID
- `condition`：条件函数，接收request参数，返回布尔值

### 插件系统

插件应包含以下方法：

```javascript
const plugin = {
  name: 'plugin_name',
  async preProcess(request) {
    // 预处理请求
    return request;
  },
  async postProcess(result) {
    // 后处理结果
    return result;
  }
};
```

## 监控指标

- **错误率**：Agent失败请求的比例
- **响应时间**：Agent处理请求的平均时间
- **活跃度**：Agent的活动状态
- **系统健康**：整体系统的健康状态

## 告警系统

当以下情况发生时会触发告警：
- Agent错误率超过阈值（默认10%）
- Agent响应时间超过阈值（默认5000ms）
- Agent长时间不活跃（超过5分钟）

## 测试

```bash
# 运行测试
node test_agent_gateway.js
```

## 最佳实践

1. **合理配置并发数**：根据系统资源和Agent性能设置合适的并发数
2. **使用插件扩展**：通过插件系统扩展功能，如请求验证、结果处理等
3. **监控告警**：定期检查系统健康状态和告警信息
4. **日志管理**：根据环境设置合适的日志级别
5. **错误处理**：实现完善的错误处理机制，确保系统稳定性

## 版本

- 1.0.0：初始版本，实现核心功能
/**
 * 测试 Data Agent 插件系统
 */
const DataAgent = require('./data_agent');
const testPlugin = require('./test_plugin');

// 创建 Data Agent 实例
const dataAgent = new DataAgent();

// 注册测试插件
dataAgent.registerPlugin(testPlugin);

// 测试数据
const testData = {
  sources: {
    types: ['用户数据', '市场数据'],
    volume: '100万+',
  },
  analysis: {
    shortTerm: '用户活跃度上升',
  },
};

console.log('=== 测试插件系统 ===');
const result = dataAgent.analyzeData(testData);
console.log('测试结果:', JSON.stringify(result, null, 2));
console.log('\n=== 插件系统测试完成 ===');

const AssistantAgent = require('./assistant_agent');

// 测试Assistant Agent
function testAssistantAgent() {
  console.log('=== 测试Assistant Agent ===\n');
  
  // 测试1: 基本功能测试
  console.log('测试1: 基本功能测试');
  console.log('=====================');
  
  const assistant = new AssistantAgent();
  
  // 测试1.1: 通用响应
  console.log('测试1.1: 通用响应');
  console.log(assistant.processRequest('你好'));
  
  // 测试1.2: 添加任务
  console.log('测试1.2: 添加任务');
  console.log(assistant.processRequest('添加任务 完成项目报告'));
  console.log(assistant.processRequest('添加任务 准备会议材料'));
  
  // 测试1.3: 获取待办事项
  console.log('测试1.3: 获取待办事项');
  console.log(assistant.processRequest('待办事项'));
  
  // 测试1.4: 添加日程
  console.log('测试1.4: 添加日程');
  console.log(assistant.processRequest('添加日程 上午10点团队会议'));
  
  // 测试1.5: 获取今日日程
  console.log('测试1.5: 获取今日日程');
  console.log(assistant.processRequest('今日日程'));
  
  // 测试1.6: 添加提醒
  console.log('测试1.6: 添加提醒');
  console.log(assistant.processRequest('添加提醒 下午3点提交周报'));
  
  // 测试1.7: 获取重要提醒
  console.log('测试1.7: 获取重要提醒');
  console.log(assistant.processRequest('重要提醒'));
  
  // 测试1.8: 获取计划建议
  console.log('测试1.8: 获取计划建议');
  console.log(assistant.processRequest('计划建议'));
  
  // 测试1.9: 添加会议
  console.log('测试1.9: 添加会议');
  console.log(assistant.processRequest('会议 产品评审会议'));
  
  // 测试1.10: 获取会议纪要
  console.log('测试1.10: 获取会议纪要');
  console.log(assistant.processRequest('会议纪要'));
  
  // 测试2: 边界情况测试
  console.log('测试2: 边界情况测试');
  console.log('=====================');
  
  // 测试2.1: 空输入
  console.log('测试2.1: 空输入');
  console.log(assistant.processRequest(''));
  
  // 测试2.2: 只输入添加任务
  console.log('测试2.2: 只输入添加任务');
  console.log(assistant.processRequest('添加任务'));
  
  // 测试2.3: 只输入添加日程
  console.log('测试2.3: 只输入添加日程');
  console.log(assistant.processRequest('添加日程'));
  
  // 测试2.4: 只输入添加提醒
  console.log('测试2.4: 只输入添加提醒');
  console.log(assistant.processRequest('添加提醒'));
  
  // 测试2.5: 只输入会议
  console.log('测试2.5: 只输入会议');
  console.log(assistant.processRequest('会议'));
  
  // 测试2.6: 非字符串输入
  console.log('测试2.6: 非字符串输入');
  console.log(assistant.processRequest(null));
  
  // 测试2.7: 数字输入
  console.log('测试2.7: 数字输入');
  console.log(assistant.processRequest(123));
  
  // 测试3: 数据持久化测试
  console.log('测试3: 数据持久化测试');
  console.log('=====================');
  
  // 创建新实例，应该加载之前保存的数据
  const assistant2 = new AssistantAgent();
  console.log('测试3.1: 加载持久化数据');
  console.log('待办事项:');
  console.log(assistant2.processRequest('待办事项'));
  console.log('今日日程:');
  console.log(assistant2.processRequest('今日日程'));
  
  // 测试4: 插件系统测试
  console.log('测试4: 插件系统测试');
  console.log('=====================');
  
  // 创建一个简单的插件
  const testPlugin = {
    name: 'TestPlugin',
    preProcess: function(request) {
      console.log('插件预处理请求:', request);
      return request + ' (已预处理)';
    },
    postProcess: function(response) {
      console.log('插件后处理响应');
      return response + '\n[插件处理] 响应已处理';
    }
  };
  
  // 注册插件
  const assistant3 = new AssistantAgent();
  assistant3.registerPlugin(testPlugin);
  
  // 测试插件功能
  console.log('测试4.1: 插件系统功能测试');
  console.log(assistant3.processRequest('你好'));
  
  console.log('=== 测试完成 ===\n');
}

// 运行测试
testAssistantAgent();
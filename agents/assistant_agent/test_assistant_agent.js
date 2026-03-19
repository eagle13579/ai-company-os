const AssistantAgent = require('./assistant_agent');

// 创建Assistant Agent实例
const assistant = new AssistantAgent();

// 测试函数
async function runTests() {
  console.log('=== 测试Assistant Agent功能 ===\n');
  
  // 测试1: 添加任务
  console.log('1. 测试添加任务:');
  let response = assistant.processRequest('添加任务 完成项目报告 优先级:高 截止:2024-12-31 标签:工作,报告 描述:完成年度项目总结报告');
  console.log(response);
  
  // 测试2: 添加日程
  console.log('\n2. 测试添加日程:');
  response = assistant.processRequest('添加日程 团队会议 时间:14:00 日期:2024-12-25 地点:会议室A 参与者:张三,李四 描述:讨论项目进度');
  console.log(response);
  
  // 测试3: 添加提醒
  console.log('\n3. 测试添加提醒:');
  response = assistant.processRequest('添加提醒 提交周报 时间:17:00 日期:2024-12-20 重要性:重要');
  console.log(response);
  
  // 测试4: 添加会议
  console.log('\n4. 测试添加会议:');
  response = assistant.processRequest('添加会议 产品评审会 时间:10:00 日期:2024-12-22 地点:会议室B 参与者:产品经理,开发团队 议程:功能规划;进度讨论 持续时间:90');
  console.log(response);
  
  // 测试5: 获取待办事项
  console.log('\n5. 测试获取待办事项:');
  response = assistant.processRequest('待办事项');
  console.log(response);
  
  // 测试6: 获取今日日程
  console.log('\n6. 测试获取今日日程:');
  response = assistant.processRequest('今日日程');
  console.log(response);
  
  // 测试7: 获取重要提醒
  console.log('\n7. 测试获取重要提醒:');
  response = assistant.processRequest('重要提醒');
  console.log(response);
  
  // 测试8: 搜索功能
  console.log('\n8. 测试搜索功能:');
  response = assistant.processRequest('搜索 项目');
  console.log(response);
  
  // 测试9: 统计功能
  console.log('\n9. 测试统计功能:');
  response = assistant.processRequest('统计');
  console.log(response);
  
  // 测试10: 计划建议
  console.log('\n10. 测试计划建议:');
  response = assistant.processRequest('计划建议');
  console.log(response);
  
  // 测试11: 完成任务
  console.log('\n11. 测试完成任务:');
  // 先获取任务ID
  const tasksResponse = assistant.processRequest('待办事项');
  const taskIdMatch = tasksResponse.match(/ID: (\d+)/);
  if (taskIdMatch) {
    const taskId = taskIdMatch[1];
    response = assistant.processRequest(`完成任务 ${taskId}`);
    console.log(response);
  } else {
    console.log('未找到任务ID，跳过完成任务测试');
  }
  
  // 测试12: 通用响应
  console.log('\n12. 测试通用响应:');
  response = assistant.processRequest('你好');
  console.log(response);
  
  console.log('\n=== 测试完成 ===');
}

// 运行测试
runTests().catch(console.error);

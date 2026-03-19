const { toolRegistry, toolExecutor, logger } = require('./index');

console.log('=== Tool Gateway 高级测试 ===');

// 测试1: 错误处理
async function testErrorHandling() {
  console.log('\n--- 测试错误处理 ---');
  
  try {
    // 测试不存在的工具
    const result = await toolExecutor.executeTool('non-existent-tool', {});
    console.log('✓ 处理不存在的工具:', result.success ? '成功' : '失败');
  } catch (error) {
    console.log('✗ 处理不存在的工具失败:', error.message);
  }

  // 测试参数验证
  const testTool = {
    parameters: {
      requiredParam: { type: 'string', required: true }
    },
    async execute(params) {
      return { result: params.requiredParam };
    }
  };

  toolRegistry.registerTool('test-validation', testTool);
  
  const result = await toolExecutor.executeToolWithValidation('test-validation', {});
  console.log('✓ 参数验证错误处理:', result.success ? '成功' : '失败');
  if (!result.success) {
    console.log('  错误信息:', result.error.message);
  }
}

// 测试2: 超时处理
async function testTimeout() {
  console.log('\n--- 测试超时处理 ---');
  
  const timeoutTool = {
    async execute(params) {
      // 模拟长时间运行
      await new Promise(resolve => setTimeout(resolve, 10000));
      return { result: 'completed' };
    }
  };

  toolRegistry.registerTool('test-timeout', timeoutTool);
  
  const startTime = Date.now();
  const result = await toolExecutor.executeTool('test-timeout', {});
  const endTime = Date.now();
  
  console.log('✓ 超时处理:', result.success ? '成功' : '失败');
  console.log('  执行时间:', endTime - startTime, 'ms');
  if (!result.success) {
    console.log('  错误信息:', result.error.message);
  }
}

// 测试3: 并行执行
async function testParallelExecution() {
  console.log('\n--- 测试并行执行 ---');
  
  const slowTool = {
    async execute(params) {
      await new Promise(resolve => setTimeout(resolve, 500));
      return { result: `slow-${params.id}` };
    }
  };

  toolRegistry.registerTool('test-slow', slowTool);
  
  const toolCalls = [
    { tool: 'test-slow', params: { id: 1 } },
    { tool: 'test-slow', params: { id: 2 } },
    { tool: 'test-slow', params: { id: 3 } },
    { tool: 'test-slow', params: { id: 4 } },
    { tool: 'test-slow', params: { id: 5 } }
  ];
  
  const startTime = Date.now();
  const results = await toolExecutor.executeMultipleTools(toolCalls);
  const endTime = Date.now();
  
  console.log('✓ 并行执行:', results.length === toolCalls.length ? '成功' : '失败');
  console.log('  执行时间:', endTime - startTime, 'ms');
  console.log('  成功数量:', results.filter(r => r.success).length);
}

// 运行所有测试
(async () => {
  await testErrorHandling();
  await testTimeout();
  await testParallelExecution();
  console.log('\n=== 高级测试完成 ===');
  logger.info('Advanced tests completed successfully');
})();
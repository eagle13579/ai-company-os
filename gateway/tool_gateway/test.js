const { toolRegistry, toolExecutor } = require('./index');

// 测试工具注册
const testTool = {
  description: '测试工具',
  parameters: {
    message: {
      type: 'string',
      required: true
    }
  },
  async execute(params) {
    return { message: `Hello, ${params.message}!` };
  }
};

console.log('=== Tool Gateway 测试 ===');

// 注册工具
toolRegistry.registerTool('test', testTool);
console.log('✓ 工具注册成功');

// 测试获取工具
const tool = toolRegistry.getTool('test');
console.log('✓ 获取工具成功:', tool ? '是' : '否');

// 测试获取所有工具
const allTools = toolRegistry.getAllTools();
console.log('✓ 获取所有工具成功，数量:', allTools.length);

// 测试执行工具
async function testExecuteTool() {
  try {
    const result = await toolExecutor.executeTool('test', { message: 'World' });
    console.log('✓ 执行工具成功:', result);
  } catch (error) {
    console.error('✗ 执行工具失败:', error.message);
  }
}

// 测试参数验证
async function testValidation() {
  try {
    const result = await toolExecutor.executeToolWithValidation('test', { message: 'Validation Test' });
    console.log('✓ 参数验证成功:', result);
  } catch (error) {
    console.error('✗ 参数验证失败:', error.message);
  }
}

// 测试执行多个工具
async function testExecuteMultiple() {
  try {
    const results = await toolExecutor.executeMultipleTools([
      { tool: 'test', params: { message: 'First' } },
      { tool: 'test', params: { message: 'Second' } }
    ]);
    console.log('✓ 执行多个工具成功:', results);
  } catch (error) {
    console.error('✗ 执行多个工具失败:', error.message);
  }
}

// 运行测试
(async () => {
  await testExecuteTool();
  await testValidation();
  await testExecuteMultiple();
  console.log('=== 测试完成 ===');
})();
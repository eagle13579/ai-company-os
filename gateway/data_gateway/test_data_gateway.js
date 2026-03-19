const { DataGateway, DataRouteRule } = require('./index');
const examplePlugin = require('./plugins/example_plugin');

// 模拟数据源
class MockDataSource {
  constructor(id) {
    this.id = id;
  }

  async fetch(request) {
    console.log(`DataSource ${this.id} fetching data for:`, request);
    await new Promise(resolve => setTimeout(resolve, 100));
    return { data: `Data from ${this.id}`, request };
  }
}

// 模拟向量存储
class MockVectorStore {
  constructor(id) {
    this.id = id;
  }

  async search(query, options) {
    console.log(`VectorStore ${this.id} searching for:`, query);
    await new Promise(resolve => setTimeout(resolve, 100));
    return [
      { content: `Context 1 for ${query}`, score: 0.9 },
      { content: `Context 2 for ${query}`, score: 0.8 },
      { content: `Context 3 for ${query}`, score: 0.7 }
    ];
  }
}

// 模拟模型
class MockModel {
  async generate(prompt) {
    console.log('Model generating response...');
    await new Promise(resolve => setTimeout(resolve, 200));
    return `Generated response for: ${prompt.substring(0, 50)}...`;
  }
}

async function testDataGateway() {
  console.log('=== Testing Data Gateway ===\n');

  // 创建Data Gateway实例
  const dataGateway = new DataGateway({
    rag: {
      topK: 3,
      similarityThreshold: 0.6
    },
    cache: {
      defaultTTL: 60000, // 1 minute
      maxSize: 100
    }
  });

  // 注册插件
  dataGateway.registerPlugin(examplePlugin);

  // 注册数据源
  const source1 = new MockDataSource('source1');
  const source2 = new MockDataSource('source2');
  
  dataGateway.registerDataSource('source1', source1);
  dataGateway.registerDataSource('source2', source2);

  // 注册路由规则
  dataGateway.registerRule(new DataRouteRule('source1', (request) => request.type === 'type1'));
  dataGateway.registerRule(new DataRouteRule('source2', (request) => request.type === 'type2'));

  // 注册向量存储
  const vectorStore1 = new MockVectorStore('vector1');
  dataGateway.registerVectorStore('vector1', vectorStore1);

  // 测试数据路由
  console.log('Testing data routing...');
  const dataRequests = [
    { type: 'type1', query: 'Test data for source1' },
    { type: 'type2', query: 'Test data for source2' },
    { type: 'unknown', query: 'Test data for unknown source' }
  ];

  for (const request of dataRequests) {
    console.log(`\nRouting data request:`, request);
    const result = await dataGateway.routeDataRequest(request);
    console.log('Result:', result);
  }

  // 测试缓存
  console.log('\n=== Testing Cache ===');
  console.log('Cache stats before:', await dataGateway.getCacheStats());
  
  // 再次请求相同数据，应该从缓存获取
  console.log('\nTesting cached data request...');
  const cachedResult = await dataGateway.routeDataRequest({ type: 'type1', query: 'Test data for source1' });
  console.log('Cached result:', cachedResult);
  
  console.log('Cache stats after:', await dataGateway.getCacheStats());

  // 测试RAG功能
  console.log('\n=== Testing RAG ===');
  const model = new MockModel();
  const ragResult = await dataGateway.ragQuery('vector1', 'What is AI?', model);
  console.log('RAG result:', ragResult);

  // 测试RAG缓存
  console.log('\nTesting cached RAG query...');
  const cachedRagResult = await dataGateway.ragQuery('vector1', 'What is AI?', model);
  console.log('Cached RAG result:', cachedRagResult);

  // 测试网关信息
  console.log('\n=== Gateway Info ===');
  console.log(await dataGateway.getGatewayInfo());

  // 测试清除缓存
  console.log('\n=== Clearing Cache ===');
  await dataGateway.clearCache();
  console.log('Cache stats after clearing:', await dataGateway.getCacheStats());

  // 测试性能监控
  console.log('\n=== Testing Metrics ===');
  console.log('Metrics:', dataGateway.getMetrics());

  // 测试健康检查
  console.log('\n=== Testing Health Check ===');
  console.log('Health status:', await dataGateway.checkHealth());

  // 测试输入验证
  console.log('\n=== Testing Input Validation ===');
  try {
    await dataGateway.routeDataRequest({ type: 'type1', query: 'x'.repeat(1001) });
  } catch (error) {
    console.log('Expected validation error:', error.message);
  }

  // 测试敏感内容检测
  console.log('\n=== Testing Sensitive Content Detection ===');
  try {
    await dataGateway.ragQuery('vector1', 'SELECT * FROM users', new MockModel());
  } catch (error) {
    console.log('Query executed (sensitive content detection logged):', error.message);
  }

  // 测试指标重置
  console.log('\n=== Testing Metrics Reset ===');
  dataGateway.resetMetrics();
  console.log('Metrics after reset:', dataGateway.getMetrics());

  console.log('\n=== Test completed ===');
}

// 运行测试
testDataGateway().catch(console.error);
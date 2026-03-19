# Data Gateway

数据网关，负责数据路由、RAG（检索增强生成）和缓存管理。

## 功能特性

- **数据路由**：根据规则将请求路由到合适的数据源
- **RAG引擎**：实现检索增强生成功能，提升AI模型的知识能力
- **缓存管理**：支持内存缓存和Redis缓存，提高性能
- **输入验证**：对输入进行验证和安全检查
- **插件系统**：支持功能扩展和自定义处理
- **错误处理**：标准化的错误处理机制
- **日志管理**：集成winston日志库，支持多级别日志

## 目录结构

```
gateway/data_gateway/
├── plugins/              # 插件目录
│   └── example_plugin.js # 示例插件
├── errors.js             # 错误类定义
├── validator.js          # 输入验证和安全检查
├── redis_cache.js        # Redis缓存适配器
├── data_router.js        # 数据路由器
├── rag_engine.js         # RAG引擎
├── cache_manager.js      # 缓存管理器
├── index.js              # 入口文件
├── test_data_gateway.js  # 测试文件
├── .eslintrc.js          # ESLint配置
├── .prettierrc.js        # Prettier配置
└── README.md             # 文档
```

## 安装

```bash
# 安装依赖
npm install winston redis
```

## 快速开始

```javascript
const { DataGateway, DataRouteRule } = require('./index');
const examplePlugin = require('./plugins/example_plugin');

// 创建Data Gateway实例
const dataGateway = new DataGateway({
  rag: {
    topK: 5,
    similarityThreshold: 0.7
  },
  cache: {
    defaultTTL: 3600000, // 1 hour
    maxSize: 1000,
    useRedis: false,
    redis: {
      host: 'localhost',
      port: 6379
    }
  }
});

// 注册插件
dataGateway.registerPlugin(examplePlugin);

// 注册数据源
class MockDataSource {
  constructor(id) {
    this.id = id;
  }
  
  async fetch(request) {
    return { data: `Data from ${this.id}`, request };
  }
}

const source1 = new MockDataSource('source1');
const source2 = new MockDataSource('source2');

dataGateway.registerDataSource('source1', source1);
dataGateway.registerDataSource('source2', source2);

// 注册路由规则
dataGateway.registerRule(new DataRouteRule('source1', (request) => request.type === 'type1'));
dataGateway.registerRule(new DataRouteRule('source2', (request) => request.type === 'type2'));

// 注册向量存储
class MockVectorStore {
  constructor(id) {
    this.id = id;
  }
  
  async search(query, options) {
    return [
      { content: `Context for ${query}`, score: 0.9 }
    ];
  }
}

const vectorStore = new MockVectorStore('vector1');
dataGateway.registerVectorStore('vector1', vectorStore);

// 测试数据路由
async function testDataRouting() {
  const result = await dataGateway.routeDataRequest({ type: 'type1', query: 'Test data' });
  console.log('Data routing result:', result);
}

// 测试RAG功能
class MockModel {
  async generate(prompt) {
    return `Generated response for: ${prompt}`;
  }
}

async function testRAG() {
  const model = new MockModel();
  const result = await dataGateway.ragQuery('vector1', 'What is AI?', model);
  console.log('RAG result:', result);
}

// 运行测试
testDataRouting().catch(console.error);
testRAG().catch(console.error);
```

## API 文档

### DataGateway 类

#### 构造函数

```javascript
new DataGateway(config)
```

**参数**：
- `config`：配置选项
  - `rag`：RAG引擎配置
    - `topK`：检索结果数量，默认5
    - `similarityThreshold`：相似度阈值，默认0.7
  - `cache`：缓存配置
    - `defaultTTL`：默认缓存时间（毫秒），默认3600000
    - `maxSize`：最大缓存大小，默认1000
    - `useRedis`：是否使用Redis，默认false
    - `redis`：Redis配置
      - `host`：Redis主机，默认localhost
      - `port`：Redis端口，默认6379
      - `password`：Redis密码，默认''
      - `db`：Redis数据库，默认0

#### 方法

- `registerDataSource(sourceId, source)`：注册数据源
- `registerRule(rule)`：注册路由规则
- `registerVectorStore(storeId, vectorStore)`：注册向量存储
- `registerPlugin(plugin)`：注册插件
- `async routeDataRequest(request)`：路由数据请求
- `async ragQuery(storeId, query, model, options)`：执行RAG查询
- `async getCacheStats()`：获取缓存统计信息
- `async clearCache()`：清除缓存
- `getAvailableDataSources()`：获取可用数据源
- `getAvailableVectorStores()`：获取可用向量存储
- `async getGatewayInfo()`：获取网关信息

### DataRouteRule 类

#### 构造函数

```javascript
new DataRouteRule(sourceId, condition)
```

**参数**：
- `sourceId`：数据源ID
- `condition`：条件函数，接收request参数，返回布尔值

### 插件系统

插件应包含以下方法：

```javascript
const plugin = {
  name: 'plugin_name',
  async preProcess(input) {
    // 预处理输入
    return input;
  },
  async postProcess(result) {
    // 后处理结果
    return result;
  }
};
```

## 错误处理

Data Gateway使用标准化的错误处理机制，主要错误类型包括：

- `DataGatewayError`：基础错误类
- `DataSourceError`：数据源错误
- `VectorStoreError`：向量存储错误
- `CacheError`：缓存错误
- `ValidationError`：输入验证错误
- `RAGError`：RAG处理错误

## 安全特性

- **输入验证**：验证请求和查询的格式和大小
- **敏感字段检测**：检测请求中的敏感字段
- **SQL注入防护**：检测潜在的SQL注入攻击
- **XSS防护**：检测潜在的XSS攻击
- **输入 sanitization**：转义HTML特殊字符

## 性能优化

- **缓存机制**：支持内存缓存和Redis缓存
- **缓存回退**：Redis不可用时自动回退到内存缓存
- **LRU缓存**：内存缓存使用LRU策略
- **异步操作**：所有缓存操作都是异步的

## 测试

```bash
# 运行测试
node test_data_gateway.js
```

## 最佳实践

1. **合理配置缓存**：根据系统资源和数据特性配置缓存参数
2. **使用插件扩展**：通过插件系统扩展功能
3. **输入验证**：确保所有输入都经过验证
4. **错误处理**：妥善处理错误，提供清晰的错误信息
5. **监控和日志**：定期检查系统健康状态和日志

## 版本

- 1.0.0：初始版本，实现核心功能
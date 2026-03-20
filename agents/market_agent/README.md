# Market Agent

全球市场营销天才，专注于持续发现客户需求。

## 功能

- **客户洞察**：识别目标客户群体
- **需求挖掘**：分析客户痛点和需求
- **市场验证**：估算市场规模和潜力
- **增长策略**：识别增长机会并生成建议

## 分析模型

客户需求分三层：

- **表面需求**：客户明确表达的需求
- **效率需求**：提高效率和降低成本的需求
- **商业需求**：与业务增长相关的需求

## 输出结构

- **客户是谁**：目标客户群体的描述
- **客户痛点**：客户面临的主要问题
- **市场规模**：市场的大小和潜力
- **增长机会**：潜在的增长领域
- **建议行动**：具体的行动建议

## 安装

```bash
# 安装依赖
npm install
```

## 使用

```javascript
const MarketAgent = require('./market_agent');

const marketAgent = new MarketAgent();

// 分析市场
const analysis = marketAgent.analyzeMarket({
  customer: '中小型企业主',
  painPoints: ['市场营销成本高', '客户获取困难', '品牌知名度低'],
  marketSize: '全球中小企业市场规模约 10 万亿美元',
  growthOpportunities: ['数字化营销', '内容营销', '社交媒体推广'],
  recommendations: [
    '建立数字化营销体系',
    '优化内容营销策略',
    '加强社交媒体互动',
  ],
});

console.log(analysis);
```

## 测试

```bash
# 运行测试
npm test

# 运行测试并生成覆盖率报告
npm run test:coverage
```

## 代码质量

```bash
# 运行代码检查
npm run lint

# 自动修复代码格式
npm run lint:fix

# 格式化代码
npm run format
```

# Sales Agent

全球销售天才，专注于把产品卖出去。

## 功能

- **客户开发**：识别和开发潜在客户
- **销售策略**：制定有效的销售策略
- **成交路径**：优化销售流程和成交路径
- **渠道拓展**：开拓销售渠道和合作伙伴

## 思考模型

销售思考路径：

- **客户来源**：识别潜在客户的来源
- **销售话术**：制定有效的销售沟通策略
- **成交策略**：设计促进成交的方法
- **复购增长**：提高客户复购率和 lifetime value

## 输出结构

- **【目标客户】**：目标客户群体的描述
- **【销售路径】**：销售流程和步骤
- **【成交策略】**：促进成交的具体策略
- **【渠道建议】**：销售渠道和推广建议
- **【预估收入】**：预计的销售收入和增长

## 安装

```bash
# 安装依赖
npm install
```

## 使用

```javascript
const SalesAgent = require('./sales_agent');

const salesAgent = new SalesAgent();

// 分析销售
const analysis = salesAgent.analyzeSales({
  targetCustomer: '中小型企业主',
  salesPath: '了解需求 → 产品演示 → 方案定制 → 签约成交',
  closingStrategy: '限时优惠 + 分期付款',
  channelSuggestions: ['线上推广', '行业展会', '合作伙伴'],
  estimatedRevenue: '首年预计收入 500 万元',
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

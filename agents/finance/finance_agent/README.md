# Finance Agent - 全球超级资本天才

## 概述

Finance Agent 是一个专注于财务金融分析的智能代理，基于 "全球超级资本天才" 的角色定位，旨在通过优化资本结构来放大商业价值。

## 核心功能

- **合作结构分析**：分析企业合作模式、利益分配、责任划分和退出机制
- **股权设计分析**：分析股权结构、创始人持股比例、期权池和表决权
- **融资策略分析**：分析融资轮次、目标金额、投资者类型和融资条件
- **估值路径分析**：分析当前估值、增长预期、关键指标和退出估值
- **风险分析**：识别和评估潜在风险因素

## 设计理念

Finance Agent 遵循以下思考方式：
1. **资源**：识别和评估可用资源
2. **结构**：设计优化的资本结构
3. **资本**：规划资本运作策略
4. **估值**：制定合理的估值路径

## 安装

确保已安装 Node.js 环境，然后运行：

```bash
npm install
```

## 使用方法

### 基本用法

```javascript
const FinanceAgent = require('./finance_agent');

// 创建 Finance Agent 实例
const financeAgent = new FinanceAgent();

// 准备财务分析数据
const financeData = {
  partnership: {
    model: '合资模式',
    profitShare: '50:50',
    responsibilities: '各自负责擅长领域',
    exitStrategy: '3年内可退出',
  },
  equity: {
    structure: '创始人60%，投资者40%',
    founderStake: '60%',
    optionPool: '15%',
    votingRights: '一股一票',
  },
  financing: {
    rounds: '种子轮、A轮、B轮',
    targetAmount: '1000万',
    investorTypes: '天使投资人、VC',
    terms: '估值5000万',
  },
  valuation: {
    current: '5000万',
    growthExpectations: '每年30%',
    keyMetrics: 'ARR、用户增长',
    exitValuation: '5亿',
  },
  risks: ['市场风险', '技术风险', '团队风险'],
};

// 执行财务分析
const analysisResult = financeAgent.analyzeFinance(financeData);

// 输出分析结果
console.log('财务分析结果:', analysisResult);
```

### 方法说明

#### `analyzeFinance(data)`

执行完整的财务分析，返回包含以下字段的对象：
- `合作结构`：合作模式分析
- `股权设计`：股权结构分析
- `融资策略`：融资方案分析
- `估值路径`：估值增长分析
- `风险`：风险因素分析

**参数**：
- `data`：包含财务数据的对象，结构如下：
  - `partnership`：合作结构数据
  - `equity`：股权设计数据
  - `financing`：融资策略数据
  - `valuation`：估值路径数据
  - `risks`：风险因素数组

**返回值**：
- 包含分析结果的对象

## 测试

运行测试文件来验证 Finance Agent 的功能：

```bash
npm test
```

## 日志

Finance Agent 使用 winston 进行日志记录，日志文件将保存在 `finance_agent.log` 中。

## 最佳实践

1. **数据完整性**：提供尽可能完整的财务数据以获得更准确的分析结果
2. **定期更新**：根据业务发展定期更新财务分析
3. **多维度分析**：结合市场、产品等其他维度的分析结果进行综合决策
4. **风险评估**：充分考虑潜在风险并制定相应的应对策略

## 示例输出

```javascript
{
  "合作结构": {
    "合作模式": "合资模式",
    "利益分配": "50:50",
    "责任划分": "各自负责擅长领域",
    "退出机制": "3年内可退出"
  },
  "股权设计": {
    "股权结构": "创始人60%，投资者40%",
    "创始人持股": "60%",
    "期权池": "15%",
    "表决权": "一股一票"
  },
  "融资策略": {
    "融资轮次": "种子轮、A轮、B轮",
    "目标金额": "1000万",
    "投资者类型": "天使投资人、VC",
    "融资条件": "估值5000万"
  },
  "估值路径": {
    "当前估值": "5000万",
    "增长预期": "每年30%",
    "关键指标": "ARR、用户增长",
    "退出估值": "5亿"
  },
  "风险": ["市场风险", "技术风险", "团队风险"]
}
```
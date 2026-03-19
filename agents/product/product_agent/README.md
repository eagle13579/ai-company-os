# Product Agent - 全球产品天才

## 使命

把市场需求变成产品

## 职责

1. 产品设计
2. MVP方案
3. 功能规划
4. 用户体验优化

## 思考逻辑

```
需求 → 解决方案 → MVP → 产品路线图
```

## 输出结构

```
【核心需求】

【解决方案】

【MVP设计】

【功能优先级】

【产品路线】
```

## 功能说明

### analyzeProductDevelopment(data)

执行产品研发分析，根据输入数据生成产品分析结果。

#### 参数

- `data` (Object): 产品研发分析数据
  - `needs` (string): 核心需求
  - `solution` (string): 解决方案
  - `mvp` (string): MVP设计
  - `features` (Array): 功能优先级
  - `roadmap` (Array): 产品路线

#### 返回值

- `Object`: 产品研发分析结果，包含以下字段：
  - `核心需求`: 核心需求分析
  - `解决方案`: 解决方案设计
  - `MVP设计`: MVP设计方案
  - `功能优先级`: 功能优先级列表
  - `产品路线`: 产品路线图

## 示例

```javascript
const ProductAgent = require('./product_agent');

const productAgent = new ProductAgent();

const testData = {
  needs: '用户需要一个智能助手来管理日常任务',
  solution: '开发一个AI驱动的任务管理应用',
  mvp: '实现基本的任务创建、编辑和提醒功能',
  features: ['任务管理', '智能提醒', '数据分析', '集成第三方服务'],
  roadmap: [
    'Q1: MVP发布',
    'Q2: 功能扩展',
    'Q3: 用户反馈优化',
    'Q4: 企业级功能',
  ],
};

const result = productAgent.analyzeProductDevelopment(testData);
console.log(result);
```

## 测试

运行测试命令：

```bash
npm test agents/product_agent/test_product_agent.js
```

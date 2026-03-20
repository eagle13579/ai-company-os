/**
 * Data Agent Test
 * 测试 Data Agent 的数据分析功能
 */
const DataAgent = require('./data_agent');

// 创建 Data Agent 实例
const dataAgent = new DataAgent();

// 测试用例 1: 完整的数据分析
console.log('=== 测试用例 1: 完整的数据分析 ===');
const testData1 = {
  sources: {
    types: ['用户数据', '市场数据', '运营数据'],
    volume: '100万+',
    quality: '高质量',
    timeliness: '实时更新',
  },
  analysis: {
    shortTerm: '用户活跃度上升',
    midTerm: '市场份额增长',
    longTerm: '行业趋势向好',
    anomalies: '无异常',
  },
  insights: {
    market: '市场需求增长',
    customer: '用户满意度提升',
    competitive: '竞争优势明显',
    operational: '运营效率提高',
  },
  optimization: {
    marketOpportunities: '新市场开拓',
    productOpportunities: '产品功能升级',
    operationalOpportunities: '运营流程优化',
    technicalOpportunities: '技术架构升级',
    dataCollection: '增加数据采集渠道',
    dataAnalysis: '优化分析算法',
    dataModeling: '建立预测模型',
    dataDriven: '数据驱动决策流程',
  },
};

const result1 = dataAgent.analyzeData(testData1);
console.log('测试结果 1:', JSON.stringify(result1, null, 2));
console.log('\n');

// 测试用例 2: 部分数据的数据分析
console.log('=== 测试用例 2: 部分数据的数据分析 ===');
const testData2 = {
  sources: {
    types: ['用户数据', '市场数据'],
    volume: '50万+',
  },
  analysis: {
    shortTerm: '用户活跃度下降',
  },
};

const result2 = dataAgent.analyzeData(testData2);
console.log('测试结果 2:', JSON.stringify(result2, null, 2));
console.log('\n');

// 测试用例 3: 无效输入的数据分析
console.log('=== 测试用例 3: 无效输入的数据分析 ===');
const testData3 = null;
const result3 = dataAgent.analyzeData(testData3);
console.log('测试结果 3:', JSON.stringify(result3, null, 2));
console.log('\n');

// 测试用例 4: 空对象输入的数据分析
console.log('=== 测试用例 4: 空对象输入的数据分析 ===');
const testData4 = {};
const result4 = dataAgent.analyzeData(testData4);
console.log('测试结果 4:', JSON.stringify(result4, null, 2));
console.log('\n');

// 测试用例 5: 数组输入的数据分析
console.log('=== 测试用例 5: 数组输入的数据分析 ===');
const testData5 = [];
const result5 = dataAgent.analyzeData(testData5);
console.log('测试结果 5:', JSON.stringify(result5, null, 2));
console.log('\n');

console.log('=== 所有测试用例执行完成 ===');

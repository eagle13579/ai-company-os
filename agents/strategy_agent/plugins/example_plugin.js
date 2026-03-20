/**
 * 示例插件
 * 展示Strategy Agent的可扩展性
 */
const examplePlugin = {
  name: 'examplePlugin',

  /**
   * 预处理数据
   * @param {Object} data - 输入数据
   * @returns {Object} 处理后的数据
   */
  preProcess(data) {
    console.log('Example plugin: pre-processing data');
    // 可以在这里添加数据验证、转换等逻辑
    return data;
  },

  /**
   * 后处理分析结果
   * @param {Object} analysis - 分析结果
   * @returns {Object} 处理后的分析结果
   */
  postProcess(analysis) {
    console.log('Example plugin: post-processing analysis');
    // 可以在这里添加结果增强、格式化等逻辑
    return analysis;
  },
};

module.exports = examplePlugin;

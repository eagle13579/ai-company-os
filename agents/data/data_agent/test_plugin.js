/**
 * 测试插件
 * 用于验证 Data Agent 的插件系统
 */

const testPlugin = {
  name: 'test-plugin',
  
  /**
   * 预处理数据
   * @param {Object} data - 输入数据
   * @returns {Object} 处理后的数据
   */
  preProcess(data) {
    console.log('执行插件预处理');
    // 添加测试标记
    if (!data.metadata) {
      data.metadata = {};
    }
    data.metadata.processedBy = 'test-plugin';
    data.metadata.processTime = new Date().toISOString();
    return data;
  },
  
  /**
   * 后处理分析结果
   * @param {Object} analysis - 分析结果
   * @returns {Object} 处理后的分析结果
   */
  postProcess(analysis) {
    console.log('执行插件后处理');
    // 添加插件处理标记
    analysis.pluginProcessed = true;
    analysis.processedBy = 'test-plugin';
    return analysis;
  }
};

module.exports = testPlugin;
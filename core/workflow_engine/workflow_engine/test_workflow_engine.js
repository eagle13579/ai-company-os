const WorkflowEngine = require('./workflow_engine');
const StepManager = require('./step_manager');
const ExecutionMonitor = require('./execution_monitor');

async function testWorkflowEngine() {
  console.log('=== 工作流引擎测试开始 ===');

  // 初始化组件
  const stepManager = new StepManager();
  const executionMonitor = new ExecutionMonitor();
  const workflowEngine = new WorkflowEngine(stepManager, executionMonitor);

  // 注册事件监听器
  executionMonitor.on('workflowStatusChanged', (data) => {
    console.log(`📢 工作流状态变更: ${data.workflowId} -> ${data.status}`, data.error ? `错误: ${data.error}` : '');
  });

  executionMonitor.on('stepStatusChanged', (data) => {
    console.log(`📢 步骤状态变更: ${data.workflowId} - ${data.stepId} -> ${data.status}`);
  });

  // 测试1: 创建工作流
  console.log('\n1. 测试创建工作流');
  const workflow = workflowEngine.createWorkflow('测试工作流', [
    {
      id: 'step1',
      type: 'function',
      name: '同步函数步骤',
      func: (params) => {
        console.log('执行同步函数步骤:', params);
        return { result: '同步函数执行成功', params };
      },
      params: { message: 'Hello, World!' }
    },
    {
      id: 'step2',
      type: 'asyncFunction',
      name: '异步函数步骤',
      func: async (params) => {
        console.log('执行异步函数步骤:', params);
        await new Promise(resolve => setTimeout(resolve, 1000)); // 模拟异步操作
        return { result: '异步函数执行成功', params };
      },
      params: { delay: 1000 }
    },
    {
      id: 'step3',
      type: 'function',
      name: '另一个同步函数步骤',
      func: (params) => {
        console.log('执行另一个同步函数步骤:', params);
        return { result: '另一个同步函数执行成功', params };
      },
      params: { value: 42 }
    }
  ]);

  console.log('创建的工作流:', workflow);

  // 测试2: 执行工作流
  console.log('\n2. 测试执行工作流');
  try {
    const result = await workflowEngine.startWorkflow(workflow.id);
    console.log('工作流执行完成:', result);
  } catch (error) {
    console.error('工作流执行失败:', error);
  }

  // 测试3: 测试暂停和恢复功能
  console.log('\n3. 测试暂停和恢复功能');
  const pauseTestWorkflow = workflowEngine.createWorkflow('暂停测试工作流', [
    {
      id: 'pauseStep1',
      type: 'function',
      name: '第一步',
      func: () => {
        console.log('执行第一步');
        return { result: '第一步完成' };
      }
    },
    {
      id: 'pauseStep2',
      type: 'asyncFunction',
      name: '第二步（会被暂停）',
      func: async () => {
        console.log('开始执行第二步');
        // 模拟长时间运行的任务
        for (let i = 0; i < 5; i++) {
          console.log(`第二步执行中... ${i + 1}/5`);
          await new Promise(resolve => setTimeout(resolve, 500));
        }
        return { result: '第二步完成' };
      }
    },
    {
      id: 'pauseStep3',
      type: 'function',
      name: '第三步',
      func: () => {
        console.log('执行第三步');
        return { result: '第三步完成' };
      }
    }
  ]);

  // 启动工作流并在执行第二步时暂停
  const workflowPromise = workflowEngine.startWorkflow(pauseTestWorkflow.id);

  // 等待1秒后暂停工作流
  setTimeout(() => {
    console.log('\n🔴 暂停工作流');
    workflowEngine.pauseWorkflow(pauseTestWorkflow.id);

    // 等待2秒后恢复工作流
    setTimeout(() => {
      console.log('\n🟢 恢复工作流');
      workflowEngine.resumeWorkflow(pauseTestWorkflow.id);
    }, 2000);
  }, 1000);

  try {
    const pauseTestResult = await workflowPromise;
    console.log('暂停测试工作流执行完成:', pauseTestResult);
  } catch (error) {
    console.error('暂停测试工作流执行失败:', error);
  }

  // 测试4: 测试停止功能
  console.log('\n4. 测试停止功能');
  const stopTestWorkflow = workflowEngine.createWorkflow('停止测试工作流', [
    {
      id: 'stopStep1',
      type: 'function',
      name: '第一步',
      func: () => {
        console.log('执行第一步');
        return { result: '第一步完成' };
      }
    },
    {
      id: 'stopStep2',
      type: 'asyncFunction',
      name: '第二步（会被停止）',
      func: async () => {
        console.log('开始执行第二步');
        // 模拟长时间运行的任务
        for (let i = 0; i < 10; i++) {
          console.log(`第二步执行中... ${i + 1}/10`);
          await new Promise(resolve => setTimeout(resolve, 300));
        }
        return { result: '第二步完成' };
      }
    }
  ]);

  const stopWorkflowPromise = workflowEngine.startWorkflow(stopTestWorkflow.id);

  // 等待1秒后停止工作流
  setTimeout(() => {
    console.log('\n🛑 停止工作流');
    workflowEngine.stopWorkflow(stopTestWorkflow.id);
  }, 1000);

  try {
    const stopTestResult = await stopWorkflowPromise;
    console.log('停止测试工作流执行完成:', stopTestResult);
  } catch (error) {
    console.error('停止测试工作流执行失败:', error);
  }

  // 测试5: 测试错误处理
  console.log('\n5. 测试错误处理');
  const errorTestWorkflow = workflowEngine.createWorkflow('错误测试工作流', [
    {
      id: 'errorStep1',
      type: 'function',
      name: '成功步骤',
      func: () => {
        console.log('执行成功步骤');
        return { result: '成功步骤完成' };
      }
    },
    {
      id: 'errorStep2',
      type: 'function',
      name: '错误步骤',
      func: () => {
        console.log('执行错误步骤');
        throw new Error('故意抛出的错误');
      }
    },
    {
      id: 'errorStep3',
      type: 'function',
      name: '不会执行的步骤',
      func: () => {
        console.log('执行不会执行的步骤');
        return { result: '不会执行的步骤完成' };
      }
    }
  ]);

  try {
    const errorTestResult = await workflowEngine.startWorkflow(errorTestWorkflow.id);
    console.log('错误测试工作流执行完成:', errorTestResult);
  } catch (error) {
    console.error('错误测试工作流执行失败（预期行为）:', error.message);
  }

  // 测试6: 查看监控信息
  console.log('\n6. 查看监控信息');
  console.log('工作流状态:', executionMonitor.getAllWorkflowsStatus());
  console.log('监控指标:', executionMonitor.getMetrics());
  console.log('最近日志:', executionMonitor.getLogs(10));

  console.log('\n=== 工作流引擎测试完成 ===');
}

// 运行测试
testWorkflowEngine().catch(console.error);
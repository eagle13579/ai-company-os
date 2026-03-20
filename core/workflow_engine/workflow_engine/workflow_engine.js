class WorkflowEngine {
  constructor(stepManager, executionMonitor, persistence = null, versionManager = null, pluginManager = null, maxConcurrentWorkflows = 5) {
    this.stepManager = stepManager;
    this.executionMonitor = executionMonitor;
    this.persistence = persistence;
    this.versionManager = versionManager;
    this.pluginManager = pluginManager;
    this.maxConcurrentWorkflows = maxConcurrentWorkflows;
    this.workflows = new Map();
    this.queue = [];
    this.runningWorkflows = 0;
    this.loadWorkflowsFromPersistence();
  }

  loadWorkflowsFromPersistence() {
    if (this.persistence) {
      const workflows = this.persistence.loadAllWorkflows();
      for (const workflow of workflows) {
        this.workflows.set(workflow.id, workflow);
        this.executionMonitor.registerWorkflow(workflow);
      }
    }
  }

  saveWorkflowToPersistence(workflow) {
    if (this.persistence) {
      this.persistence.saveWorkflow(workflow);
    }
  }

  validateWorkflowDefinition(name, steps) {
    if (!name || typeof name !== 'string' || name.trim() === '') {
      throw new Error('Workflow name is required and must be a non-empty string');
    }

    if (!Array.isArray(steps)) {
      throw new Error('Steps must be an array');
    }

    if (steps.length === 0) {
      throw new Error('Workflow must have at least one step');
    }

    const stepIds = new Set();
    this.validateSteps(steps, stepIds, 0);
  }

  validateSteps(steps, stepIds, level) {
    for (let i = 0; i < steps.length; i++) {
      const step = steps[i];
      if (!step || typeof step !== 'object') {
        throw new Error(`Step ${i} must be an object`);
      }

      // 支持并行步骤组
      if (step.type === 'parallel') {
        if (!step.steps || !Array.isArray(step.steps)) {
          throw new Error(`Parallel step ${i} must have a steps array`);
        }
        if (step.steps.length === 0) {
          throw new Error(`Parallel step ${i} must have at least one step`);
        }
        // 递归验证并行步骤组中的步骤
        this.validateSteps(step.steps, stepIds, level + 1);
      } 
      // 支持条件分支步骤
      else if (step.type === 'condition') {
        if (!step.condition || typeof step.condition !== 'function') {
          throw new Error(`Condition step ${i} must have a condition function`);
        }
        if (!step.trueSteps || !Array.isArray(step.trueSteps)) {
          throw new Error(`Condition step ${i} must have a trueSteps array`);
        }
        if (!step.falseSteps || !Array.isArray(step.falseSteps)) {
          throw new Error(`Condition step ${i} must have a falseSteps array`);
        }
        // 递归验证条件分支中的步骤
        this.validateSteps(step.trueSteps, stepIds, level + 1);
        this.validateSteps(step.falseSteps, stepIds, level + 1);
      }
      // 支持循环步骤
      else if (step.type === 'loop') {
        if (!step.condition || typeof step.condition !== 'function') {
          throw new Error(`Loop step ${i} must have a condition function`);
        }
        if (!step.steps || !Array.isArray(step.steps)) {
          throw new Error(`Loop step ${i} must have a steps array`);
        }
        if (step.steps.length === 0) {
          throw new Error(`Loop step ${i} must have at least one step`);
        }
        // 递归验证循环体中的步骤
        this.validateSteps(step.steps, stepIds, level + 1);
      }
      else {
        if (!step.type || typeof step.type !== 'string') {
          throw new Error(`Step ${i} must have a type property`);
        }

        const stepId = step.id || `step_${level}_${i}`;
        if (stepIds.has(stepId)) {
          throw new Error(`Duplicate step ID: ${stepId}`);
        }
        stepIds.add(stepId);

        if (step.type === 'function' || step.type === 'asyncFunction') {
          if (!step.func || typeof step.func !== 'function') {
            throw new Error(`Step ${stepId} of type ${step.type} must have a func property`);
          }
        } else if (step.type === 'http') {
          if (!step.params || !step.params.url) {
            throw new Error(`Step ${stepId} of type http must have a url parameter`);
          }
        }

        if (step.retries) {
          if (typeof step.retries.max !== 'number' || step.retries.max < 0) {
            throw new Error(`Step ${stepId} retries.max must be a non-negative number`);
          }
          if (typeof step.retries.interval !== 'number' || step.retries.interval < 0) {
            throw new Error(`Step ${stepId} retries.interval must be a non-negative number`);
          }
        }
      }
    }
  }

  async createWorkflow(name, steps) {
    // 执行工作流创建前的钩子
    if (this.pluginManager) {
      await this.pluginManager.executeHook('beforeWorkflowCreate', name, steps);
    }

    this.validateWorkflowDefinition(name, steps);
    
    // 保存工作流版本
    if (this.versionManager) {
      const version = this.versionManager.saveWorkflowVersion(name, { name, steps });
      console.log(`Workflow ${name} saved as version ${version}`);
    }
    
    const workflowId = this.generateWorkflowId();
    const workflow = {
      id: workflowId,
      name,
      steps: this.processSteps(steps),
      status: 'created',
      createdAt: new Date(),
      startedAt: null,
      completedAt: null
    };

    this.workflows.set(workflowId, workflow);
    this.executionMonitor.registerWorkflow(workflow);
    this.saveWorkflowToPersistence(workflow);

    // 执行工作流创建后的钩子
    if (this.pluginManager) {
      await this.pluginManager.executeHook('afterWorkflowCreate', workflow);
    }

    return workflow;
  }

  processSteps(steps, parentId = null, level = 0) {
    return steps.map((step, index) => {
      const processedStep = {
        ...step,
        id: step.id || `${parentId ? parentId + '_' : ''}step_${level}_${index}`,
        status: 'pending'
      };

      // 处理并行步骤的子步骤
      if (step.type === 'parallel' && step.steps) {
        processedStep.steps = this.processSteps(step.steps, processedStep.id, level + 1);
      }
      // 处理条件分支步骤的子步骤
      else if (step.type === 'condition') {
        if (step.trueSteps) {
          processedStep.trueSteps = this.processSteps(step.trueSteps, processedStep.id, level + 1);
        }
        if (step.falseSteps) {
          processedStep.falseSteps = this.processSteps(step.falseSteps, processedStep.id, level + 1);
        }
      }
      // 处理循环步骤的子步骤
      else if (step.type === 'loop' && step.steps) {
        processedStep.steps = this.processSteps(step.steps, processedStep.id, level + 1);
      }

      return processedStep;
    });
  }

  createWorkflowFromVersion(workflowName, version = null) {
    if (!this.versionManager) {
      throw new Error('Version manager is not initialized');
    }

    const versionData = version ? 
      this.versionManager.getWorkflowVersion(workflowName, version) :
      this.versionManager.getLatestWorkflowVersion(workflowName);

    if (!versionData) {
      throw new Error(`Workflow version not found: ${workflowName} v${version}`);
    }

    return this.createWorkflow(versionData.definition.name, versionData.definition.steps);
  }

  async startWorkflow(workflowId) {
    const workflow = this.workflows.get(workflowId);
    if (!workflow) {
      throw new Error(`Workflow ${workflowId} not found`);
    }

    // 执行工作流开始前的钩子
    if (this.pluginManager) {
      await this.pluginManager.executeHook('beforeWorkflowStart', workflow);
    }

    if (this.runningWorkflows >= this.maxConcurrentWorkflows) {
      console.log(`Workflow ${workflowId} queued (${this.runningWorkflows}/${this.maxConcurrentWorkflows} running)`);
      return new Promise((resolve, reject) => {
        this.queue.push({ workflowId, resolve, reject });
      });
    }

    return this.executeWorkflow(workflowId);
  }

  async executeWorkflow(workflowId) {
    const workflow = this.workflows.get(workflowId);
    if (!workflow) {
      throw new Error(`Workflow ${workflowId} not found`);
    }

    this.runningWorkflows++;
    workflow.status = 'running';
    workflow.startedAt = new Date();
    workflow.executedSteps = [];
    this.executionMonitor.updateWorkflowStatus(workflowId, 'running');
    this.saveWorkflowToPersistence(workflow);

    try {
      for (const step of workflow.steps) {
        if (workflow.status === 'paused') {
          await this.waitForResume(workflowId);
        }

        if (workflow.status === 'stopped') {
          break;
        }

        if (step.type === 'parallel') {
          await this.executeParallelSteps(workflowId, step);
          workflow.executedSteps.push(step.id);
        } else if (step.type === 'condition') {
          await this.executeConditionStep(workflowId, step);
          workflow.executedSteps.push(step.id);
        } else if (step.type === 'loop') {
          await this.executeLoopStep(workflowId, step);
          workflow.executedSteps.push(step.id);
        } else {
          await this.executeStep(workflowId, step.id);
          workflow.executedSteps.push(step.id);
        }
      }

      if (workflow.status === 'running') {
        workflow.status = 'completed';
        workflow.completedAt = new Date();
        this.executionMonitor.updateWorkflowStatus(workflowId, 'completed');
        
        // 执行工作流完成前的钩子
        if (this.pluginManager) {
          await this.pluginManager.executeHook('beforeWorkflowComplete', workflow);
        }
        
        this.saveWorkflowToPersistence(workflow);
        
        // 执行工作流完成后的钩子
        if (this.pluginManager) {
          await this.pluginManager.executeHook('afterWorkflowComplete', workflow);
        }
      }
    } catch (error) {
      workflow.status = 'failed';
      workflow.error = error.message;
      
      // 执行工作流失败前的钩子
      if (this.pluginManager) {
        await this.pluginManager.executeHook('beforeWorkflowFail', workflow, error);
      }
      
      this.executionMonitor.updateWorkflowStatus(workflowId, 'failed', error.message);
      
      // 尝试回滚已执行的步骤
      if (workflow.executedSteps && workflow.executedSteps.length > 0) {
        await this.rollbackWorkflow(workflowId);
      }
      
      this.saveWorkflowToPersistence(workflow);
      
      // 执行工作流失败后的钩子
      if (this.pluginManager) {
        await this.pluginManager.executeHook('afterWorkflowFail', workflow, error);
      }
      
      throw error;
    } finally {
      this.runningWorkflows--;
      this.processQueue();
    }

    return workflow;
  }

  async executeConditionStep(workflowId, conditionStep) {
    const workflow = this.workflows.get(workflowId);
    if (!workflow) {
      throw new Error(`Workflow ${workflowId} not found`);
    }

    // 执行条件分支步骤前的钩子
    if (this.pluginManager) {
      await this.pluginManager.executeHook('beforeConditionStepExecute', workflow, conditionStep);
    }

    conditionStep.status = 'running';
    this.executionMonitor.updateStepStatus(workflowId, conditionStep.id, 'running');

    try {
      // 评估条件
      const conditionResult = await conditionStep.condition();
      conditionStep.conditionResult = conditionResult;

      // 执行相应的分支
      if (conditionResult) {
        if (conditionStep.trueSteps && conditionStep.trueSteps.length > 0) {
          for (const trueStep of conditionStep.trueSteps) {
            if (workflow.status === 'paused') {
              await this.waitForResume(workflowId);
            }

            if (workflow.status === 'stopped') {
              break;
            }

            if (trueStep.type === 'parallel') {
              await this.executeParallelSteps(workflowId, trueStep);
            } else if (trueStep.type === 'condition') {
              await this.executeConditionStep(workflowId, trueStep);
            } else if (trueStep.type === 'loop') {
              await this.executeLoopStep(workflowId, trueStep);
            } else {
              await this.executeStep(workflowId, trueStep.id);
            }
          }
        }
      } else {
        if (conditionStep.falseSteps && conditionStep.falseSteps.length > 0) {
          for (const falseStep of conditionStep.falseSteps) {
            if (workflow.status === 'paused') {
              await this.waitForResume(workflowId);
            }

            if (workflow.status === 'stopped') {
              break;
            }

            if (falseStep.type === 'parallel') {
              await this.executeParallelSteps(workflowId, falseStep);
            } else if (falseStep.type === 'condition') {
              await this.executeConditionStep(workflowId, falseStep);
            } else if (falseStep.type === 'loop') {
              await this.executeLoopStep(workflowId, falseStep);
            } else {
              await this.executeStep(workflowId, falseStep.id);
            }
          }
        }
      }

      conditionStep.status = 'completed';
      this.executionMonitor.updateStepStatus(workflowId, conditionStep.id, 'completed', { conditionResult });

      // 执行条件分支步骤后的钩子
      if (this.pluginManager) {
        await this.pluginManager.executeHook('afterConditionStepExecute', workflow, conditionStep, { conditionResult });
      }
    } catch (error) {
      conditionStep.status = 'failed';
      conditionStep.error = error.message;
      this.executionMonitor.updateStepStatus(workflowId, conditionStep.id, 'failed', error.message);
      throw error;
    }
  }

  async executeLoopStep(workflowId, loopStep) {
    const workflow = this.workflows.get(workflowId);
    if (!workflow) {
      throw new Error(`Workflow ${workflowId} not found`);
    }

    // 执行循环步骤前的钩子
    if (this.pluginManager) {
      await this.pluginManager.executeHook('beforeLoopStepExecute', workflow, loopStep);
    }

    loopStep.status = 'running';
    this.executionMonitor.updateStepStatus(workflowId, loopStep.id, 'running');

    try {
      let iteration = 0;
      const maxIterations = loopStep.maxIterations || 100; // 防止无限循环

      while (await loopStep.condition() && iteration < maxIterations) {
        if (workflow.status === 'paused') {
          await this.waitForResume(workflowId);
        }

        if (workflow.status === 'stopped') {
          break;
        }

        // 执行循环体中的步骤
        for (const loopBodyStep of loopStep.steps) {
          if (workflow.status === 'paused') {
            await this.waitForResume(workflowId);
          }

          if (workflow.status === 'stopped') {
            break;
          }

          if (loopBodyStep.type === 'parallel') {
            await this.executeParallelSteps(workflowId, loopBodyStep);
          } else if (loopBodyStep.type === 'condition') {
            await this.executeConditionStep(workflowId, loopBodyStep);
          } else if (loopBodyStep.type === 'loop') {
            await this.executeLoopStep(workflowId, loopBodyStep);
          } else {
            await this.executeStep(workflowId, loopBodyStep.id);
          }
        }

        iteration++;
      }

      loopStep.status = 'completed';
      loopStep.iterations = iteration;
      this.executionMonitor.updateStepStatus(workflowId, loopStep.id, 'completed', { iterations: iteration });

      // 执行循环步骤后的钩子
      if (this.pluginManager) {
        await this.pluginManager.executeHook('afterLoopStepExecute', workflow, loopStep, { iterations: iteration });
      }
    } catch (error) {
      loopStep.status = 'failed';
      loopStep.error = error.message;
      this.executionMonitor.updateStepStatus(workflowId, loopStep.id, 'failed', error.message);
      throw error;
    }
  }

  async executeParallelSteps(workflowId, parallelStep) {
    const workflow = this.workflows.get(workflowId);
    if (!workflow) {
      throw new Error(`Workflow ${workflowId} not found`);
    }

    // 执行并行步骤组前的钩子
    if (this.pluginManager) {
      await this.pluginManager.executeHook('beforeParallelStepsExecute', workflow, parallelStep);
    }

    parallelStep.status = 'running';
    this.executionMonitor.updateStepStatus(workflowId, parallelStep.id, 'running');

    try {
      // 并行执行所有子步骤
      const stepPromises = parallelStep.steps.map(async (step) => {
        // 为子步骤生成ID（如果没有）
        if (!step.id) {
          step.id = `${parallelStep.id}_child_${Math.random().toString(36).substr(2, 9)}`;
        }
        
        // 执行子步骤
        if (step.type === 'parallel') {
          await this.executeParallelSteps(workflowId, step);
        } else {
          await this.executeStep(workflowId, step.id);
        }
        
        return step;
      });

      // 等待所有并行步骤完成
      await Promise.all(stepPromises);

      parallelStep.status = 'completed';
      this.executionMonitor.updateStepStatus(workflowId, parallelStep.id, 'completed');

      // 执行并行步骤组后的钩子
      if (this.pluginManager) {
        await this.pluginManager.executeHook('afterParallelStepsExecute', workflow, parallelStep);
      }
    } catch (error) {
      parallelStep.status = 'failed';
      parallelStep.error = error.message;
      this.executionMonitor.updateStepStatus(workflowId, parallelStep.id, 'failed', error.message);
      throw error;
    }
  }

  async rollbackWorkflow(workflowId) {
    const workflow = this.workflows.get(workflowId);
    if (!workflow) {
      return;
    }

    console.log(`Rolling back workflow ${workflowId}...`);
    
    // 按相反顺序回滚已执行的步骤
    for (let i = workflow.executedSteps.length - 1; i >= 0; i--) {
      const stepId = workflow.executedSteps[i];
      const step = workflow.steps.find(s => s.id === stepId);
      
      if (step && step.rollback) {
        try {
          // 执行步骤回滚前的钩子
          if (this.pluginManager) {
            await this.pluginManager.executeHook('beforeStepRollback', workflow, step);
          }

          console.log(`Rolling back step ${stepId}...`);
          await this.stepManager.executeStep({
            ...step,
            func: step.rollback,
            type: 'function'
          });
          console.log(`Step ${stepId} rolled back successfully`);

          // 执行步骤回滚后的钩子
          if (this.pluginManager) {
            await this.pluginManager.executeHook('afterStepRollback', workflow, step);
          }
        } catch (rollbackError) {
          console.error(`Error rolling back step ${stepId}:`, rollbackError);
          // 继续回滚其他步骤
        }
      }
    }
  }

  processQueue() {
    if (this.queue.length > 0 && this.runningWorkflows < this.maxConcurrentWorkflows) {
      const { workflowId, resolve, reject } = this.queue.shift();
      console.log(`Processing queued workflow ${workflowId} (${this.runningWorkflows + 1}/${this.maxConcurrentWorkflows} running)`);
      this.executeWorkflow(workflowId).then(resolve).catch(reject);
    }
  }

  async executeStep(workflowId, stepId) {
    const workflow = this.workflows.get(workflowId);
    const step = this.findStep(workflow.steps, stepId);

    if (!step) {
      throw new Error(`Step ${stepId} not found in workflow ${workflowId}`);
    }

    // 执行步骤执行前的钩子
    if (this.pluginManager) {
      await this.pluginManager.executeHook('beforeStepExecute', workflow, step);
    }

    step.status = 'running';
    this.executionMonitor.updateStepStatus(workflowId, stepId, 'running');

    try {
      const result = await this.stepManager.executeStep(step);
      step.status = 'completed';
      step.result = result;
      this.executionMonitor.updateStepStatus(workflowId, stepId, 'completed', result);

      // 执行步骤执行后的钩子
      if (this.pluginManager) {
        await this.pluginManager.executeHook('afterStepExecute', workflow, step, result);
      }
    } catch (error) {
      step.status = 'failed';
      step.error = error.message;
      this.executionMonitor.updateStepStatus(workflowId, stepId, 'failed', error.message);
      throw error;
    }
  }

  findStep(steps, stepId) {
    for (const step of steps) {
      if (step.id === stepId) {
        return step;
      }
      if (step.type === 'parallel' && step.steps) {
        const foundStep = this.findStep(step.steps, stepId);
        if (foundStep) {
          return foundStep;
        }
      }
    }
    return null;
  }

  pauseWorkflow(workflowId) {
    const workflow = this.workflows.get(workflowId);
    if (!workflow) {
      throw new Error(`Workflow ${workflowId} not found`);
    }

    if (workflow.status === 'running') {
      workflow.status = 'paused';
      this.executionMonitor.updateWorkflowStatus(workflowId, 'paused');
      this.saveWorkflowToPersistence(workflow);
    }

    return workflow;
  }

  resumeWorkflow(workflowId) {
    const workflow = this.workflows.get(workflowId);
    if (!workflow) {
      throw new Error(`Workflow ${workflowId} not found`);
    }

    if (workflow.status === 'paused') {
      workflow.status = 'running';
      this.executionMonitor.updateWorkflowStatus(workflowId, 'running');
      this.saveWorkflowToPersistence(workflow);
      // 触发继续执行
      if (workflow.resumeCallback) {
        workflow.resumeCallback();
      }
    }

    return workflow;
  }

  stopWorkflow(workflowId) {
    const workflow = this.workflows.get(workflowId);
    if (!workflow) {
      throw new Error(`Workflow ${workflowId} not found`);
    }

    workflow.status = 'stopped';
    this.executionMonitor.updateWorkflowStatus(workflowId, 'stopped');
    this.saveWorkflowToPersistence(workflow);

    return workflow;
  }

  getWorkflow(workflowId) {
    return this.workflows.get(workflowId);
  }

  getAllWorkflows() {
    return Array.from(this.workflows.values());
  }

  generateWorkflowId() {
    return `workflow_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  waitForResume(workflowId) {
    return new Promise(resolve => {
      const workflow = this.workflows.get(workflowId);
      workflow.resumeCallback = resolve;
    });
  }
}

module.exports = WorkflowEngine;
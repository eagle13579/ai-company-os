const fs = require('fs');
const path = require('path');

class Persistence {
  constructor(storagePath = './workflow_storage') {
    this.storagePath = storagePath;
    this.ensureStorageDirectory();
  }

  ensureStorageDirectory() {
    if (!fs.existsSync(this.storagePath)) {
      fs.mkdirSync(this.storagePath, { recursive: true });
    }
  }

  saveWorkflow(workflow) {
    const filePath = path.join(this.storagePath, `${workflow.id}.json`);
    const data = {
      ...workflow,
      createdAt: workflow.createdAt.toISOString(),
      startedAt: workflow.startedAt ? workflow.startedAt.toISOString() : null,
      completedAt: workflow.completedAt ? workflow.completedAt.toISOString() : null,
      steps: workflow.steps.map(step => ({
        ...step,
        startTime: step.startTime ? step.startTime.toISOString() : null,
        endTime: step.endTime ? step.endTime.toISOString() : null,
        // 移除函数等不可序列化的属性
        func: undefined
      }))
    };
    
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
  }

  loadWorkflow(workflowId) {
    const filePath = path.join(this.storagePath, `${workflowId}.json`);
    if (!fs.existsSync(filePath)) {
      return null;
    }

    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    return {
      ...data,
      createdAt: new Date(data.createdAt),
      startedAt: data.startedAt ? new Date(data.startedAt) : null,
      completedAt: data.completedAt ? new Date(data.completedAt) : null,
      steps: data.steps ? data.steps.map(step => ({
        ...step,
        startTime: step.startTime ? new Date(step.startTime) : null,
        endTime: step.endTime ? new Date(step.endTime) : null
      })) : []
    };
  }

  loadAllWorkflows() {
    const workflows = [];
    const files = fs.readdirSync(this.storagePath);
    
    for (const file of files) {
      if (file.endsWith('.json')) {
        const workflowId = file.replace('.json', '');
        const workflow = this.loadWorkflow(workflowId);
        if (workflow) {
          workflows.push(workflow);
        }
      }
    }
    
    return workflows;
  }

  deleteWorkflow(workflowId) {
    const filePath = path.join(this.storagePath, `${workflowId}.json`);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  }

  clearAll() {
    const files = fs.readdirSync(this.storagePath);
    for (const file of files) {
      if (file.endsWith('.json')) {
        fs.unlinkSync(path.join(this.storagePath, file));
      }
    }
  }

  saveMetrics(metrics) {
    const filePath = path.join(this.storagePath, 'metrics.json');
    fs.writeFileSync(filePath, JSON.stringify(metrics, null, 2));
  }

  loadMetrics() {
    const filePath = path.join(this.storagePath, 'metrics.json');
    if (!fs.existsSync(filePath)) {
      return null;
    }

    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  }
}

module.exports = Persistence;
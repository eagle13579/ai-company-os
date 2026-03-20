const fs = require('fs');
const path = require('path');

class VersionManager {
  constructor(storagePath = './workflow_versions') {
    this.storagePath = storagePath;
    this.ensureStorageDirectory();
  }

  ensureStorageDirectory() {
    if (!fs.existsSync(this.storagePath)) {
      fs.mkdirSync(this.storagePath, { recursive: true });
    }
  }

  saveWorkflowVersion(workflowName, workflowDefinition) {
    const workflowDir = path.join(this.storagePath, workflowName);
    if (!fs.existsSync(workflowDir)) {
      fs.mkdirSync(workflowDir, { recursive: true });
    }

    const version = this.getNextVersion(workflowName);
    const versionFileName = `v${version}.json`;
    const versionFilePath = path.join(workflowDir, versionFileName);

    // 保存工作流定义，移除函数等不可序列化的属性
    const sanitizedDefinition = {
      ...workflowDefinition,
      steps: workflowDefinition.steps.map(step => ({
        ...step,
        func: step.func ? step.func.toString() : undefined
      }))
    };

    const versionData = {
      version,
      workflowName,
      definition: sanitizedDefinition,
      createdAt: new Date().toISOString()
    };

    fs.writeFileSync(versionFilePath, JSON.stringify(versionData, null, 2));
    return version;
  }

  getNextVersion(workflowName) {
    const workflowDir = path.join(this.storagePath, workflowName);
    if (!fs.existsSync(workflowDir)) {
      return 1;
    }

    const files = fs.readdirSync(workflowDir);
    const versions = files
      .filter(file => file.match(/^v(\d+)\.json$/))
      .map(file => parseInt(file.match(/^v(\d+)\.json$/)[1]))
      .sort((a, b) => b - a);

    return versions.length > 0 ? versions[0] + 1 : 1;
  }

  getWorkflowVersion(workflowName, version) {
    const versionFilePath = path.join(this.storagePath, workflowName, `v${version}.json`);
    if (!fs.existsSync(versionFilePath)) {
      return null;
    }

    const data = JSON.parse(fs.readFileSync(versionFilePath, 'utf8'));
    return data;
  }

  getLatestWorkflowVersion(workflowName) {
    const workflowDir = path.join(this.storagePath, workflowName);
    if (!fs.existsSync(workflowDir)) {
      return null;
    }

    const files = fs.readdirSync(workflowDir);
    const versions = files
      .filter(file => file.match(/^v(\d+)\.json$/))
      .map(file => parseInt(file.match(/^v(\d+)\.json$/)[1]))
      .sort((a, b) => b - a);

    if (versions.length === 0) {
      return null;
    }

    return this.getWorkflowVersion(workflowName, versions[0]);
  }

  getAllWorkflowVersions(workflowName) {
    const workflowDir = path.join(this.storagePath, workflowName);
    if (!fs.existsSync(workflowDir)) {
      return [];
    }

    const files = fs.readdirSync(workflowDir);
    const versions = files
      .filter(file => file.match(/^v(\d+)\.json$/))
      .map(file => {
        const version = parseInt(file.match(/^v(\d+)\.json$/)[1]);
        return this.getWorkflowVersion(workflowName, version);
      })
      .sort((a, b) => b.version - a.version);

    return versions;
  }

  deleteWorkflowVersion(workflowName, version) {
    const versionFilePath = path.join(this.storagePath, workflowName, `v${version}.json`);
    if (fs.existsSync(versionFilePath)) {
      fs.unlinkSync(versionFilePath);
    }
  }

  deleteAllWorkflowVersions(workflowName) {
    const workflowDir = path.join(this.storagePath, workflowName);
    if (fs.existsSync(workflowDir)) {
      const files = fs.readdirSync(workflowDir);
      for (const file of files) {
        if (file.match(/^v(\d+)\.json$/)) {
          fs.unlinkSync(path.join(workflowDir, file));
        }
      }
    }
  }

  listWorkflows() {
    const workflows = [];
    if (fs.existsSync(this.storagePath)) {
      const dirs = fs.readdirSync(this.storagePath, { withFileTypes: true })
        .filter(dir => dir.isDirectory())
        .map(dir => dir.name);
      
      for (const workflowName of dirs) {
        const latestVersion = this.getLatestWorkflowVersion(workflowName);
        workflows.push({
          name: workflowName,
          latestVersion: latestVersion ? latestVersion.version : null,
          versionsCount: this.getAllWorkflowVersions(workflowName).length
        });
      }
    }
    return workflows;
  }
}

module.exports = VersionManager;
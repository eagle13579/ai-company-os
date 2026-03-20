const express = require('express');
const bodyParser = require('body-parser');
const WorkflowEngine = require('./workflow_engine');
const StepManager = require('./step_manager');
const ExecutionMonitor = require('./execution_monitor');
const Persistence = require('./persistence');
const VersionManager = require('./version_manager');
const PluginManager = require('./plugin_manager');
const Auth = require('./auth');

class ApiServer {
  constructor(port = 3000) {
    this.port = port;
    this.app = express();
    this.auth = new Auth();
    this.setupMiddleware();
    this.setupRoutes();
    this.initializeWorkflowEngine();
  }

  setupMiddleware() {
    this.app.use(bodyParser.json());
    this.app.use(bodyParser.urlencoded({ extended: true }));
    this.app.use((req, res, next) => {
      res.header('Access-Control-Allow-Origin', '*');
      res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
      res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
      if (req.method === 'OPTIONS') {
        return res.status(200).end();
      }
      next();
    });
  }

  initializeWorkflowEngine() {
    const stepManager = new StepManager();
    const persistence = new Persistence();
    const executionMonitor = new ExecutionMonitor(persistence);
    const versionManager = new VersionManager(persistence);
    const pluginManager = new PluginManager();

    this.workflowEngine = new WorkflowEngine(
      stepManager,
      executionMonitor,
      persistence,
      versionManager,
      pluginManager
    );
  }

  setupRoutes() {
    // 认证路由
    this.app.post('/api/auth/register', this.register.bind(this));
    this.app.post('/api/auth/login', this.login.bind(this));

    // 工作流管理（需要用户权限）
    this.app.post('/api/workflows', this.auth.authorize('user'), this.createWorkflow.bind(this));
    this.app.get('/api/workflows', this.auth.authorize('user'), this.getAllWorkflows.bind(this));
    this.app.get('/api/workflows/:id', this.auth.authorize('user'), this.getWorkflow.bind(this));
    this.app.post('/api/workflows/:id/start', this.auth.authorize('user'), this.startWorkflow.bind(this));
    this.app.post('/api/workflows/:id/pause', this.auth.authorize('user'), this.pauseWorkflow.bind(this));
    this.app.post('/api/workflows/:id/resume', this.auth.authorize('user'), this.resumeWorkflow.bind(this));
    this.app.post('/api/workflows/:id/stop', this.auth.authorize('user'), this.stopWorkflow.bind(this));
    this.app.delete('/api/workflows/:id', this.auth.authorize('admin'), this.deleteWorkflow.bind(this));

    // 工作流版本管理（需要用户权限）
    this.app.get('/api/versions', this.auth.authorize('user'), this.getWorkflowVersions.bind(this));
    this.app.get('/api/versions/:name', this.auth.authorize('user'), this.getWorkflowVersions.bind(this));
    this.app.post('/api/versions/:name/:version', this.auth.authorize('user'), this.createWorkflowFromVersion.bind(this));

    // 监控和指标（需要管理员权限）
    this.app.get('/api/monitoring/workflows', this.auth.authorize('admin'), this.getWorkflowStatuses.bind(this));
    this.app.get('/api/monitoring/logs', this.auth.authorize('admin'), this.getLogs.bind(this));
    this.app.get('/api/monitoring/alerts', this.auth.authorize('admin'), this.getAlerts.bind(this));
    this.app.get('/api/monitoring/metrics', this.auth.authorize('admin'), this.getMetrics.bind(this));
    this.app.get('/api/monitoring/health', this.auth.authorize('admin'), this.getHealthStatus.bind(this));

    // 插件管理（需要管理员权限）
    this.app.get('/api/plugins', this.auth.authorize('admin'), this.getPlugins.bind(this));
    this.app.post('/api/plugins', this.auth.authorize('admin'), this.registerPlugin.bind(this));

    // 用户管理（需要管理员权限）
    this.app.get('/api/users', this.auth.authorize('admin'), this.getUsers.bind(this));
    this.app.put('/api/users/:username/role', this.auth.authorize('admin'), this.updateUserRole.bind(this));
    this.app.delete('/api/users/:username', this.auth.authorize('admin'), this.deleteUser.bind(this));

    // 健康检查（公开）
    this.app.get('/health', this.healthCheck.bind(this));
  }

  async createWorkflow(req, res) {
    try {
      const { name, steps } = req.body;
      const workflow = await this.workflowEngine.createWorkflow(name, steps);
      res.status(201).json(workflow);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async getAllWorkflows(req, res) {
    try {
      const workflows = this.workflowEngine.getAllWorkflows();
      res.json(workflows);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async getWorkflow(req, res) {
    try {
      const workflow = this.workflowEngine.getWorkflow(req.params.id);
      if (!workflow) {
        return res.status(404).json({ error: 'Workflow not found' });
      }
      res.json(workflow);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async startWorkflow(req, res) {
    try {
      const workflow = await this.workflowEngine.startWorkflow(req.params.id);
      res.json(workflow);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async pauseWorkflow(req, res) {
    try {
      const workflow = this.workflowEngine.pauseWorkflow(req.params.id);
      res.json(workflow);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async resumeWorkflow(req, res) {
    try {
      const workflow = this.workflowEngine.resumeWorkflow(req.params.id);
      res.json(workflow);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async stopWorkflow(req, res) {
    try {
      const workflow = this.workflowEngine.stopWorkflow(req.params.id);
      res.json(workflow);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async deleteWorkflow(req, res) {
    try {
      // 这里可以添加删除逻辑
      res.status(204).end();
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async getWorkflowVersions(req, res) {
    try {
      const { name } = req.params;
      // 这里可以添加获取版本的逻辑
      res.json([]);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async createWorkflowFromVersion(req, res) {
    try {
      const { name, version } = req.params;
      const workflow = this.workflowEngine.createWorkflowFromVersion(name, version);
      res.status(201).json(workflow);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async getWorkflowStatuses(req, res) {
    try {
      const statuses = this.workflowEngine.executionMonitor.getAllWorkflowsStatus();
      res.json(statuses);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async getLogs(req, res) {
    try {
      const { limit, level } = req.query;
      const logs = this.workflowEngine.executionMonitor.getLogs(parseInt(limit) || 100, level);
      res.json(logs);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async getAlerts(req, res) {
    try {
      const { limit, level } = req.query;
      const alerts = this.workflowEngine.executionMonitor.getAlerts(parseInt(limit) || 100, level);
      res.json(alerts);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async getMetrics(req, res) {
    try {
      const metrics = this.workflowEngine.executionMonitor.getMetrics();
      res.json(metrics);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async getHealthStatus(req, res) {
    try {
      const health = this.workflowEngine.executionMonitor.getHealthStatus();
      res.json(health);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async getPlugins(req, res) {
    try {
      // 这里可以添加获取插件的逻辑
      res.json([]);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async registerPlugin(req, res) {
    try {
      // 这里可以添加注册插件的逻辑
      res.status(201).json({});
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async healthCheck(req, res) {
    try {
      const health = this.workflowEngine.executionMonitor.getHealthStatus();
      res.json({
        status: health.status,
        timestamp: new Date(),
        service: 'workflow-engine-api'
      });
    } catch (error) {
      res.status(500).json({
        status: 'unhealthy',
        error: error.message
      });
    }
  }

  async register(req, res) {
    try {
      const { username, password, role } = req.body;
      const user = await this.auth.register(username, password, role);
      res.status(201).json(user);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async login(req, res) {
    try {
      const { username, password } = req.body;
      const result = await this.auth.login(username, password);
      res.json(result);
    } catch (error) {
      res.status(401).json({ error: error.message });
    }
  }

  async getUsers(req, res) {
    try {
      const users = this.auth.getUsers();
      res.json(users);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async updateUserRole(req, res) {
    try {
      const { username } = req.params;
      const { role } = req.body;
      const user = this.auth.updateUserRole(username, role);
      res.json(user);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async deleteUser(req, res) {
    try {
      const { username } = req.params;
      const result = this.auth.deleteUser(username);
      res.json(result);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  start() {
    return new Promise((resolve) => {
      this.server = this.app.listen(this.port, () => {
        console.log(`API Server running on port ${this.port}`);
        resolve();
      });
    });
  }

  stop() {
    return new Promise((resolve) => {
      if (this.server) {
        this.server.close(() => {
          console.log('API Server stopped');
          resolve();
        });
      } else {
        resolve();
      }
    });
  }
}

module.exports = ApiServer;
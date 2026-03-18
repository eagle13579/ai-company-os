# AI Company OS

AI数字公司操作系统 - 一个基于FastAPI的智能公司管理系统

## 项目概览

AI Company OS 是一个基于 FastAPI 构建的智能公司管理系统，旨在提供完整的公司运营管理功能，包括：

- 员工管理
- 项目管理
- 任务分配
- 资源管理
- 数据分析
- 智能决策支持

## 技术栈

- **后端框架**：FastAPI
- **数据库**：PostgreSQL
- **缓存**：Redis
- **认证**：JWT
- **容器化**：Docker
- **CI/CD**：GitHub Actions

## 目录结构

```
ai-company-os/
├── agents/         # AI 代理模块
├── core/           # 核心功能模块
├── elasticsearch/  # 搜索引擎集成
├── gateway/        # 网关模块
│   ├── access/     # 访问控制
│   ├── agent/      # 代理网关
│   ├── data/       # 数据网关
│   ├── model/      # 模型网关
│   ├── task/       # 任务网关
│   └── tool/       # 工具网关
├── memory/         # 内存管理模块
├── models/         # 模型定义
├── registry/       # 注册中心
├── tools/          # 工具模块
├── .github/        # GitHub 配置
│   └── workflows/  # CI/CD 工作流
├── .pre-commit-config.yaml  # pre-commit 配置
├── .gitignore      # Git 忽略文件
├── requirements.txt  # 依赖管理
└── README.md       # 项目说明
```

## 快速开始

### 环境要求

- Python 3.10+
- PostgreSQL 14+
- Redis 7+
- Docker (可选)

### 安装步骤

1. **克隆项目**
   ```bash
   git clone https://github.com/eagle13579/ai-company-os.git
   cd ai-company-os
   ```

2. **创建虚拟环境**
   ```bash
   # Windows
   python -m venv venv
   venv\Scripts\activate
   
   # macOS/Linux
   python3 -m venv venv
   source venv/bin/activate
   ```

3. **安装依赖**
   ```bash
   pip install --upgrade pip
   pip install -r requirements.txt
   ```

4. **配置环境变量**
   创建 `.env` 文件并配置以下环境变量：
   ```env
   # 数据库连接
   DATABASE_URL=postgresql://postgres:password@localhost:5432/ai_company_os
   
   # Redis连接
   REDIS_URL=redis://localhost:6379/0
   
   # JWT密钥
   SECRET_KEY=your-secret-key
   ALGORITHM=HS256
   ACCESS_TOKEN_EXPIRE_MINUTES=30
   ```

5. **运行应用**
   ```bash
   uvicorn main:app --host 0.0.0.0 --port 8000 --reload
   ```

6. **访问API文档**
   打开浏览器访问：`http://localhost:8000/docs`

## 开发指南

### 代码质量

项目使用以下工具确保代码质量：

- **black**：代码格式化
- **isort**：导入排序
- **flake8**：代码风格检查
- **mypy**：类型检查
- **bandit**：安全检查

### 提交规范

使用语义化提交信息：

- `feat: 添加新功能`
- `fix: 修复 bug`
- `chore: 维护任务`
- `docs: 文档更新`
- `refactor: 代码重构`
- `test: 测试相关`
- `style: 代码风格`

### 分支管理

- `main`：生产分支
- `develop`：开发分支
- `feature/*`：功能分支
- `release/*`：发布分支
- `hotfix/*`：热修复分支

## 测试

运行测试：
```bash
python -m pytest --verbose --cov=. --cov-report=xml
```

## CI/CD

项目使用 GitHub Actions 进行 CI/CD：

- **代码质量检查**：运行代码质量工具
- **测试执行**：运行测试并生成覆盖率报告
- **Docker构建**：构建并推送 Docker 镜像
- **部署**：根据分支自动部署到不同环境

## 贡献指南

1. **Fork 项目**
2. **创建功能分支**：`git checkout -b feature/your-feature`
3. **提交更改**：`git commit -m "feat: 添加新功能"`
4. **推送到远程**：`git push origin feature/your-feature`
5. **创建 PR**：在 GitHub 上创建 Pull Request

## 许可证

MIT License

## 联系方式

- 项目地址：https://github.com/eagle13579/ai-company-os
- 问题反馈：https://github.com/eagle13579/ai-company-os/issues
# AI 数字公司操作系统 - 开发指南

## 1. 环境搭建

### 1.1 系统要求

- Python 3.10 或更高版本
- Docker 和 Docker Compose
- Git

### 1.2 安装步骤

1. **克隆仓库**
   ```bash
   git clone <repository-url>
   cd ai-company-os
   ```

2. **创建虚拟环境**
   ```bash
   python -m venv venv
   # Windows
   venv\Scripts\activate
   # Linux/Mac
   source venv/bin/activate
   ```

3. **安装依赖**
   ```bash
   pip install -r requirements.txt
   ```

4. **配置环境变量**
   - 复制 `.env.example` 文件为 `.env`
   - 根据实际情况修改 `.env` 文件中的配置

5. **启动服务**
   ```bash
   # 使用 Docker Compose 启动所有服务
   docker-compose up -d
   
   # 或仅启动应用
   uvicorn main:app --host 0.0.0.0 --port 8000 --reload
   ```

## 2. 项目结构

```
ai-company-os/
├── app/                # 应用代码
│   ├── api/            # API 路由和端点
│   │   ├── __init__.py
│   │   ├── users.py    # 用户相关 API
│   │   └── items.py    # 物品相关 API
│   ├── models/         # 数据库模型
│   │   ├── __init__.py
│   │   ├── user.py     # 用户模型
│   │   └── item.py     # 物品模型
│   ├── schemas/        # 数据验证和序列化
│   │   ├── __init__.py
│   │   ├── user.py     # 用户相关 schema
│   │   └── item.py     # 物品相关 schema
│   ├── __init__.py
│   └── database.py     # 数据库连接和会话管理
├── docs/               # 文档
│   ├── architecture.md # 架构设计文档
│   └── development.md  # 开发指南
├── tests/              # 测试代码
│   ├── __init__.py
│   ├── conftest.py     # 测试配置
│   ├── test_api.py     # API 测试
│   └── test_models.py  # 模型测试
├── .github/            # GitHub 配置
│   └── workflows/      # CI/CD 工作流
├── .env.example        # 环境变量示例
├── .flake8             # Flake8 配置
├── .gitignore          # Git 忽略文件
├── .pre-commit-config.yaml # Pre-commit 配置
├── CI-CD-README.md     # CI/CD 说明
├── Dockerfile          # Docker 构建文件
├── README.md           # 项目说明
├── docker-compose.yml  # Docker Compose 配置
├── main.py             # 应用入口
├── package.json        # 前端依赖（如果有）
├── pylintrc            # Pylint 配置
├── prometheus.yml      # Prometheus 配置
├── grafana.ini         # Grafana 配置
└── requirements.txt    # Python 依赖
```

## 3. 开发流程

### 3.1 代码风格

- 遵循 PEP 8 代码风格规范
- 使用 Black 进行代码格式化
- 使用 isort 进行导入排序
- 使用 Flake8 进行代码检查
- 使用 mypy 进行类型检查

### 3.2 提交规范

- 提交信息应清晰明了
- 遵循 Conventional Commits 规范
- 提交前运行 pre-commit 钩子

### 3.3 测试流程

- 编写单元测试和集成测试
- 确保测试覆盖率不低于 80%
- 提交代码前运行测试

### 3.4 分支策略

- `main`：主分支，用于生产部署
- `develop`：开发分支，集成新功能
- `feature/*`：功能分支，开发新功能
- `release/*`：发布分支，准备发布
- `hotfix/*`：热修复分支，修复生产问题

## 4. API 开发

### 4.1 创建新 API 端点

1. 在 `app/api` 目录下创建新的路由文件
2. 定义路由和处理函数
3. 在 `main.py` 中注册路由
4. 编写测试用例

### 4.2 数据模型

1. 在 `app/models` 目录下创建新的模型文件
2. 定义数据库表结构
3. 在 `app/schemas` 目录下创建对应的 schema
4. 编写测试用例

## 5. 部署流程

### 5.1 本地开发

- 使用 `uvicorn main:app --reload` 启动开发服务器
- 访问 `http://localhost:8000/docs` 查看 API 文档

### 5.2 Docker 部署

- 使用 `docker-compose up -d` 启动所有服务
- 访问 `http://localhost:8000/docs` 查看 API 文档
- 访问 `http://localhost:3000` 查看 Grafana 监控
- 访问 `http://localhost:9090` 查看 Prometheus 指标

### 5.3 CI/CD 部署

- 推送代码到 GitHub 触发 CI/CD 流程
- CI/CD 会自动进行代码质量检查、测试和构建
- 构建成功后会自动部署到相应环境

## 6. 监控与调试

### 6.1 日志管理

- 应用日志：查看容器日志 `docker logs <container-name>`
- 系统日志：查看 Prometheus 和 Grafana 日志

### 6.2 性能监控

- 使用 Grafana 查看系统性能指标
- 使用 Prometheus 查询详细指标

### 6.3 常见问题排查

- 数据库连接问题：检查数据库服务是否运行，连接字符串是否正确
- API 响应慢：检查数据库查询，考虑添加索引或缓存
- 服务启动失败：查看容器日志，检查依赖是否正确安装

## 7. 安全最佳实践

- 不要在代码中硬编码敏感信息
- 使用环境变量管理配置
- 对用户输入进行验证
- 使用 HTTPS 协议
- 定期更新依赖包
- 实施访问控制

## 8. 扩展与集成

### 8.1 添加新功能

1. 分析需求
2. 设计 API 和数据模型
3. 实现代码
4. 编写测试
5. 集成到现有系统

### 8.2 集成第三方服务

1. 安装必要的依赖
2. 配置服务连接信息
3. 实现集成代码
4. 编写测试

## 9. 故障处理

### 9.1 数据库故障

- 定期备份数据库
- 实现数据库主从复制
- 制定灾难恢复计划

### 9.2 服务故障

- 实现服务健康检查
- 配置自动重启机制
- 部署多个实例实现高可用

## 10. 版本管理

- 使用 Git 进行版本控制
- 遵循语义化版本规范
- 定期发布版本更新
- 维护更新日志

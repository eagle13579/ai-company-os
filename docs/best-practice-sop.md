# AI数字公司项目开发与CI/CD最佳实践SOP

## 1. 项目初始化与环境配置

### 1.1 克隆项目
```bash
git clone https://github.com/eagle13579/ai-company-os.git
cd ai-company-os
```

### 1.2 虚拟环境配置
```bash
# 创建虚拟环境
python -m venv venv

# 激活虚拟环境
# Windows
env\Scripts\activate
# macOS/Linux
source venv/bin/activate

# 升级pip
pip install --upgrade pip
```

### 1.3 安装依赖
```bash
pip install -r requirements.txt
pip install "pydantic[email]"  # 确保安装email-validator
```

## 2. 代码质量工具配置

### 2.1 安装代码质量工具
```bash
pip install black isort flake8 mypy pre-commit
```

### 2.2 配置pre-commit
创建 `.pre-commit-config.yaml` 文件：
```yaml
repos:
- repo: https://github.com/psf/black
  rev: 24.3.0
  hooks:
  - id: black
- repo: https://github.com/PyCQA/isort
  rev: 5.13.2
  hooks:
  - id: isort
- repo: https://github.com/pre-commit/mirrors-mypy
  rev: v1.10.0
  hooks:
  - id: mypy
```

安装pre-commit钩子：
```bash
pre-commit install
```

## 3. 测试配置与运行

### 3.1 运行测试
```bash
python -m pytest --verbose --cov=. --cov-report=xml
```

### 3.2 测试覆盖率分析
- 查看 `coverage.xml` 文件了解测试覆盖率
- 重点关注未覆盖的代码，添加相应的测试用例

## 4. CI/CD配置最佳实践

### 4.1 GitHub Actions配置

#### 4.1.1 代码质量检查
- 运行black、isort、flake8、mypy、bandit等工具
- 确保代码符合PEP8规范

#### 4.1.2 测试执行
- 运行pytest并生成覆盖率报告
- 上传覆盖率到Codecov（可选）

#### 4.1.3 Docker构建与推送
- 只有在配置了Docker Hub密钥时才执行
- 推送镜像到Docker Hub

### 4.2 GitHub仓库设置

#### 4.2.1 添加Docker Hub密钥
1. 登录GitHub仓库 → Settings → Secrets and variables → Actions
2. 添加以下密钥：
   - `DOCKERHUB_USERNAME`: Docker Hub用户名
   - `DOCKERHUB_TOKEN`: Docker Hub个人访问令牌

#### 4.2.2 分支保护规则
- 对main和develop分支设置保护
- 要求CI/CD通过才能合并

## 5. 开发工作流

### 5.1 分支管理
- `main`: 生产分支
- `develop`: 开发分支
- `feature/*`: 功能分支
- `release/*`: 发布分支
- `hotfix/*`: 热修复分支

### 5.2 开发流程
1. 从develop分支创建feature分支
2. 完成功能开发
3. 运行代码质量工具和测试
4. 提交代码并推送到远程
5. 创建PR到develop分支
6. CI/CD通过后合并

## 6. Docker配置

### 6.1 Dockerfile最佳实践
```dockerfile
FROM python:3.10-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

### 6.2 docker-compose配置
```yaml
version: '3.8'
services:
  app:
    build: .
    ports:
      - "8000:8000"
    environment:
      - DATABASE_URL=postgresql://postgres:password@db:5432/ai_company_os
    depends_on:
      - db

  db:
    image: postgres:14
    environment:
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=password
      - POSTGRES_DB=ai_company_os
    ports:
      - "5432:5432"
```

## 7. 常见问题与解决方案

### 7.1 依赖问题
- **问题**: 缺少email-validator
  **解决方案**: `pip install "pydantic[email]"`

- **问题**: 缺少passlib
  **解决方案**: `pip install passlib`

### 7.2 CI/CD问题
- **问题**: Docker登录失败
  **解决方案**: 配置Docker Hub密钥或修改CI/CD配置跳过Docker步骤

- **问题**: 测试失败
  **解决方案**: 运行本地测试，修复测试用例

### 7.3 Git问题
- **问题**: 非git仓库
  **解决方案**: 确保在项目根目录运行git命令

- **问题**: 推送失败
  **解决方案**: 检查SSH密钥配置，确保有推送权限

## 8. 部署流程

### 8.1 测试环境部署
- 当代码合并到develop分支时自动部署
- 用于集成测试和功能验证

### 8.2 预生产环境部署
- 当创建release分支时自动部署
- 用于最终测试和用户验收

### 8.3 生产环境部署
- 当代码合并到main分支时自动部署
- 用于正式上线

## 9. 监控与维护

### 9.1 日志监控
- 配置应用日志记录
- 使用ELK或其他日志管理工具

### 9.2 性能监控
- 配置Prometheus和Grafana
- 监控API响应时间和系统资源使用

## 10. 安全最佳实践

### 10.1 依赖安全
- 定期运行`pip-audit`检查依赖安全
- 及时更新有安全漏洞的依赖

### 10.2 代码安全
- 运行`bandit`检查代码安全
- 避免硬编码敏感信息
- 使用环境变量存储配置

### 10.3 部署安全
- 使用HTTPS
- 配置适当的防火墙规则
- 定期更新系统和依赖

## 11. 总结

本SOP提供了AI数字公司项目的完整开发和CI/CD最佳实践，包括：
- 环境配置与依赖管理
- 代码质量工具配置
- 测试与覆盖率分析
- CI/CD配置与优化
- Docker容器化
- 部署流程与监控
- 安全最佳实践

遵循此SOP可以确保项目的代码质量、测试覆盖率和部署可靠性，同时提高开发效率和系统稳定性。
# CI/CD 集成配置

## 状态检查配置

### 代码质量检查
- **flake8**: 检查代码风格和语法错误
- **pylint**: 进行更全面的代码质量分析
- **bandit**: 进行安全扫描，检测潜在的安全漏洞

### 测试检查
- **pytest**: 运行单元测试

### 构建检查
- **pip install**: 验证依赖安装
- **pip-audit**: 检查依赖安全性

### 部署检查
- **环境配置验证**: 确保部署环境配置正确

## 分支策略与 CI/CD 流程

### main 分支
- **触发条件**: 推送到 main 分支
- **执行流程**: 运行所有检查，通过后自动部署到生产环境

### develop 分支
- **触发条件**: 推送到 develop 分支
- **执行流程**: 运行所有检查，通过后自动部署到测试环境

### feature 分支
- **触发条件**: 推送到 feature/* 分支
- **执行流程**: 运行基本测试，不部署

### release 分支
- **触发条件**: 推送到 release/* 分支
- **执行流程**: 运行所有检查，通过后部署到预生产环境

### hotfix 分支
- **触发条件**: 推送到 hotfix/* 分支
- **执行流程**: 运行关键测试，快速部署到生产环境

## 配置文件

- `.github/workflows/ci-cd.yml`: GitHub Actions 工作流配置
- `.flake8`: flake8 代码风格检查配置
- `pylintrc`: pylint 代码质量检查配置

## 本地测试

### 安装依赖
```bash
pip install flake8 pylint bandit pytest
```

### 运行代码质量检查
```bash
# 运行 flake8
python -m flake8 .

# 运行 pylint
python -m pylint $(find . -name "*.py" -path "./venv" -prune -o -name "*.py" -print)

# 运行 bandit
python -m bandit -r .
```

### 运行测试
```bash
python -m pytest
```

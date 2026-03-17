# 手把手开发最佳实践 SOP

## 1. 环境准备

### 1.1 安装 Git

**Windows**：
1. 访问 [Git官网](https://git-scm.com/download/win)
2. 下载并运行安装程序
3. 按照默认选项安装

**验证安装**：
```bash
git --version
```

### 1.2 安装 Python

**Windows**：
1. 访问 [Python官网](https://www.python.org/downloads/)
2. 下载 Python 3.10 或更高版本
3. 运行安装程序，勾选 "Add Python to PATH"

**验证安装**：
```bash
python --version
pip --version
```

### 1.3 安装 VS Code（推荐）

1. 访问 [VS Code官网](https://code.visualstudio.com/)
2. 下载并安装
3. 安装 Python 扩展

## 2. 项目初始化

### 2.1 克隆仓库

```bash
# 克隆远程仓库
git clone <repository-url>
cd ai-company-os

# 查看当前状态
git status
```

### 2.2 创建虚拟环境

```bash
# 创建虚拟环境
python -m venv venv

# 激活虚拟环境
# Windows
venv\Scripts\activate
# Linux/Mac
source venv/bin/activate
```

### 2.3 安装依赖

```bash
# 自动安装所有依赖
pip install -r requirements.txt

# 验证安装
pip list
```

## 3. 开发流程

### 3.1 同步远程仓库

```bash
# 切换到主分支
git checkout main

# 拉取最新代码
git pull origin main
```

### 3.2 创建功能分支

```bash
# 创建并切换到新分支
git checkout -b feature/<feature-name>

# 示例：创建用户认证功能分支
git checkout -b feature/user-authentication
```

### 3.3 开发代码

**示例：创建新的API路由**

1. **创建新文件**：`app/api/new_feature.py`
   ```python
   from fastapi import APIRouter, Depends
   from sqlalchemy.orm import Session
   from app.database import get_db
   from app.schemas.new_feature import NewFeatureCreate, NewFeatureResponse

   router = APIRouter()

   @router.post("/", response_model=NewFeatureResponse)
   def create_new_feature(
       feature: NewFeatureCreate,
       db: Session = Depends(get_db)
   ):
       # 实现逻辑
       return {"id": 1, "name": feature.name, "description": feature.description}

   @router.get("/", response_model=list[NewFeatureResponse])
   def get_new_features(
       skip: int = 0,
       limit: int = 100,
       db: Session = Depends(get_db)
   ):
       # 实现逻辑
       return [{"id": 1, "name": "Test", "description": "Test feature"}]
   ```

2. **更新主文件**：`main.py`
   ```python
   from app.api import users, items, new_feature

   # 注册路由
   app.include_router(new_feature.router, prefix="/api/new-feature", tags=["new-feature"])
   ```

3. **创建Schema**：`app/schemas/new_feature.py`
   ```python
   from pydantic import BaseModel
   from datetime import datetime

   class NewFeatureBase(BaseModel):
       name: str
       description: str

   class NewFeatureCreate(NewFeatureBase):
       pass

   class NewFeatureResponse(NewFeatureBase):
       id: int
       created_at: datetime

       class Config:
           from_attributes = True
   ```

### 3.4 本地测试

```bash
# 运行测试
python -m pytest tests/ -v

# 检查代码质量
black .
isort .
flake8 .
mypy .

# 启动开发服务器
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

### 3.5 提交代码

```bash
# 查看修改状态
git status

# 添加修改的文件
git add .

# 提交代码
git commit -m "feat: add new feature API

- add POST /api/new-feature endpoint
- add GET /api/new-feature endpoint
- add schemas for new feature
- add unit tests"
```

### 3.6 推送到远程仓库

```bash
# 推送分支到远程仓库
git push origin feature/<feature-name>

# 示例
git push origin feature/new-feature
```

## 4. Pull Request 流程

### 4.1 创建 Pull Request

1. 访问 GitHub 仓库页面
2. 点击 "Pull requests" 标签
3. 点击 "New pull request"
4. 选择：
   - base: `main`
   - compare: `feature/<feature-name>`
5. 点击 "Create pull request"

### 4.2 填写 PR 信息

**标题**：
```
feat: 添加新功能API
```

**描述**：
```markdown
## 功能描述
添加新功能的API端点，包括创建和查询功能。

## 修改内容
- [x] 添加 `app/api/new_feature.py` 文件
- [x] 更新 `main.py` 注册路由
- [x] 添加 `app/schemas/new_feature.py` 文件
- [x] 编写单元测试
- [x] 代码质量检查通过

## 测试
- 所有本地测试通过
- API 文档可访问：http://localhost:8000/docs

## 关联 Issue
Closes #123
```

### 4.3 代码审查

1. 等待团队成员审查
2. 处理审查意见：
   ```bash
   # 修复问题后提交
git add .
git commit -m "fix: address review comments"
git push origin feature/<feature-name>
   ```

### 4.4 合并 PR

1. 确保所有审查通过
2. 确保所有 CI/CD 检查通过
3. 点击 "Merge pull request"
4. 选择 "Squash and merge"
5. 点击 "Confirm merge"

## 5. 部署流程

### 5.1 本地构建

```bash
# 构建 Docker 镜像
docker build -t ai-company-os .

# 运行容器
docker run -p 8000:8000 ai-company-os
```

### 5.2 Docker Compose 部署

```bash
# 启动所有服务
docker-compose up -d

# 查看服务状态
docker-compose ps

# 查看日志
docker-compose logs -f
```

### 5.3 生产部署

1. 配置生产环境变量
2. 使用 CI/CD 自动部署
3. 监控服务状态

## 6. 常见问题处理

### 6.1 依赖安装失败

```bash
# 升级 pip
python -m pip install --upgrade pip

# 重新安装依赖
pip install -r requirements.txt
```

### 6.2 合并冲突

```bash
# 查看冲突文件
git status

# 手动编辑冲突文件
# 标记为已解决
git add <conflict-file>

# 完成合并
git commit
```

### 6.3 测试失败

```bash
# 查看测试失败详情
python -m pytest tests/ -v

# 修复测试
# 重新运行测试
python -m pytest tests/ -v
```

### 6.4 CI/CD 检查失败

1. 查看 GitHub Actions 日志
2. 定位问题原因
3. 修复问题
4. 重新推送代码

## 7. 自动化工具安装

### 7.1 预提交钩子

```bash
# 安装预提交
pip install pre-commit

# 初始化预提交
pre-commit install

# 运行预提交
git add .
pre-commit run --all-files
```

### 7.2 代码质量工具

```bash
# 安装代码质量工具
pip install black isort flake8 mypy

# 运行代码质量检查
black .
isort .
flake8 .
mypy .
```

### 7.3 测试工具

```bash
# 安装测试工具
pip install pytest pytest-cov

# 运行测试并生成覆盖率报告
python -m pytest tests/ -v --cov=. --cov-report=html
```

## 8. 开发工具推荐

### 8.1 VS Code 扩展

- **Python**：提供代码智能提示
- **GitLens**：增强 Git 功能
- **Docker**：Docker 集成
- **REST Client**：测试 API 端点
- **Prettier**：代码格式化

### 8.2 命令行工具

- **GitHub CLI**：命令行操作 GitHub
- **Docker CLI**：容器管理
- **Postman**：API 测试
- **htop**：系统监控

## 9. 最佳实践总结

1. **环境隔离**：使用虚拟环境
2. **代码质量**：定期运行代码质量检查
3. **测试驱动**：先写测试，再实现功能
4. **版本控制**：遵循 Git 最佳实践
5. **文档同步**：及时更新文档
6. **安全意识**：注意代码安全
7. **团队协作**：遵循 PR 流程
8. **持续集成**：利用 CI/CD 自动化

## 10. 快速参考命令

### 10.1 Git 命令

```bash
# 查看状态
git status

# 查看历史
git log --oneline

# 分支操作
git branch
git checkout <branch>
git merge <branch>

# 提交操作
git add .
git commit -m "message"
git push origin <branch>

# 撤销操作
git checkout -- <file>
git reset HEAD <file>
git stash
git stash pop
```

### 10.2 Python 命令

```bash
# 虚拟环境
python -m venv venv
venv\Scripts\activate

# 依赖管理
pip install -r requirements.txt
pip freeze > requirements.txt

# 运行应用
uvicorn main:app --reload

# 运行测试
python -m pytest tests/ -v
```

### 10.3 Docker 命令

```bash
# 构建镜像
docker build -t <image-name> .

# 运行容器
docker run -p 8000:8000 <image-name>

# Docker Compose
docker-compose up -d
docker-compose down
docker-compose logs -f
```

## 11. 结论

本 SOP 提供了从环境准备到代码部署的完整流程，帮助您规范开发过程，提高代码质量和团队协作效率。

**记住**：
- 保持代码整洁
- 编写充分的测试
- 遵循 Git 最佳实践
- 及时沟通和协作
- 持续学习和改进

祝您开发顺利！

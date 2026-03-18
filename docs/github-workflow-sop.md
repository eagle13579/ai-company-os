# GitHub 交互开发最佳实践 SOP

## 1. 概述

本标准操作程序（SOP）旨在规范团队在GitHub上的开发流程，确保代码质量、提高协作效率、降低合并冲突风险。

## 2. 前置条件

- 已安装Git
- 已配置GitHub账户
- 已克隆项目仓库
- 已安装项目依赖

## 3. 开发流程

### 3.1 同步远程仓库（每次开发前）

```bash
# 切换到主分支
git checkout main

# 拉取最新代码
git pull origin main
```

**注意**：每次开始新功能开发前，务必确保本地代码是最新的。

### 3.2 创建功能分支

```bash
# 创建并切换到新分支，分支命名规范：feature/<功能描述>
git checkout -b feature/user-authentication
```

**分支命名规范**：
- 功能分支：`feature/<功能名称>`
- 修复分支：`fix/<问题描述>`
- 发布分支：`release/<版本号>`
- 热修复分支：`hotfix/<问题描述>`

### 3.3 开发代码

1. 按需求开发功能
2. 遵循项目代码规范
3. 编写相应的测试用例
4. 本地运行测试确保通过

**示例：创建API路由**

```python
# 在 app/api/ 目录下创建新文件或修改现有文件

# 添加新的路由端点
@router.get("/new-endpoint")
def new_endpoint():
    return {"message": "This is a new endpoint"}
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
```

**确保所有测试通过后再提交代码**。

### 3.5 提交代码

```bash
# 查看修改状态
git status

# 添加修改的文件
git add .
# 或添加特定文件
git add app/api/new_file.py tests/test_new_file.py

# 提交代码，使用规范的提交信息
git commit -m "feat: add user authentication endpoints

- add login endpoint
- add register endpoint
- add JWT token generation
- add unit tests"
```

**提交信息规范**（遵循Conventional Commits）：
- `feat:`：新功能
- `fix:`：修复bug
- `docs:`：文档更新
- `style:`：代码格式调整
- `refactor:`：重构
- `test:`：测试相关
- `chore:`：构建/工具链相关

### 3.6 推送到远程仓库

```bash
# 推送分支到远程仓库
git push origin feature/user-authentication
```

## 4. Pull Request 流程

### 4.1 创建Pull Request

1. 访问GitHub仓库页面
2. 点击 "Pull requests" 标签
3. 点击 "New pull request"
4. 选择：
   - base: `main`
   - compare: `feature/user-authentication`
5. 点击 "Create pull request"

### 4.2 填写PR信息

**标题**：简洁明了的功能描述
```
feat: 添加用户认证功能
```

**描述**：详细说明本次修改的内容
```markdown
## 功能描述
添加用户认证功能，包括登录、注册和JWT令牌管理。

## 修改内容
- [x] 添加登录端点 `/api/users/login`
- [x] 添加注册端点 `/api/users/register`
- [x] 实现JWT令牌生成和验证
- [x] 添加密码哈希功能
- [x] 编写单元测试
- [x] 更新API文档

## 测试
- 所有本地测试通过
- 代码质量检查通过

## 关联Issue
Closes #123
```

### 4.3 请求代码审查

1. 在PR页面右侧 "Reviewers" 部分
2. 点击 "Request review"
3. 选择团队成员进行审查

### 4.4 代码审查

**审查者职责**：
- 检查代码质量
- 验证功能实现
- 提供改进建议
- 确保测试覆盖

**审查结果**：
- ✅ 批准：代码可以合并
- ⚠️ 需要修改：提出修改意见，修改后重新审查
- ❌ 拒绝：重大问题，需要重新设计

## 5. 代码合并流程

### 5.1 解决审查意见

```bash
# 如果有修改意见，继续在同一分支上修改
git checkout feature/user-authentication

# 修改代码后，再次提交
git add .
git commit -m "fix: address review comments"
git push origin feature/user-authentication
```

### 5.2 更新分支（如果有冲突）

```bash
# 切换到主分支
git checkout main
git pull origin main

# 切换回功能分支
git checkout feature/user-authentication

# 合并主分支
git merge main

# 解决冲突后
git add .
git commit -m "merge: resolve conflicts with main"
git push origin feature/user-authentication
```

### 5.3 合并PR

1. 确保所有审查通过
2. 确保所有CI/CD检查通过
3. 在GitHub上点击 "Merge pull request"
4. 选择合并方式：
   - **Squash and merge**：推荐，将所有提交合并为一个
   - **Rebase and merge**：保持提交历史线性
   - **Create a merge commit**：保留所有提交历史
5. 点击 "Confirm merge"

### 5.4 删除分支（合并后）

```bash
# 删除本地分支
git branch -d feature/user-authentication

# 删除远程分支（也可以在GitHub上自动删除）
git push origin --delete feature/user-authentication

# 同步远程仓库
git checkout main
git pull origin main
```

## 6. CI/CD 检查

### 6.1 自动检查项

每次推送代码或创建PR时，GitHub Actions会自动运行：
- ✅ 代码质量检查（black, isort, flake8, mypy）
- ✅ 自动化测试
- ✅ 依赖安全检查
- ✅ Docker构建（如果配置）

### 6.2 查看检查结果

1. 在PR页面查看 "Checks" 标签
2. 点击具体的检查项查看详情
3. 如果检查失败，查看错误信息并修复

## 7. 最佳实践

### 7.1 开发习惯

- **小步快跑**：频繁提交，每次提交包含一个小的功能点
- **保持更新**：定期同步远程仓库，减少合并冲突
- **写好注释**：代码注释清晰，便于他人理解
- **及时测试**：边开发边测试，不要等到最后
- **文档同步**：功能开发完成后及时更新文档

### 7.2 Git 命令速查

```bash
# 查看状态
git status

# 查看提交历史
git log --oneline

# 查看修改内容
git diff

# 撤销工作区修改
git checkout -- <file>

# 撤销暂存区修改
git reset HEAD <file>

# 修改最近的提交
git commit --amend

# 暂存当前工作
git stash
git stash pop
```

### 7.3 团队协作

- **及时沟通**：遇到问题及时与团队沟通
- **尊重审查**：认真对待审查意见
- **分享知识**：定期进行技术分享
- **保持整洁**：及时删除已合并的分支
- **遵守规范**：严格遵循本SOP

## 8. 常见问题处理

### 8.1 合并冲突

**预防**：
- 经常同步远程代码
- 避免多人同时修改同一文件
- 使用清晰的分支策略

**解决**：
1. 查看冲突文件
2. 手动编辑冲突部分
3. 标记为已解决：`git add <file>`
4. 完成合并：`git commit`

### 8.2 PR被拒绝

**处理**：
1. 仔细阅读审查意见
2. 与审查者沟通确认
3. 修改代码
4. 重新提交审查

### 8.3 CI/CD检查失败

**处理**：
1. 查看失败日志
2. 定位问题原因
3. 修复问题
4. 重新提交代码

## 9. 工具推荐

- **Git客户端**：GitHub Desktop, SourceTree, GitKraken
- **代码编辑器**：VS Code, PyCharm
- **CI/CD**：GitHub Actions（已配置）
- **代码质量**：SonarQube
- **项目管理**：GitHub Projects, Jira

## 10. 总结

遵循本SOP可以：
- ✅ 提高代码质量
- ✅ 减少合并冲突
- ✅ 加速开发流程
- ✅ 改善团队协作
- ✅ 确保项目可维护性

**记住**：流程是为了提高效率，不是为了束缚创造力。在遵循规范的同时，保持灵活和创新！

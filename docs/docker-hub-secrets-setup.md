# Docker Hub密钥配置详细指南

## 1. 前提条件

- 拥有Docker Hub账户
- 拥有GitHub仓库的管理员权限
- 已安装Git客户端

## 2. 获取Docker Hub个人访问令牌

### 2.1 登录Docker Hub
1. 打开浏览器，访问 [Docker Hub官网](https://hub.docker.com/)
2. 点击右上角的「Sign In」按钮
3. 输入你的Docker Hub用户名和密码，点击「Sign In」

### 2.2 创建个人访问令牌
1. 登录后，点击右上角的个人头像
2. 在下拉菜单中选择「Account Settings」（账户设置）
3. 在左侧菜单中选择「Security」（安全）
4. 点击「New Access Token」（新建访问令牌）按钮

### 2.3 配置令牌
1. 在「Token Description」（令牌描述）字段中输入一个描述性名称，例如「GitHub Actions」
2. 在「Access Permissions」（访问权限）部分，选择以下权限：
   - 勾选「Read & Write」（读写）权限
   - 确保其他权限根据需要选择
3. 点击「Create」（创建）按钮

### 2.4 保存令牌
1. 创建成功后，系统会显示生成的令牌
2. **重要**：复制这个令牌并保存到安全的地方，因为它只显示一次
3. 点击「Copy and close」（复制并关闭）按钮

## 3. 在GitHub仓库中配置密钥

### 3.1 访问GitHub仓库
1. 打开浏览器，访问你的GitHub仓库页面，例如：`https://github.com/eagle13579/ai-company-os`
2. 点击顶部导航栏的「Settings」（设置）选项

### 3.2 进入密钥配置页面
1. 在左侧菜单中，点击「Secrets and variables」（密钥和变量）
2. 在子菜单中选择「Actions」

### 3.3 添加Docker Hub用户名密钥
1. 点击「New repository secret」（新建仓库密钥）按钮
2. 在「Name」（名称）字段中输入：`DOCKERHUB_USERNAME`
3. 在「Secret」（密钥）字段中输入你的Docker Hub用户名
4. 点击「Add secret」（添加密钥）按钮

### 3.4 添加Docker Hub令牌密钥
1. 再次点击「New repository secret」（新建仓库密钥）按钮
2. 在「Name」（名称）字段中输入：`DOCKERHUB_TOKEN`
3. 在「Secret」（密钥）字段中粘贴刚才复制的Docker Hub个人访问令牌
4. 点击「Add secret」（添加密钥）按钮

## 4. 验证配置

### 4.1 查看已配置的密钥
1. 在「Secrets and variables」→「Actions」页面，确认以下密钥已添加：
   - `DOCKERHUB_USERNAME`
   - `DOCKERHUB_TOKEN`
2. 密钥值会被隐藏，只显示名称

### 4.2 测试CI/CD流程
1. 回到GitHub仓库的「Actions」页面
2. 点击「Run workflow」（运行工作流）按钮
3. 选择你要测试的分支（例如 `feature/gateway/access`）
4. 点击「Run workflow」按钮

### 4.3 检查构建状态
1. 在「Actions」页面，点击刚刚启动的工作流
2. 查看「build」作业的执行情况
3. 确认「Login to Docker Hub」步骤成功执行
4. 确认「Build and push Docker image」步骤成功执行

## 5. 故障排除

### 5.1 常见错误

#### 5.1.1 用户名或密码错误
- **错误信息**：`Error: Username and password required`
- **解决方案**：
  1. 检查Docker Hub用户名是否正确
  2. 确认个人访问令牌是否正确复制
  3. 重新创建令牌并更新GitHub密钥

#### 5.1.2 权限不足
- **错误信息**：`Error: denied: requested access to the resource is denied`
- **解决方案**：
  1. 确保令牌有「Read & Write」权限
  2. 确认Docker Hub账户有权限推送镜像

#### 5.1.3 令牌过期
- **错误信息**：`Error: unauthorized: authentication required`
- **解决方案**：
  1. 重新创建Docker Hub个人访问令牌
  2. 更新GitHub仓库中的`DOCKERHUB_TOKEN`密钥

## 6. 最佳实践

### 6.1 令牌管理
- **定期更新**：每3-6个月更新一次个人访问令牌
- **最小权限**：只授予必要的权限
- **安全存储**：使用密码管理器存储令牌

### 6.2 命名规范
- 密钥名称使用大写字母和下划线
- 描述性命名，便于识别用途

### 6.3 访问控制
- 只向需要的人员授予仓库密钥的访问权限
- 定期审查谁有权访问密钥

## 7. 其他配置选项

### 7.1 使用Docker Hub组织
如果你的镜像属于Docker Hub组织：
1. 在Docker Hub中为组织创建访问令牌
2. 在GitHub密钥中使用组织名称作为`DOCKERHUB_USERNAME`
3. 使用组织的访问令牌作为`DOCKERHUB_TOKEN`

### 7.2 使用其他容器注册表
如果使用其他容器注册表（如GitHub Container Registry、AWS ECR等）：
1. 参考相应注册表的文档获取访问令牌
2. 在CI/CD配置中修改登录步骤
3. 更新密钥名称以匹配相应注册表

## 8. 总结

配置Docker Hub密钥是CI/CD流程中的重要步骤，它允许GitHub Actions自动构建和推送Docker镜像。通过遵循本指南，你可以：

1. 安全地创建和管理Docker Hub个人访问令牌
2. 正确配置GitHub仓库密钥
3. 验证CI/CD流程是否正常工作
4. 解决常见的配置问题

按照这些步骤操作后，你的CI/CD流程应该能够成功登录Docker Hub并推送镜像，从而完成完整的构建和部署流程。
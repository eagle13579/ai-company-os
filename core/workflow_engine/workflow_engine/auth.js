const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

class Auth {
  constructor(secretKey = 'your-secret-key', tokenExpiration = '1h') {
    this.secretKey = secretKey;
    this.tokenExpiration = tokenExpiration;
    this.users = new Map(); // 这里可以替换为数据库存储
  }

  // 注册用户
  async register(username, password, role = 'user') {
    if (this.users.has(username)) {
      throw new Error('User already exists');
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    this.users.set(username, {
      username,
      password: hashedPassword,
      role
    });

    return { username, role };
  }

  // 用户登录
  async login(username, password) {
    const user = this.users.get(username);
    if (!user) {
      throw new Error('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new Error('Invalid credentials');
    }

    const token = jwt.sign(
      { username: user.username, role: user.role },
      this.secretKey,
      { expiresIn: this.tokenExpiration }
    );

    return { token, user: { username: user.username, role: user.role } };
  }

  // 验证token
  verifyToken(token) {
    try {
      return jwt.verify(token, this.secretKey);
    } catch (error) {
      throw new Error('Invalid token');
    }
  }

  // 授权中间件
  authorize(requiredRole = 'user') {
    return (req, res, next) => {
      try {
        const authHeader = req.headers.authorization;
        if (!authHeader) {
          return res.status(401).json({ error: 'Authorization header required' });
        }

        const token = authHeader.split(' ')[1];
        if (!token) {
          return res.status(401).json({ error: 'Token required' });
        }

        const decoded = this.verifyToken(token);
        
        // 检查角色权限
        if (decoded.role !== 'admin' && decoded.role !== requiredRole) {
          return res.status(403).json({ error: 'Insufficient permissions' });
        }

        req.user = decoded;
        next();
      } catch (error) {
        res.status(401).json({ error: error.message });
      }
    };
  }

  // 获取所有用户
  getUsers() {
    return Array.from(this.users.values()).map(user => ({
      username: user.username,
      role: user.role
    }));
  }

  // 更新用户角色
  updateUserRole(username, role) {
    const user = this.users.get(username);
    if (!user) {
      throw new Error('User not found');
    }

    user.role = role;
    this.users.set(username, user);
    return { username, role };
  }

  // 删除用户
  deleteUser(username) {
    if (!this.users.has(username)) {
      throw new Error('User not found');
    }

    this.users.delete(username);
    return { message: 'User deleted successfully' };
  }
}

module.exports = Auth;
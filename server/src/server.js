import express from 'express';
import http from 'http';
import cors from 'cors';
import { WebSocketServer } from 'ws';  // 修改导入方式
import { authService } from './services/authService.js';
import { config } from './config/index.js';
import apiRoutes from './routes/api.js'; // 确保导入了API路由
import shopRoutes from './routes/shop.js';
import rateLimit from 'express-rate-limit';  // 使用 import 替代 require

const app = express();

// 改进CORS配置
const corsOptions = {
  origin: config.environment === 'production' 
    ? ['https://yourdomain.com'] 
    : ['http://localhost:5173'],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
};

app.use(cors(corsOptions));

// 添加速率限制
// const rateLimit = require('express-rate-limit');  // 删除这行

// 登录限制
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15分钟
  max: 5, // 每IP限制5次尝试
  message: {
    success: false,
    message: '尝试次数过多，请15分钟后再试'
  }
});

// 应用到登录路由
app.use('/api/login', loginLimiter);

app.use(express.json());
app.use('/api', apiRoutes); // 使用API路由
app.use('/api/shop', shopRoutes);

// 添加登录路由
app.post('/api/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    console.log('收到登录请求:', { username }); // 不要记录密码
    
    const result = await authService.verifyLogin(username, password);
    console.log('登录结果:', result);
    res.json(result);
  } catch (error) {
    console.error('登录错误:', error);
    res.status(500).json({
      success: false,
      message: '服务器错误: ' + error.message
    });
  }
});

// 添加注册路由
app.post('/api/register', async (req, res) => {
  try {
    const { username, password, email } = req.body;
    console.log('收到注册请求:', { username, email });
    
    // 输入验证
    if (!username || !password || !email) {
      console.log('注册失败: 缺少必要字段');
      return res.status(400).json({ 
        success: false,
        message: '用户名、密码和邮箱不能为空'
      });
    }

    // 检查用户名是否已存在
    const [existingUser] = await authService.authPool.execute(
      'SELECT id FROM account WHERE username = ?',
      [username.toUpperCase()]
    );
    
    if (existingUser.length > 0) {
      console.log('注册失败: 用户名已存在');
      return res.status(400).json({
        success: false,
        message: '用户名已存在'
      });
    }

    // 检查邮箱是否已被使用
    const [existingEmail] = await authService.authPool.execute(
      'SELECT id FROM account WHERE email = ? OR reg_mail = ?',
      [email, email]
    );

    if (existingEmail.length > 0) {
      console.log('注册失败: 邮箱已被使用');
      return res.status(400).json({
        success: false,
        message: '该邮箱已被注册'
      });
    }

    // 创建账号
    try {
      const accountId = await authService.registerAccount(username, password, email);
      console.log('注册成功:', { username, accountId });
      
      res.json({
        success: true,
        message: '注册成功',
        accountId
      });
    } catch (error) {
      console.error('注册过程错误:', error);
      throw error;
    }
    
  } catch (error) {
    console.error('注册错误:', error);
    res.status(500).json({
      success: false,
      message: '注册失败: ' + error.message
    });
  }
});

// 获取角色列表
app.get('/api/characters', async (req, res) => {
  try {
    const { username } = req.query;
    if (!username) {
      return res.status(400).json({
        success: false,
        message: '缺少用户名参数'
      });
    }

    const characters = await authService.getCharacters(username);
    res.json({
      success: true,
      characters
    });
  } catch (error) {
    console.error('获取角色列表失败:', error);
    res.status(500).json({
      success: false,
      message: '获取角色列表失败: ' + error.message
    });
  }
});

// 保存聊天记录
app.post('/api/chat/messages', async (req, res) => {
  try {
    const { accountId, characterId, characterName, race, classId, message } = req.body;
    
    const messageId = await authService.saveChatMessage(
      accountId,
      characterId,
      characterName,
      race,
      classId,
      message
    );

    res.json({
      success: true,
      messageId
    });
  } catch (error) {
    console.error('保存聊天记录失败:', error);
    res.status(500).json({
      success: false,
      message: '保存聊天记录失败: ' + error.message
    });
  }
});

// 获取聊天记录
app.get('/api/chat/history', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 100;
    const history = await authService.getChatHistory(limit);
    
    res.json({
      success: true,
      history
    });
  } catch (error) {
    console.error('获取聊天记录失败:', error);
    res.status(500).json({
      success: false,
      message: '获取聊天记录失败: ' + error.message
    });
  }
});

// 解卡角色
app.post('/api/characters/unblock', async (req, res) => {
  const { name, position_x, position_y, position_z, map } = req.body;

  try {
    // 检查角色是否存在
    const [characterRows] = await authService.charactersPool.execute(
      'SELECT online, race FROM characters WHERE name = ?',
      [name]
    );

    if (characterRows.length === 0) {
      return res.status(404).json({ success: false, message: '角色不存在' });
    }

    const online = characterRows[0].online;
    const race = characterRows[0].race;

    // 更新角色位置
    await authService.charactersPool.execute(
      'UPDATE characters SET position_x = ?, position_y = ?, position_z = ?, map = ? WHERE name = ?',
      [position_x, position_y, position_z, map, name]
    );

    res.json({ success: true, message: '角色位置已更新' });
  } catch (error) {
    console.error('解卡角色失败:', error);
    res.status(500).json({ success: false, message: '解卡失败: ' + error.message });
  }
});

// 查询角色在线状态
app.get('/api/characters/online', async (req, res) => {
  const { name } = req.query;

  try {
    const [characterRows] = await authService.charactersPool.execute(
      'SELECT online FROM characters WHERE name = ?',
      [name]
    );

    if (characterRows.length === 0) {
      return res.status(404).json({ success: false, message: '角色不存在' });
    }

    const online = characterRows[0].online;
    res.json({ success: true, online });
  } catch (error) {
    console.error('查询角色在线状态失败:', error);
    res.status(500).json({ success: false, message: '查询失败: ' + error.message });
  }
});

// 添加更改密码路由
app.post('/api/change-password', async (req, res) => {
  try {
    const { username, originalPassword, email, newPassword } = req.body;
    console.log('收到更改密码请求:', { username, email }); // 不要记录密码
    
    // 验证用户身份
    const result = await authService.verifyLogin(username, originalPassword);
    if (!result.success) {
      return res.status(400).json({ success: false, message: '原始密码错误' });
    }

    // 检查邮箱是否匹配
    const [userRows] = await authService.authPool.execute(
      'SELECT id, HEX(salt) as salt FROM account WHERE username = ? AND email = ?',
      [username.toUpperCase(), email]
    );

    if (userRows.length === 0) {
      return res.status(400).json({ success: false, message: '邮箱不匹配' });
    }

    // 计算新密码的验证器
    const newVerifier = await authService.calculateSRP6Verifier(username, newPassword, originalPassword);

    // 更新密码
    await authService.authPool.execute(
      'UPDATE account SET verifier = ? WHERE username = ?',
      [newVerifier, username.toUpperCase()]
    );

    res.json({ success: true, message: '密码更改成功' });
  } catch (error) {
    console.error('更改密码错误:', error);
    res.status(500).json({
      success: false,
      message: '更改密码失败: ' + error.message
    });
  }
});

// 添加获取所有账号的路由
app.get('/api/accounts', async (req, res) => {
  try {
    const accounts = await authService.getAllAccounts();
    res.json({ success: true, accounts });
  } catch (error) {
    console.error('获取账号失败:', error);
    res.status(500).json({ success: false, message: '获取账号失败' });
  }
});

// 添加获取角色信息的路由
app.get('/api/characters/:accountId', async (req, res) => {
  const { accountId } = req.params;
  try {
    const characters = await authService.getCharactersByAccountId(accountId);
    res.json({ success: true, characters });
  } catch (error) {
    console.error('获取角色失败:', error);
    res.status(500).json({ success: false, message: '获取角色失败' });
  }
});

// 发送远程命令
app.post('/api/remote-command', async (req, res) => {
  const { command } = req.body;
  try {
    const result = await authService.executeRemoteCommand(command);
    if (result.success) {
      res.json({ 
        success: true, 
        result: result.result 
      });
    } else {
      res.json({ 
        success: false, 
        message: result.error || '命令执行失败'
      });
    }
  } catch (error) {
    console.error('远程命令执行失败:', error);
    res.status(500).json({ 
      success: false, 
      message: '远程命令执行失败: ' + error.message 
    });
  }
});

// 添加全局错误处理中间件
app.use((err, req, res, next) => {
  console.error('服务器错误:', err);
  
  // 不向客户端暴露详细错误
  res.status(500).json({
    success: false,
    message: '服务器内部错误'
  });
});

// 处理未捕获的Promise异常
process.on('unhandledRejection', (reason, promise) => {
  console.error('未处理的Promise异常:', reason);
});

const server = http.createServer(app);

// 修改 WebSocket 服务器初始化
const wss = new WebSocketServer({ 
  server: server,  // 直接传入 server 实例
  perMessageDeflate: false  // 禁用消息压缩
});

// 添加 WebSocket 连接处理
wss.on('connection', (ws) => {
  console.log('新的 WebSocket 连接');
  
  ws.on('message', (message) => {
    console.log('收到消息:', message.toString());
  });

  ws.on('close', () => {
    console.log('WebSocket 连接关闭');
  });
});

const PORT = config.port || 3003;
server.listen(PORT, '0.0.0.0', () => {  // 监听所有网络接口
  console.log(`Server running on port ${PORT}`);
}); 
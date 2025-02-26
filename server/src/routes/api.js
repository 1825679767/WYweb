import express from 'express';
import { getCommonCommands, saveCommonCommands } from '../services/commonCommandsService.js';
import { authService } from '../services/authService.js';

const router = express.Router();

// 获取常用命令列表
router.get('/common-commands', async (req, res) => {
  try {
    const commands = await getCommonCommands();
    res.json({ success: true, commands });
  } catch (error) {
    res.status(500).json({ success: false, message: '获取常用命令失败' });
  }
});

// 保存常用命令列表
router.post('/common-commands', async (req, res) => {
  try {
    const { commands } = req.body;
    await saveCommonCommands(commands);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: '保存常用命令失败' });
  }
});

// 添加检查管理员状态的路由
router.get('/user/isAdmin', async (req, res) => {
  try {
    const { username } = req.query;
    if (!username) {
      return res.status(400).json({ success: false, message: '缺少用户名参数' });
    }

    const [rows] = await authService.authPool.execute(
      'SELECT gmlevel FROM account_access WHERE id = (SELECT id FROM account WHERE username = ?)',
      [username.toUpperCase()]
    );

    const isAdmin = rows.length > 0 && rows[0].gmlevel > 0;
    res.json({ success: true, isAdmin });
  } catch (error) {
    console.error('检查管理员状态失败:', error);
    res.status(500).json({ success: false, message: '检查管理员状态失败' });
  }
});

export default router; 
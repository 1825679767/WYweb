import express from 'express';
import { getCommonCommands, saveCommonCommands } from '../services/commonCommandsService.js';

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

export default router; 
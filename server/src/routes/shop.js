import express from 'express';
import { authService } from '../services/authService.js';
import { shopService } from '../services/shopService.js';

const router = express.Router();

// 获取商品列表
router.get('/items', async (req, res) => {
  try {
    const items = await shopService.getItems();
    res.json({ success: true, items });
  } catch (error) {
    res.status(500).json({ success: false, message: '获取商品列表失败' });
  }
});

// 获取用户积分
router.get('/points', async (req, res) => {
  try {
    const { username } = req.query;
    const points = await shopService.getUserPoints(username);
    res.json({ success: true, points });
  } catch (error) {
    res.status(500).json({ success: false, message: '获取积分失败' });
  }
});

// 修改购买商品的路由
router.post('/purchase', async (req, res) => {
  try {
    const { username, characterName, itemId, amount, subject, text } = req.body;
    const result = await shopService.purchaseItem(username, characterName, itemId, amount, subject, text);
    res.json(result);
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message || '购买失败' 
    });
  }
});

// 添加商品(需要管理员权限)
router.post('/items', async (req, res) => {
  try {
    const item = await shopService.addItem(req.body);
    res.json({ success: true, item });
  } catch (error) {
    res.status(500).json({ success: false, message: '添加商品失败' });
  }
});

// 编辑商品(需要管理员权限)
router.put('/items/:id', async (req, res) => {
  try {
    const item = await shopService.updateItem(req.params.id, req.body);
    res.json({ success: true, item });
  } catch (error) {
    res.status(500).json({ success: false, message: '更新商品失败' });
  }
});

// 删除商品(需要管理员权限)
router.delete('/items/:id', async (req, res) => {
  try {
    await shopService.deleteItem(req.params.id);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: '删除商品失败' });
  }
});

// 获取购买记录
router.get('/purchase-history', async (req, res) => {
  try {
    const { username, page = 1, pageSize = 10 } = req.query;
    const result = await shopService.getPurchaseHistory(
      username, 
      parseInt(page), 
      parseInt(pageSize)
    );
    res.json({ success: true, ...result });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: '获取购买记录失败' 
    });
  }
});

export default router; 
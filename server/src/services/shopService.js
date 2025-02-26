import { authService } from './authService.js';
import { sendSoapCommand } from './soapService.js';

class ShopService {
  constructor() {
    this.charactersPool = authService.charactersPool;
    this.authPool = authService.authPool;
  }

  // 获取商品列表
  async getItems() {
    try {
      const [rows] = await this.charactersPool.execute(
        'SELECT * FROM _WYweb商城 ORDER BY id DESC'
      );
      return rows;
    } catch (error) {
      console.error('获取商品列表失败:', error);
      throw error;
    }
  }

  // 添加商品
  async addItem(itemData) {
    try {
      const { name, itemId, description, price, image, category = 'other' } = itemData;
      const [result] = await this.charactersPool.execute(
        'INSERT INTO _WYweb商城 (name, itemId, description, price, image, category) VALUES (?, ?, ?, ?, ?, ?)',
        [name, itemId, description, price, image, category]
      );
      return { id: result.insertId, ...itemData };
    } catch (error) {
      console.error('添加商品失败:', error);
      throw error;
    }
  }

  // 更新商品
  async updateItem(id, itemData) {
    try {
      const { name, itemId, description, price, image, category = 'other' } = itemData;
      await this.charactersPool.execute(
        'UPDATE _WYweb商城 SET name = ?, itemId = ?, description = ?, price = ?, image = ?, category = ? WHERE id = ?',
        [name, itemId, description, price, image, category, id]
      );
      return { id, ...itemData };
    } catch (error) {
      console.error('更新商品失败:', error);
      throw error;
    }
  }

  // 删除商品
  async deleteItem(id) {
    try {
      await this.charactersPool.execute(
        'DELETE FROM _WYweb商城 WHERE id = ?',
        [id]
      );
      return true;
    } catch (error) {
      console.error('删除商品失败:', error);
      throw error;
    }
  }

  // 获取用户积分
  async getUserPoints(username) {
    try {
      const [rows] = await this.authPool.execute(
        'SELECT jf FROM account WHERE username = ?',
        [username.toUpperCase()]
      );
      return rows[0]?.jf || 0;
    } catch (error) {
      console.error('获取用户积分失败:', error);
      throw error;
    }
  }

  // 更新用户积分
  async updateUserPoints(username, points) {
    try {
      await this.authPool.execute(
        'UPDATE account SET jf = jf + ? WHERE username = ?',
        [points, username.toUpperCase()]
      );
    } catch (error) {
      console.error('更新用户积分失败:', error);
      throw error;
    }
  }

  // 购买商品
  async purchaseItem(username, characterName, itemId, amount, subject, text) {
    const connection = await this.authPool.getConnection();
    try {
      await connection.beginTransaction();

      // 修改查询条件，使用 id 而不是 itemId
      const [items] = await this.charactersPool.execute(
        'SELECT * FROM _WYweb商城 WHERE id = ?',  // 改为使用 id 查询
        [itemId]
      );

      if (items.length === 0) {
        throw new Error('商品不存在');
      }

      const item = items[0];
      const totalCost = item.price * amount;

      // 检查用户积分是否足够
      const [accounts] = await connection.execute(
        'SELECT jf FROM account WHERE username = ? FOR UPDATE',
        [username.toUpperCase()]
      );

      if (accounts.length === 0) {
        throw new Error('账号不存在');
      }

      const userPoints = accounts[0].jf;
      if (userPoints < totalCost) {
        throw new Error('积分不足');
      }

      // 发送物品命令 - 使用商品的 itemId
      const command = `.send items ${characterName} "${subject}" "${text}" ${item.itemId}:${amount}`;
      const result = await sendSoapCommand(command);

      // 记录购买记录
      await this.charactersPool.execute(
        'INSERT INTO _WYweb商城购买记录 (username, character_name, item_id, item_name, price, amount, soap_command, soap_result, error_message) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [
          username.toUpperCase(),
          characterName,
          item.id,        // 使用商品表的 id
          item.name,      // 使用商品表的 name
          totalCost,
          amount,
          command,
          result.success ? 1 : 0,
          result.error || null
        ]
      );

      if (!result.success) {
        throw new Error(result.error || '发送物品失败');
      }

      // 扣除积分
      await connection.execute(
        'UPDATE account SET jf = jf - ? WHERE username = ?',
        [totalCost, username.toUpperCase()]
      );

      await connection.commit();
      return { success: true, message: '购买成功', remainingPoints: userPoints - totalCost };

    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  // 获取购买记录
  async getPurchaseHistory(username, page = 1, pageSize = 10) {
    try {
      const offset = (page - 1) * pageSize;
      
      // 获取总记录数
      const [countRows] = await this.charactersPool.execute(
        'SELECT COUNT(*) as total FROM _WYweb商城购买记录 WHERE username = ?',
        [username.toUpperCase()]
      );
      
      // 获取分页数据
      const [records] = await this.charactersPool.execute(
        'SELECT * FROM _WYweb商城购买记录 WHERE username = ? ORDER BY created_at DESC LIMIT ? OFFSET ?',
        [username.toUpperCase(), pageSize, offset]
      );

      return {
        total: countRows[0].total,
        records,
        page,
        pageSize,
        totalPages: Math.ceil(countRows[0].total / pageSize)
      };
    } catch (error) {
      console.error('获取购买记录失败:', error);
      throw error;
    }
  }
}

export const shopService = new ShopService(); 
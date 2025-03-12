import mysql from 'mysql2/promise';
import crypto from 'crypto';
import { config } from '../config/index.js';
import bigInt from 'big-integer';
import { databaseConfig } from '../config/database.js';
import { sendSoapCommand } from './soapService.js'; // 导入 SOAP 服务

class AuthService {
  constructor() {
    // 创建 auth 数据库连接池
    this.authPool = mysql.createPool(config.database.authDatabase);
    // 创建 characters 数据库连接池
    this.charactersPool = mysql.createPool(databaseConfig.charactersDatabase);
    // SRP6常量
    this.g = bigInt(7);
    this.N = bigInt('894B645E89E1535BBDAD5B8B290650530801B18EBFBF5E8FAB3C82872A3E9BB7', 16);

    // 种族映射
    this.RACE_MAP = {
      1: '人类',
      2: '兽人',
      3: '矮人',
      4: '暗夜精灵',
      5: '亡灵',
      6: '牛头人',
      7: '侏儒',
      8: '巨魔',
      10: '血精灵',
      11: '德莱尼'
    };

    // 职业映射
    this.CLASS_MAP = {
      1: '战士',
      2: '圣骑士',
      3: '猎人',
      4: '潜行者',
      5: '牧师',
      6: '死亡骑士',
      7: '萨满祭司',
      8: '法师',
      9: '术士',
      11: '德鲁伊'
    };
  }

  // 生成注册数据（salt和verifier）
  async generateSRP6RegistrationData(username, password) {
    const { salt, verifier } = await this.calculateSRP6Verifier(username, password);
    return { salt, verifier };
  }

  // 计算SRP6验证器
  async calculateSRP6Verifier(username, password, oldPassword = null) {
    // 如果是修改密码，需要先获取原有的 salt
    let salt;
    if (oldPassword) {
      const [rows] = await this.authPool.execute(
        'SELECT HEX(salt) as salt FROM account WHERE username = ?',
        [username.toUpperCase()]
      );
      if (rows.length === 0) {
        throw new Error('Account not found');
      }
      salt = Buffer.from(rows[0].salt, 'hex');
    } else {
      // 如果是新注册，生成新的 salt
      salt = crypto.randomBytes(32);
    }

    // 第一步：计算h1 = SHA1(username:password) - 确保都是大写，符合PHP实现
    const h1 = crypto.createHash('sha1')
      .update((username.toUpperCase() + ':' + password.toUpperCase()))
      .digest();

    // 第二步：计算h2 = SHA1(salt || h1)
    const h2 = crypto.createHash('sha1')
      .update(Buffer.concat([salt, h1]))
      .digest();

    // 转换为大整数（小端序）
    let h2Int = bigInt(0);
    for (let i = h2.length - 1; i >= 0; i--) {
      h2Int = h2Int.shiftLeft(8).or(h2[i]);
    }

    // 计算g^h2 mod N
    const verifier = this.g.modPow(h2Int, this.N);

    // 转换回字节数组（小端序）并填充到32字节
    const verifierBuffer = Buffer.alloc(32, 0); // 初始化为全0
    let temp = verifier;
    for (let i = 0; i < 32; i++) {
      verifierBuffer[i] = temp.and(0xFF).valueOf();
      temp = temp.shiftRight(8);
    }

    return { salt, verifier: verifierBuffer };
  }

  // 注册新账号
  async registerAccount(username, password, email) {
    const connection = await this.authPool.getConnection();
    try {
      // 生成SRP6数据
      const { salt, verifier } = await this.generateSRP6RegistrationData(username, password);
      
      // 插入账号数据
      const [result] = await connection.execute(
        `INSERT INTO account (
          username, 
          salt, 
          verifier, 
          email, 
          reg_mail,
          expansion,
          joindate
        ) VALUES (?, UNHEX(?), UNHEX(?), ?, ?, ?, NOW())`,
        [
          username.toUpperCase(),
          salt.toString('hex'),
          verifier.toString('hex'),
          email,
          email,
          2 // 默认WLK版本
        ]
      );

      console.log('生成salt:', salt.toString('hex'));
      console.log('生成verifier:', verifier.toString('hex'));
      console.log('执行注册SQL:', `
        INSERT INTO account 
        (username, salt, verifier, email, reg_mail, expansion, joindate)
        VALUES (?, UNHEX(?), UNHEX(?), ?, ?, ?, NOW())
      `, [
        username.toUpperCase(),
        salt.toString('hex'),
        verifier.toString('hex'),
        email,
        email,
        2
      ]);

      return result.insertId;
    } catch (error) {
      console.error('注册失败:', error);
      throw error;
    } finally {
      connection.release();
    }
  }

  // 验证登录
  async verifyLogin(username, password) {
    let connection;
    try {
      connection = await this.authPool.getConnection();
      
      // 使用参数化查询防止SQL注入
      const [rows] = await connection.execute(
        'SELECT username, salt, verifier FROM account WHERE username = ?',
        [username.toUpperCase()]
      );
      
      console.log('查询结果:', rows);

      if (rows.length === 0) {
        return { success: false, message: '账号不存在' };
      }

      const { salt: saltHex, verifier: storedVerifier } = rows[0];
      const salt = Buffer.from(saltHex, 'hex');
      
      // 计算验证器
      const calculatedVerifier = await this.calculateSRP6Verifier(
        username,
        password,
        salt
      );

      // 比较验证器 - 直接比较Buffer或转换为相同格式后比较
      let isValid;
      if (Buffer.isBuffer(storedVerifier)) {
        // 如果storedVerifier是Buffer，直接比较Buffer
        isValid = Buffer.compare(calculatedVerifier.verifier, storedVerifier) === 0;
      } else {
        // 如果storedVerifier是十六进制字符串，转换为相同格式后比较
        const storedVerifierHex = Buffer.isBuffer(storedVerifier) ? storedVerifier.toString('hex') : storedVerifier;
        isValid = calculatedVerifier.verifier.toString('hex').toUpperCase() === storedVerifierHex.toString().toUpperCase();
      }
      
      console.log('验证结果:', isValid);

      // 获取用户的 GM 权限
      const [accessRows] = await connection.execute(
        'SELECT gmlevel FROM account_access WHERE id = (SELECT id FROM account WHERE username = ?)',
        [username.toUpperCase()]
      );

      // 检查是否为GM：判断条件是 account_access 表中该账号的 gmlevel > 0
      const isGM = accessRows.length > 0 && accessRows[0].gmlevel > 0;
      console.log('用户 GM 权限:', isGM);

      return {
        success: isValid,
        username: rows[0].username,
        message: isValid ? '' : '密码错误',
        isGM // 返回 GM 权限状态
      };
    } catch (error) {
      console.error('数据库查询错误:', error);
      throw new Error('验证登录失败');
    } finally {
      if (connection) connection.release();
    }
  }

  // 获取账号的角色列表
  async getCharacters(username) {
    try {
      // 先获取账号信息
      const [accountRows] = await this.authPool.execute(
        'SELECT id, username FROM account WHERE username = ?',
        [username.toUpperCase()]
      );

      if (accountRows.length === 0) {
        throw new Error('账号不存在');
      }

      const accountId = accountRows[0].id;
      const accountName = accountRows[0].username;

      // 获取该账号的所有角色
      const [rows] = await this.charactersPool.execute(
        `SELECT 
          guid,
          name,
          race,
          class,
          level,
          online,
          CASE 
            WHEN online > 0 AND logout_time = 0 THEN 1
            ELSE 0
          END as is_online
        FROM characters 
        WHERE account = ?
        ORDER BY level DESC, name ASC`,
        [accountId]
      );

      // 获取每个角色的好友列表
      const characters = await Promise.all(rows.map(async (char) => {
        const friends = await this.getCharacterFriends(char.guid);
        return {
          id: char.guid,
          accountId: accountId,
          accountName: accountName,  // 添加账号名称
          name: char.name,
          race: this.getRaceName(char.race),
          raceId: char.race,
          class: this.getClassName(char.class),
          classId: char.class,
          level: char.level,
          online: char.is_online === 1,
          friends
        };
      }));

      return characters;
    } catch (error) {
      console.error('获取角色列表错误:', error);
      throw error;
    }
  }

  // 获取角色的好友列表
  async getCharacterFriends(characterId) {
    try {
      console.log('正在获取角色ID的好友列表:', characterId);

      const [rows] = await this.charactersPool.execute(
        `SELECT 
          c.guid,
          c.name,
          c.race,
          c.class,
          c.level,
          c.online
        FROM character_social cs
        JOIN characters c ON cs.friend = c.guid
        WHERE cs.guid = ? AND cs.flags = 1
        ORDER BY c.online DESC, c.name ASC`,
        [characterId]
      );

      console.log('数据库返回的好友数据:', rows);

      const friends = rows.map(friend => ({
        id: friend.guid,
        name: friend.name,
        race: this.getRaceName(friend.race),
        class: this.getClassName(friend.class),
        level: friend.level,
        online: friend.online === 1  // 直接使用 online 字段，并确保转换为布尔值
      }));

      console.log('处理后的好友列表:', friends);
      return friends;
    } catch (error) {
      console.error('获取好友列表错误:', error);
      throw error;
    }
  }

  // 获取种族名称
  getRaceName(raceId) {
    const races = {
      1: '人类',
      2: '兽人',
      3: '矮人',
      4: '暗夜精灵',
      5: '亡灵',
      6: '牛头人',
      7: '侏儒',
      8: '巨魔',
      10: '血精灵',
      11: '德莱尼'
    };
    return races[raceId] || '未知';
  }

  // 获取职业名称
  getClassName(classId) {
    const classes = {
      1: '战士',
      2: '圣骑士',
      3: '猎人',
      4: '潜行者',
      5: '牧师',
      6: '死亡骑士',
      7: '萨满',
      8: '法师',
      9: '术士',
      11: '德鲁伊'
    };
    return classes[classId] || '未知';
  }

  // 清理旧消息
  async cleanOldMessages() {
    try {
      // 保留最新的10000条消息
      const keepCount = 10000;
      
      // 获取总消息数
      const [countResult] = await this.charactersPool.execute(
        'SELECT COUNT(*) as total FROM _WYweb聊天记录'
      );
      
      const total = countResult[0].total;
      
      // 如果总数超过限制，删除多余的旧消息
      if (total > keepCount) {
        const deleteCount = total - keepCount;
        
        // 获取要删除的消息的最大ID
        const [idResult] = await this.charactersPool.execute(
          'SELECT id FROM _WYweb聊天记录 ORDER BY id DESC LIMIT ?, 1',
          [keepCount]
        );
        
        if (idResult.length > 0) {
          const maxIdToDelete = idResult[0].id;
          
          // 删除旧消息
          await this.charactersPool.execute(
            'DELETE FROM _WYweb聊天记录 WHERE id <= ?',
            [maxIdToDelete]
          );
          
          console.log(`已清理 ${deleteCount} 条旧消息`);
        }
      }
    } catch (error) {
      console.error('清理旧消息失败:', error);
    }
  }

  // 修改保存消息方法，添加自动清理
  async saveChatMessage(accountId, characterId, characterName, race, classId, message) {
    try {
      // 先获取账号名称
      const [accountRows] = await this.authPool.execute(
        'SELECT username FROM account WHERE id = ?',
        [accountId]
      );

      if (accountRows.length === 0) {
        throw new Error('账号不存在');
      }

      const accountName = accountRows[0].username;

      const [result] = await this.charactersPool.execute(
        `INSERT INTO _WYweb聊天记录 (
          账号ID,
          账号名称,
          角色ID, 
          角色名称, 
          角色种族, 
          角色职业, 
          消息内容, 
          是否转发
        ) VALUES (?, ?, ?, ?, ?, ?, ?, 1)`,
        [accountId, accountName, characterId, characterName, race, classId, message]
      );

      // 每100条消息检查一次是否需要清理
      if (result.insertId % 100 === 0) {
        await this.cleanOldMessages();
      }

      return result.insertId;
    } catch (error) {
      console.error('保存聊天记录失败:', error);
      throw error;
    }
  }

  // 获取聊天记录
  async getChatHistory(limit = 100) {
    try {
      // 修改 SQL 查询，确保参数类型正确
      const [rows] = await this.charactersPool.execute(
        `SELECT 
          c.*,
          COALESCE(a.username, '') as 账号名称
        FROM _WYweb聊天记录 c
        LEFT JOIN acore_auth.account a ON a.id = c.账号ID
        ORDER BY c.创建时间 DESC
        LIMIT ?`,
        [Number(limit)] // 确保 limit 是数字类型
      );

      return rows.map(row => ({
        id: row.id,
        accountId: row.账号ID,
        accountName: row.账号名称 || '',  // 使用空字符串作为默认值
        characterId: row.角色ID,
        characterName: row.角色名称,
        race: row.角色种族,
        class: row.角色职业,
        content: row.消息内容,
        timestamp: row.创建时间
      }));
    } catch (error) {
      console.error('获取聊天记录失败:', error);
      throw error;
    }
  }

  // 获取所有账号
  async getAllAccounts() {
    const connection = await this.authPool.getConnection();
    try {
      // 修改 SQL 查询，加入封禁状态查询
      const [rows] = await connection.execute(`
        SELECT a.id, a.username, a.email, a.totaltime,
          CASE 
            WHEN ab.id IS NOT NULL AND ab.active = 1 AND (ab.unbandate > UNIX_TIMESTAMP() OR ab.unbandate = 0)
            THEN 1
            ELSE 0
          END as is_banned
        FROM account a
        LEFT JOIN account_banned ab ON a.id = ab.id AND ab.active = 1
      `);
      
      return rows.map(row => ({
        ...row,
        totaltime: (row.totaltime / 3600).toFixed(2), // 将秒转换为小时
        is_banned: row.is_banned === 1 // 转换为布尔值
      }));
    } finally {
      connection.release();
    }
  }

  // 转换金币为金银铜格式
  formatMoney(copper) {
    const gold = Math.floor(copper / 10000);
    const silver = Math.floor((copper % 10000) / 100);
    const remainingCopper = copper % 100;
    
    return {
      gold,
      silver,
      copper: remainingCopper
    };
  }

  // 获取指定账号的所有角色
  async getCharactersByAccountId(accountId) {
    const connection = await this.charactersPool.getConnection();
    try {
      const [accountRows] = await this.authPool.execute('SELECT id FROM account WHERE id = ?', [accountId]);
      if (accountRows.length === 0) {
        throw new Error('账号不存在');
      }

      const [rows] = await connection.execute('SELECT name, level, race, class, money, totaltime FROM characters WHERE account = ?', [accountId]);
      
      // 转换数据
      return rows.map(character => ({
        ...character,
        raceName: this.RACE_MAP[character.race] || `未知(${character.race})`,
        className: this.CLASS_MAP[character.class] || `未知(${character.class})`,
        money: this.formatMoney(character.money),
        totaltime: (character.totaltime / 3600).toFixed(2) // 转换为小时
      }));
    } finally {
      connection.release();
    }
  }

  // 发送远程命令
  async executeRemoteCommand(command) {
    try {
      const result = await sendSoapCommand(command);
      return result;
    } catch (error) {
      console.error('发送远程命令失败:', error);
      throw new Error('发送远程命令失败');
    }
  }
}

const authService = new AuthService();
export { authService }; 
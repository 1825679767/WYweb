// 登录
async login(req, res) {
  try {
    const { username, password } = req.body;
    
    // 验证登录
    const user = await this.authService.verifyLogin(username, password);
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: '用户名或密码错误'
      });
    }
    
    // 查询用户权限
    const [rows] = await req.app.locals.authPool.execute(
      'SELECT gmlevel FROM account WHERE username = ?',
      [username]
    );
    
    const isGM = rows[0].gmlevel > 0;
    const gmLevel = rows[0].gmlevel;
    
    // 生成JWT令牌，包含用户名和权限信息，但不包含密码
    const token = jwt.sign(
      { 
        username: user.username,
        isGM: isGM,
        gmLevel: gmLevel
      },
      config.jwt.secret,
      { expiresIn: '24h' } // 设置合理的过期时间
    );
    
    res.json({
      success: true,
      message: '登录成功',
      data: { token }
    });
  } catch (error) {
    console.error('登录失败:', error);
    res.status(500).json({
      success: false,
      message: '登录失败: ' + error.message
    });
  }
}

// 添加刷新token接口
async refreshToken(req, res) {
  try {
    const { username, isGM, gmLevel } = req.user;
    
    // 生成新token
    const newToken = jwt.sign(
      { username, isGM, gmLevel },
      config.jwt.secret,
      { expiresIn: '24h' }
    );
    
    res.json({
      success: true,
      data: { token: newToken }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '刷新token失败'
    });
  }
}

// 添加登出接口
async logout(req, res) {
  try {
    // 在实际应用中，可以将token加入黑名单
    // 这里可以使用Redis存储已撤销的token
    
    res.json({
      success: true,
      message: '登出成功'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '登出失败'
    });
  }
}

// 添加密码重置请求
async requestPasswordReset(req, res) {
  try {
    const { email } = req.body;
    
    // 验证邮箱是否存在
    const [rows] = await req.app.locals.authPool.execute(
      'SELECT username FROM account WHERE email = ?',
      [email]
    );
    
    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: '该邮箱未注册'
      });
    }
    
    // 生成重置令牌
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetExpires = new Date(Date.now() + 3600000); // 1小时后过期
    
    // 存储重置令牌
    await req.app.locals.authPool.execute(
      'UPDATE account SET reset_token = ?, reset_expires = ? WHERE email = ?',
      [resetToken, resetExpires, email]
    );
    
    // 发送重置邮件
    // ...
    
    res.json({
      success: true,
      message: '密码重置邮件已发送'
    });
  } catch (error) {
    console.error('请求密码重置失败:', error);
    res.status(500).json({
      success: false,
      message: '服务器错误'
    });
  }
} 
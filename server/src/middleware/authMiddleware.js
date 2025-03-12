// 验证令牌中间件
const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      message: '未提供有效的认证令牌'
    });
  }
  
  const token = authHeader.split(' ')[1];
  
  try {
    // 验证令牌
    const decoded = jwt.verify(token, config.jwt.secret);
    req.user = decoded; // 包含 username, isGM, gmLevel
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: '令牌无效或已过期'
    });
  }
};

// GM权限验证中间件
const verifyGMPermission = (req, res, next) => {
  if (!req.user.isGM) {
    return res.status(403).json({
      success: false,
      message: '无权限执行此操作'
    });
  }
  
  next();
};

// 高级GM权限验证（用于特别敏感的操作）
const verifyHighGMPermission = async (req, res, next) => {
  try {
    // 对于特别敏感的操作，再次查询数据库验证权限
    const [rows] = await req.app.locals.authPool.execute(
      'SELECT gmlevel FROM account WHERE username = ?',
      [req.user.username]
    );
    
    if (rows.length === 0 || rows[0].gmlevel < 3) { // 假设3级以上为高级GM
      return res.status(403).json({
        success: false,
        message: '需要更高权限'
      });
    }
    
    next();
  } catch (error) {
    console.error('权限验证失败:', error);
    res.status(500).json({
      success: false,
      message: '服务器错误'
    });
  }
}; 
const { body, validationResult } = require('express-validator');

// 登录验证规则
const loginValidation = [
  body('username').trim().notEmpty().withMessage('用户名不能为空'),
  body('password').trim().notEmpty().withMessage('密码不能为空'),
  
  // 验证结果处理
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: '输入验证失败',
        errors: errors.array()
      });
    }
    next();
  }
];

// 注册验证规则
const registerValidation = [
  body('username').trim().notEmpty().withMessage('用户名不能为空')
    .isLength({ min: 3, max: 20 }).withMessage('用户名长度应为3-20个字符')
    .matches(/^[a-zA-Z0-9_]+$/).withMessage('用户名只能包含字母、数字和下划线'),
  
  body('password').trim().notEmpty().withMessage('密码不能为空')
    .isLength({ min: 6 }).withMessage('密码长度至少为6个字符'),
  
  body('email').trim().notEmpty().withMessage('邮箱不能为空')
    .isEmail().withMessage('邮箱格式不正确'),
  
  // 验证结果处理
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: '输入验证失败',
        errors: errors.array()
      });
    }
    next();
  }
];

module.exports = {
  loginValidation,
  registerValidation
}; 
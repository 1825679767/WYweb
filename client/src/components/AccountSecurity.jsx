import React, { useState, useEffect } from 'react';
import { ShieldCheckIcon, KeyIcon, EnvelopeIcon, LockClosedIcon } from '@heroicons/react/24/outline';

const AccountSecurity = ({ username, onBack, isDarkMode }) => {
  const [originalPassword, setOriginalPassword] = useState('');
  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [message, setMessage] = useState('');
  const [showConfirm, setShowConfirm] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [inputCode, setInputCode] = useState('');
  const [verifyError, setVerifyError] = useState('');

  // 生成4位随机数字验证码
  const generateVerificationCode = () => {
    return Math.floor(1000 + Math.random() * 9000).toString();
  };

  // 当确认对话框打开时生成新的验证码
  useEffect(() => {
    if (showConfirm) {
      setVerificationCode(generateVerificationCode());
      setInputCode('');
      setVerifyError('');
    }
  }, [showConfirm]);

  const handleChangePassword = async () => {
    if (inputCode !== verificationCode) {
      setVerifyError('验证码错误，请重新输入');
      return;
    }

    setShowConfirm(false);
    setMessage('');

    try {
      const response = await fetch('http://localhost:3003/api/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username,
          originalPassword,
          email,
          newPassword,
        }),
      });

      const data = await response.json();
      if (data.success) {
        setMessage('密码更改成功！');
      } else {
        setMessage(data.message || '密码更改失败，请重试。');
      }
    } catch (error) {
      console.error('更改密码请求失败:', error);
      setMessage('请求失败，请稍后重试。');
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setShowConfirm(true);
  };

  return (
    <div className={`min-h-screen flex items-center justify-center relative overflow-hidden
      ${isDarkMode ? 'bg-gray-900' : 'bg-gradient-to-br from-blue-50 via-blue-100 to-indigo-200'}`}>
      {/* 装饰背景元素 */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className={`absolute -top-1/2 -left-1/2 w-full h-full rounded-full 
          ${isDarkMode ? 'bg-blue-900/10' : 'bg-blue-200/40'} blur-3xl transform rotate-12`} />
        <div className={`absolute -bottom-1/2 -right-1/2 w-full h-full rounded-full 
          ${isDarkMode ? 'bg-purple-900/10' : 'bg-indigo-200/40'} blur-3xl transform -rotate-12`} />
      </div>

      {/* 主要内容卡片 */}
      <div className={`relative p-8 rounded-xl shadow-2xl w-full max-w-md backdrop-blur-sm
        ${isDarkMode 
          ? 'bg-gray-800/80 text-white' 
          : 'bg-white/80 text-gray-800'}`}>
        
        {/* 标题区域 */}
        <div className="flex items-center justify-center mb-8">
          <ShieldCheckIcon className={`w-12 h-12 ${isDarkMode ? 'text-blue-400' : 'text-blue-500'} mr-3`} />
          <h2 className="text-3xl font-bold">账号安全</h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* 原始密码输入框组 */}
          <div className="relative">
            <label className="block mb-2 font-medium">原始密码</label>
            <div className="relative">
              <KeyIcon className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="password"
                value={originalPassword}
                onChange={(e) => setOriginalPassword(e.target.value)}
                className={`pl-10 pr-4 py-3 w-full rounded-lg transition duration-200 
                  ${isDarkMode 
                    ? 'bg-gray-700 text-white border-gray-600' 
                    : 'bg-white text-gray-800 border-gray-200'} 
                  border focus:outline-none focus:ring-2 focus:ring-blue-500`}
                required
              />
            </div>
          </div>

          {/* 邮箱输入框组 */}
          <div className="relative">
            <label className="block mb-2 font-medium">注册邮箱</label>
            <div className="relative">
              <EnvelopeIcon className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={`pl-10 pr-4 py-3 w-full rounded-lg transition duration-200 
                  ${isDarkMode 
                    ? 'bg-gray-700 text-white border-gray-600' 
                    : 'bg-white text-gray-800 border-gray-200'} 
                  border focus:outline-none focus:ring-2 focus:ring-blue-500`}
                required
              />
            </div>
          </div>

          {/* 新密码输入框组 */}
          <div className="relative">
            <label className="block mb-2 font-medium">新密码</label>
            <div className="relative">
              <LockClosedIcon className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className={`pl-10 pr-4 py-3 w-full rounded-lg transition duration-200 
                  ${isDarkMode 
                    ? 'bg-gray-700 text-white border-gray-600' 
                    : 'bg-white text-gray-800 border-gray-200'} 
                  border focus:outline-none focus:ring-2 focus:ring-blue-500`}
                required
              />
            </div>
          </div>

          {/* 按钮组 */}
          <div className="space-y-4 pt-2">
            <button
              type="submit"
              className={`w-full py-3 rounded-lg font-medium transition duration-200
                bg-gradient-to-r from-blue-500 to-indigo-600 text-white
                hover:from-blue-600 hover:to-indigo-700 transform hover:-translate-y-0.5
                focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                ${isDarkMode ? 'focus:ring-offset-gray-800' : 'focus:ring-offset-white'}`}
            >
              确认修改
            </button>
            
            <button
              type="button"
              onClick={onBack}
              className={`w-full py-3 rounded-lg font-medium transition duration-200
                ${isDarkMode 
                  ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
            >
              返回
            </button>
          </div>
        </form>

        {/* 消息提示 */}
        {message && (
          <div className={`mt-6 p-4 rounded-lg text-center font-medium
            ${message.includes('成功')
              ? 'bg-green-500/10 text-green-500'
              : 'bg-red-500/10 text-red-500'}`}>
            {message}
          </div>
        )}

        {/* 确认对话框 */}
        {showConfirm && (
          <div className="fixed inset-0 flex items-center justify-center z-50">
            <div className="absolute inset-0 bg-black bg-opacity-50" onClick={() => setShowConfirm(false)} />
            <div className={`relative p-6 rounded-xl shadow-xl w-96 ${
              isDarkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'
            }`}>
              <h3 className="text-xl font-semibold mb-4">确认修改密码</h3>
              <p className="mb-4">请输入验证码以确认修改：</p>
              
              {/* 验证码显示 */}
              <div className="mb-4 p-3 bg-gray-100 rounded-lg text-center">
                <span className="text-2xl font-bold tracking-wider text-gray-700 font-mono">
                  {verificationCode}
                </span>
              </div>

              {/* 验证码输入框 */}
              <div className="mb-4">
                <input
                  type="text"
                  maxLength="4"
                  value={inputCode}
                  onChange={(e) => {
                    const value = e.target.value.replace(/[^\d]/g, '');
                    setInputCode(value);
                    setVerifyError('');
                  }}
                  placeholder="请输入上方验证码"
                  className={`w-full px-4 py-2 rounded-lg border ${
                    isDarkMode 
                      ? 'bg-gray-700 text-white border-gray-600' 
                      : 'bg-white text-gray-800 border-gray-300'
                  } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                />
                {verifyError && (
                  <p className="mt-2 text-sm text-red-500">{verifyError}</p>
                )}
              </div>

              <div className="flex justify-end space-x-4">
                <button
                  onClick={() => setShowConfirm(false)}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    isDarkMode
                      ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  取消
                </button>
                <button
                  onClick={handleChangePassword}
                  className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors"
                  disabled={inputCode.length !== 4}
                >
                  确认
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AccountSecurity; 
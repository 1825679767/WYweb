import { useState, useRef, useEffect, useMemo } from 'react'
import { 
  ChatBubbleLeftRightIcon, 
  UsersIcon,
  PaperAirplaneIcon,
  ChevronRightIcon,
  SunIcon,
  MoonIcon,
  UserCircleIcon,
  LockClosedIcon,
  ArrowRightIcon,
  SparklesIcon,
  ChatBubbleBottomCenterTextIcon,
  UserGroupIcon,
  KeyIcon,
  CogIcon,
  ShieldCheckIcon,
  ShoppingBagIcon,
  ShoppingCartIcon,
  EnvelopeIcon,
  ArrowRightOnRectangleIcon,
  TrophyIcon,
  GiftIcon,
  WrenchScrewdriverIcon
} from '@heroicons/react/24/outline'
import { Toast } from './components/Toast'
import { Chat } from './components/Chat'
import UnblockCharacter from './components/UnblockCharacter'
import AccountSecurity from './components/AccountSecurity'
import GMPanel from './components/GMPanel'

// 登录组件
function Login({ onLogin, isDarkMode, showToast, setIsGM }) {
  const [isRegister, setIsRegister] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    confirmPassword: '',
    email: ''
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [inputCode, setInputCode] = useState('');
  const [verifyError, setVerifyError] = useState('');
  const [isGM, setIsGMState] = useState(false);

  const generateVerificationCode = () => {
    return Math.floor(1000 + Math.random() * 9000).toString();
  };

  useEffect(() => {
    if (isRegister) {
      setVerificationCode(generateVerificationCode());
      setInputCode('');
      setVerifyError('');
    }
  }, [isRegister]);

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    if (isRegister) {
      if (formData.password !== formData.confirmPassword) {
        setError('两次输入的密码不一致');
        setIsLoading(false);
        return;
      }

      if (inputCode !== verificationCode) {
        setError('验证码错误');
        setIsLoading(false);
        return;
      }

      try {
        const response = await fetch('http://localhost:3003/api/register', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            username: formData.username,
            password: formData.password,
            email: formData.email
          })
        });

        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.message || '注册失败');
        }

        if (data.success) {
          showToast('success', '注册成功！请登录');
          setError('');
          setFormData({
            username: '',
            password: '',
            confirmPassword: '',
            email: ''
          });
          setTimeout(() => {
            setIsRegister(false);
          }, 1000);
        } else {
          throw new Error(data.message || '注册失败');
        }
      } catch (error) {
        setError(error.message || '注册请求失败，请检查网络');
        setIsLoading(false);
        return;
      }
      setIsLoading(false);
      return;
    } else {
      try {
        const response = await fetch('http://localhost:3003/api/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            username: formData.username,
            password: formData.password
          })
        });

        const data = await response.json();
        
        if (data.success) {
          setIsGM(data.isGM);
          await new Promise(resolve => setTimeout(resolve, 800));
          onLogin(data.username);
        } else {
          setError(data.message);
        }
      } catch (error) {
        console.error('Login error:', error);
        setError('登录失败，请稍后重试');
      }
    }
    setIsLoading(false);
  };

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-blue-400 via-purple-400 to-pink-400 
                      flex items-center justify-center p-4 relative overflow-hidden">
        {/* 背景动画效果 */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/30 via-purple-500/30 to-pink-500/30 
                         animate-pulse"></div>
          <div className="absolute top-10 left-10 w-20 h-20 bg-yellow-300 rounded-full 
                         blur-xl animate-float opacity-50"></div>
          <div className="absolute bottom-10 right-10 w-32 h-32 bg-blue-300 rounded-full 
                         blur-xl animate-float-delay opacity-50"></div>
        </div>

        {/* 登录/注册卡片 */}
        <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-8 
                        transform transition-all duration-300 hover:scale-[1.02] relative z-10">
          {/* 标题装饰 */}
          <div className="absolute -top-6 left-1/2 transform -translate-x-1/2">
            <div className="bg-gradient-to-r from-blue-500 to-purple-500 rounded-full p-4 shadow-lg">
              <SparklesIcon className="w-8 h-8 text-white animate-pulse" />
            </div>
          </div>

          <h2 className="text-3xl font-bold text-center mb-8 mt-4 bg-gradient-to-r 
                         from-blue-600 via-purple-600 to-pink-600 text-transparent bg-clip-text">
            {isRegister ? '注册账号' : '魔兽世界'}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* 账号输入框 */}
            <div className="relative group">
              <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none
                             text-gray-400 group-focus-within:text-blue-500 transition-colors">
                <UserCircleIcon className="w-5 h-5" />
              </div>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleInputChange}
                placeholder="账号"
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-gray-50 border border-gray-200 
                           focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                           transition-all duration-200"
              />
            </div>

            {/* 密码输入框 */}
            <div className="relative group">
              <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none
                             text-gray-400 group-focus-within:text-blue-500 transition-colors">
                <LockClosedIcon className="w-5 h-5" />
              </div>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                placeholder="密码"
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-gray-50 border border-gray-200 
                           focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                           transition-all duration-200"
              />
            </div>

            {/* 注册时显示的额外字段 */}
            {isRegister && (
              <>
                {/* 确认密码 */}
                <div className="relative group">
                  <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none
                                 text-gray-400 group-focus-within:text-blue-500 transition-colors">
                    <LockClosedIcon className="w-5 h-5" />
                  </div>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    placeholder="确认密码"
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-gray-50 border border-gray-200 
                               focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                               transition-all duration-200"
                  />
                </div>

                {/* 邮箱 */}
                <div className="relative group">
                  <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none
                                 text-gray-400 group-focus-within:text-blue-500 transition-colors">
                    <EnvelopeIcon className="w-5 h-5" />
                  </div>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="邮箱"
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-gray-50 border border-gray-200 
                               focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                               transition-all duration-200"
                  />
                </div>

                {/* 验证码部分 */}
                <div className="space-y-4">
                  <div className="p-3 bg-gray-100 rounded-lg text-center">
                    <span className="text-2xl font-bold tracking-wider text-gray-700 font-mono">
                      {verificationCode}
                    </span>
                  </div>

                  <div>
                    <label className="block mb-2 font-medium">验证码</label>
                    <input
                      type="text"
                      maxLength="4"
                      value={inputCode}
                      onChange={(e) => {
                        const value = e.target.value.replace(/[^\d]/g, '');
                        setInputCode(value);
                        setVerifyError('');
                      }}
                      placeholder="请输入验证码"
                      className={`w-full px-4 py-3 rounded-lg border transition duration-200
                        ${isDarkMode 
                          ? 'bg-gray-700 text-white border-gray-600' 
                          : 'bg-white text-gray-800 border-gray-200'}
                        focus:outline-none focus:ring-2 focus:ring-blue-500`}
                      required
                    />
                  </div>
                </div>
              </>
            )}

            {error && (
              <div className="text-red-500 text-center text-sm animate-shake flex items-center justify-center">
                <span className="bg-red-100 px-4 py-2 rounded-full">{error}</span>
              </div>
            )}

            {/* 提交按钮 */}
            <button
              type="submit"
              disabled={isLoading || (isRegister && inputCode.length !== 4)}
              className="w-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 
                       hover:from-blue-600 hover:via-purple-600 hover:to-pink-600 
                       text-white font-medium py-3 px-4 rounded-xl transition-all duration-300 
                       transform hover:scale-[1.02] shadow-lg relative overflow-hidden group"
            >
              <div className="absolute inset-0 bg-white/20 transform -skew-x-12 -translate-x-full 
                             group-hover:translate-x-full transition-transform duration-700"></div>
              <div className="relative flex items-center justify-center gap-2">
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <>
                    <span>{isRegister ? '注册' : '登录'}</span>
                    <ArrowRightIcon className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </div>
            </button>

            {/* 切换按钮 */}
            <button
              type="button"
              onClick={() => {
                setIsRegister(!isRegister);
                setError('');
                setFormData({
                  username: '',
                  password: '',
                  confirmPassword: '',
                  email: ''
                });
              }}
              className="w-full text-gray-500 text-sm hover:text-gray-700 transition-colors duration-200"
            >
              {isRegister ? '已有账号？返回登录' : '没有账号？立即注册'}
            </button>

            {/* 测试账号信息 */}
            {!isRegister && (
              <div className="text-sm text-center text-gray-500 bg-gray-50 rounded-xl px-4 py-2">
                请用魔兽账号登录
              </div>
            )}
          </form>
        </div>
      </div>
    </>
  );
}

// 功能列表
const features = [
  {
    id: 'chat',
    name: '在线聊天',
    description: '与其他玩家实时聊天',
    icon: ChatBubbleBottomCenterTextIcon,
    color: 'from-blue-500 to-purple-500'
  },
  {
    id: 'unblock',
    name: '角色解卡',
    description: '解除角色卡死问题',
    icon: WrenchScrewdriverIcon,
    color: 'from-green-500 to-yellow-500'
  },
  {
    id: 'security',
    name: '账号安全',
    icon: ShieldCheckIcon,
    color: 'from-red-500 to-red-600',
    description: '保护您的账号安全'
  },
  {
    id: 'shop',
    name: '游戏商场',
    description: '购买游戏内物品',
    icon: ShoppingCartIcon,
    color: 'from-red-500 to-orange-500'
  },
  {
    id: 'market',
    name: '跳蚤市场',
    icon: ShoppingBagIcon,
    color: 'from-emerald-500 to-teal-500',
    description: '玩家之间的物品交易'
  },
  {
    id: 'characters',
    name: '角色管理',
    icon: UserGroupIcon,
    color: 'from-purple-500 to-purple-600',
    description: '管理您的游戏角色'
  },
  {
    id: 'achievements',
    name: '成就系统',
    icon: TrophyIcon,
    color: 'from-amber-500 to-yellow-600',
    description: '查看和追踪游戏成就'
  },
  {
    id: 'gifts',
    name: '礼包兑换',
    icon: GiftIcon,
    color: 'from-pink-500 to-rose-600',
    description: '兑换各类游戏礼包'
  },
  {
    id: 'repair',
    name: '角色修复',
    icon: WrenchScrewdriverIcon,
    color: 'from-cyan-500 to-sky-600',
    description: '修复角色装备和任务'
  }
];

// 功能选择组件
const FeatureSelect = ({ username, onFeatureSelect, isDarkMode, onThemeToggle, onLogout, isGM }) => {
  const [selectedFeature, setSelectedFeature] = useState(null);

  return (
    <div className={`h-screen flex flex-col`}>
      {/* 标题横幅 */}
      <div className={`h-16 flex-shrink-0 ${  
        isDarkMode
          ? 'bg-gradient-to-r from-blue-900 via-indigo-900 to-purple-900'
          : 'bg-gradient-to-r from-blue-600 via-indigo-500 to-purple-600'
      } shadow-lg relative overflow-hidden`}>
        {/* 装饰性光效 */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,white,transparent_60%)] opacity-20" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_-20%,white,transparent_60%)] opacity-20" />
        
        {/* 横幅内容 */}
        <div className="h-full px-4 flex items-center justify-between relative">
          {/* 欢迎信息 */}
          <div className={`text-sm ${isDarkMode ? 'text-blue-200' : 'text-blue-100'}`}>
            欢迎回来，
            <span className="font-medium">{username}</span>
          </div>

          {/* 标题 */}
          <h1 className={`absolute left-1/2 -translate-x-1/2 text-2xl font-bold tracking-wider uppercase ${
            isDarkMode ? 'text-blue-100' : 'text-white'
          } drop-shadow-[0_2px_2px_rgba(0,0,0,0.5)] font-serif
            animate-[pulse_3s_ease-in-out_infinite]`}
          >
            魔兽工具箱
          </h1>

          {/* 右侧控制区 */}
          <div className="flex items-center gap-4">
            {/* GM界面按钮 */}
            {isGM && (
              <button
                onClick={() => onFeatureSelect('gm-panel')}
                className={`px-4 py-2 rounded-lg text-white bg-red-600 hover:bg-red-700 transition duration-200`}
              >
                GM界面
              </button>
            )}

            {/* 主题切换按钮 */}
            <button
              onClick={onThemeToggle}
              className={`p-1.5 rounded-lg transition-colors duration-200 ${
                isDarkMode
                  ? 'text-blue-200 hover:bg-gray-700'
                  : 'text-blue-100 hover:bg-blue-500'
              }`}
            >
              {isDarkMode ? (
                <SunIcon className="w-5 h-5" />
              ) : (
                <MoonIcon className="w-5 h-5" />
              )}
            </button>

            {/* 注销按钮 */}
            <button
              onClick={onLogout}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-colors duration-200 ${
                isDarkMode
                  ? 'text-blue-200 hover:bg-gray-700'
                  : 'text-blue-100 hover:bg-blue-500'
              }`}
            >
              <ArrowRightOnRectangleIcon className="w-5 h-5" />
              <span className="text-sm">注销</span>
            </button>
          </div>
        </div>

        {/* 底部装饰边框 */}
        <div className={`absolute bottom-0 left-0 right-0 h-1 ${
          isDarkMode
            ? 'bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400'
            : 'bg-gradient-to-r from-blue-300 via-indigo-300 to-purple-300'
        } opacity-50`} />
      </div>

      {/* 功能列表 - 调整布局和样式 */}
      <div className={`flex-1 ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <div className="h-full grid grid-cols-3 gap-6 p-6 max-w-[1600px] mx-auto">
          {features.map((feature, index) => (
            <button
              key={feature.id}
              onClick={() => {
                setSelectedFeature(feature.id);
                onFeatureSelect(feature.id);
              }}
              className={`relative p-6 rounded-xl transition-all duration-300 
                         hover:scale-105 hover:-translate-y-1 group cursor-pointer
                         ${isDarkMode 
                           ? 'bg-gray-800/70' 
                           : 'bg-white/80'}
                         flex flex-col items-start justify-between
                         border border-transparent
                         ${isDarkMode 
                           ? 'hover:border-gray-700/30' 
                           : 'hover:border-gray-200/50'}
                         shadow-[0_0_20px_rgba(0,0,0,0.05)]
                         hover:shadow-[0_0_30px_rgba(0,0,0,0.08)]`}
              style={{
                animationDelay: `${index * 100}ms`,
                backgroundColor: selectedFeature === feature.id ? (isDarkMode ? '#4B5563' : '#F3F4F6') : '',
                boxShadow: selectedFeature === feature.id ? '0 0 20px rgba(0, 255, 0, 0.5)' : 'none'
              }}
            >
              {/* 背景渐变 */}
              <div className={`absolute inset-0 rounded-xl bg-gradient-to-br mix-blend-soft-light
                               ${isDarkMode ? 'opacity-8' : 'opacity-4'} ${feature.color}`} />
              
              {/* 悬停时的光效 */}
              <div className="absolute -inset-0.5 bg-gradient-to-r from-transparent via-white/3 to-transparent
                             rounded-xl opacity-0 group-hover:opacity-100 transition-all duration-500
                             animate-[shimmer_2s_infinite]" />

              {/* 内容区域 */}
              <div className="relative z-10 w-full">
                <div className="flex items-start justify-between mb-6">
                  {/* 图标容器 */}
                  <div className={`relative p-3 rounded-xl bg-gradient-to-br ${feature.color}
                                 shadow-lg transform group-hover:scale-110 transition-transform duration-300
                                 ${isDarkMode ? 'opacity-90' : 'opacity-95'}`}>
                    <feature.icon className="w-8 h-8 text-white" />
                    {/* 图标光晕效果 */}
                    <div className={`absolute inset-0 rounded-xl bg-gradient-to-br ${feature.color}
                                     opacity-0 group-hover:opacity-20 blur-md transition-opacity duration-300`} />
                  </div>

                  {/* 装饰点 */}
                  <div className="flex gap-1">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className={`w-1.5 h-1.5 rounded-full 
                                             transition-all duration-300 delay-${i * 100}
                                             group-hover:scale-150 group-hover:opacity-70
                                             ${isDarkMode 
                                               ? 'bg-gray-600/70' 
                                               : 'bg-gray-200/70'}`} />
                    ))}
                  </div>
                </div>

                {/* 标题和描述 */}
                <div className="space-y-3">
                  <h3 className={`text-xl font-bold transform group-hover:translate-x-1
                                transition-transform duration-300 ${
                                  isDarkMode ? 'text-gray-100' : 'text-gray-800'
                                }`}>
                    {feature.name}
                  </h3>
                  <p className={`transform group-hover:translate-x-1
                                transition-transform duration-300 ${
                                  isDarkMode ? 'text-gray-400' : 'text-gray-600'
                                }`}>
                    {feature.description}
                  </p>
                </div>
              </div>
              
              {/* 底部装饰线 */}
              <div className={`absolute bottom-0 left-0 right-0 h-1 rounded-b-xl
                             bg-gradient-to-r ${feature.color} opacity-0
                             group-hover:opacity-70 transition-opacity duration-300`} />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

function App() {
  const [currentUser, setCurrentUser] = useState(() => {
    const savedUser = localStorage.getItem('currentUser');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  
  const [isDarkMode, setIsDarkMode] = useState(() => {
    return localStorage.getItem('isDarkMode') === 'true';
  });

  // 添加 selectedFeature 的持久化
  const [selectedFeature, setSelectedFeature] = useState(() => {
    return localStorage.getItem('selectedFeature');
  });

  const [toast, setToast] = useState({ show: false, type: '', message: '' });
  const [isGM, setIsGM] = useState(() => {
    const stored = localStorage.getItem('isGM');
    return stored === 'true';
  });

  // 显示提示信息
  const showToast = (type, message) => {
    setToast({ show: true, type, message });
    setTimeout(() => {
      setToast({ show: false, type: '', message: '' });
    }, 3000);
  };

  // 处理登录
  const handleLogin = (username) => {
    // 保存用户信息到 localStorage
    const userInfo = {
      username,
      loginTime: new Date().toISOString()
    };
    localStorage.setItem('currentUser', JSON.stringify(userInfo));
    setCurrentUser(userInfo);
    showToast('success', '登录成功');
  };

  // 修改设置 GM 状态的函数
  const handleSetGM = (value) => {
    setIsGM(value);
    localStorage.setItem('isGM', value); // 将 GM 状态保存到 localStorage
  };

  // 处理登出
  const handleLogout = async () => {
    try {
      const response = await fetch('http://localhost:3003/api/logout', {
        method: 'POST',
      });
      
      // 无论后端响应如何，都执行前端登出操作
      setCurrentUser(null);
      localStorage.removeItem('currentUser');
      localStorage.removeItem('selectedFeature');
      setSelectedFeature(null);
      setIsGM(false);
      localStorage.removeItem('isGM');
      showToast('success', '已退出登录');
      
    } catch (error) {
      console.error('登出失败:', error);
      // 即使请求失败也执行前端登出
      setCurrentUser(null);
      localStorage.removeItem('currentUser');
      localStorage.removeItem('selectedFeature');
      setSelectedFeature(null);
      setIsGM(false);
      localStorage.removeItem('isGM');
      showToast('success', '已退出登录');
    }
  };

  // 保存主题设置
  useEffect(() => {
    localStorage.setItem('isDarkMode', isDarkMode);
  }, [isDarkMode]);

  // 检查登录状态是否过期
  useEffect(() => {
    if (currentUser) {
      const loginTime = new Date(currentUser.loginTime);
      const now = new Date();
      const hoursSinceLogin = (now - loginTime) / (1000 * 60 * 60);
      
      // 如果登录时间超过24小时，自动登出
      if (hoursSinceLogin > 24) {
        handleLogout();
        showToast('info', '登录已过期，请重新登录');
      }
    }
  }, [currentUser]);

  // 处理功能选择
  const handleFeatureSelect = (feature) => {
    if (feature === 'unblock') {
      // 进入角色解卡界面
      setSelectedFeature('unblock');
    } else {
      localStorage.setItem('selectedFeature', feature);
      setSelectedFeature(feature);
    }
  };

  // 返回到功能选择界面
  const handleBack = () => {
    localStorage.removeItem('selectedFeature');
    setSelectedFeature(null);
  };

  // 渲染选中的功能
  const renderFeature = () => {
    switch (selectedFeature) {
      case 'chat':
        return (
          <Chat 
            username={currentUser.username}
            isDarkMode={isDarkMode}
            onBack={handleBack}
          />
        );
      case 'unblock':
        return (
          <UnblockCharacter 
            username={currentUser.username}
            onBack={handleBack}
            isDarkMode={isDarkMode}
          />
        );
      case 'security':
        return (
          <AccountSecurity 
            username={currentUser.username}
            onBack={handleBack}
            isDarkMode={isDarkMode}
          />
        );
      case 'gm-panel':
        return (
          <GMPanel 
            onBack={handleBack}
            isDarkMode={isDarkMode}
          />
        );
      default:
        return (
          <FeatureSelect
            username={currentUser.username}
            onFeatureSelect={handleFeatureSelect}
            isDarkMode={isDarkMode}
            onThemeToggle={() => setIsDarkMode(!isDarkMode)}
            onLogout={handleLogout}
            isGM={isGM}
          />
        );
    }
  };

  return (
    <>
      {!currentUser ? (
        <Login 
          onLogin={handleLogin} 
          isDarkMode={isDarkMode}
          showToast={showToast}
          setIsGM={handleSetGM}
        />
      ) : (
        renderFeature()
      )}

      {/* Toast提示 */}
      {toast.show && (
        <Toast
          type={toast.type}
          message={toast.message}
          onClose={() => setToast({ show: false, type: '', message: '' })}
        />
      )}
    </>
  );
}

export default App

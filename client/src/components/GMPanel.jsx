import React, { useState, useEffect } from 'react';
import { 
  UserGroupIcon,
  CommandLineIcon,
  ArrowLeftIcon,
  ShieldCheckIcon
} from '@heroicons/react/24/outline';
import CharacterModal from './CharacterModal'; // 导入弹窗组件
import RemoteCommand from './RemoteCommand'; // 导入远程命令组件
import BanAccountModal from './BanAccountModal';

const GMPanel = ({ onBack, isDarkMode }) => {
  const [selectedMenu, setSelectedMenu] = useState(null);
  const [accounts, setAccounts] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [accountsPerPage] = useState(9); // 每页显示的账号数量
  const [selectedAccountId, setSelectedAccountId] = useState(null); // 选中的账号ID
  const [characters, setCharacters] = useState([]); // 角色信息
  const [isModalOpen, setIsModalOpen] = useState(false); // 控制弹窗的开关
  const [showBanModal, setShowBanModal] = useState(false);
  const [banningAccount, setBanningAccount] = useState(null);

  // 左侧菜单选项
  const menuItems = [
    {
      id: 'accounts',
      name: '账号管理',
      icon: UserGroupIcon,
      description: '管理游戏账号权限'
    },
    {
      id: 'commands',
      name: '远程命令',
      icon: CommandLineIcon,
      description: '执行GM命令'
    }
  ];

  // 获取所有账号
  const fetchAccounts = async () => {
    try {
      const response = await fetch('http://localhost:3003/api/accounts');
      if (response.status === 403) {
        alert('GM权限已失效，请重新登录');
        onBack(); // 返回主界面
        return;
      }
      const data = await response.json();
      if (data.success) {
        setAccounts(data.accounts);
      }
    } catch (error) {
      console.error('获取账号失败:', error);
    }
  };

  // 获取角色信息
  const fetchCharacters = async (accountId) => {
    try {
      const response = await fetch(`http://localhost:3003/api/characters/${accountId}`);
      const data = await response.json();
      if (data.success) {
        setCharacters(data.characters);
      }
    } catch (error) {
      console.error('获取角色失败:', error);
    }
  };

  // 打开角色弹窗
  const handleViewCharacters = (accountId) => {
    setSelectedAccountId(accountId);
    fetchCharacters(accountId);
    setIsModalOpen(true);
  };

  // 添加删除账号的处理函数
  const handleDeleteAccount = async (username) => {
    if (!window.confirm(`确定要删除账号 ${username} 吗？此操作不可恢复！`)) {
      return;
    }

    try {
      // 发送删除账号的命令
      const response = await fetch('http://localhost:3003/api/remote-command', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          command: `.account delete ${username}` 
        }),
      });

      const data = await response.json();
      if (data.success) {
        // 删除成功后重新获取账号列表
        await fetchAccounts();
        // 显示成功消息
        alert(`账号 ${username} 已成功删除`);
      } else {
        alert(`删除失败: ${data.message}`);
      }
    } catch (error) {
      console.error('删除账号失败:', error);
      alert('删除账号失败，请稍后重试');
    }
  };

  // 处理封禁账号
  const handleBanAccount = async (username, banTime, reason) => {
    try {
      const response = await fetch('http://localhost:3003/api/remote-command', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          command: `.ban account ${username} ${banTime}h ${reason}` 
        }),
      });

      const data = await response.json();
      if (data.success) {
        alert(`账号 ${username} 已被成功封禁`);
        setShowBanModal(false);
        setBanningAccount(null);
        // 可选：刷新账号列表
        await fetchAccounts();
      } else {
        alert(`封禁失败: ${data.message}`);
      }
    } catch (error) {
      console.error('封禁账号失败:', error);
      alert('封禁账号失败，请稍后重试');
    }
  };

  // 添加解禁账号的处理函数
  const handleUnbanAccount = async (username) => {
    if (!window.confirm(`确定要解禁账号 ${username} 吗？`)) {
      return;
    }

    try {
      const response = await fetch('http://localhost:3003/api/remote-command', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          command: `.unban account ${username}` 
        }),
      });

      const data = await response.json();
      if (data.success) {
        alert(`账号 ${username} 已成功解禁`);
        // 刷新账号列表
        await fetchAccounts();
      } else {
        alert(`解禁失败: ${data.message}`);
      }
    } catch (error) {
      console.error('解禁账号失败:', error);
      alert('解禁账号失败，请稍后重试');
    }
  };

  // 打开封禁模态框
  const openBanModal = (username) => {
    setBanningAccount(username);
    setShowBanModal(true);
  };

  // 渲染右侧内容区域
  const renderContent = () => {
    switch (selectedMenu) {
      case 'accounts':
        return (
          <div className="h-[calc(100vh-8rem)] flex flex-col bg-white rounded-lg shadow-md">
            <div className="p-6">
              <h2 className="text-2xl font-bold mb-6">账号管理</h2>
            </div>

            <div className="flex-1 overflow-auto px-6">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50 sticky top-0">
                  <tr>
                    <th className="px-6 py-3 text-left text-lg font-bold text-gray-500 uppercase tracking-wider text-center">
                      账号
                    </th>
                    <th className="px-6 py-3 text-left text-lg font-bold text-gray-500 uppercase tracking-wider text-center">
                      邮箱
                    </th>
                    <th className="px-6 py-3 text-left text-lg font-bold text-gray-500 uppercase tracking-wider text-center">
                      在线时长
                    </th>
                    <th className="px-6 py-3 text-left text-lg font-bold text-gray-500 uppercase tracking-wider text-center">
                      账号状态
                    </th>
                    <th className="px-6 py-3 text-left text-lg font-bold text-gray-500 uppercase tracking-wider text-center">
                      操作
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {accounts.slice((currentPage - 1) * accountsPerPage, currentPage * accountsPerPage).map(account => (
                    <tr key={account.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        {account.username}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        {account.email}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        {account.totaltime} 小时
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <span className={`px-2 py-1 rounded-full text-sm font-medium
                          ${account.is_banned 
                            ? 'bg-red-100 text-red-800' 
                            : 'bg-green-100 text-green-800'
                          }`}
                        >
                          {account.is_banned ? '已封禁' : '正常'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <div className="flex justify-center items-center space-x-2">
                          <button 
                            onClick={() => handleViewCharacters(account.id)}
                            className="w-20 px-2 py-1.5 bg-blue-500 text-white rounded-lg hover:bg-blue-600 
                              transition-colors duration-200 text-sm font-medium shadow-sm hover:shadow-md"
                          >
                            查看角色
                          </button>
                          <button 
                            onClick={() => openBanModal(account.username)}
                            className="w-20 px-2 py-1.5 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 
                              transition-colors duration-200 text-sm font-medium shadow-sm hover:shadow-md"
                          >
                            封禁账号
                          </button>
                          <button 
                            onClick={() => handleUnbanAccount(account.username)}
                            className="w-20 px-2 py-1.5 bg-green-500 text-white rounded-lg hover:bg-green-600 
                              transition-colors duration-200 text-sm font-medium shadow-sm hover:shadow-md"
                          >
                            解禁账号
                          </button>
                          <button 
                            onClick={() => handleDeleteAccount(account.username)}
                            className="w-20 px-2 py-1.5 bg-red-500 text-white rounded-lg hover:bg-red-600 
                              transition-colors duration-200 text-sm font-medium shadow-sm hover:shadow-md"
                          >
                            删除账号
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="p-6 border-t">
              <div className="flex justify-center items-center space-x-4">
                <button 
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  className={`px-6 py-2 rounded-full flex items-center space-x-2 transition-all duration-200 ${
                    currentPage === 1
                      ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                      : 'bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white shadow-lg hover:shadow-xl'
                  }`}
                  disabled={currentPage === 1}
                >
                  <ArrowLeftIcon className="w-5 h-5" />
                  <span>上一页</span>
                </button>

                <span className="px-4 py-2 bg-gray-100 rounded-full text-gray-700 font-medium">
                  第 {currentPage} / {Math.ceil(accounts.length / accountsPerPage)} 页
                </span>

                <button 
                  onClick={() => setCurrentPage(prev => prev + 1)}
                  className={`px-6 py-2 rounded-full flex items-center space-x-2 transition-all duration-200 ${
                    currentPage * accountsPerPage >= accounts.length
                      ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                      : 'bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white shadow-lg hover:shadow-xl'
                  }`}
                  disabled={currentPage * accountsPerPage >= accounts.length}
                >
                  <span>下一页</span>
                  <ArrowLeftIcon className="w-5 h-5 transform rotate-180" />
                </button>
              </div>
            </div>
          </div>
        );
      case 'commands':
        return (
          <div className="h-[calc(100vh-8rem)]">
            <RemoteCommand isDarkMode={isDarkMode} />
          </div>
        );
      default:
        return (
          <div className="flex items-center justify-center h-full">
            <p className="text-gray-500">请选择左侧功能选项</p>
          </div>
        );
    }
  };

  useEffect(() => {
    if (selectedMenu === 'accounts') {
      fetchAccounts();
    }
  }, [selectedMenu]);

  return (
    <div className={`min-h-screen flex flex-col ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-100'}`}>
      {/* 横幅标题 */}
      <div className={`w-full p-4 text-center text-2xl font-bold flex items-center justify-center ${isDarkMode ? 'bg-gradient-to-r from-blue-800 to-purple-800 text-white' : 'bg-gradient-to-r from-blue-400 to-purple-400 text-gray-800'}`}>
        <ShieldCheckIcon className="w-8 h-8 mr-2" />
        GM管理界面
      </div>

      <div className="flex flex-1">
        {/* 左侧菜单 */}
        <div className={`w-64 flex-shrink-0 flex flex-col ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
          <div className="flex-1 p-4">
            <div className="space-y-2">
              {menuItems.map(item => (
                <button
                  key={item.id}
                  onClick={() => setSelectedMenu(item.id)}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                    selectedMenu === item.id
                      ? isDarkMode 
                        ? 'bg-blue-600 text-white'
                        : 'bg-blue-500 text-white'
                      : isDarkMode
                        ? 'hover:bg-gray-700 text-gray-300'
                        : 'hover:bg-gray-100 text-gray-600'
                  }`}
                >
                  <item.icon className="w-5 h-5" />
                  <span>{item.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* 返回按钮 */}
          <div className="p-4 border-t border-gray-200">
            <button
              onClick={onBack}
              className={`w-full flex items-center justify-center space-x-2 px-6 py-3 rounded-lg 
                transition-all duration-200 transform hover:scale-105
                ${isDarkMode 
                  ? 'bg-gradient-to-r from-red-600 to-pink-600 text-white hover:from-red-700 hover:to-pink-700' 
                  : 'bg-gradient-to-r from-red-500 to-pink-500 text-white hover:from-red-600 hover:to-pink-600'
                } shadow-lg hover:shadow-xl`}
            >
              <ArrowLeftIcon className="w-5 h-5" />
              <span className="font-semibold">返回主界面</span>
            </button>
          </div>
        </div>

        {/* 右侧内容区域 */}
        <div className="flex-1 p-6">
          {renderContent()}
        </div>
      </div>

      {/* 弹窗组件 */}
      <CharacterModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        characters={characters} 
      />

      {/* 封禁账号模态框 */}
      <BanAccountModal
        isOpen={showBanModal}
        onClose={() => {
          setShowBanModal(false);
          setBanningAccount(null);
        }}
        onConfirm={handleBanAccount}
        username={banningAccount}
      />
    </div>
  );
};

export default GMPanel; 
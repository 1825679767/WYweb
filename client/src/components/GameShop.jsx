import React, { useState, useEffect } from 'react';
import { 
  ShoppingCartIcon, 
  PlusIcon, 
  PencilIcon, 
  TrashIcon,
  UserCircleIcon,
  CurrencyDollarIcon,
  SparklesIcon,
  GiftIcon,
  UserGroupIcon,
  ChevronDownIcon,
  ArrowLeftIcon,
  TagIcon,
  ClockIcon
} from '@heroicons/react/24/outline';
import AddItemModal from './AddItemModal';
import EditItemModal from './EditItemModal';
import Modal from './Modal'; // 导入通用的Modal组件

const GameShop = ({ username, isDarkMode, onBack }) => {
  const [items, setItems] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [characters, setCharacters] = useState([]);
  const [selectedCharacter, setSelectedCharacter] = useState('');
  const [isAdmin, setIsAdmin] = useState(false); // 用于控制编辑权限
  const [userPoints, setUserPoints] = useState(0);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [selectedPurchaseItem, setSelectedPurchaseItem] = useState(null);
  const [categories] = useState([
    { id: 'all', name: '全部商品' },
    { id: '坐骑', name: '坐骑' },
    { id: '宠物', name: '宠物' },
    { id: '武器', name: '武器' },
    { id: '护甲', name: '护甲' },
    { id: '消耗品', name: '消耗品' },
    { id: '其他', name: '其他' }
  ]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [purchaseHistory, setPurchaseHistory] = useState([]);
  const [historyPage, setHistoryPage] = useState(1);
  const [historyTotal, setHistoryTotal] = useState(0);
  const [historyTotalPages, setHistoryTotalPages] = useState(0);

  // 获取商品列表
  useEffect(() => {
    fetchItems();
    fetchCharacters();
    checkAdminStatus();
    fetchUserPoints();
  }, [username]);

  const fetchItems = async () => {
    try {
      const response = await fetch('http://localhost:3003/api/shop/items');
      const data = await response.json();
      if (data.success) {
        setItems(data.items);
      }
    } catch (error) {
      console.error('获取商品列表失败:', error);
    }
  };

  const fetchCharacters = async () => {
    try {
      const response = await fetch(`http://localhost:3003/api/characters?username=${username}`);
      const data = await response.json();
      if (data.success) {
        setCharacters(data.characters);
        if (data.characters.length > 0) {
          setSelectedCharacter(data.characters[0].name);
        }
      }
    } catch (error) {
      console.error('获取角色列表失败:', error);
    }
  };

  const checkAdminStatus = async () => {
    try {
      const response = await fetch(`http://localhost:3003/api/user/isAdmin?username=${encodeURIComponent(username)}`);
      if (!response.ok) {
        throw new Error('请求失败');
      }
      const data = await response.json();
      if (data.success) {
        setIsAdmin(data.isAdmin);
      } else {
        console.error('检查管理员状态失败:', data.message);
        setIsAdmin(false);
      }
    } catch (error) {
      console.error('检查管理员状态失败:', error);
      setIsAdmin(false);
    }
  };

  // 获取用户积分
  const fetchUserPoints = async () => {
    try {
      const response = await fetch(`http://localhost:3003/api/shop/points?username=${encodeURIComponent(username)}`);
      const data = await response.json();
      if (data.success) {
        setUserPoints(data.points);
      }
    } catch (error) {
      console.error('获取积分失败:', error);
    }
  };

  // 购买商品
  const handlePurchase = async (item) => {
    if (!selectedCharacter) {
      alert('请先选择接收物品的角色');
      return;
    }

    if (userPoints < item.price) {
      alert('积分不足');
      return;
    }

    // 显示确认弹窗
    setSelectedPurchaseItem(item);
    setShowConfirmModal(true);
  };

  // 修改确认购买函数
  const confirmPurchase = async () => {
    const item = selectedPurchaseItem;
    try {
      const response = await fetch('http://localhost:3003/api/shop/purchase', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username,
          characterName: selectedCharacter,
          itemId: item.id,
          amount: 1,
          subject: "商城购买",
          text: `您购买了 ${item.name}`
        }),
      });

      const data = await response.json();
      if (data.success) {
        setUserPoints(data.remainingPoints);
        alert('购买成功！物品已发送到您的邮箱');
      } else {
        alert(data.message || '购买失败');
      }
    } catch (error) {
      console.error('购买请求失败:', error);
      alert('购买失败，请稍后重试');
    } finally {
      setShowConfirmModal(false);
      setSelectedPurchaseItem(null);
    }
  };

  // 修改过滤商品列表的逻辑
  const filteredItems = items.filter(item => 
    selectedCategory === 'all' || item.category === selectedCategory
  );

  // 添加一个 useEffect 来打印调试信息
  useEffect(() => {
    console.log('当前分类:', selectedCategory);
    console.log('所有商品:', items);
    console.log('过滤后商品:', filteredItems);
  }, [selectedCategory, items]);

  // 计算分页数据
  const totalPages = Math.ceil(filteredItems.length / itemsPerPage);
  const paginatedItems = filteredItems.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // 添加获取购买记录的函数
  const fetchPurchaseHistory = async (page = 1) => {
    try {
      const response = await fetch(
        `http://localhost:3003/api/shop/purchase-history?username=${encodeURIComponent(username)}&page=${page}`
      );
      const data = await response.json();
      if (data.success) {
        setPurchaseHistory(data.records);
        setHistoryTotal(data.total);
        setHistoryTotalPages(data.totalPages);
        setHistoryPage(data.page);
      }
    } catch (error) {
      console.error('获取购买记录失败:', error);
    }
  };

  // 修改添加商品的处理函数
  const handleAddItem = async (itemData) => {
    try {
      const response = await fetch('http://localhost:3003/api/shop/items', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...itemData,
          category: itemData.category || '其他'
        }),
      });

      const data = await response.json();
      if (data.success) {
        fetchItems();
        setShowAddModal(false);
      } else {
        alert(data.message || '添加商品失败');
      }
    } catch (error) {
      console.error('添加商品失败:', error);
      alert('添加商品失败，请稍后重试');
    }
  };

  // 修改编辑商品的处理函数
  const handleEditItem = async (itemData) => {
    try {
      const response = await fetch(`http://localhost:3003/api/shop/items/${selectedItem.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...itemData,
          category: itemData.category || selectedItem.category || '其他'
        }),
      });

      const data = await response.json();
      if (data.success) {
        fetchItems();
        setShowEditModal(false);
      } else {
        alert(data.message || '更新商品失败');
      }
    } catch (error) {
      console.error('更新商品失败:', error);
      alert('更新商品失败，请稍后重试');
    }
  };

  const handleDeleteItem = async (id) => {
    if (!window.confirm('确定要删除这个商品吗？')) {
      return;
    }

    try {
      const response = await fetch(`http://localhost:3003/api/shop/items/${id}`, {
        method: 'DELETE',
      });

      const data = await response.json();
      if (data.success) {
        fetchItems(); // 刷新商品列表
      } else {
        alert(data.message || '删除商品失败');
      }
    } catch (error) {
      console.error('删除商品失败:', error);
      alert('删除商品失败，请稍后重试');
    }
  };

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-100'}`}>
      {/* 顶部导航栏 - 添加渐变背景和装饰 */}
      <div className={`p-4 relative overflow-hidden ${
        isDarkMode 
          ? 'bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900' 
          : 'bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500'
      } shadow-lg`}>
        {/* 装饰背景元素 */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-20 h-20 transform -translate-x-1/2 -translate-y-1/2">
            <ShoppingCartIcon className="w-full h-full" />
          </div>
          <div className="absolute top-0 right-0 w-16 h-16 transform translate-x-1/2 -translate-y-1/2">
            <GiftIcon className="w-full h-full" />
          </div>
        </div>

        <div className="container mx-auto flex justify-between items-center relative z-10">
          {/* 左侧：欢迎信息和积分 */}
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-2">
              <UserCircleIcon className="w-6 h-6 text-yellow-400" />
              <span className="text-lg text-white">
                欢迎你：{username}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <CurrencyDollarIcon className="w-6 h-6 text-yellow-400" />
              <span className="text-lg font-bold text-yellow-400">
                你的积分为：{userPoints}
              </span>
            </div>
          </div>

          {/* 中间：标题 */}
          <div className="flex items-center">
            <h1 className="text-2xl font-bold flex items-center text-white">
              <ShoppingCartIcon className="w-8 h-8 mr-2" />
              游戏商城
              <SparklesIcon className="w-6 h-6 ml-2 text-yellow-400 animate-pulse" />
            </h1>
          </div>

          {/* 右侧：功能按钮 */}
          <div className="flex items-center space-x-4">
            <div className="relative">
              <UserGroupIcon className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <select
                value={selectedCharacter}
                onChange={(e) => setSelectedCharacter(e.target.value)}
                className={`pl-10 pr-4 py-2 rounded-lg appearance-none ${
                  isDarkMode 
                    ? 'bg-gray-700 text-white border border-gray-600' 
                    : 'bg-white text-gray-800 border border-gray-200'
                }`}
              >
                {characters.map(char => (
                  <option key={char.name} value={char.name}>
                    {char.name} - {char.level}级{char.race}{char.class}
                  </option>
                ))}
              </select>
              <ChevronDownIcon className="w-5 h-5 absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>

            {isAdmin && (
              <button
                onClick={() => setShowAddModal(true)}
                className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 flex items-center transition-colors duration-200"
              >
                <PlusIcon className="w-5 h-5 mr-1" />
                添加商品
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 主要内容区域 - 修改布局 */}
      <div className="flex min-h-[calc(100vh-80px)]">
        {/* 左侧分类栏 */}
        <div className={`w-48 shrink-0 ${isDarkMode ? 'bg-gray-800' : 'bg-white'} flex flex-col`}>
          {/* 分类列表 */}
          <div className="p-4 flex-1">
            <h2 className="text-lg font-bold mb-4 flex items-center">
              <TagIcon className="w-5 h-5 mr-2" />
              商品分类
            </h2>
            <div className="space-y-2">
              {categories.map(category => (
                <button
                  key={category.id}
                  onClick={() => {
                    setSelectedCategory(category.id);
                    setCurrentPage(1);
                  }}
                  className={`w-full text-left px-4 py-2 rounded-lg transition-colors duration-200 flex items-center ${
                    selectedCategory === category.id
                      ? isDarkMode
                        ? 'bg-blue-600 text-white'
                        : 'bg-blue-500 text-white'
                      : isDarkMode
                        ? 'hover:bg-gray-700'
                        : 'hover:bg-gray-100'
                  }`}
                >
                  <span className="flex-1">{category.name}</span>
                  <span className="text-sm opacity-60">
                    ({items.filter(item => 
                      category.id === 'all' ? true : item.category === category.id
                    ).length})
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* 底部按钮 */}
          <div className="p-4 border-t border-gray-700">
            <div className="space-y-3">
              <button
                onClick={() => {
                  setShowHistoryModal(true);
                  fetchPurchaseHistory();
                }}
                className={`w-full px-4 py-2.5 rounded-lg transition-all duration-200 transform hover:scale-105 
                  ${isDarkMode 
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700' 
                    : 'bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600'
                  } text-white font-medium shadow-lg hover:shadow-xl flex items-center justify-center`}
              >
                <ClockIcon className="w-5 h-5 mr-2" />
                购买记录
              </button>
              <button
                onClick={onBack}
                className={`w-full px-4 py-2.5 rounded-lg transition-all duration-200 transform hover:scale-105
                  ${isDarkMode 
                    ? 'bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700' 
                    : 'bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600'
                  } text-white font-medium shadow-lg hover:shadow-xl flex items-center justify-center`}
              >
                <ArrowLeftIcon className="w-5 h-5 mr-2" />
                返回
              </button>
            </div>
          </div>
        </div>

        {/* 右侧商品区域 */}
        <div className="flex-1">
          <div className="h-[calc(100vh-80px)] flex flex-col p-6">
            <div className="max-w-7xl mx-auto w-full flex-1 flex flex-col">
              {/* 商品网格 - 调整卡片大小和布局 */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 flex-1">
                {paginatedItems.map(item => (
                  <div
                    key={item.id}
                    className={`${
                      isDarkMode ? 'bg-gray-800' : 'bg-white'
                    } rounded-lg shadow-lg overflow-hidden h-[340px] flex flex-col`} // 增加卡片高度
                  >
                    {/* 商品图片 - 增加高度 */}
                    <div className="relative w-full h-56 overflow-hidden bg-gray-200">
                      {item.image ? (
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <img
                          src={`https://wow.zamimg.com/images/wow/icons/large/${item.icon || 'inv_misc_questionmark'}.jpg`}
                          alt={item.name}
                          className="w-full h-full object-contain p-4"
                        />
                      )}
                    </div>
                    {/* 商品信息 - 调整内容布局 */}
                    <div className="p-4 flex flex-col flex-1">
                      <div className="flex-1">
                        <h3 className="text-lg font-bold truncate mb-1">{item.name}</h3>
                        <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} line-clamp-2`}>
                          {item.description}
                        </p>
                      </div>
                      <div className="mt-2">
                        <div className="flex items-center justify-between">
                          <span className="text-lg font-bold text-yellow-500">
                            {item.price} 积分
                          </span>
                          <div className="flex items-center space-x-2">
                            {isAdmin && (
                              <>
                                <button
                                  onClick={() => {
                                    setSelectedItem(item);
                                    setShowEditModal(true);
                                  }}
                                  className="p-1.5 text-blue-500 hover:bg-blue-100 rounded-lg"
                                >
                                  <PencilIcon className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleDeleteItem(item.id)}
                                  className="p-1.5 text-red-500 hover:bg-red-100 rounded-lg"
                                >
                                  <TrashIcon className="w-4 h-4" />
                                </button>
                              </>
                            )}
                            <button
                              onClick={() => handlePurchase(item)}
                              className="px-4 py-1.5 bg-blue-500 text-white text-sm rounded-lg hover:bg-blue-600"
                            >
                              购买
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* 分页控制 - 固定在底部 */}
              <div className="mt-4 pb-2">
                {totalPages > 1 && (
                  <div className="flex justify-center items-center space-x-2">
                    <button
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                      className={`px-4 py-2 rounded-lg ${
                        currentPage === 1
                          ? 'opacity-50 cursor-not-allowed'
                          : 'hover:bg-gray-700'
                      } ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}
                    >
                      上一页
                    </button>
                    <span className="px-4 py-2">
                      {currentPage} / {totalPages}
                    </span>
                    <button
                      onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                      disabled={currentPage === totalPages}
                      className={`px-4 py-2 rounded-lg ${
                        currentPage === totalPages
                          ? 'opacity-50 cursor-not-allowed'
                          : 'hover:bg-gray-700'
                      } ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}
                    >
                      下一页
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 添加商品模态框 */}
      <AddItemModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSubmit={handleAddItem}
        isDarkMode={isDarkMode}
      />

      {/* 编辑商品模态框 */}
      <EditItemModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        onSubmit={handleEditItem}
        item={selectedItem}
        isDarkMode={isDarkMode}
      />

      {/* 添加确认购买弹窗 */}
      <Modal
        isOpen={showConfirmModal}
        onClose={() => {
          setShowConfirmModal(false);
          setSelectedPurchaseItem(null);
        }}
        onConfirm={confirmPurchase}
        message={selectedPurchaseItem ? 
          `是否花费 ${selectedPurchaseItem.price} 积分购买 ${selectedPurchaseItem.name}？` 
          : ''
        }
      />

      {/* 添加购买记录模态框组件 */}
      <PurchaseHistoryModal
        isOpen={showHistoryModal}
        onClose={() => setShowHistoryModal(false)}
        isDarkMode={isDarkMode}
        purchaseHistory={purchaseHistory}
        historyPage={historyPage}
        historyTotalPages={historyTotalPages}
        onPageChange={fetchPurchaseHistory}
      />
    </div>
  );
};

// 将 PurchaseHistoryModal 组件修改为接收所需的props
const PurchaseHistoryModal = ({ 
  isOpen, 
  onClose, 
  isDarkMode,
  purchaseHistory,
  historyPage,
  historyTotalPages,
  onPageChange 
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      <div className="absolute inset-0 bg-black opacity-50" onClick={onClose}></div>
      <div className={`relative w-[800px] max-h-[80vh] p-6 rounded-lg shadow-xl overflow-hidden ${
        isDarkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'
      }`}>
        <h2 className="text-xl font-bold mb-4">购买记录</h2>
        <div className="overflow-auto max-h-[calc(80vh-120px)]">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="py-2">时间</th>
                <th className="py-2">物品</th>
                <th className="py-2">角色</th>
                <th className="py-2">价格</th>
                <th className="py-2">状态</th>
              </tr>
            </thead>
            <tbody>
              {purchaseHistory.map(record => (
                <tr key={record.id} className="border-b">
                  <td className="py-2 text-center">{new Date(record.created_at).toLocaleString()}</td>
                  <td className="py-2 text-center">{record.item_name}</td>
                  <td className="py-2 text-center">{record.character_name}</td>
                  <td className="py-2 text-center">{record.price} 积分</td>
                  <td className="py-2 text-center">
                    {record.soap_result ? (
                      <span className="text-green-500">成功</span>
                    ) : (
                      <span className="text-red-500" title={record.error_message}>失败</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {/* 分页控制 */}
        {historyTotalPages > 1 && (
          <div className="flex justify-center items-center space-x-2 mt-4">
            <button
              onClick={() => onPageChange(historyPage - 1)}
              disabled={historyPage === 1}
              className={`px-4 py-2 rounded-lg ${
                historyPage === 1
                  ? 'opacity-50 cursor-not-allowed'
                  : isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
              } ${isDarkMode ? 'bg-gray-700 text-white' : 'bg-white'}`}
            >
              上一页
            </button>
            <span className="px-4 py-2">
              {historyPage} / {historyTotalPages}
            </span>
            <button
              onClick={() => onPageChange(historyPage + 1)}
              disabled={historyPage === historyTotalPages}
              className={`px-4 py-2 rounded-lg ${
                historyPage === historyTotalPages
                  ? 'opacity-50 cursor-not-allowed'
                  : isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
              } ${isDarkMode ? 'bg-gray-700 text-white' : 'bg-white'}`}
            >
              下一页
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default GameShop; 
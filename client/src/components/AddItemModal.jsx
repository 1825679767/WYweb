import React, { useState } from 'react';

const AddItemModal = ({ isOpen, onClose, onSubmit, isDarkMode }) => {
  const [formData, setFormData] = useState({
    name: '',
    itemId: '',
    description: '',
    price: '',
    image: '',
    category: 'other'
  });

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
    setFormData({
      name: '',
      itemId: '',
      description: '',
      price: '',
      image: '',
      category: 'other'
    });
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      <div className="absolute inset-0 bg-black opacity-50" onClick={onClose}></div>
      <div className={`relative w-[500px] p-6 rounded-lg shadow-xl ${
        isDarkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'
      }`}>
        <h2 className="text-xl font-bold mb-4">添加商品</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">商品名称</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              className={`w-full px-3 py-2 rounded-lg ${
                isDarkMode ? 'bg-gray-700 text-white' : 'bg-gray-100'
              }`}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">物品ID</label>
            <input
              type="number"
              value={formData.itemId}
              onChange={(e) => setFormData({...formData, itemId: e.target.value})}
              className={`w-full px-3 py-2 rounded-lg ${
                isDarkMode ? 'bg-gray-700 text-white' : 'bg-gray-100'
              }`}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">商品描述</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              className={`w-full px-3 py-2 rounded-lg ${
                isDarkMode ? 'bg-gray-700 text-white' : 'bg-gray-100'
              }`}
              rows="3"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">价格(积分)</label>
            <input
              type="number"
              value={formData.price}
              onChange={(e) => setFormData({...formData, price: e.target.value})}
              className={`w-full px-3 py-2 rounded-lg ${
                isDarkMode ? 'bg-gray-700 text-white' : 'bg-gray-100'
              }`}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">图片URL</label>
            <input
              type="text"
              value={formData.image}
              onChange={(e) => setFormData({...formData, image: e.target.value})}
              className={`w-full px-3 py-2 rounded-lg ${
                isDarkMode ? 'bg-gray-700 text-white' : 'bg-gray-100'
              }`}
              placeholder="可选"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">商品分类</label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({...formData, category: e.target.value})}
              className={`w-full px-3 py-2 rounded-lg ${
                isDarkMode ? 'bg-gray-700 text-white' : 'bg-gray-100'
              }`}
              required
            >
              <option value="坐骑">坐骑</option>
              <option value="宠物">宠物</option>
              <option value="武器">武器</option>
              <option value="护甲">护甲</option>
              <option value="消耗品">消耗品</option>
              <option value="其他">其他</option>
            </select>
          </div>
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className={`px-4 py-2 rounded-lg ${
                isDarkMode ? 'bg-gray-700' : 'bg-gray-200'
              }`}
            >
              取消
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
            >
              添加
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddItemModal; 
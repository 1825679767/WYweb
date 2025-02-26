import React, { useState, useEffect } from 'react';

const EditItemModal = ({ isOpen, onClose, onSubmit, item, isDarkMode }) => {
  const [formData, setFormData] = useState({
    name: '',
    itemId: '',
    description: '',
    price: '',
    image: ''
  });

  useEffect(() => {
    if (item) {
      setFormData({
        name: item.name || '',
        itemId: item.itemId || '',
        description: item.description || '',
        price: item.price || '',
        image: item.image || ''
      });
    }
  }, [item]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      <div className="absolute inset-0 bg-black opacity-50" onClick={onClose}></div>
      <div className={`relative w-[500px] p-6 rounded-lg shadow-xl ${
        isDarkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'
      }`}>
        <h2 className="text-xl font-bold mb-4">编辑商品</h2>
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
              保存
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditItemModal; 
import React, { useState } from 'react';

const SendMoneyModal = ({ isOpen, onClose, onConfirm, characterName }) => {
  const [amount, setAmount] = useState('');
  const [subject, setSubject] = useState('金币邮件');
  const [text, setText] = useState('这是您的金币');

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onConfirm(characterName, subject, text, amount);
    setAmount('');
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      <div className="absolute inset-0 bg-black opacity-50" onClick={onClose}></div>
      <div className="bg-white rounded-lg shadow-xl z-10 p-6 w-[500px]">
        <h2 className="text-xl font-bold mb-4">发送金币给 {characterName}</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              金币数量 <span className="text-gray-500 text-xs">(单位：铜)</span>
            </label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="1金=10000铜，1银=100铜"
              min="1"
              required
            />
            <p className="mt-1 text-xs text-gray-500">
              示例：1金币 = 10000铜，1银币 = 100铜
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              邮件标题
            </label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              邮件内容
            </label>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows="2"
              required
            />
          </div>
          <div className="flex justify-end space-x-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
            >
              取消
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors"
            >
              发送金币
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SendMoneyModal; 
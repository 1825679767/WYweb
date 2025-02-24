import React, { useState } from 'react';
import BanCharacterModal from './BanCharacterModal';
import SendItemModal from './SendItemModal';
import SendMoneyModal from './SendMoneyModal';

const CharacterModal = ({ isOpen, onClose, characters }) => {
  const [showBanModal, setShowBanModal] = useState(false);
  const [showItemModal, setShowItemModal] = useState(false);
  const [showMoneyModal, setShowMoneyModal] = useState(false);
  const [selectedCharacter, setSelectedCharacter] = useState(null);

  if (!isOpen) return null;

  // 处理角色封禁
  const handleBanCharacter = async (characterName, banTime, reason) => {
    try {
      const response = await fetch('http://localhost:3003/api/remote-command', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          command: `.ban character ${characterName} ${banTime}h ${reason}` 
        }),
      });

      const data = await response.json();
      if (data.success) {
        alert(`角色 ${characterName} 已被成功封禁`);
        setShowBanModal(false);
      } else {
        alert(`封禁失败: ${data.message}`);
      }
    } catch (error) {
      console.error('封禁角色失败:', error);
      alert('封禁角色失败，请稍后重试');
    }
  };

  // 处理角色解禁
  const handleUnbanCharacter = async (characterName) => {
    if (!window.confirm(`确定要解禁角色 ${characterName} 吗？`)) {
      return;
    }

    try {
      const response = await fetch('http://localhost:3003/api/remote-command', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          command: `.unban character ${characterName}` 
        }),
      });

      const data = await response.json();
      if (data.success) {
        alert(`角色 ${characterName} 已成功解禁`);
      } else {
        alert(`解禁失败: ${data.message}`);
      }
    } catch (error) {
      console.error('解禁角色失败:', error);
      alert('解禁角色失败，请稍后重试');
    }
  };

  // 处理发送物品
  const handleSendItem = async (characterName, subject, text, itemId, amount) => {
    try {
      const response = await fetch('http://localhost:3003/api/remote-command', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          command: `.send items ${characterName} "${subject}" "${text}" ${itemId}:${amount}` 
        }),
      });

      const data = await response.json();
      if (data.success) {
        alert(`物品已成功发送给 ${characterName}`);
        setShowItemModal(false);
      } else {
        alert(`发送失败: ${data.message}`);
      }
    } catch (error) {
      console.error('发送物品失败:', error);
      alert('发送物品失败，请稍后重试');
    }
  };

  // 处理发送金币
  const handleSendMoney = async (characterName, subject, text, amount) => {
    try {
      const response = await fetch('http://localhost:3003/api/remote-command', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          command: `.send money ${characterName} "${subject}" "${text}" ${amount}` 
        }),
      });

      const data = await response.json();
      if (data.success) {
        alert(`金币已成功发送给 ${characterName}`);
        setShowMoneyModal(false);
      } else {
        alert(`发送失败: ${data.message}`);
      }
    } catch (error) {
      console.error('发送金币失败:', error);
      alert('发送金币失败，请稍后重试');
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      <div className="absolute inset-0 bg-black opacity-50" onClick={onClose}></div>
      <div className="bg-white rounded-lg shadow-lg z-10 p-6 w-[1000px] max-h-[80vh] overflow-y-auto">
        <h2 className="text-xl font-bold mb-4">角色信息</h2>
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-2 text-center">角色名</th>
              <th className="px-4 py-2 text-center">等级</th>
              <th className="px-4 py-2 text-center">种族</th>
              <th className="px-4 py-2 text-center">职业</th>
              <th className="px-4 py-2 text-center">金币</th>
              <th className="px-4 py-2 text-center">在线时间</th>
              <th className="px-4 py-2 text-center w-[280px]">操作</th>
            </tr>
          </thead>
          <tbody>
            {characters.map(character => (
              <tr key={character.name} className="hover:bg-gray-50">
                <td className="border px-4 py-2 text-center">{character.name}</td>
                <td className="border px-4 py-2 text-center">{character.level}</td>
                <td className="border px-4 py-2 text-center">{character.raceName}</td>
                <td className="border px-4 py-2 text-center">{character.className}</td>
                <td className="border px-4 py-2 text-center">
                  <span className="text-yellow-500">{character.money.gold}金</span>
                  <span className="text-gray-400">{character.money.silver}银</span>
                  <span className="text-orange-600">{character.money.copper}铜</span>
                </td>
                <td className="border px-4 py-2 text-center">{character.totaltime} 小时</td>
                <td className="border px-4 py-2">
                  <div className="flex justify-center space-x-2">
                    <button
                      onClick={() => {
                        setSelectedCharacter(character.name);
                        setShowBanModal(true);
                      }}
                      className="w-20 px-2 py-1.5 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors"
                    >
                      封禁角色
                    </button>
                    <button
                      onClick={() => handleUnbanCharacter(character.name)}
                      className="w-20 px-2 py-1.5 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                    >
                      解除封禁
                    </button>
                    <button
                      onClick={() => {
                        setSelectedCharacter(character.name);
                        setShowItemModal(true);
                      }}
                      className="w-20 px-2 py-1.5 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                    >
                      发送物品
                    </button>
                    <button
                      onClick={() => {
                        setSelectedCharacter(character.name);
                        setShowMoneyModal(true);
                      }}
                      className="w-20 px-2 py-1.5 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors"
                    >
                      发送金币
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="mt-4 flex justify-end">
          <button 
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
            onClick={onClose}
          >
            关闭
          </button>
        </div>
      </div>

      {/* 封禁角色模态框 */}
      <BanCharacterModal
        isOpen={showBanModal}
        onClose={() => {
          setShowBanModal(false);
          setSelectedCharacter(null);
        }}
        onConfirm={handleBanCharacter}
        characterName={selectedCharacter}
      />
      <SendItemModal
        isOpen={showItemModal}
        onClose={() => {
          setShowItemModal(false);
          setSelectedCharacter(null);
        }}
        onConfirm={handleSendItem}
        characterName={selectedCharacter}
      />
      <SendMoneyModal
        isOpen={showMoneyModal}
        onClose={() => {
          setShowMoneyModal(false);
          setSelectedCharacter(null);
        }}
        onConfirm={handleSendMoney}
        characterName={selectedCharacter}
      />
    </div>
  );
};

export default CharacterModal; 
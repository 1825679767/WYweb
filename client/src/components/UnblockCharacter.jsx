import React, { useState, useEffect } from 'react';
import { WrenchScrewdriverIcon } from '@heroicons/react/24/outline';
import Modal from './Modal'; // 导入模态框组件

const UnblockCharacter = ({ username, onBack, isDarkMode }) => {
  const [characters, setCharacters] = useState([]);
  const [selectedCharacter, setSelectedCharacter] = useState(null);
  const [message, setMessage] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false); // 控制模态框的状态

  // 获取角色列表
  useEffect(() => {
    const fetchCharacters = async () => {
      try {
        const response = await fetch(`http://localhost:3003/api/characters?username=${username}`);
        const data = await response.json();
        if (data.success) {
          setCharacters(data.characters);
        }
      } catch (error) {
        console.error('获取角色列表失败:', error);
      }
    };
    fetchCharacters();
  }, [username]);

  // 处理角色解卡
  const handleUnblock = () => {
    if (!selectedCharacter) {
      setMessage('请先选择一个角色。');
      return;
    }
    setIsModalOpen(true);
  };

  const confirmUnblock = async () => {
    const { name, race } = selectedCharacter;

    // 查询角色在线状态
    try {
      const response = await fetch(`http://localhost:3003/api/characters/online?name=${name}`);
      const data = await response.json();
      if (data.success) {
        const online = data.online;

        if (online) {
          setMessage('请将当前角色下线以后再执行。');
          setIsModalOpen(false);
          return;
        }

        // 根据种族设置新位置
        let newPosition;
        if (race === '人类' || race === '矮人' || race === '暗夜精灵' || race === '侏儒' || race === '德莱尼') { // 联盟
          newPosition = {
            position_x: -8832.83,
            position_y: 633.151,
            position_z: 94.2408,
            map: 0
          };
        } else if (race === '兽人' || race === '亡灵' || race === '牛头人' || race === '巨魔' || race === '血精灵') { // 部落
          newPosition = {
            position_x: 1601.08,
            position_y: -4378.69,
            position_z: 9.98559,
            map: 1
          };
        } else {
          setMessage('未知种族，无法解卡。');
          setIsModalOpen(false);
          return;
        }

        const unblockResponse = await fetch(`http://localhost:3003/api/characters/unblock`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ name, ...newPosition })
        });

        const unblockData = await unblockResponse.json();
        if (unblockData.success) {
          setMessage('角色解卡成功！');
        } else {
          setMessage(`解卡失败: ${unblockData.message}`);
        }
      } else {
        setMessage(`查询在线状态失败: ${data.message}`);
      }
    } catch (error) {
      console.error('查询在线状态请求失败:', error);
      setMessage('查询在线状态请求失败，请稍后重试。');
    } finally {
      setIsModalOpen(false);
    }
  };

  return (
    <div className={`min-h-screen flex items-center justify-center ${isDarkMode ? 'bg-gray-900' : 'bg-gradient-to-br from-blue-400 via-purple-500 to-pink-500'}`}>
      <div className={`p-8 rounded-xl shadow-lg w-full max-w-lg ${isDarkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'}`}>
        <h2 className="text-4xl font-bold mb-4 flex items-center justify-center">
          <WrenchScrewdriverIcon className="w-10 h-10 mr-2 text-blue-600" />
          角色解卡
        </h2>
        <div className="mb-6">
          <label className="block mb-2">{isDarkMode ? '选择角色:' : '选择角色:'}</label>
          <select
            value={selectedCharacter ? selectedCharacter.id : ''}
            onChange={(e) => {
              const character = characters.find(char => char.id === parseInt(e.target.value));
              setSelectedCharacter(character);
            }}
            className={`border rounded p-3 w-full ${isDarkMode ? 'bg-gray-700 text-white' : 'bg-white text-gray-800'} shadow-sm`}
          >
            <option value="">请选择角色</option>
            {characters.map(character => (
              <option key={character.id} value={character.id}>
                {character.name} - {character.race}
              </option>
            ))}
          </select>
        </div>
        <div className="flex justify-center space-x-4">
          <button
            onClick={handleUnblock}
            className={`rounded px-6 py-3 text-lg font-semibold transition-all duration-300 shadow-md ${isDarkMode ? 'bg-green-500 text-white hover:bg-green-600' : 'bg-green-600 text-white hover:bg-green-700'}`}
          >
            确认解卡
          </button>
          <button
            onClick={onBack}
            className={`rounded px-6 py-3 text-lg font-semibold transition-all duration-300 shadow-md ${isDarkMode ? 'bg-gray-600 text-white hover:bg-gray-500' : 'bg-gray-300 text-black hover:bg-gray-400'}`}
          >
            返回
          </button>
        </div>
        {message && (
          <p className={`mt-4 text-center text-lg ${message.includes('成功') ? 'text-green-500' : 'text-red-500'}`}>
            {message}
          </p>
        )}
        <p className={`mt-6 text-center text-lg font-bold ${isDarkMode ? 'text-yellow-400' : 'text-red-600'}`}>
          解卡前，请将角色下线！
        </p>
      </div>

      {/* 模态框 */}
      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onConfirm={confirmUnblock} 
        message={`是否确认角色 ${selectedCharacter ? selectedCharacter.name : ''} 解卡？`} 
      />
    </div>
  );
};

export default UnblockCharacter; 
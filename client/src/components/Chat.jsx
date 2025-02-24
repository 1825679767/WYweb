import React, { useState, useEffect, useRef } from 'react';
import { 
  ChevronRightIcon, 
  PaperAirplaneIcon, 
  ChevronUpDownIcon,
  ChevronDownIcon,
  UserGroupIcon,
  UserCircleIcon,
  ArrowLeftIcon,
  UserIcon
} from '@heroicons/react/24/outline';
import { SparklesIcon } from '@heroicons/react/24/outline';

// 种族和职业映射
const raceMap = {
  1: '人类',
  2: '兽人',
  3: '矮人',
  4: '暗夜精灵',
  5: '亡灵',
  6: '牛头人',
  7: '侏儒',
  8: '巨魔',
  10: '血精灵',
  11: '德莱尼'
};

const classMap = {
  1: '战士',
  2: '圣骑士',
  3: '猎人',
  4: '潜行者',
  5: '牧师',
  6: '死亡骑士',
  7: '萨满',
  8: '法师',
  9: '术士',
  11: '德鲁伊'
};

export function Chat({ username, isDarkMode, onBack }) {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [selectedChannel, setSelectedChannel] = useState('世界频道');
  const [showFriendsList, setShowFriendsList] = useState(true);
  const [characters, setCharacters] = useState([]);
  const [selectedCharacter, setSelectedCharacter] = useState(null);
  const [showCharacterSelect, setShowCharacterSelect] = useState(false);
  const messagesEndRef = useRef(null);
  const [lastMessageId, setLastMessageId] = useState(0);

  // 获取角色列表
useEffect(() => {
    const fetchCharacters = async () => {
      try {
        const response = await fetch(`http://localhost:3003/api/characters?username=${username}`);
        const data = await response.json();
        if (data.success) {
          console.log('获取到的角色数据:', data.characters);
          // 确保每个角色的 online 字段保持为数字类型
          const processedCharacters = data.characters.map(char => ({
            ...char,
            guid: char.id,
            online: Number(char.online)  // 确保 online 是数字类型
          }));
          console.log('处理后的角色数据:', processedCharacters);
          setCharacters(processedCharacters);
        }
      } catch (error) {
        console.error('获取角色列表失败:', error);
      }
    };
    fetchCharacters();
  }, [username]);

  // 获取好友列表
  const fetchFriendsList = async (characterId) => {
    try {
      console.log('正在获取角色ID的好友列表:', characterId);
      // 从现有角色数据中获取好友列表
      const character = characters.find(char => char.id === characterId);
      if (character && Array.isArray(character.friends)) {
        // 确保好友的 online 字段也是数字类型
        const processedFriends = character.friends.map(friend => ({
          ...friend,
          online: Number(friend.online)
        }));
        console.log('从现有数据中获取好友列表:', processedFriends);
        return processedFriends;
      }
      
      // 如果现有数据中没有好友列表，则从API获取
      const response = await fetch(`http://localhost:3003/api/characters/${characterId}/friends`);
      const data = await response.json();
      console.log('API返回的原始数据:', data);
      
      if (data.success) {
        // 确保API返回的好友数据中 online 字段也是数字类型
        const processedFriends = Array.isArray(data.friends) 
          ? data.friends.map(friend => ({
              ...friend,
              online: Number(friend.online)
            }))
          : [];
        return processedFriends;
      }
      return [];
    } catch (error) {
      console.error('获取好友列表失败:', error);
      return [];
    }
  };

  // 处理角色选择
  const handleCharacterSelect = async (character) => {
    console.log('选择角色:', character);
    // 使用 id 而不是 guid
    const friends = await fetchFriendsList(character.id);
    console.log('获取到的好友列表:', friends);
    
    const updatedCharacter = {
      ...character,
      friends: friends || []
    };
    console.log('更新后的角色数据:', updatedCharacter);
    
    setSelectedCharacter(updatedCharacter);
    setShowCharacterSelect(false);
    setShowFriendsList(true);
  };

  // 初始化选择第一个角色
  useEffect(() => {
    const initializeCharacter = async () => {
      if (characters.length > 0 && !selectedCharacter) {
        console.log('初始化第一个角色');
        await handleCharacterSelect(characters[0]);
      }
    };
    
    initializeCharacter();
  }, [characters]);

  // 修改自动滚动行为
  useEffect(() => {
    // 使用 scrollIntoView 但不使用平滑滚动
    messagesEndRef.current?.scrollIntoView();
  }, [messages]);

  // 获取聊天记录
  const fetchChatHistory = async (isInitial = false) => {
    try {
      const response = await fetch('http://localhost:3003/api/chat/history');
      const data = await response.json();
      if (data.success) {
        const formattedMessages = data.history.map(msg => ({
          id: msg.id,
          sender: msg.characterName,
          content: msg.content,
          timestamp: new Date(msg.timestamp).toLocaleTimeString(),
          race: msg.race,
          class: msg.class
        }));

        if (isInitial) {
          // 初始加载时，设置所有消息并立即滚动到底部
          setMessages(formattedMessages.reverse());
          // 使用 setTimeout 确保在下一个渲染周期执行滚动
          setTimeout(() => {
            messagesEndRef.current?.scrollIntoView();
          }, 0);
          
          if (formattedMessages.length > 0) {
            setLastMessageId(Math.max(...formattedMessages.map(m => m.id)));
          }
        } else {
          // 检查新消息，排除乐观更新的消息
          const newMessages = formattedMessages.filter(msg => msg.id > lastMessageId);
          if (newMessages.length > 0) {
            setMessages(prev => {
              // 移除所有乐观更新的消息
              const withoutOptimistic = prev.filter(msg => !msg.isOptimistic);
              // 添加新消息
              return [...withoutOptimistic, ...newMessages.reverse()];
            });
            setLastMessageId(Math.max(...newMessages.map(m => m.id)));
          }
        }
      }
    } catch (error) {
      console.error('获取聊天记录失败:', error);
    }
  };

  // 初始加载聊天记录
  useEffect(() => {
    fetchChatHistory(true);
}, []);

  // 定时检查新消息
  useEffect(() => {
    const intervalId = setInterval(() => {
      fetchChatHistory(false);
    }, 1000); // 调整为1秒检查一次

    return () => clearInterval(intervalId);
  }, [lastMessageId]);

// 修改发送消息的处理函数
  const handleSend = async () => {
    if (!inputMessage.trim() || !selectedCharacter) return;
    const messageContent = inputMessage;

    // 乐观更新：立即显示发送的消息
    const tempMessage = {
      id: `temp-${Date.now()}`, // 使用特殊的临时ID格式
      sender: selectedCharacter.name,
      content: messageContent,
      timestamp: new Date().toLocaleTimeString(),
      race: selectedCharacter.race,
      class: selectedCharacter.class,
      isOptimistic: true
    };

    setMessages(prev => [...prev, tempMessage]);
    setInputMessage('');

    try {
      const response = await fetch('http://localhost:3003/api/chat/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          accountId: selectedCharacter.accountId,
          accountName: selectedCharacter.accountName,
          characterId: selectedCharacter.id,
          characterName: selectedCharacter.name,
          race: selectedCharacter.raceId,
          classId: selectedCharacter.classId,
          message: messageContent
        })
      });

      const data = await response.json();
      if (!data.success) {
        // 如果发送失败，移除乐观更新的消息
        setMessages(prev => prev.filter(msg => msg.id !== tempMessage.id));
        console.error('发送消息失败:', data.message);
      } else {
        // 发送成功后，等待下一次轮询自动更新
        // 不需要手动添加消息
      }
    } catch (error) {
      // 网络错误时移除乐观更新的消息
      setMessages(prev => prev.filter(msg => msg.id !== tempMessage.id));
      console.error('发送消息失败:', error);
    }
  };

  return (
    <div className="h-screen flex flex-col">
      {/* 标题横幅 */}
      <div className={`h-16 flex-shrink-0 ${  // 添加 flex-shrink-0 防止标题被压缩
        isDarkMode
          ? 'bg-gradient-to-r from-blue-900 via-indigo-900 to-purple-900'
          : 'bg-gradient-to-r from-blue-600 via-indigo-500 to-purple-600'
      } shadow-lg relative overflow-hidden`}>
        {/* 装饰性光效 */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,white,transparent_60%)] opacity-20" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_-20%,white,transparent_60%)] opacity-20" />
        
        {/* 标题文字 */}
        <div className="h-full flex items-center justify-center relative">
          <h1 className={`text-2xl font-bold tracking-wider uppercase ${
            isDarkMode ? 'text-blue-100' : 'text-white'
          } drop-shadow-[0_2px_2px_rgba(0,0,0,0.5)] font-serif
            animate-[pulse_3s_ease-in-out_infinite]`}
          >
            魔兽世界聊天室
          </h1>
          
          {/* 装饰性图标 */}
          <div className="absolute left-4 top-1/2 -translate-y-1/2">
            <div className={`w-8 h-8 ${
              isDarkMode ? 'text-blue-300' : 'text-blue-100'
            }`}>
              <SparklesIcon className="w-full h-full animate-[pulse_2s_ease-in-out_infinite]" />
            </div>
          </div>
          <div className="absolute right-4 top-1/2 -translate-y-1/2">
            <div className={`w-8 h-8 ${
              isDarkMode ? 'text-purple-300' : 'text-purple-100'
            }`}>
              <SparklesIcon className="w-full h-full animate-[pulse_2s_ease-in-out_infinite_0.5s]" />
            </div>
          </div>
        </div>

        {/* 底部装饰边框 */}
        <div className={`absolute bottom-0 left-0 right-0 h-1 ${
          isDarkMode
            ? 'bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400'
            : 'bg-gradient-to-r from-blue-300 via-indigo-300 to-purple-300'
        } opacity-50`} />
      </div>

      {/* 主内容区域 - 使用 flex-1 和 min-h-0 确保正确滚动 */}
      <div className={`flex-1 flex min-h-0 ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
        {/* 左侧栏 - 添加 flex-shrink-0 防止收缩 */}
        <div className={`w-64 flex-shrink-0 flex flex-col border-r ${
          isDarkMode 
            ? 'bg-gray-800 border-gray-700' 
            : 'bg-white border-gray-200 shadow-lg'
        } relative z-10`}>
          {/* 装饰性渐变背景 */}
          <div className="absolute inset-0 bg-gradient-to-b from-blue-500/10 to-purple-500/10 opacity-20 pointer-events-none" />
          
          {/* 频道列表区域 */}
          <div className="flex-1 p-4">
            <div className="space-y-2">
              {/* 世界频道 */}
              <button
                onClick={() => setSelectedChannel('世界频道')}
                className={`group w-full text-left px-3 py-2 rounded-lg transition-all duration-200 ${
                  selectedChannel === '世界频道'
                    ? isDarkMode 
                      ? 'bg-blue-600 text-white shadow-lg' 
                      : 'bg-blue-100 text-blue-600 shadow-md border border-blue-200'
                    : isDarkMode
                      ? 'text-gray-300 hover:bg-gray-700/50 hover:text-white'
                      : 'text-gray-600 hover:bg-gray-100 border border-transparent hover:border-gray-200'
                }`}
              >
                <div className="flex items-center gap-2">
                  <SparklesIcon className="w-4 h-4 flex-shrink-0" />
                  <span>世界频道</span>
                </div>
              </button>

              {/* 好友列表（可展开） */}
              <div>
                <button
                  onClick={() => setShowFriendsList(!showFriendsList)}
                  className={`group w-full text-left px-3 py-2 rounded-lg flex items-center justify-between transition-all duration-200 ${
                    showFriendsList
                      ? isDarkMode 
                        ? 'bg-purple-600 text-white shadow-lg' 
                        : 'bg-purple-100 text-purple-600 shadow-md border border-purple-200'
                      : isDarkMode
                        ? 'text-gray-300 hover:bg-gray-700/50 hover:text-white'
                        : 'text-gray-600 hover:bg-gray-100 border border-transparent hover:border-gray-200'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <UserGroupIcon className="w-4 h-4 flex-shrink-0" />
                    <span>好友列表</span>
                  </div>
                  <ChevronDownIcon 
                    className={`w-4 h-4 transform transition-transform ${
                      showFriendsList ? 'rotate-180' : ''
                    }`}
                  />
                </button>

                {/* 展开的好友列表 */}
                {showFriendsList && selectedCharacter && (
                  <div className="ml-4 mt-1 space-y-1">
                    {console.log('当前选中角色:', selectedCharacter)}
                    {console.log('好友列表数据:', selectedCharacter.friends)}
                    {selectedCharacter.friends?.map(friend => {
                      console.log('渲染好友:', friend);
                      return (
                        <div
                          key={friend.name}
                          className={`w-full px-3 py-2 rounded-lg ${
                            isDarkMode
                              ? 'bg-gray-700/50 text-gray-300' 
                              : 'bg-gray-50 text-gray-600 border border-gray-200'
                          }`}
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <div className={`relative ${
                              Number(friend.online) === 1  // 确保转换为数字进行比较
                                ? 'text-green-400' 
                                : 'text-gray-400'
                            }`}>
                              <UserIcon className="w-5 h-5" />
                              <div className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 ${
                                isDarkMode ? 'border-gray-700' : 'border-gray-50'
                              } ${
                                Number(friend.online) === 1  // 确保转换为数字进行比较
                                  ? 'bg-green-400 animate-pulse' 
                                  : 'bg-gray-400'
                              }`} />
                            </div>
                            <div className="flex flex-col min-w-0">
                              <div className="flex items-center gap-1">
                                <span className="text-sm font-medium truncate">
                                  {friend.name}
                                </span>
                                <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                                  isDarkMode 
                                    ? 'bg-gray-600 text-gray-300' 
                                    : 'bg-gray-200 text-gray-600'
                                }`}>
                                  {friend.level}
                                </span>
                              </div>
                              <span className={`text-xs truncate ${
                                isDarkMode ? 'text-gray-400' : 'text-gray-500'
                              }`}>
                                {friend.race} {friend.class}
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* 底部控制区域 */}
          <div className={`p-4 border-t ${
            isDarkMode ? 'border-gray-700' : 'border-gray-200'
          } relative`}>
            {/* 装饰性渐变背景 */}
            <div className="absolute inset-0 bg-gradient-to-t from-blue-500/10 to-purple-500/10 opacity-20 -z-10" />
            
            {/* 角色选择下拉框 */}
            <div className="mb-2">
              <button
                onClick={() => setShowCharacterSelect(!showCharacterSelect)}
                className={`group w-full flex items-center justify-between px-3 py-2 rounded-lg transition-all duration-200 ${
                  isDarkMode 
                    ? 'bg-gray-700 text-white hover:bg-gray-600 shadow-md' 
                    : 'bg-white text-gray-900 hover:bg-gray-50 shadow-md border border-gray-200'
                }`}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <UserCircleIcon className="w-4 h-4 flex-shrink-0" />
                  <div className="truncate">
                    {selectedCharacter ? (
                      <>
                        <span className="font-medium">{selectedCharacter.name}</span>
                        <span className="text-xs ml-1 opacity-75">
                          ({selectedCharacter.level} {selectedCharacter.race} {selectedCharacter.class})
                        </span>
                      </>
                    ) : '选择角色'}
                  </div>
                </div>
                <ChevronUpDownIcon className="w-4 h-4 flex-shrink-0 ml-2" />
              </button>

              {/* 角色列表下拉菜单 */}
              {showCharacterSelect && (
                <div className={`absolute bottom-[90px] left-4 right-4 rounded-lg shadow-xl ${
                  isDarkMode ? 'bg-gray-700' : 'bg-white'
                } border ${
                  isDarkMode ? 'border-gray-600' : 'border-gray-200'
                } transform transition-all duration-200 origin-bottom`}>
                  {characters.map((char) => (
                    <button
                      key={char.name}
                      onClick={() => handleCharacterSelect(char)}
                      className={`w-full text-left px-3 py-2 text-sm flex items-center justify-between transition-colors duration-200 ${
                        selectedCharacter?.name === char.name
                          ? isDarkMode
                            ? 'bg-gray-600 text-white'
                            : 'bg-blue-50 text-blue-600'
                          : isDarkMode
                            ? 'text-gray-200 hover:bg-gray-600/50'
                            : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex flex-col">
                        <span className="font-medium">{char.name}</span>
                        <span className="text-xs opacity-75">
                          {char.level} {raceMap[char.race]} {classMap[char.class]}
                        </span>
                      </div>
                      {char.online === 1 && (
                        <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* 返回按钮 */}
            <button
              onClick={onBack}
              className={`w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg transition-all duration-200 ${
                isDarkMode 
                  ? 'bg-gray-700 text-gray-300 hover:bg-gray-600 hover:text-white shadow-md group' 
                  : 'bg-white text-gray-600 hover:bg-blue-50 hover:text-blue-600 shadow-md border border-gray-200 group'
              }`}
            >
              <ArrowLeftIcon className="w-5 h-5 transition-transform group-hover:-translate-x-1" />
              <span className="font-medium">返回功能选择</span>
            </button>
          </div>
        </div>

        {/* 右侧聊天区域 - 使用 flex 和 min-h-0 确保正确滚动 */}
        <div className="flex-1 flex flex-col min-h-0 relative">
          {/* 装饰性渐变背景 */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-purple-500/10 opacity-20 pointer-events-none" />
          
          {/* 消息列表 - 使用 flex-1 和 min-h-0 确保可以滚动 */}
          <div className="flex-1 overflow-y-auto min-h-0 p-4 space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.sender === selectedCharacter?.name ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-[70%] rounded-xl p-4 shadow-lg transition-all duration-200 ${
                  message.sender === selectedCharacter?.name
                    ? 'bg-gradient-to-br from-blue-500 to-blue-600 text-white'
                    : isDarkMode 
                      ? 'bg-gray-700 text-white' 
                      : 'bg-white text-gray-900 border border-gray-200'
                }`}>
                  {/* 发送者信息栏 */}
                  <div className="flex items-center gap-2 mb-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-base font-medium">{message.sender}</span>
                        <span className={`text-sm px-2 py-0.5 rounded-full ${
                          message.sender === selectedCharacter?.name
                            ? 'bg-blue-400/30'
                            : isDarkMode
                              ? 'bg-gray-600'
                              : 'bg-gray-100'
                        }`}>
                          {raceMap[message.race]} {classMap[message.class]} {/* 使用映射显示种族和职业 */}
                        </span>
                      </div>
                      <div className={`text-sm mt-0.5 ${
                        message.sender === selectedCharacter?.name
                          ? 'text-blue-100'
                          : isDarkMode
                            ? 'text-gray-400'
                            : 'text-gray-500'
                      }`}>
                        {message.timestamp}
                      </div>
                    </div>
                  </div>

                  {/* 消息内容 */}
                  <p className="text-base leading-relaxed whitespace-pre-wrap break-words">
                    {message.content}
                  </p>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* 输入区域容器 */}
          <div className={`flex-shrink-0 flex flex-col border-t ${
            isDarkMode ? 'border-gray-700' : 'border-gray-200'
          } relative`}>
            {/* 发送状态提示 - 移到这里 */}
            {messages.some(msg => msg.isOptimistic) && (
              <div className="text-xs text-gray-500 px-4 py-1">
                消息发送中...
              </div>
            )}

            {/* 输入框区域 */}
            <div className="p-4 relative">
              <div className="absolute inset-0 bg-gradient-to-t from-blue-500/10 to-purple-500/10 opacity-20 -z-10" />
              
              <div className="flex gap-2">
                <input
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                  placeholder={selectedCharacter ? "输入消息..." : "请先选择角色"}
                  disabled={!selectedCharacter}
                  className={`flex-1 px-4 py-3 rounded-xl text-base transition-all duration-200 ${
                    isDarkMode 
                      ? 'bg-gray-700 text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500'
                      : 'bg-white text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 border border-gray-200'
                  } focus:outline-none focus:shadow-lg`}
                />
                <button
                  onClick={handleSend}
                  disabled={!selectedCharacter}
                  className={`flex-shrink-0 px-6 py-3 rounded-xl transition-all duration-200 flex items-center gap-2 ${
                    selectedCharacter 
                      ? 'bg-gradient-to-br from-blue-500 to-purple-500 text-white hover:from-blue-600 hover:to-purple-600 shadow-lg'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  <PaperAirplaneIcon className="w-5 h-5" />
                  <span className="text-base font-medium">发送</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
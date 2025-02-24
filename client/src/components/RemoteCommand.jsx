import React, { useState, useEffect } from 'react';
import { CommandLineIcon, PlayIcon, PencilIcon, TrashIcon, XMarkIcon } from '@heroicons/react/24/outline';

const RemoteCommand = ({ isDarkMode }) => {
  const [command, setCommand] = useState('');
  const [result, setResult] = useState('');
  const [error, setError] = useState('');
  const [commandHistory, setCommandHistory] = useState([]);
  const [commonCommands, setCommonCommands] = useState([]);
  const [editingCommand, setEditingCommand] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);

  // 从服务器获取常用命令列表
  useEffect(() => {
    fetchCommonCommands();
  }, []);

  const fetchCommonCommands = async () => {
    try {
      const response = await fetch('http://localhost:3003/api/common-commands');
      const data = await response.json();
      if (data.success) {
        setCommonCommands(data.commands);
      }
    } catch (error) {
      console.error('获取常用命令失败:', error);
    }
  };

  // 保存命令列表到服务器
  const saveCommonCommands = async (commands) => {
    try {
      await fetch('http://localhost:3003/api/common-commands', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ commands }),
      });
    } catch (error) {
      console.error('保存常用命令失败:', error);
    }
  };

  const handleSendCommand = async () => {
    if (!command.trim()) return;

    setError('');
    setResult('');

    try {
      const response = await fetch('http://localhost:3003/api/remote-command', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ command }),
      });

      const data = await response.json();
      if (data.success) {
        // 处理返回结果中的换行符
        const formattedResult = data.result
          .replace(/\\r\\n/g, '\n')  // 替换 \r\n 为 \n
          .replace(/\\n/g, '\n')     // 替换 \n
          .replace(/\\r/g, '\n')     // 替换 \r
          .replace(/\r\n/g, '\n')    // 替换实际的 \r\n
          .replace(/\r/g, '\n');     // 替换实际的 \r

        setResult(`执行成功，返回结果：\n${formattedResult}`);
        // 添加到历史记录
        setCommandHistory(prev => [command, ...prev].slice(0, 5));
      } else {
        setError(data.message || '命令执行失败');
      }
    } catch (error) {
      console.error('发送命令失败:', error);
      setError('发送命令失败，请稍后重试。');
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendCommand();
    }
  };

  const handleAddCommand = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const newCommand = {
      id: Date.now(),
      name: formData.get('name'),
      command: formData.get('command'),
      description: formData.get('description')
    };

    const updatedCommands = [...commonCommands, newCommand];
    setCommonCommands(updatedCommands);
    await saveCommonCommands(updatedCommands);
    setShowAddForm(false);
    e.target.reset();
  };

  const handleEditCommand = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const updatedCommand = {
      id: editingCommand.id,
      name: formData.get('name'),
      command: formData.get('command'),
      description: formData.get('description')
    };

    const updatedCommands = commonCommands.map(cmd => 
      cmd.id === editingCommand.id ? updatedCommand : cmd
    );
    setCommonCommands(updatedCommands);
    await saveCommonCommands(updatedCommands);
    setEditingCommand(null);
  };

  const handleDeleteCommand = async (id) => {
    if (window.confirm('确定要删除这个命令吗？')) {
      const updatedCommands = commonCommands.filter(cmd => cmd.id !== id);
      setCommonCommands(updatedCommands);
      await saveCommonCommands(updatedCommands);
    }
  };

  const CommandForm = ({ command: cmd, onSubmit, onCancel }) => (
    <form onSubmit={onSubmit} className="space-y-2">
      <input
        type="text"
        name="name"
        defaultValue={cmd?.name}
        placeholder="命令名称"
        className={`w-full p-2 rounded-lg ${isDarkMode ? 'bg-gray-800 text-white' : 'bg-gray-100 text-gray-800'}`}
        required
      />
      <input
        type="text"
        name="command"
        defaultValue={cmd?.command}
        placeholder="命令内容"
        className={`w-full p-2 rounded-lg ${isDarkMode ? 'bg-gray-800 text-white' : 'bg-gray-100 text-gray-800'}`}
        required
      />
      <textarea
        name="description"
        defaultValue={cmd?.description}
        placeholder="命令描述"
        rows="2"
        className={`w-full p-2 rounded-lg ${isDarkMode ? 'bg-gray-800 text-white' : 'bg-gray-100 text-gray-800'}`}
        required
      />
      <div className="flex gap-2">
        <button
          type="submit"
          className={`flex-1 px-3 py-1 rounded ${isDarkMode ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-500 hover:bg-blue-600'} text-white`}
        >
          {cmd ? '保存' : '添加'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className={`flex-1 px-3 py-1 rounded ${isDarkMode ? 'bg-gray-600 hover:bg-gray-700' : 'bg-gray-300 hover:bg-gray-400'} text-white`}
        >
          取消
        </button>
      </div>
    </form>
  );

  return (
    <div className="flex gap-4 h-full">
      {/* 左侧常用命令面板 */}
      <div className={`w-64 p-4 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'} flex flex-col gap-3`}>
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <CommandLineIcon className="w-5 h-5" />
            常用命令
          </h3>
          <button
            onClick={() => setShowAddForm(true)}
            className={`px-2 py-1 rounded ${isDarkMode ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-500 hover:bg-blue-600'} text-white text-sm`}
          >
            添加
          </button>
        </div>

        {showAddForm && (
          <CommandForm
            onSubmit={handleAddCommand}
            onCancel={() => setShowAddForm(false)}
          />
        )}

        <div className="space-y-2 overflow-auto">
          {commonCommands.map((cmd) => (
            editingCommand?.id === cmd.id ? (
              <CommandForm
                key={cmd.id}
                command={cmd}
                onSubmit={handleEditCommand}
                onCancel={() => setEditingCommand(null)}
              />
            ) : (
              <div
                key={cmd.id}
                className={`p-3 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-white'} group`}
              >
                <div className="flex justify-between items-start">
                  <div
                    className="flex-1 cursor-pointer"
                    onClick={() => setCommand(cmd.command)}
                  >
                    <div className="font-medium">{cmd.name}</div>
                    <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      {cmd.description}
                    </div>
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => setEditingCommand(cmd)}
                      className="p-1 rounded hover:bg-gray-700"
                    >
                      <PencilIcon className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteCommand(cmd.id)}
                      className="p-1 rounded hover:bg-gray-700"
                    >
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            )
          ))}
        </div>
      </div>

      {/* 右侧命令输入和结果显示区域 */}
      <div className="flex-1 flex flex-col">
        {/* 命令输入区域 */}
        <div className={`p-4 rounded-lg mb-4 ${isDarkMode ? 'bg-gray-700' : 'bg-white'}`}>
          <div className="flex gap-2 items-start">
            <textarea
              value={command}
              onChange={(e) => setCommand(e.target.value)}
              onKeyPress={handleKeyPress}
              rows="3"
              className={`flex-1 p-3 rounded-lg resize-none ${isDarkMode ? 'bg-gray-800 text-white border-gray-600' : 'bg-gray-50 text-gray-800 border-gray-200'} border focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
              placeholder="输入命令... (按Enter发送，Shift+Enter换行)"
            />
            <button
              onClick={handleSendCommand}
              className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-all ${isDarkMode ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-500 hover:bg-blue-600'} text-white`}
            >
              <PlayIcon className="w-5 h-5" />
              发送
            </button>
          </div>
        </div>

        {/* 结果显示区域 */}
        <div className="flex-1 overflow-hidden">
          <div
            className={`w-full h-full p-4 font-mono text-sm overflow-auto ${isDarkMode ? 'bg-gray-700 text-green-400' : 'bg-gray-50 text-green-700'} rounded-lg`}
            style={{
              whiteSpace: 'pre-wrap',
              overflowWrap: 'break-word'
            }}
          >
            {result || error || ''}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RemoteCommand; 
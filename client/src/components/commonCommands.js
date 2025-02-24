

// 从 localStorage 获取命令列表，如果没有则使用默认列表
export const getStoredCommands = () => {
  const storedCommands = localStorage.getItem('commonCommands');
  return storedCommands ? JSON.parse(storedCommands) : defaultCommands;
};

// 保存命令列表到 localStorage
export const saveCommands = (commands) => {
  localStorage.setItem('commonCommands', JSON.stringify(commands));
};
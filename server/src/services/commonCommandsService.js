import fs from 'fs/promises';
import path from 'path';

const COMMANDS_FILE = path.join(process.cwd(), 'src/data/commonCommands.json');

export const getCommonCommands = async () => {
  try {
    const data = await fs.readFile(COMMANDS_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('读取常用命令失败:', error);
    throw error;
  }
};

export const saveCommonCommands = async (commands) => {
  try {
    await fs.writeFile(COMMANDS_FILE, JSON.stringify(commands, null, 2), 'utf8');
    return true;
  } catch (error) {
    console.error('保存常用命令失败:', error);
    throw error;
  }
}; 
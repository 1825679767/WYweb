# WYweb
AZ魔兽世界网页控制系统！

仅支持azerothcore核心335版本！

目前已有的功能为：

1.用户登录、注册、修改密码、角色借卡；

2.网页和游戏互通聊天；

3.GM管理系统，包括：账号封禁、解禁、删除账号，角色封禁、解禁以及发送物品和金币！

## 安装步骤

1. **安装 Node.js**  
   如果您的系统未安装过 Node.js，请先下载安装 [Node.js](https://nodejs.org/)。

2. **将文件放入服务器**  
   将 `WYweblt.lua` 文件放入服务器的 `lua` 文件夹中。然后重启服务器（必须重启服务器，否则数据库表格不会自动创建）。

3. **修改数据库配置**  
   右键点击并使用文本编辑器打开 `server/src/config` 目录下的 `database.js` 文件，修改为您自己的数据库信息。

4. **安装依赖**  
   分别在 `client` 和 `server` 文件夹中的地址栏输出 `cmd`，然后在弹出的命令行窗口中执行以下命令来安装依赖：  npm install 。 如果下载失败，可能需要使用梯子。

5. **启动系统**  
双击 `启动.bat` 文件即可启动系统。打开浏览器访问 `http://localhost:5173/`，即可进入系统。

## 注意事项

- 请不要直接关闭两个窗口，否则会导致端口被占用。
- 应该在两个命令行窗口中分别执行 `ctrl+c` 来停止进程，而不是直接关闭窗口。


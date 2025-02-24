export const soapConfig = {
  // SOAP 服务配置
  soapServer: {
    host: 'localhost',
    port: 7878,
    username: 'admin',
    password: 'your_password'
  },

  // SOAP 命令配置
  commands: {
    server_info: 'server info',
    account_create: 'account create',
    account_set_password: 'account set password',
    character_unstuck: 'character unstuck',
    reload_table: 'reload table'
  },

  // SOAP 连接配置
  connection: {
    timeout: 5000,
    keepAlive: true,
    maxRetries: 3
  }
}; 
export const databaseConfig = {
  // Auth 数据库配置
  authDatabase: {
    host: '127.0.0.1',
    port: 3306,
    database: 'acore_auth',
    user: 'root',
    password: 'root',
    connectionLimit: 50,
    charset: 'utf8mb4',
    queueLimit: 0
  },

  // Characters 数据库配置
  charactersDatabase: {
    host: '127.0.0.1',
    port: 3306,
    database: 'acore_characters',
    user: 'root',
    password: 'root',
    connectionLimit: 50,
    charset: 'utf8mb4',
    queueLimit: 0,
    multipleStatements: true
  },

  // World 数据库配置
  worldDatabase: {
    host: '127.0.0.1',
    port: 3306,
    database: 'acore_world',
    user: 'root',
    password: 'root',
    connectionLimit: 50,
    queueLimit: 0
  }
}; 
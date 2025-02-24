export const databaseConfig = {
  // Auth 数据库配置
  authDatabase: {
    host: 'localhost',
    port: 3306,
    database: 'acore_auth',
    user: 'root',
    password: 'root',
    connectionLimit: 10,
    charset: 'utf8mb4'
  },

  // Characters 数据库配置
  charactersDatabase: {
    host: 'localhost',
    port: 3306,
    database: 'acore_characters',
    user: 'root',
    password: 'root',
    connectionLimit: 20,
    charset: 'utf8mb4',
    multipleStatements: true
  },

  // World 数据库配置
  worldDatabase: {
    host: 'localhost',
    port: 3306,
    database: 'acore_world',
    user: 'root',
    password: 'root',
    connectionLimit: 10
  }
}; 
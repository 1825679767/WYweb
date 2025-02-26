import { databaseConfig } from './database.js';
import { soapConfig } from './soap.js';

// 环境变量配置
const environment = process.env.NODE_ENV || 'development';

// 通用配置
const commonConfig = {
  // API 版本
  apiVersion: 'v1',
  
  // 服务器端口
  port: process.env.PORT || 3003,
  
  // JWT 配置
  jwt: {
    secret: process.env.JWT_SECRET || 'your_jwt_secret',
    expiresIn: '24h'
  },
  
  // 跨域配置
  cors: {
    origin: true,  // 允许所有来源
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
  },
  
  // 日志配置
  logging: {
    level: environment === 'production' ? 'info' : 'debug',
    filename: 'logs/app.log'
  }
};

// 导出配置
export const config = {
  env: environment,
  ...commonConfig,
  database: databaseConfig,
  soap: soapConfig,
  server: {
    port: 3002
  }
}; 
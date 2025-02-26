import http from 'http';
import xml2js from 'xml2js';
import { soapConfig } from '../config/soap.js';

export const sendSoapCommand = (command) => {
  return new Promise((resolve, reject) => {
    const { host, port, username, password } = soapConfig.soapServer;
    const { timeout } = soapConfig.connection;

    const req = http.request({
      hostname: host,
      port: port,
      method: "POST",
      auth: `${username}:${password}`,  // 使用配置的用户名和密码
      headers: { 'Content-Type': 'application/xml' },
      timeout: timeout  // 使用配置的超时时间
    }, res => {
      let data = '';
      
      res.on('data', chunk => {
        data += chunk;
      });

      res.on('end', async () => {
        try {
          const xml = await xml2js.parseStringPromise(data);
          const body = xml["SOAP-ENV:Envelope"]["SOAP-ENV:Body"][0];
          const fault = body["SOAP-ENV:Fault"];
          
          if (fault) {
            resolve({
              success: false,
              error: fault[0]["faultstring"][0]
            });
            return;
          }
          
          const response = body["ns1:executeCommandResponse"];
          if (response) {
            resolve({
              success: true,
              result: response[0]["result"][0]
            });
            return;
          }
          
          resolve({
            success: false,
            error: "无效的响应格式"
          });
        } catch (error) {
          resolve({
            success: false,
            error: "解析响应失败: " + error.message
          });
        }
      });
    });

    // 处理请求错误
    req.on('error', (error) => {
      resolve({
        success: false,
        error: `SOAP服务连接失败: ${error.message}`
      });
    });

    // 处理超时
    req.on('timeout', () => {
      req.destroy();
      resolve({
        success: false,
        error: "SOAP服务请求超时"
      });
    });

    try {
      req.write(
        '<SOAP-ENV:Envelope' +
        ' xmlns:SOAP-ENV="http://schemas.xmlsoap.org/soap/envelope/"' +
        ' xmlns:SOAP-ENC="http://schemas.xmlsoap.org/soap/encoding/"' +
        ' xmlns:xsi="http://www.w3.org/1999/XMLSchema-instance"' +
        ' xmlns:xsd="http://www.w3.org/1999/XMLSchema"' +
        ' xmlns:ns1="urn:AC">' +
        '<SOAP-ENV:Body>' +
        '<ns1:executeCommand>' +
        '<command>' + command + '</command>' +
        '</ns1:executeCommand>' +
        '</SOAP-ENV:Body>' +
        '</SOAP-ENV:Envelope>'
      );
      req.end();
    } catch (error) {
      resolve({
        success: false,
        error: "发送SOAP请求失败: " + error.message
      });
    }
  });
}; 
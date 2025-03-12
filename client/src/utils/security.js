// XSS防护函数
export const sanitizeInput = (input) => {
  if (typeof input !== 'string') return input;
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
};

// 安全地存储token
export const setAuthToken = (token) => {
  // 使用sessionStorage而不是localStorage存储敏感信息
  sessionStorage.setItem('authToken', token);
};

export const getAuthToken = () => {
  return sessionStorage.getItem('authToken');
};

export const clearAuthToken = () => {
  sessionStorage.removeItem('authToken');
}; 
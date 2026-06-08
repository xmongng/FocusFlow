import axios from 'axios';

// Đường dẫn cơ sở đến API Backend
const API_BASE_URL = 'http://localhost:5001/api';

const client = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor để tự động đính kèm Token vào mỗi yêu cầu
client.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor để xử lý lỗi hệ thống (ví dụ: Token hết hạn)
client.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Nếu lỗi 401 (Unauthorized), có thể đẩy người dùng về trang đăng nhập
      // localStorage.removeItem('auth_token');
      // window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default client;

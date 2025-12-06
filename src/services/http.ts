import axios from 'axios';

// 创建axios实例
const http = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/', // 从环境变量获取baseURL
  timeout: 10000, // 10秒超时
  headers: {
    'Content-Type': 'application/json',
  },
});

// 请求拦截器
http.interceptors.request.use(
  (config) => {
    // 可以在这里添加token等认证信息
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 响应拦截器
http.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // 简易错误处理
    console.error('HTTP请求错误:', error);
    
    // 可以在这里添加全局错误提示
    if (error.response) {
      // 服务器返回错误状态码
      console.error('响应错误:', error.response.data);
    } else if (error.request) {
      // 请求发出但没有收到响应
      console.error('请求未收到响应:', error.request);
    } else {
      // 请求配置错误
      console.error('请求配置错误:', error.message);
    }
    
    return Promise.reject(error);
  }
);

export default http;
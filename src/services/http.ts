import axios, { AxiosError } from 'axios';
import { message } from 'antd';

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
  (response) => response.data,
  (error: AxiosError) => {
    if (axios.isCancel(error) || error.code === 'ERR_CANCELED') {
      return Promise.reject(error);
    }

    let errorMessage = '请求失败，请稍后重试';

    if (error.code === 'ECONNABORTED') {
      errorMessage = '请求超时，请检查网络后重试';
    } else if (error.response) {
      const status = error.response.status;
      if (status >= 500) {
        errorMessage = '服务器开小差了，请稍后再试';
      } else if (status === 404) {
        errorMessage = '请求的资源不存在或已被删除';
      } else if (status === 401) {
        errorMessage = '登录状态已失效，请重新登录后重试';
      } else if (status >= 400) {
        errorMessage = '请求无效，请检查输入后重试';
      }
    } else if (error.request) {
      errorMessage = '网络异常或服务器无响应，请检查网络连接';
    }

    message.error(errorMessage);
    return Promise.reject(error);
  }
);

export default http;
import axios, { AxiosInstance, InternalAxiosRequestConfig, AxiosResponse } from 'axios'
import { message } from 'antd'
import { useAuthStore } from '../store/auth'

// 创建axios实例
const http: AxiosInstance = axios.create({
  baseURL: '/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// 请求拦截器
http.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const { token: storeToken } = useAuthStore.getState()
    const token = storeToken || localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// 响应拦截器
http.interceptors.response.use(
  (response: AxiosResponse) => {
    const res = response.data
    return res
  },
  (error) => {
    // 处理错误
    if (error.response) {
      // 服务器返回错误状态码
      const { status, data } = error.response
      
      if (status === 401) {
        const requestUrl = error.config?.url || ''
        console.warn('[ADMIN HTTP 401]', { url: requestUrl, message: data?.message })
        // 这里只提示，不自动退出登录
        message.error(data?.message || '当前账号无权限或登录状态异常，请稍后重试')
        return Promise.reject(error)
      } else {
        // 其他错误，显示错误信息
        message.error(data?.message || '请求失败，请稍后重试')
      }
    } else if (error.request) {
      // 请求已发出，但没有收到响应
      message.error('网络错误，请检查网络连接')
    } else {
      // 请求配置错误
      message.error('请求配置错误')
    }
    return Promise.reject(error)
  }
)

export default http

import axios, { AxiosInstance, InternalAxiosRequestConfig, AxiosResponse } from 'axios'
import { message } from 'antd'
import { useAuthStore } from '../store/auth'
import { AUTH_TOKEN_KEY, LEGACY_TOKEN_KEYS } from '../constants/auth'

const readToken = () => {
  const { token: storeToken } = useAuthStore.getState()
  if (storeToken) return storeToken
  const legacy = LEGACY_TOKEN_KEYS.map((key) => localStorage.getItem(key)).find(Boolean)
  if (legacy) {
    localStorage.setItem(AUTH_TOKEN_KEY, legacy)
    LEGACY_TOKEN_KEYS.forEach((key) => localStorage.removeItem(key))
    return legacy
  }
  return localStorage.getItem(AUTH_TOKEN_KEY)
}

// 创建axios实例
const http: AxiosInstance = axios.create({
  baseURL: '/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// 避免重复弹出 401 提示
let isHandlingUnauthorized = false

// 请求拦截器
http.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = readToken()
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
        const { logout } = useAuthStore.getState()
        const requestUrl = error.config?.url || ''
        const isLoginApi = requestUrl.includes('/auth/login')
        const isOnLoginPage = window.location.pathname === '/login'
        const token = readToken()
        // 仅对需要鉴权的后台接口触发自动登出，并且当前持有 token
        const isAdminApi = requestUrl.includes('/admin/')

        if (token && !isLoginApi && isAdminApi && !isOnLoginPage && !isHandlingUnauthorized) {
          isHandlingUnauthorized = true
          message.error(data?.message || '登录状态已过期，请重新登录')
          logout()
          localStorage.removeItem(AUTH_TOKEN_KEY)
          window.location.href = '/login'
          setTimeout(() => { isHandlingUnauthorized = false }, 1500)
        }
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

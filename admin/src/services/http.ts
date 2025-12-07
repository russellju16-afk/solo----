import axios, { AxiosInstance, InternalAxiosRequestConfig, AxiosResponse } from 'axios'
import { message } from 'antd'
import { useAuthStore } from '../store/auth'
import { getStoredToken } from '../utils/auth'
import { redirectToLogin } from '../utils/authRedirect'

const readToken = () => {
  const { token: storeToken } = useAuthStore.getState()
  if (storeToken) return storeToken
  return getStoredToken()
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
      const serverMessage = data?.message
      const requestUrl = error.config?.url || ''
      const token = readToken()
      const isLoginApi = requestUrl.includes('/auth/login')
      const isAdminApi = requestUrl.includes('/admin/')

      if (status === 401) {
        const { logout } = useAuthStore.getState()
        if (isLoginApi) {
          console.warn('[Auth] 401 from login api, skip auto logout', requestUrl)
        } else if (token && isAdminApi && !isHandlingUnauthorized) {
          isHandlingUnauthorized = true
          console.warn('[Auth] 401 from', requestUrl, '- will logout')
          message.error(serverMessage || '登录状态已过期，请重新登录')
          logout(`收到 401，来自 ${requestUrl}`)
          redirectToLogin(`收到 401，来自 ${requestUrl}`)
          setTimeout(() => {
            isHandlingUnauthorized = false
          }, 1500)
        } else {
          console.warn('[Auth] 401 ignored', {
            requestUrl,
            hasToken: !!token,
            isAdminApi,
          })
        }
      } else {
        // 其他错误，显示错误信息
        message.error(serverMessage || '请求失败，请稍后重试')
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

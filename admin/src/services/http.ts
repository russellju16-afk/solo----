/* eslint-disable @typescript-eslint/no-explicit-any */
import axios, { AxiosInstance, InternalAxiosRequestConfig, AxiosRequestConfig, AxiosResponse } from 'axios'
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

type HttpClient = Omit<AxiosInstance, 'get' | 'post' | 'put' | 'delete' | 'patch'> & {
  get<T = any>(url: string, config?: AxiosRequestConfig): Promise<T>
  delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<T>
  post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T>
  put<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T>
  patch<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T>
}

// 避免并发 401 触发多次提示/跳转
const UNAUTHORIZED_COOLDOWN_MS = 5000
let unauthorizedCooldownUntil = 0

function canHandleUnauthorized() {
  return Date.now() >= unauthorizedCooldownUntil
}

function beginUnauthorizedCooldown() {
  unauthorizedCooldownUntil = Date.now() + UNAUTHORIZED_COOLDOWN_MS
}

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
      const isLoginApi = requestUrl.includes('/auth/login')
      const isAdminApi = requestUrl.includes('/admin/')

      if (status === 401) {
        const { logout } = useAuthStore.getState()
        if (isLoginApi) {
          console.warn('[Auth] 401 from login api, skip auto logout', requestUrl)
        } else if (isAdminApi && canHandleUnauthorized()) {
          beginUnauthorizedCooldown()
          console.warn('[Auth] 401 from', requestUrl, '- will logout')
          message.error(serverMessage || '登录状态已过期，请重新登录')
          logout(`收到 401，来自 ${requestUrl}`)
          redirectToLogin(`收到 401，来自 ${requestUrl}`)
        } else {
          console.warn('[Auth] 401 ignored', {
            requestUrl,
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

// 拦截器已将返回值统一为 response.data，这里对 axios 方法的类型进行对齐
const httpClient = http as unknown as HttpClient

export default httpClient

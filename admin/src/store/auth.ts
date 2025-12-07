import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { AUTH_TOKEN_KEY, LEGACY_TOKEN_KEYS } from '../constants/auth'

interface User {
  id: number
  username: string
  name: string
  phone: string
  role: string
  status: number
}

interface AuthState {
  token: string | null
  user: User | null
  login: (token: string, user: User) => void
  logout: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      login: (token, user) => {
        localStorage.setItem(AUTH_TOKEN_KEY, token)
        // 清理旧版 token 存储
        LEGACY_TOKEN_KEYS.forEach((key) => localStorage.removeItem(key))
        set({ token, user })
      },
      logout: () => {
        localStorage.removeItem(AUTH_TOKEN_KEY)
        LEGACY_TOKEN_KEYS.forEach((key) => localStorage.removeItem(key))
        set({ token: null, user: null })
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        token: state.token,
        user: state.user,
      }),
    }
  )
)

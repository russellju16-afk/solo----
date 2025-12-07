import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { clearStoredToken, setStoredToken } from '../utils/auth'

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
  logout: (reason?: string) => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      login: (token, user) => {
        setStoredToken(token)
        set({ token, user })
      },
      logout: (reason) => {
        clearStoredToken(reason || 'logout called')
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

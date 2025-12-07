import { AUTH_TOKEN_KEY, LEGACY_TOKEN_KEYS } from '../constants/auth'

export function migrateLegacyToken() {
  const legacy = LEGACY_TOKEN_KEYS.map((key) => localStorage.getItem(key)).find(Boolean)
  if (legacy) {
    console.warn('[Auth] migrate legacy token from', LEGACY_TOKEN_KEYS, 'to', AUTH_TOKEN_KEY)
    localStorage.setItem(AUTH_TOKEN_KEY, legacy)
    LEGACY_TOKEN_KEYS.forEach((key) => localStorage.removeItem(key))
    return legacy
  }
  return null
}

export function getStoredToken() {
  const token = localStorage.getItem(AUTH_TOKEN_KEY)
  if (token) return token
  return migrateLegacyToken()
}

export function setStoredToken(token: string) {
  localStorage.setItem(AUTH_TOKEN_KEY, token)
  LEGACY_TOKEN_KEYS.forEach((key) => localStorage.removeItem(key))
}

export function clearStoredToken(reason: string) {
  console.warn('[Auth] clear token because', reason)
  localStorage.removeItem(AUTH_TOKEN_KEY)
  LEGACY_TOKEN_KEYS.forEach((key) => localStorage.removeItem(key))
}

export function isAuthenticated() {
  return !!getStoredToken()
}


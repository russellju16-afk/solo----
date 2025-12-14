import { AUTH_TOKEN_KEY, LEGACY_TOKEN_KEYS } from '../constants/auth'

function normalizeToken(raw: string | null) {
  if (!raw) return null
  const token = raw.trim()
  if (!token) return null
  if (token === 'null' || token === 'undefined') return null
  // Basic JWT shape check: header.payload.signature (at least 2 dots)
  if (token.split('.').length < 3) return null
  return token
}

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
  const stored = normalizeToken(localStorage.getItem(AUTH_TOKEN_KEY))
  if (stored) return stored

  const legacy = migrateLegacyToken()
  const normalizedLegacy = normalizeToken(legacy)
  if (!normalizedLegacy && legacy) {
    clearStoredToken('invalid legacy token in storage')
  }
  return normalizedLegacy
}

export function setStoredToken(token: string) {
  const normalized = normalizeToken(token)
  if (!normalized) {
    clearStoredToken('setStoredToken received invalid token')
    return
  }
  localStorage.setItem(AUTH_TOKEN_KEY, normalized)
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

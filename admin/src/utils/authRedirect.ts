function getCurrentReturnUrl() {
  return `${window.location.pathname}${window.location.search}${window.location.hash}`
}

function toSafeReturnUrl(value: string | null) {
  if (!value) return '/'
  if (!value.startsWith('/')) return '/'
  if (value.startsWith('//')) return '/'
  return value
}

export function redirectToLogin(reason: string, options?: { returnUrl?: string }) {
  const currentPath = window.location.pathname
  if (currentPath === '/login') return

  const rawReturnUrl = options?.returnUrl || getCurrentReturnUrl()
  const returnUrl = toSafeReturnUrl(rawReturnUrl)

  console.warn('[Auth] redirectToLogin:', reason, returnUrl)
  window.location.href = `/login?returnUrl=${encodeURIComponent(returnUrl)}`
}

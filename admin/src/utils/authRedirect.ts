export function redirectToLogin(reason: string) {
  // Keep log during debugging to know who triggered the redirect
  console.warn('[Auth] redirectToLogin:', reason, window.location.pathname)
  window.location.href = '/login'
}


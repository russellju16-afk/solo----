export const TRACK_SESSION_KEY = 'cq_sid_v1'
export const SIGNAL_LAST_KEY = 'cq_signal_last_v1'

export const ANALYTICS_EVENT_NAMES = [
  'product_view',
  'product_search',
  'product_filter',
  'product_compare_add',
  'product_compare_open',
  'contact_phone_click',
  'contact_wechat_open',
  'contact_email_copy',
  'lead_submit',
  'lead_followup',
] as const

export type AnalyticsEventName = (typeof ANALYTICS_EVENT_NAMES)[number]

const getSessionId = () => {
  if (typeof window === 'undefined') return ''
  try {
    const existing = window.localStorage.getItem(TRACK_SESSION_KEY)
    if (existing) return existing
    const sid =
      typeof crypto !== 'undefined' && 'randomUUID' in crypto
        ? crypto.randomUUID()
        : `${Date.now()}_${Math.random().toString(16).slice(2)}`
    window.localStorage.setItem(TRACK_SESSION_KEY, sid)
    return sid
  } catch {
    return ''
  }
}

export function track(event: AnalyticsEventName, meta?: Record<string, unknown>) {
  if (typeof window === 'undefined') return

  const payload = {
    event,
    path: `${window.location.pathname}${window.location.search}`,
    referrer: document.referrer || undefined,
    sessionId: getSessionId() || undefined,
    meta: meta ?? undefined,
  }

  const url = '/api/track'

  try {
    const body = JSON.stringify(payload)

    if (typeof navigator !== 'undefined' && typeof navigator.sendBeacon === 'function') {
      const ok = navigator.sendBeacon(url, new Blob([body], { type: 'application/json' }))
      if (ok) return
    }

    fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body,
      keepalive: true,
    }).catch(() => undefined)
  } catch {
    // ignore
  }
}

export function signalLead(channel: 'phone' | 'wechat' | 'email', meta?: Record<string, unknown>) {
  if (typeof window === 'undefined') return

  const sessionId = getSessionId() || ''
  const path = `${window.location.pathname}${window.location.search}`

  try {
    const now = Date.now()
    const lastRaw = window.localStorage.getItem(SIGNAL_LAST_KEY)
    if (lastRaw) {
      const last = JSON.parse(lastRaw) as { ts?: number; channel?: string; path?: string } | null
      if (last?.channel === channel && last?.path === path && typeof last.ts === 'number' && now - last.ts < 10_000) {
        return
      }
    }
    window.localStorage.setItem(SIGNAL_LAST_KEY, JSON.stringify({ ts: now, channel, path }))
  } catch {
    // ignore dedup failures
  }

  const payload = {
    channel,
    sessionId: sessionId || undefined,
    path,
    meta: meta ?? undefined,
  }

  const url = '/api/leads/signal'

  try {
    const body = JSON.stringify(payload)

    if (typeof navigator !== 'undefined' && typeof navigator.sendBeacon === 'function') {
      const ok = navigator.sendBeacon(url, new Blob([body], { type: 'application/json' }))
      if (ok) return
    }

    fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body,
      keepalive: true,
    }).catch(() => undefined)
  } catch {
    // ignore
  }
}

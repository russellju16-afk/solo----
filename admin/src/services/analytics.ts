import http from './http'

export async function getAnalyticsOverview(params: { startAt: string; endAt: string }) {
  return http.get('/admin/analytics/overview', { params })
}


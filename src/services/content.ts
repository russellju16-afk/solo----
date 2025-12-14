import http from './http';
import { Banner, CaseItem, NewsItem, Solution, FaqItem } from '@/types/content';
import { PaginatedResult } from '@/types/product';

export async function fetchBanners(params?: Record<string, unknown>): Promise<Banner[]> {
  return http.get<Banner[]>('/api/banners', { params });
}

export async function fetchCases(
  params: Record<string, unknown> = {},
  options: { signal?: AbortSignal } = {},
): Promise<PaginatedResult<CaseItem>> {
  return http.get<PaginatedResult<CaseItem>>('/api/cases', { params, signal: options.signal });
}

export async function fetchCaseDetail(id: number, options: { signal?: AbortSignal } = {}): Promise<CaseItem> {
  return http.get<CaseItem>(`/api/cases/${id}`, { signal: options.signal });
}

export async function fetchSolutions(
  params: Record<string, unknown> = {},
  options: { signal?: AbortSignal } = {},
): Promise<PaginatedResult<Solution>> {
  return http.get<PaginatedResult<Solution>>('/api/solutions', { params, signal: options.signal });
}

export async function fetchSolutionDetail(id: number, options: { signal?: AbortSignal } = {}): Promise<Solution> {
  return http.get<Solution>(`/api/solutions/${id}`, { signal: options.signal });
}

export async function fetchNews(
  params: Record<string, unknown> = {},
  options: { signal?: AbortSignal } = {},
): Promise<PaginatedResult<NewsItem>> {
  return http.get<PaginatedResult<NewsItem>>('/api/news', { params, signal: options.signal });
}

export async function fetchNewsDetail(id: number, options: { signal?: AbortSignal } = {}): Promise<NewsItem> {
  return http.get<NewsItem>(`/api/news/${id}`, { signal: options.signal });
}

export async function fetchFaqs(params: Record<string, unknown> = {}, options: { signal?: AbortSignal } = {}): Promise<FaqItem[]> {
  return http.get<FaqItem[]>('/api/faqs', { params, signal: options.signal });
}

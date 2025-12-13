import http from './http';
import { Banner, CaseItem, NewsItem, Solution, FaqItem } from '@/types/content';
import { PaginatedResult } from '@/types/product';

export async function fetchBanners(params?: Record<string, unknown>): Promise<Banner[]> {
  return http.get<Banner[]>('/api/banners', { params });
}

export async function fetchCases(params: Record<string, unknown> = {}): Promise<PaginatedResult<CaseItem>> {
  return http.get<PaginatedResult<CaseItem>>('/api/cases', { params });
}

export async function fetchSolutions(params: Record<string, unknown> = {}): Promise<PaginatedResult<Solution>> {
  return http.get<PaginatedResult<Solution>>('/api/solutions', { params });
}

export async function fetchNews(params: Record<string, unknown> = {}): Promise<PaginatedResult<NewsItem>> {
  return http.get<PaginatedResult<NewsItem>>('/api/news', { params });
}

export async function fetchFaqs(params: Record<string, unknown> = {}, options: { signal?: AbortSignal } = {}): Promise<FaqItem[]> {
  return http.get<FaqItem[]>('/api/faqs', { params, signal: options.signal });
}

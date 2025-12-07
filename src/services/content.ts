import http from './http';
import { Banner, CaseItem, NewsItem, Solution } from '@/types/content';
import { PaginatedResult } from '@/types/product';

export async function fetchBanners(params?: Record<string, unknown>): Promise<Banner[]> {
  const resp = await http.get('/api/banners', { params });
  return resp.data as Banner[];
}

export async function fetchCases(params: Record<string, unknown> = {}): Promise<PaginatedResult<CaseItem>> {
  const resp = await http.get('/api/cases', { params });
  return resp.data as PaginatedResult<CaseItem>;
}

export async function fetchSolutions(params: Record<string, unknown> = {}): Promise<PaginatedResult<Solution>> {
  const resp = await http.get('/api/solutions', { params });
  return resp.data as PaginatedResult<Solution>;
}

export async function fetchNews(params: Record<string, unknown> = {}): Promise<PaginatedResult<NewsItem>> {
  const resp = await http.get('/api/news', { params });
  return resp.data as PaginatedResult<NewsItem>;
}

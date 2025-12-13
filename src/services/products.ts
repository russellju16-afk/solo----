import http from './http';
import { Product, PaginatedResult } from '@/types/product';

export interface FetchProductsParams {
  page?: number;
  pageSize?: number;
  categoryId?: number;
  keyword?: string;
  signal?: AbortSignal;
}

export interface FetchRecommendationsParams {
  limit?: number;
  categoryId?: number;
  signal?: AbortSignal;
}

export async function fetchProducts({ signal, ...params }: FetchProductsParams = {}): Promise<PaginatedResult<Product>> {
  return http.get<PaginatedResult<Product>>('/api/products', {
    params: {
      page: params.page,
      pageSize: params.pageSize,
      categoryId: params.categoryId,
      keyword: params.keyword,
    },
    signal,
  });
}

export async function fetchProductDetail(id: number, options?: { signal?: AbortSignal }): Promise<Product> {
  return http.get<Product>(`/api/products/${id}`, { signal: options?.signal });
}

export async function fetchRecommendedProducts(id: number, params: FetchRecommendationsParams = {}): Promise<Product[]> {
  return http.get<Product[]>(`/api/products/${id}/recommendations`, {
    params: {
      limit: params.limit ?? 4,
      categoryId: params.categoryId,
    },
    signal: params.signal,
  });
}

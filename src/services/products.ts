import http from './http';
import { Product, PaginatedResult } from '@/types/product';

export interface FetchProductsParams {
  page?: number;
  pageSize?: number;
  categoryId?: number;
  keyword?: string;
}

export async function fetchProducts(params: FetchProductsParams = {}): Promise<PaginatedResult<Product>> {
  const resp = await http.get('/api/products', {
    params: {
      page: params.page,
      pageSize: params.pageSize,
      categoryId: params.categoryId,
      keyword: params.keyword,
    },
  });
  return resp.data as PaginatedResult<Product>;
}

export async function fetchProductDetail(id: number): Promise<Product> {
  const resp = await http.get(`/api/products/${id}`);
  return resp.data as Product;
}

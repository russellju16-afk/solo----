import http from './http'
import { ProductCategory } from '@/types/product'

export async function fetchCategories(
  params: Record<string, unknown> = {},
  options: { signal?: AbortSignal } = {}
): Promise<ProductCategory[]> {
  return http.get<ProductCategory[]>('/api/categories', { params, signal: options.signal })
}


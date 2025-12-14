export interface ProductImage {
  id: number;
  url: string;
  sort_order: number;
}

export interface ProductCategory {
  id: number;
  name: string;
  sort_order: number;
}

export interface ProductBrand {
  id: number;
  name: string;
  description?: string;
  sort_order: number;
}

export interface Product {
  id: number;
  name: string;
  price?: number;
  spec_weight?: string;
  package_type?: string;
  applicable_scenes?: string[];
  moq?: string;
  supply_area?: string;
  description?: string;
  status?: number;
  cover_image?: string;
  specifications?: Record<string, string>;
  features?: string[];
  latest_price_note?: string;
  latest_price_updated_at?: string;
  price_trend?: string;
  images?: ProductImage[];
  category?: ProductCategory;
  brand?: ProductBrand;
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
}

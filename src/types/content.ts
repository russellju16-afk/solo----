export interface Banner {
  id: number;
  position: string;
  title?: string;
  sub_title?: string;
  image_url: string;
  link_url?: string;
  sort_order: number;
  enabled: number;
}

export interface CaseItem {
  id: number;
  customer_name: string;
  industry_type: string;
  summary?: string;
  detail: string;
  cover_image?: string;
  published_at?: string;
  status: string;
}

export interface NewsItem {
  id: number;
  title: string;
  category: string;
  content: string;
  cover_image?: string;
  published_at?: string;
  status: string;
}

export interface Solution {
  id: number;
  channel_type: string;
  title: string;
  intro?: string;
  pain_points?: string[];
  solutions?: string[];
  product_ids?: number[];
  sort_order: number;
  enabled: number;
}

export interface FaqItem {
  id: number;
  question: string;
  answer: string;
  category_id?: number;
  tags?: string[];
}

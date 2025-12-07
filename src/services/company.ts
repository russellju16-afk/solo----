import http from './http';
import { CompanyInfo } from '@/types/company';

export async function fetchCompanyInfo(): Promise<CompanyInfo | null> {
  const resp = await http.get('/api/company-info');
  const data = resp.data as any;
  return (data?.data || data || null) as CompanyInfo | null;
}

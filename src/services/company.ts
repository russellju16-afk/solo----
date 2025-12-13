import http from './http';
import { CompanyInfo } from '@/types/company';

export async function fetchCompanyInfo(): Promise<CompanyInfo | null> {
  const data = await http.get('/api/company-info');
  return (data?.data || data || null) as CompanyInfo | null;
}

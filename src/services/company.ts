import http from './http';
import { CompanyInfo } from '@/types/company';

export async function fetchCompanyInfo(): Promise<CompanyInfo | null> {
  const res = await http.get<CompanyInfo | { data: CompanyInfo } | null>('/api/company-info');
  if (!res) return null;
  if (typeof res === 'object' && 'data' in res) {
    return (res as { data?: CompanyInfo }).data || null;
  }
  return res as CompanyInfo;
}

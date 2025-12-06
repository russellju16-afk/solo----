import { LeadPayload } from '@/types/lead';
import http from './http';

export async function submitLead(payload: LeadPayload) {
  const resp = await http.post('/api/leads', payload);
  return resp.data;
}
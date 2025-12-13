import { LeadPayload } from '@/types/lead';
import http from './http';

export async function submitLead(payload: LeadPayload) {
  return http.post('/api/leads', payload);
}
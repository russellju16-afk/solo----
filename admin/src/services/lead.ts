import http from './http';
import {
  LeadQueryParams,
  LeadsListResponse,
  LeadDetail,
  LeadFollowup,
  UpdateLeadPayload,
  CreateFollowupPayload,
} from '../types/lead';

// 线索相关API
export const leadService = {
  // 获取线索列表
  getLeads: (params: LeadQueryParams) => {
    return http.get<LeadsListResponse>('/api/admin/leads', { params });
  },
  // 获取线索详情
  getLeadById: (id: number) => {
    return http.get<LeadDetail>(`/api/admin/leads/${id}`);
  },
  // 创建线索
  createLead: (data: any) => {
    return http.post('/api/admin/leads', data);
  },
  // 更新线索
  updateLead: (id: number, data: UpdateLeadPayload) => {
    return http.put(`/api/admin/leads/${id}`, data);
  },
  // 删除线索
  deleteLead: (id: number) => {
    return http.delete(`/api/admin/leads/${id}`);
  },
  // 更新线索状态
  updateLeadStatus: (id: number, status: string) => {
    return http.put(`/api/admin/leads/${id}/status`, { status });
  },
  // 导出线索
  exportLeads: (params: LeadQueryParams) => {
    return http.get<Blob>('/api/admin/leads/export', { params, responseType: 'blob' });
  },
  // 获取线索跟进记录
  getFollowups: (leadId: number) => {
    return http.get<LeadFollowup[]>(`/api/admin/leads/${leadId}/followups`);
  },
  // 创建线索跟进记录
  createFollowup: (leadId: number, data: CreateFollowupPayload) => {
    return http.post<LeadFollowup>(`/api/admin/leads/${leadId}/followups`, data);
  },
};
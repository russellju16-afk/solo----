/* eslint-disable @typescript-eslint/no-explicit-any */
import http from './http';

// 公司信息相关API
export const companyService = {
  // 获取公司信息
  getCompanyInfo: () => {
    return http.get('/admin/company-info');
  },
  // 更新公司信息
  updateCompanyInfo: (data: any) => {
    return http.put('/admin/company-info', data);
  },
  // 前台获取公司信息（无需认证）
  getFrontCompanyInfo: () => {
    return http.get('/company-info');
  },
};

// 飞书配置相关API
export const feishuService = {
  // 获取飞书配置
  getFeishuConfig: () => {
    return http.get('/admin/feishu/config');
  },
  // 更新飞书配置
  updateFeishuConfig: (data: any) => {
    return http.put('/admin/feishu/config', data);
  },
  // 测试飞书连接
  testFeishuConnection: () => {
    return http.post('/admin/feishu/test');
  },
};

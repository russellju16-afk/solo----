import http from './http';

// 用户相关API
export const userService = {
  // 获取用户列表
  getUsers: (params: any = {}) => {
    return http.get('/api/admin/users', { params });
  },
  // 获取用户详情
  getUserById: (id: number) => {
    return http.get(`/api/admin/users/${id}`);
  },
  // 创建用户
  createUser: (data: any) => {
    return http.post('/api/admin/users', data);
  },
  // 更新用户
  updateUser: (id: number, data: any) => {
    return http.put(`/api/admin/users/${id}`, data);
  },
  // 删除用户
  deleteUser: (id: number) => {
    return http.delete(`/api/admin/users/${id}`);
  },
  // 更新用户状态
  updateUserStatus: (id: number, status: number) => {
    return http.put(`/api/admin/users/${id}/status`, { status });
  },
  // 更新用户密码
  updatePassword: (id: number, data: any) => {
    return http.put(`/api/admin/users/${id}/password`, data);
  },
  // 获取当前用户信息
  getCurrentUser: () => {
    return http.get('/api/admin/users/me');
  },
};

// 操作日志相关API
export const logService = {
  // 获取操作日志列表
  getOperationLogs: (params: any = {}) => {
    return http.get('/api/admin/operation-logs', { params });
  },
  // 获取操作日志详情
  getOperationLogById: (id: number) => {
    return http.get(`/api/admin/operation-logs/${id}`);
  },
  // 清空操作日志
  clearOperationLogs: () => {
    return http.delete('/api/admin/operation-logs/clear');
  },
};
import http from './http'

// Banner相关API
export const bannerService = {
  // 获取Banner列表
  getBanners: (params: any = {}) => {
    return http.get('/api/admin/banners', { params })
  },
  // 前台获取Banner列表（无需认证）
  getFrontBanners: (params: any = {}) => {
    return http.get('/api/banners', { params })
  },
  // 获取Banner详情
  getBannerById: (id: number) => {
    return http.get(`/api/admin/banners/${id}`)
  },
  // 创建Banner
  createBanner: (data: any) => {
    return http.post('/api/admin/banners', data)
  },
  // 更新Banner
  updateBanner: (id: number, data: any) => {
    return http.put(`/api/admin/banners/${id}`, data)
  },
  // 删除Banner
  deleteBanner: (id: number) => {
    return http.delete(`/api/admin/banners/${id}`)
  },
  // 更新Banner状态
  updateBannerStatus: (id: number, enabled: number) => {
    return http.put(`/api/admin/banners/${id}/enabled`, { enabled })
  },
}

// 新闻相关API
export const newsService = {
  // 获取新闻列表
  getNews: (params: any = {}) => {
    return http.get('/api/admin/news', { params })
  },
  // 前台获取新闻列表（无需认证）
  getFrontNews: (params: any = {}) => {
    return http.get('/api/news', { params })
  },
  // 获取新闻详情
  getNewsById: (id: number) => {
    return http.get(`/api/admin/news/${id}`)
  },
  // 前台获取新闻详情（无需认证）
  getFrontNewsById: (id: number) => {
    return http.get(`/api/news/${id}`)
  },
  // 创建新闻
  createNews: (data: any) => {
    return http.post('/api/admin/news', data)
  },
  // 更新新闻
  updateNews: (id: number, data: any) => {
    return http.put(`/api/admin/news/${id}`, data)
  },
  // 删除新闻
  deleteNews: (id: number) => {
    return http.delete(`/api/admin/news/${id}`)
  },
}

// 案例相关API
export const caseService = {
  // 获取案例列表
  getCases: (params: any = {}) => {
    return http.get('/api/admin/cases', { params })
  },
  // 前台获取案例列表（无需认证）
  getFrontCases: (params: any = {}) => {
    return http.get('/api/cases', { params })
  },
  // 获取案例详情
  getCaseById: (id: number) => {
    return http.get(`/api/admin/cases/${id}`)
  },
  // 前台获取案例详情（无需认证）
  getFrontCaseById: (id: number) => {
    return http.get(`/api/cases/${id}`)
  },
  // 创建案例
  createCase: (data: any) => {
    return http.post('/api/admin/cases', data)
  },
  // 更新案例
  updateCase: (id: number, data: any) => {
    return http.put(`/api/admin/cases/${id}`, data)
  },
  // 删除案例
  deleteCase: (id: number) => {
    return http.delete(`/api/admin/cases/${id}`)
  },
}

// 解决方案相关API
export const solutionService = {
  // 获取解决方案列表
  getSolutions: (params: any = {}) => {
    return http.get('/api/admin/solutions', { params })
  },
  // 前台获取解决方案列表（无需认证）
  getFrontSolutions: (params: any = {}) => {
    return http.get('/api/solutions', { params })
  },
  // 获取解决方案详情
  getSolutionById: (id: number) => {
    return http.get(`/api/admin/solutions/${id}`)
  },
  // 前台获取解决方案详情（无需认证）
  getFrontSolutionById: (id: number) => {
    return http.get(`/api/solutions/${id}`)
  },
  // 创建解决方案
  createSolution: (data: any) => {
    return http.post('/api/admin/solutions', data)
  },
  // 更新解决方案
  updateSolution: (id: number, data: any) => {
    return http.put(`/api/admin/solutions/${id}`, data)
  },
  // 删除解决方案
  deleteSolution: (id: number) => {
    return http.delete(`/api/admin/solutions/${id}`)
  },
}

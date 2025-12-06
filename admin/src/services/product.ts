import http from './http'

// 产品相关API
export const productService = {
  // 获取产品列表
  getProducts: (params: any) => {
    return http.get('/api/admin/products', { params })
  },
  // 获取产品详情
  getProductById: (id: number) => {
    return http.get(`/api/admin/products/${id}`)
  },
  // 创建产品
  createProduct: (data: any) => {
    return http.post('/api/admin/products', data)
  },
  // 更新产品
  updateProduct: (id: number, data: any) => {
    return http.put(`/api/admin/products/${id}`, data)
  },
  // 删除产品
  deleteProduct: (id: number) => {
    return http.delete(`/api/admin/products/${id}`)
  },
  // 更新产品状态
  updateProductStatus: (id: number, status: number) => {
    return http.put(`/api/admin/products/${id}/status`, { status })
  },
}

// 产品分类相关API
export const categoryService = {
  // 获取分类列表
  getCategories: () => {
    return http.get('/api/admin/categories')
  },
  // 获取分类详情
  getCategoryById: (id: number) => {
    return http.get(`/api/admin/categories/${id}`)
  },
  // 创建分类
  createCategory: (data: any) => {
    return http.post('/api/admin/categories', data)
  },
  // 更新分类
  updateCategory: (id: number, data: any) => {
    return http.put(`/api/admin/categories/${id}`, data)
  },
  // 删除分类
  deleteCategory: (id: number) => {
    return http.delete(`/api/admin/categories/${id}`)
  },
}

// 产品品牌相关API
export const brandService = {
  // 获取品牌列表
  getBrands: () => {
    return http.get('/api/admin/brands')
  },
  // 获取品牌详情
  getBrandById: (id: number) => {
    return http.get(`/api/admin/brands/${id}`)
  },
  // 创建品牌
  createBrand: (data: any) => {
    return http.post('/api/admin/brands', data)
  },
  // 更新品牌
  updateBrand: (id: number, data: any) => {
    return http.put(`/api/admin/brands/${id}`, data)
  },
  // 删除品牌
  deleteBrand: (id: number) => {
    return http.delete(`/api/admin/brands/${id}`)
  },
}

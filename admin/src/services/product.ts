/* eslint-disable @typescript-eslint/no-explicit-any */
import http from './http'

// 产品相关API
export const productService = {
  // 获取产品列表
  getProducts: (params: any) => {
    return http.get('/admin/products', { params })
  },
  // 获取产品详情
  getProductById: (id: number) => {
    return http.get(`/admin/products/${id}`)
  },
  // 创建产品
  createProduct: (data: any) => {
    return http.post('/admin/products', data)
  },
  // 更新产品
  updateProduct: (id: number, data: any) => {
    return http.put(`/admin/products/${id}`, data)
  },
  // 删除产品
  deleteProduct: (id: number) => {
    return http.delete(`/admin/products/${id}`)
  },
  // 更新产品状态
  updateProductStatus: (id: number, status: number) => {
    return http.put(`/admin/products/${id}/status`, { status })
  },
}

// 批量导入相关API
export const downloadImportTemplate = async () => {
  const blob = await http.get('/admin/products/import-template', {
    responseType: 'blob',
  })
  
  // 创建下载链接
  const url = window.URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.setAttribute('download', '产品批量导入模板.xlsx')
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  window.URL.revokeObjectURL(url)
}

export const importProducts = async (file: File) => {
  const formData = new FormData()
  formData.append('file', file)
  
  return http.post('/admin/products/import', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })
}

// 产品分类相关API
export const categoryService = {
  // 获取分类列表
  getCategories: () => {
    return http.get('/admin/categories')
  },
  // 获取分类详情
  getCategoryById: (id: number) => {
    return http.get(`/admin/categories/${id}`)
  },
  // 创建分类
  createCategory: (data: any) => {
    return http.post('/admin/categories', data)
  },
  // 更新分类
  updateCategory: (id: number, data: any) => {
    return http.put(`/admin/categories/${id}`, data)
  },
  // 删除分类
  deleteCategory: (id: number) => {
    return http.delete(`/admin/categories/${id}`)
  },
}

// 产品品牌相关API
export const brandService = {
  // 获取品牌列表
  getBrands: () => {
    return http.get('/admin/brands')
  },
  // 获取品牌详情
  getBrandById: (id: number) => {
    return http.get(`/admin/brands/${id}`)
  },
  // 创建品牌
  createBrand: (data: any) => {
    return http.post('/admin/brands', data)
  },
  // 更新品牌
  updateBrand: (id: number, data: any) => {
    return http.put(`/admin/brands/${id}`, data)
  },
  // 删除品牌
  deleteBrand: (id: number) => {
    return http.delete(`/admin/brands/${id}`)
  },
}

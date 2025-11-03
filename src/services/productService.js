import api from './api'

export const productService = {
  /**
   * Get all product categories
   */
  async getCategories(activeOnly = false, withProducts = true) {
    const response = await api.get('/pos/categories', {
      params: { active_only: activeOnly, with_products: withProducts }
    })
    return response.data
  },

  /**
   * Create a new category
   */
  async createCategory(categoryData) {
    const response = await api.post('/pos/categories', categoryData)
    return response.data
  },

  /**
   * Update a category
   */
  async updateCategory(id, categoryData) {
    const response = await api.put(`/pos/categories/${id}`, categoryData)
    return response.data
  },

  /**
   * Delete a category
   */
  async deleteCategory(id) {
    const response = await api.delete(`/pos/categories/${id}`)
    return response.data
  },

  /**
   * Get all products with filters
   */
  async getProducts(filters = {}) {
    const response = await api.get('/pos/products', { params: filters })
    return response.data
  },

  /**
   * Get a single product
   */
  async getProduct(id) {
    const response = await api.get(`/pos/products/${id}`)
    return response.data
  },

  /**
   * Create a new product
   */
  async createProduct(productData) {
    const formData = new FormData()

    // Append all fields to FormData
    Object.keys(productData).forEach(key => {
      if (productData[key] !== null && productData[key] !== undefined) {
        formData.append(key, productData[key])
      }
    })

    const response = await api.post('/pos/products', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
    return response.data
  },

  /**
   * Update a product
   */
  async updateProduct(id, productData) {
    const formData = new FormData()

    // Append all fields to FormData
    Object.keys(productData).forEach(key => {
      if (productData[key] !== null && productData[key] !== undefined) {
        formData.append(key, productData[key])
      }
    })

    const response = await api.post(`/pos/products/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      },
      params: {
        _method: 'PUT'
      }
    })
    return response.data
  },

  /**
   * Delete a product
   */
  async deleteProduct(id) {
    const response = await api.delete(`/pos/products/${id}`)
    return response.data
  },

  /**
   * Adjust product stock to a specific quantity
   */
  async adjustStock(id, quantity, notes = null) {
    const response = await api.post(`/pos/products/${id}/adjust-stock`, {
      quantity,
      notes
    })
    return response.data
  },

  /**
   * Add stock to product (increase)
   */
  async addStock(id, quantity, notes = null, referenceNumber = null) {
    const response = await api.post(`/pos/products/${id}/add-stock`, {
      quantity,
      notes,
      reference_number: referenceNumber
    })
    return response.data
  },

  /**
   * Get stock movements for a product
   */
  async getStockMovements(id) {
    const response = await api.get(`/pos/products/${id}/stock-movements`)
    return response.data
  },

  /**
   * Get low stock products
   */
  async getLowStockProducts() {
    const response = await api.get('/pos/products/low-stock/list')
    return response.data
  },

  /**
   * Get product image URL
   */
  getProductImageUrl(imagePath) {
    if (!imagePath) return null
    const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'
    return `${baseUrl}/storage/${imagePath}`
  }
}

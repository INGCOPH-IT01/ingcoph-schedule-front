import api from './api'

export const bannerService = {
  // Get all active banners (public)
  async getActiveBanners() {
    const response = await api.get('/banners')
    return response.data
  },

  // Get all banners (admin)
  async getAllBanners() {
    const response = await api.get('/admin/banners')
    return response.data
  },

  // Create banner
  async createBanner(formData) {
    const response = await api.post('/admin/banners', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
    return response.data
  },

  // Update banner
  async updateBanner(id, formData) {
    const response = await api.post(`/admin/banners/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
    return response.data
  },

  // Delete banner
  async deleteBanner(id) {
    const response = await api.delete(`/admin/banners/${id}`)
    return response.data
  },

  // Reorder banners
  async reorderBanners(banners) {
    const response = await api.post('/admin/banners/reorder', { banners })
    return response.data
  }
}

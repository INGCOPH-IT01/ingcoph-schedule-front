import api from './api'

export const promotionService = {
  // Get all promotions (admin)
  async getPromotions(params = {}) {
    try {
      const response = await api.get('/admin/promotions', { params })
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch promotions')
    }
  },

  // Get active promotions (public)
  async getActivePromotions() {
    try {
      const response = await api.get('/promotions/active')
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch active promotions')
    }
  },

  // Get a specific promotion
  async getPromotion(id) {
    try {
      const response = await api.get(`/admin/promotions/${id}`)
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch promotion')
    }
  },

  // Create a new promotion
  async createPromotion(promotionData) {
    try {
      const formData = new FormData()

      // Add text fields
      formData.append('title', promotionData.title)
      formData.append('content', promotionData.content)
      formData.append('is_active', promotionData.is_active ? '1' : '0')
      formData.append('display_order', promotionData.display_order || 0)

      if (promotionData.published_at) {
        formData.append('published_at', promotionData.published_at)
      }

      if (promotionData.expires_at) {
        formData.append('expires_at', promotionData.expires_at)
      }

      // Add media files
      if (promotionData.media && promotionData.media.length > 0) {
        promotionData.media.forEach((file) => {
          formData.append('media[]', file)
        })
      }

      const response = await api.post('/admin/promotions', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to create promotion')
    }
  },

  // Update a promotion
  async updatePromotion(id, promotionData) {
    try {
      const formData = new FormData()

      // Add text fields
      if (promotionData.title) {
        formData.append('title', promotionData.title)
      }

      if (promotionData.content) {
        formData.append('content', promotionData.content)
      }

      if (promotionData.is_active !== undefined) {
        formData.append('is_active', promotionData.is_active ? '1' : '0')
      }

      if (promotionData.display_order !== undefined) {
        formData.append('display_order', promotionData.display_order)
      }

      if (promotionData.published_at !== undefined) {
        formData.append('published_at', promotionData.published_at || '')
      }

      if (promotionData.expires_at !== undefined) {
        formData.append('expires_at', promotionData.expires_at || '')
      }

      // Add existing media URLs to keep
      if (promotionData.existing_media && promotionData.existing_media.length > 0) {
        promotionData.existing_media.forEach((url, index) => {
          formData.append(`existing_media[${index}]`, url)
        })
      }

      // Add new media files
      if (promotionData.media && promotionData.media.length > 0) {
        promotionData.media.forEach((file) => {
          formData.append('media[]', file)
        })
      }

      const response = await api.post(`/admin/promotions/${id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to update promotion')
    }
  },

  // Delete a promotion
  async deletePromotion(id) {
    try {
      const response = await api.delete(`/admin/promotions/${id}`)
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to delete promotion')
    }
  }
}

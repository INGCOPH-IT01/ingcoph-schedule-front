import api from './api'
import { apiCache } from '../utils/apiCache'

export const courtService = {
  async getSports(useCache = true) {
    const cacheKey = 'sports_list'

    // Check cache first
    if (useCache) {
      const cached = apiCache.get(cacheKey)
      if (cached) return cached
    }

    try {
      const response = await api.get('/sports')
      const data = response.data.data

      // Cache for 10 minutes (sports don't change often)
      apiCache.set(cacheKey, data, 600000)

      return data
    } catch (error) {
      throw new Error('Failed to fetch sports')
    }
  },

  /**
   * Clear sports cache - call this after creating/updating/deleting a sport
   */
  clearSportsCache() {
    apiCache.delete('sports_list')
  },

  async getSport(id) {
    try {
      const response = await api.get(`/sports/${id}`)
      return response.data.data
    } catch (error) {
      throw new Error('Failed to fetch sport')
    }
  },

  async createSport(sportData) {
    try {
      const response = await api.post('/sports', sportData)
      // Clear cache after creating
      this.clearSportsCache()
      return response.data.data
    } catch (error) {
      throw error
    }
  },

  async updateSport(id, sportData) {
    try {
      const response = await api.put(`/sports/${id}`, sportData)
      // Clear cache after updating
      this.clearSportsCache()
      return response.data.data
    } catch (error) {
      throw error
    }
  },

  async deleteSport(id) {
    try {
      const response = await api.delete(`/sports/${id}`)
      // Clear cache after deleting
      this.clearSportsCache()
      return response.data
    } catch (error) {
      throw error
    }
  },

  async getCourts(sportId = null, useCache = true) {
    const cacheKey = sportId ? `courts_sport_${sportId}` : 'courts_all'

    // Check cache first
    if (useCache) {
      const cached = apiCache.get(cacheKey)
      if (cached) return cached
    }

    try {
      const params = sportId ? { sport_id: sportId } : {}
      const response = await api.get('/courts', { params })
      const data = response.data.data

      // Cache for 5 minutes (courts don't change very often)
      apiCache.set(cacheKey, data, 300000)

      return data
    } catch (error) {
      throw new Error('Failed to fetch courts')
    }
  },

  /**
   * Clear courts cache - call this after creating/updating/deleting a court
   */
  clearCourtsCache() {
    // Clear all court-related cache entries
    const keys = apiCache.keys()
    keys.forEach(key => {
      if (key.startsWith('courts_')) {
        apiCache.delete(key)
      }
    })
  },

  async getCourt(id) {
    try {
      const response = await api.get(`/courts/${id}`)
      return response.data.data
    } catch (error) {
      throw new Error('Failed to fetch court')
    }
  },

  async getAvailableSlots(courtId, date, duration = 1) {
    try {
      const response = await api.get(`/courts/${courtId}/available-slots`, {
        params: { date, duration }
      })
      return response.data.data
    } catch (error) {
      throw new Error('Failed to fetch available slots')
    }
  },

  async createBooking(bookingData) {
    try {
      const response = await api.post('/bookings', bookingData)

      // Check if the response indicates a waitlist entry was created
      if (response.data.waitlisted) {
        return {
          ...response.data,
          isWaitlisted: true
        }
      }

      return response.data.data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to create booking')
    }
  },

  async getBookings(filters = {}) {
    try {
      const response = await api.get('/bookings', { params: filters })
      return response.data.data
    } catch (error) {
      throw new Error('Failed to fetch bookings')
    }
  },

  async updateBooking(id, data) {
    try {
      const response = await api.put(`/bookings/${id}`, data)
      return response.data.data
    } catch (error) {
      throw new Error('Failed to update booking')
    }
  },

  async deleteBooking(id) {
    try {
      await api.delete(`/bookings/${id}`)
    } catch (error) {
      throw new Error('Failed to delete booking')
    }
  },

  async createCourt(courtData) {
    try {
      const response = await api.post('/courts', courtData)
      // Clear cache after creating
      this.clearCourtsCache()
      return response.data.data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to create court')
    }
  },

  async updateCourt(id, courtData) {
    try {
      const response = await api.put(`/courts/${id}`, courtData)
      // Clear cache after updating
      this.clearCourtsCache()
      return response.data.data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to update court')
    }
  },

  async deleteCourt(id) {
    try {
      await api.delete(`/courts/${id}`)
      // Clear cache after deleting
      this.clearCourtsCache()
    } catch (error) {
      throw new Error('Failed to delete court')
    }
  },

  async saveImage(id, imageData) {
    try {
      const response = await api.post(`/save-court-image/${id}`, imageData,{
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })
      return response.data.data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to save image')
    }
  },

  // QR Code methods
  async validateQrCode(qrCode) {
    try {
      const response = await api.post('/bookings/validate-qr', { qr_code: qrCode })
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to validate QR code')
    }
  },

  async getQrCode(bookingId) {
    try {
      const response = await api.get(`/bookings/${bookingId}/qr-code`)
      return response.data.data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to get QR code')
    }
  },

  // Time-based pricing methods
  async getTimeBasedPricing(sportId) {
    try {
      const response = await api.get(`/sports/${sportId}/time-based-pricing`)
      return response.data.data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch time-based pricing')
    }
  },

  async createTimeBasedPricing(sportId, pricingData) {
    try {
      const response = await api.post(`/sports/${sportId}/time-based-pricing`, pricingData)
      return response.data.data
    } catch (error) {
      throw error
    }
  },

  async updateTimeBasedPricing(sportId, pricingId, pricingData) {
    try {
      const response = await api.put(`/sports/${sportId}/time-based-pricing/${pricingId}`, pricingData)
      return response.data.data
    } catch (error) {
      throw error
    }
  },

  async deleteTimeBasedPricing(sportId, pricingId) {
    try {
      const response = await api.delete(`/sports/${sportId}/time-based-pricing/${pricingId}`)
      return response.data
    } catch (error) {
      throw error
    }
  },

  // Get price change history for a sport
  async getPriceHistory(sportId) {
    try {
      const response = await api.get(`/sports/${sportId}/price-history`)
      return response.data.data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch price history')
    }
  },

  async getTotalBookedHours(courtId) {
    try {
      const response = await api.get(`/courts/${courtId}/total-booked-hours`)
      return response.data.data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch total booked hours')
    }
  }
}

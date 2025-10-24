import api from './api'

export const courtService = {
  async getSports() {
    try {
      const response = await api.get('/sports')
      return response.data.data
    } catch (error) {
      throw new Error('Failed to fetch sports')
    }
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
      return response.data.data
    } catch (error) {
      throw error
    }
  },

  async updateSport(id, sportData) {
    try {
      const response = await api.put(`/sports/${id}`, sportData)
      return response.data.data
    } catch (error) {
      throw error
    }
  },

  async deleteSport(id) {
    try {
      const response = await api.delete(`/sports/${id}`)
      return response.data
    } catch (error) {
      throw error
    }
  },

  async getCourts(sportId = null) {
    try {
      const params = sportId ? { sport_id: sportId } : {}
      const response = await api.get('/courts', { params })
      return response.data.data
    } catch (error) {
      throw new Error('Failed to fetch courts')
    }
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
      return response.data.data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to create court')
    }
  },

  async updateCourt(id, courtData) {
    try {
      const response = await api.put(`/courts/${id}`, courtData)
      return response.data.data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to update court')
    }
  },

  async deleteCourt(id) {
    try {
      await api.delete(`/courts/${id}`)
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

  async getTotalBookedHours(courtId) {
    try {
      const response = await api.get(`/courts/${courtId}/total-booked-hours`)
      return response.data.data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch total booked hours')
    }
  }
}

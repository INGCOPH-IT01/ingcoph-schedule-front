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
  }
}

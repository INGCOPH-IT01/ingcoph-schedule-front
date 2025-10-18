import api from './api'

export const bookingService = {
  // Get all bookings
  async getBookings(params = {}) {
    try {
      const response = await api.get('/bookings', { params })
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch bookings')
    }
  },

  // Get a specific booking
  async getBooking(id) {
    try {
      const response = await api.get(`/bookings/${id}`)
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch booking')
    }
  },

  // Create a new booking
  async createBooking(bookingData) {
    try {
      const response = await api.post('/bookings', bookingData)
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to create booking')
    }
  },

  // Update a booking
  async updateBooking(id, bookingData) {
    try {
      const response = await api.put(`/bookings/${id}`, bookingData)
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to update booking')
    }
  },

  // Delete a booking
  async deleteBooking(id) {
    try {
      const response = await api.delete(`/bookings/${id}`)
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to delete booking')
    }
  },

  // Upload proof of payment for a booking
  async uploadProofOfPayment(bookingId, file, paymentMethod = 'gcash') {
    try {
      const formData = new FormData()
      formData.append('proof_of_payment', file)
      formData.append('payment_method', paymentMethod)

      const response = await api.post(`/bookings/${bookingId}/upload-proof`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to upload proof of payment')
    }
  },

  // Validate QR code for a booking
  async validateQrCode(qrCode) {
    try {
      const response = await api.post('/bookings/validate-qr', { qr_code: qrCode })
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to validate QR code')
    }
  },

  // Get QR code for a booking
  async getQrCode(bookingId) {
    try {
      const response = await api.get(`/bookings/${bookingId}/qr-code`)
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to get QR code')
    }
  },

  // Admin functions
  async getPendingBookings() {
    try {
      const response = await api.get('/admin/bookings/pending')
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch pending bookings')
    }
  },

  async getAdminStats() {
    try {
      const response = await api.get('/admin/bookings/stats')
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch admin stats')
    }
  },

  async approveBooking(id) {
    try {
      const response = await api.post(`/admin/bookings/${id}/approve`)
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to approve booking')
    }
  },

  async rejectBooking(id, reason = '') {
    try {
      const response = await api.post(`/admin/bookings/${id}/reject`, { reason })
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to reject booking')
    }
  },

  // Staff functions
  async getApprovedBookings() {
    try {
      const response = await api.get('/staff/bookings/approved')
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch approved bookings')
    }
  },

  // Update booking attendance status
  async updateAttendanceStatus(bookingId, status, playersAttended = null) {
    try {
      const data = {
        attendance_status: status
      }

      // Include players_attended if provided
      if (playersAttended !== null && playersAttended !== undefined) {
        data.players_attended = playersAttended
      }

      const response = await api.patch(`/bookings/${bookingId}/attendance-status`, data)
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to update attendance status')
    }
  }
}

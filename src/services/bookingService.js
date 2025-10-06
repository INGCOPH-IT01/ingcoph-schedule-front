import api from './api'

export const bookingService = {
  // Get all bookings
  async getBookings(params = {}) {
    const response = await api.get('/bookings', { params })
    return response.data
  },

  // Get a specific booking
  async getBooking(id) {
    const response = await api.get(`/bookings/${id}`)
    return response.data
  },

  // Create a new booking
  async createBooking(bookingData) {
    const response = await api.post('/bookings', bookingData)
    return response.data
  },

  // Update a booking
  async updateBooking(id, bookingData) {
    const response = await api.put(`/bookings/${id}`, bookingData)
    return response.data
  },

  // Delete a booking
  async deleteBooking(id) {
    const response = await api.delete(`/bookings/${id}`)
    return response.data
  },

  // Admin functions
  async getPendingBookings() {
    const response = await api.get('/admin/bookings/pending')
    return response.data
  },

  async getAdminStats() {
    const response = await api.get('/admin/bookings/stats')
    return response.data
  },

  async approveBooking(id) {
    const response = await api.post(`/admin/bookings/${id}/approve`)
    return response.data
  },

  async rejectBooking(id, reason = '') {
    const response = await api.post(`/admin/bookings/${id}/reject`, { reason })
    return response.data
  }
}

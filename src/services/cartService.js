import api from './api'

export const cartService = {
  /**
   * Get cart transaction and items for the current user
   */
  async getCartItems() {
    const response = await api.get('/cart')
    return response.data.cart_items || []
  },

  /**
   * Get cart transaction
   */
  async getCartTransaction() {
    const response = await api.get('/cart')
    return response.data
  },

  /**
   * Get cart count
   */
  async getCartCount() {
    const response = await api.get('/cart/count')
    return response.data.count
  },

  /**
   * Add items to cart
   * @param {Array} items - Array of cart items
   */
  async addToCart(items) {
    const response = await api.post('/cart', { items })
    return response.data
  },

  /**
   * Remove item from cart
   * @param {number} itemId - Cart item ID
   */
  async removeFromCart(itemId) {
    const response = await api.delete(`/cart/${itemId}`)
    return response.data
  },

  /**
   * Clear all cart items
   */
  async clearCart() {
    const response = await api.delete('/cart')
    return response.data
  },

  /**
   * Checkout cart items
   * @param {Object} paymentData - Payment information
   */
  async checkout(paymentData) {
    const response = await api.post('/cart/checkout', paymentData)
    return response.data
  },

  /**
   * Get all cart transactions (Admin only)
   * @param {Object} filters - Optional filters (date_from, date_to, sort_by, sort_order)
   */
  async getAllTransactions(filters = {}) {
    const params = {}
    if (filters.date_from) params.date_from = filters.date_from
    if (filters.date_to) params.date_to = filters.date_to
    if (filters.sort_by) params.sort_by = filters.sort_by
    if (filters.sort_order) params.sort_order = filters.sort_order

    const response = await api.get('/admin/cart-transactions', { params })
    return response.data
  },

  /**
   * Get pending cart transactions (Admin/Staff only)
   */
  async getPendingTransactions() {
    const response = await api.get('/admin/cart-transactions/pending')
    return response.data
  },

  /**
   * Approve a cart transaction (Admin/Staff only)
   * @param {number} transactionId - Cart transaction ID
   */
  async approveTransaction(transactionId) {
    const response = await api.post(`/admin/cart-transactions/${transactionId}/approve`)
    return response.data
  },

  /**
   * Reject a cart transaction (Admin/Staff only)
   * @param {number} transactionId - Cart transaction ID
   * @param {string} reason - Rejection reason
   */
  async rejectTransaction(transactionId, reason) {
    const response = await api.post(`/admin/cart-transactions/${transactionId}/reject`, { reason })
    return response.data
  },

  /**
   * Update attendance status for a cart transaction (Admin only)
   * @param {number} transactionId - Cart transaction ID
   * @param {string} status - Attendance status (not_set, showed_up, no_show)
   * @param {number} playersAttended - Number of players who attended (optional)
   */
  async updateAttendanceStatus(transactionId, status, playersAttended = null) {
    const data = {
      attendance_status: status
    }

    // Include players_attended if provided
    if (playersAttended !== null && playersAttended !== undefined) {
      data.players_attended = playersAttended
    }

    const response = await api.patch(`/admin/cart-transactions/${transactionId}/attendance-status`, data)
    return response.data
  },

  /**
   * Upload proof of payment for a cart transaction
   * @param {number} transactionId - Cart transaction ID
   * @param {File} file - Proof of payment file
   * @param {string} paymentMethod - Payment method (gcash, cash)
   */
  async uploadProofOfPayment(transactionId, file, paymentMethod = 'gcash') {
    try {
      const formData = new FormData()
      formData.append('proof_of_payment', file)
      formData.append('payment_method', paymentMethod)

      const response = await api.post(`/cart-transactions/${transactionId}/upload-proof`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })
      return response.data
    } catch (error) {
      console.error('Upload proof of payment error:', error)
      throw new Error(error.response?.data?.message || 'Failed to upload proof of payment')
    }
  },

  /**
   * Resend confirmation email for an approved cart transaction
   * @param {number} transactionId - Cart transaction ID
   */
  async resendConfirmationEmail(transactionId) {
    try {
      const response = await api.post(`/cart-transactions/${transactionId}/resend-confirmation`)
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to resend confirmation email')
    }
  }
}

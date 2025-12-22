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
   * Validate cart items availability
   * Checks if items are still available and removes unavailable ones
   */
  async validateCartItems() {
    const response = await api.post('/cart/validate')
    return response.data
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
   * Get all cart transactions (Admin only) - Optimized with server-side filtering
   * @param {Object} filters - Optional filters
   * @param {string} filters.date_from - Start date for filtering
   * @param {string} filters.date_to - End date for filtering
   * @param {string} filters.sort_by - Field to sort by (id, created_at, total_price, booking_date)
   * @param {string} filters.sort_order - Sort order (asc, desc)
   * @param {Array<string>} filters.approval_status - Filter by approval status
   * @param {Array<string>} filters.payment_status - Filter by payment status
   * @param {string} filters.sport - Filter by sport name
   * @param {string} filters.user_search - Search users by name, email, or admin notes
   * @param {number} filters.page - Page number for pagination
   * @param {number} filters.per_page - Items per page (default 50, max 100)
   */
  async getAllTransactions(filters = {}) {
    const params = {}

    // Date range filters
    if (filters.date_from) params.date_from = filters.date_from
    if (filters.date_to) params.date_to = filters.date_to

    // Sorting
    if (filters.sort_by) params.sort_by = filters.sort_by
    if (filters.sort_order) params.sort_order = filters.sort_order

    // Server-side filtering
    if (filters.approval_status && filters.approval_status.length > 0) {
      params.approval_status = filters.approval_status.join(',')
    }

    if (filters.payment_status && filters.payment_status.length > 0) {
      params.payment_status = filters.payment_status.join(',')
    }

    if (filters.sport && filters.sport !== 'All Sports') {
      params.sport = filters.sport
    }

    if (filters.user_search && filters.user_search.trim() !== '') {
      params.user_search = filters.user_search.trim()
    }

    // Pagination
    if (filters.page) params.page = filters.page
    if (filters.per_page) params.per_page = Math.min(filters.per_page, 100)

    const response = await api.get('/admin/cart-transactions', { params })

    // Handle paginated response
    if (response.data.pagination) {
      return {
        data: response.data.data || [],
        pagination: response.data.pagination,
        summary: response.data.summary
      }
    }

    // Handle non-paginated response (backward compatibility)
    return response.data.data || response.data
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
   * Upload proof of payment for a cart transaction (supports multiple files)
   * @param {number} transactionId - Cart transaction ID
   * @param {File|File[]} files - Proof of payment file(s)
   * @param {string} paymentMethod - Payment method (gcash, cash)
   */
  async uploadProofOfPayment(transactionId, files, paymentMethod = 'gcash', paymentReferenceNumber = null) {
    try {
      const formData = new FormData()

      // Handle both single file and array of files
      const fileArray = Array.isArray(files) ? files : [files]

      // Append each file to FormData
      fileArray.forEach((file) => {
        formData.append('proof_of_payment[]', file)
      })

      formData.append('payment_method', paymentMethod)

      if (paymentReferenceNumber) {
        formData.append('payment_reference_number', paymentReferenceNumber)
      }

      const response = await api.post(`/cart-transactions/${transactionId}/upload-proof`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })
      return response.data
    } catch (error) {
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
  },

  /**
   * Update cart item (Admin only) - supports updating court, date, and time
   * @param {number} cartItemId - Cart item ID
   * @param {Object} updateData - Data to update (court_id, booking_date, start_time, end_time)
   */
  async updateCartItem(cartItemId, updateData) {
    try {
      const response = await api.put(`/admin/cart-items/${cartItemId}`, updateData)
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to update cart item')
    }
  },

  /**
   * Delete cart item (Admin only)
   * @param {number} cartItemId - Cart item ID
   */
  async deleteCartItem(cartItemId) {
    try {
      const response = await api.delete(`/admin/cart-items/${cartItemId}`)
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to delete cart item')
    }
  }
}

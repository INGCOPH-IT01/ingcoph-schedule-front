import api from './api'

export const posService = {
  /**
   * Get all POS sales with filters
   */
  async getSales(filters = {}) {
    const response = await api.get('/pos/sales', { params: filters })
    return response.data
  },

  /**
   * Get a single POS sale
   */
  async getSale(id) {
    const response = await api.get(`/pos/sales/${id}`)
    return response.data
  },

  /**
   * Create a new POS sale
   */
  async createSale(saleData) {
    const response = await api.post('/pos/sales', saleData)
    return response.data
  },

  /**
   * Update sale status
   */
  async updateSaleStatus(id, status, notes = null) {
    const response = await api.patch(`/pos/sales/${id}/status`, {
      status,
      notes
    })
    return response.data
  },

  /**
   * Delete a sale (only pending sales)
   */
  async deleteSale(id) {
    const response = await api.delete(`/pos/sales/${id}`)
    return response.data
  },

  /**
   * Get POS statistics
   */
  async getStatistics(dateFrom = null, dateTo = null) {
    const response = await api.get('/pos/statistics', {
      params: {
        date_from: dateFrom,
        date_to: dateTo
      }
    })
    return response.data
  },

  /**
   * Get sales report
   */
  async getSalesReport(dateFrom = null, dateTo = null) {
    const response = await api.get('/pos/sales-report', {
      params: {
        date_from: dateFrom,
        date_to: dateTo
      }
    })
    return response.data
  },

  /**
   * Get product sales summary
   */
  async getProductSalesSummary(dateFrom = null, dateTo = null) {
    const response = await api.get('/pos/product-sales-summary', {
      params: {
        date_from: dateFrom,
        date_to: dateTo
      }
    })
    return response.data
  },

  /**
   * Helper function to calculate cart totals
   */
  calculateCartTotals(items, discount = 0, tax = 0) {
    const subtotal = items.reduce((sum, item) => {
      return sum + (item.unit_price * item.quantity) - (item.discount || 0)
    }, 0)

    const total = subtotal - discount + tax

    return {
      subtotal: parseFloat(subtotal.toFixed(2)),
      discount: parseFloat(discount.toFixed(2)),
      tax: parseFloat(tax.toFixed(2)),
      total: parseFloat(total.toFixed(2))
    }
  },

  /**
   * Format sale number
   */
  formatSaleNumber(saleNumber) {
    return saleNumber || 'N/A'
  },

  /**
   * Get sale status color
   */
  getSaleStatusColor(status) {
    const colors = {
      'completed': 'success',
      'pending': 'warning',
      'cancelled': 'error',
      'refunded': 'info'
    }
    return colors[status] || 'grey'
  },

  /**
   * Get sale status text
   */
  getSaleStatusText(status) {
    const texts = {
      'completed': 'Completed',
      'pending': 'Pending',
      'cancelled': 'Cancelled',
      'refunded': 'Refunded'
    }
    return texts[status] || status
  },

  /**
   * Get sale status icon
   */
  getSaleStatusIcon(status) {
    const icons = {
      'completed': 'mdi-check-circle',
      'pending': 'mdi-clock-alert',
      'cancelled': 'mdi-close-circle',
      'refunded': 'mdi-cash-refund'
    }
    return icons[status] || 'mdi-help-circle'
  }
}

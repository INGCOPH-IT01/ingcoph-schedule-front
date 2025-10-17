/**
 * Status Service
 * Utility functions for status-related operations
 */

export const statusService = {
  /**
   * Get the color for a given status
   * @param {string} status - The status value
   * @returns {string} The color name for the status
   */
  getStatusColor(status) {
    const colors = {
      in_cart: 'purple',
      pending: 'warning',
      approved: 'success',
      rejected: 'error',
      cancelled: 'error',
      completed: 'info'
    }
    return colors[status] || 'grey'
  },

  /**
   * Get the icon for a given status
   * @param {string} status - The status value
   * @returns {string} The Material Design icon name for the status
   */
  getStatusIcon(status) {
    const icons = {
      pending: 'mdi-clock-alert',
      approved: 'mdi-check-circle',
      rejected: 'mdi-close-circle'
    }
    return icons[status] || 'mdi-help-circle'
  }
}

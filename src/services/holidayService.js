import api from './api'

export const holidayService = {
  /**
   * Get all holidays
   */
  async getHolidays() {
    try {
      const response = await api.get('/admin/holidays')
      return response.data.data || []
    } catch (error) {
      console.error('Error fetching holidays:', error)
      throw error
    }
  },

  /**
   * Get holidays for a specific year
   */
  async getHolidaysForYear(year) {
    try {
      const response = await api.get(`/admin/holidays/year/${year}`)
      return response.data
    } catch (error) {
      console.error('Error fetching holidays for year:', error)
      throw error
    }
  },

  /**
   * Check if a specific date is a holiday
   */
  async checkDate(date) {
    try {
      const response = await api.post('/admin/holidays/check-date', { date })
      return response.data
    } catch (error) {
      console.error('Error checking holiday date:', error)
      throw error
    }
  },

  /**
   * Check if a date has no business operations
   * @param {string} dateString - Date string in YYYY-MM-DD format
   * @param {Array} holidays - Array of holiday objects
   * @returns {boolean} - True if date has no business operations
   */
  hasNoBusinessOperations(dateString, holidays) {
    if (!dateString || !Array.isArray(holidays)) return false

    const checkDate = new Date(dateString)
    const checkMonth = checkDate.getMonth() + 1 // 0-indexed, so add 1
    const checkDay = checkDate.getDate()
    const checkYear = checkDate.getFullYear()

    return holidays.some(holiday => {
      if (!holiday.no_business_operations) return false

      const holidayDate = new Date(holiday.date)
      const holidayMonth = holidayDate.getMonth() + 1
      const holidayDay = holidayDate.getDate()
      const holidayYear = holidayDate.getFullYear()

      // Check for exact date match
      if (checkYear === holidayYear && checkMonth === holidayMonth && checkDay === holidayDay) {
        return true
      }

      // Check for recurring holiday (same month and day, any year)
      if (holiday.is_recurring && checkMonth === holidayMonth && checkDay === holidayDay) {
        return true
      }

      return false
    })
  }
}


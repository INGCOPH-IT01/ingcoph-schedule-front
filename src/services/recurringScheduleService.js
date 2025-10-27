import api from './api'

const recurringScheduleService = {
  // Get all recurring schedules for the current user
  async getRecurringSchedules() {
    try {
      const response = await api.get('/recurring-schedules')
      return response.data
    } catch (error) {
      throw error
    }
  },

  // Get all recurring schedules (admin only)
  async getAdminRecurringSchedules() {
    try {
      const response = await api.get('/admin/recurring-schedules')
      return response.data
    } catch (error) {
      throw error
    }
  },

  // Create a new recurring schedule
  async createRecurringSchedule(scheduleData) {
    try {
      const response = await api.post('/recurring-schedules', scheduleData)
      return response.data
    } catch (error) {
      throw error
    }
  },

  // Get a specific recurring schedule
  async getRecurringSchedule(id) {
    try {
      const response = await api.get(`/recurring-schedules/${id}`)
      return response.data
    } catch (error) {
      throw error
    }
  },

  // Update a recurring schedule
  async updateRecurringSchedule(id, scheduleData) {
    try {
      const response = await api.put(`/recurring-schedules/${id}`, scheduleData)
      return response.data
    } catch (error) {
      throw error
    }
  },

  // Delete a recurring schedule
  async deleteRecurringSchedule(id) {
    try {
      const response = await api.delete(`/recurring-schedules/${id}`)
      return response.data
    } catch (error) {
      throw error
    }
  },

  // Generate bookings for a recurring schedule
  async generateBookings(id, months) {
    try {
      const response = await api.post(`/recurring-schedules/${id}/generate-bookings`, {
        months: months
      })
      return response.data
    } catch (error) {
      throw error
    }
  },

  // Helper function to format recurrence days for display
  formatRecurrenceDays(days, type) {
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

    if (type === 'daily') {
      return 'Every day'
    } else if (type === 'weekly') {
      return days.map(day => dayNames[day]).join(', ')
    } else if (type === 'monthly') {
      return 'Monthly'
    } else if (type === 'yearly') {
      return 'Yearly'
    } else if (type === 'yearly_multiple_times') {
      return 'Yearly (Different Times per Day)'
    }

    return 'Custom'
  },

  // Helper function to get recurrence type options
  getRecurrenceTypeOptions() {
    return [
      { value: 'daily', label: 'Daily' },
      { value: 'weekly', label: 'Weekly' },
      { value: 'weekly_multiple_times', label: 'Weekly (Different Times per Day)' },
      { value: 'monthly', label: 'Monthly' },
      { value: 'yearly', label: 'Yearly' },
      { value: 'yearly_multiple_times', label: 'Yearly (Different Times per Day)' }
    ]
  },

  // Helper function to get day of week options
  getDayOfWeekOptions() {
    return [
      { value: 0, label: 'Sunday' },
      { value: 1, label: 'Monday' },
      { value: 2, label: 'Tuesday' },
      { value: 3, label: 'Wednesday' },
      { value: 4, label: 'Thursday' },
      { value: 5, label: 'Friday' },
      { value: 6, label: 'Saturday' }
    ]
  },

  // Helper function to validate recurring schedule data
  validateRecurringSchedule(data) {
    const errors = {}

    if (!data.court_id) {
      errors.court_id = 'Court is required'
    }

    if (!data.title || data.title.trim() === '') {
      errors.title = 'Title is required'
    }

    if (!data.start_time) {
      errors.start_time = 'Start time is required'
    }

    if (!data.end_time) {
      errors.end_time = 'End time is required'
    }

    if (data.start_time && data.end_time && data.start_time >= data.end_time) {
      errors.end_time = 'End time must be after start time'
    }

    if (!data.recurrence_type) {
      errors.recurrence_type = 'Recurrence type is required'
    }

    if (!data.recurrence_days || data.recurrence_days.length === 0) {
      errors.recurrence_days = 'At least one day must be selected'
    }

    // Helper function to parse date strings safely (avoiding timezone shifts)
    const parseLocalDate = (dateStr) => {
      const dateOnlyPattern = /^\d{4}-\d{2}-\d{2}$/
      if (dateOnlyPattern.test(dateStr)) {
        const [year, month, day] = dateStr.split('-').map(Number)
        return new Date(year, month - 1, day)
      }
      return new Date(dateStr)
    }

    if (!data.start_date) {
      errors.start_date = 'Start date is required'
    }

    if (data.start_date) {
      const startDate = parseLocalDate(data.start_date)
      const today = new Date()
      today.setHours(0, 0, 0, 0) // Compare dates only, not time
      if (startDate < today) {
        errors.start_date = 'Start date cannot be in the past'
      }
    }

    if (data.end_date && data.start_date) {
      const endDate = parseLocalDate(data.end_date)
      const startDate = parseLocalDate(data.start_date)
      if (endDate <= startDate) {
        errors.end_date = 'End date must be after start date'
      }
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors
    }
  }
}

export { recurringScheduleService }

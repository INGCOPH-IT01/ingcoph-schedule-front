import api from './api'
import { apiCache } from '../utils/apiCache'

export const companySettingService = {
  async getSettings(useCache = true) {
    const cacheKey = 'company_settings'

    // Check cache first
    if (useCache) {
      const cached = apiCache.get(cacheKey)
      if (cached) return cached
    }

    try {
      const response = await api.get('/company-settings')
      const data = response.data.data

      // Cache for 5 minutes (settings don't change very often)
      apiCache.set(cacheKey, data, 300000)

      return data
    } catch (error) {
      throw new Error('Failed to fetch company settings')
    }
  },

  /**
   * Clear settings cache - call this after updating settings
   */
  clearSettingsCache() {
    apiCache.delete('company_settings')
  },

  async getSetting(key) {
    try {
      const response = await api.get(`/company-settings/${key}`)
      return response.data.data
    } catch (error) {
      throw new Error('Failed to fetch company setting')
    }
  },

  async updateSettings(settingsData) {
    try {
      // Clear cache before updating
      this.clearSettingsCache()

      // Check if we have a file to upload
      const hasFile = settingsData.company_logo && (settingsData.company_logo instanceof File || settingsData.company_logo instanceof Blob)

      let response
      if (hasFile) {
        // Use FormData for file upload
        const payload = new FormData()
        payload.append('company_name', settingsData.company_name)
        payload.append('company_logo', settingsData.company_logo)

        // Add contact information if present
        if (settingsData.contact_email !== undefined) {
          payload.append('contact_email', settingsData.contact_email || '')
        }
        if (settingsData.contact_mobile !== undefined) {
          payload.append('contact_mobile', settingsData.contact_mobile || '')
        }
        if (settingsData.contact_viber !== undefined) {
          payload.append('contact_viber', settingsData.contact_viber || '')
        }

        // Add theme settings if present
        if (settingsData.theme_primary_color) {
          payload.append('theme_primary_color', settingsData.theme_primary_color)
        }
        if (settingsData.theme_secondary_color) {
          payload.append('theme_secondary_color', settingsData.theme_secondary_color)
        }
        if (settingsData.theme_background_color) {
          payload.append('theme_background_color', settingsData.theme_background_color)
        }
        if (settingsData.theme_mode) {
          payload.append('theme_mode', settingsData.theme_mode)
        }

        // Add dashboard settings if present
        if (settingsData.dashboard_welcome_message !== undefined) {
          payload.append('dashboard_welcome_message', settingsData.dashboard_welcome_message)
        }
        if (settingsData.dashboard_announcement !== undefined) {
          payload.append('dashboard_announcement', settingsData.dashboard_announcement)
        }
        if (settingsData.dashboard_show_stats !== undefined) {
          payload.append('dashboard_show_stats', settingsData.dashboard_show_stats ? '1' : '0')
        }
        if (settingsData.dashboard_show_recent_bookings !== undefined) {
          payload.append('dashboard_show_recent_bookings', settingsData.dashboard_show_recent_bookings ? '1' : '0')
        }

        // Laravel doesn't support file uploads with PUT, use POST with _method override
        payload.append('_method', 'PUT')

        // Use POST endpoint but with _method=PUT for Laravel
        // Important: Remove Content-Type header to let axios set it automatically with the boundary
        response = await api.post('/admin/company-settings', payload, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        })
      } else {
        // Use regular JSON with PUT
        response = await api.put('/admin/company-settings', settingsData)
      }

      // Clear cache again after successful update to ensure fresh data on next fetch
      this.clearSettingsCache()

      return response.data.data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to update company settings')
    }
  },

  async deleteLogo() {
    try {
      const response = await api.delete('/admin/company-settings/logo')
      // Clear cache after deleting logo
      this.clearSettingsCache()
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to delete company logo')
    }
  }
  ,

  _toBoolean(value) {
    return value === true || value === '1' || value === 1 || value === 'true'
  },

  async isUserBookingEnabled() {
    const settings = await this.getSettings()
    // Default to true if setting is missing for backward compatibility
    const flag = settings?.user_booking_enabled
    return flag === undefined ? true : this._toBoolean(flag)
  },

  async canUserCreateBookings(userOrRole) {
    try {
      // If user data is null/undefined, we cannot determine permissions safely
      // Return true to fail-open and avoid blocking (user will be checked on backend anyway)
      if (userOrRole === null || userOrRole === undefined) {
        console.warn('User data not available for booking permission check, failing open')
        return true
      }

      const role = typeof userOrRole === 'string' ? userOrRole : (userOrRole?.role || 'user')
      // Admin/Staff can always create bookings
      if (role === 'admin' || role === 'staff') return true
      // Regular user depends on the company setting
      return await this.isUserBookingEnabled()
    } catch (e) {
      // Fail-open (allow) if anything goes wrong to avoid blocking unexpectedly
      // Backend will enforce proper permissions
      console.warn('Error checking booking permissions, failing open:', e)
      return true
    }
  },

  /**
   * Get blocked booking dates
   * Always fetches fresh data to ensure accuracy for booking validation
   */
  async getBlockedBookingDates() {
    try {
      // Always fetch fresh data (bypass cache) to avoid showing outdated blocked dates
      const settings = await this.getSettings(false)
      return settings?.blocked_booking_dates || []
    } catch (e) {
      console.warn('Error fetching blocked booking dates:', e)
      return []
    }
  },

  /**
   * Check if a date is blocked for booking (for regular users only)
   * @param {string|Date} date - The date to check (YYYY-MM-DD format or Date object)
   * @param {string} userRole - The user's role ('user', 'admin', 'staff')
   * @returns {Object} { isBlocked: boolean, reason: string }
   */
  async isDateBlocked(date, userRole = 'user') {
    // Admin and staff are not affected by blocked dates
    if (userRole === 'admin' || userRole === 'staff') {
      return { isBlocked: false, reason: '' }
    }

    try {
      const blockedDates = await this.getBlockedBookingDates()

      if (!Array.isArray(blockedDates) || blockedDates.length === 0) {
        return { isBlocked: false, reason: '' }
      }

      // Parse the date to check
      const dateToCheck = new Date(date)
      dateToCheck.setHours(0, 0, 0, 0)

      // Check each blocked range
      for (const range of blockedDates) {
        const startDate = new Date(range.start_date)
        startDate.setHours(0, 0, 0, 0)

        // Check if this is an indefinite block (no end_date or empty end_date)
        const isIndefinite = !range.end_date || range.end_date === ''

        let isBlocked = false

        if (isIndefinite) {
          // Block from start_date onwards (indefinitely)
          isBlocked = dateToCheck >= startDate
        } else {
          // Block specific date range
          const endDate = new Date(range.end_date)
          endDate.setHours(23, 59, 59, 999)
          isBlocked = dateToCheck >= startDate && dateToCheck <= endDate
        }

        if (isBlocked) {
          return {
            isBlocked: true,
            reason: range.reason || 'This date range is blocked for booking'
          }
        }
      }

      return { isBlocked: false, reason: '' }
    } catch (e) {
      console.warn('Error checking if date is blocked:', e)
      return { isBlocked: false, reason: '' }
    }
  }
}

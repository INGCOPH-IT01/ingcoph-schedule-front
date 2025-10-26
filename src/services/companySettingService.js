import api from './api'

export const companySettingService = {
  // Simple in-memory cache to avoid repetitive network calls
  _cache: {
    data: null,
    fetchedAt: 0
  },

  async getSettings() {
    try {
      const response = await api.get('/company-settings')
      return response.data.data
    } catch (error) {
      throw new Error('Failed to fetch company settings')
    }
  },

  async getSettingsCached(forceRefresh = false) {
    try {
      const now = Date.now()
      const isFresh = (now - (this._cache.fetchedAt || 0)) < 30_000 // 30s
      if (!forceRefresh && this._cache.data && isFresh) {
        return this._cache.data
      }
      const settings = await this.getSettings()
      this._cache.data = settings
      this._cache.fetchedAt = now
      return settings
    } catch (error) {
      // On failure, surface the existing cache if available
      if (this._cache.data) return this._cache.data
      throw error
    }
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
      // Check if we have a file to upload
      const hasFile = settingsData.company_logo && (settingsData.company_logo instanceof File || settingsData.company_logo instanceof Blob)

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
        const response = await api.post('/admin/company-settings', payload, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        })
        return response.data.data
      } else {
        // Use regular JSON with PUT
        const response = await api.put('/admin/company-settings', settingsData)
        return response.data.data
      }
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to update company settings')
    }
  },

  async deleteLogo() {
    try {
      const response = await api.delete('/admin/company-settings/logo')
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
    const settings = await this.getSettingsCached()
    // Default to true if setting is missing for backward compatibility
    const flag = settings?.user_booking_enabled
    return flag === undefined ? true : this._toBoolean(flag)
  },

  async canUserCreateBookings(userOrRole) {
    try {
      const role = typeof userOrRole === 'string' ? userOrRole : (userOrRole?.role || 'user')
      // Admin/Staff can always create bookings
      if (role === 'admin' || role === 'staff') return true
      // Regular user depends on the company setting
      return await this.isUserBookingEnabled()
    } catch (e) {
      // Fail-open (allow) if anything goes wrong to avoid blocking unexpectedly
      return true
    }
  }
}

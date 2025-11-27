import api from './api'

// In-memory cache for user data to reduce API calls
let userCache = null
let userCacheTimestamp = null
const USER_CACHE_TTL = 60000 // 1 minute cache

export const authService = {
  async login(credentials) {
    try {
      const response = await api.post('/login', credentials)
      if (response.data.success) {
        localStorage.setItem('token', response.data.token)
        // Store user data for WebSocket subscriptions
        if (response.data.user) {
          localStorage.setItem('user', JSON.stringify(response.data.user))
        }
        return response.data
      }
      throw new Error(response.data.message)
    } catch (error) {
      // Handle validation errors specifically
      if (error.response?.status === 422 && error.response?.data?.errors) {
        const validationErrors = error.response.data.errors
        const errorMessages = Object.values(validationErrors).flat()
        throw new Error('Validation failed: ' + errorMessages.join(', '))
      }

      throw new Error(error.response?.data?.message || 'Login failed')
    }
  },

  async register(userData) {
    try {
      const response = await api.post('/register', userData)
      if (response.data.success) {
        localStorage.setItem('token', response.data.token)
        // Store user data for WebSocket subscriptions
        if (response.data.user) {
          localStorage.setItem('user', JSON.stringify(response.data.user))
        }
        return response.data
      }
      throw new Error(response.data.message)
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Registration failed')
    }
  },

  async logout() {
    try {
      await api.post('/logout')
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      // Clear user cache on logout
      userCache = null
      userCacheTimestamp = null
    } catch (error) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      // Clear user cache even on error
      userCache = null
      userCacheTimestamp = null
    }
  },

  /**
   * Clear the user data cache
   * Use this when you need to force a refresh of user data
   */
  clearUserCache() {
    userCache = null
    userCacheTimestamp = null
  },

  async getUser(forceRefresh = false) {
    try {
      // Return cached user if available and not expired
      if (!forceRefresh && userCache && Date.now() - userCacheTimestamp < USER_CACHE_TTL) {
        return userCache
      }

      const response = await api.get('/user')
      const user = response.data.user

      // Update cache
      userCache = user
      userCacheTimestamp = Date.now()

      // Store/update user data in localStorage for WebSocket
      if (user) {
        localStorage.setItem('user', JSON.stringify(user))
      }
      return user
    } catch (error) {
      // Clear cache on error
      userCache = null
      userCacheTimestamp = null
      throw new Error('Failed to get user data')
    }
  },

  async getCurrentUser(forceRefresh = false) {
    try {
      // First check if we have a token
      if (!this.isAuthenticated()) {
        userCache = null
        userCacheTimestamp = null
        return null
      }

      // Return cached user if available and not expired
      if (!forceRefresh && userCache && Date.now() - userCacheTimestamp < USER_CACHE_TTL) {
        return userCache
      }

      // Try to get user data from API (this also updates localStorage and cache)
      const response = await api.get('/user')
      const user = response.data.user

      // Update cache
      userCache = user
      userCacheTimestamp = Date.now()

      // Always update localStorage to ensure it's fresh
      if (user) {
        localStorage.setItem('user', JSON.stringify(user))
      }
      return user
    } catch (error) {
      // For role-based permissions, we should NOT rely on potentially stale data
      // Return null to indicate the user data couldn't be fetched
      // Clear cache on error
      userCache = null
      userCacheTimestamp = null
      console.warn('Failed to fetch current user, returning null:', error.message)
      return null
    }
  },

  isAuthenticated() {
    return !!localStorage.getItem('token')
  },

  async isAdmin() {
    try {
      const user = await this.getUser()
      return user.role === 'admin'
    } catch (error) {
      return false
    }
  },

  async getUserRole() {
    try {
      const user = await this.getUser()
      return user.role
    } catch (error) {
      return 'user'
    }
  },

  /**
   * Force refresh user data from the server
   * This invalidates any cached data and fetches fresh user information
   * Useful when role changes or user data updates occur
   */
  async refreshUserData() {
    try {
      if (!this.isAuthenticated()) {
        userCache = null
        userCacheTimestamp = null
        return null
      }

      // Clear cache and fetch fresh data
      userCache = null
      userCacheTimestamp = null

      // Fetch fresh user data from API
      const response = await api.get('/user')
      const user = response.data.user

      // Update cache
      userCache = user
      userCacheTimestamp = Date.now()

      // Update localStorage with fresh data
      if (user) {
        localStorage.setItem('user', JSON.stringify(user))
      }

      return user
    } catch (error) {
      console.error('Failed to refresh user data:', error)
      userCache = null
      userCacheTimestamp = null
      throw error
    }
  },

  /**
   * Get user data from localStorage (cached)
   * WARNING: This may contain stale data. Use only for non-critical operations
   * For role-based permissions, always use getCurrentUser() or refreshUserData()
   */
  getCachedUser() {
    try {
      const storedUser = localStorage.getItem('user')
      if (storedUser) {
        return JSON.parse(storedUser)
      }
    } catch (e) {
      console.error('Failed to parse cached user data:', e)
    }
    return null
  },

  /**
   * Send OTP to email for password reset
   * @param {string} email - User's email address
   */
  async sendPasswordResetOtp(email) {
    try {
      const response = await api.post('/forgot-password', { email })
      if (response.data.success) {
        return response.data
      }
      throw new Error(response.data.message || 'Failed to send OTP')
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to send OTP. Please try again.')
    }
  },

  /**
   * Verify OTP for password reset
   * @param {string} email - User's email address
   * @param {string} otp - 6-digit OTP
   */
  async verifyPasswordResetOtp(email, otp) {
    try {
      const response = await api.post('/verify-otp', { email, otp })
      if (response.data.success) {
        return response.data
      }
      throw new Error(response.data.message || 'Invalid OTP')
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Invalid OTP. Please try again.')
    }
  },

  /**
   * Reset password with OTP
   * @param {string} email - User's email address
   * @param {string} otp - 6-digit OTP
   * @param {string} password - New password
   * @param {string} password_confirmation - Password confirmation
   */
  async resetPassword(email, otp, password, password_confirmation) {
    try {
      const response = await api.post('/reset-password', {
        email,
        otp,
        password,
        password_confirmation
      })
      if (response.data.success) {
        // Store the token and user data if login is automatic
        if (response.data.token) {
          localStorage.setItem('token', response.data.token)
        }
        if (response.data.user) {
          localStorage.setItem('user', JSON.stringify(response.data.user))
        }
        return response.data
      }
      throw new Error(response.data.message || 'Failed to reset password')
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to reset password. Please try again.')
    }
  }
}

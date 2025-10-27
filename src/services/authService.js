import api from './api'

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
    } catch (error) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
    }
  },

  async getUser() {
    try {
      const response = await api.get('/user')
      const user = response.data.user
      // Store/update user data in localStorage for WebSocket
      if (user) {
        localStorage.setItem('user', JSON.stringify(user))
      }
      return user
    } catch (error) {
      throw new Error('Failed to get user data')
    }
  },

  async getCurrentUser() {
    try {
      // First check if we have a token
      if (!this.isAuthenticated()) {
        return null
      }

      // Try to get user data from API (this also updates localStorage)
      const response = await api.get('/user')
      const user = response.data.user
      // Always update localStorage to ensure it's fresh
      if (user) {
        localStorage.setItem('user', JSON.stringify(user))
      }
      return user
    } catch (error) {
      // For role-based permissions, we should NOT rely on potentially stale data
      // Return null to indicate the user data couldn't be fetched
      // Let the calling code handle this appropriately
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
        return null
      }

      // Fetch fresh user data from API
      const response = await api.get('/user')
      const user = response.data.user

      // Update localStorage with fresh data
      if (user) {
        localStorage.setItem('user', JSON.stringify(user))
      }

      return user
    } catch (error) {
      console.error('Failed to refresh user data:', error)
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
  }
}

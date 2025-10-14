import api from './api'

export const companySettingService = {
  async getSettings() {
    try {
      const response = await api.get('/company-settings')
      return response.data.data
    } catch (error) {
      throw new Error('Failed to fetch company settings')
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
      const response = await api.put('/admin/company-settings', settingsData)
      return response.data.data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to update company settings')
    }
  }
}

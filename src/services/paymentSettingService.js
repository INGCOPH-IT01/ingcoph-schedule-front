import api from './api'
import { companySettingService } from './companySettingService'

export const paymentSettingService = {
  async getPaymentSettings(useCache = true) {
    try {
      // Leverage company settings cache
      const settings = await companySettingService.getSettings(useCache)
      return {
        company_name: settings.company_name || 'Perfect Smash',
        payment_gcash_number: settings.payment_gcash_number || '0917-123-4567',
        payment_gcash_name: settings.payment_gcash_name || settings.company_name || 'Perfect Smash',
        payment_instructions: settings.payment_instructions || 'Please send payment to our GCash number and upload proof of payment.',
        payment_qr_code: settings.payment_qr_code || null,
        payment_qr_code_url: settings.payment_qr_code_url || null
      }
    } catch (error) {
      throw new Error('Failed to fetch payment settings')
    }
  },

  async updatePaymentSettings(paymentData) {
    try {
      // Get current company name from settings (force fresh data)
      const currentSettings = await this.getPaymentSettings(false)
      const companyName = currentSettings.company_name || 'Perfect Smash'

      const response = await api.put('/admin/company-settings', {
        company_name: companyName, // Preserve existing company name
        payment_gcash_number: paymentData.payment_gcash_number,
        payment_gcash_name: paymentData.payment_gcash_name,
        payment_instructions: paymentData.payment_instructions
      })

      // Clear settings cache after update
      companySettingService.clearSettingsCache()

      return response.data.data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to update payment settings')
    }
  },

  async updatePaymentSettingsFull(companyName, paymentData, qrCodeFile = null) {
    try {
      // Check if we have a QR code file to upload
      if (qrCodeFile) {
        // Use FormData for file upload
        const formData = new FormData()
        formData.append('company_name', companyName)
        formData.append('payment_gcash_number', paymentData.payment_gcash_number)
        formData.append('payment_gcash_name', paymentData.payment_gcash_name)
        formData.append('payment_instructions', paymentData.payment_instructions)
        formData.append('payment_qr_code', qrCodeFile)
        formData.append('_method', 'PUT')

        const response = await api.post('/admin/company-settings', formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        })

        // Clear settings cache after update
        companySettingService.clearSettingsCache()

        return response.data.data
      } else {
        // Regular JSON update
        const response = await api.put('/admin/company-settings', {
          company_name: companyName,
          payment_gcash_number: paymentData.payment_gcash_number,
          payment_gcash_name: paymentData.payment_gcash_name,
          payment_instructions: paymentData.payment_instructions
        })

        // Clear settings cache after update
        companySettingService.clearSettingsCache()

        return response.data.data
      }
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to update payment settings')
    }
  },

  async deletePaymentQrCode() {
    try {
      const response = await api.delete('/admin/company-settings/payment-qr-code')

      // Clear settings cache after delete
      companySettingService.clearSettingsCache()

      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to delete payment QR code')
    }
  }
}

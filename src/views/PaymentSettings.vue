<template>
  <div class="payment-settings">
    <!-- Modern Sports Background -->
    <div class="sports-background">
      <div class="sports-overlay"></div>
      <div class="sports-pattern"></div>
    </div>

    <!-- Enhanced Header -->
    <div class="settings-header">
      <div class="header-content">
        <div class="header-badge">
          <v-icon color="white" size="20" class="mr-2">mdi-cash-multiple</v-icon>
          Payment Configuration
        </div>
        <h1 class="header-title">
          <span class="title-gradient">Payment</span> Settings
        </h1>
        <p class="header-subtitle">
          Manage payment details shown to users during booking checkout
        </p>
      </div>
    </div>

    <!-- Settings Card -->
    <v-row class="justify-center">
      <v-col cols="12" md="8" lg="6">
        <v-card class="settings-card">
          <v-card-title class="text-h5 pa-6 pb-4">
            <v-icon class="mr-2" color="primary">mdi-cellphone-check</v-icon>
            GCash Payment Details
          </v-card-title>

          <v-divider></v-divider>

          <v-card-text class="pa-6">
            <v-form ref="paymentForm" v-model="formValid" @submit.prevent="saveSettings">
              <!-- GCash Number -->
              <v-text-field
                v-model="paymentSettings.payment_gcash_number"
                label="GCash Number"
                placeholder="e.g., 0917-123-4567"
                variant="outlined"
                prepend-inner-icon="mdi-cellphone"
                :rules="[rules.required]"
                :loading="loading"
                :disabled="saving"
                class="mb-4"
                hint="The GCash number users will send payment to"
                persistent-hint
              ></v-text-field>

              <!-- Account Name -->
              <v-text-field
                v-model="paymentSettings.payment_gcash_name"
                label="GCash Account Name"
                placeholder="e.g., Perfect Smash"
                variant="outlined"
                prepend-inner-icon="mdi-account"
                :rules="[rules.required]"
                :loading="loading"
                :disabled="saving"
                class="mb-4"
                hint="The account name displayed to users"
                persistent-hint
              ></v-text-field>

              <!-- Payment Instructions -->
              <v-textarea
                v-model="paymentSettings.payment_instructions"
                label="Payment Instructions"
                placeholder="Enter instructions for users on how to complete payment..."
                variant="outlined"
                prepend-inner-icon="mdi-information"
                :rules="[rules.required]"
                :loading="loading"
                :disabled="saving"
                rows="4"
                class="mb-4"
                hint="Custom instructions shown during checkout"
                persistent-hint
              ></v-textarea>

              <!-- GCash QR Code Upload -->
              <div class="mb-6">
                <label class="text-subtitle-1 font-weight-bold mb-2 d-block">
                  <v-icon class="mr-2" color="primary">mdi-qrcode</v-icon>
                  GCash QR Code
                </label>

                <!-- QR Code Preview -->
                <div v-if="qrCodePreview || currentQrCodeUrl" class="qr-preview-container mb-3">
                  <v-card class="qr-preview-card" elevation="2">
                    <v-img
                      :src="qrCodePreview || currentQrCodeUrl"
                      max-height="300"
                      max-width="300"
                      contain
                      class="ma-auto"
                    ></v-img>
                    <v-card-actions class="justify-center">
                      <v-btn
                        color="error"
                        variant="text"
                        size="small"
                        @click="removeQrCode"
                        :disabled="saving"
                      >
                        <v-icon class="mr-1">mdi-delete</v-icon>
                        Remove QR Code
                      </v-btn>
                    </v-card-actions>
                  </v-card>
                </div>

                <!-- File Input -->
                <v-file-input
                  v-model="qrCodeFile"
                  label="Upload GCash QR Code"
                  placeholder="Choose an image file"
                  variant="outlined"
                  prepend-inner-icon="mdi-qrcode"
                  accept="image/jpeg,image/jpg,image/png,image/gif,image/svg+xml,image/webp"
                  :disabled="saving"
                  @change="handleQrCodeChange"
                  @click:clear="clearQrCode"
                  class="mb-4"
                  hint="Upload a custom QR code image (Max: 2MB). If not uploaded, a dynamic QR code will be generated."
                  persistent-hint
                ></v-file-input>
              </div>

              <v-alert
                v-if="successMessage"
                type="success"
                variant="tonal"
                class="mb-4"
                closable
                @click:close="successMessage = ''"
              >
                {{ successMessage }}
              </v-alert>

              <v-alert
                v-if="errorMessage"
                type="error"
                variant="tonal"
                class="mb-4"
                closable
                @click:close="errorMessage = ''"
              >
                {{ errorMessage }}
              </v-alert>

              <v-card-actions class="px-0 pt-4">
                <v-btn
                  color="primary"
                  type="submit"
                  :loading="saving"
                  :disabled="!formValid || saving"
                  size="large"
                  class="px-8"
                  prepend-icon="mdi-content-save"
                >
                  Save Payment Settings
                </v-btn>
              </v-card-actions>
            </v-form>
          </v-card-text>
        </v-card>

        <!-- Preview Card -->
        <v-card class="settings-card mt-6">
          <v-card-title class="text-h5 pa-6 pb-4">
            <v-icon class="mr-2" color="primary">mdi-eye</v-icon>
            Preview
          </v-card-title>

          <v-divider></v-divider>

          <v-card-text class="pa-6">
            <p class="text-subtitle-2 text-grey-darken-1 mb-4">
              This is how users will see the payment details during checkout:
            </p>

            <!-- Preview of payment details -->
            <v-card variant="tonal" color="success" class="mb-4">
              <v-card-text>
                <div class="d-flex align-center mb-3">
                  <v-avatar size="48" color="white" class="mr-3">
                    <v-icon size="32" color="success">mdi-cellphone</v-icon>
                  </v-avatar>
                  <div>
                    <div class="text-caption text-grey-darken-1">Payment Preview</div>
                    <div class="text-body-2 mt-1">GCash payment details configured</div>
                  </div>
                </div>
                <v-alert type="info" density="compact">
                  <div class="text-caption">
                    {{ paymentSettings.payment_instructions }}
                  </div>
                </v-alert>
              </v-card-text>
            </v-card>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import { paymentSettingService } from '../services/paymentSettingService'
import { companySettingService } from '../services/companySettingService'

export default {
  name: 'PaymentSettings',
  setup() {
    const paymentForm = ref(null)
    const formValid = ref(false)
    const loading = ref(false)
    const saving = ref(false)
    const successMessage = ref('')
    const errorMessage = ref('')
    const companyName = ref('Perfect Smash')

    const paymentSettings = ref({
      payment_gcash_number: '0917-123-4567',
      payment_gcash_name: 'Company Name',
      payment_instructions: 'Please send payment to our GCash number and upload proof of payment.',
      payment_qr_code: null,
      payment_qr_code_url: null
    })

    const qrCodeFile = ref(null)
    const qrCodePreview = ref(null)
    const currentQrCodeUrl = ref(null)

    const rules = {
      required: value => !!value || 'This field is required'
    }

    const loadSettings = async () => {
      loading.value = true
      try {
        // Load payment settings
        const paymentData = await paymentSettingService.getPaymentSettings()
        paymentSettings.value = paymentData

        // Set current QR code URL if exists
        if (paymentData.payment_qr_code_url) {
          const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000'
          currentQrCodeUrl.value = `${apiUrl}${paymentData.payment_qr_code_url}`
        }

        // Load company name for update request
        const companyData = await companySettingService.getSettings()
        companyName.value = companyData.company_name || 'Perfect Smash'
      } catch (error) {
        errorMessage.value = error.message
      } finally {
        loading.value = false
      }
    }

    const saveSettings = async () => {
      if (!formValid.value) return

      saving.value = true
      errorMessage.value = ''
      successMessage.value = ''

      try {
        // Get the actual file object if qrCodeFile is an array
        const qrFile = qrCodeFile.value && qrCodeFile.value.length > 0
          ? qrCodeFile.value[0]
          : qrCodeFile.value

        await paymentSettingService.updatePaymentSettingsFull(
          companyName.value,
          paymentSettings.value,
          qrFile
        )
        successMessage.value = 'Payment settings updated successfully!'

        // Reload settings to get the new QR code URL
        await loadSettings()

        // Clear the file input and preview
        qrCodeFile.value = null
        qrCodePreview.value = null

        // Scroll to top to show success message
        window.scrollTo({ top: 0, behavior: 'smooth' })
      } catch (error) {
        errorMessage.value = error.message
      } finally {
        saving.value = false
      }
    }

    const handleQrCodeChange = (event) => {
      const file = event.target.files?.[0] || qrCodeFile.value?.[0] || qrCodeFile.value
      if (file) {
        const reader = new FileReader()
        reader.onload = (e) => {
          qrCodePreview.value = e.target.result
        }
        reader.readAsDataURL(file)
      }
    }

    const clearQrCode = () => {
      qrCodeFile.value = null
      qrCodePreview.value = null
    }

    const removeQrCode = async () => {
      try {
        saving.value = true
        await paymentSettingService.deletePaymentQrCode()
        currentQrCodeUrl.value = null
        qrCodePreview.value = null
        qrCodeFile.value = null
        successMessage.value = 'QR code removed successfully!'
      } catch (error) {
        errorMessage.value = error.message
      } finally {
        saving.value = false
      }
    }

    onMounted(() => {
      loadSettings()
    })

    return {
      paymentForm,
      formValid,
      loading,
      saving,
      successMessage,
      errorMessage,
      paymentSettings,
      rules,
      saveSettings,
      qrCodeFile,
      qrCodePreview,
      currentQrCodeUrl,
      handleQrCodeChange,
      clearQrCode,
      removeQrCode
    }
  }
}
</script>

<style scoped>
/* Modern Sports Theme */
.payment-settings {
  min-height: 100vh;
  position: relative;
  padding: 24px;
}

.sports-background {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 0;
  pointer-events: none;
}

.sports-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: radial-gradient(circle at 20% 80%, rgba(183, 28, 28, 0.08) 0%, transparent 50%),
              radial-gradient(circle at 80% 20%, rgba(198, 40, 40, 0.06) 0%, transparent 50%),
              radial-gradient(circle at 40% 40%, rgba(239, 83, 80, 0.04) 0%, transparent 50%);
}

.sports-pattern {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-image: radial-gradient(circle at 2px 2px, rgba(183, 28, 28, 0.03) 1px, transparent 0);
  background-size: 40px 40px;
}

/* Enhanced Header */
.settings-header {
  position: relative;
  z-index: 1;
  margin-bottom: 32px;
  padding: 48px 24px;
  background: linear-gradient(135deg, rgba(183, 28, 28, 0.95) 0%, rgba(198, 40, 40, 0.9) 100%);
  border-radius: 24px;
  box-shadow: 0 12px 48px rgba(183, 28, 28, 0.3);
  overflow: hidden;
}

.settings-header::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background:
    radial-gradient(circle at 20% 50%, rgba(255, 255, 255, 0.1) 0%, transparent 50%),
    radial-gradient(circle at 80% 50%, rgba(255, 255, 255, 0.05) 0%, transparent 50%);
  pointer-events: none;
}

.header-content {
  position: relative;
  z-index: 1;
  text-align: center;
}

.header-badge {
  display: inline-flex;
  align-items: center;
  padding: 8px 20px;
  background: rgba(255, 255, 255, 0.15);
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 24px;
  color: white;
  font-size: 13px;
  font-weight: 600;
  letter-spacing: 0.5px;
  text-transform: uppercase;
  margin-bottom: 16px;
  backdrop-filter: blur(10px);
}

.header-title {
  font-size: 48px;
  font-weight: 800;
  color: white;
  margin: 16px 0;
  line-height: 1.2;
  text-shadow: 0 4px 16px rgba(0, 0, 0, 0.3);
}

.title-gradient {
  background: linear-gradient(135deg, #FFFFFF 0%, #FFEBEE 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.header-subtitle {
  font-size: 18px;
  color: rgba(255, 255, 255, 0.9);
  margin: 0;
  font-weight: 500;
}

/* Settings Card */
.settings-card {
  position: relative;
  z-index: 1;
  background: rgba(255, 255, 255, 0.98) !important;
  border: 1px solid rgba(183, 28, 28, 0.1) !important;
  border-radius: 20px !important;
  box-shadow: 0 8px 32px rgba(183, 28, 28, 0.12) !important;
  transition: all 0.3s ease;
}

.settings-card:hover {
  box-shadow: 0 12px 48px rgba(183, 28, 28, 0.18) !important;
  transform: translateY(-4px);
}

/* Responsive Design */
@media (max-width: 768px) {
  .payment-settings {
    padding: 16px;
  }

  .settings-header {
    padding: 32px 16px;
    margin-bottom: 24px;
  }

  .header-title {
    font-size: 32px;
  }

  .header-subtitle {
    font-size: 14px;
  }
}

@media (max-width: 480px) {
  .header-title {
    font-size: 28px;
  }
}
</style>

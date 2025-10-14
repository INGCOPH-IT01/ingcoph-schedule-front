<template>
  <div class="company-settings">
    <!-- Modern Sports Background -->
    <div class="sports-background">
      <div class="sports-overlay"></div>
      <div class="sports-pattern"></div>
    </div>

    <!-- Enhanced Header -->
    <div class="settings-header">
      <div class="header-content">
        <div class="header-badge">
          <v-icon color="white" size="20" class="mr-2">mdi-cog</v-icon>
          System Configuration
        </div>
        <h1 class="header-title">
          <span class="title-gradient">Company</span> Settings
        </h1>
        <p class="header-subtitle">
          Manage your company information and system settings
        </p>
      </div>
    </div>

    <!-- Settings Card -->
    <v-row class="justify-center">
      <v-col cols="12" md="8" lg="6">
        <v-card class="settings-card">
          <v-card-title class="text-h5 pa-6 pb-4">
            <v-icon class="mr-2" color="primary">mdi-office-building</v-icon>
            Company Information
          </v-card-title>

          <v-divider></v-divider>

          <v-card-text class="pa-6">
            <v-form ref="settingsForm" v-model="formValid" @submit.prevent="saveSettings">
              <v-text-field
                v-model="companyName"
                label="Company Name"
                placeholder="Enter company name"
                variant="outlined"
                prepend-inner-icon="mdi-office-building"
                :rules="[rules.required]"
                :loading="loading"
                :disabled="saving"
                class="mb-4"
              ></v-text-field>

              <v-alert
                v-if="successMessage"
                type="success"
                variant="tonal"
                closable
                class="mb-4"
                @click:close="successMessage = ''"
              >
                {{ successMessage }}
              </v-alert>

              <v-alert
                v-if="errorMessage"
                type="error"
                variant="tonal"
                closable
                class="mb-4"
                @click:close="errorMessage = ''"
              >
                {{ errorMessage }}
              </v-alert>

              <div class="d-flex justify-end gap-2">
                <v-btn
                  color="grey"
                  variant="outlined"
                  @click="resetForm"
                  :disabled="saving"
                >
                  <v-icon class="mr-2">mdi-refresh</v-icon>
                  Reset
                </v-btn>
                <v-btn
                  color="primary"
                  variant="elevated"
                  type="submit"
                  :loading="saving"
                  :disabled="!formValid || saving"
                >
                  <v-icon class="mr-2">mdi-content-save</v-icon>
                  Save Changes
                </v-btn>
              </div>
            </v-form>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Success/Error Snackbar -->
    <v-snackbar
      v-model="snackbar.show"
      :color="snackbar.color"
      :timeout="3000"
    >
      {{ snackbar.message }}
    </v-snackbar>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import { companySettingService } from '../services/companySettingService'

export default {
  name: 'CompanySettings',
  setup() {
    const companyName = ref('')
    const originalCompanyName = ref('')
    const loading = ref(false)
    const saving = ref(false)
    const formValid = ref(false)
    const settingsForm = ref(null)
    const successMessage = ref('')
    const errorMessage = ref('')

    const snackbar = ref({
      show: false,
      message: '',
      color: 'success'
    })

    const rules = {
      required: value => !!value || 'This field is required'
    }

    const loadSettings = async () => {
      try {
        loading.value = true
        const settings = await companySettingService.getSettings()
        companyName.value = settings.company_name || ''
        originalCompanyName.value = settings.company_name || ''
      } catch (error) {
        console.error('Failed to load settings:', error)
        errorMessage.value = 'Failed to load company settings'
        showSnackbar('Failed to load settings', 'error')
      } finally {
        loading.value = false
      }
    }

    const saveSettings = async () => {
      try {
        saving.value = true
        errorMessage.value = ''
        successMessage.value = ''

        await companySettingService.updateSettings({
          company_name: companyName.value
        })

        originalCompanyName.value = companyName.value
        successMessage.value = 'Company settings updated successfully!'
        showSnackbar('Settings saved successfully', 'success')

        // Dispatch event to update navbar title
        window.dispatchEvent(new CustomEvent('company-settings-updated'))
      } catch (error) {
        console.error('Failed to save settings:', error)
        errorMessage.value = error.message || 'Failed to update company settings'
        showSnackbar('Failed to save settings', 'error')
      } finally {
        saving.value = false
      }
    }

    const resetForm = () => {
      companyName.value = originalCompanyName.value
      successMessage.value = ''
      errorMessage.value = ''
    }

    const showSnackbar = (message, color = 'success') => {
      snackbar.value = {
        show: true,
        message,
        color
      }
    }

    onMounted(() => {
      loadSettings()
    })

    return {
      companyName,
      loading,
      saving,
      formValid,
      settingsForm,
      successMessage,
      errorMessage,
      snackbar,
      rules,
      loadSettings,
      saveSettings,
      resetForm,
      showSnackbar
    }
  }
}
</script>

<style scoped>
/* Modern Sports Settings Theme */
.company-settings {
  padding: 32px;
  position: relative;
  min-height: 100vh;
  z-index: 1;
}

/* Enhanced Background */
.sports-background {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%);
  z-index: -3;
}

.sports-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background:
    radial-gradient(circle at 20% 80%, rgba(59, 130, 246, 0.2) 0%, transparent 50%),
    radial-gradient(circle at 80% 20%, rgba(16, 185, 129, 0.2) 0%, transparent 50%),
    radial-gradient(circle at 40% 40%, rgba(245, 158, 11, 0.1) 0%, transparent 50%);
  z-index: -2;
}

.sports-pattern {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-image:
    radial-gradient(circle at 1px 1px, rgba(255, 255, 255, 0.05) 1px, transparent 0);
  background-size: 20px 20px;
  z-index: -1;
}

/* Settings Header */
.settings-header {
  text-align: center;
  margin-bottom: 48px;
  padding: 48px 0;
  position: relative;
}

.header-content {
  position: relative;
  z-index: 2;
}

.header-badge {
  display: inline-flex;
  align-items: center;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 50px;
  padding: 8px 20px;
  margin-bottom: 24px;
  color: white;
  font-weight: 600;
  font-size: 14px;
  letter-spacing: 0.5px;
}

.header-title {
  font-size: clamp(2.5rem, 5vw, 4rem);
  font-weight: 800;
  line-height: 1.1;
  margin-bottom: 24px;
  color: white;
}

.title-gradient {
  background: linear-gradient(135deg, #3b82f6 0%, #10b981 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.header-subtitle {
  font-size: clamp(1.1rem, 2vw, 1.3rem);
  color: rgba(255, 255, 255, 0.8);
  max-width: 600px;
  margin: 0 auto;
  line-height: 1.6;
}

/* Settings Card */
.settings-card {
  background: rgba(255, 255, 255, 0.95) !important;
  backdrop-filter: blur(20px);
  border-radius: 20px !important;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1) !important;
  border: 1px solid rgba(255, 255, 255, 0.2);
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.settings-card:hover {
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15) !important;
}

/* Utility Classes */
.gap-2 {
  gap: 8px;
}

/* Responsive Design */
@media (max-width: 768px) {
  .company-settings {
    padding: 16px;
  }

  .settings-header {
    padding: 32px 0;
    margin-bottom: 32px;
  }
}

@media (max-width: 480px) {
  .company-settings {
    padding: 12px;
  }

  .settings-header {
    padding: 24px 0;
  }
}
</style>

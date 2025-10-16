<template>
  <div class="system-settings">
    <!-- Enhanced Header -->
    <div class="settings-header">
      <div class="header-content">
        <div class="header-badge">
          <v-icon color="white" size="20" class="mr-2">mdi-cog-outline</v-icon>
          System Configuration
        </div>
        <h1 class="header-title">
          <span class="title-gradient">System</span> Settings
        </h1>
        <p class="header-subtitle">
          Manage company information, theme, and dashboard settings
        </p>
      </div>
    </div>

    <!-- Settings Tabs -->
    <v-row class="justify-center">
      <v-col cols="12" lg="10">
        <v-card class="settings-card">
          <v-tabs v-model="activeTab" bg-color="transparent" color="primary">
            <v-tab value="company">
              <v-icon class="mr-2" size="small">mdi-office-building</v-icon>
              Company Settings
            </v-tab>
            <v-tab value="theme">
              <v-icon class="mr-2" size="small">mdi-palette</v-icon>
              Theme Settings
            </v-tab>
            <v-tab value="dashboard">
              <v-icon class="mr-2" size="small">mdi-view-dashboard</v-icon>
              Dashboard Settings
            </v-tab>
          </v-tabs>

          <v-divider></v-divider>

          <v-window v-model="activeTab">
            <!-- Company Settings Tab -->
            <v-window-item value="company">
              <v-card-text class="pa-6">
                <h3 class="text-h6 mb-4">
                  <v-icon class="mr-2" color="primary">mdi-office-building</v-icon>
                  Company Information
                </h3>
                
                <v-form ref="settingsForm" v-model="formValid" @submit.prevent="saveCompanySettings">
                  <!-- Company Logo Upload -->
                  <div class="mb-6">
                    <label class="text-subtitle-2 font-weight-bold mb-2 d-block">
                      <v-icon class="mr-2" size="small" color="primary">mdi-image</v-icon>
                      Company Logo
                    </label>

                    <!-- Logo Preview -->
                    <div v-if="logoPreview || currentLogoUrl" class="logo-preview-container mb-3">
                      <v-card class="logo-preview-card" elevation="2">
                        <v-img
                          :src="logoPreview || currentLogoUrl"
                          max-height="200"
                          max-width="300"
                          contain
                          class="ma-auto"
                        ></v-img>
                        <v-card-actions class="justify-center">
                          <v-btn
                            color="error"
                            variant="text"
                            size="small"
                            @click="removeLogo"
                            :disabled="saving"
                          >
                            <v-icon class="mr-1">mdi-delete</v-icon>
                            Remove Logo
                          </v-btn>
                        </v-card-actions>
                      </v-card>
                    </div>

                    <!-- File Input -->
                    <v-file-input
                      v-model="logoFile"
                      label="Upload Company Logo"
                      placeholder="Choose an image file"
                      variant="outlined"
                      prepend-inner-icon="mdi-camera"
                      accept="image/jpeg,image/jpg,image/png,image/gif,image/svg+xml,image/webp"
                      :disabled="saving"
                      @change="handleFileChange"
                      @click:clear="clearLogo"
                      class="mb-4"
                      hint="Accepted formats: JPEG, PNG, GIF, SVG, WEBP (Max: 2MB)"
                      persistent-hint
                    ></v-file-input>
                  </div>

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
                      @click="resetCompanyForm"
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
            </v-window-item>

            <!-- Theme Settings Tab (Background Gradient) -->
            <v-window-item value="theme">
              <v-card-text class="pa-6">
                <h3 class="text-h6 mb-4">
                  <v-icon class="mr-2" color="primary">mdi-palette</v-icon>
                  Background Gradient Colors
                </h3>

                <v-row>
                  <!-- Background Colors Controls -->
                  <v-col cols="12" md="6">
                    <!-- Live Preview Toggle -->
                    <v-alert type="success" variant="tonal" class="mb-4" density="compact">
                      <div class="d-flex align-center justify-space-between">
                        <div>
                          <v-icon class="mr-2" size="small">mdi-lightning-bolt</v-icon>
                          <strong>Live Preview: </strong>
                          <small>Changes apply instantly as you pick colors!</small>
                        </div>
                        <v-chip size="small" color="success">
                          <v-icon start size="small">mdi-check-circle</v-icon>
                          Active
                        </v-chip>
                      </div>
                    </v-alert>

                    <v-form @submit.prevent="saveBackgroundColors">
                      <!-- Primary Background Color -->
                      <div class="mb-4">
                        <label class="text-subtitle-2 font-weight-bold mb-2 d-block">
                          Primary Color (Base/Edges)
                        </label>
                        <v-row align="center" no-gutters>
                          <v-col cols="8">
                            <v-text-field
                              v-model="bgPrimaryColor"
                              variant="outlined"
                              density="compact"
                              placeholder="#FFFFFF"
                              hide-details
                            ></v-text-field>
                          </v-col>
                          <v-col cols="4" class="pl-2">
                            <input
                              type="color"
                              v-model="bgPrimaryColor"
                              class="color-picker"
                            />
                          </v-col>
                        </v-row>
                      </div>

                      <!-- Secondary Background Color -->
                      <div class="mb-4">
                        <label class="text-subtitle-2 font-weight-bold mb-2 d-block">
                          Secondary Color (Light Tint)
                        </label>
                        <v-row align="center" no-gutters>
                          <v-col cols="8">
                            <v-text-field
                              v-model="bgSecondaryColor"
                              variant="outlined"
                              density="compact"
                              placeholder="#FFEBEE"
                              hide-details
                            ></v-text-field>
                          </v-col>
                          <v-col cols="4" class="pl-2">
                            <input
                              type="color"
                              v-model="bgSecondaryColor"
                              class="color-picker"
                            />
                          </v-col>
                        </v-row>
                      </div>

                      <!-- Accent Background Color -->
                      <div class="mb-4">
                        <label class="text-subtitle-2 font-weight-bold mb-2 d-block">
                          Accent Color (Center)
                        </label>
                        <v-row align="center" no-gutters>
                          <v-col cols="8">
                            <v-text-field
                              v-model="bgAccentColor"
                              variant="outlined"
                              density="compact"
                              placeholder="#FFCDD2"
                              hide-details
                            ></v-text-field>
                          </v-col>
                          <v-col cols="4" class="pl-2">
                            <input
                              type="color"
                              v-model="bgAccentColor"
                              class="color-picker"
                            />
                          </v-col>
                        </v-row>
                      </div>

                      <!-- Quick Presets -->
                      <div class="mb-4">
                        <label class="text-subtitle-2 font-weight-bold mb-2 d-block">
                          <v-icon class="mr-1" size="small">mdi-palette-swatch</v-icon>
                          Quick Presets
                        </label>
                        <div class="preset-buttons">
                          <v-btn
                            size="small"
                            variant="outlined"
                            @click="applyPreset('red-white')"
                            class="mb-2"
                            block
                          >
                            <v-icon class="mr-2" size="small" color="red">mdi-circle</v-icon>
                            Red & White
                          </v-btn>
                          <v-btn
                            size="small"
                            variant="outlined"
                            @click="applyPreset('blue-white')"
                            class="mb-2"
                            block
                          >
                            <v-icon class="mr-2" size="small" color="blue">mdi-circle</v-icon>
                            Blue & White
                          </v-btn>
                          <v-btn
                            size="small"
                            variant="outlined"
                            @click="applyPreset('green-white')"
                            class="mb-2"
                            block
                          >
                            <v-icon class="mr-2" size="small" color="green">mdi-circle</v-icon>
                            Green & White
                          </v-btn>
                          <v-btn
                            size="small"
                            variant="outlined"
                            @click="applyPreset('pure-white')"
                            class="mb-2"
                            block
                          >
                            <v-icon class="mr-2" size="small" color="grey">mdi-circle</v-icon>
                            Pure White
                          </v-btn>
                        </div>
                      </div>

                      <v-alert
                        v-if="bgSuccessMessage"
                        type="success"
                        variant="tonal"
                        closable
                        class="mb-4"
                        density="compact"
                        @click:close="bgSuccessMessage = ''"
                      >
                        {{ bgSuccessMessage }}
                      </v-alert>

                      <v-alert
                        v-if="bgErrorMessage"
                        type="error"
                        variant="tonal"
                        closable
                        class="mb-4"
                        density="compact"
                        @click:close="bgErrorMessage = ''"
                      >
                        {{ bgErrorMessage }}
                      </v-alert>

                      <div class="d-flex gap-2">
                        <v-btn
                          color="grey"
                          variant="outlined"
                          @click="resetBackgroundColors"
                          :disabled="bgSaving"
                          block
                        >
                          <v-icon class="mr-2">mdi-refresh</v-icon>
                          Reset
                        </v-btn>
                        <v-btn
                          color="primary"
                          variant="elevated"
                          type="submit"
                          :loading="bgSaving"
                          :disabled="bgSaving"
                          block
                        >
                          <v-icon class="mr-2">mdi-content-save</v-icon>
                          Save
                        </v-btn>
                      </div>
                    </v-form>
                  </v-col>

                  <!-- Live Preview -->
                  <v-col cols="12" md="6">
                    <v-card variant="outlined">
                      <v-card-title class="text-subtitle-1">
                        <v-icon class="mr-2" size="small" color="success">mdi-eye</v-icon>
                        Live Preview
                        <v-chip size="x-small" color="success" class="ml-2">Real-Time</v-chip>
                      </v-card-title>
                      <v-divider></v-divider>
                      <v-card-text>
                        <div class="bg-preview-container">
                          <div 
                            class="bg-preview"
                            :style="{
                              background: `linear-gradient(135deg, ${bgPrimaryColor} 0%, ${bgSecondaryColor} 25%, ${bgAccentColor} 50%, ${bgSecondaryColor} 75%, ${bgPrimaryColor} 100%)`,
                              transition: 'background 0.3s ease'
                            }"
                          >
                            <div class="bg-preview-content">
                              <v-icon size="50" color="#B71C1C" class="mb-3">mdi-badminton</v-icon>
                              <h3 style="color: #B71C1C; margin-bottom: 8px; font-size: 1.5rem;">Perfect Smash</h3>
                              <p style="color: #64748b; font-size: 0.9rem;">Gradient background preview</p>
                            </div>
                          </div>
                        </div>

                        <!-- Color Info -->
                        <v-card class="mt-3" variant="flat" color="grey-lighten-5">
                          <v-card-text class="pa-3">
                            <div class="d-flex align-center justify-space-between mb-2">
                              <span class="text-caption">Primary:</span>
                              <v-chip size="x-small" :style="{ backgroundColor: bgPrimaryColor, color: '#000' }">
                                {{ bgPrimaryColor }}
                              </v-chip>
                            </div>
                            <div class="d-flex align-center justify-space-between mb-2">
                              <span class="text-caption">Secondary:</span>
                              <v-chip size="x-small" :style="{ backgroundColor: bgSecondaryColor, color: '#000' }">
                                {{ bgSecondaryColor }}
                              </v-chip>
                            </div>
                            <div class="d-flex align-center justify-space-between">
                              <span class="text-caption">Accent:</span>
                              <v-chip size="x-small" :style="{ backgroundColor: bgAccentColor, color: '#000' }">
                                {{ bgAccentColor }}
                              </v-chip>
                            </div>
                          </v-card-text>
                        </v-card>
                      </v-card-text>
                    </v-card>
                  </v-col>
                </v-row>
              </v-card-text>
            </v-window-item>

            <!-- Dashboard Settings Tab -->
            <v-window-item value="dashboard">
              <v-card-text class="pa-6">
                <h3 class="text-h6 mb-4">
                  <v-icon class="mr-2" color="primary">mdi-view-dashboard</v-icon>
                  Dashboard Configuration
                </h3>

                <v-alert type="info" variant="tonal" class="mb-4">
                  <v-icon class="mr-2">mdi-information</v-icon>
                  Dashboard settings coming soon! This will include dashboard widgets, display preferences, and more.
                </v-alert>

                <!-- Placeholder content -->
                <v-card variant="outlined" class="pa-6 text-center">
                  <v-icon size="64" color="grey-lighten-1" class="mb-4">mdi-cog-outline</v-icon>
                  <p class="text-h6 mb-2">Dashboard Settings</p>
                  <p class="text-body-2 text-grey">
                    Configure dashboard widgets, layout, and display options here.
                  </p>
                </v-card>
              </v-card-text>
            </v-window-item>
          </v-window>
        </v-card>
      </v-col>
    </v-row>

    <!-- Success Snackbar -->
    <v-snackbar
      v-model="snackbar.show"
      :color="snackbar.color"
      :timeout="3000"
      location="top"
    >
      <v-icon class="mr-2">{{ snackbar.icon }}</v-icon>
      {{ snackbar.message }}
    </v-snackbar>
  </div>
</template>

<script>
import { ref, onMounted, watch } from 'vue'
import { companySettingService } from '../services/companySettingService'

export default {
  name: 'SystemSettings',
  setup() {
    const activeTab = ref('company')
    
    // Company Settings
    const companyName = ref('')
    const originalCompanyName = ref('')
    const logoFile = ref(null)
    const logoPreview = ref(null)
    const currentLogoUrl = ref(null)
    const originalLogoUrl = ref(null)
    const logoToDelete = ref(false)
    const loading = ref(false)
    const saving = ref(false)
    const formValid = ref(false)
    const settingsForm = ref(null)
    const successMessage = ref('')
    const errorMessage = ref('')

    // Background colors
    const bgPrimaryColor = ref('#FFFFFF')
    const bgSecondaryColor = ref('#FFEBEE')
    const bgAccentColor = ref('#FFCDD2')
    const originalBgPrimaryColor = ref('#FFFFFF')
    const originalBgSecondaryColor = ref('#FFEBEE')
    const originalBgAccentColor = ref('#FFCDD2')
    const bgSaving = ref(false)
    const bgSuccessMessage = ref('')
    const bgErrorMessage = ref('')

    const snackbar = ref({
      show: false,
      message: '',
      color: 'success',
      icon: 'mdi-check-circle'
    })

    const rules = {
      required: value => !!value || 'This field is required'
    }

    const loadSettings = async () => {
      try {
        loading.value = true
        const settings = await companySettingService.getSettings()
        
        // Load company settings
        companyName.value = settings.company_name || ''
        originalCompanyName.value = settings.company_name || ''

        if (settings.company_logo_url) {
          const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000'
          currentLogoUrl.value = `${apiUrl}${settings.company_logo_url}`
          originalLogoUrl.value = currentLogoUrl.value
        }

        // Load background colors
        bgPrimaryColor.value = settings.bg_primary_color || '#FFFFFF'
        bgSecondaryColor.value = settings.bg_secondary_color || '#FFEBEE'
        bgAccentColor.value = settings.bg_accent_color || '#FFCDD2'
        
        // Store original values
        originalBgPrimaryColor.value = bgPrimaryColor.value
        originalBgSecondaryColor.value = bgSecondaryColor.value
        originalBgAccentColor.value = bgAccentColor.value
      } catch (error) {
        console.error('Failed to load settings:', error)
        errorMessage.value = 'Failed to load company settings'
      } finally {
        loading.value = false
      }
    }

    const handleFileChange = (event) => {
      const file = logoFile.value
      if (file) {
        const reader = new FileReader()
        reader.onload = (e) => {
          logoPreview.value = e.target.result
        }
        reader.readAsDataURL(file)
      } else {
        logoPreview.value = null
      }
    }

    const clearLogo = () => {
      logoFile.value = null
      logoPreview.value = null
    }

    const removeLogo = async () => {
      try {
        await companySettingService.deleteLogo()
        currentLogoUrl.value = null
        originalLogoUrl.value = null
        logoPreview.value = null
        logoFile.value = null
        showSnackbar('Logo removed successfully', 'success', 'mdi-check-circle')
      } catch (error) {
        console.error('Failed to remove logo:', error)
        showSnackbar('Failed to remove logo', 'error', 'mdi-alert-circle')
      }
    }

    const saveCompanySettings = async () => {
      try {
        saving.value = true
        successMessage.value = ''
        errorMessage.value = ''

        const formData = new FormData()
        formData.append('company_name', companyName.value)

        if (logoFile.value) {
          formData.append('company_logo', logoFile.value)
        }

        const response = await companySettingService.updateSettings(formData)

        originalCompanyName.value = companyName.value

        if (response.company_logo_url) {
          const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000'
          currentLogoUrl.value = `${apiUrl}${response.company_logo_url}`
          originalLogoUrl.value = currentLogoUrl.value
          logoPreview.value = null
          logoFile.value = null
        }

        successMessage.value = 'Company settings updated successfully!'
        showSnackbar('Settings saved successfully', 'success', 'mdi-check-circle')

        window.dispatchEvent(new CustomEvent('company-settings-updated'))
      } catch (error) {
        console.error('Failed to save settings:', error)
        errorMessage.value = error.message || 'Failed to update company settings'
        showSnackbar('Failed to save settings', 'error', 'mdi-alert-circle')
      } finally {
        saving.value = false
      }
    }

    const resetCompanyForm = () => {
      companyName.value = originalCompanyName.value
      currentLogoUrl.value = originalLogoUrl.value
      logoPreview.value = null
      logoFile.value = null
      logoToDelete.value = false
      successMessage.value = ''
      errorMessage.value = ''
    }

    const saveBackgroundColors = async () => {
      try {
        bgSaving.value = true
        bgSuccessMessage.value = ''
        bgErrorMessage.value = ''

        const data = {
          bg_primary_color: bgPrimaryColor.value,
          bg_secondary_color: bgSecondaryColor.value,
          bg_accent_color: bgAccentColor.value,
          company_name: companyName.value || 'Perfect Smash'
        }

        await companySettingService.updateSettings(data)
        
        // Update original values after successful save
        originalBgPrimaryColor.value = bgPrimaryColor.value
        originalBgSecondaryColor.value = bgSecondaryColor.value
        originalBgAccentColor.value = bgAccentColor.value
        
        bgSuccessMessage.value = 'Background colors saved! Changes applied immediately.'
        
        showSnackbar('Background colors updated successfully!', 'success', 'mdi-check-circle')

        // Dispatch event to update background in real-time
        window.dispatchEvent(new CustomEvent('background-colors-updated', {
          detail: {
            primary: bgPrimaryColor.value,
            secondary: bgSecondaryColor.value,
            accent: bgAccentColor.value
          }
        }))

        window.dispatchEvent(new CustomEvent('company-settings-updated'))

      } catch (error) {
        console.error('Failed to save background colors:', error)
        bgErrorMessage.value = error.message || 'Failed to update background colors'
        showSnackbar('Failed to save background colors', 'error', 'mdi-alert-circle')
      } finally {
        bgSaving.value = false
      }
    }

    const resetBackgroundColors = () => {
      bgPrimaryColor.value = originalBgPrimaryColor.value
      bgSecondaryColor.value = originalBgSecondaryColor.value
      bgAccentColor.value = originalBgAccentColor.value
      bgSuccessMessage.value = ''
      bgErrorMessage.value = ''
      showSnackbar('Colors reset to saved values', 'info', 'mdi-refresh')
      
      // Update background immediately
      window.dispatchEvent(new CustomEvent('background-colors-updated', {
        detail: {
          primary: bgPrimaryColor.value,
          secondary: bgSecondaryColor.value,
          accent: bgAccentColor.value
        }
      }))
    }

    const applyPreset = (preset) => {
      switch (preset) {
        case 'red-white':
          bgPrimaryColor.value = '#FFFFFF'
          bgSecondaryColor.value = '#FFEBEE'
          bgAccentColor.value = '#FFCDD2'
          break
        case 'blue-white':
          bgPrimaryColor.value = '#FFFFFF'
          bgSecondaryColor.value = '#E3F2FD'
          bgAccentColor.value = '#BBDEFB'
          break
        case 'green-white':
          bgPrimaryColor.value = '#FFFFFF'
          bgSecondaryColor.value = '#E8F5E9'
          bgAccentColor.value = '#C8E6C9'
          break
        case 'pure-white':
          bgPrimaryColor.value = '#FFFFFF'
          bgSecondaryColor.value = '#FAFAFA'
          bgAccentColor.value = '#F5F5F5'
          break
      }
      bgSuccessMessage.value = ''
      bgErrorMessage.value = ''
      showSnackbar(`${preset.replace('-', ' & ')} preset applied`, 'info', 'mdi-palette')
    }

    const showSnackbar = (message, color = 'success', icon = 'mdi-check-circle') => {
      snackbar.value = {
        show: true,
        message,
        color,
        icon
      }
    }

    // 🔥 REAL-TIME COLOR UPDATE WATCHER
    // This watches for color changes and applies them INSTANTLY without saving
    watch([bgPrimaryColor, bgSecondaryColor, bgAccentColor], ([newPrimary, newSecondary, newAccent]) => {
      if (activeTab.value === 'theme') {
        // Dispatch event to update background colors in real-time
        window.dispatchEvent(new CustomEvent('background-colors-updated', {
          detail: {
            primary: newPrimary,
            secondary: newSecondary,
            accent: newAccent
          }
        }))
      }
    })

    onMounted(() => {
      loadSettings()
    })

    return {
      activeTab,
      companyName,
      logoFile,
      logoPreview,
      currentLogoUrl,
      loading,
      saving,
      formValid,
      settingsForm,
      successMessage,
      errorMessage,
      snackbar,
      rules,
      handleFileChange,
      clearLogo,
      removeLogo,
      saveCompanySettings,
      resetCompanyForm,
      // Background colors
      bgPrimaryColor,
      bgSecondaryColor,
      bgAccentColor,
      bgSaving,
      bgSuccessMessage,
      bgErrorMessage,
      saveBackgroundColors,
      resetBackgroundColors,
      applyPreset
    }
  }
}
</script>

<style scoped>
/* System Settings Container */
.system-settings {
  padding: 32px;
  position: relative;
  min-height: 100vh;
}

/* Settings Header */
.settings-header {
  text-align: center;
  margin-bottom: 48px;
  padding: 48px 0;
}

.header-badge {
  display: inline-flex;
  align-items: center;
  background: linear-gradient(135deg, #B71C1C 0%, #C62828 100%);
  backdrop-filter: blur(10px);
  border-radius: 50px;
  padding: 8px 20px;
  margin-bottom: 24px;
  color: white;
  font-weight: 600;
  font-size: 14px;
  letter-spacing: 0.5px;
  box-shadow: 0 4px 12px rgba(183, 28, 28, 0.3);
}

.header-title {
  font-size: clamp(2.5rem, 5vw, 4rem);
  font-weight: 800;
  line-height: 1.1;
  margin-bottom: 24px;
  color: #1e293b;
}

.title-gradient {
  background: linear-gradient(135deg, #B71C1C 0%, #D32F2F 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.header-subtitle {
  font-size: clamp(1.1rem, 2vw, 1.3rem);
  color: #64748b;
  max-width: 600px;
  margin: 0 auto;
  line-height: 1.6;
}

/* Settings Card */
.settings-card {
  background: rgba(255, 255, 255, 0.98) !important;
  backdrop-filter: blur(20px);
  border-radius: 20px !important;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1) !important;
  border: 1px solid rgba(255, 255, 255, 0.2);
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

/* Logo Preview */
.logo-preview-container {
  display: flex;
  justify-content: center;
  align-items: center;
}

.logo-preview-card {
  padding: 16px;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 12px;
  max-width: 300px;
  margin: 0 auto;
}

/* Color Picker */
.color-picker {
  width: 100%;
  height: 40px;
  border-radius: 8px;
  border: 2px solid #e2e8f0;
  cursor: pointer;
  transition: all 0.3s ease;
}

.color-picker:hover {
  border-color: #B71C1C;
  transform: scale(1.05);
}

/* Background Preview */
.bg-preview-container {
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
}

.bg-preview {
  min-height: 250px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 32px 16px;
}

.bg-preview-content {
  text-align: center;
  background: rgba(255, 255, 255, 0.95);
  padding: 32px 24px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

/* Preset Buttons */
.preset-buttons {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

/* Utility Classes */
.gap-2 {
  gap: 8px;
}

/* Responsive Design */
@media (max-width: 960px) {
  .system-settings {
    padding: 24px 16px;
  }

  .settings-header {
    padding: 32px 0;
    margin-bottom: 32px;
  }

  .bg-preview {
    min-height: 200px;
  }
}

@media (max-width: 600px) {
  .system-settings {
    padding: 16px 12px;
  }

  .settings-header {
    padding: 24px 0;
  }
}
</style>


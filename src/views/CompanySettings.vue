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
              <!-- Company Logo Upload -->
              <div class="mb-6">
                <label class="text-subtitle-1 font-weight-bold mb-2 d-block">
                  <v-icon class="mr-2" color="primary">mdi-image</v-icon>
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

              <v-divider class="mb-6"></v-divider>

              <!-- Contact Details Section -->
              <div class="mb-6">
                <label class="text-subtitle-1 font-weight-bold mb-3 d-block">
                  <v-icon class="mr-2" color="primary">mdi-card-account-phone</v-icon>
                  Contact Details
                </label>

                <v-text-field
                  v-model="contactEmail"
                  label="Email Address"
                  placeholder="company@example.com"
                  variant="outlined"
                  prepend-inner-icon="mdi-email"
                  :rules="[rules.email]"
                  :loading="loading"
                  :disabled="saving"
                  class="mb-4"
                  hint="Primary email for customer inquiries"
                  persistent-hint
                ></v-text-field>

                <v-text-field
                  v-model="contactMobile"
                  label="Mobile Number"
                  placeholder="+63 XXX XXX XXXX"
                  variant="outlined"
                  prepend-inner-icon="mdi-cellphone"
                  :loading="loading"
                  :disabled="saving"
                  class="mb-4"
                  hint="Contact mobile number"
                  persistent-hint
                ></v-text-field>

                <v-text-field
                  v-model="contactViber"
                  label="Viber Number"
                  placeholder="+63 XXX XXX XXXX"
                  variant="outlined"
                  prepend-inner-icon="mdi-message-text"
                  :loading="loading"
                  :disabled="saving"
                  class="mb-4"
                  hint="Viber contact number (if different from mobile)"
                  persistent-hint
                ></v-text-field>
              </div>

              <v-divider class="mb-6"></v-divider>

              <!-- Social Media Section -->
              <div class="mb-6">
                <label class="text-subtitle-1 font-weight-bold mb-3 d-block">
                  <v-icon class="mr-2" color="primary">mdi-facebook</v-icon>
                  Social Media
                </label>

                <v-text-field
                  v-model="facebookPageUrl"
                  label="Facebook Page URL"
                  placeholder="https://facebook.com/yourpage"
                  variant="outlined"
                  prepend-inner-icon="mdi-facebook"
                  :loading="loading"
                  :disabled="saving"
                  class="mb-4"
                  hint="Full URL to your Facebook page"
                  persistent-hint
                ></v-text-field>

                <v-text-field
                  v-model="facebookPageName"
                  label="Facebook Page Display Name"
                  placeholder="IngCoPH Sports"
                  variant="outlined"
                  prepend-inner-icon="mdi-text"
                  :loading="loading"
                  :disabled="saving"
                  class="mb-0"
                  hint="Name to display as the clickable link (e.g., 'our Facebook page')"
                  persistent-hint
                ></v-text-field>
              </div>

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

        <!-- Background Colors Card -->
        <v-card class="settings-card mt-6">
          <v-card-title class="text-h5 pa-6 pb-4">
            <v-icon class="mr-2" color="primary">mdi-palette</v-icon>
            Background Colors
          </v-card-title>

          <v-divider></v-divider>

          <v-card-text class="pa-6">
            <v-alert type="info" variant="tonal" class="mb-4">
              <v-icon class="mr-2">mdi-information</v-icon>
              Customize the background gradient colors for all modules. Changes apply immediately after saving.
            </v-alert>

            <v-form @submit.prevent="saveBackgroundColors">
              <!-- Primary Background Color -->
              <div class="mb-4">
                <label class="text-subtitle-2 font-weight-bold mb-2 d-block">
                  Primary Background Color (White/Base)
                </label>
                <v-row align="center">
                  <v-col cols="9">
                    <v-text-field
                      v-model="bgPrimaryColor"
                      variant="outlined"
                      density="compact"
                      placeholder="#FFFFFF"
                      hide-details
                    ></v-text-field>
                  </v-col>
                  <v-col cols="3">
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
                  Secondary Background Color (Light Tint)
                </label>
                <v-row align="center">
                  <v-col cols="9">
                    <v-text-field
                      v-model="bgSecondaryColor"
                      variant="outlined"
                      density="compact"
                      placeholder="#FFEBEE"
                      hide-details
                    ></v-text-field>
                  </v-col>
                  <v-col cols="3">
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
                  Accent Background Color (Center Gradient)
                </label>
                <v-row align="center">
                  <v-col cols="9">
                    <v-text-field
                      v-model="bgAccentColor"
                      variant="outlined"
                      density="compact"
                      placeholder="#FFCDD2"
                      hide-details
                    ></v-text-field>
                  </v-col>
                  <v-col cols="3">
                    <input
                      type="color"
                      v-model="bgAccentColor"
                      class="color-picker"
                    />
                  </v-col>
                </v-row>
              </div>

              <!-- Preview -->
              <div class="mb-4">
                <label class="text-subtitle-2 font-weight-bold mb-2 d-block">
                  <v-icon class="mr-1" size="small">mdi-eye</v-icon>
                  Background Preview
                  <v-chip size="x-small" color="success" class="ml-2">Live Preview</v-chip>
                </label>
                <v-alert type="info" density="compact" variant="tonal" class="mb-2">
                  <small>Changes preview in real-time. Click "Save" to apply everywhere.</small>
                </v-alert>
                <div class="bg-preview-container">
                  <div
                    class="bg-preview"
                    :style="{
                      background: `linear-gradient(135deg, ${bgPrimaryColor} 0%, ${bgSecondaryColor} 25%, ${bgAccentColor} 50%, ${bgSecondaryColor} 75%, ${bgPrimaryColor} 100%)`,
                      transition: 'background 0.3s ease'
                    }"
                  >
                    <div class="bg-preview-content">
                      <h3 style="color: #B71C1C;">Sample Heading</h3>
                      <p style="color: #64748b;">This is how your background will look across all modules</p>
                      <v-icon size="large" color="#B71C1C" class="mt-2">mdi-badminton</v-icon>
                    </div>
                  </div>
                </div>
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
                    class="mr-2 mb-2"
                  >
                    Red & White
                  </v-btn>
                  <v-btn
                    size="small"
                    variant="outlined"
                    @click="applyPreset('blue-white')"
                    class="mr-2 mb-2"
                  >
                    Blue & White
                  </v-btn>
                  <v-btn
                    size="small"
                    variant="outlined"
                    @click="applyPreset('green-white')"
                    class="mr-2 mb-2"
                  >
                    Green & White
                  </v-btn>
                  <v-btn
                    size="small"
                    variant="outlined"
                    @click="applyPreset('pure-white')"
                    class="mr-2 mb-2"
                  >
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
                @click:close="bgErrorMessage = ''"
              >
                {{ bgErrorMessage }}
              </v-alert>

              <div class="d-flex justify-end gap-2">
                <v-btn
                  color="grey"
                  variant="outlined"
                  @click="resetBackgroundColors"
                  :disabled="bgSaving"
                >
                  <v-icon class="mr-2">mdi-refresh</v-icon>
                  Reset to Default
                </v-btn>
                <v-btn
                  color="primary"
                  variant="elevated"
                  type="submit"
                  :loading="bgSaving"
                  :disabled="bgSaving"
                >
                  <v-icon class="mr-2">mdi-content-save</v-icon>
                  Save Background Colors
                </v-btn>
              </div>
            </v-form>
          </v-card-text>
        </v-card>

        <!-- Operating Hours Card -->
        <v-card class="settings-card mt-6">
          <v-card-title class="text-h5 pa-6 pb-4">
            <v-icon class="mr-2" color="primary">mdi-clock-outline</v-icon>
            Operating Hours
          </v-card-title>

          <v-divider></v-divider>

          <v-card-text class="pa-6">
            <v-alert type="info" variant="tonal" class="mb-4">
              <v-icon class="mr-2">mdi-information</v-icon>
              Set your court's operating hours. These will be displayed on the home page.
            </v-alert>

            <v-form @submit.prevent="saveOperatingHours">
              <!-- Enable Operating Hours Display -->
              <div class="mb-4">
                <v-switch
                  v-model="operatingHoursEnabled"
                  label="Display Operating Hours on Home Page"
                  color="primary"
                  hide-details
                  class="mb-2"
                ></v-switch>
              </div>

              <v-divider class="mb-4"></v-divider>

              <!-- General Operating Hours -->
              <div class="mb-4">
                <label class="text-subtitle-2 font-weight-bold mb-2 d-block">
                  General Operating Hours
                </label>
                <v-row>
                  <v-col cols="12" md="6">
                    <v-text-field
                      v-model="operatingHoursOpening"
                      label="Opening Time"
                      type="time"
                      variant="outlined"
                      prepend-inner-icon="mdi-clock-start"
                      hide-details
                    ></v-text-field>
                  </v-col>
                  <v-col cols="12" md="6">
                    <v-text-field
                      v-model="operatingHoursClosing"
                      label="Closing Time"
                      type="time"
                      variant="outlined"
                      prepend-inner-icon="mdi-clock-end"
                      hide-details
                    ></v-text-field>
                  </v-col>
                </v-row>
              </div>

              <!-- Day-Specific Hours -->
              <div class="mb-4">
                <label class="text-subtitle-2 font-weight-bold mb-3 d-block">
                  <v-icon class="mr-1" size="small">mdi-calendar-week</v-icon>
                  Day-Specific Operating Hours
                  <v-chip size="x-small" color="info" class="ml-2">Optional</v-chip>
                </label>
                <v-alert type="info" density="compact" variant="tonal" class="mb-3">
                  <small>Customize opening hours for specific days. Leave empty to use general hours.</small>
                </v-alert>

                <div v-for="day in weekDays" :key="day.value" class="mb-3">
                  <v-expansion-panels variant="accordion">
                    <v-expansion-panel>
                      <v-expansion-panel-title>
                        <div class="d-flex align-center">
                          <v-icon class="mr-2" color="primary">{{ day.icon }}</v-icon>
                          <span class="font-weight-bold">{{ day.label }}</span>
                          <v-chip
                            size="x-small"
                            class="ml-2"
                            :color="operatingHours[day.value].operational ? 'success' : 'error'"
                          >
                            <span v-if="operatingHours[day.value].operational">
                              {{ operatingHours[day.value].open }} - {{ operatingHours[day.value].close }}
                            </span>
                            <span v-else>CLOSED</span>
                          </v-chip>
                        </div>
                      </v-expansion-panel-title>
                      <v-expansion-panel-text>
                        <!-- Operational Status Toggle -->
                        <div class="mb-4">
                          <v-switch
                            v-model="operatingHours[day.value].operational"
                            :label="operatingHours[day.value].operational ? 'Operational' : 'Closed'"
                            color="success"
                            hide-details
                            class="mb-2"
                          >
                            <template v-slot:prepend>
                              <v-icon :color="operatingHours[day.value].operational ? 'success' : 'error'">
                                {{ operatingHours[day.value].operational ? 'mdi-check-circle' : 'mdi-close-circle' }}
                              </v-icon>
                            </template>
                          </v-switch>
                        </div>

                        <!-- Time Fields (only show if operational) -->
                        <v-row v-if="operatingHours[day.value].operational">
                          <v-col cols="12" md="6">
                            <v-text-field
                              v-model="operatingHours[day.value].open"
                              label="Opening Time"
                              type="time"
                              variant="outlined"
                              prepend-inner-icon="mdi-clock-start"
                              hide-details
                            ></v-text-field>
                          </v-col>
                          <v-col cols="12" md="6">
                            <v-text-field
                              v-model="operatingHours[day.value].close"
                              label="Closing Time"
                              type="time"
                              variant="outlined"
                              prepend-inner-icon="mdi-clock-end"
                              hide-details
                            ></v-text-field>
                          </v-col>
                        </v-row>
                        <v-alert v-else type="info" density="compact" variant="tonal" class="mt-2">
                          This day is marked as closed. No operations on {{ day.label }}.
                        </v-alert>
                      </v-expansion-panel-text>
                    </v-expansion-panel>
                  </v-expansion-panels>
                </div>
              </div>

              <v-alert
                v-if="operatingSuccessMessage"
                type="success"
                variant="tonal"
                closable
                class="mb-4"
                @click:close="operatingSuccessMessage = ''"
              >
                {{ operatingSuccessMessage }}
              </v-alert>

              <v-alert
                v-if="operatingErrorMessage"
                type="error"
                variant="tonal"
                closable
                class="mb-4"
                @click:close="operatingErrorMessage = ''"
              >
                {{ operatingErrorMessage }}
              </v-alert>

              <div class="d-flex justify-end gap-2">
                <v-btn
                  color="grey"
                  variant="outlined"
                  @click="resetOperatingHours"
                  :disabled="operatingSaving"
                >
                  <v-icon class="mr-2">mdi-refresh</v-icon>
                  Reset to Default
                </v-btn>
                <v-btn
                  color="primary"
                  variant="elevated"
                  type="submit"
                  :loading="operatingSaving"
                  :disabled="operatingSaving"
                >
                  <v-icon class="mr-2">mdi-content-save</v-icon>
                  Save Operating Hours
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

    // Contact details
    const contactEmail = ref('')
    const originalContactEmail = ref('')
    const contactMobile = ref('')
    const originalContactMobile = ref('')
    const contactViber = ref('')
    const originalContactViber = ref('')

    // Social media
    const facebookPageUrl = ref('')
    const originalFacebookPageUrl = ref('')
    const facebookPageName = ref('')
    const originalFacebookPageName = ref('')

    // Background colors
    const bgPrimaryColor = ref('#FFFFFF')
    const bgSecondaryColor = ref('#FFEBEE')
    const bgAccentColor = ref('#FFCDD2')
    const bgSaving = ref(false)
    const bgSuccessMessage = ref('')
    const bgErrorMessage = ref('')

    // Operating hours
    const operatingHoursEnabled = ref(true)
    const operatingHoursOpening = ref('08:00')
    const operatingHoursClosing = ref('22:00')
    const operatingHours = ref({
      monday: { open: '08:00', close: '22:00', operational: true },
      tuesday: { open: '08:00', close: '22:00', operational: true },
      wednesday: { open: '08:00', close: '22:00', operational: true },
      thursday: { open: '08:00', close: '22:00', operational: true },
      friday: { open: '08:00', close: '22:00', operational: true },
      saturday: { open: '08:00', close: '22:00', operational: true },
      sunday: { open: '08:00', close: '22:00', operational: true }
    })
    const operatingSaving = ref(false)
    const operatingSuccessMessage = ref('')
    const operatingErrorMessage = ref('')

    const weekDays = [
      { value: 'monday', label: 'Monday', icon: 'mdi-numeric-1-circle' },
      { value: 'tuesday', label: 'Tuesday', icon: 'mdi-numeric-2-circle' },
      { value: 'wednesday', label: 'Wednesday', icon: 'mdi-numeric-3-circle' },
      { value: 'thursday', label: 'Thursday', icon: 'mdi-numeric-4-circle' },
      { value: 'friday', label: 'Friday', icon: 'mdi-numeric-5-circle' },
      { value: 'saturday', label: 'Saturday', icon: 'mdi-numeric-6-circle' },
      { value: 'sunday', label: 'Sunday', icon: 'mdi-numeric-7-circle' }
    ]

    const snackbar = ref({
      show: false,
      message: '',
      color: 'success'
    })

    const rules = {
      required: value => !!value || 'This field is required',
      email: value => {
        if (!value) return true // Allow empty email
        const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        return pattern.test(value) || 'Invalid email address'
      }
    }

    const loadSettings = async () => {
      try {
        loading.value = true
        const settings = await companySettingService.getSettings()
        companyName.value = settings.company_name || ''
        originalCompanyName.value = settings.company_name || ''

        // Load logo URL if exists
        if (settings.company_logo_url) {
          const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000'
          currentLogoUrl.value = `${apiUrl}${settings.company_logo_url}`
          originalLogoUrl.value = currentLogoUrl.value
        }

        // Load contact details
        contactEmail.value = settings.contact_email || ''
        originalContactEmail.value = settings.contact_email || ''
        contactMobile.value = settings.contact_mobile || ''
        originalContactMobile.value = settings.contact_mobile || ''
        contactViber.value = settings.contact_viber || ''
        originalContactViber.value = settings.contact_viber || ''

        // Load social media
        facebookPageUrl.value = settings.facebook_page_url || ''
        originalFacebookPageUrl.value = settings.facebook_page_url || ''
        facebookPageName.value = settings.facebook_page_name || ''
        originalFacebookPageName.value = settings.facebook_page_name || ''

        // Load background colors
        bgPrimaryColor.value = settings.bg_primary_color || '#FFFFFF'
        bgSecondaryColor.value = settings.bg_secondary_color || '#FFEBEE'
        bgAccentColor.value = settings.bg_accent_color || '#FFCDD2'

        // Load operating hours
        operatingHoursEnabled.value = settings.operating_hours_enabled !== undefined ? settings.operating_hours_enabled : true
        operatingHoursOpening.value = settings.operating_hours_opening || '08:00'
        operatingHoursClosing.value = settings.operating_hours_closing || '22:00'

        // Load day-specific operating hours
        const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
        days.forEach(day => {
          operatingHours.value[day].open = settings[`operating_hours_${day}_open`] || '08:00'
          operatingHours.value[day].close = settings[`operating_hours_${day}_close`] || '22:00'
          operatingHours.value[day].operational = settings[`operating_hours_${day}_operational`] !== undefined
            ? settings[`operating_hours_${day}_operational`]
            : true
        })
      } catch (error) {
        errorMessage.value = 'Failed to load company settings'
        showSnackbar('Failed to load settings', 'error')
      } finally {
        loading.value = false
      }
    }

    const handleFileChange = (event) => {
      const file = Array.isArray(logoFile.value) ? logoFile.value[0] : logoFile.value

      if (file) {
        // Validate file size (2MB max)
        if (file.size > 2 * 1024 * 1024) {
          errorMessage.value = 'File size must be less than 2MB'
          logoFile.value = null
          return
        }

        // Create preview
        const reader = new FileReader()
        reader.onload = (e) => {
          logoPreview.value = e.target.result
        }
        reader.readAsDataURL(file)
        logoToDelete.value = false
      }
    }

    const clearLogo = () => {
      logoFile.value = null
      logoPreview.value = null
    }

    const removeLogo = async () => {
      if (logoPreview.value) {
        // Just remove the preview if it's a new upload
        clearLogo()
      } else if (currentLogoUrl.value) {
        // Mark current logo for deletion
        try {
          await companySettingService.deleteLogo()
          currentLogoUrl.value = null
          originalLogoUrl.value = null
          successMessage.value = 'Logo removed successfully!'
          showSnackbar('Logo removed successfully', 'success')

          // Dispatch event to update navbar
          window.dispatchEvent(new CustomEvent('company-settings-updated'))
        } catch (error) {
          errorMessage.value = error.message || 'Failed to delete logo'
          showSnackbar('Failed to delete logo', 'error')
        }
      }
    }

    const saveSettings = async () => {
      try {
        saving.value = true
        errorMessage.value = ''
        successMessage.value = ''

        const settingsData = {
          company_name: companyName.value,
          contact_email: contactEmail.value,
          contact_mobile: contactMobile.value,
          contact_viber: contactViber.value,
          facebook_page_url: facebookPageUrl.value,
          facebook_page_name: facebookPageName.value
        }

        // Add logo file if selected
        if (logoFile.value) {
          const file = Array.isArray(logoFile.value) ? logoFile.value[0] : logoFile.value
          settingsData.company_logo = file
        }

        const result = await companySettingService.updateSettings(settingsData)

        originalCompanyName.value = companyName.value
        originalContactEmail.value = contactEmail.value
        originalContactMobile.value = contactMobile.value
        originalContactViber.value = contactViber.value
        originalFacebookPageUrl.value = facebookPageUrl.value
        originalFacebookPageName.value = facebookPageName.value

        // Update current logo URL if a new one was uploaded
        if (result.company_logo_url) {
          const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000'
          currentLogoUrl.value = `${apiUrl}${result.company_logo_url}`
          originalLogoUrl.value = currentLogoUrl.value
          logoPreview.value = null
          logoFile.value = null
        }

        successMessage.value = 'Company settings updated successfully!'
        showSnackbar('Settings saved successfully', 'success')

        // Dispatch event to update navbar title and logo
        window.dispatchEvent(new CustomEvent('company-settings-updated'))
      } catch (error) {
        errorMessage.value = error.message || 'Failed to update company settings'
        showSnackbar('Failed to save settings', 'error')
      } finally {
        saving.value = false
      }
    }

    const resetForm = () => {
      companyName.value = originalCompanyName.value
      currentLogoUrl.value = originalLogoUrl.value
      logoPreview.value = null
      logoFile.value = null
      logoToDelete.value = false
      contactEmail.value = originalContactEmail.value
      contactMobile.value = originalContactMobile.value
      contactViber.value = originalContactViber.value
      facebookPageUrl.value = originalFacebookPageUrl.value
      facebookPageName.value = originalFacebookPageName.value
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

    // Background color functions
    const saveBackgroundColors = async () => {
      try {
        bgSaving.value = true
        bgSuccessMessage.value = ''
        bgErrorMessage.value = ''

        const data = {
          bg_primary_color: bgPrimaryColor.value,
          bg_secondary_color: bgSecondaryColor.value,
          bg_accent_color: bgAccentColor.value,
          company_name: companyName.value // Required field
        }

        await companySettingService.updateSettings(data)
        bgSuccessMessage.value = 'Background colors updated successfully! Changes applied immediately.'
        showSnackbar('Background colors saved successfully', 'success')

        // Dispatch event to reload backgrounds immediately
        window.dispatchEvent(new CustomEvent('background-colors-updated', {
          detail: {
            primary: bgPrimaryColor.value,
            secondary: bgSecondaryColor.value,
            accent: bgAccentColor.value
          }
        }))

        // Also reload company settings to update everywhere
        window.dispatchEvent(new CustomEvent('company-settings-updated'))

      } catch (error) {
        bgErrorMessage.value = error.message || 'Failed to update background colors'
        showSnackbar('Failed to save background colors', 'error')
      } finally {
        bgSaving.value = false
      }
    }

    const resetBackgroundColors = () => {
      bgPrimaryColor.value = '#FFFFFF'
      bgSecondaryColor.value = '#FFEBEE'
      bgAccentColor.value = '#FFCDD2'
      bgSuccessMessage.value = ''
      bgErrorMessage.value = ''
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
    }

    // Operating hours functions
    const saveOperatingHours = async () => {
      try {
        operatingSaving.value = true
        operatingSuccessMessage.value = ''
        operatingErrorMessage.value = ''

        const data = {
          operating_hours_opening: operatingHoursOpening.value,
          operating_hours_closing: operatingHoursClosing.value,
          operating_hours_enabled: operatingHoursEnabled.value,
          company_name: companyName.value // Required field
        }

        // Add day-specific hours
        const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
        days.forEach(day => {
          data[`operating_hours_${day}_open`] = operatingHours.value[day].open
          data[`operating_hours_${day}_close`] = operatingHours.value[day].close
          data[`operating_hours_${day}_operational`] = operatingHours.value[day].operational
        })

        await companySettingService.updateSettings(data)
        operatingSuccessMessage.value = 'Operating hours updated successfully!'
        showSnackbar('Operating hours saved successfully', 'success')

        // Dispatch event to update home page
        window.dispatchEvent(new CustomEvent('company-settings-updated'))

      } catch (error) {
        operatingErrorMessage.value = error.message || 'Failed to update operating hours'
        showSnackbar('Failed to save operating hours', 'error')
      } finally {
        operatingSaving.value = false
      }
    }

    const resetOperatingHours = () => {
      operatingHoursEnabled.value = true
      operatingHoursOpening.value = '08:00'
      operatingHoursClosing.value = '22:00'
      const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
      days.forEach(day => {
        operatingHours.value[day].open = '08:00'
        operatingHours.value[day].close = '22:00'
        operatingHours.value[day].operational = true
      })
      operatingSuccessMessage.value = ''
      operatingErrorMessage.value = ''
    }

    onMounted(() => {
      loadSettings()
    })

    return {
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
      // Contact details
      contactEmail,
      contactMobile,
      contactViber,
      // Social media
      facebookPageUrl,
      facebookPageName,
      loadSettings,
      saveSettings,
      resetForm,
      showSnackbar,
      handleFileChange,
      clearLogo,
      removeLogo,
      // Background colors
      bgPrimaryColor,
      bgSecondaryColor,
      bgAccentColor,
      bgSaving,
      bgSuccessMessage,
      bgErrorMessage,
      saveBackgroundColors,
      resetBackgroundColors,
      applyPreset,
      // Operating hours
      operatingHoursEnabled,
      operatingHoursOpening,
      operatingHoursClosing,
      operatingHours,
      operatingSaving,
      operatingSuccessMessage,
      operatingErrorMessage,
      weekDays,
      saveOperatingHours,
      resetOperatingHours
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

/* Logo Preview Styles */
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

/* Enhanced Background */
.sports-background {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #FFFFFF 0%, #FFEBEE 25%, #FFCDD2 50%, #FFEBEE 75%, #FFFFFF 100%);
  z-index: -3;
}

.sports-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background:
    radial-gradient(circle at 20% 80%, rgba(183, 28, 28, 0.08) 0%, transparent 50%),
    radial-gradient(circle at 80% 20%, rgba(198, 40, 40, 0.06) 0%, transparent 50%),
    radial-gradient(circle at 40% 40%, rgba(211, 47, 47, 0.05) 0%, transparent 50%);
  z-index: -2;
}

.sports-pattern {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-image:
    radial-gradient(circle at 1px 1px, rgba(183, 28, 28, 0.03) 1px, transparent 0);
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

/* Background Color Settings */
.color-picker {
  width: 100%;
  height: 48px;
  border-radius: 8px;
  border: 2px solid #e2e8f0;
  cursor: pointer;
  transition: all 0.3s ease;
}

.color-picker:hover {
  border-color: #B71C1C;
  transform: scale(1.05);
}

.bg-preview-container {
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.bg-preview {
  min-height: 150px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 32px;
}

.bg-preview-content {
  text-align: center;
  background: rgba(255, 255, 255, 0.9);
  padding: 24px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.preset-buttons {
  display: flex;
  flex-wrap: wrap;
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

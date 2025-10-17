<template>
  <div class="company-settings">
    <!-- Enhanced Header -->
    <div class="settings-header">
      <div class="header-content">
        <div class="header-badge">
          <v-icon color="#B71C1C" size="20" class="mr-2">mdi-cog</v-icon>
          System Configuration
        </div>
        <h1 class="header-title">
          <span class="title-gradient">System</span> Settings
        </h1>
        <p class="header-subtitle">
          Manage your theme, company information, and dashboard preferences
        </p>
      </div>
    </div>

    <!-- Settings Tabs -->
        <v-card class="settings-card">
      <v-tabs
        v-model="activeTab"
        bg-color="transparent"
        color="#B71C1C"
        grow
      >
        <v-tab value="theme">
          <v-icon class="mr-2">mdi-palette</v-icon>
          Theme Settings
        </v-tab>
        <v-tab value="company">
          <v-icon class="mr-2">mdi-office-building</v-icon>
          Company Settings
        </v-tab>
        <v-tab value="payments">
          <v-icon class="mr-2">mdi-credit-card-outline</v-icon>
          Payment Settings
        </v-tab>
        <v-tab value="dashboard">
          <v-icon class="mr-2">mdi-view-dashboard</v-icon>
          Dashboard Settings
        </v-tab>
        <v-tab value="modules">
          <v-icon class="mr-2">mdi-format-title</v-icon>
          Module Titles
        </v-tab>
      </v-tabs>

          <v-divider></v-divider>

      <v-window v-model="activeTab">
        <!-- Theme Settings Tab -->
        <v-window-item value="theme">
          <v-card-text class="pa-6">
            <h2 class="text-h6 mb-4">
              <v-icon class="mr-2" color="#B71C1C">mdi-palette</v-icon>
              Customize Your Theme
            </h2>

            <v-form ref="themeForm">
              <!-- Background Gradient Settings -->
              <div class="mb-6">
                <h3 class="text-subtitle-1 font-weight-bold mb-3">
                  Background Gradient Colors
                </h3>
                
                <v-row>
                  <v-col cols="12" md="4">
                    <label class="text-caption mb-2 d-block">Primary Color</label>
                    <input
                      type="color"
                      v-model="themeSettings.gradientColor1"
                      class="color-picker"
                    />
                    <v-text-field
                      v-model="themeSettings.gradientColor1"
                      variant="outlined"
                      density="compact"
                      hide-details
                      class="mt-2"
                    ></v-text-field>
                  </v-col>

                  <v-col cols="12" md="4">
                    <label class="text-caption mb-2 d-block">Secondary Color</label>
                    <input
                      type="color"
                      v-model="themeSettings.gradientColor2"
                      class="color-picker"
                    />
                    <v-text-field
                      v-model="themeSettings.gradientColor2"
                      variant="outlined"
                      density="compact"
                      hide-details
                      class="mt-2"
                    ></v-text-field>
                  </v-col>

                  <v-col cols="12" md="4">
                    <label class="text-caption mb-2 d-block">Accent Color</label>
                    <input
                      type="color"
                      v-model="themeSettings.gradientColor3"
                      class="color-picker"
                    />
                    <v-text-field
                      v-model="themeSettings.gradientColor3"
                      variant="outlined"
                      density="compact"
                      hide-details
                      class="mt-2"
                    ></v-text-field>
                  </v-col>
                </v-row>
              </div>

              <!-- Gradient Direction -->
              <div class="mb-6">
                <h3 class="text-subtitle-1 font-weight-bold mb-3">
                  Gradient Direction
                </h3>
                <v-slider
                  v-model="themeSettings.gradientAngle"
                  min="0"
                  max="360"
                  step="45"
                  thumb-label
                  :label="`${themeSettings.gradientAngle}°`"
                  color="#B71C1C"
                  class="mb-2"
                ></v-slider>
                <v-chip-group v-model="themeSettings.gradientAngle" mandatory>
                  <v-chip value="0" filter>0° (Right)</v-chip>
                  <v-chip value="45" filter>45° (Top-Right)</v-chip>
                  <v-chip value="90" filter>90° (Top)</v-chip>
                  <v-chip value="135" filter>135° (Top-Left)</v-chip>
                  <v-chip value="180" filter>180° (Left)</v-chip>
                  <v-chip value="225" filter>225° (Bottom-Left)</v-chip>
                  <v-chip value="270" filter>270° (Bottom)</v-chip>
                  <v-chip value="315" filter>315° (Bottom-Right)</v-chip>
                </v-chip-group>
              </div>

              <!-- Preview -->
              <div class="mb-6">
                <h3 class="text-subtitle-1 font-weight-bold mb-3">
                  Background Preview
                </h3>
                <div class="bg-preview-container">
                  <div
                    class="bg-preview"
                    :style="{
                      background: previewGradient
                    }"
                  >
                    <div class="bg-preview-content">
                      <v-icon size="48" color="#B71C1C">mdi-eye</v-icon>
                      <h4 class="mt-3">Preview</h4>
                      <p class="text-caption">This is how your background will look</p>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Preset Gradients -->
              <div class="mb-6">
                <h3 class="text-subtitle-1 font-weight-bold mb-3">
                  Preset Themes
                </h3>
                <div class="preset-buttons">
                  <v-btn
                    @click="applyPreset('red')"
                    color="red"
                    variant="tonal"
                    class="mr-2 mb-2"
                  >
                    Red (Default)
                  </v-btn>
                  <v-btn
                    @click="applyPreset('blue')"
                    color="#1976d2"
                    variant="tonal"
                    class="mr-2 mb-2"
                  >
                    Blue
                  </v-btn>
                  <v-btn
                    @click="applyPreset('green')"
                    color="#4caf50"
                    variant="tonal"
                    class="mr-2 mb-2"
                  >
                    Green
                  </v-btn>
                  <v-btn
                    @click="applyPreset('purple')"
                    color="#9c27b0"
                    variant="tonal"
                    class="mr-2 mb-2"
                  >
                    Purple
                  </v-btn>
                  <v-btn
                    @click="applyPreset('orange')"
                    color="#ff9800"
                    variant="tonal"
                    class="mr-2 mb-2"
                  >
                    Orange
                  </v-btn>
                </div>
              </div>

              <!-- Button Colors -->
              <div class="mb-6">
                <h3 class="text-subtitle-1 font-weight-bold mb-3">
                  <v-icon class="mr-2">mdi-cursor-default-click</v-icon>
                  Button Colors
                </h3>
                <p class="text-caption text-grey mb-4">
                  Customize the colors for all buttons throughout the system
                </p>
                
                <v-row>
                  <v-col cols="6" md="4">
                    <label class="text-caption mb-1 d-block font-weight-bold">Primary Buttons</label>
                    <input
                      type="color"
                      v-model="themeSettings.buttonPrimaryColor"
                      class="color-picker"
                    />
                    <div class="mt-2">
                      <v-btn color="#B71C1C" size="small" block style="background-color: #B71C1C !important; color: white !important;">Example</v-btn>
                    </div>
                  </v-col>
                  
                  <v-col cols="6" md="4">
                    <label class="text-caption mb-1 d-block font-weight-bold">Secondary Buttons</label>
                    <input
                      type="color"
                      v-model="themeSettings.buttonSecondaryColor"
                      class="color-picker"
                    />
                    <div class="mt-2">
                      <v-btn color="secondary" size="small" block>Example</v-btn>
                    </div>
                  </v-col>
                  
                  <v-col cols="6" md="4">
                    <label class="text-caption mb-1 d-block font-weight-bold">Success Buttons</label>
                    <input
                      type="color"
                      v-model="themeSettings.buttonSuccessColor"
                      class="color-picker"
                    />
                    <div class="mt-2">
                      <v-btn color="success" size="small" block>Example</v-btn>
                    </div>
                  </v-col>
                  
                  <v-col cols="6" md="4">
                    <label class="text-caption mb-1 d-block font-weight-bold">Error Buttons</label>
                    <input
                      type="color"
                      v-model="themeSettings.buttonErrorColor"
                      class="color-picker"
                    />
                    <div class="mt-2">
                      <v-btn color="error" size="small" block>Example</v-btn>
                    </div>
                  </v-col>
                  
                  <v-col cols="6" md="4">
                    <label class="text-caption mb-1 d-block font-weight-bold">Warning Buttons</label>
                    <input
                      type="color"
                      v-model="themeSettings.buttonWarningColor"
                      class="color-picker"
                    />
                    <div class="mt-2">
                      <v-btn color="warning" size="small" block>Example</v-btn>
                    </div>
                  </v-col>
                  
                  <v-col cols="6" md="4">
                    <label class="text-caption mb-1 d-block font-weight-bold">Info Buttons</label>
                    <input
                      type="color"
                      v-model="themeSettings.buttonInfoColor"
                      class="color-picker"
                    />
                    <div class="mt-2">
                      <v-btn color="info" size="small" block>Example</v-btn>
                    </div>
                  </v-col>
                </v-row>
              </div>

              <v-row>
                <v-col cols="12" md="8">
                  <v-btn
                    color="#B71C1C"
                    size="large"
                    block
                    @click="saveThemeSettings"
                    :loading="savingTheme"
                    style="background-color: #B71C1C !important; color: white !important;"
                  >
                    <v-icon class="mr-2">mdi-content-save</v-icon>
                    Save Theme Settings
                  </v-btn>
                </v-col>
                <v-col cols="12" md="4">
                  <v-btn
                    color="error"
                    size="large"
                    block
                    variant="outlined"
                    @click="resetToDefaultTheme"
                  >
                    <v-icon class="mr-2">mdi-restore</v-icon>
                    Reset to Default
                  </v-btn>
                </v-col>
              </v-row>
            </v-form>
          </v-card-text>
        </v-window-item>

        <!-- Company Settings Tab -->
        <v-window-item value="company">
          <v-card-text class="pa-6">
            <h2 class="text-h6 mb-4">
              <v-icon class="mr-2" color="#B71C1C">mdi-office-building</v-icon>
              Company Information
            </h2>

            <v-form ref="companyForm" v-model="formValid">
              <!-- Company Logo Upload -->
              <div class="mb-6">
                <label class="text-subtitle-1 font-weight-bold mb-2 d-block">
                  <v-icon class="mr-2" color="#B71C1C">mdi-image</v-icon>
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

              <v-btn
                color="#B71C1C"
                size="large"
                block
                @click="saveCompanySettings"
                :loading="saving"
                :disabled="!formValid"
                style="background-color: #B71C1C !important; color: white !important;"
              >
                <v-icon class="mr-2">mdi-content-save</v-icon>
                Save Company Settings
              </v-btn>
            </v-form>
          </v-card-text>
        </v-window-item>

        <!-- Payment Settings Tab -->
        <v-window-item value="payments">
          <v-card-text class="pa-6">
            <h2 class="text-h6 mb-4">
              <v-icon class="mr-2" color="#B71C1C">mdi-credit-card-outline</v-icon>
              Payment Settings
            </h2>

            <v-form>
              <v-text-field
                v-model="paymentSettings.gcashNumber"
                label="GCash Number"
                placeholder="09XXXXXXXXX"
                variant="outlined"
                prepend-inner-icon="mdi-phone"
                class="mb-4"
              ></v-text-field>

              <div class="mb-4">
                <label class="text-subtitle-2 d-block mb-2">GCash QR Code</label>
                <div v-if="paymentSettings.gcashQrPreview || paymentSettings.gcashQrUrl" class="logo-preview-container mb-3">
                  <v-card class="logo-preview-card" elevation="2">
                    <v-img
                      :src="paymentSettings.gcashQrPreview || paymentSettings.gcashQrUrl"
                      max-height="220"
                      max-width="220"
                      contain
                      class="ma-auto"
                    ></v-img>
                  </v-card>
                </div>
                <v-file-input
                  v-model="paymentSettings.gcashQrFile"
                  label="Upload GCash QR Code"
                  placeholder="Choose an image file"
                  variant="outlined"
                  prepend-inner-icon="mdi-qrcode"
                  accept="image/jpeg,image/jpg,image/png,image/gif,image/svg+xml,image/webp"
                  class="mb-4"
                  @change="onGcashQrChange"
                ></v-file-input>
              </div>

              <v-btn
                color="#B71C1C"
                size="large"
                block
                @click="savePaymentSettings"
                :loading="saving"
                style="background-color: #B71C1C !important; color: white !important;"
              >
                <v-icon class="mr-2">mdi-content-save</v-icon>
                Save Payment Settings
              </v-btn>
            </v-form>
          </v-card-text>
        </v-window-item>

        <!-- Dashboard Settings Tab -->
        <v-window-item value="dashboard">
          <v-card-text class="pa-6">
            <h2 class="text-h6 mb-4">
              <v-icon class="mr-2" color="#B71C1C">mdi-view-dashboard</v-icon>
              Dashboard Preferences
            </h2>

            <v-form ref="dashboardForm">
              <!-- Dashboard Layout -->
              <div class="mb-6">
                <h3 class="text-subtitle-1 font-weight-bold mb-3">
                  Layout Options
                </h3>
                <v-radio-group v-model="dashboardSettings.layout" inline>
                  <v-radio label="Compact" value="compact"></v-radio>
                  <v-radio label="Standard" value="standard"></v-radio>
                  <v-radio label="Spacious" value="spacious"></v-radio>
                </v-radio-group>
              </div>

              <!-- Show Stats Cards -->
              <div class="mb-6">
                <h3 class="text-subtitle-1 font-weight-bold mb-3">
                  Display Options
                </h3>
                <v-switch
                  v-model="dashboardSettings.showStatsCards"
                  label="Show Statistics Cards"
                  color="#B71C1C"
                  hide-details
                  class="mb-3"
                ></v-switch>
                <v-switch
                  v-model="dashboardSettings.showQuickActions"
                  label="Show Quick Actions"
                  color="#B71C1C"
                  hide-details
                  class="mb-3"
                ></v-switch>
                <v-switch
                  v-model="dashboardSettings.showRecentActivity"
                  label="Show Recent Activity"
                  color="#B71C1C"
                  hide-details
                  class="mb-3"
                ></v-switch>
              </div>

              <!-- Items Per Page -->
              <div class="mb-6">
                <h3 class="text-subtitle-1 font-weight-bold mb-3">
                  Table Settings
                </h3>
                <v-select
                  v-model="dashboardSettings.itemsPerPage"
                  :items="[10, 25, 50, 100]"
                  label="Items Per Page"
                  variant="outlined"
                  density="compact"
                ></v-select>
              </div>

                <v-btn
                  color="#B71C1C"
                size="large"
                block
                @click="saveDashboardSettings"
                :loading="savingDashboard"
                style="background-color: #B71C1C !important; color: white !important;"
                >
                  <v-icon class="mr-2">mdi-content-save</v-icon>
                Save Dashboard Settings
                </v-btn>
            </v-form>
          </v-card-text>
        </v-window-item>

        <!-- Module Titles Tab -->
        <v-window-item value="modules">
          <v-card-text class="pa-6">
            <h2 class="text-h6 mb-4">
              <v-icon class="mr-2" color="#B71C1C">mdi-format-title</v-icon>
              Customize Module Titles
            </h2>

            <v-alert type="info" variant="tonal" class="mb-4">
              <v-icon class="mr-2">mdi-information</v-icon>
              Customize the titles and colors for each module. These will appear on the respective pages.
              </v-alert>

            <v-form @submit.prevent="saveModuleTitles">
              <!-- Admin Panel Module -->
              <v-card variant="outlined" class="mb-4">
                <v-card-title class="text-subtitle-1 pa-4 bg-grey-lighten-5">
                  <v-icon class="mr-2" size="small">mdi-shield-account</v-icon>
                  Admin Panel Module
                </v-card-title>
                <v-card-text class="pa-4">
                  <v-row>
                    <v-col cols="12" md="6">
                      <v-text-field
                        v-model="moduleTitles.admin.text"
                        label="Title Text"
                        variant="outlined"
                        density="compact"
                        placeholder="Admin Panel"
                        class="mb-3"
                      ></v-text-field>
                    </v-col>
                    <v-col cols="12" md="3">
                      <label class="text-caption mb-1 d-block font-weight-bold">Title Color</label>
                      <input
                        type="color"
                        v-model="moduleTitles.admin.color"
                        class="color-picker"
                      />
                    </v-col>
                    <v-col cols="12" md="3">
                      <label class="text-caption mb-1 d-block font-weight-bold">Badge Color</label>
                      <input
                        type="color"
                        v-model="moduleTitles.admin.badgeColor"
                        class="color-picker"
                      />
                    </v-col>
                    <v-col cols="12">
                      <v-textarea
                        v-model="moduleTitles.admin.subtitle"
                        label="Subtitle"
                        variant="outlined"
                        density="compact"
                        rows="2"
                        placeholder="Enter a descriptive subtitle for this module"
                      ></v-textarea>
                    </v-col>
                  </v-row>
                  <div class="preview-box pa-3 rounded mt-2">
                    <div class="d-inline-flex align-center px-3 py-1 rounded-pill mb-2" :style="{ backgroundColor: moduleTitles.admin.badgeColor + '20', border: '1px solid ' + moduleTitles.admin.badgeColor }">
                      <v-icon size="small" :color="moduleTitles.admin.badgeColor" class="mr-1">mdi-shield-account</v-icon>
                      <span class="text-caption font-weight-medium" :style="{ color: moduleTitles.admin.badgeColor }">Admin Control Center</span>
                    </div>
                    <h3 class="text-h5" :style="{ color: moduleTitles.admin.color }">{{ moduleTitles.admin.text }}</h3>
                    <p class="text-body-2 text-grey mt-1">{{ moduleTitles.admin.subtitle }}</p>
                  </div>
                </v-card-text>
              </v-card>

              <!-- Courts Module -->
              <v-card variant="outlined" class="mb-4">
                <v-card-title class="text-subtitle-1 pa-4 bg-grey-lighten-5">
                  <v-icon class="mr-2" size="small">mdi-stadium</v-icon>
                  Courts Module
                </v-card-title>
                <v-card-text class="pa-4">
                  <v-row>
                    <v-col cols="12" md="6">
                      <v-text-field
                        v-model="moduleTitles.courts.text"
                        label="Title Text"
                        variant="outlined"
                        density="compact"
                        placeholder="Manage Courts"
                        class="mb-3"
                      ></v-text-field>
                    </v-col>
                    <v-col cols="12" md="3">
                      <label class="text-caption mb-1 d-block font-weight-bold">Title Color</label>
                      <input
                        type="color"
                        v-model="moduleTitles.courts.color"
                        class="color-picker"
                      />
                    </v-col>
                    <v-col cols="12" md="3">
                      <label class="text-caption mb-1 d-block font-weight-bold">Badge Color</label>
                      <input
                        type="color"
                        v-model="moduleTitles.courts.badgeColor"
                        class="color-picker"
                      />
                    </v-col>
                    <v-col cols="12">
                      <v-textarea
                        v-model="moduleTitles.courts.subtitle"
                        label="Subtitle"
                        variant="outlined"
                        density="compact"
                        rows="2"
                        placeholder="Enter a descriptive subtitle for this module"
                      ></v-textarea>
                    </v-col>
                  </v-row>
                  <div class="preview-box pa-3 rounded mt-2">
                    <div class="d-inline-flex align-center px-3 py-1 rounded-pill mb-2" :style="{ backgroundColor: moduleTitles.courts.badgeColor + '20', border: '1px solid ' + moduleTitles.courts.badgeColor }">
                      <v-icon size="small" :color="moduleTitles.courts.badgeColor" class="mr-1">mdi-stadium</v-icon>
                      <span class="text-caption font-weight-medium" :style="{ color: moduleTitles.courts.badgeColor }">Court Management</span>
                    </div>
                    <h3 class="text-h5" :style="{ color: moduleTitles.courts.color }">{{ moduleTitles.courts.text }}</h3>
                    <p class="text-body-2 text-grey mt-1">{{ moduleTitles.courts.subtitle }}</p>
                  </div>
          </v-card-text>
        </v-card>

              <!-- Sports Module -->
              <v-card variant="outlined" class="mb-4">
                <v-card-title class="text-subtitle-1 pa-4 bg-grey-lighten-5">
                  <v-icon class="mr-2" size="small">mdi-tennis-ball</v-icon>
                  Sports Module
                </v-card-title>
                <v-card-text class="pa-4">
                  <v-row>
                    <v-col cols="12" md="6">
                      <v-text-field
                        v-model="moduleTitles.sports.text"
                        label="Title Text"
                        variant="outlined"
                        density="compact"
                        placeholder="Manage Sports"
                        class="mb-3"
                      ></v-text-field>
                    </v-col>
                    <v-col cols="12" md="3">
                      <label class="text-caption mb-1 d-block font-weight-bold">Title Color</label>
                      <input
                        type="color"
                        v-model="moduleTitles.sports.color"
                        class="color-picker"
                      />
                    </v-col>
                    <v-col cols="12" md="3">
                      <label class="text-caption mb-1 d-block font-weight-bold">Badge Color</label>
                      <input
                        type="color"
                        v-model="moduleTitles.sports.badgeColor"
                        class="color-picker"
                      />
      </v-col>
                    <v-col cols="12">
                      <v-textarea
                        v-model="moduleTitles.sports.subtitle"
                        label="Subtitle"
                        variant="outlined"
                        density="compact"
                        rows="2"
                        placeholder="Enter a descriptive subtitle for this module"
                      ></v-textarea>
                    </v-col>
    </v-row>
                  <div class="preview-box pa-3 rounded mt-2">
                    <div class="d-inline-flex align-center px-3 py-1 rounded-pill mb-2" :style="{ backgroundColor: moduleTitles.sports.badgeColor + '20', border: '1px solid ' + moduleTitles.sports.badgeColor }">
                      <v-icon size="small" :color="moduleTitles.sports.badgeColor" class="mr-1">mdi-tennis-ball</v-icon>
                      <span class="text-caption font-weight-medium" :style="{ color: moduleTitles.sports.badgeColor }">Sports Management</span>
                    </div>
                    <h3 class="text-h5" :style="{ color: moduleTitles.sports.color }">{{ moduleTitles.sports.text }}</h3>
                    <p class="text-body-2 text-grey mt-1">{{ moduleTitles.sports.subtitle }}</p>
                  </div>
                </v-card-text>
              </v-card>

              <!-- Bookings Module -->
              <v-card variant="outlined" class="mb-4">
                <v-card-title class="text-subtitle-1 pa-4 bg-grey-lighten-5">
                  <v-icon class="mr-2" size="small">mdi-calendar</v-icon>
                  Bookings Module
                </v-card-title>
                <v-card-text class="pa-4">
                  <v-row>
                    <v-col cols="12" md="6">
                      <v-text-field
                        v-model="moduleTitles.bookings.text"
                        label="Title Text"
                        variant="outlined"
                        density="compact"
                        placeholder="My Bookings"
                        class="mb-3"
                      ></v-text-field>
                    </v-col>
                    <v-col cols="12" md="3">
                      <label class="text-caption mb-1 d-block font-weight-bold">Title Color</label>
                      <input
                        type="color"
                        v-model="moduleTitles.bookings.color"
                        class="color-picker"
                      />
                    </v-col>
                    <v-col cols="12" md="3">
                      <label class="text-caption mb-1 d-block font-weight-bold">Badge Color</label>
                      <input
                        type="color"
                        v-model="moduleTitles.bookings.badgeColor"
                        class="color-picker"
                      />
                    </v-col>
                    <v-col cols="12">
                      <v-textarea
                        v-model="moduleTitles.bookings.subtitle"
                        label="Subtitle"
                        variant="outlined"
                        density="compact"
                        rows="2"
                        placeholder="Enter a descriptive subtitle for this module"
                      ></v-textarea>
                    </v-col>
                  </v-row>
                  <div class="preview-box pa-3 rounded mt-2">
                    <div class="d-inline-flex align-center px-3 py-1 rounded-pill mb-2" :style="{ backgroundColor: moduleTitles.bookings.badgeColor + '20', border: '1px solid ' + moduleTitles.bookings.badgeColor }">
                      <v-icon size="small" :color="moduleTitles.bookings.badgeColor" class="mr-1">mdi-calendar</v-icon>
                      <span class="text-caption font-weight-medium" :style="{ color: moduleTitles.bookings.badgeColor }">Booking Management</span>
                    </div>
                    <h3 class="text-h5" :style="{ color: moduleTitles.bookings.color }">{{ moduleTitles.bookings.text }}</h3>
                    <p class="text-body-2 text-grey mt-1">{{ moduleTitles.bookings.subtitle }}</p>
                  </div>
                </v-card-text>
              </v-card>

              <!-- Users Module -->
              <v-card variant="outlined" class="mb-4">
                <v-card-title class="text-subtitle-1 pa-4 bg-grey-lighten-5">
                  <v-icon class="mr-2" size="small">mdi-account-group</v-icon>
                  Users Module
                </v-card-title>
                <v-card-text class="pa-4">
                  <v-row>
                    <v-col cols="12" md="6">
                      <v-text-field
                        v-model="moduleTitles.users.text"
                        label="Title Text"
                  variant="outlined"
                        density="compact"
                        placeholder="Manage Users"
                        class="mb-3"
                      ></v-text-field>
                    </v-col>
                    <v-col cols="12" md="3">
                      <label class="text-caption mb-1 d-block font-weight-bold">Title Color</label>
                      <input
                        type="color"
                        v-model="moduleTitles.users.color"
                        class="color-picker"
                      />
                    </v-col>
                    <v-col cols="12" md="3">
                      <label class="text-caption mb-1 d-block font-weight-bold">Badge Color</label>
                      <input
                        type="color"
                        v-model="moduleTitles.users.badgeColor"
                        class="color-picker"
                      />
                    </v-col>
                    <v-col cols="12">
                      <v-textarea
                        v-model="moduleTitles.users.subtitle"
                        label="Subtitle"
                        variant="outlined"
                        density="compact"
                        rows="2"
                        placeholder="Enter a descriptive subtitle for this module"
                      ></v-textarea>
                    </v-col>
                  </v-row>
                  <div class="preview-box pa-3 rounded mt-2">
                    <div class="d-inline-flex align-center px-3 py-1 rounded-pill mb-2" :style="{ backgroundColor: moduleTitles.users.badgeColor + '20', border: '1px solid ' + moduleTitles.users.badgeColor }">
                      <v-icon size="small" :color="moduleTitles.users.badgeColor" class="mr-1">mdi-account-group</v-icon>
                      <span class="text-caption font-weight-medium" :style="{ color: moduleTitles.users.badgeColor }">User Management</span>
                    </div>
                    <h3 class="text-h5" :style="{ color: moduleTitles.users.color }">{{ moduleTitles.users.text }}</h3>
                    <p class="text-body-2 text-grey mt-1">{{ moduleTitles.users.subtitle }}</p>
                  </div>
                </v-card-text>
              </v-card>

                <v-btn
                  color="#B71C1C"
                size="large"
                block
                @click="saveModuleTitles"
                :loading="savingModuleTitles"
                style="background-color: #B71C1C !important; color: white !important;"
                >
                  <v-icon class="mr-2">mdi-content-save</v-icon>
                Save Module Titles
                </v-btn>
            </v-form>
          </v-card-text>
        </v-window-item>
      </v-window>
        </v-card>

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
import { ref, computed, onMounted, watch } from 'vue'
import { companySettingService } from '../services/companySettingService'

export default {
  name: 'CompanySettings',
  setup() {
    const activeTab = ref('theme')
    const loading = ref(false)
    const saving = ref(false)
    const savingTheme = ref(false)
    const savingDashboard = ref(false)
    const formValid = ref(false)
    
    // Company Settings
    const companyName = ref('')
    const logoFile = ref(null)
    const logoPreview = ref(null)
    const currentLogoUrl = ref(null)
    // Payment settings
    const paymentSettings = ref({
      gcashNumber: '',
      gcashQrFile: null,
      gcashQrPreview: null,
      gcashQrUrl: null
    })

    // Theme Settings
    const themeSettings = ref({
      gradientColor1: '#FFFFFF',
      gradientColor2: '#FFF5F5',
      gradientColor3: '#FFF0F0',
      gradientAngle: 135,
      buttonPrimaryColor: '#B71C1C',
      buttonSecondaryColor: '#5F6368',
      buttonSuccessColor: '#4CAF50',
      buttonErrorColor: '#D32F2F',
      buttonWarningColor: '#F57C00',
      buttonInfoColor: '#757575'
    })

    // Dashboard Settings
    const dashboardSettings = ref({
      layout: 'standard',
      showStatsCards: true,
      showQuickActions: true,
      showRecentActivity: true,
      itemsPerPage: 25
    })

    // Module Titles Settings
    const moduleTitles = ref({
      admin: {
        text: 'Admin Panel',
        color: '#B71C1C',
        badgeColor: '#D32F2F',
        subtitle: 'Manage multi-sport court bookings and oversee the entire system with professional precision'
      },
      courts: {
        text: 'Manage Courts',
        color: '#B71C1C',
        badgeColor: '#D32F2F',
        subtitle: 'Create, manage, and configure courts for all sports'
      },
      sports: {
        text: 'Manage Sports',
        color: '#B71C1C',
        badgeColor: '#D32F2F',
        subtitle: 'Configure available sports and their settings'
      },
      bookings: {
        text: 'My Bookings',
        color: '#B71C1C',
        badgeColor: '#D32F2F',
        subtitle: 'View and manage your court reservations'
      },
      users: {
        text: 'Manage Users',
        color: '#B71C1C',
        badgeColor: '#D32F2F',
        subtitle: 'Manage users, staff, and administrators'
      }
    })

    const savingModuleTitles = ref(false)

    const snackbar = ref({
      show: false,
      message: '',
      color: 'success'
    })

    const rules = {
      required: value => !!value || 'This field is required'
    }

    const previewGradient = computed(() => {
      const angle = themeSettings.value.gradientAngle
      const c1 = themeSettings.value.gradientColor1
      const c2 = themeSettings.value.gradientColor2
      const c3 = themeSettings.value.gradientColor3
      return `linear-gradient(${angle}deg, ${c1} 0%, ${c2} 50%, ${c3} 100%)`
    })

    const loadSettings = async () => {
      try {
        loading.value = true
        const settings = await companySettingService.getSettings()
        
        if (settings.company_name) {
          companyName.value = settings.company_name
        }
        
        if (settings.company_logo) {
          currentLogoUrl.value = `${import.meta.env.VITE_API_URL}/storage/${settings.company_logo}`
        }
        // Payment settings
        if (settings.payment_gcash_number) {
          paymentSettings.value.gcashNumber = settings.payment_gcash_number
        }
        if (settings.payment_gcash_qr) {
          paymentSettings.value.gcashQrUrl = `${import.meta.env.VITE_API_URL}/storage/${settings.payment_gcash_qr}`
        } else if (settings.payment_gcash_qr_url) {
          paymentSettings.value.gcashQrUrl = `${import.meta.env.VITE_API_URL}${settings.payment_gcash_qr_url}`
        }

        // Load theme settings from API
        if (settings.theme_gradient_color1) {
          themeSettings.value = {
            gradientColor1: settings.theme_gradient_color1 || '#FFFFFF',
            gradientColor2: settings.theme_gradient_color2 || '#FFF5F5',
            gradientColor3: settings.theme_gradient_color3 || '#FFEBEE',
            gradientAngle: parseInt(settings.theme_gradient_angle) || 135,
            buttonPrimaryColor: settings.theme_button_primary_color || '#B71C1C',
            buttonSecondaryColor: settings.theme_button_secondary_color || '#5F6368',
            buttonSuccessColor: settings.theme_button_success_color || '#4CAF50',
            buttonErrorColor: settings.theme_button_error_color || '#D32F2F',
            buttonWarningColor: settings.theme_button_warning_color || '#F57C00',
            buttonInfoColor: settings.theme_button_info_color || '#757575'
          }
          // Save to localStorage for offline access
          localStorage.setItem('themeSettings', JSON.stringify(themeSettings.value))
        }

        // Load dashboard settings from localStorage
        const savedDashboard = localStorage.getItem('dashboardSettings')
        if (savedDashboard) {
          dashboardSettings.value = JSON.parse(savedDashboard)
        }

        // Load module titles from API
        if (settings.module_courts_text) {
          moduleTitles.value = {
            admin: {
              text: settings.module_admin_text || 'Admin Panel',
              color: settings.module_admin_color || '#B71C1C',
              badgeColor: settings.module_admin_badge_color || '#D32F2F',
              subtitle: settings.module_admin_subtitle || 'Manage multi-sport court bookings and oversee the entire system with professional precision'
            },
            courts: {
              text: settings.module_courts_text || 'Manage Courts',
              color: settings.module_courts_color || '#B71C1C',
              badgeColor: settings.module_courts_badge_color || '#D32F2F',
              subtitle: settings.module_courts_subtitle || 'Create, manage, and configure courts for all sports'
            },
            sports: {
              text: settings.module_sports_text || 'Manage Sports',
              color: settings.module_sports_color || '#B71C1C',
              badgeColor: settings.module_sports_badge_color || '#D32F2F',
              subtitle: settings.module_sports_subtitle || 'Configure available sports and their settings'
            },
            bookings: {
              text: settings.module_bookings_text || 'My Bookings',
              color: settings.module_bookings_color || '#B71C1C',
              badgeColor: settings.module_bookings_badge_color || '#D32F2F',
              subtitle: settings.module_bookings_subtitle || 'View and manage your court reservations'
            },
            users: {
              text: settings.module_users_text || 'Manage Users',
              color: settings.module_users_color || '#B71C1C',
              badgeColor: settings.module_users_badge_color || '#D32F2F',
              subtitle: settings.module_users_subtitle || 'Manage users, staff, and administrators'
            }
          }
          // Save to localStorage for offline access
          localStorage.setItem('moduleTitles', JSON.stringify(moduleTitles.value))
          localStorage.setItem('settingsVersion', settings.settings_version || '1')
        }
      } catch (err) {
        console.error('Failed to load settings:', err)
        showSnackbar('Failed to load settings', 'error')
      } finally {
        loading.value = false
      }
    }

    const handleFileChange = (event) => {
      const file = event.target.files ? event.target.files[0] : event

      if (!file || !file[0]) return

      const selectedFile = file[0]
      
        // Validate file size (2MB max)
      if (selectedFile.size > 2 * 1024 * 1024) {
        showSnackbar('File size should not exceed 2MB', 'error')
          logoFile.value = null
          return
        }

        // Create preview
        const reader = new FileReader()
        reader.onload = (e) => {
          logoPreview.value = e.target.result
        }
      reader.readAsDataURL(selectedFile)
    }

    const clearLogo = () => {
      logoFile.value = null
      logoPreview.value = null
    }

    const removeLogo = async () => {
      if (!confirm('Are you sure you want to remove the company logo?')) {
        return
      }

      try {
        saving.value = true
          await companySettingService.deleteLogo()
          currentLogoUrl.value = null
        logoPreview.value = null
        logoFile.value = null
          showSnackbar('Logo removed successfully', 'success')
      } catch (err) {
        console.error('Failed to remove logo:', err)
        showSnackbar('Failed to remove logo', 'error')
      } finally {
        saving.value = false
      }
    }

    const saveCompanySettings = async () => {
      try {
        saving.value = true
        const formData = new FormData()
        formData.append('company_name', companyName.value)
        
        if (logoFile.value && logoFile.value[0]) {
          formData.append('company_logo', logoFile.value[0])
        }

        await companySettingService.updateSettings(formData)
        
        // Reload to get the updated logo URL
        await loadSettings()
        
          logoFile.value = null
          logoPreview.value = null

        showSnackbar('Company settings saved successfully!', 'success')

        // Dispatch event to update App.vue
          window.dispatchEvent(new CustomEvent('company-settings-updated'))
      } catch (err) {
        console.error('Failed to save settings:', err)
        showSnackbar('Failed to save settings', 'error')
      } finally {
        saving.value = false
      }
    }

    const saveThemeSettings = async () => {
      savingTheme.value = true
      try {
        // Save to database via API
        const response = await companySettingService.updateThemeSettings(themeSettings.value)
        
        // Update localStorage with new version
        localStorage.setItem('themeSettings', JSON.stringify(themeSettings.value))
        localStorage.setItem('settingsVersion', response.data.settings_version)
        
        // Apply theme immediately
        applyTheme()
        
        // Dispatch event to notify App.vue to refresh theme
        window.dispatchEvent(new CustomEvent('theme-changed'))
        
        showSnackbar('Theme settings saved successfully!', 'success')
      } catch (err) {
        console.error('Failed to save theme:', err)
        showSnackbar(err.response?.data?.message || 'Failed to save theme settings', 'error')
      } finally {
        savingTheme.value = false
      }
    }

    const saveDashboardSettings = () => {
      savingDashboard.value = true
      try {
        // Save to localStorage
        localStorage.setItem('dashboardSettings', JSON.stringify(dashboardSettings.value))
        
        showSnackbar('Dashboard settings saved successfully!', 'success')
        
        // Dispatch event to update other components
        window.dispatchEvent(new CustomEvent('dashboard-settings-updated', {
          detail: dashboardSettings.value
        }))
      } catch (err) {
        console.error('Failed to save dashboard settings:', err)
        showSnackbar('Failed to save dashboard settings', 'error')
      } finally {
        savingDashboard.value = false
      }
    }

    const applyTheme = () => {
      const angle = themeSettings.value.gradientAngle
      const c1 = themeSettings.value.gradientColor1
      const c2 = themeSettings.value.gradientColor2
      const c3 = themeSettings.value.gradientColor3
      
      // Calculate lighter tints for overlays
      const parseColor = (hex) => {
        const r = parseInt(hex.slice(1, 3), 16)
        const g = parseInt(hex.slice(3, 5), 16)
        const b = parseInt(hex.slice(5, 7), 16)
        return { r, g, b }
      }
      
      const avgColor = parseColor(c2) // Use middle color for overlays
      
      // Remove old style if exists
      const oldStyle = document.getElementById('custom-theme-gradient')
      if (oldStyle) {
        oldStyle.remove()
      }
      
      // Create new style
      const style = document.createElement('style')
      style.id = 'custom-theme-gradient'
      
      style.innerHTML = `
        /* Custom Theme Background */
        :root {
          --theme-gradient: linear-gradient(${angle}deg, ${c1} 0%, ${c2} 50%, ${c3} 100%);
          --theme-overlay-color: rgba(${avgColor.r}, ${avgColor.g}, ${avgColor.b}, 0.04);
        }
        
        .v-main.custom-theme-active {
          background: linear-gradient(${angle}deg, ${c1} 0%, ${c2} 50%, ${c3} 100%) !important;
          position: relative;
        }
        
        .v-main.custom-theme-active::before {
          content: '';
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: 
            radial-gradient(circle at 20% 80%, rgba(${avgColor.r}, ${avgColor.g}, ${avgColor.b}, 0.04) 0%, transparent 50%),
            radial-gradient(circle at 80% 20%, rgba(${avgColor.r}, ${avgColor.g}, ${avgColor.b}, 0.03) 0%, transparent 50%),
            radial-gradient(circle at 40% 40%, rgba(${avgColor.r}, ${avgColor.g}, ${avgColor.b}, 0.02) 0%, transparent 50%);
          pointer-events: none;
          z-index: 0;
        }
        
        .v-main.custom-theme-active::after {
          content: '';
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background-image:
            radial-gradient(circle at 2px 2px, rgba(${avgColor.r}, ${avgColor.g}, ${avgColor.b}, 0.02) 1px, transparent 0);
          background-size: 30px 30px;
          pointer-events: none;
          z-index: 0;
        }
      `
      document.head.appendChild(style)
      
      // Add class to v-main
      const mainElement = document.querySelector('.v-main')
      if (mainElement) {
        mainElement.classList.add('custom-theme-active')
      }
      
      // Dispatch event to notify other components
      window.dispatchEvent(new CustomEvent('theme-changed', {
        detail: {
          gradient: `linear-gradient(${angle}deg, ${c1} 0%, ${c2} 50%, ${c3} 100%)`,
          colors: { c1, c2, c3 },
          angle
        }
      }))
    }

    const applyPreset = (preset) => {
      const presets = {
        red: {
          gradientColor1: '#FFFFFF',
          gradientColor2: '#FFF5F5',
          gradientColor3: '#FFF0F0',
          gradientAngle: 135
        },
        blue: {
          gradientColor1: '#FFFFFF',
          gradientColor2: '#EFF6FF',
          gradientColor3: '#DBEAFE',
          gradientAngle: 135
        },
        green: {
          gradientColor1: '#FFFFFF',
          gradientColor2: '#F0FDF4',
          gradientColor3: '#DCFCE7',
          gradientAngle: 135
        },
        purple: {
          gradientColor1: '#FFFFFF',
          gradientColor2: '#FAF5FF',
          gradientColor3: '#F3E8FF',
          gradientAngle: 135
        },
        orange: {
          gradientColor1: '#FFFFFF',
          gradientColor2: '#FFF7ED',
          gradientColor3: '#FFEDD5',
          gradientAngle: 135
        }
      }
      
      themeSettings.value = { ...presets[preset] }
    }

    const resetToDefaultTheme = () => {
      // Remove custom theme from localStorage
      localStorage.removeItem('themeSettings')
      
      // Reset to default theme values
      themeSettings.value = {
        gradientColor1: '#FFFFFF',
        gradientColor2: '#FFF5F5',
        gradientColor3: '#FFEBEE',
        gradientAngle: 135
      }
      
      // Notify App.vue to apply default theme
      window.dispatchEvent(new CustomEvent('theme-changed'))
      
      // Notify user
      showSnackbar('Theme reset to default successfully!', 'success')
    }

    const saveModuleTitles = async () => {
      savingModuleTitles.value = true
      try {
        // Save to database via API
        const response = await companySettingService.updateModuleTitles(moduleTitles.value)
        
        // Update localStorage with new version
        localStorage.setItem('moduleTitles', JSON.stringify(moduleTitles.value))
        localStorage.setItem('settingsVersion', response.data.settings_version)
        
        // Dispatch event to update module titles across the app
        window.dispatchEvent(new CustomEvent('module-titles-updated', {
          detail: moduleTitles.value
        }))
        
        showSnackbar('Module titles saved successfully!', 'success')
      } catch (error) {
        console.error('Failed to save module titles:', error)
        showSnackbar(error.response?.data?.message || 'Failed to save module titles', 'error')
      } finally {
        savingModuleTitles.value = false
      }
    }

    const resetModuleTitles = () => {
      moduleTitles.value = {
        admin: {
          text: 'Admin Panel',
          color: '#B71C1C',
          badgeColor: '#D32F2F',
          subtitle: 'Manage multi-sport court bookings and oversee the entire system with professional precision'
        },
        courts: {
          text: 'Manage Courts',
          color: '#B71C1C',
          badgeColor: '#D32F2F',
          subtitle: 'Create, manage, and configure courts for all sports'
        },
        sports: {
          text: 'Manage Sports',
          color: '#B71C1C',
          badgeColor: '#D32F2F',
          subtitle: 'Configure available sports and their settings'
        },
        bookings: {
          text: 'My Bookings',
          color: '#B71C1C',
          badgeColor: '#D32F2F',
          subtitle: 'View and manage your court reservations'
        },
        users: {
          text: 'Manage Users',
          color: '#B71C1C',
          badgeColor: '#D32F2F',
          subtitle: 'Manage users, staff, and administrators'
        }
      }
      localStorage.removeItem('moduleTitles')
      showSnackbar('Module titles reset to default', 'success')
    }

    const showSnackbar = (message, color = 'success') => {
      snackbar.value = {
        show: true,
        message,
        color
      }
    }

    const onGcashQrChange = (event) => {
      const file = event?.target?.files ? event.target.files[0] : (paymentSettings.value.gcashQrFile && paymentSettings.value.gcashQrFile[0])
      if (!file) return
      const reader = new FileReader()
      reader.onload = (e) => paymentSettings.value.gcashQrPreview = e.target.result
      reader.readAsDataURL(file)
    }

    const savePaymentSettings = async () => {
      try {
        saving.value = true
        const payload = {
          company_name: companyName.value || 'Company',
          payment_gcash_number: paymentSettings.value.gcashNumber
        }
        if (paymentSettings.value.gcashQrFile && paymentSettings.value.gcashQrFile[0]) {
          payload.payment_gcash_qr = paymentSettings.value.gcashQrFile[0]
        }
        await companySettingService.updateSettings(payload)
        await loadSettings()
        showSnackbar('Payment settings saved successfully!', 'success')
      } catch (err) {
        console.error('Failed to save payment settings:', err)
        showSnackbar('Failed to save payment settings', 'error')
      } finally {
        saving.value = false
      }
    }

    // Watch for theme setting changes and apply in real-time
    watch(
      () => themeSettings.value,
      () => {
        applyTheme()
      },
      { deep: true }
    )

    onMounted(() => {
      loadSettings()
      // Apply saved theme on mount
      const savedTheme = localStorage.getItem('themeSettings')
      if (savedTheme) {
        applyTheme()
      }
    })

    return {
      activeTab,
      loading,
      saving,
      savingTheme,
      savingDashboard,
      formValid,
      companyName,
      logoFile,
      logoPreview,
      currentLogoUrl,
      themeSettings,
      dashboardSettings,
      moduleTitles,
      savingModuleTitles,
      snackbar,
      rules,
      previewGradient,
      handleFileChange,
      clearLogo,
      removeLogo,
      saveCompanySettings,
      saveThemeSettings,
      saveDashboardSettings,
      saveModuleTitles,
      resetModuleTitles,
      applyPreset,
      resetToDefaultTheme,
      showSnackbar,
      paymentSettings,
      onGcashQrChange,
      savePaymentSettings
    }
  }
}
</script>

<style scoped>
/* Company Settings Theme */
.company-settings {
  min-height: 100vh;
  padding: 32px;
  position: relative;
  z-index: 1;
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
  background: rgba(183, 28, 28, 0.1);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(183, 28, 28, 0.2);
  border-radius: 50px;
  padding: 8px 20px;
  margin-bottom: 24px;
  color: #B71C1C;
  font-weight: 600;
  font-size: 14px;
  letter-spacing: 0.5px;
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
  background: rgba(255, 255, 255, 0.95) !important;
  backdrop-filter: blur(20px);
  border-radius: 20px !important;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1) !important;
  border: 1px solid rgba(255, 255, 255, 0.2);
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  max-width: 1200px;
  margin: 0 auto;
}

.settings-card:hover {
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15) !important;
}

/* Logo Preview */
.logo-preview-container {
  margin-bottom: 16px;
}

.logo-preview-card {
  padding: 16px;
  background: #f8fafc;
  border-radius: 12px;
}

/* Color Picker */
.color-picker {
  width: 100%;
  height: 60px;
  border-radius: 8px;
  border: 2px solid #e2e8f0;
  cursor: pointer;
  transition: all 0.3s ease;
}

.color-picker:hover {
  border-color: #B71C1C;
  transform: scale(1.02);
}

/* Background Preview */
.bg-preview-container {
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  border: 2px solid #e2e8f0;
}

.bg-preview {
  min-height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 32px;
}

.bg-preview-content {
  text-align: center;
  background: rgba(255, 255, 255, 0.9);
  padding: 32px;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

/* Preset Buttons */
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

/* Module Titles Preview */
.preview-box {
  background: linear-gradient(135deg, #f5f5f5 0%, #ffffff 100%);
  border: 1px solid #e0e0e0;
}

.color-picker {
  width: 100%;
  height: 40px;
  border-radius: 8px;
  border: 2px solid #e0e0e0;
  cursor: pointer;
  transition: all 0.2s;
}

.color-picker:hover {
  border-color: #B71C1C;
  transform: scale(1.02);
}
</style>

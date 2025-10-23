<template>
  <div class="auth-container">
    <!-- Modern Sports Background -->
    <div class="sports-background">
      <div class="sports-overlay"></div>
      <div class="sports-pattern"></div>
    </div>

    <v-container fluid class="fill-height">
      <v-row align="center" justify="center" class="pa-2">
        <v-col cols="12" sm="10" md="8" lg="5" xl="4">
          <div class="auth-card">
            <div class="auth-header">
              <div class="header-badge">
                <v-icon color="white" size="20" class="mr-2">mdi-account-plus</v-icon>
                Join {{ companyName }}
              </div>
              <h1 class="auth-title">
                <span class="title-gradient">Create</span> Account
              </h1>
              <p class="auth-subtitle">Join {{ companyName }} court booking system</p>
            </div>

            <div class="auth-form">
              <v-form @submit.prevent="handleRegister">
                <v-row>
                  <v-col cols="12" sm="6">
                    <v-text-field
                      v-model="form.first_name"
                      label="First Name"
                      required
                      variant="outlined"
                      prepend-inner-icon="mdi-account"
                      class="form-field mb-4"
                      :error="!validations.firstName && form.first_name !== ''"
                    ></v-text-field>
                  </v-col>
                  <v-col cols="12" sm="6">
                    <v-text-field
                      v-model="form.last_name"
                      label="Last Name"
                      required
                      variant="outlined"
                      prepend-inner-icon="mdi-account"
                      class="form-field mb-4"
                      :error="!validations.lastName && form.last_name !== ''"
                    ></v-text-field>
                  </v-col>
                </v-row>

                <v-text-field
                  v-model="form.email"
                  label="Email"
                  type="email"
                  required
                  variant="outlined"
                  prepend-inner-icon="mdi-email"
                  class="form-field mb-4"
                  :error="!validations.email && form.email !== ''"
                ></v-text-field>

                <v-text-field
                  v-model="phoneDisplay"
                  label="Mobile Number"
                  type="tel"
                  required
                  variant="outlined"
                  prepend-inner-icon="mdi-phone"
                  class="form-field mb-4"
                  placeholder="+639178021376"
                  :error="!validations.phone && form.phone !== ''"
                  @input="handlePhoneInput"
                  maxlength="13"
                  hint="Format: +639XXXXXXXXX"
                  persistent-hint
                ></v-text-field>

                <v-text-field
                  v-model="form.password"
                  label="Password"
                  :type="showPassword ? 'text' : 'password'"
                  required
                  variant="outlined"
                  prepend-inner-icon="mdi-lock"
                  :append-inner-icon="showPassword ? 'mdi-eye' : 'mdi-eye-off'"
                  @click:append-inner="showPassword = !showPassword"
                  class="form-field mb-2"
                  :error="!validations.password && form.password !== ''"
                ></v-text-field>

                <v-text-field
                  v-model="form.password_confirmation"
                  label="Confirm Password"
                  :type="showPasswordConfirm ? 'text' : 'password'"
                  required
                  variant="outlined"
                  prepend-inner-icon="mdi-lock-check"
                  :append-inner-icon="showPasswordConfirm ? 'mdi-eye' : 'mdi-eye-off'"
                  @click:append-inner="showPasswordConfirm = !showPasswordConfirm"
                  class="form-field mb-2"
                  :error="!validations.passwordMatch && form.password_confirmation !== ''"
                ></v-text-field>

                <!-- Validation Requirements List -->
                <div class="validation-requirements mb-4">
                  <div class="requirements-header">
                    <v-icon size="18" class="mr-1">mdi-shield-check</v-icon>
                    <span>Registration Requirements</span>
                  </div>

                  <div class="requirements-list">
                    <!-- Name Requirements -->
                    <div class="requirement-item" :class="{ valid: validations.firstName, invalid: !validations.firstName && form.first_name }">
                      <v-icon :color="validations.firstName ? 'success' : (form.first_name ? 'error' : 'grey')">
                        {{ validations.firstName ? 'mdi-check-circle' : 'mdi-circle-outline' }}
                      </v-icon>
                      <span>First name (at least 2 characters)</span>
                    </div>

                    <div class="requirement-item" :class="{ valid: validations.lastName, invalid: !validations.lastName && form.last_name }">
                      <v-icon :color="validations.lastName ? 'success' : (form.last_name ? 'error' : 'grey')">
                        {{ validations.lastName ? 'mdi-check-circle' : 'mdi-circle-outline' }}
                      </v-icon>
                      <span>Last name (at least 2 characters)</span>
                    </div>

                    <!-- Email Requirements -->
                    <div class="requirement-item" :class="{ valid: validations.email, invalid: !validations.email && form.email }">
                      <v-icon :color="validations.email ? 'success' : (form.email ? 'error' : 'grey')">
                        {{ validations.email ? 'mdi-check-circle' : 'mdi-circle-outline' }}
                      </v-icon>
                      <span>Valid email address</span>
                    </div>

                    <!-- Phone Requirements -->
                    <div class="requirement-item" :class="{ valid: validations.phone, invalid: !validations.phone && form.phone }">
                      <v-icon :color="validations.phone ? 'success' : (form.phone ? 'error' : 'grey')">
                        {{ validations.phone ? 'mdi-check-circle' : 'mdi-circle-outline' }}
                      </v-icon>
                      <span>Mobile number (+639XXXXXXXXX format)</span>
                    </div>

                    <!-- Password Requirements -->
                    <div class="requirement-item" :class="{ valid: validations.password, invalid: !validations.password && form.password }">
                      <v-icon :color="validations.password ? 'success' : (form.password ? 'error' : 'grey')">
                        {{ validations.password ? 'mdi-check-circle' : 'mdi-circle-outline' }}
                      </v-icon>
                      <span>Password (at least 6 characters)</span>
                    </div>

                    <!-- Password Confirmation Requirements -->
                    <div class="requirement-item" :class="{ valid: validations.passwordMatch, invalid: !validations.passwordMatch && form.password_confirmation }">
                      <v-icon :color="validations.passwordMatch ? 'success' : (form.password_confirmation ? 'error' : 'grey')">
                        {{ validations.passwordMatch ? 'mdi-check-circle' : 'mdi-circle-outline' }}
                      </v-icon>
                      <span>Passwords match</span>
                    </div>
                  </div>
                </div>

                <v-alert
                  v-if="error"
                  type="error"
                  variant="tonal"
                  class="mb-4 error-alert"
                  closable
                  @click:close="error = ''"
                >
                  <div class="d-flex align-center">
                    <v-icon class="mr-2">mdi-alert-circle</v-icon>
                    <div>
                      <strong>Registration Failed</strong>
                      <div>{{ error }}</div>
                    </div>
                  </div>
                </v-alert>

                <v-btn
                  type="submit"
                  class="auth-btn-primary"
                  size="large"
                  block
                  :loading="loading"
                  :disabled="loading || !allValidationsPassed"
                  elevation="4"
                  @click.prevent="handleRegister"
                >
                  <v-icon class="mr-2">mdi-account-plus</v-icon>
                  Create Account
                </v-btn>

                <div class="auth-footer">
                  <p class="auth-link-text">
                    Already have an account?
                    <router-link to="/login" class="auth-link">
                      Sign in here
                    </router-link>
                  </p>
                </div>
              </v-form>
            </div>
          </div>
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { authService } from '../services/authService'
import { companySettingService } from '../services/companySettingService'

export default {
  name: 'Register',
  setup() {
    const router = useRouter()
    const form = ref({
      first_name: '',
      last_name: '',
      email: '',
      phone: '',
      password: '',
      password_confirmation: ''
    })
    const loading = ref(false)
    const error = ref('')
    const showPassword = ref(false)
    const showPasswordConfirm = ref(false)
    const companyName = ref('Perfect Smash')
    const phoneDisplay = ref('')

    // Phone number formatting handler
    const handlePhoneInput = (event) => {
      let value = event.target.value

      // Remove all non-numeric characters except +
      value = value.replace(/[^\d+]/g, '')

      // Ensure it starts with +63
      if (!value.startsWith('+63')) {
        if (value.startsWith('63')) {
          value = '+' + value
        } else if (value.startsWith('9')) {
          value = '+63' + value
        } else if (value.startsWith('+')) {
          value = '+63'
        } else if (value.length > 0 && value !== '+') {
          // If user starts typing any other number, prepend +63
          value = '+63' + value.replace(/\+/g, '')
        } else {
          value = '+63'
        }
      }

      // Limit to +63 followed by 10 digits (total 13 characters)
      if (value.length > 13) {
        value = value.substring(0, 13)
      }

      phoneDisplay.value = value
      form.value.phone = value
    }

    // Computed validations for real-time feedback
    const validations = computed(() => ({
      firstName: form.value.first_name && form.value.first_name.length >= 2,
      lastName: form.value.last_name && form.value.last_name.length >= 2,
      email: form.value.email && /.+@.+\..+/.test(form.value.email),
      phone: form.value.phone && form.value.phone.length === 13 && form.value.phone.startsWith('+639'),
      password: form.value.password && form.value.password.length >= 6,
      passwordMatch: form.value.password &&
                     form.value.password_confirmation &&
                     form.value.password === form.value.password_confirmation
    }))

    // Check if all validations pass
    const allValidationsPassed = computed(() => {
      return Object.values(validations.value).every(v => v === true)
    })

    const handleRegister = async (event) => {
      // Prevent default form submission behavior
      if (event) {
        event.preventDefault()
        event.stopPropagation()
      }

      // Check if all validations pass
      if (!allValidationsPassed.value) {
        error.value = 'Please complete all requirements before registering'
        return
      }

      try {
        loading.value = true
        error.value = ''

        const response = await authService.register({
          first_name: form.value.first_name,
          last_name: form.value.last_name,
          email: form.value.email,
          phone: form.value.phone,
          password: form.value.password,
          password_confirmation: form.value.password_confirmation
        })

        // Dispatch auth change event to update App.vue
        window.dispatchEvent(new CustomEvent('auth-changed', {
          detail: { user: response.user }
        }))

        router.push('/')
      } catch (err) {
        error.value = err.message
      } finally {
        loading.value = false
      }
    }

    const loadCompanySettings = async () => {
      try {
        const settings = await companySettingService.getSettings()
        if (settings.company_name) {
          companyName.value = settings.company_name
        }
      } catch (error) {
      }
    }

    onMounted(() => {
      loadCompanySettings()
    })

    return {
      form,
      loading,
      error,
      showPassword,
      showPasswordConfirm,
      companyName,
      phoneDisplay,
      validations,
      allValidationsPassed,
      handleRegister,
      handlePhoneInput
    }
  }
}
</script>

<style scoped>
/* Modern Sports Auth Theme */
.auth-container {
  background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
  min-height: 100vh;
  position: relative;
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

.fill-height {
  min-height: 100vh;
  display: flex;
  align-items: center;
  padding: 20px 0;
}

.v-container {
  max-width: 100%;
  overflow-x: hidden;
}

/* Auth Card */
.auth-card {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-radius: 24px;
  padding: 48px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.2);
  position: relative;
  z-index: 2;
  width: 100%;
  max-width: 100%;
  overflow-x: hidden;
}

/* Auth Header */
.auth-header {
  text-align: center;
  margin-bottom: 32px;
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

.auth-title {
  font-size: clamp(2rem, 4vw, 2.5rem);
  font-weight: 800;
  line-height: 1.1;
  margin-bottom: 16px;
  color: #1e293b;
}

.title-gradient {
  background: linear-gradient(135deg, #B71C1C 0%, #C62828 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.auth-subtitle {
  font-size: 1.1rem;
  color: #64748b;
  margin: 0;
  line-height: 1.6;
}

/* Auth Form */
.auth-form {
  margin-top: 24px;
}

.form-field {
  border-radius: 8px !important;
}

.form-field .v-messages__message {
  color: #64748b;
  font-size: 0.75rem;
  margin-top: 4px;
}

.auth-btn-primary {
  background: linear-gradient(135deg, #B71C1C 0%, #C62828 100%) !important;
  color: white !important;
  border-radius: 12px !important;
  font-weight: 700 !important;
  text-transform: none !important;
  padding: 16px 32px !important;
  box-shadow: 0 8px 25px rgba(183, 28, 28, 0.4) !important;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
}

.auth-btn-primary:hover {
  transform: translateY(-4px) !important;
  box-shadow: 0 12px 35px rgba(183, 28, 28, 0.6) !important;
}

/* Validation Requirements */
.validation-requirements {
  background: rgba(248, 250, 252, 0.8);
  backdrop-filter: blur(10px);
  border-radius: 12px;
  padding: 16px;
  border: 1px solid rgba(226, 232, 240, 0.8);
  max-width: 100%;
  overflow-x: hidden;
}

.requirements-header {
  display: flex;
  align-items: center;
  font-weight: 600;
  color: #475569;
  font-size: 0.9rem;
  margin-bottom: 12px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.requirements-list {
  display: grid;
  gap: 8px;
}

.requirements-list::-webkit-scrollbar {
  width: 6px;
}

.requirements-list::-webkit-scrollbar-track {
  background: rgba(226, 232, 240, 0.3);
  border-radius: 3px;
}

.requirements-list::-webkit-scrollbar-thumb {
  background: rgba(100, 116, 139, 0.4);
  border-radius: 3px;
}

.requirements-list::-webkit-scrollbar-thumb:hover {
  background: rgba(100, 116, 139, 0.6);
}

.requirement-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  border-radius: 8px;
  background: white;
  border: 1px solid #e2e8f0;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  font-size: 0.9rem;
}

.requirement-item.valid {
  background: rgba(16, 185, 129, 0.05);
  border-color: rgba(16, 185, 129, 0.3);
  color: #059669;
}

.requirement-item.invalid {
  background: rgba(239, 68, 68, 0.05);
  border-color: rgba(239, 68, 68, 0.3);
  color: #dc2626;
}

.requirement-item span {
  flex: 1;
  font-weight: 500;
  word-break: break-word;
  line-height: 1.4;
}

.requirement-item .v-icon {
  flex-shrink: 0;
  transition: transform 0.3s ease;
}

.requirement-item.valid .v-icon {
  transform: scale(1.1);
}

/* Error Alert */
.error-alert {
  border-radius: 12px !important;
  border-left: 4px solid #dc2626 !important;
  animation: slideIn 0.3s ease-out;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Auth Footer */
.auth-footer {
  text-align: center;
  margin-top: 24px;
}

.auth-link-text {
  color: #64748b;
  font-size: 0.95rem;
  margin: 0;
}

.auth-link {
  color: #B71C1C;
  text-decoration: none;
  font-weight: 600;
  transition: color 0.3s ease;
}

.auth-link:hover {
  color: #C62828;
  text-decoration: underline;
}

/* Responsive Design */
@media (max-width: 960px) {
  .auth-card {
    padding: 40px 32px;
  }

  .auth-title {
    font-size: 2rem;
  }

  .auth-subtitle {
    font-size: 1rem;
  }

  .requirements-header {
    font-size: 0.85rem;
  }

  .requirement-item {
    font-size: 0.85rem;
    padding: 6px 10px;
  }
}

@media (max-width: 768px) {
  .auth-card {
    padding: 32px 24px;
    margin: 0;
    border-radius: 20px;
  }

  .auth-title {
    font-size: 1.8rem;
  }

  .auth-subtitle {
    font-size: 0.95rem;
  }

  .header-badge {
    font-size: 0.8rem;
    padding: 6px 16px;
  }

  .header-badge .v-icon {
    font-size: 18px !important;
  }

  .validation-requirements {
    padding: 14px;
  }

  .requirements-header {
    font-size: 0.8rem;
    margin-bottom: 10px;
  }

  .requirement-item {
    font-size: 0.8rem;
    padding: 6px 8px;
    gap: 6px;
  }

  .requirement-item .v-icon {
    font-size: 18px !important;
  }
}

@media (max-width: 600px) {
  .fill-height {
    min-height: auto;
    padding: 16px 0;
  }

  .auth-card {
    padding: 24px 20px;
    border-radius: 16px;
  }

  .auth-header {
    margin-bottom: 24px;
  }

  .header-badge {
    font-size: 0.75rem;
    padding: 6px 14px;
    margin-bottom: 16px;
  }

  .auth-title {
    font-size: 1.6rem;
    margin-bottom: 12px;
  }

  .auth-subtitle {
    font-size: 0.9rem;
  }

  .validation-requirements {
    padding: 12px;
    border-radius: 10px;
  }

  .requirements-header {
    font-size: 0.75rem;
    margin-bottom: 8px;
  }

  .requirements-list {
    gap: 6px;
  }

  .requirement-item {
    font-size: 0.75rem;
    padding: 5px 8px;
    gap: 6px;
  }

  .requirement-item .v-icon {
    font-size: 16px !important;
  }

  .auth-btn-primary {
    font-size: 0.95rem !important;
  }

  .auth-footer {
    margin-top: 20px;
  }

  .auth-link-text {
    font-size: 0.85rem;
  }
}

@media (max-width: 480px) {
  .auth-container {
    background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
  }

  .auth-card {
    padding: 20px 16px;
    margin: 0;
    border-radius: 12px;
  }

  .auth-header {
    margin-bottom: 20px;
  }

  .header-badge {
    font-size: 0.7rem;
    padding: 5px 12px;
    margin-bottom: 14px;
  }

  .header-badge .v-icon {
    font-size: 16px !important;
  }

  .auth-title {
    font-size: 1.4rem;
    margin-bottom: 10px;
  }

  .auth-subtitle {
    font-size: 0.85rem;
    line-height: 1.5;
  }

  .form-field {
    margin-bottom: 12px !important;
  }

  .form-field .v-messages__message {
    font-size: 0.7rem;
  }

  .validation-requirements {
    padding: 10px;
    border-radius: 8px;
    margin-bottom: 16px !important;
  }

  .requirements-header {
    font-size: 0.7rem;
    margin-bottom: 8px;
  }

  .requirements-header .v-icon {
    font-size: 14px !important;
  }

  .requirements-list {
    gap: 5px;
  }

  .requirement-item {
    font-size: 0.7rem;
    padding: 4px 6px;
    gap: 5px;
    border-radius: 6px;
  }

  .requirement-item .v-icon {
    font-size: 14px !important;
  }

  .auth-btn-primary {
    font-size: 0.9rem !important;
    padding: 14px 24px !important;
  }

  .auth-footer {
    margin-top: 16px;
  }

  .auth-link-text {
    font-size: 0.8rem;
  }
}

@media (max-width: 360px) {
  .auth-card {
    padding: 16px 12px;
  }

  .auth-title {
    font-size: 1.25rem;
  }

  .auth-subtitle {
    font-size: 0.8rem;
  }

  .validation-requirements {
    padding: 8px;
  }

  .requirement-item {
    font-size: 0.65rem;
    padding: 4px 5px;
  }

  .requirement-item .v-icon {
    font-size: 12px !important;
  }

  .form-field .v-messages__message {
    font-size: 0.65rem;
  }
}

/* Landscape Mobile */
@media (max-height: 600px) and (orientation: landscape) {
  .fill-height {
    min-height: auto;
    padding: 8px 0;
  }

  .auth-card {
    padding: 20px 24px;
    margin: 0;
  }

  .auth-header {
    margin-bottom: 16px;
  }

  .header-badge {
    margin-bottom: 8px;
    padding: 4px 12px;
  }

  .auth-title {
    font-size: 1.4rem;
    margin-bottom: 8px;
  }

  .auth-subtitle {
    font-size: 0.85rem;
  }

  .form-field {
    margin-bottom: 8px !important;
  }

  .validation-requirements {
    padding: 10px;
    margin-bottom: 12px !important;
  }

  .requirements-header {
    margin-bottom: 6px;
  }

  .requirements-list {
    gap: 4px;
    max-height: 150px;
    overflow-y: auto;
  }

  .requirement-item {
    padding: 4px 8px;
  }

  .auth-btn-primary {
    padding: 12px 24px !important;
  }

  .auth-footer {
    margin-top: 12px;
  }
}
</style>
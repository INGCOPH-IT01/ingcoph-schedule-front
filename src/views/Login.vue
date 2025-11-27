<template>
  <div class="auth-container">
    <!-- Modern Sports Background -->
    <div class="sports-background">
      <div class="sports-overlay"></div>
      <div class="sports-pattern"></div>
    </div>

    <v-container fluid class="fill-height">
      <v-row align="center" justify="center">
        <v-col cols="12" sm="8" md="6" lg="4">
          <div class="auth-card">
            <div class="auth-header">
              <div class="header-badge">
                <v-icon color="white" size="20" class="mr-2">mdi-shield-lock</v-icon>
                Secure Access
              </div>
              <h1 class="auth-title">
                <span class="title-gradient">Welcome</span> Back
              </h1>
              <p class="auth-subtitle">Sign in to {{ companyName }}</p>
            </div>

            <div class="auth-form">
              <!-- Login Form -->
              <v-form v-if="!showForgotPassword" ref="loginForm" @submit.prevent="handleLogin">
                <v-text-field
                  v-model="form.email"
                  label="Email"
                  type="email"
                  :rules="emailRules"
                  required
                  variant="outlined"
                  prepend-inner-icon="mdi-email"
                  class="form-field mb-4"
                ></v-text-field>

                <v-text-field
                  v-model="form.password"
                  label="Password"
                  :type="showPassword ? 'text' : 'password'"
                  :rules="passwordRules"
                  required
                  variant="outlined"
                  prepend-inner-icon="mdi-lock"
                  :append-inner-icon="showPassword ? 'mdi-eye' : 'mdi-eye-off'"
                  @click:append-inner="showPassword = !showPassword"
                  class="form-field mb-4"
                ></v-text-field>

                <div class="d-flex justify-space-between align-center mb-4">
                  <v-checkbox
                    v-model="form.remember"
                    label="Remember me"
                    color="primary"
                    density="compact"
                    hide-details
                  ></v-checkbox>
                  <a
                    href="#"
                    @click.prevent="showForgotPasswordForm"
                    class="forgot-password-link"
                  >
                    Forgot Password?
                  </a>
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
                      <strong>Login Failed</strong>
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
                  :disabled="loading"
                  elevation="4"
                >
                  <v-icon class="mr-2">mdi-login</v-icon>
                  Sign In
                </v-btn>

                <div class="auth-footer">
                  <p class="auth-link-text">
                    Don't have an account?
                    <router-link to="/register" class="auth-link">
                      Sign up here
                    </router-link>
                  </p>
                </div>
              </v-form>

              <!-- Forgot Password Multi-Step Form -->
              <div v-else>
                <!-- Step 1: Enter Email -->
                <v-form v-if="forgotPasswordStep === 1" ref="emailForm" @submit.prevent="sendOtp">
                  <div class="mb-4">
                    <v-btn
                      icon
                      size="small"
                      variant="text"
                      @click="backToLogin"
                      class="mb-2"
                    >
                      <v-icon>mdi-arrow-left</v-icon>
                    </v-btn>
                    <h2 class="forgot-password-title">Forgot Password?</h2>
                    <p class="forgot-password-subtitle">
                      Enter your email address and we'll send you an OTP to reset your password.
                    </p>
                  </div>

                  <v-text-field
                    v-model="forgotPasswordForm.email"
                    label="Email Address"
                    type="email"
                    :rules="emailRules"
                    required
                    variant="outlined"
                    prepend-inner-icon="mdi-email"
                    class="form-field mb-4"
                  ></v-text-field>

                  <v-alert
                    v-if="successMessage"
                    type="success"
                    variant="tonal"
                    class="mb-4"
                  >
                    {{ successMessage }}
                  </v-alert>

                  <v-alert
                    v-if="error"
                    type="error"
                    variant="tonal"
                    class="mb-4 error-alert"
                    closable
                    @click:close="error = ''"
                  >
                    {{ error }}
                  </v-alert>

                  <v-btn
                    type="submit"
                    class="auth-btn-primary"
                    size="large"
                    block
                    :loading="loading"
                    :disabled="loading"
                    elevation="4"
                  >
                    <v-icon class="mr-2">mdi-email-send</v-icon>
                    Send OTP
                  </v-btn>
                </v-form>

                <!-- Step 2: Verify OTP -->
                <v-form v-if="forgotPasswordStep === 2" ref="otpForm" @submit.prevent="verifyOtp">
                  <div class="mb-4">
                    <v-btn
                      icon
                      size="small"
                      variant="text"
                      @click="forgotPasswordStep = 1"
                      class="mb-2"
                    >
                      <v-icon>mdi-arrow-left</v-icon>
                    </v-btn>
                    <h2 class="forgot-password-title">Verify OTP</h2>
                    <p class="forgot-password-subtitle">
                      Enter the 6-digit OTP sent to {{ forgotPasswordForm.email }}
                    </p>
                  </div>

                  <v-text-field
                    v-model="forgotPasswordForm.otp"
                    label="6-Digit OTP"
                    type="text"
                    maxlength="6"
                    :rules="otpRules"
                    required
                    variant="outlined"
                    prepend-inner-icon="mdi-numeric"
                    class="form-field mb-4"
                    @input="formatOtpInput"
                  ></v-text-field>

                  <v-alert
                    v-if="error"
                    type="error"
                    variant="tonal"
                    class="mb-4 error-alert"
                    closable
                    @click:close="error = ''"
                  >
                    {{ error }}
                  </v-alert>

                  <v-btn
                    type="submit"
                    class="auth-btn-primary"
                    size="large"
                    block
                    :loading="loading"
                    :disabled="loading"
                    elevation="4"
                  >
                    <v-icon class="mr-2">mdi-check-circle</v-icon>
                    Verify OTP
                  </v-btn>

                  <div class="text-center mt-3">
                    <a
                      href="#"
                      @click.prevent="resendOtp"
                      class="resend-link"
                      :class="{ 'disabled': resendCooldown > 0 }"
                    >
                      {{ resendCooldown > 0 ? `Resend OTP in ${resendCooldown}s` : 'Resend OTP' }}
                    </a>
                  </div>
                </v-form>

                <!-- Step 3: Reset Password -->
                <v-form v-if="forgotPasswordStep === 3" ref="resetForm" @submit.prevent="resetPassword">
                  <div class="mb-4">
                    <h2 class="forgot-password-title">Set New Password</h2>
                    <p class="forgot-password-subtitle">
                      Enter your new password below
                    </p>
                  </div>

                  <v-text-field
                    v-model="forgotPasswordForm.password"
                    label="New Password"
                    :type="showNewPassword ? 'text' : 'password'"
                    :rules="passwordRules"
                    required
                    variant="outlined"
                    prepend-inner-icon="mdi-lock"
                    :append-inner-icon="showNewPassword ? 'mdi-eye' : 'mdi-eye-off'"
                    @click:append-inner="showNewPassword = !showNewPassword"
                    class="form-field mb-4"
                  ></v-text-field>

                  <v-text-field
                    v-model="forgotPasswordForm.password_confirmation"
                    label="Confirm New Password"
                    :type="showConfirmPassword ? 'text' : 'password'"
                    :rules="confirmPasswordRules"
                    required
                    variant="outlined"
                    prepend-inner-icon="mdi-lock-check"
                    :append-inner-icon="showConfirmPassword ? 'mdi-eye' : 'mdi-eye-off'"
                    @click:append-inner="showConfirmPassword = !showConfirmPassword"
                    class="form-field mb-4"
                  ></v-text-field>

                  <v-alert
                    v-if="successMessage"
                    type="success"
                    variant="tonal"
                    class="mb-4"
                  >
                    {{ successMessage }}
                  </v-alert>

                  <v-alert
                    v-if="error"
                    type="error"
                    variant="tonal"
                    class="mb-4 error-alert"
                    closable
                    @click:close="error = ''"
                  >
                    {{ error }}
                  </v-alert>

                  <v-btn
                    type="submit"
                    class="auth-btn-primary"
                    size="large"
                    block
                    :loading="loading"
                    :disabled="loading"
                    elevation="4"
                  >
                    <v-icon class="mr-2">mdi-lock-reset</v-icon>
                    Reset Password
                  </v-btn>
                </v-form>
              </div>
            </div>
          </div>
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>

<script>
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { authService } from '../services/authService'
import { companySettingService } from '../services/companySettingService'

export default {
  name: 'Login',
  setup() {
    const router = useRouter()
    const loginForm = ref(null)
    const emailForm = ref(null)
    const otpForm = ref(null)
    const resetForm = ref(null)

    const form = ref({
      email: '',
      password: '',
      remember: false
    })

    // Forgot Password state
    const showForgotPassword = ref(false)
    const forgotPasswordStep = ref(1) // 1: Email, 2: OTP, 3: Reset Password
    const forgotPasswordForm = ref({
      email: '',
      otp: '',
      password: '',
      password_confirmation: ''
    })

    const loading = ref(false)
    const error = ref('')
    const successMessage = ref('')
    const showPassword = ref(false)
    const showNewPassword = ref(false)
    const showConfirmPassword = ref(false)
    const companyName = ref('Perfect Smash')
    const resendCooldown = ref(0)
    let resendTimer = null

    const emailRules = [
      v => !!v || 'Email is required',
      v => /.+@.+\..+/.test(v) || 'Email must be valid'
    ]

    const passwordRules = [
      v => !!v || 'Password is required',
      v => v.length >= 6 || 'Password must be at least 6 characters'
    ]

    const otpRules = [
      v => !!v || 'OTP is required',
      v => /^\d{6}$/.test(v) || 'OTP must be 6 digits'
    ]

    const confirmPasswordRules = computed(() => [
      v => !!v || 'Please confirm your password',
      v => v === forgotPasswordForm.value.password || 'Passwords do not match'
    ])

    const handleLogin = async () => {
      try {
        loading.value = true
        error.value = ''

        // Validate form before submission
        const { valid } = await loginForm.value.validate()
        if (!valid) {
          error.value = 'Please fill in all required fields correctly'
          return
        }

        const response = await authService.login({
          email: form.value.email,
          password: form.value.password
        })

        if(response.user) {
          router.push('/')
        }

        // Dispatch auth change event to update App.vue
        window.dispatchEvent(new CustomEvent('auth-changed', {
          detail: { user: response.user }
        }))

      } catch (err) {
        error.value = err.message
      } finally {
        loading.value = false
      }
    }

    // Forgot Password Functions
    const showForgotPasswordForm = () => {
      showForgotPassword.value = true
      forgotPasswordStep.value = 1
      error.value = ''
      successMessage.value = ''
      forgotPasswordForm.value = {
        email: '',
        otp: '',
        password: '',
        password_confirmation: ''
      }
    }

    const backToLogin = () => {
      showForgotPassword.value = false
      forgotPasswordStep.value = 1
      error.value = ''
      successMessage.value = ''
      if (resendTimer) {
        clearInterval(resendTimer)
        resendTimer = null
      }
      resendCooldown.value = 0
    }

    const sendOtp = async () => {
      try {
        loading.value = true
        error.value = ''
        successMessage.value = ''

        // Validate form before submission
        const { valid } = await emailForm.value.validate()
        if (!valid) {
          error.value = 'Please enter a valid email address'
          return
        }

        await authService.sendPasswordResetOtp(forgotPasswordForm.value.email)

        successMessage.value = 'OTP sent successfully! Please check your email.'

        // Move to OTP verification step after 2 seconds
        setTimeout(() => {
          forgotPasswordStep.value = 2
          successMessage.value = ''
          startResendCooldown()
        }, 2000)

      } catch (err) {
        error.value = err.message || 'Failed to send OTP. Please try again.'
      } finally {
        loading.value = false
      }
    }

    const verifyOtp = async () => {
      try {
        loading.value = true
        error.value = ''

        // Validate form before submission
        const { valid } = await otpForm.value.validate()
        if (!valid) {
          error.value = 'Please enter a valid 6-digit OTP'
          return
        }

        await authService.verifyPasswordResetOtp(
          forgotPasswordForm.value.email,
          forgotPasswordForm.value.otp
        )

        // Move to reset password step
        forgotPasswordStep.value = 3
        if (resendTimer) {
          clearInterval(resendTimer)
          resendTimer = null
        }
        resendCooldown.value = 0

      } catch (err) {
        error.value = err.message || 'Invalid OTP. Please try again.'
      } finally {
        loading.value = false
      }
    }

    const resetPassword = async () => {
      try {
        loading.value = true
        error.value = ''
        successMessage.value = ''

        // Validate form before submission
        const { valid } = await resetForm.value.validate()
        if (!valid) {
          error.value = 'Please fill in all required fields correctly'
          return
        }

        if (forgotPasswordForm.value.password !== forgotPasswordForm.value.password_confirmation) {
          error.value = 'Passwords do not match'
          return
        }

        // First reset the password
        await authService.resetPassword(
          forgotPasswordForm.value.email,
          forgotPasswordForm.value.otp,
          forgotPasswordForm.value.password,
          forgotPasswordForm.value.password_confirmation
        )

        successMessage.value = 'Password reset successfully! Logging you in...'

        // Wait a moment to show the success message
        await new Promise(resolve => setTimeout(resolve, 1500))

        // Now log in with the new credentials
        const loginResponse = await authService.login({
          email: forgotPasswordForm.value.email,
          password: forgotPasswordForm.value.password
        })

        if (loginResponse.user) {
          // Dispatch auth change event to update App.vue
          window.dispatchEvent(new CustomEvent('auth-changed', {
            detail: { user: loginResponse.user }
          }))

          successMessage.value = 'Login successful! Redirecting to home...'

          // Redirect to home after brief delay
          setTimeout(() => {
            router.push('/')
          }, 1000)
        }

      } catch (err) {
        error.value = err.message || 'Failed to reset password. Please try again.'
      } finally {
        loading.value = false
      }
    }

    const resendOtp = async () => {
      if (resendCooldown.value > 0) return

      try {
        loading.value = true
        error.value = ''
        successMessage.value = ''

        await authService.sendPasswordResetOtp(forgotPasswordForm.value.email)

        successMessage.value = 'OTP resent successfully!'
        setTimeout(() => {
          successMessage.value = ''
        }, 3000)

        startResendCooldown()

      } catch (err) {
        error.value = err.message || 'Failed to resend OTP. Please try again.'
      } finally {
        loading.value = false
      }
    }

    const startResendCooldown = () => {
      resendCooldown.value = 60 // 60 seconds cooldown
      if (resendTimer) {
        clearInterval(resendTimer)
      }
      resendTimer = setInterval(() => {
        resendCooldown.value--
        if (resendCooldown.value <= 0) {
          clearInterval(resendTimer)
          resendTimer = null
        }
      }, 1000)
    }

    const formatOtpInput = () => {
      // Only allow digits in OTP field
      forgotPasswordForm.value.otp = forgotPasswordForm.value.otp.replace(/\D/g, '')
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

    onUnmounted(() => {
      if (resendTimer) {
        clearInterval(resendTimer)
      }
    })

    return {
      loginForm,
      emailForm,
      otpForm,
      resetForm,
      form,
      forgotPasswordForm,
      loading,
      error,
      successMessage,
      showPassword,
      showNewPassword,
      showConfirmPassword,
      companyName,
      showForgotPassword,
      forgotPasswordStep,
      resendCooldown,
      emailRules,
      passwordRules,
      otpRules,
      confirmPasswordRules,
      handleLogin,
      showForgotPasswordForm,
      backToLogin,
      sendOtp,
      verifyOtp,
      resetPassword,
      resendOtp,
      formatOtpInput
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

/* Forgot Password Link */
.forgot-password-link {
  color: #B71C1C;
  text-decoration: none;
  font-weight: 600;
  font-size: 0.9rem;
  transition: color 0.3s ease;
}

.forgot-password-link:hover {
  color: #C62828;
  text-decoration: underline;
}

/* Forgot Password Form */
.forgot-password-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 8px;
}

.forgot-password-subtitle {
  font-size: 0.95rem;
  color: #64748b;
  line-height: 1.6;
}

/* Resend Link */
.resend-link {
  color: #B71C1C;
  text-decoration: none;
  font-weight: 600;
  font-size: 0.9rem;
  transition: color 0.3s ease;
}

.resend-link:hover:not(.disabled) {
  color: #C62828;
  text-decoration: underline;
}

.resend-link.disabled {
  color: #94a3b8;
  cursor: not-allowed;
  pointer-events: none;
}

/* Responsive Design */
@media (max-width: 768px) {
  .auth-card {
    padding: 32px 24px;
    margin: 16px;
  }

  .auth-title {
    font-size: 1.8rem;
  }
}

@media (max-width: 480px) {
  .auth-card {
    padding: 24px 16px;
    margin: 12px;
  }

  .auth-title {
    font-size: 1.5rem;
  }
}
</style>
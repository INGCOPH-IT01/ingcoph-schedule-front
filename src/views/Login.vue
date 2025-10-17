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
              <p class="auth-subtitle">Sign in to Perfect Smash</p>
            </div>

            <div class="auth-form">
              <v-form ref="loginForm" @submit.prevent="handleLogin">
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

                <v-checkbox
                  v-model="form.remember"
                  label="Remember me"
                  color="primary"
                  class="mb-4"
                ></v-checkbox>

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
            </div>
          </div>
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>

<script>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { authService } from '../services/authService'

export default {
  name: 'Login',
  setup() {
    const router = useRouter()
    const loginForm = ref(null)
    const form = ref({
      email: '',
      password: '',
      remember: false
    })
    const loading = ref(false)
    const error = ref('')
    const showPassword = ref(false)

    const emailRules = [
      v => !!v || 'Email is required',
      v => /.+@.+\..+/.test(v) || 'Email must be valid'
    ]

    const passwordRules = [
      v => !!v || 'Password is required',
      v => v.length >= 6 || 'Password must be at least 6 characters'
    ]

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
        console.error('Login error in component:', err)
        error.value = err.message
      } finally {
        loading.value = false
      }
    }

    return {
      loginForm,
      form,
      loading,
      error,
      showPassword,
      emailRules,
      passwordRules,
      handleLogin
    }
  }
}
</script>

<style scoped>
/* Modern Sports Auth Theme */
.auth-container {
  background: transparent;
  min-height: 100vh;
  position: relative;
  z-index: 1;
}

/* Enhanced Background */
.sports-background,
.sports-overlay,
.sports-pattern {
  display: none;
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
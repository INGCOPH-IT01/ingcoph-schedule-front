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
                <v-icon color="white" size="20" class="mr-2">mdi-account-plus</v-icon>
                Join Champions
              </div>
              <h1 class="auth-title">
                <span class="title-gradient">Create</span> Account
              </h1>
              <p class="auth-subtitle">Join our champion court scheduling system</p>
            </div>

            <div class="auth-form">
              <v-form @submit.prevent="handleRegister">
                <v-text-field
                  v-model="form.name"
                  label="Full Name"
                  :rules="nameRules"
                  required
                  variant="outlined"
                  prepend-inner-icon="mdi-account"
                  class="form-field mb-4"
                ></v-text-field>

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

                <v-text-field
                  v-model="form.password_confirmation"
                  label="Confirm Password"
                  :type="showPasswordConfirm ? 'text' : 'password'"
                  :rules="confirmPasswordRules"
                  required
                  variant="outlined"
                  prepend-inner-icon="mdi-lock-check"
                  :append-inner-icon="showPasswordConfirm ? 'mdi-eye' : 'mdi-eye-off'"
                  @click:append-inner="showPasswordConfirm = !showPasswordConfirm"
                  class="form-field mb-4"
                ></v-text-field>

                <v-select
                  v-model="form.role"
                  :items="roleOptions"
                  label="Account Type"
                  variant="outlined"
                  prepend-inner-icon="mdi-account-cog"
                  :rules="[v => !!v || 'Please select account type']"
                  class="form-field mb-4"
                ></v-select>

                <v-checkbox
                  v-model="form.terms"
                  :rules="[v => !!v || 'You must agree to the terms']"
                  color="primary"
                  class="mb-4"
                >
                  <template v-slot:label>
                    <span class="terms-text">
                      I agree to the
                      <a href="#" class="terms-link">Terms of Service</a>
                      and
                      <a href="#" class="terms-link">Privacy Policy</a>
                    </span>
                  </template>
                </v-checkbox>

                <v-alert
                  v-if="error"
                  type="error"
                  variant="tonal"
                  class="mb-4"
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
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { authService } from '../services/authService'

export default {
  name: 'Register',
  setup() {
    const router = useRouter()
    const form = ref({
      name: '',
      email: '',
      password: '',
      password_confirmation: '',
      role: 'user',
      terms: false
    })
    const loading = ref(false)
    const error = ref('')
    const showPassword = ref(false)
    const showPasswordConfirm = ref(false)

    const roleOptions = [
      { title: 'Player', value: 'user' },
      { title: 'Staff (Can scan QR codes)', value: 'staff' }
    ]

    const nameRules = [
      v => !!v || 'Name is required',
      v => v.length >= 2 || 'Name must be at least 2 characters'
    ]

    const emailRules = [
      v => !!v || 'Email is required',
      v => /.+@.+\..+/.test(v) || 'Email must be valid'
    ]

    const passwordRules = [
      v => !!v || 'Password is required',
      v => v.length >= 6 || 'Password must be at least 6 characters'
    ]

    const confirmPasswordRules = computed(() => [
      v => !!v || 'Password confirmation is required',
      v => v === form.value.password || 'Passwords do not match'
    ])

    const handleRegister = async () => {
      try {
        loading.value = true
        error.value = ''
        
        const response = await authService.register({
          name: form.value.name,
          email: form.value.email,
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

    return {
      form,
      loading,
      error,
      showPassword,
      showPasswordConfirm,
      roleOptions,
      nameRules,
      emailRules,
      passwordRules,
      confirmPasswordRules,
      handleRegister
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
  background: rgba(16, 185, 129, 0.1);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(16, 185, 129, 0.2);
  border-radius: 50px;
  padding: 8px 20px;
  margin-bottom: 24px;
  color: #10b981;
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
  background: linear-gradient(135deg, #3b82f6 0%, #10b981 100%);
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
  background: linear-gradient(135deg, #10b981 0%, #059669 100%) !important;
  color: white !important;
  border-radius: 12px !important;
  font-weight: 700 !important;
  text-transform: none !important;
  padding: 16px 32px !important;
  box-shadow: 0 8px 25px rgba(16, 185, 129, 0.4) !important;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
}

.auth-btn-primary:hover {
  transform: translateY(-4px) !important;
  box-shadow: 0 12px 35px rgba(16, 185, 129, 0.6) !important;
}

/* Terms Text */
.terms-text {
  color: #64748b;
  font-size: 0.9rem;
}

.terms-link {
  color: #3b82f6;
  text-decoration: none;
  font-weight: 600;
  transition: color 0.3s ease;
}

.terms-link:hover {
  color: #1d4ed8;
  text-decoration: underline;
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
  color: #3b82f6;
  text-decoration: none;
  font-weight: 600;
  transition: color 0.3s ease;
}

.auth-link:hover {
  color: #1d4ed8;
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
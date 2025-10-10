<template>
  <v-container fluid class="profile-container">
    <!-- Header -->
    <div class="page-header">
      <div class="header-content">
        <v-avatar
          :image="`https://ui-avatars.com/api/?name=${user?.name || 'User'}&background=3b82f6&color=fff&size=128`"
          size="80"
          class="mr-4"
        ></v-avatar>
        <div>
          <h1 class="page-title">My Profile</h1>
          <p class="page-subtitle">Update your personal information</p>
        </div>
      </div>
    </div>

    <v-row>
      <!-- Profile Information Card -->
      <v-col cols="12" md="8">
        <v-card elevation="4" class="profile-card">
          <v-card-title class="card-header">
            <v-icon class="mr-2">mdi-account-edit</v-icon>
            Personal Information
          </v-card-title>

          <v-card-text class="pa-6">
            <v-form ref="formRef">
              <v-row>
                <v-col cols="12" md="6">
                  <v-text-field
                    v-model="formData.name"
                    label="Full Name"
                    :rules="[v => !!v || 'Name is required']"
                    variant="outlined"
                    prepend-inner-icon="mdi-account"
                    :disabled="updating"
                  ></v-text-field>
                </v-col>

                <v-col cols="12" md="6">
                  <v-text-field
                    v-model="formData.email"
                    label="Email"
                    type="email"
                    :rules="[v => !!v || 'Email is required', v => /.+@.+\..+/.test(v) || 'Email must be valid']"
                    variant="outlined"
                    prepend-inner-icon="mdi-email"
                    :disabled="updating"
                  ></v-text-field>
                </v-col>

                <v-col cols="12" md="6">
                  <v-text-field
                    v-model="formData.phone"
                    label="Mobile Number"
                    type="tel"
                    :rules="[v => !!v || 'Mobile number is required']"
                    variant="outlined"
                    prepend-inner-icon="mdi-phone"
                    :disabled="updating"
                  ></v-text-field>
                </v-col>

                <v-col cols="12" md="6">
                  <v-chip
                    :color="getUserTypeColor(user?.role)"
                    size="large"
                    variant="flat"
                    class="mt-2"
                  >
                    <v-icon start>{{ getUserTypeIcon(user?.role) }}</v-icon>
                    {{ user?.role || 'User' }}
                  </v-chip>
                </v-col>
              </v-row>

              <v-divider class="my-6"></v-divider>

              <div class="mb-4">
                <v-btn
                  variant="text"
                  color="primary"
                  @click="showPasswordSection = !showPasswordSection"
                  prepend-icon="mdi-lock-reset"
                >
                  {{ showPasswordSection ? 'Hide' : 'Change Password' }}
                </v-btn>
              </div>

              <v-expand-transition>
                <div v-if="showPasswordSection">
                  <v-alert
                    type="info"
                    variant="tonal"
                    class="mb-4"
                    text="Leave password fields blank if you don't want to change your password"
                  ></v-alert>

                  <v-row>
                    <v-col cols="12" md="6">
                      <v-text-field
                        v-model="formData.current_password"
                        label="Current Password"
                        :type="showCurrentPassword ? 'text' : 'password'"
                        variant="outlined"
                        prepend-inner-icon="mdi-lock"
                        :append-inner-icon="showCurrentPassword ? 'mdi-eye' : 'mdi-eye-off'"
                        @click:append-inner="showCurrentPassword = !showCurrentPassword"
                        :disabled="updating"
                      ></v-text-field>
                    </v-col>

                    <v-col cols="12" md="6"></v-col>

                    <v-col cols="12" md="6">
                      <v-text-field
                        v-model="formData.password"
                        label="New Password"
                        :type="showPassword ? 'text' : 'password'"
                        :rules="formData.password ? [v => v.length >= 8 || 'Password must be at least 8 characters'] : []"
                        variant="outlined"
                        prepend-inner-icon="mdi-lock-plus"
                        :append-inner-icon="showPassword ? 'mdi-eye' : 'mdi-eye-off'"
                        @click:append-inner="showPassword = !showPassword"
                        :disabled="updating"
                      ></v-text-field>
                    </v-col>

                    <v-col cols="12" md="6">
                      <v-text-field
                        v-model="formData.password_confirmation"
                        label="Confirm New Password"
                        :type="showPasswordConfirm ? 'text' : 'password'"
                        :rules="formData.password ? [v => v === formData.password || 'Passwords do not match'] : []"
                        variant="outlined"
                        prepend-inner-icon="mdi-lock-check"
                        :append-inner-icon="showPasswordConfirm ? 'mdi-eye' : 'mdi-eye-off'"
                        @click:append-inner="showPasswordConfirm = !showPasswordConfirm"
                        :disabled="updating"
                      ></v-text-field>
                    </v-col>
                  </v-row>
                </div>
              </v-expand-transition>
            </v-form>
          </v-card-text>

          <v-card-actions class="px-6 pb-6">
            <v-spacer></v-spacer>
            <v-btn
              variant="outlined"
              @click="resetForm"
              :disabled="updating"
            >
              Reset
            </v-btn>
            <v-btn
              color="primary"
              size="large"
              @click="updateProfile"
              :loading="updating"
              :disabled="updating"
              prepend-icon="mdi-content-save"
            >
              Save Changes
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-col>

      <!-- Account Info Card -->
      <v-col cols="12" md="4">
        <v-card elevation="4" class="info-card">
          <v-card-title class="card-header">
            <v-icon class="mr-2">mdi-information</v-icon>
            Account Info
          </v-card-title>

          <v-card-text class="pa-6">
            <div class="info-item">
              <div class="info-label">
                <v-icon size="small" class="mr-2">mdi-identifier</v-icon>
                User ID
              </div>
              <div class="info-value">{{ user?.id }}</div>
            </div>

            <v-divider class="my-4"></v-divider>

            <div class="info-item">
              <div class="info-label">
                <v-icon size="small" class="mr-2">mdi-shield-account</v-icon>
                Account Type
              </div>
              <div class="info-value">
                <v-chip
                  :color="getUserTypeColor(user?.role)"
                  size="small"
                  variant="flat"
                >
                  {{ user?.role || 'User' }}
                </v-chip>
              </div>
            </div>

            <v-divider class="my-4"></v-divider>

            <div class="info-item">
              <div class="info-label">
                <v-icon size="small" class="mr-2">mdi-calendar-clock</v-icon>
                Member Since
              </div>
              <div class="info-value">{{ formatDate(user?.created_at) }}</div>
            </div>
          </v-card-text>
        </v-card>

        <!-- Security Tips Card -->
        <v-card elevation="4" class="info-card mt-4">
          <v-card-title class="card-header security-header">
            <v-icon class="mr-2">mdi-shield-lock</v-icon>
            Security Tips
          </v-card-title>

          <v-card-text class="pa-6">
            <div class="tip-item">
              <v-icon color="success" class="mr-2">mdi-check-circle</v-icon>
              <span>Use a strong password</span>
            </div>
            <div class="tip-item">
              <v-icon color="success" class="mr-2">mdi-check-circle</v-icon>
              <span>Don't share your credentials</span>
            </div>
            <div class="tip-item">
              <v-icon color="success" class="mr-2">mdi-check-circle</v-icon>
              <span>Update your information regularly</span>
            </div>
            <div class="tip-item">
              <v-icon color="success" class="mr-2">mdi-check-circle</v-icon>
              <span>Keep your email verified</span>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import { ref, onMounted } from 'vue'
import Swal from 'sweetalert2'
import api from '../services/api'

export default {
  name: 'UserProfile',
  setup() {
    const user = ref(null)
    const formRef = ref(null)
    const updating = ref(false)
    const showPasswordSection = ref(false)
    const showCurrentPassword = ref(false)
    const showPassword = ref(false)
    const showPasswordConfirm = ref(false)

    const formData = ref({
      name: '',
      email: '',
      phone: '',
      current_password: '',
      password: '',
      password_confirmation: ''
    })

    const fetchUserData = async () => {
      try {
        const response = await api.get('/user')
        user.value = response.data.user
        
        // Populate form
        formData.value.name = user.value.name
        formData.value.email = user.value.email
        formData.value.phone = user.value.phone || ''
      } catch (error) {
        console.error('Error fetching user data:', error)
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Failed to load profile data'
        })
      }
    }

    const resetForm = () => {
      formData.value.name = user.value.name
      formData.value.email = user.value.email
      formData.value.phone = user.value.phone || ''
      formData.value.current_password = ''
      formData.value.password = ''
      formData.value.password_confirmation = ''
      showPasswordSection.value = false
    }

    const updateProfile = async () => {
      try {
        updating.value = true

        const payload = {
          name: formData.value.name,
          email: formData.value.email,
          phone: formData.value.phone
        }

        // Only include password fields if user wants to change password
        if (formData.value.password) {
          if (!formData.value.current_password) {
            Swal.fire({
              icon: 'error',
              title: 'Current Password Required',
              text: 'Please enter your current password to change it'
            })
            return
          }
          payload.current_password = formData.value.current_password
          payload.password = formData.value.password
          payload.password_confirmation = formData.value.password_confirmation
        }

        const response = await api.put('/profile', payload)

        if (response.data.success) {
          user.value = response.data.user
          
          // Clear password fields
          formData.value.current_password = ''
          formData.value.password = ''
          formData.value.password_confirmation = ''
          showPasswordSection.value = false

          // Update auth in localStorage and dispatch event
          const currentUser = JSON.parse(localStorage.getItem('user') || '{}')
          const updatedUser = { ...currentUser, ...response.data.user }
          localStorage.setItem('user', JSON.stringify(updatedUser))
          window.dispatchEvent(new CustomEvent('auth-changed', { 
            detail: { user: updatedUser } 
          }))

          Swal.fire({
            icon: 'success',
            title: 'Profile Updated!',
            text: 'Your profile has been updated successfully',
            timer: 2000,
            timerProgressBar: true
          })
        }
      } catch (error) {
        console.error('Error updating profile:', error)
        Swal.fire({
          icon: 'error',
          title: 'Update Failed',
          text: error.response?.data?.message || 'Failed to update profile'
        })
      } finally {
        updating.value = false
      }
    }

    const getUserTypeColor = (type) => {
      const colors = {
        user: 'primary',
        staff: 'success',
        admin: 'error'
      }
      return colors[type] || 'grey'
    }

    const getUserTypeIcon = (type) => {
      const icons = {
        user: 'mdi-account',
        staff: 'mdi-account-tie',
        admin: 'mdi-shield-account'
      }
      return icons[type] || 'mdi-account'
    }

    const formatDate = (date) => {
      if (!date) return 'N/A'
      return new Date(date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    }

    onMounted(() => {
      fetchUserData()
    })

    return {
      user,
      formRef,
      formData,
      updating,
      showPasswordSection,
      showCurrentPassword,
      showPassword,
      showPasswordConfirm,
      updateProfile,
      resetForm,
      getUserTypeColor,
      getUserTypeIcon,
      formatDate
    }
  }
}
</script>

<style scoped>
.profile-container {
  padding: 24px;
  background: #f5f7fa;
  min-height: 100vh;
}

/* Header */
.page-header {
  margin-bottom: 32px;
  padding: 32px;
  background: linear-gradient(135deg, #1e293b 0%, #334155 100%);
  border-radius: 16px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.header-content {
  display: flex;
  align-items: center;
}

.page-title {
  font-size: 2rem;
  font-weight: 700;
  color: white;
  margin: 0;
}

.page-subtitle {
  font-size: 1rem;
  color: rgba(255, 255, 255, 0.8);
  margin: 4px 0 0 0;
}

/* Cards */
.profile-card,
.info-card {
  border-radius: 16px;
  overflow: hidden;
}

.card-header {
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  color: white !important;
  padding: 20px 24px;
  font-size: 1.2rem;
  font-weight: 600;
}

.security-header {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
}

/* Info Items */
.info-item {
  margin-bottom: 8px;
}

.info-label {
  display: flex;
  align-items: center;
  font-size: 0.875rem;
  color: #64748b;
  font-weight: 500;
  margin-bottom: 4px;
}

.info-value {
  font-size: 1rem;
  color: #1e293b;
  font-weight: 600;
}

/* Security Tips */
.tip-item {
  display: flex;
  align-items: center;
  padding: 8px 0;
  font-size: 0.9rem;
  color: #475569;
}

/* Responsive */
@media (max-width: 960px) {
  .profile-container {
    padding: 12px;
  }

  .page-header {
    padding: 20px;
    flex-direction: column;
    align-items: flex-start !important;
  }

  .header-content {
    flex-direction: column;
    align-items: center !important;
    text-align: center;
    width: 100%;
  }

  .header-content .v-avatar {
    margin-right: 0 !important;
    margin-bottom: 16px;
  }

  .page-title {
    font-size: 1.5rem;
  }

  .profile-card,
  .info-card {
    margin-bottom: 16px;
  }

  .card-header {
    font-size: 1.1rem !important;
    padding: 16px !important;
  }

  .v-card-text {
    padding: 16px !important;
  }

  .v-card-actions {
    flex-direction: column;
    gap: 8px;
  }

  .v-card-actions .v-btn {
    width: 100% !important;
  }
}

@media (max-width: 600px) {
  .profile-container {
    padding: 8px;
  }

  .page-header {
    padding: 16px;
    margin-bottom: 16px;
  }

  .header-content .v-avatar {
    width: 60px !important;
    height: 60px !important;
  }

  .page-title {
    font-size: 1.3rem;
  }

  .page-subtitle {
    font-size: 0.875rem;
  }

  .card-header {
    font-size: 1rem !important;
    padding: 12px !important;
  }

  .card-header .v-icon {
    font-size: 20px !important;
  }

  .v-card-text {
    padding: 12px !important;
  }

  .v-row {
    margin: 0 !important;
  }

  .v-col {
    padding: 4px !important;
  }

  .v-text-field,
  .v-select {
    margin-bottom: 12px !important;
  }

  .info-item {
    margin-bottom: 12px;
  }

  .tip-item {
    font-size: 0.8rem;
    padding: 6px 0;
  }
}

@media (max-width: 400px) {
  .page-header {
    padding: 12px;
  }

  .page-title {
    font-size: 1.1rem;
  }

  .v-card-text {
    padding: 8px !important;
  }

  .card-header {
    padding: 10px !important;
    font-size: 0.95rem !important;
  }
}
</style>


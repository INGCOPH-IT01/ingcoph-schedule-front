<template>
  <v-container fluid class="user-management-container">
    <!-- Perfect Smash Background -->
    <div class="sports-background">
      <div class="sports-overlay"></div>
      <div class="sports-pattern"></div>
    </div>

    <!-- Header -->
    <div class="page-header">
      <div class="header-content">
        <v-icon size="48" color="primary" class="mr-4">mdi-account-group</v-icon>
        <div>
          <h1 class="page-title">User Management</h1>
          <p class="page-subtitle">Manage users, staff, and administrators</p>
        </div>
      </div>
      <v-btn
        color="primary"
        size="large"
        @click="openCreateDialog"
        prepend-icon="mdi-account-plus"
        elevation="4"
      >
        Create New User
      </v-btn>
    </div>

    <!-- Stats Cards -->
    <v-row class="stats-row">
      <v-col cols="12" sm="6" md="3">
        <v-card class="stat-card" elevation="2">
          <v-card-text>
            <div class="stat-icon-wrapper users">
              <v-icon size="32" color="white">mdi-account-multiple</v-icon>
            </div>
            <div class="stat-content">
              <div class="stat-value">{{ stats.users }}</div>
              <div class="stat-label">Users</div>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
      <v-col cols="12" sm="6" md="3">
        <v-card class="stat-card" elevation="2">
          <v-card-text>
            <div class="stat-icon-wrapper staff">
              <v-icon size="32" color="white">mdi-account-tie</v-icon>
            </div>
            <div class="stat-content">
              <div class="stat-value">{{ stats.staff }}</div>
              <div class="stat-label">Staff</div>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
      <v-col cols="12" sm="6" md="3">
        <v-card class="stat-card" elevation="2">
          <v-card-text>
            <div class="stat-icon-wrapper admins">
              <v-icon size="32" color="white">mdi-shield-account</v-icon>
            </div>
            <div class="stat-content">
              <div class="stat-value">{{ stats.admins }}</div>
              <div class="stat-label">Admins</div>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
      <v-col cols="12" sm="6" md="3">
        <v-card class="stat-card" elevation="2">
          <v-card-text>
            <div class="stat-icon-wrapper total">
              <v-icon size="32" color="white">mdi-account-group</v-icon>
            </div>
            <div class="stat-content">
              <div class="stat-value">{{ stats.total }}</div>
              <div class="stat-label">Total</div>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Users Data Table -->
    <v-card elevation="4" class="users-table-card">
      <v-card-title class="table-header">
        <v-icon class="mr-2">mdi-table</v-icon>
        All Users
        <v-spacer></v-spacer>
        <v-text-field
          v-model="search"
          prepend-inner-icon="mdi-magnify"
          label="Search users..."
          single-line
          hide-details
          variant="outlined"
          density="compact"
          class="search-field"
        ></v-text-field>
      </v-card-title>

      <v-data-table
        :headers="headers"
        :items="users"
        :search="search"
        :loading="loading"
        class="users-table"
      >
        <!-- User Type -->
        <template v-slot:[`item.role`]="{ item }">
          <v-chip
            :color="getUserTypeColor(item.role)"
            size="small"
            variant="flat"
          >
            <v-icon start size="small">{{ getUserTypeIcon(item.role) }}</v-icon>
            {{ item.role }}
          </v-chip>
        </template>

        <!-- Created At -->
        <template v-slot:[`item.created_at`]="{ item }">
          {{ formatDate(item.created_at) }}
        </template>

        <!-- Actions -->
        <template v-slot:[`item.actions`]="{ item }">
          <v-btn
            icon
            size="small"
            variant="text"
            color="primary"
            @click="openEditDialog(item)"
          >
            <v-icon>mdi-pencil</v-icon>
          </v-btn>
          <v-btn
            icon
            size="small"
            variant="text"
            color="error"
            @click="confirmDelete(item)"
            :disabled="item.id === currentUserId"
          >
            <v-icon>mdi-delete</v-icon>
          </v-btn>
        </template>
      </v-data-table>
    </v-card>

    <!-- Create/Edit User Dialog -->
    <v-dialog 
      v-model="dialog" 
      max-width="800px" 
      persistent
      class="responsive-dialog"
    >
      <v-card class="user-dialog">
        <v-card-title class="dialog-title">
          <v-icon class="mr-2">{{ editMode ? 'mdi-account-edit' : 'mdi-account-plus' }}</v-icon>
          {{ editMode ? 'Edit User' : 'Create New User' }}
        </v-card-title>

        <v-card-text class="pt-4">
          <v-form ref="formRef">
            <v-text-field
              v-model="formData.name"
              label="Full Name"
              :rules="[v => !!v || 'Name is required']"
              variant="outlined"
              prepend-inner-icon="mdi-account"
              class="mb-4"
            ></v-text-field>

            <v-text-field
              v-model="formData.email"
              label="Email"
              type="email"
              :rules="[v => !!v || 'Email is required', v => /.+@.+\..+/.test(v) || 'Email must be valid']"
              variant="outlined"
              prepend-inner-icon="mdi-email"
              class="mb-4"
            ></v-text-field>

            <v-text-field
              v-model="formData.phone"
              label="Phone (Optional)"
              variant="outlined"
              prepend-inner-icon="mdi-phone"
              class="mb-4"
            ></v-text-field>

            <v-select
              v-model="formData.user_type"
              :items="userTypeOptions"
              label="User Type"
              :rules="[v => !!v || 'User type is required']"
              variant="outlined"
              prepend-inner-icon="mdi-account-cog"
              class="mb-4"
            ></v-select>

            <v-text-field
              v-model="formData.password"
              :label="editMode ? 'New Password (leave blank to keep current)' : 'Password'"
              :type="showPassword ? 'text' : 'password'"
              :rules="editMode ? [] : [v => !!v || 'Password is required', v => v.length >= 8 || 'Password must be at least 8 characters']"
              variant="outlined"
              prepend-inner-icon="mdi-lock"
              :append-inner-icon="showPassword ? 'mdi-eye' : 'mdi-eye-off'"
              @click:append-inner="showPassword = !showPassword"
              class="mb-4"
            ></v-text-field>

            <v-text-field
              v-model="formData.password_confirmation"
              :label="editMode ? 'Confirm New Password' : 'Confirm Password'"
              :type="showPasswordConfirm ? 'text' : 'password'"
              :rules="formData.password ? [v => v === formData.password || 'Passwords do not match'] : []"
              variant="outlined"
              prepend-inner-icon="mdi-lock-check"
              :append-inner-icon="showPasswordConfirm ? 'mdi-eye' : 'mdi-eye-off'"
              @click:append-inner="showPasswordConfirm = !showPasswordConfirm"
            ></v-text-field>
          </v-form>
        </v-card-text>

        <v-card-actions class="px-6 pb-4">
          <v-spacer></v-spacer>
          <v-btn
            variant="text"
            @click="closeDialog"
            :disabled="saving"
          >
            Cancel
          </v-btn>
          <v-btn
            color="primary"
            @click="saveUser"
            :loading="saving"
            :disabled="saving"
          >
            {{ editMode ? 'Update' : 'Create' }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script>
import { ref, onMounted } from 'vue'
import Swal from 'sweetalert2'
import api from '../services/api'

export default {
  name: 'UserManagement',
  setup() {
    const users = ref([])
    const stats = ref({
      total: 0,
      users: 0,
      staff: 0,
      admins: 0
    })
    const loading = ref(false)
    const search = ref('')
    const dialog = ref(false)
    const editMode = ref(false)
    const saving = ref(false)
    const formRef = ref(null)
    const showPassword = ref(false)
    const showPasswordConfirm = ref(false)
    const currentUserId = ref(null)

    const formData = ref({
      name: '',
      email: '',
      phone: '',
      user_type: 'user',
      password: '',
      password_confirmation: ''
    })

    const headers = [
      { title: 'ID', key: 'id', sortable: true },
      { title: 'Name', key: 'name', sortable: true },
      { title: 'Email', key: 'email', sortable: true },
      { title: 'Phone', key: 'phone', sortable: true },
      { title: 'Type', key: 'role', sortable: true },
      { title: 'Created', key: 'created_at', sortable: true },
      { title: 'Actions', key: 'actions', sortable: false }
    ]

    const userTypeOptions = [
      { title: 'User', value: 'user' },
      { title: 'Staff', value: 'staff' },
      { title: 'Admin', value: 'admin' }
    ]

    const fetchUsers = async () => {
      try {
        loading.value = true
        const response = await api.get('/admin/users')
        users.value = response.data.data
      } catch (error) {
        console.error('Error fetching users:', error)
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Failed to fetch users'
        })
      } finally {
        loading.value = false
      }
    }

    const fetchStats = async () => {
      try {
        const response = await api.get('/admin/users/stats')
        stats.value = response.data.data
      } catch (error) {
        console.error('Error fetching stats:', error)
      }
    }

    const openCreateDialog = () => {
      editMode.value = false
      formData.value = {
        name: '',
        email: '',
        phone: '',
        user_type: 'user',
        password: '',
        password_confirmation: ''
      }
      dialog.value = true
    }

    const openEditDialog = (user) => {
      editMode.value = true
      formData.value = {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone || '',
        user_type: user.role, // Map role to user_type for display
        password: '',
        password_confirmation: ''
      }
      dialog.value = true
    }

    const closeDialog = () => {
      dialog.value = false
      formData.value = {
        name: '',
        email: '',
        phone: '',
        user_type: 'user',
        password: '',
        password_confirmation: ''
      }
      showPassword.value = false
      showPasswordConfirm.value = false
    }

    const saveUser = async () => {
      try {
        saving.value = true

        const payload = {
          name: formData.value.name,
          email: formData.value.email,
          phone: formData.value.phone,
          user_type: formData.value.user_type
        }

        // Only include password if it's provided
        if (formData.value.password) {
          payload.password = formData.value.password
          payload.password_confirmation = formData.value.password_confirmation
        }

        if (editMode.value) {
          await api.put(`/admin/users/${formData.value.id}`, payload)
          Swal.fire({
            icon: 'success',
            title: 'Success!',
            text: 'User updated successfully',
            timer: 2000
          })
        } else {
          await api.post('/admin/users', payload)
          Swal.fire({
            icon: 'success',
            title: 'Success!',
            text: 'User created successfully',
            timer: 2000
          })
        }

        closeDialog()
        await fetchUsers()
        await fetchStats()
      } catch (error) {
        console.error('Error saving user:', error)
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: error.response?.data?.message || 'Failed to save user'
        })
      } finally {
        saving.value = false
      }
    }

    const confirmDelete = async (user) => {
      const result = await Swal.fire({
        title: 'Delete User?',
        text: `Are you sure you want to delete ${user.name}? This action cannot be undone.`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Yes, delete it!'
      })

      if (result.isConfirmed) {
        try {
          await api.delete(`/admin/users/${user.id}`)
          Swal.fire({
            icon: 'success',
            title: 'Deleted!',
            text: 'User has been deleted.',
            timer: 2000
          })
          await fetchUsers()
          await fetchStats()
        } catch (error) {
          console.error('Error deleting user:', error)
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: error.response?.data?.message || 'Failed to delete user'
          })
        }
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
      return new Date(date).toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    }

    onMounted(async () => {
      // Get current user ID
      try {
        const response = await api.get('/user')
        currentUserId.value = response.data.user.id
      } catch (error) {
        console.error('Error fetching current user:', error)
      }

      await fetchUsers()
      await fetchStats()
    })

    return {
      users,
      stats,
      loading,
      search,
      dialog,
      editMode,
      saving,
      formRef,
      formData,
      headers,
      userTypeOptions,
      showPassword,
      showPasswordConfirm,
      currentUserId,
      openCreateDialog,
      openEditDialog,
      closeDialog,
      saveUser,
      confirmDelete,
      getUserTypeColor,
      getUserTypeIcon,
      formatDate
    }
  }
}
</script>

<style scoped>
.user-management-container {
  padding: 24px;
  position: relative;
  min-height: 100vh;
}

/* Perfect Smash Background - Red & White */
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

/* Header */
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 32px;
  padding: 24px;
  background: white;
  border-radius: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.header-content {
  display: flex;
  align-items: center;
}

.page-title {
  font-size: 2rem;
  font-weight: 700;
  color: #B71C1C;
  margin: 0;
}

.page-subtitle {
  font-size: 1rem;
  color: #64748b;
  margin: 4px 0 0 0;
}

/* Stats Cards */
.stats-row {
  margin-bottom: 24px;
}

.stat-card {
  border-radius: 12px;
  overflow: hidden;
}

.stat-card .v-card-text {
  display: flex;
  align-items: center;
  padding: 20px !important;
}

.stat-icon-wrapper {
  width: 64px;
  height: 64px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 16px;
}

.stat-icon-wrapper.users {
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
}

.stat-icon-wrapper.staff {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
}

.stat-icon-wrapper.admins {
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
}

.stat-icon-wrapper.total {
  background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%);
}

.stat-content {
  flex: 1;
}

.stat-value {
  font-size: 2rem;
  font-weight: 700;
  color: #B71C1C;
  line-height: 1;
}

.stat-label {
  font-size: 0.9rem;
  color: #64748b;
  margin-top: 4px;
}

/* Table Card */
.users-table-card {
  border-radius: 16px;
  overflow: hidden;
}

.table-header {
  background: linear-gradient(135deg, #1e293b 0%, #334155 100%);
  color: white !important;
  padding: 20px 24px;
  font-size: 1.2rem;
  font-weight: 600;
}

.search-field {
  max-width: 300px;
}

.users-table {
  background: white;
}

/* Dialog */
.dialog-title {
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  color: white !important;
  padding: 20px 24px;
  font-size: 1.3rem;
  font-weight: 600;
}

/* Fixed Header and Footer for User Dialog */
.user-dialog {
  display: flex;
  flex-direction: column;
  max-height: 90vh;
}

.user-dialog > .v-card-title,
.user-dialog > .dialog-title {
  position: sticky;
  top: 0;
  z-index: 10;
  background: linear-gradient(135deg, #1976d2 0%, #1565c0 100%);
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.user-dialog > .v-card-text {
  overflow-y: auto;
  flex: 1;
  max-height: calc(90vh - 160px);
}

.user-dialog > .v-card-actions {
  position: sticky;
  bottom: 0;
  z-index: 10;
  background: white;
  box-shadow: 0 -2px 4px rgba(0,0,0,0.1);
}

/* Responsive */
@media (max-width: 1280px) {
  .v-dialog.responsive-dialog {
    margin: 0 !important;
  }
  
  .user-dialog {
    max-height: 100vh;
    height: 100vh;
  }
}

@media (max-width: 960px) {
  .page-header {
    flex-direction: column;
    gap: 16px;
    align-items: flex-start;
  }

  .search-field {
    max-width: 100%;
  }

  .dialog-title {
    font-size: 1.1rem !important;
    padding: 16px !important;
  }

  .v-card-text {
    padding: 16px !important;
  }

  .v-card-actions {
    padding: 16px !important;
    flex-direction: column;
    gap: 8px;
  }

  .v-card-actions .v-btn {
    width: 100% !important;
  }
}

@media (max-width: 600px) {
  .user-management-container {
    padding: 12px;
  }

  .page-title {
    font-size: 1.5rem;
  }

  .stat-value {
    font-size: 1.5rem;
  }

  .page-header .v-btn {
    width: 100%;
  }

  .stat-card .v-card-text {
    padding: 12px !important;
  }

  .stat-icon-wrapper {
    width: 48px;
    height: 48px;
    margin-right: 12px;
  }

  .stat-value {
    font-size: 1.3rem;
  }

  .dialog-title {
    font-size: 1rem !important;
    padding: 12px !important;
  }

  .dialog-title .v-icon {
    font-size: 20px !important;
  }

  .v-card-text {
    padding: 12px !important;
  }

  .v-text-field,
  .v-select {
    margin-bottom: 12px !important;
  }
}

@media (max-width: 400px) {
  .stat-card {
    margin-bottom: 8px;
  }

  .page-header {
    padding: 16px;
  }

  .dialog-title {
    flex-direction: column;
    align-items: flex-start !important;
  }
}
</style>


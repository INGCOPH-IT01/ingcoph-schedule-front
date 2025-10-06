<template>
  <div class="excel-container">
    <!-- Badminton Background -->
    <div class="badminton-background">
      <div class="badminton-overlay"></div>
    </div>
    
    <!-- Excel-like Header -->
    <div class="excel-header">
      <div class="excel-title-section">
        <h1 class="excel-title">My Bookings</h1>
        <p class="excel-subtitle">Manage your court reservations and recurring schedules</p>
      </div>
      <div class="excel-actions">
        <v-btn
          color="primary"
          size="large"
          prepend-icon="mdi-calendar-plus"
          @click="openBookingDialog"
          class="excel-add-btn"
        >
          New Booking
        </v-btn>
      </div>
    </div>

    <!-- Authentication Loading -->
    <div v-if="authLoading" class="excel-auth-required">
      <div class="excel-auth-card">
        <v-progress-circular indeterminate color="primary" size="64"></v-progress-circular>
        <h2 class="excel-auth-title mt-4">Checking Authentication...</h2>
        <p class="excel-auth-text">Please wait while we verify your login status.</p>
      </div>
    </div>

    <!-- Authentication Check -->
    <div v-else-if="!isAuthenticated" class="excel-auth-required">
      <div class="excel-auth-card">
        <div class="excel-auth-icon">🔑</div>
        <h2 class="excel-auth-title">Authentication Required</h2>
        <p class="excel-auth-text">Please login to view your bookings.</p>
        <v-btn
          color="primary"
          size="large"
          :to="{ name: 'Login' }"
          class="excel-auth-btn"
        >
          Login
        </v-btn>
      </div>
    </div>

    <!-- Main Content -->
    <div v-else class="excel-content">
      <!-- Search and Filter Section -->
      <div class="excel-toolbar">
        <v-row>
          <v-col cols="12" md="6">
            <v-text-field
              v-model="searchQuery"
              label="Search bookings..."
              prepend-inner-icon="mdi-magnify"
              variant="outlined"
              clearable
              class="excel-search"
            ></v-text-field>
          </v-col>
          <v-col cols="12" md="3">
            <v-select
              v-model="statusFilter"
              :items="statusOptions"
              item-title="title"
              item-value="value"
              label="Filter by Status"
              variant="outlined"
              clearable
              prepend-inner-icon="mdi-filter"
            ></v-select>
          </v-col>
          <v-col cols="12" md="3">
            <v-btn
              color="primary"
              variant="outlined"
              @click="fetchBookings"
              :loading="loading"
              prepend-icon="mdi-refresh"
              class="excel-refresh-btn"
            >
              Refresh
            </v-btn>
          </v-col>
        </v-row>
      </div>

      <!-- Data Table -->
      <div class="excel-table-container">
        <v-data-table
          :headers="headers"
          :items="filteredBookings"
          :search="searchQuery"
          :loading="loading"
          class="excel-table"
          :items-per-page="10"
        >
          <template #item.start_time="{ item }">
            <div class="excel-datetime">
              <div class="excel-date">{{ formatDate(item.start_time) }}</div>
              <div class="excel-time">{{ formatTime(item.start_time) }}</div>
            </div>
          </template>
          
          <template #item.end_time="{ item }">
            <div class="excel-time">{{ formatTime(item.end_time) }}</div>
          </template>
          
          <template #item.status="{ item }">
            <v-chip 
              :color="getStatusColor(item.status)" 
              variant="tonal" 
              size="small"
            >
              {{ item.status?.charAt(0).toUpperCase() + item.status?.slice(1) }}
            </v-chip>
          </template>
          
          <template #item.total_price="{ item }">
            <span class="excel-price">₱{{ (parseFloat(item.total_price) || 0).toFixed(2) }}</span>
          </template>
          
          <template #item.actions="{ item }">
            <div class="excel-actions">
              <v-btn
                icon="mdi-eye"
                size="small"
                color="info"
                variant="text"
                @click="viewBooking(item)"
                class="excel-action-btn"
              ></v-btn>
              <v-btn
                icon="mdi-pencil"
                size="small"
                color="primary"
                variant="text"
                @click="editBooking(item)"
                class="excel-action-btn"
              ></v-btn>
            </div>
          </template>
        </v-data-table>
      </div>
    </div>

    <!-- View Booking Dialog -->
    <v-dialog v-model="viewDialog" max-width="600px">
      <v-card>
        <v-card-title class="text-h5">
          <v-icon class="mr-2">mdi-eye</v-icon>
          Booking Details
        </v-card-title>
        <v-card-text v-if="selectedBooking">
          <v-row>
            <v-col cols="12" md="6">
              <div class="info-item">
                <strong>Court:</strong> {{ selectedBooking.court?.name || 'Unknown' }}
              </div>
              <div class="info-item">
                <strong>Date:</strong> {{ formatDate(selectedBooking.start_time) }}
              </div>
              <div class="info-item">
                <strong>Time:</strong> {{ formatTime(selectedBooking.start_time) }} - {{ formatTime(selectedBooking.end_time) }}
              </div>
            </v-col>
            <v-col cols="12" md="6">
              <div class="info-item">
                <strong>Duration:</strong> {{ getDuration(selectedBooking.start_time, selectedBooking.end_time) }} hour(s)
              </div>
              <div class="info-item">
                <strong>Status:</strong> 
                <v-chip 
                  :color="getStatusColor(selectedBooking.status)" 
                  variant="tonal" 
                  size="small"
                >
                  {{ selectedBooking.status?.charAt(0).toUpperCase() + selectedBooking.status?.slice(1) }}
                </v-chip>
              </div>
              <div class="info-item">
                <strong>Total Price:</strong> ₱{{ (parseFloat(selectedBooking.total_price) || 0).toFixed(2) }}
              </div>
            </v-col>
          </v-row>
          
          <v-row v-if="selectedBooking.notes">
            <v-col cols="12">
              <div class="info-item">
                <strong>Notes:</strong> {{ selectedBooking.notes }}
              </div>
            </v-col>
          </v-row>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            color="primary"
            variant="text"
            @click="viewDialog = false"
          >
            Close
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Edit Booking Dialog -->
    <v-dialog v-model="editDialog" max-width="500px">
      <v-card>
        <v-card-title>Edit Booking</v-card-title>
        <v-card-text>
          <div v-if="editingBooking">
            <p><strong>Court ID:</strong> {{ editingBooking.court_id }}</p>
            <p><strong>Status:</strong> {{ editingBooking.status }}</p>
            <p><strong>Date:</strong> {{ editingBooking.start_time }}</p>
            <p><strong>Total Price:</strong> ₱{{ (parseFloat(editingBooking.total_price) || 0).toFixed(2) }}</p>
          </div>
          <div v-else>
            <p>Loading booking details...</p>
          </div>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn @click="closeEditDialog">Close</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

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
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { authService } from '../services/authService'
import { courtService } from '../services/courtService'

export default {
  name: 'Bookings',
  setup() {
    const route = useRoute()
    const bookings = ref([])
    const searchQuery = ref('')
    const statusFilter = ref('')
    const loading = ref(true)
    const error = ref(null)
    const authLoading = ref(true)
    const isAuthenticated = ref(false)
    const user = ref(null)
    
    // Dialog states
    const viewDialog = ref(false)
    const editDialog = ref(false)
    const selectedBooking = ref(null)
    const editingBooking = ref(null)
    
    // Snackbar
    const snackbar = ref({
      show: false,
      message: '',
      color: 'success'
    })
    
    // Table headers
    const headers = [
      { title: 'Court', key: 'court.name', sortable: true, width: '15%' },
      { title: 'Date & Time', key: 'start_time', sortable: true, width: '20%' },
      { title: 'End Time', key: 'end_time', sortable: true, width: '15%' },
      { title: 'Status', key: 'status', sortable: true, width: '15%' },
      { title: 'Total Price', key: 'total_price', sortable: true, width: '15%' },
      { title: 'Actions', key: 'actions', sortable: false, width: '20%' }
    ]
    
    // Status options
    const statusOptions = [
      { title: 'All Statuses', value: '' },
      { title: 'Pending', value: 'pending' },
      { title: 'Confirmed', value: 'confirmed' },
      { title: 'Cancelled', value: 'cancelled' },
      { title: 'Completed', value: 'completed' }
    ]
    
    // Computed properties
    const filteredBookings = computed(() => {
      if (!statusFilter.value) return bookings.value
      return bookings.value.filter(booking => booking.status === statusFilter.value)
    })
    
    // Methods
    const checkAuth = async () => {
      try {
        authLoading.value = true
        const userData = await authService.getCurrentUser()
        if (userData) {
          isAuthenticated.value = true
          user.value = userData
          await fetchBookings()
        } else {
          isAuthenticated.value = false
          user.value = null
        }
      } catch (error) {
        console.error('Auth check failed:', error)
        isAuthenticated.value = false
        user.value = null
      } finally {
        authLoading.value = false
      }
    }
    
    const fetchBookings = async () => {
      try {
        loading.value = true
        bookings.value = await courtService.getBookings()
      } catch (error) {
        console.error('Error fetching bookings:', error)
        showSnackbar('Failed to fetch bookings', 'error')
      } finally {
        loading.value = false
      }
    }
    
    const viewBooking = (booking) => {
      selectedBooking.value = booking
      viewDialog.value = true
    }
    
    const editBooking = (booking) => {
      editingBooking.value = booking
      editDialog.value = true
    }
    
    const closeEditDialog = () => {
      editDialog.value = false
      editingBooking.value = null
    }
    
    const openBookingDialog = () => {
      // This would open the booking dialog
      showSnackbar('Booking dialog would open here', 'info')
    }
    
    const showSnackbar = (message, color = 'success') => {
      snackbar.value = {
        show: true,
        message,
        color
      }
    }
    
    // Utility functions
    const formatDate = (dateString) => {
      if (!dateString) return 'N/A'
      const date = new Date(dateString)
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      })
    }
    
    const formatTime = (dateString) => {
      if (!dateString) return 'N/A'
      const date = new Date(dateString)
      return date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      })
    }
    
    const getDuration = (startTime, endTime) => {
      if (!startTime || !endTime) return 0
      const start = new Date(startTime)
      const end = new Date(endTime)
      const diffMs = end - start
      return Math.round(diffMs / (1000 * 60 * 60) * 10) / 10
    }
    
    const getStatusColor = (status) => {
      const colors = {
        pending: 'orange',
        confirmed: 'green',
        cancelled: 'red',
        completed: 'blue'
      }
      return colors[status] || 'grey'
    }
    
    // Lifecycle
    onMounted(() => {
      checkAuth()
    })
    
    // Watch for route changes
    watch(() => route.path, (newPath) => {
      if (newPath === '/bookings' && user.value) {
        fetchBookings()
      }
    })
    
    return {
      // Data
      bookings,
      searchQuery,
      statusFilter,
      loading,
      error,
      authLoading,
      isAuthenticated,
      user,
      viewDialog,
      editDialog,
      selectedBooking,
      editingBooking,
      snackbar,
      headers,
      statusOptions,
      
      // Computed
      filteredBookings,
      
      // Methods
      fetchBookings,
      viewBooking,
      editBooking,
      closeEditDialog,
      openBookingDialog,
      showSnackbar,
      formatDate,
      formatTime,
      getDuration,
      getStatusColor
    }
  }
}
</script>

<style scoped>
.excel-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  position: relative;
  overflow-x: auto;
}

.badminton-background {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-image: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="court" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse"><rect width="20" height="20" fill="%23f0f0f0"/><rect x="0" y="0" width="20" height="2" fill="%23ddd"/><rect x="0" y="18" width="20" height="2" fill="%23ddd"/><rect x="0" y="0" width="2" height="20" fill="%23ddd"/><rect x="18" y="0" width="2" height="20" fill="%23ddd"/></pattern></defs><rect width="100" height="100" fill="url(%23court)"/></svg>');
  background-size: 200px 200px;
  opacity: 0.1;
  z-index: 0;
}

.badminton-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.3);
}

.excel-header {
  background: white;
  padding: 24px;
  margin: 20px;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: relative;
  z-index: 1;
}

.excel-title-section h1 {
  color: #1a1a1a;
  font-size: 2rem;
  font-weight: 600;
  margin: 0;
}

.excel-subtitle {
  color: #666;
  margin: 4px 0 0 0;
  font-size: 1rem;
}

.excel-actions {
  display: flex;
  gap: 12px;
}

.excel-add-btn {
  background: linear-gradient(45deg, #4CAF50, #45a049) !important;
  color: white !important;
  font-weight: 600;
  text-transform: none;
  border-radius: 6px;
  padding: 12px 24px;
}

.excel-auth-required {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 60vh;
  position: relative;
  z-index: 1;
}

.excel-auth-card {
  background: white;
  padding: 48px;
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  text-align: center;
  max-width: 400px;
  width: 100%;
}

.excel-auth-icon {
  font-size: 4rem;
  margin-bottom: 16px;
}

.excel-auth-title {
  color: #1a1a1a;
  font-size: 1.5rem;
  font-weight: 600;
  margin: 0 0 8px 0;
}

.excel-auth-text {
  color: #666;
  margin: 0 0 24px 0;
  line-height: 1.5;
}

.excel-auth-btn {
  background: linear-gradient(45deg, #2196F3, #1976D2) !important;
  color: white !important;
  font-weight: 600;
  text-transform: none;
  border-radius: 6px;
  padding: 12px 32px;
}

.excel-content {
  position: relative;
  z-index: 1;
  margin: 20px;
}

.excel-toolbar {
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  margin-bottom: 20px;
}

.excel-table-container {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.excel-table {
  border: none;
}

.excel-datetime {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.excel-date {
  font-weight: 600;
  color: #1a1a1a;
  font-size: 0.9rem;
}

.excel-time {
  color: #666;
  font-size: 0.8rem;
}

.excel-price {
  font-weight: 600;
  color: #4CAF50;
  font-size: 0.9rem;
}

.excel-actions {
  display: flex;
  gap: 4px;
}

.excel-action-btn {
  min-width: 32px !important;
  width: 32px !important;
  height: 32px !important;
}

.excel-refresh-btn {
  height: 56px;
  border-radius: 6px;
}

.info-item {
  margin-bottom: 12px;
  padding: 8px 0;
  border-bottom: 1px solid #eee;
}

.info-item:last-child {
  border-bottom: none;
}

.info-item strong {
  color: #1a1a1a;
  font-weight: 600;
  margin-right: 8px;
}
</style>

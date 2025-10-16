<template>
  <div class="staff-dashboard">
    <!-- Enhanced Header -->
    <div class="staff-header">
      <div class="header-content">
        <div class="header-badge">
          <v-icon color="#B71C1C" size="20" class="mr-2">mdi-qrcode-scan</v-icon>
          Staff Dashboard
        </div>
        <h1 class="header-title">
          <span class="title-gradient">Court</span> Check-In Scanner
        </h1>
        <p class="header-subtitle">
          Scan player QR codes and manage court check-ins with professional efficiency
        </p>
      </div>
    </div>

    <!-- Quick Actions -->
    <div class="actions-section">
      <div class="section-header">
        <div class="section-badge">
          <v-icon color="primary" size="20" class="mr-2">mdi-lightning-bolt</v-icon>
          Quick Actions
        </div>
        <h2 class="section-title">
          <span class="title-gradient">Staff</span> Controls
        </h2>
      </div>
      
      <div class="actions-grid">
        <div class="action-card action-card-1">
          <div class="action-icon">
            <v-icon color="primary" size="48">mdi-qrcode-scan</v-icon>
          </div>
          <div class="action-content">
            <h3 class="action-title">QR Scanner</h3>
            <p class="action-description">Scan player QR codes for court check-in</p>
            <v-btn
              class="action-btn"
              color="primary"
              size="large"
              @click="openQrScanner"
              prepend-icon="mdi-qrcode-scan"
              elevation="4"
            >
              Open Scanner
            </v-btn>
          </div>
          <div class="action-glow"></div>
        </div>
        
        <div class="action-card action-card-2">
          <div class="action-icon">
            <v-icon color="success" size="48">mdi-calendar-check</v-icon>
          </div>
          <div class="action-content">
            <h3 class="action-title">Approved Bookings</h3>
            <p class="action-description">View all approved bookings for today</p>
            <v-btn
              class="action-btn"
              color="success"
              size="large"
              @click="loadApprovedBookings"
              prepend-icon="mdi-calendar-check"
              elevation="4"
            >
              View Bookings
            </v-btn>
          </div>
          <div class="action-glow"></div>
        </div>
      </div>
    </div>

    <!-- Approved Bookings Table -->
    <v-row v-if="showBookings">
      <v-col cols="12">
        <v-card class="bookings-card">
          <v-card-title class="bookings-title">
            <v-icon class="mr-2" color="primary">mdi-calendar-check</v-icon>
            Approved Bookings
            <v-spacer></v-spacer>
            <v-btn
              icon="mdi-refresh"
              variant="text"
              @click="loadApprovedBookings"
              :loading="loading"
            ></v-btn>
          </v-card-title>
          
          <v-data-table
            :headers="headers"
            :items="approvedBookings"
            :loading="loading"
            class="excel-table"
            :item-props="itemProps"
          >
            <template v-slot:[`item.user_name`]="{ item }">
              <div class="d-flex align-center">
                <v-avatar size="32" class="mr-3">
                  <v-icon>mdi-account</v-icon>
                </v-avatar>
                <div>
                  <div class="font-weight-medium">{{ item.user.name }}</div>
                  <div class="text-caption text-grey">{{ item.user.email }}</div>
                </div>
              </div>
            </template>

            <template v-slot:[`item.court_name`]="{ item }">
              <div class="d-flex align-center">
                <CourtImageGallery 
                  :images="item.court?.images || []"
                  :court-name="item.court?.name || 'Unknown Court'"
                  size="small"
                  @image-error="handleImageError"
                />
                <div class="ml-3">
                  <div class="font-weight-medium">{{ item.court.name }}</div>
                  <div class="text-caption text-grey">{{ item.court.sport.name }}</div>
                </div>
              </div>
            </template>

            <template v-slot:[`item.start_time`]="{ item }">
              <div>
                <div class="font-weight-medium">{{ formatDate(item.start_time) }}</div>
                <div class="text-caption text-grey">{{ formatTime(item.start_time) }} - {{ formatTime(item.end_time) }}</div>
              </div>
            </template>

            <template v-slot:[`item.status`]="{ item }">
              <v-chip 
                :color="getStatusColor(item.status)"
                variant="tonal"
                size="small"
              >
                {{ item.status }}
              </v-chip>
            </template>

            <template v-slot:[`item.actions`]="{ item }">
              <div class="d-flex gap-2">
                <v-btn
                  color="primary"
                  size="small"
                  variant="text"
                  icon="mdi-eye"
                  @click="viewBooking(item)"
                ></v-btn>
                <v-btn
                  v-if="item.status === 'approved'"
                  color="success"
                  size="small"
                  variant="text"
                  icon="mdi-qrcode"
                  @click="showQrCode(item)"
                  title="Show QR Code"
                ></v-btn>
              </div>
            </template>
          </v-data-table>
        </v-card>
      </v-col>
    </v-row>

    <!-- QR Code Scanner Dialog -->
    <QrCodeScanner
      v-if="qrScannerDialog"
      @close="closeQrScannerDialog"
    />

    <!-- QR Code Display Dialog -->
    <QrCodeDisplay
      v-if="qrCodeDialog"
      :booking="selectedBooking"
      @close="closeQrCodeDialog"
    />

    <!-- Booking Details Dialog -->
    <v-dialog v-model="bookingDialog" max-width="600">
      <v-card>
        <v-card-title>
          <v-icon class="mr-2" color="primary">mdi-calendar-check</v-icon>
          Booking Details
        </v-card-title>
        <v-card-text v-if="selectedBooking">
          <v-row>
            <v-col cols="12" md="6">
              <div class="detail-item mb-3">
                <strong>Player:</strong> {{ selectedBooking.user?.name }}
              </div>
              <div class="detail-item mb-3">
                <strong>Email:</strong> {{ selectedBooking.user?.email }}
              </div>
              <div class="detail-item mb-3">
                <strong>Court:</strong> {{ selectedBooking.court?.name }}
              </div>
              <div class="detail-item mb-3">
                <strong>Sport:</strong> {{ selectedBooking.court?.sport?.name }}
              </div>
            </v-col>
            <v-col cols="12" md="6">
              <div class="detail-item mb-3">
                <strong>Date:</strong> {{ formatDate(selectedBooking.start_time) }}
              </div>
              <div class="detail-item mb-3">
                <strong>Time:</strong> {{ formatTime(selectedBooking.start_time) }} - {{ formatTime(selectedBooking.end_time) }}
              </div>
              <div class="detail-item mb-3">
                <strong>Status:</strong> 
                <v-chip 
                  :color="getStatusColor(selectedBooking.status)"
                  variant="tonal"
                  size="small"
                  class="ml-2"
                >
                  {{ selectedBooking.status }}
                </v-chip>
              </div>
              <div class="detail-item mb-3">
                <strong>Booking ID:</strong> #{{ selectedBooking.id }}
              </div>
            </v-col>
          </v-row>
          
          <!-- Court Images Gallery -->
          <v-row v-if="selectedBooking.court?.images && selectedBooking.court.images.length > 0">
            <v-col cols="12">
              <v-divider class="my-4"></v-divider>
              <h4 class="text-h6 mb-3">
                <v-icon class="mr-2" color="primary">mdi-image-multiple</v-icon>
                Court Images
              </h4>
              <CourtImageGallery 
                :images="selectedBooking.court.images"
                :court-name="selectedBooking.court.name"
                size="large"
                @image-error="handleImageError"
              />
            </v-col>
          </v-row>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="grey" variant="outlined" @click="bookingDialog = false">
            Close
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Snackbar -->
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
import { bookingService } from '../services/bookingService'
import QrCodeScanner from '../components/QrCodeScanner.vue'
import QrCodeDisplay from '../components/QrCodeDisplay.vue'
import CourtImageGallery from '../components/CourtImageGallery.vue'

export default {
  name: 'StaffDashboard',
  components: {
    QrCodeScanner,
    QrCodeDisplay,
    CourtImageGallery
  },
  setup() {
    const loading = ref(false)
    const approvedBookings = ref([])
    const showBookings = ref(false)
    const qrScannerDialog = ref(false)
    const qrCodeDialog = ref(false)
    const bookingDialog = ref(false)
    const selectedBooking = ref(null)
    
    const snackbar = ref({
      show: false,
      message: '',
      color: 'success'
    })

    const headers = [
      { title: 'Player', key: 'user_name', sortable: false },
      { title: 'Court', key: 'court_name', sortable: false },
      { title: 'Date & Time', key: 'start_time', sortable: true },
      { title: 'Status', key: 'status', sortable: true },
      { title: 'Actions', key: 'actions', sortable: false }
    ]

    const itemProps = (item) => ({
      class: 'excel-table-row'
    })

    const loadApprovedBookings = async () => {
      try {
        loading.value = true
        const response = await bookingService.getApprovedBookings()
        approvedBookings.value = response.data
        showBookings.value = true
      } catch (error) {
        showSnackbar('Failed to load approved bookings', 'error')
      } finally {
        loading.value = false
      }
    }

    const openQrScanner = () => {
      qrScannerDialog.value = true
    }

    const closeQrScannerDialog = () => {
      qrScannerDialog.value = false
    }

    const showQrCode = (booking) => {
      selectedBooking.value = booking
      qrCodeDialog.value = true
    }

    const closeQrCodeDialog = () => {
      qrCodeDialog.value = false
      selectedBooking.value = null
    }

    const viewBooking = (booking) => {
      selectedBooking.value = booking
      bookingDialog.value = true
    }

    const formatDate = (dateTime) => {
      return new Date(dateTime).toLocaleDateString()
    }

    const formatTime = (dateTime) => {
      return new Date(dateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }

    const getStatusColor = (status) => {
      const colors = {
        pending: 'warning',
        approved: 'success',
        checked_in: 'info',
        rejected: 'error',
        cancelled: 'error',
        completed: 'info'
      }
      return colors[status] || 'grey'
    }

    const showSnackbar = (message, color = 'success') => {
      snackbar.value = {
        show: true,
        message,
        color
      }
    }

    const handleImageError = (event) => {
      // Hide the broken image and show fallback icon
      event.target.style.display = 'none'
      const fallback = event.target.nextElementSibling
      if (fallback) {
        fallback.style.display = 'inline'
      }
    }

    onMounted(() => {
      // Load approved bookings on mount
      loadApprovedBookings()
    })

    return {
      loading,
      approvedBookings,
      showBookings,
      qrScannerDialog,
      qrCodeDialog,
      bookingDialog,
      selectedBooking,
      snackbar,
      headers,
      itemProps,
      loadApprovedBookings,
      openQrScanner,
      closeQrScannerDialog,
      showQrCode,
      closeQrCodeDialog,
      viewBooking,
      formatDate,
      formatTime,
      getStatusColor,
      showSnackbar,
      handleImageError
    }
  }
}
</script>

<style scoped>
.staff-dashboard {
  min-height: 100vh;
  position: relative;
}

/* Background is now handled globally by App.vue */

.staff-header {
  padding: 60px 20px 40px;
  text-align: center;
  color: #1e293b;
}

.header-content {
  max-width: 800px;
  margin: 0 auto;
}

.header-badge {
  display: inline-flex;
  align-items: center;
  background: rgba(183, 28, 28, 0.1);
  backdrop-filter: blur(10px);
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 20px;
  color: #B71C1C;
}

.header-title {
  font-size: clamp(2.5rem, 5vw, 4rem);
  font-weight: 800;
  margin-bottom: 16px;
  color: #1e293b;
}

.title-gradient {
  background: linear-gradient(135deg, #B71C1C 0%, #D32F2F 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.header-subtitle {
  font-size: clamp(1rem, 2vw, 1.2rem);
  color: #64748b;
  max-width: 600px;
  margin: 0 auto;
  line-height: 1.6;
}

.actions-section {
  padding: 40px 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.section-header {
  text-align: center;
  margin-bottom: 40px;
}

.section-badge {
  display: inline-flex;
  align-items: center;
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(10px);
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 20px;
  color: white;
}

.section-title {
  font-size: clamp(2rem, 4vw, 3rem);
  font-weight: 800;
  margin-bottom: 16px;
  color: white;
}

.actions-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 24px;
}

.action-card {
  position: relative;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-radius: 20px;
  padding: 32px;
  height: 100%;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: hidden;
  text-align: center;
}

.action-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
}

.action-icon {
  width: 80px;
  height: 80px;
  border-radius: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 24px;
  background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
  transition: all 0.3s ease;
}

.action-card:hover .action-icon {
  transform: scale(1.1) rotate(5deg);
}

.action-content {
  text-align: center;
}

.action-title {
  font-size: 1.5rem;
  font-weight: 700;
  margin-bottom: 16px;
  color: #B71C1C;
}

.action-description {
  color: #64748b;
  line-height: 1.6;
  margin-bottom: 24px;
}

.action-btn {
  border-radius: 12px !important;
  font-weight: 700 !important;
  text-transform: none !important;
  padding: 12px 24px !important;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
}

.action-btn:hover {
  transform: translateY(-2px) !important;
}

.bookings-card {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-radius: 20px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.bookings-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: #B71C1C;
  padding: 24px;
}

.excel-table {
  background: transparent;
}

.excel-table-row {
  transition: all 0.2s ease;
}

.excel-table-row:hover {
  background: rgba(59, 130, 246, 0.05);
}

.detail-item {
  display: flex;
  align-items: center;
  font-size: 14px;
}

.detail-item strong {
  min-width: 100px;
  margin-right: 8px;
}

/* Court Image Styles */
.court-image-staff {
  width: 40px;
  height: 40px;
  border-radius: 8px;
  object-fit: cover;
  border: 2px solid #e5e7eb;
  margin-right: 12px;
}
</style>

<template>
  <div class="admin-dashboard">
    <!-- Enhanced Header -->
    <div class="dashboard-header">
      <div class="header-content">
        <div class="header-badge" :style="{ background: `linear-gradient(135deg, ${badgeColor} 0%, ${titleColor} 100%)` }">
          <v-icon color="white" size="20" class="mr-2">mdi-shield-crown</v-icon>
          Admin Control Center
        </div>
        <h1 class="header-title" :style="{ color: titleColor }">
          {{ moduleTitle }}
        </h1>
        <p class="header-subtitle">
          {{ moduleSubtitle }}
        </p>
      </div>
    </div>

    <!-- Enhanced Statistics Cards -->
    <div class="stats-section">
      <v-row class="mb-8">
        <v-col cols="12" sm="6" md="3">
          <div class="stat-card stat-card-1">
            <div class="stat-icon">
              <v-icon color="primary" size="48">mdi-calendar-clock</v-icon>
            </div>
            <div class="stat-content">
              <div class="stat-number">{{ pendingTransactionsCount }}</div>
              <div class="stat-label">Pending Bookings</div>
              <div class="stat-trend">
                <v-icon color="warning" size="16" class="mr-1">mdi-trending-up</v-icon>
                <span class="text-warning">Awaiting Review</span>
              </div>
            </div>
            <div class="stat-glow"></div>
          </div>
        </v-col>

        <v-col cols="12" sm="6" md="3">
          <div class="stat-card stat-card-2">
            <div class="stat-icon">
              <v-icon color="success" size="48">mdi-check-circle</v-icon>
            </div>
            <div class="stat-content">
              <div class="stat-number">{{ approvedTransactionsCount }}</div>
              <div class="stat-label">Approved Bookings</div>
              <div class="stat-trend">
                <v-icon color="success" size="16" class="mr-1">mdi-trending-up</v-icon>
                <span class="text-success">Confirmed</span>
              </div>
            </div>
            <div class="stat-glow"></div>
          </div>
        </v-col>

        <v-col cols="12" sm="6" md="3">
          <div class="stat-card stat-card-3">
            <div class="stat-icon">
              <v-icon color="error" size="48">mdi-close-circle</v-icon>
            </div>
            <div class="stat-content">
              <div class="stat-number">{{ rejectedTransactionsCount }}</div>
              <div class="stat-label">Rejected Bookings</div>
              <div class="stat-trend">
                <v-icon color="error" size="16" class="mr-1">mdi-trending-down</v-icon>
                <span class="text-error">Declined</span>
              </div>
            </div>
            <div class="stat-glow"></div>
          </div>
        </v-col>

        <v-col cols="12" sm="6" md="3">
          <div class="stat-card stat-card-4">
            <div class="stat-icon">
              <v-icon color="info" size="48">mdi-account-group</v-icon>
            </div>
            <div class="stat-content">
              <div class="stat-number">{{ stats.total_users || 0 }}</div>
              <div class="stat-label">Total Users</div>
              <div class="stat-trend">
                <v-icon color="info" size="16" class="mr-1">mdi-trending-up</v-icon>
                <span class="text-info">Active</span>
              </div>
            </div>
            <div class="stat-glow"></div>
          </div>
        </v-col>
      </v-row>
    </div>

    <!-- Revenue Card -->
    <v-row class="mb-6">
      <v-col cols="12" sm="6" md="3">
        <v-card class="pa-4" color="warning" variant="tonal">
          <div class="d-flex align-center">
            <div>
              <div class="text-h4 font-weight-bold">{{ formatPrice(stats.total_revenue ?? 0) }}</div>
              <div class="text-body-2">Total Revenue</div>
            </div>
          </div>
        </v-card>
      </v-col>
    </v-row>

    <!-- Enhanced Quick Actions -->
    <div class="actions-section">
      <div class="actions-grid">
        <div class="action-card action-card-1">
          <div class="action-icon">
            <v-icon color="primary" size="48">mdi-calendar-clock</v-icon>
          </div>
          <div class="action-content">
            <h3 class="action-title">Review Pending</h3>
            <p class="action-description">Review and manage pending booking requests</p>
            <v-btn
              class="action-btn"
              color="primary"
              size="large"
              @click="loadPendingBookings"
              prepend-icon="mdi-calendar-clock"
              elevation="4"
            >
              Review Now
            </v-btn>
          </div>
          <div class="action-glow"></div>
        </div>

        <div class="action-card action-card-2">
          <div class="action-icon">
            <v-icon color="warning" size="48">mdi-qrcode-scan</v-icon>
          </div>
          <div class="action-content">
            <h3 class="action-title">QR Scanner</h3>
            <p class="action-description">Scan player QR codes for court check-in</p>
            <v-btn
              class="action-btn"
              color="warning"
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
      </div>
    </div>

    <!-- Transactions Table -->
    <v-row>
      <v-col cols="12">
        <v-card>
          <v-card-title class="text-h5 pa-6 pb-4">
            <v-icon class="mr-2" color="primary">mdi-receipt-text</v-icon>
            Transactions
          </v-card-title>
          <v-divider></v-divider>

          <!-- Filters -->
          <div class="pa-4">
            <!-- Status Filter Chips -->
            <div class="mb-4">
              <div class="text-subtitle-2 mb-2 font-weight-bold">Approval Status</div>
              <v-chip-group
                v-model="statusFilter"
                mandatory
                selected-class="text-primary"
              >
                <v-chip value="all" variant="outlined" filter>
                  <v-icon start>mdi-format-list-bulleted</v-icon>
                  All
                </v-chip>
                <v-chip value="pending" variant="outlined" filter>
                  <v-icon start>mdi-clock-alert</v-icon>
                  Pending
                </v-chip>
                <v-chip value="approved" variant="outlined" filter>
                  <v-icon start>mdi-check-circle</v-icon>
                  Approved
                </v-chip>
                <v-chip value="rejected" variant="outlined" filter>
                  <v-icon start>mdi-close-circle</v-icon>
                  Rejected
                </v-chip>
              </v-chip-group>
            </div>

            <!-- Additional Filters -->
            <v-row>
              <v-col cols="12" sm="6" md="3">
                <v-text-field
                  v-model="userFilter"
                  label="Search User"
                  placeholder="Enter user name or email"
                  prepend-inner-icon="mdi-account-search"
                  variant="outlined"
                  density="compact"
                  clearable
                  hide-details
                ></v-text-field>
              </v-col>

              <v-col cols="12" sm="6" md="2">
                <v-select
                  v-model="sportFilter"
                  :items="sportOptions"
                  label="Filter by Sport"
                  prepend-inner-icon="mdi-basketball"
                  variant="outlined"
                  density="compact"
                  clearable
                  hide-details
                ></v-select>
              </v-col>

              <v-col cols="12" sm="6" md="3">
                <v-text-field
                  v-model="dateFromFilter"
                  label="From Date"
                  type="date"
                  prepend-inner-icon="mdi-calendar-start"
                  variant="outlined"
                  density="compact"
                  clearable
                  hide-details
                ></v-text-field>
              </v-col>

              <v-col cols="12" sm="6" md="3">
                <v-text-field
                  v-model="dateToFilter"
                  label="To Date"
                  type="date"
                  prepend-inner-icon="mdi-calendar-end"
                  variant="outlined"
                  density="compact"
                  clearable
                  hide-details
                ></v-text-field>
              </v-col>

              <v-col cols="12" sm="12" md="1">
                <v-btn
                  color="primary"
                  variant="outlined"
                  prepend-icon="mdi-refresh"
                  @click="loadPendingBookings"
                  :loading="loading"
                >
                  Refresh
                </v-btn>
              </v-col>
            </v-row>

            <!-- Clear All Filters Button -->
            <v-row v-if="hasActiveFilters" class="mt-2">
              <v-col cols="12">
                <v-btn
                  variant="text"
                  color="error"
                  prepend-icon="mdi-filter-off"
                  size="small"
                  @click="clearAllFilters"
                >
                  Clear All Filters
                </v-btn>
              </v-col>
            </v-row>
          </div>

          <v-divider></v-divider>

          <!-- Results Count -->
          <div class="px-4 py-2 text-caption text-grey">
            Showing {{ filteredTransactions.length }} of {{ pendingBookings.length }} transaction{{ pendingBookings.length !== 1 ? 's' : '' }}
          </div>

          <v-data-table
            :headers="headers"
            :items="filteredTransactions"
            :loading="loading"
            class="elevation-0"
            no-data-text="No transactions found"
          >
            <template v-slot:[`item.user_name`]="{ item }">
              <div class="d-flex align-center">
                <v-avatar size="32" color="primary" class="mr-3">
                  <span class="text-white">{{ item.user.name.charAt(0).toUpperCase() }}</span>
                </v-avatar>
                <div>
                  <div class="font-weight-medium">{{ item.user.name }}</div>
                  <div class="text-caption text-grey">{{ item.user.email }}</div>
                </div>
              </div>
            </template>

            <template v-slot:[`item.sport_name`]="{ item }">
              <v-chip
                :color="sportService.getSportColor(item.cart_items?.[0]?.court?.sport?.name)"
                variant="tonal"
                size="small"
              >
                <!-- Use MDI icon from sport if available, otherwise use fallback -->
                <v-icon class="mr-1" size="small">
                  {{ sportService.getSportIcon(item.cart_items?.[0]?.court?.sport?.name, item.cart_items?.[0]?.court?.sport?.icon) }}
                </v-icon>
                {{ item.cart_items?.[0]?.court?.sport?.name || 'Multiple Sports' }}
              </v-chip>
            </template>

            <template v-slot:[`item.created_at`]="{ item }">
              <div>
                <div class="font-weight-medium">{{ formatDate(item.created_at) }}</div>
                <div class="text-caption text-grey">{{ formatTime(item.created_at) }}</div>
              </div>
            </template>

            <template v-slot:[`item.total_price`]="{ item }">
              <div class="text-h6 font-weight-bold text-success">
                {{ formatPrice(item.total_price ?? 0) }}
              </div>
            </template>

            <template v-slot:[`item.payment_status`]="{ item }">
              <v-chip
                :color="getPaymentStatusColor(item)"
                variant="tonal"
                size="small"
              >
                <v-icon class="mr-1" size="small">{{ getPaymentStatusIcon(item) }}</v-icon>
                {{ getPaymentStatusText(item) }}
              </v-chip>
            </template>

            <template v-slot:[`item.approval_status`]="{ item }">
              <v-chip
                :color="item.approval_status === 'approved' ? 'success' : item.approval_status === 'rejected' ? 'error' : 'warning'"
                variant="tonal"
                size="small"
              >
                <v-icon class="mr-1" size="small">
                  {{ item.approval_status === 'approved' ? 'mdi-check-circle' : item.approval_status === 'rejected' ? 'mdi-close-circle' : 'mdi-clock-alert' }}
                </v-icon>
                {{ item.approval_status ? item.approval_status.charAt(0).toUpperCase() + item.approval_status.slice(1) : 'Pending' }}
              </v-chip>
            </template>

            <template v-slot:[`item.attendance_status`]="{ item }">
              <v-chip
                :color="getAttendanceColor(item.attendance_status)"
                variant="tonal"
                size="small"
              >
                <v-icon class="mr-1" size="small">{{ getAttendanceIcon(item.attendance_status) }}</v-icon>
                {{ getAttendanceLabel(item.attendance_status) }}
              </v-chip>
            </template>

            <template v-slot:[`item.actions`]="{ item }">
              <div class="d-flex gap-2">
                <v-btn
                  color="primary"
                  variant="tonal"
                  size="small"
                  prepend-icon="mdi-eye"
                  @click="viewBookingDetails(item)"
                >
                  View
                </v-btn>
                <v-btn
                  v-if="item.approval_status === 'pending'"
                  color="success"
                  variant="tonal"
                  size="small"
                  prepend-icon="mdi-check"
                  @click="approveBooking(item.id)"
                  :loading="item.approving"
                  :disabled="getBookingPaymentStatus(item) !== 'complete'"
                >
                  Approve
                </v-btn>
                <v-btn
                  v-if="item.approval_status === 'pending'"
                  color="error"
                  variant="tonal"
                  size="small"
                  prepend-icon="mdi-close"
                  @click="showRejectDialog(item)"
                >
                  Reject
                </v-btn>
              </div>
            </template>
          </v-data-table>
        </v-card>
      </v-col>
    </v-row>

    <!-- Booking Details Dialog -->
    <BookingDetailsDialog
      :is-open="detailsDialog"
      @update:is-open="detailsDialog = $event"
      :booking="selectedBooking"
      :court-name="selectedBooking?.court_name"
      :show-admin-features="true"
      :show-court-images="true"
      @attendance-updated="handleAttendanceUpdated"
    />

    <!-- Reject Dialog -->
    <v-dialog v-model="rejectDialog" max-width="500">
      <v-card>
        <v-card-title class="text-h5 pa-6 pb-4">
          <v-icon class="mr-2" color="error">mdi-close-circle</v-icon>
          Reject Booking
        </v-card-title>
        <v-divider></v-divider>
        <v-card-text class="pa-6">
          <p class="text-body-1 mb-4">
            Are you sure you want to reject this booking? Please provide a reason:
          </p>
          <v-textarea
            v-model="rejectReason"
            label="Rejection Reason"
            placeholder="Enter reason for rejection..."
            variant="outlined"
            rows="3"
            counter="500"
            :rules="[v => v.length <= 500 || 'Reason must be less than 500 characters']"
          ></v-textarea>
        </v-card-text>
        <v-card-actions class="pa-6 pt-0">
          <v-spacer></v-spacer>
          <v-btn
            color="grey"
            variant="text"
            @click="rejectDialog = false"
          >
            Cancel
          </v-btn>
          <v-btn
            color="error"
            variant="elevated"
            @click="confirmReject"
            :loading="rejecting"
          >
            Reject Booking
          </v-btn>
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
    <!-- QR Code Scanner Dialog -->
    <QrCodeScanner
      v-if="qrScannerDialog"
      @close="closeQrScannerDialog"
    />
  </div>
</template>

<script>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { bookingService } from '../services/bookingService'
import { cartService } from '../services/cartService'
import { courtService } from '../services/courtService'
import { sportService } from '../services/sportService'
import { formatPrice } from '../utils/formatters'
import QrCodeScanner from '../components/QrCodeScanner.vue'
import BookingDetailsDialog from '../components/BookingDetailsDialog.vue'
export default {
  name: 'AdminDashboard',
  components: {
    QrCodeScanner,
    BookingDetailsDialog
  },
  setup() {
    const router = useRouter()
    const stats = ref({})
    const pendingBookings = ref([])
    const loading = ref(false)
    const rejecting = ref(false)
    const rejectDialog = ref(false)
    const rejectReason = ref('')
    const selectedBookingId = ref(null)
    const detailsDialog = ref(false)
    const selectedBooking = ref(null)
    const sports = ref([])
    
    // Module title customization
    const moduleTitle = ref('Admin Panel')
    const titleColor = ref('#B71C1C')
    const badgeColor = ref('#D32F2F')
    const moduleSubtitle = ref('Manage multi-sport court bookings and oversee the entire system with professional precision')

    const snackbar = ref({
      show: false,
      message: '',
      color: 'success'
    })
    const qrScannerDialog = ref(false)

    // Filter states
    const statusFilter = ref('all')
    const userFilter = ref('')
    const sportFilter = ref(null)
    const dateFromFilter = ref('')
    const dateToFilter = ref('')

    const headers = [
      { title: 'Transaction ID', key: 'id', sortable: true },
      { title: 'User', key: 'user_name', sortable: false },
      { title: 'Sport', key: 'sport_name', sortable: false },
      { title: 'Created At', key: 'created_at', sortable: true },
      { title: 'Total Price', key: 'total_price', sortable: true },
      { title: 'Payment Status', key: 'payment_status', sortable: false },
      { title: 'Approval Status', key: 'approval_status', sortable: false },
      { title: 'Attendance', key: 'attendance_status', sortable: false },
      { title: 'Actions', key: 'actions', sortable: false }
    ]

    const loadStats = async () => {
      try {
        const response = await bookingService.getAdminStats()
        stats.value = response.data
      } catch (error) {
        console.error('Failed to load stats:', error)
        showSnackbar('Failed to load statistics', 'error')
      }
    }

    const loadSports = async () => {
      try {
        sports.value = await courtService.getSports()
      } catch (error) {
        console.error('Failed to load sports:', error)
        showSnackbar('Failed to load sports', 'error')
      }
    }

    const loadPendingBookings = async () => {
      try {
        loading.value = true
        // Fetch all cart transactions instead of just pending
        const transactions = await cartService.getAllTransactions()
        pendingBookings.value = transactions.map(transaction => ({
          ...transaction,
          approving: false,
          user_name: transaction.user?.name || 'N/A',
          // Get first court name from cart items
          court_name: transaction.cart_items?.[0]?.court?.name || 'Multiple Courts',
          total_price: parseFloat(transaction.total_price) || 0,
          payment_status: transaction.payment_status,
          // Add transaction-specific fields
          isTransaction: true,
          transaction_id: transaction.id,
          items_count: transaction.cart_items?.length || 0
        }))
      } catch (error) {
        console.error('Failed to load transactions:', error)
        showSnackbar('Failed to load transactions', 'error')
      } finally {
        loading.value = false
      }
    }

    const approveBooking = async (bookingId) => {
      try {
        const transaction = pendingBookings.value.find(b => b.id === bookingId)
        if (transaction) transaction.approving = true

        // Validate payment requirements before approval
        const hasPaymentMethod = transaction.payment_method && transaction.payment_method.trim() !== ''
        const hasProofOfPayment = transaction.proof_of_payment && transaction.proof_of_payment.trim() !== ''

        if (!hasPaymentMethod) {
          showSnackbar('Cannot approve transaction: Payment method is missing. Please ensure the user has selected GCash as payment method.', 'error')
          return
        }

        if (!hasProofOfPayment) {
          showSnackbar('Cannot approve transaction: Proof of payment is missing. Please ensure the user has uploaded a screenshot of their GCash payment confirmation.', 'error')
          return
        }

        // Approve cart transaction instead of booking
        await cartService.approveTransaction(bookingId)
        showSnackbar('Transaction approved successfully', 'success')

        // Dispatch event to refresh other components
        window.dispatchEvent(new CustomEvent('booking-updated'))

        await loadPendingBookings()
        await loadStats()
      } catch (error) {
        console.error('Failed to approve booking:', error)
        showSnackbar('Failed to approve booking', 'error')
      } finally {
        const booking = pendingBookings.value.find(b => b.id === bookingId)
        if (booking) booking.approving = false
      }
    }

    const showRejectDialog = (booking) => {
      selectedBookingId.value = booking.id
      rejectReason.value = ''
      rejectDialog.value = true
    }

    const confirmReject = async () => {
      try {
        rejecting.value = true
        // Reject cart transaction instead of booking
        await cartService.rejectTransaction(selectedBookingId.value, rejectReason.value)
        showSnackbar('Transaction rejected successfully', 'success')
        rejectDialog.value = false

        // Dispatch event to refresh other components
        window.dispatchEvent(new CustomEvent('booking-updated'))

        await loadPendingBookings()
        await loadStats()
      } catch (error) {
        console.error('Failed to reject transaction:', error)
        showSnackbar('Failed to reject transaction', 'error')
      } finally {
        rejecting.value = false
      }
    }

    const exportBookings = () => {
      // Simple CSV export
      const csvContent = [
        ['User', 'Court', 'Sport', 'Date', 'Start Time', 'End Time', 'Total Price', 'Status', 'Notes'],
        ...pendingBookings.value.map(booking => [
          booking.user.name,
          booking.court.name,
          booking.court.sport.name,
          formatDate(booking.start_time),
          formatTime(booking.start_time),
          formatTime(booking.end_time),
          `₱${(parseFloat(booking.total_price) || 0).toFixed(2)}`,
          booking.status,
          booking.notes || ''
        ])
      ].map(row => row.join(',')).join('\n')

      const blob = new Blob([csvContent], { type: 'text/csv' })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `pending-bookings-${new Date().toISOString().split('T')[0]}.csv`
      a.click()
      window.URL.revokeObjectURL(url)
    }

    const formatDate = (dateString) => {
      return new Date(dateString).toLocaleDateString()
    }

    const formatTime = (dateString) => {
      return new Date(dateString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }

    // Payment status helper functions
    const getBookingPaymentStatus = (booking) => {
      const hasPaymentMethod = booking.payment_method && booking.payment_method.trim() !== ''
      const hasProofOfPayment = booking.proof_of_payment && booking.proof_of_payment.trim() !== ''

      if (hasPaymentMethod && hasProofOfPayment) {
        return 'complete'
      } else if (hasPaymentMethod && !hasProofOfPayment) {
        return 'missing_proof'
      } else if (!hasPaymentMethod && hasProofOfPayment) {
        return 'missing_method'
      } else {
        return 'incomplete'
      }
    }

    const getPaymentStatusColor = (booking) => {
      const status = getBookingPaymentStatus(booking)
      const colors = {
        complete: 'success',
        missing_proof: 'warning',
        missing_method: 'warning',
        incomplete: 'error'
      }
      return colors[status] || 'info'
    }

    const getPaymentStatusText = (booking) => {
      const status = getBookingPaymentStatus(booking)
      const texts = {
        complete: 'Complete',
        missing_proof: 'Missing Proof',
        missing_method: 'Missing Method',
        incomplete: 'Incomplete'
      }
      return texts[status] || 'Unknown'
    }

    const getPaymentStatusIcon = (booking) => {
      const status = getBookingPaymentStatus(booking)
      const icons = {
        complete: 'mdi-check-circle',
        missing_proof: 'mdi-camera-off',
        missing_method: 'mdi-credit-card-off',
        incomplete: 'mdi-alert-circle'
      }
      return icons[status] || 'mdi-information'
    }

    // Additional helper functions for booking details
    const viewBookingDetails = (booking) => {
      selectedBooking.value = booking
      detailsDialog.value = true
    }

    const handleAttendanceUpdated = ({ bookingId, status }) => {
      // Update the transaction in the list
      const transaction = pendingBookings.value.find(b => b.id === bookingId)
      if (transaction) {
        transaction.attendance_status = status
      }
      showSnackbar('Attendance status updated successfully', 'success')
    }

    const showSnackbar = (message, color = 'success') => {
      snackbar.value = {
        show: true,
        message,
        color
      }
    }

    // Computed property for sport options - using database sports
    const sportOptions = computed(() => {
      if (!sports.value || sports.value.length === 0) {
        return ['All Sports']
      }
      const sportNames = sports.value.map(sport => sport.name).sort()
      return ['All Sports', ...sportNames]
    })

    // Computed property to check if any filters are active
    const hasActiveFilters = computed(() => {
      return statusFilter.value !== 'all' ||
             userFilter.value !== '' ||
             sportFilter.value !== null ||
             dateFromFilter.value !== '' ||
             dateToFilter.value !== ''
    })

    // Clear all filters function
    const clearAllFilters = () => {
      statusFilter.value = 'all'
      userFilter.value = ''
      sportFilter.value = null
      dateFromFilter.value = ''
      dateToFilter.value = ''
    }

    // Computed properties for transaction counts
    const pendingTransactionsCount = computed(() => {
      return pendingBookings.value.filter(t => (t.approval_status || 'pending') === 'pending').length
    })

    const approvedTransactionsCount = computed(() => {
      return pendingBookings.value.filter(t => t.approval_status === 'approved').length
    })

    const rejectedTransactionsCount = computed(() => {
      return pendingBookings.value.filter(t => t.approval_status === 'rejected').length
    })

    // Computed property for filtered transactions
    const filteredTransactions = computed(() => {
      let filtered = pendingBookings.value

      // Filter by approval status
      if (statusFilter.value !== 'all') {
        filtered = filtered.filter(transaction => {
          const status = transaction.approval_status || 'pending'
          return status === statusFilter.value
        })
      }

      // Filter by user (name or email)
      if (userFilter.value && userFilter.value.trim() !== '') {
        const searchTerm = userFilter.value.toLowerCase().trim()
        filtered = filtered.filter(transaction => {
          const userName = transaction.user?.name?.toLowerCase() || ''
          const userEmail = transaction.user?.email?.toLowerCase() || ''
          return userName.includes(searchTerm) || userEmail.includes(searchTerm)
        })
      }

      // Filter by sport
      if (sportFilter.value && sportFilter.value !== 'All Sports') {
        filtered = filtered.filter(transaction => {
          if (!transaction.cart_items || transaction.cart_items.length === 0) {
            return false
          }
          // Check if any cart item has the selected sport
          return transaction.cart_items.some(item =>
            item.court?.sport?.name === sportFilter.value
          )
        })
      }

      // Filter by date range
      if (dateFromFilter.value) {
        const fromDate = new Date(dateFromFilter.value)
        fromDate.setHours(0, 0, 0, 0)
        filtered = filtered.filter(transaction => {
          const transactionDate = new Date(transaction.created_at)
          transactionDate.setHours(0, 0, 0, 0)
          return transactionDate >= fromDate
        })
      }

      if (dateToFilter.value) {
        const toDate = new Date(dateToFilter.value)
        toDate.setHours(23, 59, 59, 999)
        filtered = filtered.filter(transaction => {
          const transactionDate = new Date(transaction.created_at)
          return transactionDate <= toDate
        })
      }

      return filtered
    })

    // QR Scanner functions
    const openQrScanner = () => {
      qrScannerDialog.value = true
    }

    const closeQrScannerDialog = () => {
      qrScannerDialog.value = false
    }

    const handleImageError = (event) => {
      // Hide the broken image and show fallback icon
      event.target.style.display = 'none'
      const fallback = event.target.nextElementSibling
      if (fallback) {
        fallback.style.display = 'inline'
      }
    }

    // Attendance status helper functions
    const getAttendanceColor = (status) => {
      const colors = {
        'showed_up': 'success',
        'no_show': 'error',
        'not_set': 'grey'
      }
      return colors[status] || 'grey'
    }

    const getAttendanceIcon = (status) => {
      const icons = {
        'showed_up': 'mdi-account-check',
        'no_show': 'mdi-account-remove',
        'not_set': 'mdi-account-question'
      }
      return icons[status] || 'mdi-account-question'
    }

    const getAttendanceLabel = (status) => {
      const labels = {
        'showed_up': 'Showed Up',
        'no_show': 'No Show',
        'not_set': 'Not Set'
      }
      return labels[status] || 'Not Set'
    }


    // Load module titles from localStorage or use defaults
    const loadModuleTitles = () => {
      const savedTitles = localStorage.getItem('moduleTitles')
      if (savedTitles) {
        try {
          const titles = JSON.parse(savedTitles)
          if (titles.admin) {
            moduleTitle.value = titles.admin.text || 'Admin Panel'
            titleColor.value = titles.admin.color || '#B71C1C'
            badgeColor.value = titles.admin.badgeColor || '#D32F2F'
            moduleSubtitle.value = titles.admin.subtitle || 'Manage multi-sport court bookings and oversee the entire system with professional precision'
          }
        } catch (error) {
          console.error('Error parsing module titles:', error)
        }
      }
    }

    // Listen for module title updates
    const handleModuleTitlesUpdate = (event) => {
      if (event.detail && event.detail.admin) {
        moduleTitle.value = event.detail.admin.text || 'Admin Panel'
        titleColor.value = event.detail.admin.color || '#B71C1C'
        badgeColor.value = event.detail.admin.badgeColor || '#D32F2F'
        moduleSubtitle.value = event.detail.admin.subtitle || 'Manage multi-sport court bookings and oversee the entire system with professional precision'
      }
    }

    // Listen for booking refresh events
    const handleBookingRefresh = () => {
      loadStats()
      loadPendingBookings()
    }

    onMounted(() => {
      loadStats()
      loadSports()
      loadPendingBookings()
      loadModuleTitles()

      // Listen for custom events to refresh admin data
      window.addEventListener('booking-created', handleBookingRefresh)
      window.addEventListener('booking-updated', handleBookingRefresh)
      window.addEventListener('booking-cancelled', handleBookingRefresh)
      window.addEventListener('module-titles-updated', handleModuleTitlesUpdate)
    })

    onUnmounted(() => {
      // Clean up event listeners
      window.removeEventListener('booking-created', handleBookingRefresh)
      window.removeEventListener('booking-updated', handleBookingRefresh)
      window.removeEventListener('booking-cancelled', handleBookingRefresh)
      window.removeEventListener('module-titles-updated', handleModuleTitlesUpdate)
    })

    return {
      stats,
      pendingBookings,
      loading,
      rejecting,
      rejectDialog,
      rejectReason,
      detailsDialog,
      selectedBooking,
      snackbar,
      showSnackbar,
      openQrScanner,
      closeQrScannerDialog,
      qrScannerDialog,
      handleImageError,
      // Module title customization
      moduleTitle,
      titleColor,
      badgeColor,
      moduleSubtitle,
      headers,
      statusFilter,
      userFilter,
      sportFilter,
      dateFromFilter,
      dateToFilter,
      sportOptions,
      hasActiveFilters,
      clearAllFilters,
      pendingTransactionsCount,
      approvedTransactionsCount,
      rejectedTransactionsCount,
      filteredTransactions,
      loadStats,
      loadPendingBookings,
      approveBooking,
      showRejectDialog,
      confirmReject,
      exportBookings,
      formatDate,
      formatTime,
      // Payment status functions
      getBookingPaymentStatus,
      getPaymentStatusColor,
      getPaymentStatusText,
      getPaymentStatusIcon,
      // Booking details functions
      viewBookingDetails,
      handleAttendanceUpdated,
      formatPrice,
      // Attendance status functions
      getAttendanceColor,
      getAttendanceIcon,
      getAttendanceLabel,
      // Services
      sportService
    }
  }
}
</script>

<style scoped>
/* Modern Sports Admin Dashboard Theme */
.admin-dashboard {
  padding: 32px;
  position: relative;
  min-height: 100vh;
  z-index: 1;
}

/* Background elements are now handled globally by App.vue */
.sports-background,
.sports-overlay,
.sports-pattern {
  display: none;
}

/* Dashboard Header */
.dashboard-header {
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
  backdrop-filter: blur(10px);
  border-radius: 50px;
  padding: 8px 20px;
  margin-bottom: 24px;
  color: white;
  font-weight: 600;
  font-size: 14px;
  letter-spacing: 0.5px;
  box-shadow: 0 4px 12px rgba(183, 28, 28, 0.3);
}

.header-title {
  font-size: clamp(2.5rem, 5vw, 4rem);
  font-weight: 800;
  line-height: 1.1;
  margin-bottom: 24px;
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

/* Statistics Section */
.stats-section {
  margin-bottom: 48px;
}

.stat-card {
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
}

.stat-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, #3b82f6, #10b981, #f59e0b, #ef4444);
  opacity: 0;
  transition: opacity 0.3s ease;
}

.stat-card:hover::before {
  opacity: 1;
}

.stat-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
}

.stat-card-1:hover {
  background: linear-gradient(135deg, rgba(59, 130, 246, 0.05) 0%, rgba(59, 130, 246, 0.02) 100%);
}

.stat-card-2:hover {
  background: linear-gradient(135deg, rgba(16, 185, 129, 0.05) 0%, rgba(16, 185, 129, 0.02) 100%);
}

.stat-card-3:hover {
  background: linear-gradient(135deg, rgba(239, 68, 68, 0.05) 0%, rgba(239, 68, 68, 0.02) 100%);
}

.stat-card-4:hover {
  background: linear-gradient(135deg, rgba(59, 130, 246, 0.05) 0%, rgba(59, 130, 246, 0.02) 100%);
}

.stat-icon {
  width: 80px;
  height: 80px;
  border-radius: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 24px;
  background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
  transition: all 0.3s ease;
}

.stat-card:hover .stat-icon {
  transform: scale(1.1) rotate(5deg);
}

.stat-content {
  text-align: center;
}

.stat-number {
  font-size: 2.5rem;
  font-weight: 800;
  margin-bottom: 8px;
  background: linear-gradient(135deg, #1e293b 0%, #3b82f6 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.stat-label {
  font-size: 1rem;
  font-weight: 600;
  color: #64748b;
  margin-bottom: 12px;
}

.stat-trend {
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.9rem;
  font-weight: 600;
}

/* Actions Section */
.actions-section {
  margin-bottom: 48px;
}

.section-header {
  text-align: center;
  margin-bottom: 48px;
}

.section-badge {
  display: inline-flex;
  align-items: center;
  background: rgba(59, 130, 246, 0.1);
  color: #3b82f6;
  border-radius: 50px;
  padding: 8px 20px;
  margin-bottom: 16px;
  font-weight: 600;
  font-size: 14px;
  letter-spacing: 0.5px;
}

.section-title {
  font-size: clamp(2rem, 4vw, 3rem);
  font-weight: 800;
  margin-bottom: 16px;
  color: white;
}

.section-subtitle {
  font-size: clamp(1rem, 2vw, 1.2rem);
  color: rgba(255, 255, 255, 0.8);
  max-width: 600px;
  margin: 0 auto;
  line-height: 1.6;
}

.actions-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
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

.action-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, #3b82f6, #10b981, #f59e0b, #ef4444);
  opacity: 0;
  transition: opacity 0.3s ease;
}

.action-card:hover::before {
  opacity: 1;
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

/* Image Styles */
.full-size-image {
  max-width: 100%;
  height: auto;
  border-radius: 12px;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
}

/* Utility Classes */
.gap-2 {
  gap: 8px;
}

/* Responsive Design */
@media (max-width: 768px) {
  .admin-dashboard {
    padding: 16px;
  }

  .dashboard-header {
    padding: 32px 0;
    margin-bottom: 32px;
  }

  .actions-grid {
    grid-template-columns: 1fr;
    gap: 16px;
  }

  .stat-card,
  .action-card {
    padding: 24px;
  }
}

@media (max-width: 480px) {
  .admin-dashboard {
    padding: 12px;
  }

  .dashboard-header {
    padding: 24px 0;
  }

  .stat-card,
  .action-card {
    padding: 20px;
  }
}
</style>

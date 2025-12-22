<template>
  <div class="admin-dashboard">
    <!-- Enhanced Header -->
    <div class="dashboard-header">
      <div class="header-content">
        <div class="header-badge">
          <v-icon color="#1e293b" size="20" class="mr-2">mdi-shield-crown</v-icon>
          Admin Control Center
        </div>
        <h1 class="header-title">
          <span class="title-gradient">Champion</span> Dashboard
        </h1>
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

    <!-- Hours and Revenue Cards -->
    <v-row class="mb-6">
      <v-col cols="12" sm="6" md="3">
        <div class="stat-card stat-card-5">
          <div class="stat-icon">
            <v-icon color="info" size="48">mdi-clock-outline</v-icon>
          </div>
          <div class="stat-content">
            <div class="stat-number">{{ stats.total_hours ?? 0 }}</div>
            <div class="stat-label">Total Hours Today</div>
            <div class="stat-trend">
              <v-icon color="info" size="16" class="mr-1">mdi-calendar-today</v-icon>
              <span class="text-info">Across All Courts</span>
            </div>
          </div>
          <div class="stat-glow"></div>
        </div>
      </v-col>
      <v-col v-if="isAdmin" cols="12" sm="6" md="3">
        <div class="stat-card stat-card-6">
          <div class="stat-icon">
            <v-icon color="warning" size="48">mdi-cash-multiple</v-icon>
          </div>
          <div class="stat-content">
            <div class="stat-number">{{ formatPrice(stats.total_revenue ?? 0) }}</div>
            <div class="stat-label">Booking Revenue</div>
            <div class="stat-trend">
              <v-icon color="success" size="16" class="mr-1">mdi-trending-up</v-icon>
              <span class="text-success">All Time</span>
            </div>
          </div>
          <div class="stat-glow"></div>
        </div>
      </v-col>
      <v-col v-if="isAdmin" cols="12" sm="6" md="3">
        <div class="stat-card stat-card-7">
          <div class="stat-icon">
            <v-icon color="purple" size="48">mdi-cash-register</v-icon>
          </div>
          <div class="stat-content">
            <div class="stat-number">{{ posStats.today_sales ?? 0 }}</div>
            <div class="stat-label">POS Sales Today</div>
            <div class="stat-trend">
              <v-icon color="purple" size="16" class="mr-1">mdi-cart</v-icon>
              <span style="color: #9c27b0;">{{ formatPrice(posStats.today_revenue ?? 0) }}</span>
            </div>
          </div>
          <div class="stat-glow"></div>
        </div>
      </v-col>
      <v-col v-if="isAdmin" cols="12" sm="6" md="3">
        <div class="stat-card stat-card-8">
          <div class="stat-icon">
            <v-icon color="success" size="48">mdi-receipt-text</v-icon>
          </div>
          <div class="stat-content">
            <div class="stat-number">{{ formatPrice(posStats.total_revenue ?? 0) }}</div>
            <div class="stat-label">Total POS Revenue</div>
            <div class="stat-trend">
              <v-icon color="success" size="16" class="mr-1">mdi-trending-up</v-icon>
              <span class="text-success">All Time</span>
            </div>
          </div>
          <div class="stat-glow"></div>
        </div>
      </v-col>
    </v-row>

    <!-- Transactions Table -->
    <v-row>
      <v-col cols="12">
        <v-card>
          <v-card-title class="text-h5 pa-6 pb-4">
            <div class="d-flex align-center justify-space-between w-100">
              <div class="d-flex align-center">
                <v-icon class="mr-2" color="primary">mdi-receipt-text</v-icon>
                Transactions
              </div>
              <v-chip-group
                v-model="viewMode"
                mandatory
                selected-class="text-primary"
              >
                <v-chip value="table" variant="outlined" filter>
                  <v-icon start>mdi-table</v-icon>
                  Data Table
                </v-chip>
                <v-chip value="calendar" variant="outlined" filter>
                  <v-icon start>mdi-calendar-month</v-icon>
                  Calendar
                </v-chip>
              </v-chip-group>
            </div>
          </v-card-title>
          <v-divider></v-divider>

          <!-- Filters -->
          <div class="pa-4">
            <!-- Status Filter Chips -->
            <div class="mb-4">
              <div class="text-subtitle-2 mb-2 font-weight-bold">
                Approval Status
                <span v-if="statusFilter.length > 0" class="text-caption text-grey ml-2">
                  ({{ statusFilter.length }} selected)
                </span>
              </div>
              <v-chip-group
                v-model="statusFilter"
                multiple
                selected-class="text-primary"
              >
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
                <v-chip value="pending_waitlist" variant="outlined" filter>
                  <v-icon start>mdi-account-multiple-check</v-icon>
                  Has Waitlist Queue
                </v-chip>
              </v-chip-group>
            </div>

            <!-- Payment Status Filter Chips -->
            <div class="mb-4">
              <div class="text-subtitle-2 mb-2 font-weight-bold">
                Payment Status
                <span v-if="paymentStatusFilter.length > 0" class="text-caption text-grey ml-2">
                  ({{ paymentStatusFilter.length }} selected)
                </span>
              </div>
              <v-chip-group
                v-model="paymentStatusFilter"
                multiple
                selected-class="text-primary"
              >
                <v-chip value="complete" variant="outlined" filter>
                  <v-icon start>mdi-check-circle</v-icon>
                  Complete
                </v-chip>
                <v-chip value="missing_proof" variant="outlined" filter>
                  <v-icon start>mdi-camera-off</v-icon>
                  Missing Proof
                </v-chip>
                <!-- <v-chip value="missing_method" variant="outlined" filter>
                  <v-icon start>mdi-credit-card-off</v-icon>
                  Missing Method
                </v-chip> -->
                <!-- <v-chip value="incomplete" variant="outlined" filter>
                  <v-icon start>mdi-alert-circle</v-icon>
                  Incomplete
                </v-chip> -->
              </v-chip-group>
            </div>

            <!-- Additional Filters -->
            <v-row>
              <v-col cols="12" sm="6" md="3">
                <v-text-field
                  v-model="userFilter"
                  label="Search User / Admin Notes"
                  placeholder="Enter user name, email, or admin notes"
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

              <v-col v-if="viewMode === 'table'" cols="12" sm="6" md="3">
                <v-text-field
                  v-model="dateFromFilter"
                  label="Booking Date From"
                  type="date"
                  prepend-inner-icon="mdi-calendar-start"
                  variant="outlined"
                  density="compact"
                  clearable
                  hide-details
                ></v-text-field>
              </v-col>

              <v-col v-if="viewMode === 'table'" cols="12" sm="6" md="3">
                <v-text-field
                  v-model="dateToFilter"
                  label="Booking Date To"
                  type="date"
                  prepend-inner-icon="mdi-calendar-end"
                  variant="outlined"
                  density="compact"
                  clearable
                  hide-details
                ></v-text-field>
              </v-col>

              <v-col cols="12" sm="6" md="1">
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
              <v-spacer></v-spacer>
              <v-col cols="12" sm="6" md="1">
                <v-btn
                  color="success"
                  variant="outlined"
                  prepend-icon="mdi-file-excel"
                  @click="exportToExcel"
                  :disabled="filteredTransactions.length === 0"
                >
                  Export
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
          <div class="px-4 py-2 text-caption" style="color: #475569;">
            Showing {{ filteredTransactions.length }} of {{ pendingBookings.length }} transaction{{ pendingBookings.length !== 1 ? 's' : '' }}
          </div>

          <!-- Calendar View -->
          <div v-if="viewMode === 'calendar'" class="pa-4">
            <CalendarView
              :transactions="filteredTransactions"
              @event-click="viewBookingDetails"
              @month-changed="handleCalendarMonthChanged"
            />
          </div>

          <!-- Data Table View -->
          <v-data-table
            v-if="viewMode === 'table'"
            :headers="headers"
            :items="filteredTransactions"
            :loading="loading"
            class="elevation-0"
            no-data-text="No transactions found"
            @update:sort-by="handleSortChange"
            :sort-by="sortByModel"
          >
            <template v-slot:[`item.user_name`]="{ item }">
              <div class="d-flex align-center">
                <v-avatar size="32" color="primary" class="mr-3">
                  <span class="text-white">{{ getDisplayUserName(item).charAt(0).toUpperCase() }}</span>
                </v-avatar>
                <div>
                  <div class="font-weight-medium">
                    {{ getDisplayUserName(item) }}
                    <v-chip
                      v-if="isAdminBooking(item)"
                      size="x-small"
                      :color="getBookedByUserRoleColor(item)"
                      variant="tonal"
                      class="ml-2"
                    >
                      <v-icon size="x-small" class="mr-1">{{ getBookedByUserRoleIcon(item) }}</v-icon>
                      Booked by {{ item.user?.name || 'Admin' }}
                    </v-chip>
                  </div>
                  <div class="text-caption" style="color: #475569;">{{ getDisplayUserEmail(item) }}</div>
                  <div v-if="isAdminBooking(item)" class="text-caption" style="color: #94a3b8;">
                    <v-icon size="x-small" class="mr-1">mdi-account-tie</v-icon>
                    Created by: {{ item.user?.name || 'N/A' }}
                  </div>
                </div>
              </div>
            </template>

            <template v-slot:[`item.sport_name`]="{ item }">
              <div class="d-flex flex-wrap gap-1">
                <v-chip
                  v-for="sport in getUniqueSports(item)"
                  :key="sport.name"
                  :color="sportService.getSportColor(sport.name)"
                  variant="tonal"
                  size="small"
                >
                  <!-- Use MDI icon from sport if available, otherwise use fallback -->
                  <v-icon class="mr-1" size="small">
                    {{ sportService.getSportIcon(sport.name, sport.icon) }}
                  </v-icon>
                  {{ sport.name }}
                </v-chip>
                <span v-if="!getUniqueSports(item).length" class="text-caption text-grey">
                  No sport
                </span>
              </div>
            </template>

            <template v-slot:[`item.booking_date`]="{ item }">
              <div>
                <div class="font-weight-medium">{{ formatDate(item.cart_items?.[0]?.booking_date) }}</div>
              </div>
            </template>

            <template v-slot:[`item.created_at`]="{ item }">
              <div>
                <div class="font-weight-medium">{{ formatDate(item.created_at) }}</div>
                <div class="text-caption" style="color: #475569;">{{ formatTime(item.created_at) }}</div>
              </div>
            </template>

            <template v-slot:[`item.total_price`]="{ item }">
              <div>
                <div class="text-h6 font-weight-bold text-success">
                  {{ formatPrice(item.total_price ?? 0) }}
                </div>
                <!-- Show breakdown if has POS products -->
                <div v-if="item.pos_amount && parseFloat(item.pos_amount) > 0" class="text-caption text-grey mt-1">
                  <v-tooltip location="top">
                    <template v-slot:activator="{ props }">
                      <div v-bind="props" style="cursor: help;">
                        <v-icon size="12" class="mr-1">mdi-information-outline</v-icon>
                        Booking + POS
                      </div>
                    </template>
                    <div class="text-left">
                      <div><v-icon size="12" class="mr-1">mdi-calendar-clock</v-icon>Court Booking: {{ formatPrice(item.booking_amount ?? 0) }}</div>
                      <div><v-icon size="12" class="mr-1">mdi-shopping</v-icon>POS Products: {{ formatPrice(item.pos_amount ?? 0) }}</div>
                      <v-divider class="my-1" dark></v-divider>
                      <div class="font-weight-bold">Total: {{ formatPrice(item.total_price ?? 0) }}</div>
                    </div>
                  </v-tooltip>
                </div>
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
                :color="getApprovalStatusColor(item.approval_status)"
                variant="tonal"
                size="small"
              >
                <v-icon class="mr-1" size="small">
                  {{ getApprovalStatusIcon(item.approval_status) }}
                </v-icon>
                {{ getApprovalStatusText(item.approval_status) }}
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

            <template v-slot:[`item.admin_notes`]="{ item }">
              <div v-if="item.cart_items && item.cart_items.length > 0 && item.cart_items[0].admin_notes" class="notes-cell">
                <v-tooltip location="top">
                  <template v-slot:activator="{ props }">
                    <div v-bind="props" class="notes-preview">
                      {{ item.cart_items[0].admin_notes }}
                    </div>
                  </template>
                  <span>{{ item.cart_items[0].admin_notes }}</span>
                </v-tooltip>
              </div>
              <span v-else class="text-caption text-grey">No admin notes</span>
            </template>

            <template v-slot:[`item.client_notes`]="{ item }">
              <div v-if="item.cart_items && item.cart_items.length > 0 && item.cart_items[0].notes" class="notes-cell">
                <v-tooltip location="top">
                  <template v-slot:activator="{ props }">
                    <div v-bind="props" class="notes-preview">
                      {{ item.cart_items[0].notes }}
                    </div>
                  </template>
                  <span>{{ item.cart_items[0].notes }}</span>
                </v-tooltip>
              </div>
              <span v-else class="text-caption text-grey">No special request</span>
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
                  v-if="item.approval_status === 'pending' || item.approval_status === 'pending_waitlist'"
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
                  v-if="item.approval_status === 'pending' || item.approval_status === 'pending_waitlist'"
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
      @close="detailsDialog = false"
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
  </div>
</template>

<script>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { authService } from '../services/authService'
import { bookingService } from '../services/bookingService'
import { cartService } from '../services/cartService'
import { courtService } from '../services/courtService'
import { sportService } from '../services/sportService'
import { posService } from '../services/posService'
import {
  formatPrice,
  formatDate,
  formatTimeOnly,
  getPaymentStatus,
  getPaymentStatusColor,
  getPaymentStatusText,
  getPaymentStatusIcon,
  getApprovalStatusColor,
  formatApprovalStatus,
  formatDateLocal,
  getAttendanceColor,
  getAttendanceIcon,
  formatAttendanceLabel
} from '../utils/formatters'
import QrCodeScanner from '../components/QrCodeScanner.vue'
import BookingDetailsDialog from '../components/BookingDetailsDialog.vue'
import CalendarView from '../components/CalendarView.vue'
import ExcelJS from 'exceljs'
export default {
  name: 'AdminDashboard',
  components: {
    QrCodeScanner,
    BookingDetailsDialog,
    CalendarView
  },
  setup() {
    const router = useRouter()
    const stats = ref({})
    const posStats = ref({})
    const pendingBookings = ref([])
    const loading = ref(false)
    const rejecting = ref(false)
    const rejectDialog = ref(false)
    const rejectReason = ref('')
    const selectedBookingId = ref(null)
    const detailsDialog = ref(false)
    const selectedBooking = ref(null)
    const sports = ref([])
    const currentUser = ref(null)
    const isAdmin = ref(false)

    const snackbar = ref({
      show: false,
      message: '',
      color: 'success'
    })

    // View mode state
    const viewMode = ref('calendar')

    // Filter states
    const statusFilter = ref(['pending', 'approved']) // Default to pending and approved
    const userFilter = ref('')
    const sportFilter = ref(null)
    const paymentStatusFilter = ref([])

    // Initialize date filters with start and end of current month as default
    const today = new Date()
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)
    const lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0)

    // Format dates using local timezone to avoid timezone shift issues (imported from formatters)

    const dateFromString = formatDateLocal(firstDayOfMonth)
    const dateToString = formatDateLocal(lastDayOfMonth)
    const dateFromFilter = ref(dateFromString)
    const dateToFilter = ref(dateToString)

    // Sorting states
    const sortByModel = ref([{ key: 'created_at', order: 'asc' }])
    const sortBy = ref('created_at')
    const sortOrder = ref('asc')

    const headers = [
      { title: 'ID', key: 'id', sortable: true },
      { title: 'User', key: 'user_name', sortable: false },
      { title: 'Sport', key: 'sport_name', sortable: false },
      { title: 'Booking Date', key: 'booking_date', sortable: true },
      { title: 'Created At', key: 'created_at', sortable: true },
      { title: 'Total Price', key: 'total_price', sortable: true },
      { title: 'Payment Status', key: 'payment_status', sortable: false },
      { title: 'Approval Status', key: 'approval_status', sortable: false },
      { title: 'Attendance', key: 'attendance_status', sortable: false },
      { title: 'Admin Notes', key: 'admin_notes', sortable: false },
      { title: 'Client Notes', key: 'client_notes', sortable: false },
      { title: 'Actions', key: 'actions', sortable: false }
    ]

    const loadStats = async () => {
      try {
        const response = await bookingService.getAdminStats()
        stats.value = response.data
      } catch (error) {
        showSnackbar('Failed to load statistics', 'error')
      }
    }

    const loadPosStats = async () => {
      // Only load POS stats for admin users
      if (!isAdmin.value) {
        return
      }

      try {
        posStats.value = await posService.getStatistics()
      } catch (error) {
        console.error('Failed to load POS statistics:', error)
        // Don't show error to user as POS might not be set up yet
      }
    }

    const loadSports = async () => {
      try {
        sports.value = await courtService.getSports()
      } catch (error) {
        showSnackbar('Failed to load sports', 'error')
      }
    }

    const loadPendingBookings = async () => {
      try {
        loading.value = true

        // Prepare optimized filters for server-side filtering
        const filters = {
          sort_by: sortBy.value,
          sort_order: sortOrder.value
        }

        // Date filters - only if in table view (calendar handles its own range)
        if (viewMode.value === 'table') {
          if (dateFromFilter.value) {
            filters.date_from = dateFromFilter.value
          }
          if (dateToFilter.value) {
            filters.date_to = dateToFilter.value
          }
        } else {
          // Calendar view: use calendar's month range
          if (dateFromFilter.value) {
            filters.date_from = dateFromFilter.value
          }
          if (dateToFilter.value) {
            filters.date_to = dateToFilter.value
          }
        }

        // Server-side filters
        if (statusFilter.value.length > 0) {
          filters.approval_status = statusFilter.value
        }

        if (paymentStatusFilter.value.length > 0) {
          filters.payment_status = paymentStatusFilter.value
        }

        if (sportFilter.value && sportFilter.value !== 'All Sports') {
          filters.sport = sportFilter.value
        }

        if (userFilter.value && userFilter.value.trim() !== '') {
          filters.user_search = userFilter.value.trim()
        }

        // Fetch filtered transactions from backend
        const result = await cartService.getAllTransactions(filters)

        // Handle paginated or non-paginated response
        const transactions = Array.isArray(result) ? result : (result.data || [])

        // Filter out incomplete transactions (minimal client-side filtering)
        const completedTransactions = transactions.filter(transaction => {
          const hasPaymentMethod = transaction.payment_method && transaction.payment_method.trim() !== ''
          const hasProofOfPayment = transaction.proof_of_payment && transaction.proof_of_payment.trim() !== ''
          const isAdminBooking = transaction.user?.role === 'admin' || transaction.user?.role === 'staff'
          const isPendingPayment = transaction.payment_method === 'pending'

          return (hasPaymentMethod && hasProofOfPayment) ||
                 (isAdminBooking && isPendingPayment) ||
                 (hasPaymentMethod && (transaction.approval_status === 'pending_waitlist' ||
                                       transaction.approval_status === 'approved' ||
                                       transaction.approval_status === 'rejected'))
        })

        // Map transactions with minimal processing
        pendingBookings.value = completedTransactions.map(transaction => ({
          ...transaction,
          approving: false,
          user_name: transaction.user?.name || 'N/A',
          court_name: transaction.cart_items?.[0]?.court?.name || 'Multiple Courts',
          total_price: parseFloat(transaction.total_price) || 0,
          payment_status: transaction.payment_status,
          isTransaction: true,
          transaction_id: transaction.id,
          items_count: transaction.cart_items?.length || 0
        }))
      } catch (error) {
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

        // Optimized refresh: Only update the specific transaction instead of reloading all
        const updatedTransaction = {
          ...transaction,
          approval_status: 'approved',
          approved_at: new Date().toISOString()
        }
        const index = pendingBookings.value.findIndex(b => b.id === bookingId)
        if (index !== -1) {
          pendingBookings.value[index] = updatedTransaction
        }

        // Load stats separately (lightweight operation)
        loadStats()

        // Dispatch event to refresh other components
        window.dispatchEvent(new CustomEvent('booking-updated'))

      } catch (error) {
        showSnackbar('Failed to approve booking', 'error')
        // On error, reload the full data
        await loadPendingBookings()
        await loadStats()
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

        // Optimized refresh: Only update the specific transaction instead of reloading all
        const index = pendingBookings.value.findIndex(b => b.id === selectedBookingId.value)
        if (index !== -1) {
          const updatedTransaction = {
            ...pendingBookings.value[index],
            approval_status: 'rejected',
            rejection_reason: rejectReason.value,
            approved_at: new Date().toISOString()
          }
          pendingBookings.value[index] = updatedTransaction
        }

        // Load stats separately (lightweight operation)
        loadStats()

        // Dispatch event to refresh other components
        window.dispatchEvent(new CustomEvent('booking-updated'))

      } catch (error) {
        showSnackbar('Failed to reject transaction', 'error')
        // On error, reload the full data
        await loadPendingBookings()
        await loadStats()
      } finally {
        rejecting.value = false
      }
    }

    const exportToExcel = async () => {
      try {
        const workbook = new ExcelJS.Workbook()
        workbook.creator = 'Admin Dashboard'
        workbook.created = new Date()

        // Create Summary Sheet
        const summarySheet = workbook.addWorksheet('Summary', {
          views: [{ state: 'frozen', xSplit: 0, ySplit: 1 }]
        })

        // Define Summary columns
        summarySheet.columns = [
          { header: 'Booking ID', key: 'id', width: 12 },
          { header: 'User', key: 'user', width: 25 },
          { header: 'Email', key: 'email', width: 30 },
          { header: 'Sports', key: 'sports', width: 20 },
          { header: 'Courts', key: 'courts', width: 35 },
          { header: 'Booking Date', key: 'bookingDate', width: 15 },
          { header: 'Overall Time Range', key: 'timeRange', width: 20 },
          { header: 'Court Booking Amount', key: 'bookingAmount', width: 18 },
          { header: 'POS Amount', key: 'posAmount', width: 15 },
          { header: 'Total Price', key: 'totalPrice', width: 15 },
          { header: 'Payment Status', key: 'paymentStatus', width: 18 },
          { header: 'Approval Status', key: 'approvalStatus', width: 18 },
          { header: 'Attendance', key: 'attendance', width: 15 },
          { header: 'Admin Notes', key: 'adminNotes', width: 30 },
          { header: 'Client Notes', key: 'clientNotes', width: 30 }
        ]

        // Style the header row
        summarySheet.getRow(1).font = { bold: true, size: 11 }
        summarySheet.getRow(1).fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FF3B82F6' }
        }
        summarySheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } }
        summarySheet.getRow(1).alignment = { vertical: 'middle', horizontal: 'center' }

        // Sort transactions by booking date and time range
        const sortedTransactions = [...filteredTransactions.value].sort((a, b) => {
          const aDate = a.cart_items?.[0]?.booking_date || ''
          const bDate = b.cart_items?.[0]?.booking_date || ''

          // First sort by date
          if (aDate !== bDate) {
            return aDate.localeCompare(bDate)
          }

          // Then sort by start time
          const aStartTime = a.cart_items?.[0]?.start_time || ''
          const bStartTime = b.cart_items?.[0]?.start_time || ''
          return aStartTime.localeCompare(bStartTime)
        })

        // Add Summary data
        sortedTransactions.forEach(transaction => {
          const cartItems = transaction.cart_items || []

          // Get unique sports
          const sports = getUniqueSports(transaction).map(s => s.name).join(', ') || 'N/A'

          // Get unique courts concatenated
          const uniqueCourts = [...new Set(cartItems.map(item => item.court?.name || 'Unknown'))]
          const courts = uniqueCourts.join(', ')

          // Get booking date from first cart item
          const bookingDate = cartItems[0]?.booking_date ? formatDate(cartItems[0].booking_date) : 'N/A'

          // Calculate overall time range
          let timeRange = 'N/A'
          if (cartItems.length > 0) {
            // Cart items have start_time and end_time directly (not in time_slots array)
            const itemsWithTimes = cartItems.filter(item => item.start_time && item.end_time)
            if (itemsWithTimes.length > 0) {
              // Get all start and end times with proper datetime format
              const times = itemsWithTimes.flatMap(item => {
                // Extract just the time portion (HH:MM:SS or HH:MM)
                const startTimeStr = item.start_time
                const endTimeStr = item.end_time
                return [
                  { time: startTimeStr, isStart: true },
                  { time: endTimeStr, isStart: false }
                ]
              })

              // Extract just the time strings for comparison
              const startTimes = times.filter(t => t.isStart).map(t => t.time)
              const endTimes = times.filter(t => !t.isStart).map(t => t.time)

              // Sort and get earliest start and latest end
              startTimes.sort()
              endTimes.sort()

              const earliestStart = startTimes[0]
              const latestEnd = endTimes[endTimes.length - 1]

              if (earliestStart && latestEnd) {
                timeRange = `${earliestStart} - ${latestEnd}`
              }
            }
          }

          const row = summarySheet.addRow({
            id: transaction.id,
            user: getDisplayUserName(transaction),
            email: getDisplayUserEmail(transaction),
            sports: sports,
            courts: courts,
            bookingDate: bookingDate,
            timeRange: timeRange,
            bookingAmount: parseFloat(transaction.booking_amount ?? 0),
            posAmount: parseFloat(transaction.pos_amount ?? 0),
            totalPrice: parseFloat(transaction.total_price ?? 0),
            paymentStatus: getPaymentStatusText(transaction),
            approvalStatus: getApprovalStatusText(transaction.approval_status),
            attendance: getAttendanceLabel(transaction.attendance_status),
            adminNotes: cartItems[0]?.admin_notes || '',
            clientNotes: cartItems[0]?.notes || ''
          })

          // Apply currency format to price cells
          row.getCell('bookingAmount').numFmt = '₱#,##0.00'
          row.getCell('posAmount').numFmt = '₱#,##0.00'
          row.getCell('totalPrice').numFmt = '₱#,##0.00'
        })

        // Create Detailed Sheet
        const detailedSheet = workbook.addWorksheet('Detailed', {
          views: [{ state: 'frozen', xSplit: 0, ySplit: 1 }]
        })

        // Define Detailed columns
        detailedSheet.columns = [
          { header: 'Booking ID', key: 'id', width: 12 },
          { header: 'User', key: 'user', width: 25 },
          { header: 'Email', key: 'email', width: 30 },
          { header: 'Sport', key: 'sport', width: 20 },
          { header: 'Court', key: 'court', width: 25 },
          { header: 'Booking Date', key: 'bookingDate', width: 15 },
          { header: 'Time Slot', key: 'timeSlot', width: 20 },
          { header: 'Price', key: 'price', width: 15 },
          { header: 'Payment Status', key: 'paymentStatus', width: 18 },
          { header: 'Approval Status', key: 'approvalStatus', width: 18 },
          { header: 'Attendance', key: 'attendance', width: 15 },
          { header: 'Admin Notes', key: 'adminNotes', width: 30 },
          { header: 'Client Notes', key: 'clientNotes', width: 30 }
        ]

        // Style the header row
        detailedSheet.getRow(1).font = { bold: true, size: 11 }
        detailedSheet.getRow(1).fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FF10B981' }
        }
        detailedSheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } }
        detailedSheet.getRow(1).alignment = { vertical: 'middle', horizontal: 'center' }

        // Add Detailed data (use the same sorted transactions)
        sortedTransactions.forEach(transaction => {
          const cartItems = transaction.cart_items || []

          // Sort cart items by booking date and start time
          const sortedCartItems = [...cartItems].sort((a, b) => {
            const aDate = a.booking_date || ''
            const bDate = b.booking_date || ''

            if (aDate !== bDate) {
              return aDate.localeCompare(bDate)
            }

            const aStartTime = a.start_time || ''
            const bStartTime = b.start_time || ''
            return aStartTime.localeCompare(bStartTime)
          })

          sortedCartItems.forEach(item => {
            const court = item.court?.name || 'Unknown'
            const sport = item.sport?.name || 'N/A'
            const bookingDate = item.booking_date ? formatDate(item.booking_date) : 'N/A'

            // Cart items have start_time and end_time directly (not in time_slots array)
            const startTime = item.start_time || 'N/A'
            const endTime = item.end_time || 'N/A'
            const timeSlot = (startTime !== 'N/A' && endTime !== 'N/A')
              ? `${startTime} - ${endTime}`
              : 'N/A'

            const row = detailedSheet.addRow({
              id: transaction.id,
              user: getDisplayUserName(transaction),
              email: getDisplayUserEmail(transaction),
              sport: sport,
              court: court,
              bookingDate: bookingDate,
              timeSlot: timeSlot,
              price: parseFloat(item.price ?? 0),
              paymentStatus: getPaymentStatusText(transaction),
              approvalStatus: getApprovalStatusText(transaction.approval_status),
              attendance: getAttendanceLabel(transaction.attendance_status),
              adminNotes: item.admin_notes || '',
              clientNotes: item.notes || ''
            })

            // Apply currency format to Price cell
            row.getCell('price').numFmt = '₱#,##0.00'
          })
        })

        // Generate Excel file
        const buffer = await workbook.xlsx.writeBuffer()
        const blob = new Blob([buffer], {
          type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        })
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `bookings-export-${new Date().toISOString().split('T')[0]}.xlsx`
        a.click()
        window.URL.revokeObjectURL(url)

        showSnackbar('Excel file exported successfully', 'success')
      } catch (error) {
        console.error('Export error:', error)
        showSnackbar('Failed to export Excel file', 'error')
      }
    }

    // Use imported functions with local aliases
    const formatTime = formatTimeOnly
    const getApprovalStatusText = formatApprovalStatus
    const getBookingPaymentStatus = getPaymentStatus
    const getAttendanceLabel = formatAttendanceLabel

    const getApprovalStatusIcon = (status) => {
      const icons = {
        'approved': 'mdi-check-circle',
        'rejected': 'mdi-close-circle',
        'pending': 'mdi-clock-alert',
        'pending_waitlist': 'mdi-clock-check'
      }
      return icons[status] || 'mdi-clock-alert'
    }

    // Additional helper functions for booking details
    const viewBookingDetails = async (booking) => {
      // Fetch fresh booking data with all relationships to ensure POS sales are included
      try {
        // Determine if this is a cart transaction or regular booking
        const endpoint = booking.isTransaction
          ? `${import.meta.env.VITE_API_URL}/api/cart-transactions/${booking.id}`
          : `${import.meta.env.VITE_API_URL}/api/bookings/${booking.id}`

        const response = await fetch(endpoint, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Accept': 'application/json'
          }
        })

        if (response.ok) {
          const bookingData = await response.json()
          // API may return { success: true, data: booking } or just the booking
          selectedBooking.value = bookingData.data || bookingData
        } else {
          // Fallback to cached data if fetch fails
          selectedBooking.value = booking
        }
      } catch (error) {
        console.error('Error fetching booking details:', error)
        // Fallback to cached data
        selectedBooking.value = booking
      }

      detailsDialog.value = true
    }

    const handleAttendanceUpdated = async ({ bookingId, status }) => {
      // Optimized refresh: Update the transaction in the list directly
      const transaction = pendingBookings.value.find(b => b.id === bookingId)
      if (transaction) {
        transaction.attendance_status = status
      }

      // Only reload stats, not the full booking list
      await loadStats()
      await loadPosStats()

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
      return statusFilter.value.length > 0 ||
             userFilter.value !== '' ||
             sportFilter.value !== null ||
             paymentStatusFilter.value.length > 0 ||
             dateFromFilter.value !== '' ||
             dateToFilter.value !== ''
    })

    // Clear all filters function
    const clearAllFilters = () => {
      statusFilter.value = []
      userFilter.value = ''
      sportFilter.value = null
      paymentStatusFilter.value = []
      // Reset date filters to default values (current month range)
      dateFromFilter.value = dateFromString
      dateToFilter.value = dateToString
    }

    // Handle sort changes
    const handleSortChange = (sortByArray) => {
      if (sortByArray && sortByArray.length > 0) {
        const sortItem = sortByArray[0]
        sortBy.value = sortItem.key
        sortOrder.value = sortItem.order || 'asc'
        sortByModel.value = sortByArray

        // Reload data with new sorting
        loadPendingBookings()
      } else {
        // Reset to default sorting
        sortBy.value = 'created_at'
        sortOrder.value = 'asc'
        sortByModel.value = [{ key: 'created_at', order: 'asc' }]
        loadPendingBookings()
      }
    }

    // Computed properties for transaction counts
    const pendingTransactionsCount = computed(() => {
      return pendingBookings.value.filter(t => {
        const status = t.approval_status || 'pending'
        return status === 'pending' || status === 'pending_waitlist'
      }).length
    })

    const approvedTransactionsCount = computed(() => {
      return pendingBookings.value.filter(t => t.approval_status === 'approved').length
    })

    const rejectedTransactionsCount = computed(() => {
      return pendingBookings.value.filter(t => t.approval_status === 'rejected').length
    })

    // Computed property for filtered transactions - Optimized (most filtering now done server-side)
    const filteredTransactions = computed(() => {
      // Since most filtering is now done server-side, we only need minimal client-side filtering
      // This is mainly for special cases that are difficult to handle server-side

      let filtered = pendingBookings.value

      // Special handling for 'pending_waitlist' filter on client side
      // This ensures we show transactions with waitlist entries correctly
      if (statusFilter.value.includes('pending_waitlist')) {
        filtered = filtered.filter(transaction => {
          const hasWaitlistQueue = transaction.waitlist_entries && transaction.waitlist_entries.length > 0
          const isNotApproved = transaction.approval_status !== 'approved'
          return hasWaitlistQueue && isNotApproved
        })
      }

      return filtered
    })

    // QR Scanner functions

    // Attendance status helper functions (imported from formatters)

    // Helper function to get unique sports from a transaction
    const getUniqueSports = (transaction) => {
      if (!transaction.cart_items || transaction.cart_items.length === 0) {
        return []
      }

      // Extract all sports from cart items
      const sportsMap = new Map()
      transaction.cart_items.forEach(item => {
        // Use item.sport directly - this is the sport that was actually selected for the booking
        // NOT item.court.sport which is just the default sport for the court
        const sport = item.sport
        if (sport && sport.name) {
          // Use sport name as key to avoid duplicates
          if (!sportsMap.has(sport.name)) {
            sportsMap.set(sport.name, {
              name: sport.name,
              icon: sport.icon
            })
          }
        }
      })

      // Return array of unique sports
      return Array.from(sportsMap.values())
    }

    // Helper functions to determine display user for admin bookings
    const isAdminBooking = (transaction) => {
      // Check if the first cart item has booking_for_user_id or booking_for_user_name
      const firstCartItem = transaction.cart_items?.[0]
      return firstCartItem && (firstCartItem.booking_for_user_id || firstCartItem.booking_for_user_name)
    }

    const getDisplayUserName = (transaction) => {
      const firstCartItem = transaction.cart_items?.[0]

      // If this is an admin booking, return the "booking for" user
      if (firstCartItem?.booking_for_user_name) {
        return firstCartItem.booking_for_user_name
      }

      // Otherwise, return the transaction creator
      return transaction.user?.name || 'N/A'
    }

    const getDisplayUserEmail = (transaction) => {
      const firstCartItem = transaction.cart_items?.[0]

      // If this is an admin booking with a registered user, return their email
      if (firstCartItem?.booking_for_user_id && firstCartItem?.booking_for_user) {
        return firstCartItem.booking_for_user.email || 'No email'
      }

      // If this is an admin booking for a walk-in customer, show that
      if (firstCartItem?.booking_for_user_name && !firstCartItem?.booking_for_user_id) {
        return 'Walk-in customer'
      }

      // Otherwise, return the transaction creator's email
      return transaction.user?.email || 'No email'
    }

    const getBookedByUserRoleColor = (transaction) => {
      const role = transaction.user?.role?.toLowerCase()
      if (role === 'admin') return 'purple'
      if (role === 'staff') return 'blue'
      return 'info'
    }

    const getBookedByUserRoleIcon = (transaction) => {
      const role = transaction.user?.role?.toLowerCase()
      if (role === 'admin') return 'mdi-shield-crown'
      if (role === 'staff') return 'mdi-account-badge'
      return 'mdi-account-tie'
    }

    // Listen for booking refresh events - Use selective refresh
    const handleBookingRefresh = () => {
      // Only reload stats if not actively loading bookings
      if (!loading.value) {
        loadStats()
        loadPosStats()
      }
      // Don't automatically reload bookings - let user manually refresh if needed
      // This prevents disrupting their current view/filters
    }

    // Handle calendar month changes to update date filters
    const handleCalendarMonthChanged = (monthData) => {
      if (viewMode.value === 'calendar') {
        // Update date filters based on calendar month
        dateFromFilter.value = monthData.firstDay
        dateToFilter.value = monthData.lastDay
      }
    }

    // Track if component is mounted to prevent watcher from firing during initial setup
    const isMounted = ref(false)

    // Store previous status filter state to restore when waitlist filter is removed
    const previousStatusFilter = ref(['pending', 'approved'])

    // Watch status filter to handle exclusive waitlist queue filter
    watch(statusFilter, (newValue, oldValue) => {
      // Only react to changes after the component has mounted
      if (!isMounted.value) {
        return
      }

      const hasWaitlist = newValue.includes('pending_waitlist')
      const hadWaitlist = oldValue.includes('pending_waitlist')
      const hasOtherFilters = newValue.some(f => f !== 'pending_waitlist')

      // If waitlist was just added
      if (hasWaitlist && !hadWaitlist) {
        // Save current filters (excluding waitlist) before clearing
        previousStatusFilter.value = oldValue.filter(f => f !== 'pending_waitlist')
        // Clear all other filters and keep only waitlist
        statusFilter.value = ['pending_waitlist']
      }
      // If waitlist is active and user added other filters
      else if (hasWaitlist && hasOtherFilters && oldValue.length === 1 && oldValue[0] === 'pending_waitlist') {
        // Remove waitlist and keep the newly selected filters
        statusFilter.value = newValue.filter(f => f !== 'pending_waitlist')
      }
      // If waitlist was just removed
      else if (!hasWaitlist && hadWaitlist) {
        // Only restore if the user manually removed waitlist (not when replaced by other filters)
        if (newValue.length === 0) {
          // Restore previous filters or default to pending and approved
          statusFilter.value = previousStatusFilter.value.length > 0
            ? previousStatusFilter.value
            : ['pending', 'approved']
        }
      }
    })

    // Watch filters and trigger server-side reload when they change
    let filterDebounceTimeout = null
    watch([statusFilter, paymentStatusFilter, sportFilter], () => {
      // Only react to changes after the component has mounted
      if (!isMounted.value) return

      // Clear existing timeout
      if (filterDebounceTimeout) {
        clearTimeout(filterDebounceTimeout)
      }

      // Debounce the reload to avoid rapid API calls
      filterDebounceTimeout = setTimeout(() => {
        loadPendingBookings()
      }, 300) // 300ms debounce
    })

    // Watch user filter with longer debounce (for text input)
    let userFilterTimeout = null
    watch(userFilter, () => {
      // Only react to changes after the component has mounted
      if (!isMounted.value) return

      // Clear existing timeout
      if (userFilterTimeout) {
        clearTimeout(userFilterTimeout)
      }

      // Debounce the reload to avoid rapid API calls during typing
      userFilterTimeout = setTimeout(() => {
        loadPendingBookings()
      }, 500) // 500ms debounce for text input
    })

    // Watch date filters and reload data when they change (with debounce)
    let dateFilterTimeout = null
    watch([dateFromFilter, dateToFilter], ([newDateFrom, newDateTo]) => {
      // Only react to changes after the component has mounted
      // This prevents the watcher from interfering with the initial load
      if (!isMounted.value) {
        return
      }

      // Update URL params to persist filters on page reload
      const url = new URL(window.location)
      if (newDateFrom) {
        url.searchParams.set('date_from', newDateFrom)
      } else {
        url.searchParams.delete('date_from')
      }
      if (newDateTo) {
        url.searchParams.set('date_to', newDateTo)
      } else {
        url.searchParams.delete('date_to')
      }
      window.history.replaceState({}, '', url)

      // Debounce the API call to avoid multiple rapid requests when setting both dates
      if (dateFilterTimeout) {
        clearTimeout(dateFilterTimeout)
      }
      dateFilterTimeout = setTimeout(() => {
        loadPendingBookings()
      }, 500) // Wait 500ms after the last change
    })

    onMounted(async () => {
      // Get current user and check if admin
      try {
        currentUser.value = await authService.getCurrentUser()
        isAdmin.value = currentUser.value?.role === 'admin'
      } catch (error) {
        console.error('Failed to get current user:', error)
        isAdmin.value = false
      }

      // Check URL params for date filters (to restore state on page reload)
      const urlParams = new URLSearchParams(window.location.search)
      if (urlParams.has('date_from')) {
        dateFromFilter.value = urlParams.get('date_from')
      }
      if (urlParams.has('date_to')) {
        dateToFilter.value = urlParams.get('date_to')
      }

      loadStats()
      loadPosStats() // Will only load if user is admin
      loadSports()
      loadPendingBookings()

      // Mark as mounted after initial load completes
      // Use nextTick to ensure the initial load has started
      setTimeout(() => {
        isMounted.value = true
      }, 100)

      // Listen for custom events to refresh admin data
      window.addEventListener('booking-created', handleBookingRefresh)
      window.addEventListener('booking-updated', handleBookingRefresh)
      window.addEventListener('booking-cancelled', handleBookingRefresh)
    })

    onUnmounted(() => {
      // Clean up timeouts
      if (dateFilterTimeout) {
        clearTimeout(dateFilterTimeout)
      }
      if (filterDebounceTimeout) {
        clearTimeout(filterDebounceTimeout)
      }
      if (userFilterTimeout) {
        clearTimeout(userFilterTimeout)
      }

      // Clean up event listeners
      window.removeEventListener('booking-created', handleBookingRefresh)
      window.removeEventListener('booking-updated', handleBookingRefresh)
      window.removeEventListener('booking-cancelled', handleBookingRefresh)
    })

    return {
      stats,
      posStats,
      pendingBookings,
      loading,
      rejecting,
      rejectDialog,
      rejectReason,
      detailsDialog,
      selectedBooking,
      snackbar,
      headers,
      statusFilter,
      userFilter,
      sportFilter,
      paymentStatusFilter,
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
      exportToExcel,
      formatDate,
      formatTime,
      // Payment status functions
      getBookingPaymentStatus,
      getPaymentStatusColor,
      getPaymentStatusText,
      getPaymentStatusIcon,
      // Approval status functions
      getApprovalStatusColor,
      getApprovalStatusText,
      getApprovalStatusIcon,
      // Booking details functions
      viewBookingDetails,
      handleAttendanceUpdated,
      formatPrice,
      // Attendance status functions
      getAttendanceColor,
      getAttendanceIcon,
      getAttendanceLabel,
      // Sport display functions
      getUniqueSports,
      // Admin booking display functions
      isAdminBooking,
      getDisplayUserName,
      getDisplayUserEmail,
      getBookedByUserRoleColor,
      getBookedByUserRoleIcon,
      // Services
      sportService,
      // Sorting
      sortByModel,
      sortBy,
      sortOrder,
      handleSortChange,
      // View mode
      viewMode,
      // Calendar handlers
      handleCalendarMonthChanged,
      // Role-based access
      isAdmin
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
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(59, 130, 246, 0.3);
  border-radius: 50px;
  padding: 8px 20px;
  margin-bottom: 24px;
  color: #1e293b;
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
  background: linear-gradient(135deg, #3b82f6 0%, #10b981 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.header-subtitle {
  font-size: clamp(1.1rem, 2vw, 1.3rem);
  color: #475569;
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

.stat-card-5:hover {
  background: linear-gradient(135deg, rgba(59, 130, 246, 0.05) 0%, rgba(59, 130, 246, 0.02) 100%);
}

.stat-card-6:hover {
  background: linear-gradient(135deg, rgba(245, 158, 11, 0.05) 0%, rgba(245, 158, 11, 0.02) 100%);
}

.stat-card-7:hover {
  background: linear-gradient(135deg, rgba(156, 39, 176, 0.05) 0%, rgba(156, 39, 176, 0.02) 100%);
}

.stat-card-8:hover {
  background: linear-gradient(135deg, rgba(16, 185, 129, 0.05) 0%, rgba(16, 185, 129, 0.02) 100%);
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
  color: #475569;
  margin-bottom: 12px;
}

.stat-trend {
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.9rem;
  font-weight: 600;
}

/* Utility Classes */
.gap-1 {
  gap: 4px;
}

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

  .stat-card {
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

  .stat-card {
    padding: 20px;
  }
}

/* Notes cell styling */
.notes-cell {
  max-width: 250px;
}

.notes-preview {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  cursor: help;
  font-size: 0.875rem;
  color: #475569;
}

.notes-preview:hover {
  color: #1976d2;
  text-decoration: underline;
}
</style>

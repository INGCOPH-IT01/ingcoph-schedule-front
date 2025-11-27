<template>
  <div class="bookings-container">
    <!-- Enhanced Header -->
    <div class="bookings-header">
      <div class="header-content">
        <div class="header-badge">
          <v-icon color="#B71C1C" size="20" class="mr-2">mdi-receipt-text-check</v-icon>
          Transaction Management
        </div>
        <h1 class="header-title">
          <span class="title-gradient">My</span> Transactions
        </h1>
        <p class="header-subtitle">
          Track your booking transactions and approval status
        </p>
        <div class="header-actions">
          <v-btn
            v-if="isAdmin || canUsersBook"
            class="header-btn-primary"
            size="x-large"
            prepend-icon="mdi-calendar-plus"
            @click="openBookingDialog"
            elevation="8"
          >
            New Booking
          </v-btn>
        </div>
      </div>
    </div>


    <!-- Authentication Loading -->
    <div v-if="authLoading" class="auth-section">
      <div class="auth-card">
        <div class="auth-icon">
          <v-progress-circular indeterminate color="primary" size="64"></v-progress-circular>
        </div>
        <h2 class="auth-title">Checking Authentication...</h2>
        <p class="auth-text">Please wait while we verify your login status.</p>
      </div>
    </div>

    <!-- Authentication Check -->
    <div v-else-if="!isAuthenticated" class="auth-section">
      <div class="auth-card">
        <div class="auth-icon">
          <v-icon color="primary" size="64">mdi-shield-lock</v-icon>
        </div>
        <h2 class="auth-title">Authentication Required</h2>
        <p class="auth-text">Please login to view your bookings and manage your reservations.</p>
        <v-btn
          class="auth-btn"
          size="large"
          :to="{ name: 'Login' }"
          prepend-icon="mdi-login"
          elevation="4"
        >
          Login to Continue
        </v-btn>
      </div>
    </div>

    <!-- Main Content -->
    <div v-if="isAuthenticated">
      <!-- Transactions Card -->
      <v-row>
        <v-col cols="12">
          <v-card>
            <v-card-title class="text-h5 pa-6 pb-4">
              <div class="d-flex align-center justify-space-between w-100">
                <div class="d-flex align-center">
                  <v-icon class="mr-2" color="primary">mdi-receipt-text</v-icon>
                  My Transactions
                </div>
                <v-chip-group
                  v-model="viewMode"
                  mandatory
                  selected-class="text-primary"
                >
                  <v-chip value="cards" variant="outlined" filter>
                    <v-icon start>mdi-view-grid-outline</v-icon>
                    Cards
                  </v-chip>
                  <v-chip value="table" variant="outlined" filter>
                    <v-icon start>mdi-table</v-icon>
                    Data Table
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
                    <v-icon start>mdi-clock-check</v-icon>
                    Waitlist Pending
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
                </v-chip-group>
              </div>

              <!-- Additional Filters -->
              <v-row>
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
                    label="Booking Date From"
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
                    label="Booking Date To"
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
                    @click="fetchBookings"
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
                    @click="clearFilters"
                  >
                    Clear All Filters
                  </v-btn>
                </v-col>
              </v-row>
            </div>

            <v-divider></v-divider>

            <!-- Results Count -->
            <div class="px-4 py-2 text-caption" style="color: #475569;">
              Showing {{ filteredTransactions.length }} of {{ flattenedBookings.length }} transaction{{ flattenedBookings.length !== 1 ? 's' : '' }}
            </div>

            <!-- Data Table View -->
            <v-data-table
              v-if="viewMode === 'table'"
              :headers="tableHeaders"
              :items="filteredTransactions"
              :loading="loading"
              class="elevation-0"
              no-data-text="No transactions found"
            >
              <template v-slot:[`item.user_name`]="{ item }">
                <div class="d-flex align-center">
                  <v-avatar size="28" color="primary" class="mr-2">
                    <span class="text-white">{{ (getFirstCartItemBookingForName(item) || item.user?.name || 'U').charAt(0).toUpperCase() }}</span>
                  </v-avatar>
                  <div>
                    <div class="font-weight-medium">
                      {{ getFirstCartItemBookingForName(item) || item.user?.name || 'Unknown' }}
                    </div>
                    <div class="text-caption" style="color: #64748b;">
                      {{ item.user?.email || (getFirstCartItemBookingForName(item) ? 'Walk-in customer' : 'No email') }}
                    </div>
                  </div>
                </div>
              </template>

              <template v-slot:[`item.court_name`]="{ item }">
                {{ item.court?.name || 'Unknown Court' }}
              </template>

              <template v-slot:[`item.sport_name`]="{ item }">
                {{ item.sport?.name || item.court?.sport?.name || 'Unknown Sport' }}
              </template>

              <template v-slot:[`item.booking_date`]="{ item }">
                {{ formatDate(item.booking_date) }}
              </template>

              <template v-slot:[`item.time_slots`]="{ item }">
                {{ getGroupedTimeDisplay(item.cart_items) }}
              </template>

              <template v-slot:[`item.total_price`]="{ item }">
                <div class="text-h6 font-weight-bold text-success">
                  ₱{{ parseFloat(item.price || 0).toFixed(2) }}
                </div>
              </template>

              <template v-slot:[`item.payment_status`]="{ item }">
                <v-chip :color="getPaymentStatusColor(item)" variant="tonal" size="small">
                  <v-icon class="mr-1" size="small">{{ getPaymentStatusIcon(item) }}</v-icon>
                  {{ getPaymentStatusText(item) }}
                </v-chip>
              </template>

              <template v-slot:[`item.approval_status`]="{ item }">
                <v-chip :color="getApprovalStatusColor(item.approval_status)" variant="tonal" size="small">
                  {{ formatApprovalStatus(item.approval_status) }}
                </v-chip>
              </template>

              <template v-slot:[`item.actions`]="{ item }">
                <div class="d-flex gap-2">
                  <v-btn
                    icon="mdi-eye"
                    size="small"
                    variant="tonal"
                    color="primary"
                    @click="viewBooking(item)"
                  ></v-btn>
                  <v-btn
                    v-if="((item.approval_status === 'pending' || item.approval_status === 'pending_waitlist') && item.payment_status !== 'paid') || isBookingExpired(item)"
                    icon="mdi-delete"
                    size="small"
                    variant="tonal"
                    color="error"
                    @click="cancelBooking(item)"
                  ></v-btn>
                </div>
              </template>
            </v-data-table>

            <!-- Cards View -->
            <div v-if="viewMode === 'cards'" class="pa-4">
              <v-progress-circular
                v-if="loading"
                indeterminate
                color="primary"
                size="64"
                class="loading-spinner"
              ></v-progress-circular>

              <div v-else-if="transactions.length === 0" class="no-bookings text-center py-8">
                <v-icon size="80" color="grey-lighten-1">mdi-receipt-text-remove</v-icon>
                <h3 class="mt-4">No transactions found</h3>
                <p class="text-grey">Your booking transactions will appear here after checkout</p>
                <v-btn
                  v-if="canUsersBook"
                  color="primary"
                  class="mt-4"
                  @click="openBookingDialog"
                >
                  <v-icon start>mdi-plus</v-icon>
                  Create New Booking
                </v-btn>
              </div>

              <div v-else class="bookings-grid">
                <BookingCard
                  v-for="booking in filteredTransactions"
                  :key="booking.id"
                  v-memo="[booking.id, booking.approval_status, booking.updated_at, booking.payment_status]"
                  :booking="booking"
                  @view="viewBooking"
                  @cancel="cancelBooking"
                />
              </div>
            </div>
          </v-card>
        </v-col>
      </v-row>

      <!-- Old Data Table (Hidden) -->
          <div v-if="false" class="excel-table-container">
            <v-data-table
              :headers="headers"
              :items="filteredBookings"
              :loading="loading"
              :items-per-page="15"
              class="excel-data-table"
              no-data-text="No bookings found"
              loading-text="Loading bookings..."
              :item-props="itemProps"
              show-expand
              :expanded="expanded"
            >
              <template v-slot:item="{ item }">
                <tr class="excel-table-row">
                  <td class="excel-cell">
                    <div class="excel-cell-content">
                      <div class="excel-cell-text">
                        <div class="excel-cell-title">{{ item.court?.name || 'Unknown Court' }}</div>
                        <div class="excel-cell-subtitle">{{ item.sport?.name || 'Unknown Sport' }}</div>
                      </div>
                    </div>
                  </td>
                  <td class="excel-cell">
                    <div v-if="item.status === 'recurring_schedule'" class="excel-datetime">
                      <div class="excel-date">{{ formatDate(item.start_time) }} - {{ formatDate(item.end_time) }}</div>
                      <div class="excel-time">
                        {{ formatRecurrenceType(item.recurring_schedule_data?.recurrence_type) }}
                      </div>
                    </div>
                    <div v-else-if="item.frequency_type" class="excel-datetime">
                      <div class="excel-date">{{ formatDate(item.start_time) }}</div>
                      <div class="excel-time">
                        {{ formatTime(item.start_time) }} - {{ formatTime(item.end_time) }}
                      </div>
                      <div class="excel-frequency">
                        <v-chip
                          :color="getFrequencyColor(item.frequency_type)"
                          variant="tonal"
                          size="x-small"
                          class="mt-1"
                        >
                          {{ formatFrequencyType(item.frequency_type) }}
                        </v-chip>
                      </div>
                    </div>
                    <div v-else class="excel-datetime">
                      <div class="excel-date">{{ formatDate(item.start_time) }}</div>
                      <div class="excel-time">
                        {{ formatTime(item.start_time) }} - {{ formatTime(item.end_time) }}
                      </div>
                    </div>
                  </td>
            <td class="excel-cell">
              <div v-if="item.status === 'recurring_schedule'">
                <v-chip
                  color="primary"
                  variant="tonal"
                  size="small"
                  class="excel-duration-chip"
                >
                  {{ getRecurringDurationText(item.recurring_schedule_data) }}
                </v-chip>
              </div>
              <div v-else-if="item.frequency_type">
                <div class="excel-frequency-details">
                  <v-chip
                    color="info"
                    variant="tonal"
                    size="small"
                    class="excel-duration-chip mb-1"
                  >
                    {{ getDuration(item.start_time, item.end_time) }}h per session
                  </v-chip>
                  <div class="text-caption text-medium-emphasis">
                    {{ getFrequencyDetailsText(item) }}
                  </div>
                </div>
              </div>
              <div v-else>
                <v-chip
                  color="info"
                  variant="tonal"
                  size="small"
                  class="excel-duration-chip"
                >
                  {{ getDuration(item.start_time, item.end_time) }}h
                </v-chip>
              </div>
            </td>
            <td class="excel-cell">
              <div class="excel-creator">
                <div class="excel-creator-content">
                  <div class="excel-creator-icon">👤</div>
                  <div class="excel-creator-text">
                    <div class="excel-creator-name">{{ item.user?.name || 'Unknown User' }}</div>
                    <div class="excel-creator-email">{{ item.user?.email || '' }}</div>
                  </div>
                </div>
              </div>
            </td>
            <td class="excel-cell">
              <div v-if="item.status === 'recurring_schedule'" class="excel-price">
                <span class="excel-price-amount">{{ getRecurringPriceText(item.recurring_schedule_data) }}</span>
              </div>
              <div v-else-if="item.frequency_type" class="excel-price">
                <div class="excel-frequency-price">
                  <span class="excel-price-amount">{{ formatPriceTemplate(item.total_price) }}</span>
                  <div class="text-caption text-medium-emphasis">
                    Total for {{ item.frequency_duration_months }} month(s)
                  </div>
                </div>
              </div>
              <div v-else class="excel-price">
                <span class="excel-price-amount">₱{{ (parseFloat(item.total_price) || 0).toFixed(2) }}</span>
              </div>
            </td>
            <td class="excel-cell">
              <div class="excel-payment-status">
                <v-tooltip
                  v-if="item.payment_method === 'gcash' && item.gcash_reference"
                  location="top"
                >
                  <template v-slot:activator="{ props }">
                <v-chip
                      v-bind="props"
                      :color="getPaymentStatusColor(item)"
                      variant="tonal"
                      size="small"
                      class="excel-payment-chip"
                    >
                      <v-icon
                        :icon="getPaymentStatusIcon(item)"
                        size="x-small"
                        class="mr-1"
                      ></v-icon>
                      {{ getPaymentStatusText(item) }}
                    </v-chip>
                  </template>
                  <div class="payment-tooltip">
                    <div><strong>GCash Reference:</strong></div>
                    <div>{{ item.gcash_reference }}</div>
                    <div v-if="item.paid_at" class="text-caption mt-1">
                      Paid: {{ formatDate(item.paid_at) }}
                    </div>
                  </div>
                </v-tooltip>
                <v-chip
                  v-else
                  :color="getPaymentStatusColor(item)"
                  variant="tonal"
                  size="small"
                  class="excel-payment-chip"
                >
                  <v-icon
                    :icon="getPaymentStatusIcon(item)"
                    size="x-small"
                    class="mr-1"
                  ></v-icon>
                  {{ getPaymentStatusText(item) }}
                </v-chip>
              </div>
            </td>
            <td class="excel-cell">
              <v-chip
                :color="statusService.getStatusColor(item.status)"
                variant="tonal"
                size="small"
                class="excel-status-chip"
              >
                {{ item.status ? item.status.charAt(0).toUpperCase() + item.status.slice(1) : 'Unknown' }}
              </v-chip>
            </td>
            <td class="excel-cell">
              <div v-if="item.status === 'recurring_schedule'" class="excel-actions">
                <v-btn
                  icon="mdi-calendar-plus"
                  size="small"
                  variant="text"
                  color="success"
                  @click="generateBookings(item)"
                  class="excel-action-btn"
                  title="Generate Bookings"
                ></v-btn>
                <v-btn
                  icon="mdi-pencil"
                  size="small"
                  variant="text"
                  color="warning"
                  @click="editRecurringSchedule(item)"
                  class="excel-action-btn"
                  title="Edit Schedule"
                ></v-btn>
                <v-btn
                  icon="mdi-eye"
                  size="small"
                  variant="text"
                  color="primary"
                  class="excel-action-btn"
                  @click="viewRecurringSchedule(item)"
                  title="View Schedule"
                ></v-btn>
                <v-btn
                  icon="mdi-delete"
                  size="small"
                  variant="text"
                  color="error"
                  @click="deleteRecurringSchedule(item.id)"
                  class="excel-action-btn"
                  title="Delete Schedule"
                ></v-btn>
              </div>
              <div v-else class="excel-actions">
                <v-btn
                  v-if="item.status === 'pending' || item.status === 'approved'"
                  icon="mdi-cancel"
                  size="small"
                  variant="text"
                  color="error"
                  @click="cancelBooking(item.id)"
                  :loading="cancelling === item.id"
                  :disabled="cancelling === item.id"
                  class="excel-action-btn"
                ></v-btn>
                <v-btn
                  icon="mdi-eye"
                  size="small"
                  variant="text"
                  color="primary"
                  class="excel-action-btn"
                  @click="viewBooking(item)"
                ></v-btn>
                <v-btn
                  v-if="item.status === 'approved'"
                  icon="mdi-qrcode"
                  size="small"
                  variant="text"
                  color="success"
                  class="excel-action-btn"
                  @click="showQrCode(item)"
                  title="Show QR Code"
                ></v-btn>
              </div>
            </td>
            <td class="excel-cell">
              <v-chip
                v-if="item.cart_transaction?.cart_items && item.cart_transaction.cart_items.length > 0"
                color="info"
                variant="tonal"
                size="small"
              >
                <v-icon start size="small">mdi-cart</v-icon>
                {{ item.cart_transaction.cart_items.length }} item{{ item.cart_transaction.cart_items.length > 1 ? 's' : '' }}
              </v-chip>
              <span v-else class="text-grey">—</span>
            </td>
          </tr>
              </template>

              <!-- Expanded Row Template -->
              <template v-slot:expanded-row="{ columns, item }">
                <tr>
                  <td :colspan="columns.length" class="pa-0">
                    <v-card flat class="ma-2">
                      <v-card-title class="text-subtitle-1 bg-grey-lighten-4">
                        <v-icon class="mr-2" color="info">mdi-cart-outline</v-icon>
                        Cart Items Details ({{ item.cart_transaction?.cart_items?.length || 0 }} items)
                      </v-card-title>
                      <v-card-text v-if="item.cart_transaction?.cart_items && item.cart_transaction.cart_items.length > 0" class="pa-4">
                        <v-table density="compact">
                          <thead>
                            <tr>
                              <th>Court</th>
                              <th>Date</th>
                              <th>Start Time</th>
                              <th>End Time</th>
                              <th>Duration</th>
                              <th>Price</th>
                            </tr>
                          </thead>
                          <tbody>
                            <tr v-for="cartItem in item.cart_transaction.cart_items" :key="cartItem.id">
                              <td>
                                <div class="d-flex align-center">
                                  <v-icon class="mr-2" size="small" :color="sportService.getSportColor(cartItem.sport?.name)">
                                    {{ sportService.getSportIcon(cartItem.sport?.name, cartItem.sport?.icon) }}
                                  </v-icon>
                                  {{ cartItem.court?.name || 'N/A' }}
                                </div>
                              </td>
                              <td>{{ formatDate(cartItem.booking_date) }}</td>
                              <td>{{ cartItem.start_time }}</td>
                              <td>{{ cartItem.end_time }}</td>
                              <td>{{ calculateCartItemDuration(cartItem.start_time, cartItem.end_time) }}</td>
                              <td>
                                <strong class="text-success">₱{{ parseFloat(cartItem.price).toFixed(2) }}</strong>
                              </td>
                            </tr>
                          </tbody>
                        </v-table>
                        <v-divider class="my-3"></v-divider>
                        <div class="d-flex justify-end">
                          <div class="text-subtitle-2">
                            Total Cart Items: <strong class="text-info">{{ item.cart_transaction.cart_items.length }}</strong>
                          </div>
                        </div>
                      </v-card-text>
                      <v-card-text v-else class="text-center text-grey pa-4">
                        <v-icon size="48" color="grey-lighten-1">mdi-cart-off</v-icon>
                        <div class="mt-2">No cart items associated with this booking</div>
                      </v-card-text>
                    </v-card>
            </td>
          </tr>
              </template>
            </v-data-table>
          </div>
    </div> <!-- end v-if="isAuthenticated" -->

    <!-- Booking Details Dialog -->
    <BookingDetailsDialog
      :is-open="viewDialog"
      @update:is-open="viewDialog = $event"
      :booking="selectedBooking"
      :court-name="selectedBooking?.court?.name"
      :show-admin-features="true"
      :show-court-images="false"
      @close="viewDialog = false"
      @attendance-updated="fetchBookings"
    />

    <!-- Edit Booking Dialog -->
    <v-dialog :model-value="false" max-width="500px" style="display: none;">
      <v-card>
        <v-card-title class="text-h5">
          <v-icon class="mr-2">mdi-pencil</v-icon>
          Edit Booking
        </v-card-title>

        <v-card-text v-if="editingBooking">
          <!-- Show form if editForm exists, otherwise show loading -->
          <div v-if="editingBooking && editForm">
            <!-- Current Booking Data Display -->
          <div class="current-booking-info pa-4 mb-4" style="background-color: #f3e5f5; border: 1px solid #9c27b0; border-radius: 4px;">
              <h4 class="mb-3">
                <v-icon class="mr-2">mdi-information</v-icon>
                Current Booking Information
              </h4>
              <v-row>
                <v-col cols="12" md="6">
                  <div class="info-item">
                    <strong>Court:</strong> {{ editingBooking.court?.name || 'Unknown' }}
                  </div>
                  <div class="info-item">
                    <strong>Sport:</strong> {{ editingBooking.sport?.name || 'Unknown' }}
                  </div>
                  <div class="info-item">
                    <strong>Status:</strong>
                    <v-chip
                      :color="statusService.getStatusColor(editingBooking.status)"
                      variant="tonal"
                      size="small"
                      class="ml-2"
                    >
                      {{ editingBooking.status ? editingBooking.status.charAt(0).toUpperCase() + editingBooking.status.slice(1) : 'Unknown' }}
                    </v-chip>
                  </div>
                </v-col>
                <v-col cols="12" md="6">
                  <div class="info-item">
                    <strong>Date:</strong> {{ formatDate(editingBooking.start_time) }}
                  </div>
                  <div class="info-item">
                    <strong>Time:</strong> {{ formatTime(editingBooking.start_time) }} - {{ formatTime(editingBooking.end_time) }}
                  </div>
                  <div class="info-item">
                    <strong>Duration:</strong> {{ getDuration(editingBooking.start_time, editingBooking.end_time) }} hours
                  </div>
                </v-col>
              </v-row>
              <v-row v-if="editingBooking.notes">
                <v-col cols="12">
                  <div class="info-item">
                    <strong>Notes:</strong> {{ editingBooking.notes }}
                  </div>
                </v-col>
              </v-row>
            </div>
          </div>

          <v-divider class="mb-4"></v-divider>

          <!-- Current Booking Details -->
          <v-card variant="outlined" class="mb-4">
            <v-card-title class="text-h6 pa-4 pb-2">
              <v-icon class="mr-2" color="info">mdi-information</v-icon>
              Current Booking Details
            </v-card-title>
            <v-card-text class="pa-4 pt-0">
              <v-row>
                <v-col cols="12" md="6">
                  <div class="detail-item mb-2">
                    <strong>Booking ID:</strong> #{{ editingBooking.id }}
                  </div>
                  <div class="detail-item mb-2">
                    <strong>Court:</strong> {{ editingBooking.court?.name || 'Unknown' }}
                  </div>
                  <div class="detail-item mb-2">
                    <strong>Sport:</strong> {{ editingBooking.sport?.name || 'Unknown' }}
                  </div>
                  <div class="detail-item mb-2">
                    <strong>Date:</strong> {{ formatDate(editingBooking.start_time) }}
                  </div>
                </v-col>
                <v-col cols="12" md="6">
                  <div class="detail-item mb-2">
                    <strong>Time:</strong> {{ formatTime(editingBooking.start_time) }} - {{ formatTime(editingBooking.end_time) }}
                  </div>
                  <div class="detail-item mb-2">
                    <strong>Duration:</strong> {{ getDuration(editingBooking.start_time, editingBooking.end_time) }} hours
                  </div>
                  <div class="detail-item mb-2">
                    <strong>Status:</strong>
                    <v-chip
                      :color="statusService.getStatusColor(editingBooking.status)"
                      variant="tonal"
                      size="small"
                      class="ml-2"
                    >
                      {{ editingBooking.status ? editingBooking.status.charAt(0).toUpperCase() + editingBooking.status.slice(1) : 'Unknown' }}
                    </v-chip>
                  </div>
                  <div class="detail-item mb-2">
                    <strong>Total Price:</strong> {{ formatPriceTemplate(editingBooking.total_price) }}
                  </div>
                </v-col>
              </v-row>

              <!-- Frequency Booking Details -->
              <v-row v-if="editingBooking.frequency_type && editingBooking.frequency_type !== 'once'">
                <v-col cols="12">
                  <v-divider class="my-3"></v-divider>
                  <h6 class="mb-3">
                    <v-icon class="mr-2" color="primary">mdi-repeat</v-icon>
                    Frequency Booking Details
                  </h6>
                  <v-row>
                    <v-col cols="12" md="6">
                      <div class="detail-item mb-2">
                        <strong>Frequency Type:</strong>
                        <v-chip
                          :color="getFrequencyColor(editingBooking.frequency_type)"
                          variant="tonal"
                          size="small"
                          class="ml-2"
                        >
                          {{ formatFrequencyType(editingBooking.frequency_type) }}
                        </v-chip>
                      </div>
                      <div class="detail-item mb-2">
                        <strong>Duration:</strong> {{ editingBooking.frequency_duration_months || 1 }} month{{ (editingBooking.frequency_duration_months || 1) > 1 ? 's' : '' }}
                      </div>
                    </v-col>
                    <v-col cols="12" md="6">
                      <div class="detail-item mb-2" v-if="editingBooking.frequency_days && editingBooking.frequency_days.length > 0">
                        <strong>Selected Days:</strong>
                        <div class="mt-1">
                          <v-chip
                            v-for="day in editingBooking.frequency_days"
                            :key="day"
                            color="primary"
                            variant="tonal"
                            size="small"
                            class="mr-1 mb-1"
                          >
                            {{ getDayName(day) }}
                          </v-chip>
                        </div>
                      </div>
                    </v-col>
                  </v-row>
                </v-col>
              </v-row>

              <!-- Notes -->
              <v-row v-if="editingBooking.notes">
                <v-col cols="12">
                  <v-divider class="my-3"></v-divider>
                  <div class="detail-item">
                    <strong>Notes:</strong> {{ editingBooking.notes }}
                  </div>
                </v-col>
              </v-row>
            </v-card-text>
          </v-card>

          <h4 class="mb-3">
            <v-icon class="mr-2">mdi-pencil</v-icon>
            Edit Booking Details
          </h4>

          <v-form ref="editForm" @submit.prevent="updateBooking">
            <v-row>
              <v-col cols="12" md="6">
                <v-select
                  v-model="editForm.court_id"
                  :items="courts"
                  item-title="name"
                  item-value="id"
                  label="Court"
                  variant="outlined"
                  :rules="[v => !!v || 'Court is required']"
                  required
                  @update:model-value="onCourtChange"
                >
                  <template #item="{ props, item }">
                    <v-list-item v-bind="props">
                      <template #prepend>
                        <v-icon>mdi-stadium</v-icon>
                      </template>
                      <v-list-item-title>{{ item.raw.name }}</v-list-item-title>
                      <v-list-item-subtitle>{{ item.raw.sport?.name }}</v-list-item-subtitle>
                    </v-list-item>
                  </template>
                </v-select>
              </v-col>

              <v-col cols="12" md="6">
                <v-text-field
                  v-model="editForm.date"
                  label="Date"
                  type="date"
                  variant="outlined"
                  :rules="[v => !!v || 'Date is required']"
                  required
                  :max="maxDate"
                  @update:model-value="onDateChange"
                ></v-text-field>
              </v-col>
            </v-row>

            <v-row>
              <v-col cols="12" md="6">
                <v-select
                  v-model="editForm.start_time"
                  :items="availableSlots"
                  item-title="formatted_time"
                  item-value="start_time"
                  label="Time Slot"
                  variant="outlined"
                  :rules="[v => !!v || 'Time slot is required']"
                  required
                  :disabled="!editForm?.court_id || !editForm?.date"
                ></v-select>
              </v-col>

              <v-col cols="12" md="6">
                <v-select
                  v-model="editForm.duration"
                  :items="durationOptions"
                  label="Duration (hours)"
                  variant="outlined"
                  :rules="[v => !!v || 'Duration is required']"
                  required
                  @update:model-value="calculatePrice"
                ></v-select>
              </v-col>
            </v-row>


            <v-row>
              <v-col cols="12" md="6">
                <v-select
                  v-model="editForm.status"
                  :items="editStatusOptions"
                  item-title="title"
                  item-value="value"
                  label="Status"
                  variant="outlined"
                  prepend-inner-icon="mdi-flag"
                ></v-select>
              </v-col>

              <v-col cols="12" md="6">
                <v-select
                  v-model="editForm.frequency_type"
                  :items="editFrequencyOptions"
                  item-title="title"
                  item-value="value"
                  label="Frequency Type"
                  variant="outlined"
                  prepend-inner-icon="mdi-repeat"
                ></v-select>
              </v-col>
            </v-row>
            <!-- Payment Method Section -->
            <v-row v-if="editForm && editForm.status === 'pending'">
              <v-col cols="12">
                <v-card variant="outlined" class="pa-4">
                  <h5 class="mb-3">
                    <v-icon class="mr-2" color="success">mdi-credit-card</v-icon>
                    Payment Method
                  </h5>

                  <v-row>
                    <v-col cols="12" md="6">
                        <v-select
                          v-model="editForm.payment_method"
                          :items="paymentMethodOptions"
                          item-title="title"
                          item-value="value"
                          label="Select Payment Method"
                          variant="outlined"
                          prepend-inner-icon="mdi-payment"
                          @update:model-value="onPaymentMethodChange"
                      ></v-select>
                    </v-col>

                    <v-col cols="12" md="6" v-if="editForm?.payment_method === 'gcash'">
                      <v-text-field
                        v-model="editForm.gcash_amount"
                        label="Amount to Pay"
                        variant="outlined"
                        prepend-inner-icon="mdi-currency-php"
                        readonly
                        :value="formatPriceTemplate(editingBooking?.total_price)"
                      ></v-text-field>
                    </v-col>
                  </v-row>

                  <!-- GCash QR Code Display -->
                  <v-row v-if="editForm?.payment_method === 'gcash'">
                    <v-col cols="12">
                      <v-card variant="tonal" color="success" class="pa-4">
                        <div class="text-center">
                          <h6 class="mb-3">
                            <v-icon class="mr-2">mdi-qrcode</v-icon>
                            Scan GCash QR Code to Pay
                          </h6>
                          <div class="qr-code-container mb-3">
                            <img
                              src="/images/gcash-qr-code.svg"
                              alt="GCash QR Code"
                              class="qr-code-image"
                              style="max-width: 200px; height: auto;"
                            />
                          </div>
                          <p class="text-body-2 mb-2">
                            <strong>Amount:</strong> {{ formatPriceTemplate(editingBooking?.total_price) }}
                          </p>
                          <p class="text-caption">
                            Scan this QR code with your GCash app to complete payment
                          </p>
                        </div>
                      </v-card>
                    </v-col>
                  </v-row>

                  <!-- Proof of Payment Upload -->
                  <v-row v-if="editForm?.payment_method === 'gcash' && (editingBooking?.status || editingBooking?.approval_status) !== 'rejected'">
                    <v-col cols="12">
                      <v-file-input
                        v-model="editForm.proof_of_payment"
                        label="Upload Proof of Payment"
                        variant="outlined"
                        prepend-inner-icon="mdi-camera"
                        accept="image/*"
                        :rules="[v => !v || v.length === 0 || v[0].size < 5000000 || 'File size should be less than 5 MB']"
                        hint="Upload screenshot of your GCash payment confirmation"
                        persistent-hint
                        show-size
                        @change="onProofOfPaymentChange"
                      ></v-file-input>

                      <!-- Preview New Upload -->
                      <div v-if="newProofPreview" class="mt-3">
                        <div class="text-caption mb-2">Preview:</div>
                        <div class="proof-preview-container proof-preview-clickable">
                          <v-img
                            :src="newProofPreview"
                            max-height="150"
                            max-width="150"
                            class="rounded"
                            cover
                            @click="openPreviewDialog"
                          ></v-img>
                        </div>
                      </div>
                    </v-col>
                  </v-row>

                  <!-- Current Proof of Payment Display -->
                  <v-row v-if="editingBooking?.proof_of_payment">
                    <v-col cols="12">
                      <v-alert type="info" variant="tonal">
                        <div class="d-flex align-center">
                          <v-icon class="mr-2">mdi-file-image</v-icon>
                          <div>
                            <strong>Current Proof of Payment:</strong>
                            <div class="mt-1">
                              <v-btn
                                size="small"
                                variant="outlined"
                                color="primary"
                                @click="viewProofOfPayment"
                              >
                                <v-icon class="mr-1">mdi-eye</v-icon>
                                View Image
                              </v-btn>
                            </div>
                          </div>
                        </div>
                      </v-alert>
                    </v-col>
                  </v-row>
                </v-card>
              </v-col>
            </v-row>

            <!-- Frequency-specific fields -->
            <v-row v-if="editForm?.frequency_type !== 'once'">
              <v-col cols="12">
                <v-card variant="outlined" class="pa-4">
                  <h5 class="mb-3">
                    <v-icon class="mr-2" color="primary">mdi-calendar-clock</v-icon>
                    Frequency Booking Details
                  </h5>

                  <v-row>
                    <v-col cols="12" md="6" v-if="editForm && ['weekly', 'monthly', 'yearly'].includes(editForm.frequency_type)">
                      <v-select
                        v-model="editForm.frequency_days"
                        :items="editDayOptions"
                        item-title="title"
                        item-value="value"
                        label="Select Days"
                        variant="outlined"
                        multiple
                        chips
                        prepend-inner-icon="mdi-calendar-week"
                      ></v-select>
                    </v-col>

                    <v-col cols="12" md="6">
                      <v-text-field
                        v-model="editForm.frequency_duration_months"
                        label="Duration (months)"
                        type="number"
                        variant="outlined"
                        min="1"
                        max="12"
                        prepend-inner-icon="mdi-calendar-month"
                      ></v-text-field>
                    </v-col>
                  </v-row>

                  <v-alert
                    type="info"
                    variant="tonal"
                    class="mt-3"
                  >
                    <v-icon class="mr-2">mdi-information</v-icon>
                    This booking will repeat {{ editForm?.frequency_type }} for {{ editForm?.frequency_duration_months }} month(s)
                    <span v-if="editForm?.frequency_days && editForm.frequency_days.length > 0">
                      on {{ editForm.frequency_days.join(', ') }}
                    </span>
                  </v-alert>
                </v-card>
              </v-col>
            </v-row>

            <v-row>
              <v-col cols="12">
                <v-textarea
                  v-model="editForm.notes"
                  label="Notes (optional)"
                  variant="outlined"
                  rows="3"
                  placeholder="Add any special notes or requirements..."
                ></v-textarea>
              </v-col>
            </v-row>

            <!-- Price Calculation Section -->
            <v-row v-if="selectedCourt">
              <v-col cols="12">
                <v-card variant="outlined" class="pa-4">
                  <h5 class="mb-3">
                    <v-icon class="mr-2" color="success">mdi-calculator</v-icon>
                    Price Calculation
                  </h5>

                  <v-row>
                    <v-col cols="12" md="6">
                      <div class="text-body-2 mb-2">
                        <strong>Court:</strong> {{ selectedCourt.name }}
                      </div>
                      <div class="text-body-2 mb-2">
                        <strong>Price per Hour:</strong> {{ formatPriceTemplate(selectedCourt.sport?.price_per_hour) }}
                      </div>
                      <div class="text-body-2 mb-2">
                        <strong>Duration:</strong> {{ editForm?.duration }} hour{{ editForm?.duration > 1 ? 's' : '' }}
                      </div>
                    </v-col>
                    <v-col cols="12" md="6">
                      <div class="text-body-2 mb-2">
                        <strong>Frequency:</strong> {{ formatFrequencyType(editForm?.frequency_type) }}
                      </div>
                      <div class="text-body-2 mb-2" v-if="editForm?.frequency_type !== 'once'">
                        <strong>Duration:</strong> {{ editForm?.frequency_duration_months }} month{{ editForm?.frequency_duration_months > 1 ? 's' : '' }}
                      </div>
                      <div class="text-body-2 mb-2">
                        <strong>Total Price:</strong>
                        <span class="text-h6 text-success">{{ formatPriceTemplate(totalPrice) }}</span>
                      </div>
                    </v-col>
                  </v-row>

                  <v-divider class="my-3"></v-divider>

                  <v-alert
                    type="info"
                    variant="tonal"
                    class="mb-0"
                  >
                    <v-icon class="mr-2">mdi-information</v-icon>
                    {{ getEditBookingInfoText() }}
                  </v-alert>
                </v-card>
              </v-col>
            </v-row>

            <v-row>
              <v-col cols="12">
                <v-alert
                  type="success"
                  variant="tonal"
                  class="free-booking-alert"
                >
                  <div class="free-booking-info">
                    <v-icon class="mr-2">mdi-gift</v-icon>
                    <strong>Free Booking</strong>
                    <span class="free-booking-text">
                      This is a company-owned multi-sport court system - all bookings are free!
                    </span>
                  </div>
                </v-alert>
              </v-col>
            </v-row>

            <v-alert
              v-if="editError"
              type="error"
              variant="tonal"
              class="mt-4"
            >
              {{ editError }}
            </v-alert>
          </v-form>


          <!-- Loading state when editForm doesn't exist -->
        </v-card-text>

        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn @click="testEditDialog" color="primary" variant="text">Test Dialog</v-btn>
          <v-btn
            color="grey"
            variant="text"
            @click="closeEditDialog"
          >
            Cancel
          </v-btn>
          <v-btn
            color="primary"
            :loading="editLoading"
            :disabled="editLoading"
            @click="updateBooking"
          >
            Update Booking
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>


    <!-- Generate Bookings Dialog -->
    <v-dialog v-model="generateDialogOpen" max-width="400">
      <v-card>
        <v-card-title class="text-h5 pa-6 pb-4">
          <v-icon class="mr-2" color="success">mdi-calendar-plus</v-icon>
          Generate Bookings
        </v-card-title>
        <v-divider></v-divider>
        <v-card-text class="pa-6">
          <p class="text-body-1 mb-4">
            Generate bookings for "{{ selectedRecurringSchedule?.title }}" for the next few months:
          </p>
          <v-select
            v-model="generateMonths"
            :items="monthOptions"
            label="Number of months"
            variant="outlined"
            prepend-inner-icon="mdi-calendar-range"
          ></v-select>
        </v-card-text>
        <v-card-actions class="pa-6 pt-0">
          <v-spacer></v-spacer>
          <v-btn
            color="grey"
            variant="text"
            @click="generateDialogOpen = false"
          >
            Cancel
          </v-btn>
          <v-btn
            color="success"
            variant="elevated"
            @click="confirmGenerateBookings"
            :loading="generating"
          >
            Generate
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

    <!-- Recurring Schedule View Dialog -->
    <RecurringScheduleViewDialog
      :is-open="recurringViewDialog"
      :booking="selectedRecurringSchedule"
      @update:is-open="recurringViewDialog = $event"
    />

    <!-- New Booking Dialog with Improved Flow -->
    <NewBookingDialog
      :is-open="newBookingDialog"
      :can-users-book="canUsersBook"
      @close="closeNewBookingDialog"
      @booking-created="onBookingCreated"
    />

    <!-- Edit Booking Dialog (Cart-style) -->
    <v-dialog
      v-model="globalEditDialog"
      max-width="600px"
      persistent
      class="responsive-dialog"
    >
      <v-card>
        <v-card-title class="text-h5 pa-4" style="background: linear-gradient(135deg, #1976d2 0%, #1565c0 100%); color: white;">
          <v-icon class="mr-2" color="white">mdi-pencil</v-icon>
          Edit Booking
        </v-card-title>

        <v-card-text class="pa-4">
          <v-form ref="editForm">
            <!-- Court Selection -->
            <v-select
              v-model="editItem.court_id"
              :items="courts"
              item-title="name"
              item-value="id"
              label="Court"
              variant="outlined"
              density="comfortable"
              prepend-inner-icon="mdi-stadium"
              class="mb-4"
              :rules="[v => !!v || 'Court is required']"
            >
              <template v-slot:item="{ props, item }">
                <v-list-item v-bind="props">
                  <template v-slot:prepend>
                    <v-icon :color="sportService.getSportColor(item.raw.sport?.name)">
                      {{ sportService.getSportIcon(item.raw.sport?.name, item.raw.sport?.icon) }}
                    </v-icon>
                  </template>
                  <template v-slot:subtitle>
                    {{ item.raw.sport?.name }} • ₱{{ item.raw.sport?.price_per_hour }}/hr
                  </template>
                </v-list-item>
              </template>
            </v-select>

            <!-- Date Selection -->
            <v-text-field
              v-model="editItem.booking_date"
              type="date"
              label="Date"
              variant="outlined"
              density="comfortable"
              prepend-inner-icon="mdi-calendar"
              class="mb-4"
              :rules="[v => !!v || 'Date is required']"
              :min="getTodayDate()"
              @update:model-value="fetchEditAvailableSlots"
            ></v-text-field>

            <!-- Available Time Slots -->
            <div v-if="editItem.court_id && editItem.booking_date">
              <div class="d-flex align-center justify-space-between mb-2">
                <div class="d-flex align-center gap-2">
                  <h4 class="text-subtitle-1" style="color: #1f2937 !important;">Available Time Slots</h4>
                  <v-chip v-if="editSelectedSlots.length > 0" color="primary" size="small">
                    {{ editSelectedSlots.length }} selected
                  </v-chip>
                </div>
                <v-btn
                  size="small"
                  variant="text"
                  color="primary"
                  @click="fetchEditAvailableSlots"
                  :loading="loadingSlotsEdit"
                >
                  <v-icon start>mdi-refresh</v-icon>
                  Refresh
                </v-btn>
              </div>

              <v-progress-linear v-if="loadingSlotsEdit" indeterminate color="primary" class="mb-3"></v-progress-linear>

              <div v-else-if="editAvailableSlots.length === 0" class="text-center pa-4">
                <v-icon size="48" color="grey">mdi-calendar-remove</v-icon>
                <p class="text-grey mt-2">No available slots for this date</p>
              </div>

              <div v-else class="time-slots-container mb-4">
                <div class="time-slots-grid">
                  <v-chip
                    v-for="slot in editAvailableSlots"
                    :key="`${slot.start}-${slot.end}`"
                    :color="isEditSlotSelected(slot) ? 'primary' : (canSelectEditSlot(slot) ? 'success' : 'error')"
                    :variant="isEditSlotSelected(slot) ? 'elevated' : 'outlined'"
                    :disabled="!canSelectEditSlot(slot)"
                    class="time-slot-chip"
                    @click="selectEditTimeSlot(slot)"
                  >
                    <div class="time-slot-content">
                      <v-icon start size="small">mdi-clock-outline</v-icon>
                      <span class="time-text">{{ formatTimeSlot(slot.start) }} - {{ formatTimeSlot(slot.end) }}</span>
                      <span class="price-text">₱{{ slot.price }}</span>
                    </div>
                  </v-chip>
                </div>
              </div>
            </div>

            <!-- Price Preview -->
            <v-alert v-if="editItem.court_id && editItem.start_time && editItem.end_time" type="info" density="compact" class="mt-2">
              <div class="d-flex align-center justify-space-between">
                <span>Estimated Price:</span>
                <strong class="text-h6">₱{{ calculateEditPrice() }}</strong>
              </div>
            </v-alert>
          </v-form>
        </v-card-text>

        <v-divider></v-divider>

        <v-card-actions class="pa-4">
          <v-btn variant="text" @click="closeCartEditDialog">
            Cancel
          </v-btn>
          <v-spacer></v-spacer>
          <v-btn
            color="primary"
            :loading="updatingBooking"
            @click="saveEditBooking"
          >
            <v-icon start>mdi-content-save</v-icon>
            Save Changes
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- QR Code Display Dialog -->
    <QrCodeDisplay
      v-if="qrCodeDialog"
      :booking="selectedBooking"
      @close="closeQrCodeDialog"
    />

    <!-- QR Code Scanner Dialog -->
    <QrCodeScanner
      v-if="qrScannerDialog"
      @close="closeQrScannerDialog"
    />

    <!-- Preview Upload Dialog -->
    <v-dialog
      v-model="previewUploadDialog"
      max-width="800"
      :fullscreen="$vuetify.display.mobile"
    >
      <v-card>
        <v-card-title class="text-h5 dialog-title">
          <div class="d-flex align-center">
            <v-icon class="mr-2">mdi-image</v-icon>
            Preview Image
          </div>
          <v-btn icon="mdi-close" variant="text" @click="previewUploadDialog = false"></v-btn>
        </v-card-title>

        <v-divider></v-divider>

        <v-card-text class="pa-6">
          <div class="text-center">
            <img
              :src="newProofPreview"
              alt="Preview"
              style="max-width: 100%; height: auto; border-radius: 8px; box-shadow: 0 4px 8px rgba(0,0,0,0.1);"
            />
          </div>
        </v-card-text>

        <v-divider></v-divider>

        <v-card-actions class="pa-4">
          <v-spacer></v-spacer>
          <v-btn
            color="grey"
            variant="outlined"
            @click="previewUploadDialog = false"
          >
            Close
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import { ref, computed, onMounted, onUnmounted, watch, nextTick, shallowRef, triggerRef } from 'vue'
import { useRoute } from 'vue-router'
import { authService } from '../services/authService'
import { courtService } from '../services/courtService'
import { cartService } from '../services/cartService'
import { bookingService } from '../services/bookingService'
import { companySettingService } from '../services/companySettingService'
import { sportService } from '../services/sportService'
import { statusService } from '../services/statusService'
import { debounce } from '../utils/debounce'
import RecurringScheduleViewDialog from '../components/RecurringScheduleViewDialog.vue'
import NewBookingDialog from '../components/NewBookingDialog.vue'
import BookingDetailsDialog from '../components/BookingDetailsDialog.vue'
import QrCodeDisplay from '../components/QrCodeDisplay.vue'
import QrCodeScanner from '../components/QrCodeScanner.vue'
import BookingCard from '../components/BookingCard.vue'
import { RecycleScroller } from 'vue-virtual-scroller'
import Swal from 'sweetalert2'
import {
  formatPrice,
  formatNumber,
  formatDate,
  getFrequencyColor,
  getPaymentStatus,
  getPaymentStatusColor,
  getPaymentStatusText,
  getPaymentStatusIcon,
  getApprovalStatusColor,
  formatApprovalStatus,
  formatTimeSlot,
  formatDateLocal
} from '../utils/formatters'

export default {
  name: 'Bookings',
  components: {
    RecurringScheduleViewDialog,
    NewBookingDialog,
    BookingDetailsDialog,
    QrCodeDisplay,
    QrCodeScanner,
    BookingCard,
    RecycleScroller
  },
  setup() {
    const route = useRoute()
    // Use shallowRef for large arrays to reduce reactivity overhead
    const bookings = shallowRef([])
    const transactions = shallowRef([])
    const expandedTransactions = ref([])
    // Approval status filter (AdminDashboard-style chips)
    const statusFilter = ref(['pending', 'approved'])

    // Payment status filter (AdminDashboard-style chips)
    const paymentStatusFilter = ref([])

    // Sport filter
    const sportFilter = ref(null)
    const sports = ref([])

    // View mode state and persistence
    const viewMode = ref('table')

    // Data Table headers for transactions
    const tableHeaders = [
      { title: 'User', key: 'user_name', sortable: false },
      { title: 'Court', key: 'court_name', sortable: false },
      { title: 'Sport', key: 'sport_name', sortable: false },
      { title: 'Booking Date', key: 'booking_date', sortable: true },
      { title: 'Time Slots', key: 'time_slots', sortable: false },
      { title: 'Total Price', key: 'total_price', sortable: true },
      { title: 'Payment', key: 'payment_status', sortable: false },
      { title: 'Approval', key: 'approval_status', sortable: false },
      { title: 'Actions', key: 'actions', sortable: false }
    ]

    // Date range filters (AdminDashboard-style)
    // Initialize date filters with start and end of current month as default
    const today = new Date()
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)
    const lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0)

    // Format dates using local timezone to avoid timezone shift issues (imported from formatters)
    const dateFromString = formatDateLocal(firstDayOfMonth)
    const dateToString = formatDateLocal(lastDayOfMonth)
    const dateFromFilter = ref(dateFromString)
    const dateToFilter = ref(dateToString)

    const loading = ref(true)
    const error = ref(null)
    const cancelling = ref(null)
    const updating = ref(null)
    const newBookingDialog = ref(false)
    const companySettings = ref({})
    const generateDialogOpen = ref(false)

    const user = ref(null)
    const authLoading = ref(true)
    const isAuthenticated = computed(() => !!user.value)
    const isAdmin = computed(() => user.value?.role === 'admin')

    // Computed property: Admin/Staff can always book, regular users depend on setting
    const canUsersBook = computed(() => {
      let role = user.value?.role

      // If user.value is not loaded yet, try localStorage as fallback
      if (!role) {
        try {
          const storedUser = localStorage.getItem('user')
          if (storedUser) {
            const parsedUser = JSON.parse(storedUser)
            role = parsedUser?.role
            console.log('[Bookings] Using localStorage role fallback:', role)
          }
        } catch (e) {
          // Ignore localStorage errors
        }
      }

      // Admin and Staff bypass the user booking restriction
      if (role === 'admin' || role === 'staff') {
        return true
      }

      // Regular users depend on the company setting
      const userBookingEnabled = companySettings.value?.user_booking_enabled
      const result = userBookingEnabled === undefined ? true : (userBookingEnabled === '1' || userBookingEnabled === true || userBookingEnabled === 1)
      return result
    })
    const tokenStatus = computed(() => {
      try {
        return localStorage.getItem('token') ? 'Present' : 'Missing'
      } catch (error) {
        return 'Error accessing localStorage'
      }
    })

    // Computed property for max date - allow advanced bookings for all roles
    const maxDate = computed(() => null)

    // View booking dialog
    const viewDialog = ref(false)
    const expanded = ref([])

    // Recurring schedule view dialog
    const recurringViewDialog = ref(false)
    const selectedRecurringSchedule = ref(null)
    const selectedBooking = ref(null)

    // Edit booking dialog
    const editDialog = ref(false)
    const globalEditDialog = ref(false)
    const editingBooking = ref(null)
    const qrCodeDialog = ref(false)
    const qrScannerDialog = ref(false)
    const editForm = ref({
      court_id: '',
      date: '',
      start_time: '',
      duration: 1,
      notes: '',
      status: 'pending',
      frequency_type: 'once',
      frequency_days: [],
      frequency_times: [],
      frequency_duration_months: 1,
      frequency_end_date: '',
      payment_method: '',
      gcash_amount: '',
      proof_of_payment: null
    })
    const newProofPreview = ref(null)
    const previewUploadDialog = ref(false)
    const editLoading = ref(false)
    const editError = ref('')
    // Use shallowRef for large arrays to reduce reactivity overhead
    const courts = shallowRef([])
    const availableSlots = shallowRef([])
    const selectedCourt = ref(null)
    const totalPrice = ref(0)

    // Edit booking dialog state
    const editItem = ref({
      id: null,
      transaction_id: null,
      court_id: null,
      booking_date: null,
      start_time: null,
      end_time: null,
      originalItems: []
    })
    const editSelectedSlots = ref([]) // For multiple slot selection
    const editAvailableSlots = ref([])
    const loadingSlotsEdit = ref(false)
    const updatingBooking = ref(false)
    const isInitializingEdit = ref(false) // Flag to prevent watchers during initial load

    const durationOptions = [
      { title: '1 hour', value: 1 },
      { title: '2 hours', value: 2 },
      { title: '3 hours', value: 3 },
      { title: '4 hours', value: 4 },
      { title: '5 hours', value: 5 },
      { title: '6 hours', value: 6 }
    ]

    const editStatusOptions = [
      { title: 'Pending', value: 'pending' },
      { title: 'Approved', value: 'approved' },
      { title: 'Rejected', value: 'rejected' },
      { title: 'Cancelled', value: 'cancelled' },
      { title: 'Completed', value: 'completed' },
      { title: 'Recurring Schedule', value: 'recurring_schedule' }
    ]

    const paymentMethodOptions = [
      { title: 'Cash', value: 'cash' },
      { title: 'GCash', value: 'gcash' },
      { title: 'Bank Transfer', value: 'bank_transfer' }
    ]

    const editFrequencyOptions = [
      { title: 'One-time', value: 'once' },
      { title: 'Daily', value: 'daily' },
      { title: 'Weekly', value: 'weekly' },
      { title: 'Monthly', value: 'monthly' },
      { title: 'Yearly', value: 'yearly' }
    ]

    const editDayOptions = [
      { title: 'Monday', value: 'monday' },
      { title: 'Tuesday', value: 'tuesday' },
      { title: 'Wednesday', value: 'wednesday' },
      { title: 'Thursday', value: 'thursday' },
      { title: 'Friday', value: 'friday' },
      { title: 'Saturday', value: 'saturday' },
      { title: 'Sunday', value: 'sunday' }
    ]

    const statusOptions = [
      { title: 'All Status', value: '' },
      { title: 'Pending Approval', value: 'pending' },
      { title: 'Approved', value: 'approved' },
      { title: 'Rejected', value: 'rejected' }
    ]




    const snackbar = ref({
      show: false,
      message: '',
      color: 'success'
    })

    const headers = [
      { title: '', key: 'data-table-expand', width: '3%' },
      { title: 'Court & Sport', key: 'court_name', sortable: true, width: '18%' },
      { title: 'Date & Time', key: 'start_time', sortable: true, width: '16%' },
      { title: 'Duration', key: 'duration', sortable: false, width: '10%' },
      { title: 'Booked By', key: 'user_name', sortable: true, width: '13%' },
      { title: 'Price', key: 'total_price', sortable: true, width: '9%' },
      { title: 'Payment', key: 'payment_status', sortable: true, width: '11%' },
      { title: 'Status', key: 'status', sortable: true, width: '8%' },
      { title: 'Cart Items', key: 'cart_items_count', sortable: true, width: '7%' },
      { title: 'Actions', key: 'actions', sortable: false, width: '5%' }
    ]

    const recurringHeaders = [
      { title: 'Title', key: 'title', sortable: true, width: '25%' },
      { title: 'Court', key: 'court_name', sortable: true, width: '20%' },
      { title: 'Time', key: 'start_time', sortable: true, width: '15%' },
      { title: 'Recurrence', key: 'recurrence_type', sortable: true, width: '15%' },
      { title: 'Status', key: 'is_active', sortable: true, width: '10%' },
      { title: 'Actions', key: 'actions', sortable: false, width: '15%' }
    ]

    // Flatten transactions into individual bookings (one card per date/court)
    const flattenedBookings = computed(() => {
      const flattened = []

      transactions.value.forEach(transaction => {
        // Skip transactions with no cart items
        if (!transaction.cart_items || transaction.cart_items.length === 0) {
          return
        }

        // Only show transactions that have been converted to Booking records
        // Skip transactions that are still in "cart" state (not yet checked out/submitted)
        // Check if transaction has bookings OR if any cart item has bookings
        const hasBookings = (transaction.bookings && transaction.bookings.length > 0) ||
                           (transaction.cart_items && transaction.cart_items.some(item =>
                             item.bookings && item.bookings.length > 0
                           ))

        if (!hasBookings) {
          return
        }

        // Filter out cancelled cart items
        const activeCartItems = transaction.cart_items.filter(item =>
          item.status !== 'cancelled'
        )

        // Skip if no active items
        if (activeCartItems.length === 0) {
          return
        }

        // Group cart items by date and court
        const dateCourtGroups = {}

        activeCartItems.forEach(item => {
          const dateKey = typeof item.booking_date === 'string' && item.booking_date.includes('T')
            ? item.booking_date.split('T')[0]
            : item.booking_date
          const courtId = item.court?.id
          const groupKey = `${dateKey}_${courtId}`

          if (!dateCourtGroups[groupKey]) {
            dateCourtGroups[groupKey] = {
              date: dateKey,
              court: item.court,
              items: [],
              price: 0
            }
          }

          dateCourtGroups[groupKey].items.push(item)
          dateCourtGroups[groupKey].price += parseFloat(item.price || 0)
        })

        // Create a separate booking for each date/court group
        Object.entries(dateCourtGroups).forEach(([groupKey, group]) => {
          // Only add if there are items
          if (group.items.length > 0) {
            // Extract sport from the first cart item
            const firstItem = group.items[0]
            const extractedSport = firstItem?.sport || firstItem?.court?.sport || null

            // Calculate POS sales total for this date
            let posSalesTotal = 0
            if (transaction.pos_sales && transaction.pos_sales.length > 0) {
              posSalesTotal = transaction.pos_sales
                .filter(sale => {
                  // Filter POS sales by the same date as this group
                  const saleDate = typeof sale.sale_date === 'string' && sale.sale_date.includes('T')
                    ? sale.sale_date.split('T')[0]
                    : sale.sale_date
                  return saleDate === group.date
                })
                .reduce((sum, sale) => sum + parseFloat(sale.total_amount || 0), 0)
            }

            flattened.push({
              id: `${transaction.id}_${groupKey}`,
              // booking_id: group.bookings.id,
              transaction_id: transaction.id,
              booking_date: group.date,
              court: group.court,
              sport: extractedSport,
              cart_items: group.items,
              price: group.price + posSalesTotal,
              cart_price: group.price, // Store cart-only price separately
              pos_sales_total: posSalesTotal, // Store POS sales total separately
              user: transaction.user,
              approval_status: transaction.approval_status,
              payment_method: transaction.payment_method,
              payment_status: transaction.payment_status,
              gcash_reference: transaction.gcash_reference,
              proof_of_payment: transaction.proof_of_payment,
              approved_by: transaction.approver,
              approved_at: transaction.approved_at,
              rejection_reason: transaction.rejection_reason,
              qr_code: transaction.qr_code,
              created_at: transaction.created_at,
              original_transaction: transaction
            })
          }
        })
      })

      // Sort by booking date (oldest first)
      return flattened.sort((a, b) => {
        // Parse dates safely to avoid timezone issues
        const parseLocalDate = (dateStr) => {
          if (!dateStr) return new Date(0)
          const dateOnlyPattern = /^\d{4}-\d{2}-\d{2}$/
          if (dateOnlyPattern.test(dateStr)) {
            const [year, month, day] = dateStr.split('-').map(Number)
            return new Date(year, month - 1, day)
          }
          return new Date(dateStr)
        }

        const dateA = parseLocalDate(a.booking_date)
        const dateB = parseLocalDate(b.booking_date)
        return dateA - dateB
      })
    })

    // Computed property for sport options - using database sports
    const sportOptions = computed(() => {
      if (!sports.value || sports.value.length === 0) {
        return ['All Sports']
      }
      const sportNames = sports.value.map(sport => sport.name).sort()
      return ['All Sports', ...sportNames]
    })

    const filteredTransactions = computed(() => {
      let filtered = flattenedBookings.value

      // Filter by date range (AdminDashboard-style)
      if (dateFromFilter.value || dateToFilter.value) {
        filtered = filtered.filter(t => {
          if (!t.booking_date) return false

          // Parse date strings as local dates to avoid timezone shift
          const parseLocalDate = (dateStr) => {
            const dateOnlyPattern = /^\d{4}-\d{2}-\d{2}$/
            if (dateOnlyPattern.test(dateStr)) {
              const [year, month, day] = dateStr.split('-').map(Number)
              return new Date(year, month - 1, day)
            }
            return new Date(dateStr)
          }

          const bookingDate = parseLocalDate(t.booking_date)

          if (dateFromFilter.value) {
            const fromDate = parseLocalDate(dateFromFilter.value)
            if (bookingDate < fromDate) return false
          }

          if (dateToFilter.value) {
            const toDate = parseLocalDate(dateToFilter.value)
            toDate.setHours(23, 59, 59, 999) // Include entire end date
            if (bookingDate > toDate) return false
          }

          return true
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
            item.sport?.name === sportFilter.value ||
            item.court?.sport?.name === sportFilter.value
          )
        })
      }

      // Filter by approval status (AdminDashboard-style, multi-select with special waitlist logic)
      if (Array.isArray(statusFilter.value) && statusFilter.value.length > 0) {
        filtered = filtered.filter(transaction => {
          const status = transaction.approval_status || 'pending'

          // Show parent transactions with waitlist queue but exclude approved ones
          if (statusFilter.value.includes('pending_waitlist')) {
            const hasWaitlistQueue = transaction.waitlist_entries && transaction.waitlist_entries.length > 0
            const isNotApproved = status !== 'approved'
            if (hasWaitlistQueue && isNotApproved) {
              return true
            }
          }

          return statusFilter.value.includes(status)
        })
      }

      // Filter by payment status (AdminDashboard-style)
      if (paymentStatusFilter.value.length > 0) {
        filtered = filtered.filter(transaction => {
          const paymentStatus = getPaymentStatus(transaction)
          return paymentStatusFilter.value.includes(paymentStatus)
        })
      }

      return filtered
    })

    // Use virtual scrolling for large lists (50+ items)
    const useVirtualScrolling = computed(() => {
      return filteredTransactions.value.length >= 50
    })

    const filteredBookings = computed(() => {
      let filtered = bookings.value

      // Filter by date
      if (dateFilter.value) {
        const filterDate = new Date(dateFilter.value)
        filtered = filtered.filter(booking => {
          const bookingDate = new Date(booking.start_time)
          return bookingDate.toDateString() === filterDate.toDateString()
        })
      }

      // Filter by status
      if (statusFilter.value) {
        filtered = filtered.filter(booking => booking.status === statusFilter.value)
      }

      return filtered
    })

    const toggleTransactionDetails = (transactionId) => {
      const index = expandedTransactions.value.indexOf(transactionId)
      if (index > -1) {
        expandedTransactions.value.splice(index, 1)
      } else {
        expandedTransactions.value.push(transactionId)
      }
    }

    // Group transactions by booking/schedule date
    const groupedByDay = computed(() => {
      const groups = {}

      filteredBookings.value.forEach(booking => {
        // For transactions, we need to group by the actual booking dates from cart items
        if (booking.isTransaction && booking.cart_transaction?.cart_items) {
          // A transaction can have multiple dates, so we need to create entries for each date
          const dateGroups = {}

          booking.cart_transaction.cart_items.forEach(item => {
            let itemDate = item.booking_date
            if (typeof itemDate === 'string' && itemDate.includes('T')) {
              itemDate = itemDate.split('T')[0]
            }

            if (!dateGroups[itemDate]) {
              dateGroups[itemDate] = {
                items: [],
                price: 0
              }
            }
            dateGroups[itemDate].items.push(item)
            dateGroups[itemDate].price += parseFloat(item.price || 0)
          })

          // Create a booking entry for each date
          Object.entries(dateGroups).forEach(([dateStr, dateData]) => {
            const groupDate = new Date(dateStr)

            if (isNaN(groupDate.getTime())) {
              return
            }

            // Use local date formatting to avoid timezone issues
            const dateKey = formatDateToYYYYMMDD(groupDate)

            if (!groups[dateKey]) {
              groups[dateKey] = {
                date: dateKey,
                dayLabel: formatDayLabel(groupDate),
                bookings: [],
                totalPrice: 0,
                transactionCount: 0
              }
            }

            // Add the transaction with date-specific info
            groups[dateKey].bookings.push({
              ...booking,
              dateSpecificItems: dateData.items,
              dateSpecificPrice: dateData.price
            })
            groups[dateKey].totalPrice += dateData.price
            groups[dateKey].transactionCount++
          })
        } else if (booking.start_time) {
          // Regular booking - group by start_time
          const groupDate = new Date(booking.start_time)

          if (isNaN(groupDate.getTime())) {
            return
          }

          // Use local date formatting to avoid timezone issues
          const dateKey = formatDateToYYYYMMDD(groupDate)

          if (!groups[dateKey]) {
            groups[dateKey] = {
              date: dateKey,
              dayLabel: formatDayLabel(groupDate),
              bookings: [],
              totalPrice: 0,
              transactionCount: 0
            }
          }

          groups[dateKey].bookings.push(booking)
          groups[dateKey].totalPrice += parseFloat(booking.total_price || 0)
        }
      })

      // Convert to array and sort by date (oldest first)
      const sortedGroups = Object.values(groups)
        .sort((a, b) => new Date(a.date) - new Date(b.date))
        .map(group => ({
          ...group,
          totalPrice: group.totalPrice.toFixed(2),
          // Sort bookings within each group by created_at (oldest first)
          bookings: group.bookings.sort((a, b) => {
            const aCreated = new Date(a.created_at || a.cart_transaction?.created_at || 0)
            const bCreated = new Date(b.created_at || b.cart_transaction?.created_at || 0)
            return aCreated - bCreated
          })
        }))

      return sortedGroups
    })

    const formatDayLabel = (date) => {
      const today = new Date()
      const tomorrow = new Date(today)
      tomorrow.setDate(tomorrow.getDate() + 1)
      const yesterday = new Date(today)
      yesterday.setDate(yesterday.getDate() - 1)

      if (date.toDateString() === today.toDateString()) {
        return 'Today, ' + date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
      } else if (date.toDateString() === tomorrow.toDateString()) {
        return 'Tomorrow, ' + date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
      } else if (date.toDateString() === yesterday.toDateString()) {
        return 'Yesterday, ' + date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
      } else {
        return date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })
      }
    }

    // Helper function to format date to YYYY-MM-DD without timezone issues
    const formatDateToYYYYMMDD = (date) => {
      const year = date.getFullYear()
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const day = String(date.getDate()).padStart(2, '0')
      return `${year}-${month}-${day}`
    }

    // Helper function to get today's date in local timezone
    const getTodayDate = () => {
      return formatDateToYYYYMMDD(new Date())
    }

    // Expanded cart items
    const expandedCartItems = ref([])

    const toggleCartItems = (bookingId) => {
      const index = expandedCartItems.value.indexOf(bookingId)
      if (index > -1) {
        expandedCartItems.value.splice(index, 1)
      } else {
        expandedCartItems.value.push(bookingId)
      }
    }


    const itemProps = (item) => ({
      class: 'excel-table-row'
    })

    const fetchBookings = async () => {
      try {
        loading.value = true

        // Fetch cart transactions
        try {
          // Add cache-busting parameter to ensure fresh data
          const timestamp = new Date().getTime()
          const cartResponse = await fetch(`${import.meta.env.VITE_API_URL}/api/cart-transactions?_=${timestamp}`, {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`,
              'Accept': 'application/json',
              'Cache-Control': 'no-cache'
            }
          })

          if (cartResponse.ok) {
            const responseData = await cartResponse.json()

            // API Resources wrap data in a 'data' property
            const transactionsData = responseData.data || responseData

            // Store transactions directly
            transactions.value = transactionsData
            triggerRef(transactions) // Manually trigger reactivity for shallowRef

            // Also convert transactions to booking format for backward compatibility
            const transactionBookings = transactionsData.map(transaction => {
              // Get earliest start time and latest end time from cart items
              let earliestStart = null
              let latestEnd = null
              let bookingDate = null

              transaction.cart_items.forEach(item => {
                const itemDate = typeof item.booking_date === 'string' && item.booking_date.includes('T')
                  ? item.booking_date.split('T')[0]
                  : item.booking_date

                if (!bookingDate) bookingDate = itemDate

                const startTime = `${itemDate} ${item.start_time}`
                const endTime = `${itemDate} ${item.end_time}`

                if (!earliestStart || startTime < earliestStart) earliestStart = startTime
                if (!latestEnd || endTime > latestEnd) latestEnd = endTime
              })

              // Extract sport from cart items
              const firstCartItem = transaction.cart_items[0]
              const extractedSport = firstCartItem?.sport || firstCartItem?.court?.sport || null

              return {
                id: `transaction_${transaction.id}`,
                transaction_id: transaction.id,
                isTransaction: true,
                user: transaction.user,
                court: firstCartItem?.court || {},
                sport: extractedSport,
                booking_date: bookingDate,
                start_time: earliestStart,
                end_time: latestEnd,
                total_price: parseFloat(transaction.total_price),
                status: transaction.approval_status, // pending, approved, rejected
                payment_method: transaction.payment_method,
                payment_status: transaction.payment_status,
                gcash_reference: transaction.gcash_reference,
                proof_of_payment: transaction.proof_of_payment,
                approval_status: transaction.approval_status,
                approved_by: transaction.approver,
                approved_at: transaction.approved_at,
                rejection_reason: transaction.rejection_reason,
                qr_code: transaction.qr_code,
                cart_transaction: transaction,
                cart_items: transaction.cart_items, // Include cart_items for display
                created_at: transaction.created_at
              }
            })

            // Set bookings to cart transactions
            bookings.value = transactionBookings
            triggerRef(bookings) // Manually trigger reactivity for shallowRef

            // Check for expired bookings (unpaid for more than 1 hour)
            const now = new Date()
            const expiredBookings = transactionsData.filter(transaction => {
              if (transaction.payment_status !== 'paid' && (transaction.approval_status === 'pending' || transaction.approval_status === 'pending_waitlist')) {
                const createdAt = new Date(transaction.created_at)
                const hoursSinceCreation = (now - createdAt) / (1000 * 60 * 60)
                return hoursSinceCreation >= 1
              }
              return false
            })

            // Show notification if bookings expired (only once per session)
            if (expiredBookings.length > 0) {
              const expiredIds = expiredBookings.map(b => b.id).sort().join(',')
              const lastNotifiedIds = sessionStorage.getItem('expiredBookingsNotified')

              // Only show if this is a new set of expired bookings
              if (lastNotifiedIds !== expiredIds) {
                sessionStorage.setItem('expiredBookingsNotified', expiredIds)

                showAlert({
                  icon: 'warning',
                  title: 'Bookings Expired',
                  html: `
                    <p><strong>${expiredBookings.length}</strong> booking${expiredBookings.length > 1 ? 's have' : ' has'} expired due to non-payment.</p>
                    <p class="text-caption mt-2">Bookings must be paid within 1 hour to remain active.</p>
                    <p class="text-caption">The time slots have been released for other users.</p>
                  `,
                  confirmButtonText: 'OK',
                  confirmButtonColor: '#1976d2'
                })
              }
            }
          } else {
            bookings.value = []
            triggerRef(bookings) // Manually trigger reactivity for shallowRef
          }
        } catch (cartErr) {
          bookings.value = []
          triggerRef(bookings) // Manually trigger reactivity for shallowRef
        }
        // Also fetch direct bookings (created without cart transactions), so admin-made bookings for a user appear here
        try {
          const ts = new Date().getTime()
          const bookingsResponse = await fetch(`${import.meta.env.VITE_API_URL}/api/bookings?_=${ts}`, {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`,
              'Accept': 'application/json',
              'Cache-Control': 'no-cache'
            }
          })

          if (bookingsResponse.ok) {
            const bookingsJson = await bookingsResponse.json()
            // API may return an array or an object with { success, data }
            let directBookings = Array.isArray(bookingsJson) ? bookingsJson : (bookingsJson.data || [])

            // Only include direct bookings (no cart transaction) to avoid duplicating items represented by transactions
            directBookings = directBookings.filter(b => !b.cart_transaction_id)

            // Merge with transaction-backed items we already set
            bookings.value = [...(bookings.value || []), ...directBookings]
            triggerRef(bookings) // Manually trigger reactivity for shallowRef
          } else {
          }
        } catch (bookingsErr) {
        }
      } catch (err) {
        error.value = err.message
        bookings.value = []
      } finally {
        loading.value = false
      }
    }

    const isBookingExpired = (booking) => {
      // Admin bookings should not expire automatically
      if (booking.user && booking.user.role === 'admin') {
        return false
      }

      // Check if booking is unpaid and pending (including waitlist pending)
      if (booking.payment_status !== 'paid' && (booking.approval_status === 'pending' || booking.approval_status === 'pending_waitlist') && booking.created_at) {
        // Use business hours helper to calculate expiration
        return isExpiredByBusinessHours(booking.created_at)
      }
      return false
    }

    // Business hours expiration helper
    const isExpiredByBusinessHours = (createdAt) => {
      const created = new Date(createdAt)
      const now = new Date()

      // Calculate expiration time based on business hours
      const expirationTime = calculateBusinessHoursExpiration(created)

      return now >= expirationTime
    }

    // Calculate expiration time considering business hours (8am-5pm, Mon-Sat)
    const calculateBusinessHoursExpiration = (createdAt) => {
      const created = new Date(createdAt)
      const createdHour = created.getHours()
      const createdDay = created.getDay() // 0 = Sunday, 1 = Monday, etc.

      // If created on Sunday (0) or after 5pm (17:00)
      if (createdDay === 0 || createdHour >= 17) {
        // Timer starts at 8am next business day (skip Sunday)
        let nextDay = new Date(created)
        nextDay.setDate(nextDay.getDate() + 1)
        nextDay.setHours(8, 0, 0, 0)

        // Skip Sunday if next day is Sunday
        if (nextDay.getDay() === 0) {
          nextDay.setDate(nextDay.getDate() + 1) // Move to Monday
        }

        // Expires 1 hour after timer starts (9am next business day)
        nextDay.setHours(9, 0, 0, 0)
        return nextDay
      }

      // If created before 8am on a working day
      if (createdHour < 8) {
        const expiresAt = new Date(created)
        expiresAt.setHours(9, 0, 0, 0) // Expires at 9am same day
        return expiresAt
      }

      // Created during business hours - simple 1 hour expiration
      const expiresAt = new Date(created.getTime() + 60 * 60 * 1000)
      return expiresAt
    }

    // formatDate is now imported from formatters (removed local override)

    const formatTime = (dateTime) => {
      return new Date(dateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }

    // formatTimeSlot is now imported from formatters

    const calculateTotalDuration = (cartItems) => {
      if (!cartItems || cartItems.length === 0) return 0

      // Calculate total hours by summing all individual slot durations
      let totalHours = 0
      cartItems.forEach(item => {
        const startTime = item.start_time.split(':')
        const endTime = item.end_time.split(':')
        const startHour = parseInt(startTime[0]) + parseInt(startTime[1]) / 60
        const endHour = parseInt(endTime[0]) + parseInt(endTime[1]) / 60
        totalHours += (endHour - startHour)
      })

      return totalHours.toFixed(1)
    }

    // Get booking_for_user_name from the first cart item if it exists
    const getFirstCartItemBookingForName = (booking) => {
      if (booking.cart_items && booking.cart_items.length > 0) {
        return booking.cart_items[0].booking_for_user_name || null
      }
      return null
    }

    const formatDateTime = (dateTime) => {
      if (!dateTime) return 'N/A'
      const date = new Date(dateTime)
      return date.toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    }

    const getDuration = (startTime, endTime) => {
      const start = new Date(startTime)
      const end = new Date(endTime)
      const diffInHours = (end - start) / (1000 * 60 * 60)
      return Math.round(diffInHours)
    }

    // Group transaction cart items by date
    const getTransactionDateGroups = (transaction) => {
      if (!transaction || !transaction.cart_items) return {}

      const dateGroups = {}

      transaction.cart_items.forEach(item => {
        let itemDate = item.booking_date
        if (typeof itemDate === 'string' && itemDate.includes('T')) {
          itemDate = itemDate.split('T')[0]
        }

        if (!dateGroups[itemDate]) {
          dateGroups[itemDate] = {
            items: [],
            price: 0
          }
        }
        dateGroups[itemDate].items.push(item)
        dateGroups[itemDate].price += parseFloat(item.price || 0)
      })

      return dateGroups
    }

    // Group consecutive time slots like in cart (e.g., "7:00 - 9:00" for 7-8 and 8-9)
    const getGroupedTimeDisplay = (items) => {
      if (!items || items.length === 0) return ''

      // Helper function to normalize time format (remove seconds if present)
      const normalizeTime = (time) => {
        if (!time) return ''
        // If time has seconds (HH:MM:SS), remove them
        if (time.length > 5 && time.split(':').length === 3) {
          return time.substring(0, 5) // Get HH:MM only
        }
        return time
      }

      // Sort items by start time
      const sortedItems = [...items].sort((a, b) => {
        return a.start_time.localeCompare(b.start_time)
      })

      // Group consecutive slots
      const groups = []
      let currentGroup = {
        start: normalizeTime(sortedItems[0].start_time),
        end: normalizeTime(sortedItems[0].end_time)
      }

      for (let i = 1; i < sortedItems.length; i++) {
        const item = sortedItems[i]
        const itemStart = normalizeTime(item.start_time)
        const itemEnd = normalizeTime(item.end_time)

        // Check if this slot is consecutive (current end = next start)
        if (currentGroup.end === itemStart) {
          // Extend the current group
          currentGroup.end = itemEnd
        } else {
          // Save current group and start a new one
          groups.push(`${currentGroup.start} - ${currentGroup.end}`)
          currentGroup = {
            start: itemStart,
            end: itemEnd
          }
        }
      }

      // Add the last group
      groups.push(`${currentGroup.start} - ${currentGroup.end}`)

      // Return formatted string
      return groups.join(', ')
    }

    const calculateCartItemDuration = (startTime, endTime) => {
      try {
        const [startHour, startMin] = startTime.split(':').map(Number)
        const [endHour, endMin] = endTime.split(':').map(Number)
        const startMinutes = startHour * 60 + startMin
        const endMinutes = endHour * 60 + endMin
        const durationMinutes = endMinutes - startMinutes
        const hours = Math.floor(durationMinutes / 60)
        const minutes = durationMinutes % 60

        if (minutes === 0) {
          return `${hours} hour${hours !== 1 ? 's' : ''}`
        }
        return `${hours}h ${minutes}m`
      } catch (error) {
        return 'N/A'
      }
    }


    const formatRecurrenceType = (type) => {
      const types = {
        daily: 'Daily',
        weekly: 'Weekly',
        weekly_multiple_times: 'Weekly (Multiple Times)',
        monthly: 'Monthly',
        yearly: 'Yearly',
        yearly_multiple_times: 'Yearly (Multiple Times)'
      }
      return types[type] || 'Unknown'
    }

    const formatRecurrenceDetails = (data) => {
      if (!data) return 'Unknown'

      const type = data.recurrence_type
      const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

      if (['weekly_multiple_times', 'yearly_multiple_times'].includes(type) && data.day_specific_times) {
        // Show day-specific times
        const times = data.day_specific_times.map(dayTime =>
          `${dayNames[dayTime.day]} ${dayTime.start_time}-${dayTime.end_time}`
        ).join(', ')
        return times
      } else if (['weekly', 'monthly'].includes(type) && data.recurrence_days) {
        // Show selected days
        const days = data.recurrence_days.map(day => dayNames[day]).join(', ')
        const timeRange = data.start_time && data.end_time ? ` (${data.start_time}-${data.end_time})` : ''
        return `${days}${timeRange}`
      } else if (data.start_time && data.end_time) {
        // Show time range
        return `${data.start_time}-${data.end_time}`
      } else {
        return formatRecurrenceType(type)
      }
    }

    const getRecurringDurationText = (data) => {
      if (!data) return 'Recurring'

      if (['weekly_multiple_times', 'yearly_multiple_times'].includes(data.recurrence_type) && data.day_specific_times) {
        // Calculate total duration for all day-specific times
        let totalHours = 0
        data.day_specific_times.forEach(dayTime => {
          const start = new Date(`2000-01-01 ${dayTime.start_time}`)
          const end = new Date(`2000-01-01 ${dayTime.end_time}`)
          const diffMs = end - start
          const diffHours = diffMs / (1000 * 60 * 60)
          totalHours += diffHours
        })
        return `${totalHours.toFixed(1)}h total`
      } else if (data.start_time && data.end_time) {
        // Calculate duration for regular times
        const start = new Date(`2000-01-01 ${data.start_time}`)
        const end = new Date(`2000-01-01 ${data.end_time}`)
        const diffMs = end - start
        const diffHours = diffMs / (1000 * 60 * 60)
        return `${diffHours.toFixed(1)}h`
      } else {
        return 'Recurring'
      }
    }

    const getRecurringPriceText = (data) => {
      if (!data) return 'Per Session'

      // For now, just show "Per Session" - this could be enhanced to calculate actual pricing
      return 'Per Session'
    }

    // Helper functions for recurring schedule details
    const hasDaySpecificTimes = (data) => {
      return data && data.day_specific_times && data.day_specific_times.length > 0
    }

    const hasRecurrenceDays = (data) => {
      return data && data.recurrence_days && data.recurrence_days.length > 0
    }

    const getRecurrenceTypeColor = (type) => {
      const colors = {
        daily: 'blue',
        weekly: 'green',
        weekly_multiple_times: 'purple',
        monthly: 'orange',
        yearly: 'red',
        yearly_multiple_times: 'deep-purple'
      }
      return colors[type] || 'grey'
    }

    const getIntervalSuffix = (type) => {
      const suffixes = {
        daily: 'day(s)',
        weekly: 'week(s)',
        weekly_multiple_times: 'week(s)',
        monthly: 'month(s)',
        yearly: 'year(s)',
        yearly_multiple_times: 'year(s)'
      }
      return suffixes[type] || 'time(s)'
    }

    const getDayName = (dayNumber) => {
      const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
      return days[dayNumber] || 'Unknown'
    }

    const calculateDuration = (startTime, endTime) => {
      if (!startTime || !endTime) return 0
      const start = new Date(`2000-01-01 ${startTime}`)
      const end = new Date(`2000-01-01 ${endTime}`)
      const diffMs = end - start
      const diffHours = diffMs / (1000 * 60 * 60)
      return diffHours.toFixed(1)
    }

    const getRecurringSummaryText = (data) => {
      if (!data) return ''

      const type = data.recurrence_type

      if (['weekly_multiple_times', 'yearly_multiple_times'].includes(type) && data.day_specific_times) {
        const totalHours = data.day_specific_times.reduce((total, dayTime) => {
          return total + parseFloat(calculateDuration(dayTime.start_time, dayTime.end_time))
        }, 0)
        return `This recurring schedule will create individual bookings for each occurrence. Total of ${data.day_specific_times.length} different time slots per ${type.includes('weekly') ? 'week' : 'year'}, totaling ${totalHours.toFixed(1)} hours.`
      } else if (data.recurrence_days && data.recurrence_days.length > 0) {
        const dayNames = data.recurrence_days.map(day => getDayName(day)).join(', ')
        return `This recurring schedule will create individual bookings for each occurrence. Scheduled for ${dayNames}${data.start_time && data.end_time ? ` at ${data.start_time}-${data.end_time}` : ''}.`
      } else {
        return `This recurring schedule will create individual bookings for each occurrence. Scheduled ${type}${data.start_time && data.end_time ? ` at ${data.start_time}-${data.end_time}` : ''}.`
      }
    }

    // Frequency booking helper functions
    const formatFrequencyType = (type) => {
      const types = {
        once: 'One-time',
        daily: 'Daily',
        weekly: 'Weekly',
        monthly: 'Monthly',
        yearly: 'Yearly'
      }
      return types[type] || type
    }

    // All payment and frequency formatting functions are now imported from formatters

    // Computed property to check if any filters are active
    const hasActiveFilters = computed(() => {
      return statusFilter.value.length > 0 ||
             paymentStatusFilter.value.length > 0 ||
             sportFilter.value !== null ||
             dateFromFilter.value !== '' ||
             dateToFilter.value !== ''
    })

    // Clear all filters function
    const clearFilters = () => {
      statusFilter.value = []
      paymentStatusFilter.value = []
      sportFilter.value = null
      dateFromFilter.value = dateFromString
      dateToFilter.value = dateToString
    }

    // Load sports data
    const loadSports = async () => {
      try {
        const courtServiceModule = await import('../services/courtService')
        sports.value = await courtServiceModule.courtService.getSports()
      } catch (error) {
        console.error('Failed to load sports:', error)
      }
    }

    // Track mount to avoid initial watcher trigger
    const isMounted = ref(false)

    // Preserve previous status filter when toggling waitlist exclusive filter
    const previousStatusFilter = ref(['pending', 'approved'])

    // Watch statusFilter to handle exclusive 'pending_waitlist' logic
    watch(statusFilter, (newValue, oldValue) => {
      if (!isMounted.value) return

      const hasWaitlist = newValue.includes('pending_waitlist')
      const hadWaitlist = oldValue?.includes && oldValue.includes('pending_waitlist')
      const hasOtherFilters = newValue.some(f => f !== 'pending_waitlist')

      if (hasWaitlist && !hadWaitlist) {
        previousStatusFilter.value = oldValue ? oldValue.filter(f => f !== 'pending_waitlist') : []
        statusFilter.value = ['pending_waitlist']
      } else if (hasWaitlist && hasOtherFilters && Array.isArray(oldValue) && oldValue.length === 1 && oldValue[0] === 'pending_waitlist') {
        statusFilter.value = newValue.filter(f => f !== 'pending_waitlist')
      } else if (!hasWaitlist && hadWaitlist) {
        if (newValue.length === 0) {
          statusFilter.value = previousStatusFilter.value.length > 0 ? previousStatusFilter.value : ['pending', 'approved']
        }
      }
    })

    // Persist view mode
    watch(viewMode, (val) => {
      try {
        localStorage.setItem('bookings_view_mode', val)
      } catch (e) {}
    })

    const getFrequencyDetailsText = (item) => {
      if (!item.frequency_type) return ''

      const duration = item.frequency_duration_months || 1
      let details = ''

      if (item.frequency_type === 'once') {
        // For 'once' bookings, show it as a one-time booking with frequency data
        if (item.frequency_days && item.frequency_days.length > 0) {
          const dayNames = item.frequency_days.map(day => getDayName(day)).join(', ')
          details = `One-time booking (originally scheduled for ${dayNames})`
        } else {
          details = 'One-time booking'
        }
        return details
      }

      if (item.frequency_days && item.frequency_days.length > 0) {
        const dayNames = item.frequency_days.map(day => getDayName(day)).join(', ')
        details = `${formatFrequencyType(item.frequency_type)} on ${dayNames}`
      } else {
        details = formatFrequencyType(item.frequency_type)
      }

      return `${details} for ${duration} month${duration > 1 ? 's' : ''}`
    }

    // Wrapper functions for template use
    const formatPriceTemplate = (price) => {
      return formatPrice(price)
    }

    const formatNumberTemplate = (number) => {
      return formatNumber(number)
    }

    // Recurring schedule functions
    const generateBookings = async (recurringSchedule) => {
      try {
        // This would call an API to generate individual bookings from the recurring schedule
        showSnackbar('Bookings generated successfully!', 'success')
        fetchBookings() // Refresh the bookings list
      } catch (error) {
        showSnackbar('Error generating bookings: ' + error.message, 'error')
      }
    }

    const editRecurringSchedule = (recurringSchedule) => {
      // This would open the recurring schedule dialog in edit mode
      showSnackbar('Edit recurring schedule functionality coming soon!', 'info')
    }

    const viewRecurringSchedule = (recurringSchedule) => {
      selectedRecurringSchedule.value = recurringSchedule
      recurringViewDialog.value = true
    }

    const deleteRecurringSchedule = async (id) => {
      if (confirm('Are you sure you want to delete this recurring schedule?')) {
        try {
          // This would call an API to delete the recurring schedule
          showSnackbar('Recurring schedule deleted successfully!', 'success')
          fetchBookings() // Refresh the bookings list
        } catch (error) {
          showSnackbar('Error deleting recurring schedule: ' + error.message, 'error')
        }
      }
    }

    // SweetAlert wrapper with high z-index for dialogs
    const showAlert = (options) => {
      return Swal.fire({
        ...options,
        customClass: {
          container: 'swal2-container-high-z'
        },
        didOpen: () => {
          const container = document.querySelector('.swal2-container')
          if (container) {
            container.style.zIndex = '99999'
          }
          const popup = document.querySelector('.swal2-popup')
          if (popup) {
            popup.style.zIndex = '99999'
          }
        }
      })
    }

    // Open cart dialog
    const openCart = () => {
      // Dispatch a custom event to open the cart dialog in App.vue
      window.dispatchEvent(new CustomEvent('open-cart'))
    }

    // Remove from cart
    const removeFromCart = async (booking) => {
      const result = await showAlert({
        title: 'Remove from Cart?',
        text: 'Are you sure you want to remove this item from your cart?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Yes, remove it',
        cancelButtonText: 'Cancel'
      })

      if (result.isConfirmed) {
        try {
          // Remove all cart items associated with this booking
          if (booking.cart_transaction?.cart_items) {
            for (const item of booking.cart_transaction.cart_items) {
              await fetch(`${import.meta.env.VITE_API_URL}/api/cart/${item.id}`, {
                method: 'DELETE',
                headers: {
                  'Authorization': `Bearer ${localStorage.getItem('token')}`,
                  'Accept': 'application/json'
                }
              })
            }
          }

          await showAlert({
            icon: 'success',
            title: 'Removed!',
            text: 'Item has been removed from your cart.',
            timer: 2000,
            showConfirmButton: false
          })

          // Refresh the cart
          fetchBookings()

          // Update cart count
          window.dispatchEvent(new CustomEvent('cart-updated'))
        } catch (error) {
          await showAlert({
            icon: 'error',
            title: 'Error',
            text: 'Failed to remove item from cart. Please try again.'
          })
        }
      }
    }

    const cancelBooking = async (bookingOrId) => {
      // Handle both booking object and booking ID
      const booking = typeof bookingOrId === 'object' ? bookingOrId : null
      const transactionId = booking?.transaction_id || bookingOrId

      // Get cart items for this specific date and court
      const cartItemsToDelete = booking?.cart_items || []

      if (cartItemsToDelete.length === 0) {
        showAlert({
          icon: 'error',
          title: 'Error',
          text: 'No time slots found to cancel.',
          confirmButtonColor: '#d33'
        })
        return
      }

      const result = await showAlert({
        title: 'Cancel Time Slots?',
        html: `
          <p>Are you sure you want to cancel these time slots?</p>
          <p class="text-muted mt-2">${cartItemsToDelete.length} time slot(s) will be cancelled.</p>
          <p class="text-caption">Other bookings on different dates/times will remain active.</p>
        `,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Yes, cancel slots',
        cancelButtonText: 'No, keep them'
      })

      if (!result.isConfirmed) return

      try {
        cancelling.value = transactionId

        // Delete only the cart items for this specific date/court
        let deletedCount = 0
        for (const item of cartItemsToDelete) {
          try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/cart/${item.id}`, {
              method: 'DELETE',
              headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`,
                'Accept': 'application/json'
              }
            })

            if (response.ok) {
              deletedCount++
            }
          } catch (error) {
          }
        }

        if (deletedCount === 0) {
          throw new Error('Failed to delete any time slots')
        }

        // Show success message immediately
        showAlert({
          icon: 'success',
          title: 'Time Slots Cancelled!',
          text: `Successfully cancelled ${deletedCount} time slot(s). Other bookings remain active.`,
          confirmButtonColor: '#1976d2',
          timer: 2000,
          timerProgressBar: true
        })

        // Refresh in the background after a short delay
        setTimeout(async () => {
          // Dispatch event to refresh other components
          window.dispatchEvent(new CustomEvent('booking-cancelled'))
          window.dispatchEvent(new CustomEvent('cart-updated'))

          // Force refresh by clearing the transactions
          transactions.value = []

          await fetchBookings() // Refresh the list
        }, 300)
      } catch (err) {
        showAlert({
          icon: 'error',
          title: 'Cancellation Failed',
          text: 'Failed to cancel time slots: ' + err.message,
          confirmButtonColor: '#d33'
        })
      } finally {
        cancelling.value = null
      }
    }

    const openBookingDialog = () => {
      // Open the new booking dialog with improved flow
      newBookingDialog.value = true
    }

    const closeNewBookingDialog = () => {
      newBookingDialog.value = false
    }

    const onBookingCreated = async () => {
      // Delay to ensure backend has fully processed the transaction
      await new Promise(resolve => setTimeout(resolve, 1500))

      // Refresh bookings list
      await fetchBookings()

      // Dispatch cart-updated event only (booking-created would cause duplicate refresh)
      window.dispatchEvent(new CustomEvent('cart-updated'))
    }

    const viewBooking = async (booking) => {
      // Fetch fresh booking data with all relationships to ensure POS sales are included
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/bookings/${booking.id}`, {
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

      viewDialog.value = true
    }

    const testEditDialog = () => {
      editDialog.value = true
    }

    const forcePopulateForm = () => {
      if (editingBooking.value) {
        // Simple form population
        editForm.court_id = editingBooking.value.court_id || 1
        // Extract date without timezone conversion
        const startTime = new Date(editingBooking.value.start_time)
        editForm.date = formatDateToYYYYMMDD(startTime)
        editForm.start_time = new Date(editingBooking.value.start_time).toISOString()
        editForm.duration = 1
        editForm.notes = editingBooking.value.notes || ''
        editForm.status = editingBooking.value.status || 'pending'
        editForm.frequency_type = editingBooking.value.frequency_type || 'once'
        editForm.frequency_days = editingBooking.value.frequency_days || []
        editForm.frequency_times = editingBooking.value.frequency_times || []
        editForm.frequency_duration_months = editingBooking.value.frequency_duration_months || 1
        editForm.frequency_end_date = editingBooking.value.frequency_end_date || ''
        editForm.payment_method = editingBooking.value.payment_method || ''
        editForm.gcash_amount = ''
        editForm.proof_of_payment = null
      }
    }


    const editBooking = async (booking) => {
      try {
        // Set flag to prevent watchers from triggering
        isInitializingEdit.value = true

        // Populate edit form with booking data
        editItem.value = {
          id: booking.id,
          transaction_id: booking.transaction_id,
          court_id: booking.court?.id,
          booking_date: booking.booking_date,
          start_time: booking.cart_items && booking.cart_items.length > 0
            ? booking.cart_items[0].start_time
            : null,
          end_time: booking.cart_items && booking.cart_items.length > 0
            ? booking.cart_items[booking.cart_items.length - 1].end_time
            : null,
          originalItems: JSON.parse(JSON.stringify(booking.cart_items || []))
        }

        globalEditDialog.value = true

        // Wait for dialog to render, then load available slots
        await nextTick()

        if (editItem.value.court_id && editItem.value.booking_date) {
          await fetchEditAvailableSlots()

          // Mark user's own booked slots as available so they can be deselected
          if (booking.cart_items && booking.cart_items.length > 0) {
            booking.cart_items.forEach(cartItem => {
              // Normalize time format (remove seconds if present)
              const normalizeTime = (time) => {
                if (!time) return time
                // If format is HH:MM:SS, convert to HH:MM
                return time.substring(0, 5)
              }

              const normalizedStart = normalizeTime(cartItem.start_time)
              const normalizedEnd = normalizeTime(cartItem.end_time)

              const slotIndex = editAvailableSlots.value.findIndex(
                slot => normalizeTime(slot.start) === normalizedStart && normalizeTime(slot.end) === normalizedEnd
              )

              if (slotIndex !== -1) {
                // Mark own slot as available and ensure price is set
                const slot = editAvailableSlots.value[slotIndex]

                slot.available = true

                // Recalculate price if missing, invalid, or negative
                const currentPrice = parseFloat(slot.price)
                if (!slot.price || isNaN(currentPrice) || currentPrice < 0) {
                  const court = courts.value.find(c => c.id === editItem.value.court_id)
                  if (court) {
                    const start = new Date(`2000-01-01 ${slot.start}`)
                    const end = new Date(`2000-01-01 ${slot.end}`)
                    const hours = (end - start) / (1000 * 60 * 60)
                    slot.price = (court.sport.price_per_hour * hours).toFixed(2)
                  } else {
                  }
                }
              } else {
                // If slot not in list, add it (shouldn't happen, but just in case)
                const court = courts.value.find(c => c.id === editItem.value.court_id)
                if (court) {
                  const start = new Date(`2000-01-01 ${cartItem.start_time}`)
                  const end = new Date(`2000-01-01 ${cartItem.end_time}`)
                  const hours = (end - start) / (1000 * 60 * 60)

                  editAvailableSlots.value.push({
                    start: cartItem.start_time,
                    end: cartItem.end_time,
                    available: true,
                    price: (court.sport.price_per_hour * hours).toFixed(2)
                  })
                }
              }
            })

            // Remove duplicates (keep first occurrence)
            const uniqueSlots = []
            const seenKeys = new Set()

            editAvailableSlots.value.forEach(slot => {
              const key = `${slot.start}-${slot.end}`
              if (!seenKeys.has(key)) {
                seenKeys.add(key)
                uniqueSlots.push(slot)
              }
            })

            editAvailableSlots.value = uniqueSlots

            // Sort all slots by start time
            editAvailableSlots.value.sort((a, b) => {
              const timeA = new Date(`2000-01-01 ${a.start}`)
              const timeB = new Date(`2000-01-01 ${b.start}`)
              return timeA - timeB
            })
          }

          // Pre-populate selected slots from existing booking cart items
          if (booking.cart_items && booking.cart_items.length > 0) {
            editSelectedSlots.value = []

            // Normalize time format helper
            const normalizeTime = (time) => {
              if (!time) return time
              return time.substring(0, 5) // HH:MM:SS -> HH:MM
            }

            // Match cart items with available slots (now they should all be marked as available)
            booking.cart_items.forEach(cartItem => {
              const normalizedStart = normalizeTime(cartItem.start_time)
              const normalizedEnd = normalizeTime(cartItem.end_time)

              const matchingSlot = editAvailableSlots.value.find(
                slot => normalizeTime(slot.start) === normalizedStart && normalizeTime(slot.end) === normalizedEnd
              )

              if (matchingSlot) {
                editSelectedSlots.value.push(matchingSlot)
              }
            })

            // Sort selected slots by start time
            editSelectedSlots.value.sort((a, b) => {
              const timeA = new Date(`2000-01-01 ${a.start}`)
              const timeB = new Date(`2000-01-01 ${b.start}`)
              return timeA - timeB
            })
          }
        }

        // Clear flag after initialization is complete
        isInitializingEdit.value = false
      } catch (error) {
        isInitializingEdit.value = false // Clear flag on error too
        showAlert({
          icon: 'error',
          title: 'Error',
          text: 'Failed to open edit dialog'
        })
      }
    }

    const fetchEditAvailableSlots = async () => {
      if (!editItem.value.court_id || !editItem.value.booking_date) {
        return
      }

      loadingSlotsEdit.value = true
      const url = `${import.meta.env.VITE_API_URL}/api/courts/${editItem.value.court_id}/available-slots?date=${editItem.value.booking_date}`

      try {
        const response = await fetch(url, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Accept': 'application/json'
          }
        })

        if (response.ok) {
          const data = await response.json()

          // API returns data in data.data, not data.slots
          let slots = data.data || data.slots || []

          // Deduplicate immediately after fetching
          const uniqueSlots = []
          const seenKeys = new Set()

          slots.forEach(slot => {
            const key = `${slot.start}-${slot.end}`
            if (!seenKeys.has(key)) {
              seenKeys.add(key)
              uniqueSlots.push(slot)
            }
          })

          editAvailableSlots.value = uniqueSlots
        } else {
          const errorText = await response.text()
          editAvailableSlots.value = []
        }
      } catch (error) {
        editAvailableSlots.value = []
      } finally {
        loadingSlotsEdit.value = false
      }
    }

    const isEditSlotSelected = (slot) => {
      return editSelectedSlots.value.some(s => s.start === slot.start && s.end === slot.end)
    }

    const isOwnBookedSlot = (slot) => {
      // Check if this slot is part of the original booking being edited
      return editItem.value.originalItems.some(
        item => item.start_time === slot.start && item.end_time === slot.end
      )
    }

    const canSelectEditSlot = (slot) => {
      // Can select if: available OR it's the user's own booked slot
      return slot.available || isOwnBookedSlot(slot)
    }

    const selectEditTimeSlot = (slot) => {
      // Allow selection if it's available or the user's own slot
      if (!canSelectEditSlot(slot)) {
        return
      }

      const index = editSelectedSlots.value.findIndex(s => s.start === slot.start && s.end === slot.end)

      if (index > -1) {
        // Deselect if already selected
        editSelectedSlots.value.splice(index, 1)
      } else {
        // Validate and ensure price exists before adding
        let validSlot = { ...slot }

        // If price is missing, invalid, or negative, calculate it
        const currentPrice = parseFloat(validSlot.price)
        if (!validSlot.price || isNaN(currentPrice) || currentPrice < 0) {
          const court = courts.value.find(c => c.id === editItem.value.court_id)

          if (court) {
            const start = new Date(`2000-01-01 ${slot.start}`)
            const end = new Date(`2000-01-01 ${slot.end}`)
            const hours = (end - start) / (1000 * 60 * 60)
            validSlot.price = (court.sport.price_per_hour * hours).toFixed(2)
          } else {
            return
          }
        }

        // Add to selection with validated price
        editSelectedSlots.value.push(validSlot)
      }

      // Sort slots by start time
      editSelectedSlots.value.sort((a, b) => {
        const timeA = new Date(`2000-01-01 ${a.start}`)
        const timeB = new Date(`2000-01-01 ${b.start}`)
        return timeA - timeB
      })

      // Update start_time and end_time based on selected slots
      if (editSelectedSlots.value.length > 0) {
        editItem.value.start_time = editSelectedSlots.value[0].start
        editItem.value.end_time = editSelectedSlots.value[editSelectedSlots.value.length - 1].end
      } else {
        editItem.value.start_time = null
        editItem.value.end_time = null
      }
    }

    const calculateEditPrice = () => {
      if (editSelectedSlots.value.length === 0) {
        return 0
      }

      const court = courts.value.find(c => c.id === editItem.value.court_id)
      if (!court) return 0

      // Calculate total price from all selected slots
      const totalPrice = editSelectedSlots.value.reduce((sum, slot) => {
        return sum + (parseFloat(slot.price) || 0)
      }, 0)

      return totalPrice.toFixed(2)
    }

    const closeCartEditDialog = () => {
      globalEditDialog.value = false
      editItem.value = {
        id: null,
        transaction_id: null,
        court_id: null,
        booking_date: null,
        start_time: null,
        end_time: null,
        originalItems: []
      }
      editSelectedSlots.value = []
      editAvailableSlots.value = []
    }

    const saveEditBooking = async () => {
      if (!editItem.value.court_id || editSelectedSlots.value.length === 0) {
        showAlert({
          icon: 'warning',
          title: 'Incomplete Data',
          text: 'Please select a court and at least one time slot'
        })
        return
      }

      updatingBooking.value = true
      try {
        // Delete old cart items (skip if already completed/not found)
        for (const item of editItem.value.originalItems) {
          try {
            await cartService.removeFromCart(item.id)
          } catch (deleteError) {
            // Cart item might already be completed or not found - that's ok, continue
          }
        }

        // Small delay to ensure backend processes deletions
        await new Promise(resolve => setTimeout(resolve, 300))

        // Format booking date to ensure it's in Y-m-d format (avoid timezone issues)
        let bookingDate = editItem.value.booking_date
        if (bookingDate instanceof Date) {
          bookingDate = formatDateToYYYYMMDD(bookingDate)
        } else if (typeof bookingDate === 'string') {
          // Extract date part if it's a datetime string
          bookingDate = bookingDate.split(' ')[0]
        }

        // Add new cart items for each selected slot
        const cartItems = editSelectedSlots.value.map((slot, index) => {
          let price = parseFloat(slot.price)

          // If price is negative or invalid, recalculate from court
          if (isNaN(price) || price < 0) {
            const court = courts.value.find(c => c.id === editItem.value.court_id)
            if (court) {
              const start = new Date(`2000-01-01 ${slot.start}`)
              const end = new Date(`2000-01-01 ${slot.end}`)
              const hours = (end - start) / (1000 * 60 * 60)
              price = parseFloat((court.sport.price_per_hour * hours).toFixed(2))
            } else {
              throw new Error(`Cannot calculate price for slot ${slot.start}-${slot.end}`)
            }
          }

          // Final validation
          if (isNaN(price) || price < 0) {
            throw new Error(`Invalid price for slot ${slot.start}-${slot.end}`)
          }

          return {
            court_id: editItem.value.court_id,
            booking_date: bookingDate,
            start_time: slot.start,
            end_time: slot.end,
            price: price
          }
        })

        await cartService.addToCart(cartItems)

        // Close dialog first
        closeCartEditDialog()

        // Refresh data
        await fetchBookings()
        window.dispatchEvent(new CustomEvent('cart-updated'))

        // Show success message after dialog is closed
        await showAlert({
          icon: 'success',
          title: 'Success!',
          text: `Booking updated successfully with ${editSelectedSlots.value.length} time slot(s)`,
          timer: 2000,
          showConfirmButton: false
        })
      } catch (error) {

        // Build detailed error message
        let errorMessage = error.response?.data?.message || 'Failed to update booking'
        if (error.response?.data?.errors) {
          const errors = error.response.data.errors
          const errorDetails = Object.keys(errors).map(key =>
            `${key}: ${errors[key].join(', ')}`
          ).join('\n')
          errorMessage += '\n\n' + errorDetails
        }

        showAlert({
          icon: 'error',
          title: 'Update Failed',
          text: errorMessage
        })
      } finally {
        updatingBooking.value = false
      }
    }

    // Watch for court and date changes (but not during initial load)
    watch(() => editItem.value.court_id, () => {
      if (isInitializingEdit.value) {
        return
      }
      if (editItem.value.court_id && editItem.value.booking_date) {
        editSelectedSlots.value = [] // Clear selections when court changes
        fetchEditAvailableSlots()
      }
    })

    watch(() => editItem.value.booking_date, () => {
      if (isInitializingEdit.value) {
        return
      }
      if (editItem.value.court_id && editItem.value.booking_date) {
        editSelectedSlots.value = [] // Clear selections when date changes
        fetchEditAvailableSlots()
      }
    })

    const loadCourts = async () => {
      try {
        courts.value = await courtService.getCourts()
        triggerRef(courts) // Manually trigger reactivity for shallowRef
      } catch (error) {
      }
    }

    const loadAvailableSlots = async () => {
      if (!editForm.court_id || !editForm.date) return

      try {
        const slots = await courtService.getAvailableSlots(
          editForm.court_id,
          editForm.date,
          editForm.duration || 1
        )

        // Filter out booked/unavailable slots
        // Only show truly available slots (available: true) or waitlist-available slots
        // UNLESS we're editing a booking, then include the current booking's slot
        const filteredSlots = slots.filter(slot => {
          // Include if slot is available
          if (slot.available) return true
          // Include if waitlist is available (pending/unpaid bookings)
          if (slot.is_waitlist_available) return true
          // If editing, include the current booking's slot even if it's marked as booked
          if (editingBooking.value && slot.booking_id === editingBooking.value.id) return true
          // Exclude fully booked slots
          return false
        })

        // If we're editing a booking and the current slot wasn't in the filtered list,
        // manually add it to ensure users can keep their existing time slot
        if (editingBooking.value) {
          const currentStartTime = new Date(editingBooking.value.start_time).toISOString()
          const existingSlot = filteredSlots.find(slot => slot.start_time === currentStartTime)

          if (!existingSlot) {
            const currentEndTime = new Date(editingBooking.value.end_time).toISOString()
            const currentSlot = {
              start_time: currentStartTime,
              end_time: currentEndTime,
              formatted_time: `${new Date(currentStartTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - ${new Date(currentEndTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
              available: true, // Mark as available so it can be selected
              booking_id: editingBooking.value.id
            }
            filteredSlots.unshift(currentSlot) // Add to beginning
          }
        }

        availableSlots.value = filteredSlots
        triggerRef(availableSlots) // Manually trigger reactivity for shallowRef
        calculatePrice()
      } catch (error) {
        editError.value = 'Failed to load available time slots'
      }
    }

    const onCourtChange = async () => {
      selectedCourt.value = courts.value.find(c => c.id === editForm.court_id)
      editForm.start_time = ''
      availableSlots.value = []
      triggerRef(availableSlots) // Manually trigger reactivity for shallowRef
      totalPrice.value = 0

      if (editForm.date) {
        await loadAvailableSlots()
      }
    }

    const onDateChange = async () => {
      editForm.start_time = ''
      availableSlots.value = []
      triggerRef(availableSlots) // Manually trigger reactivity for shallowRef
      totalPrice.value = 0

      if (editForm.court_id) {
        await loadAvailableSlots()
      }
    }

    const calculatePrice = () => {
      if (!selectedCourt.value || !editForm.duration) {
        totalPrice.value = 0
        return
      }

      const basePrice = selectedCourt.value.sport.price_per_hour * editForm.duration

      if (editForm.frequency_type === 'once') {
        totalPrice.value = basePrice
      } else if (editForm.frequency_type === 'daily') {
        totalPrice.value = basePrice * editForm.frequency_duration_months * 30
      } else if (editForm.frequency_type === 'weekly') {
        const sessionsPerWeek = editForm.frequency_days ? editForm.frequency_days.length : 1
        totalPrice.value = basePrice * sessionsPerWeek * editForm.frequency_duration_months * 4
      } else if (editForm.frequency_type === 'monthly') {
        const sessionsPerMonth = editForm.frequency_days ? editForm.frequency_days.length : 1
        totalPrice.value = basePrice * sessionsPerMonth * editForm.frequency_duration_months
      } else if (editForm.frequency_type === 'yearly') {
        const sessionsPerYear = editForm.frequency_days ? editForm.frequency_days.length : 1
        totalPrice.value = basePrice * sessionsPerYear * editForm.frequency_duration_months
      } else {
        totalPrice.value = basePrice
      }
    }

    const getEditBookingInfoText = () => {
      if (editForm.frequency_type === 'once') {
        return `Your booking will be updated for admin approval. Total cost: ₱${totalPrice.value.toFixed(2)}`
      } else {
        return `This frequency booking will be updated for admin approval. You'll be billed once for the entire period: ₱${totalPrice.value.toFixed(2)}`
      }
    }

    // Watch for changes in form fields to recalculate price
    watch(() => editForm.start_time, () => {
      if (editForm.start_time) {
        calculatePrice()
      }
    })

    watch(() => editForm.duration, () => {
      calculatePrice()
    })

    watch(() => editForm.frequency_type, () => {
      calculatePrice()
    })

    watch(() => editForm.frequency_days, () => {
      calculatePrice()
    }, { deep: true })

    watch(() => editForm.frequency_duration_months, () => {
      calculatePrice()
    })

    const updateBooking = async () => {
      try {
        editLoading.value = true
        editError.value = ''


        if (!editForm.court_id || !editForm.date || !editForm.start_time) {
          editError.value = 'Please fill in all required fields'
          return
        }

        if (!selectedCourt.value) {
          editError.value = 'Please select a valid court'
          return
        }

        // Calculate end time
        const startDateTime = new Date(editForm.start_time)
        const endDateTime = new Date(startDateTime.getTime() + (editForm.duration * 60 * 60 * 1000))

        const updateData = {
          court_id: parseInt(editForm.court_id),
          start_time: startDateTime.toISOString(),
          end_time: endDateTime.toISOString(),
          total_price: parseFloat(totalPrice.value.toFixed(2)),
          status: editForm.status,
          notes: editForm.notes || '',
          frequency_type: editForm.frequency_type,
          frequency_days: editForm.frequency_days,
          frequency_times: editForm.frequency_times,
          frequency_duration_months: editForm.frequency_duration_months,
          frequency_end_date: editForm.frequency_end_date || null,
          payment_method: editForm.payment_method || null
        }

        // Update booking
        await courtService.updateBooking(editingBooking.value.id, updateData)

        // Handle proof of payment upload if provided
        if (editForm.proof_of_payment && editForm.proof_of_payment.length > 0) {
          try {
            await uploadProofOfPayment(editingBooking.value.id, editForm.proof_of_payment[0])
            showSnackbar('Proof of payment uploaded successfully!', 'success')
          } catch (error) {
            showSnackbar('Failed to upload proof of payment', 'error')
          }
        }

        // Refresh bookings list
        await fetchBookings()

        // Dispatch event to refresh other components
        window.dispatchEvent(new CustomEvent('booking-updated'))

        closeEditDialog()
      } catch (error) {

        // Handle validation errors specifically
        if (error.response?.status === 422 && error.response?.data?.errors) {
          const validationErrors = error.response.data.errors
          const errorMessages = Object.values(validationErrors).flat()
          editError.value = 'Validation failed: ' + errorMessages.join(', ')
        } else if (error.response?.status === 409) {
          editError.value = 'Time slot conflicts with existing booking. Please choose a different time.'
        } else if (error.response?.status === 403) {
          editError.value = 'You are not authorized to update this booking.'
        } else {
          editError.value = error.response?.data?.message || error.message || 'Failed to update booking'
        }
      } finally {
        editLoading.value = false
      }
    }

    const closeEditDialog = () => {
      editDialog.value = false
      editingBooking.value = null
      // Reset form properties individually to maintain reactivity
      editForm.court_id = ''
      editForm.date = ''
      editForm.start_time = ''
      editForm.duration = 1
      editForm.notes = ''
      editForm.status = 'pending'
      editForm.frequency_type = 'once'
      editForm.frequency_days = []
      editForm.frequency_times = []
      editForm.frequency_duration_months = 1
      editForm.frequency_end_date = ''
      editForm.payment_method = ''
      editForm.gcash_amount = ''
      editForm.proof_of_payment = null
      editError.value = ''
      availableSlots.value = []
      triggerRef(availableSlots) // Manually trigger reactivity for shallowRef
      selectedCourt.value = null
      totalPrice.value = 0
    }

    const closeGlobalEditDialog = () => {
      globalEditDialog.value = false
      editingBooking.value = null
    }

    // QR Code functions
    const showQrCode = (booking) => {
      selectedBooking.value = booking
      qrCodeDialog.value = true
    }

    const closeQrCodeDialog = () => {
      qrCodeDialog.value = false
      selectedBooking.value = null
    }

    const openQrScanner = () => {
      qrScannerDialog.value = true
    }

    const closeQrScannerDialog = () => {
      qrScannerDialog.value = false
    }

    const checkAuth = async (retryCount = 0) => {
      try {
        const token = localStorage.getItem('token')

        if (token) {
          const userData = await authService.getUser()
          user.value = userData
          return true
        }
        return false
      } catch (error) {

        // If it's a network error and we haven't retried, try once more
        if (retryCount === 0 && (error.code === 'NETWORK_ERROR' || !error.response)) {
          await new Promise(resolve => setTimeout(resolve, 1000)) // Wait 1 second
          return checkAuth(1)
        }

        // If it's a 401 error, the token is invalid
        if (error.response?.status === 401) {
          localStorage.removeItem('token')
        }

        user.value = null
        return false
      }
    }

    // Listen for booking refresh events
    const handleBookingRefresh = () => {
      if (isAuthenticated.value) {
        fetchBookings()
      }
    }

    // Listen for authentication events from App.vue
    const handleAuthChange = (event) => {
      const userData = event.detail?.user
      if (userData) {
        user.value = userData
        fetchBookings()
      } else {
        user.value = null
      }
    }

    onMounted(async () => {
      authLoading.value = true

      // Load company settings for UI toggles
      try {
        const settings = await companySettingService.getSettings()
        companySettings.value = settings
      } catch (e) {}

      // Wait a moment for App.vue to complete its auth check
      await new Promise(resolve => setTimeout(resolve, 50))

      // First check if we already have user data (from App.vue)
      const token = localStorage.getItem('token')
      if (token) {
        try {
          const userData = await authService.getUser()
          user.value = userData
        } catch (error) {
          user.value = null
        }
      } else {
        user.value = null
      }

      // Note: canUsersBook is now a computed property based on user.value and companySettings.value
      // No need to set it manually - it will update automatically

      // Always try to fetch bookings regardless of auth status
      await fetchBookings()

      // Load courts for edit dialog
      await loadCourts()

      // Load sports for filter
      await loadSports()

      authLoading.value = false

      // Restore view mode
      try {
        const savedMode = localStorage.getItem('bookings_view_mode')
        if (savedMode === 'table' || savedMode === 'cards') {
          viewMode.value = savedMode
        }
      } catch (e) {}

      // Mark mounted for watchers
      setTimeout(() => { isMounted.value = true }, 100)

      // Listen for custom events to refresh bookings
      window.addEventListener('booking-created', handleBookingRefresh)
      window.addEventListener('booking-updated', handleBookingRefresh)
      window.addEventListener('booking-cancelled', handleBookingRefresh)

      // Listen for authentication changes
      window.addEventListener('auth-changed', handleAuthChange)
    })

    onUnmounted(() => {
      // Clean up event listeners
      window.removeEventListener('booking-created', handleBookingRefresh)
      window.removeEventListener('booking-updated', handleBookingRefresh)
      window.removeEventListener('booking-cancelled', handleBookingRefresh)
      window.removeEventListener('auth-changed', handleAuthChange)
    })

    // Watch for route changes to refresh data when navigating to this page
    watch(() => route.path, (newPath) => {
      if (newPath === '/bookings' && user.value) {
        fetchBookings()
      }
    })





    const showSnackbar = (data, color = 'success') => {
      // Handle both object format from GlobalBookingDialog and direct parameters
      let message, messageColor

      if (typeof data === 'object' && data.message) {
        // Object format: { message, type }
        message = data.message
        messageColor = data.type === 'error' ? 'error' : 'success'
      } else {
        // Direct parameter format
        message = data
        messageColor = color
      }

      snackbar.value = {
        show: true,
        message,
        color: messageColor
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

    // Payment-related methods
    const onPaymentMethodChange = (method) => {
      if (method === 'gcash') {
        editForm.gcash_amount = `₱${(parseFloat(editingBooking.value?.total_price) || 0).toFixed(2)}`
      } else {
        editForm.gcash_amount = ''
        editForm.proof_of_payment = null
      }
    }

    const onProofOfPaymentChange = (files) => {
      if (files && files.length > 0) {
        const file = files[0]
        if (file.size > 5000000) { // 5MB limit
          showSnackbar('File size should be less than 5 MB', 'error')
          editForm.proof_of_payment = null
          newProofPreview.value = null
          return
        }

        // Validate file type
        if (!file.type.startsWith('image/')) {
          showSnackbar('Please upload an image file', 'error')
          editForm.proof_of_payment = null
          newProofPreview.value = null
          return
        }

        // Create preview
        const reader = new FileReader()
        reader.onload = (e) => {
          newProofPreview.value = e.target.result
        }
        reader.readAsDataURL(file)

        showSnackbar('Proof of payment uploaded successfully!', 'success')
      } else {
        newProofPreview.value = null
      }
    }

    const viewProofOfPayment = () => {
      if (editingBooking.value?.proof_of_payment) {
        // Open proof of payment in a new window/tab
        window.open(editingBooking.value.proof_of_payment, '_blank')
      }
    }

    const openPreviewDialog = () => {
      previewUploadDialog.value = true
    }

    const uploadProofOfPayment = async (bookingId, file) => {
      try {
        const result = await bookingService.uploadProofOfPayment(
          bookingId,
          file,
          editForm.payment_method
        )
        return result.data
      } catch (error) {
        throw error
      }
    }


    return {
      bookings,
      transactions,
      flattenedBookings,
      expandedTransactions,
      toggleTransactionDetails,
      filteredTransactions,
      useVirtualScrolling,
      statusFilter,
      paymentStatusFilter,
      sportFilter,
      sportOptions,
      dateFromFilter,
      dateToFilter,
      statusOptions,
      viewMode,
      tableHeaders,
      hasActiveFilters,
      clearFilters,
      filteredBookings,
      groupedByDay,
      expandedCartItems,
      toggleCartItems,
      formatDayLabel,
      loading,
      error,
      cancelling,
      updating,
      user,
      authLoading,
      isAuthenticated,
      isAdmin,
      tokenStatus,
      maxDate,
      headers,
      itemProps,
      isBookingExpired,
      formatDate,
      formatTime,
      formatTimeSlot,
      calculateTotalDuration,
      getFirstCartItemBookingForName,
      formatDateTime,
      getDuration,
      getTransactionDateGroups,
      getGroupedTimeDisplay,
      calculateCartItemDuration,
      // Approval helpers
      getApprovalStatusColor,
      formatApprovalStatus,
      expanded,
      statusService,
      formatRecurrenceType,
      generateBookings,
      editRecurringSchedule,
      viewRecurringSchedule,
      deleteRecurringSchedule,
      cancelBooking,
      openBookingDialog,
      closeNewBookingDialog,
      onBookingCreated,
      fetchBookings,
      newBookingDialog,
      companySettings,
      canUsersBook,
      generateDialogOpen,
      viewBooking,
      viewDialog,
      selectedBooking,
      recurringViewDialog,
      selectedRecurringSchedule,
      editBooking,
      testEditDialog,
      forcePopulateForm,
      editDialog,
      globalEditDialog,
      editingBooking,
      editForm,
      newProofPreview,
      previewUploadDialog,
      editLoading,
      editError,
      courts,
      availableSlots,
      selectedCourt,
      totalPrice,
      durationOptions,
      editStatusOptions,
      editFrequencyOptions,
      editDayOptions,
      paymentMethodOptions,
      onCourtChange,
      onDateChange,
      calculatePrice,
      getEditBookingInfoText,
      updateBooking,
      closeEditDialog,
      closeGlobalEditDialog,
      // New edit dialog functions
      editItem,
      editSelectedSlots,
      editAvailableSlots,
      loadingSlotsEdit,
      updatingBooking,
      fetchEditAvailableSlots,
      isEditSlotSelected,
      isOwnBookedSlot,
      canSelectEditSlot,
      selectEditTimeSlot,
      calculateEditPrice,
      saveEditBooking,
      closeCartEditDialog,
      showQrCode,
      closeQrCodeDialog,
      openQrScanner,
      closeQrScannerDialog,
      qrCodeDialog,
      qrScannerDialog,
      snackbar,
      showSnackbar,
      handleImageError,
      openCart,
      removeFromCart,
      // Payment methods
      onPaymentMethodChange,
      onProofOfPaymentChange,
      viewProofOfPayment,
      openPreviewDialog,
      uploadProofOfPayment,
      // Recurring schedule detail functions
      getRecurringPriceText,
      formatRecurrenceDetails,
      getRecurringDurationText,
      hasDaySpecificTimes,
      hasRecurrenceDays,
      getRecurrenceTypeColor,
      getIntervalSuffix,
      getDayName,
      calculateDuration,
      getRecurringSummaryText,
      // Frequency booking functions
      formatFrequencyType,
      getFrequencyColor,
      getFrequencyDetailsText,
      formatPrice,
      formatNumber,
      formatPriceTemplate,
      formatNumberTemplate,
      // Payment status functions
      getPaymentStatus,
      getPaymentStatusColor,
      getPaymentStatusText,
      getPaymentStatusIcon,
      // Filter functions
      clearFilters,
      // Services
      sportService
    }
  }
}
</script>

<style scoped>
/* Modern Sports Bookings Theme */
.bookings-container {
  min-height: 100vh;
  padding: 32px;
  position: relative;
  z-index: 1;
}

/* Background is now handled globally by App.vue */

/* Bookings Header */
.bookings-header {
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

.header-title {
  font-size: clamp(2.5rem, 5vw, 4rem);
  font-weight: 800;
  line-height: 1.1;
  margin-bottom: 24px;
  color: #1e293b;
}

.title-gradient {
  background: linear-gradient(135deg, #B71C1C 0%, #D32F2F 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.header-subtitle {
  font-size: clamp(1.1rem, 2vw, 1.3rem);
  color: #64748b;
  max-width: 600px;
  margin: 0 auto 32px;
  line-height: 1.6;
}

.header-actions {
  display: flex;
  justify-content: center;
  gap: 16px;
}

.header-btn-primary {
  background: linear-gradient(135deg, #B71C1C 0%, #D32F2F 100%) !important;
  color: white !important;
  border-radius: 12px !important;
  font-weight: 700 !important;
  text-transform: none !important;
  padding: 16px 32px !important;
  box-shadow: 0 8px 25px rgba(183, 28, 28, 0.4) !important;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
}

.header-btn-primary:hover {
  transform: translateY(-4px) !important;
  box-shadow: 0 12px 35px rgba(183, 28, 28, 0.6) !important;
}

/* Authentication Section */
.auth-section {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 60vh;
  padding: 48px 0;
}

.auth-card {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-radius: 24px;
  padding: 48px;
  text-align: center;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.2);
  max-width: 500px;
  width: 100%;
}

.auth-icon {
  margin-bottom: 24px;
}

.auth-title {
  font-size: 2rem;
  font-weight: 700;
  margin-bottom: 16px;
  background: linear-gradient(135deg, #1e293b 0%, #3b82f6 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.auth-text {
  color: #64748b;
  line-height: 1.6;
  margin-bottom: 32px;
  font-size: 1.1rem;
}

.auth-btn {
  background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%) !important;
  color: white !important;
  border-radius: 12px !important;
  font-weight: 700 !important;
  text-transform: none !important;
  padding: 16px 32px !important;
  box-shadow: 0 8px 25px rgba(59, 130, 246, 0.4) !important;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
}

.auth-btn:hover {
  transform: translateY(-4px) !important;
  box-shadow: 0 12px 35px rgba(59, 130, 246, 0.6) !important;
}

/* Toolbar Section */
.bookings-toolbar {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-radius: 16px;
  padding: 24px;
  margin-bottom: 24px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.toolbar-section {
  display: flex;
  gap: 16px;
  align-items: center;
  flex-wrap: wrap;
}

.filters-section {
  display: flex;
  gap: 12px;
  align-items: center;
  flex-wrap: wrap;
}

.filter-field {
  border-radius: 8px !important;
}

.filter-btn {
  border-radius: 8px !important;
  font-weight: 600 !important;
  text-transform: none !important;
}

/* Card-based Bookings Layout */
.bookings-cards-container {
  padding: 24px;
  min-height: 400px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.loading-spinner {
  margin: 100px auto;
}

.no-bookings {
  text-align: center;
  padding: 60px 20px;
}

/* Bookings Grid Container */
.bookings-grid-container {
  width: 100%;
  max-width: 1600px;
  margin: 0 auto;
  padding: 12px;
}

/* Compact Grid Layout - No Grouping */
.bookings-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 12px;
}

/* Mobile First - Single Column */
@media (max-width: 767px) {
  .bookings-grid-container {
    padding: 8px;
  }

  .bookings-grid {
    grid-template-columns: 1fr;
    gap: 12px;
  }
}

/* Tablet - 2 Columns */
@media (min-width: 768px) {
  .bookings-grid-container {
    padding: 16px;
  }

  .bookings-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 16px;
  }
}

/* Desktop - 3 Columns */
@media (min-width: 1024px) {
  .bookings-grid-container {
    padding: 20px;
  }

  .bookings-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

/* Large Desktop - 4 Columns */
@media (min-width: 1440px) {
  .bookings-grid {
    grid-template-columns: repeat(4, 1fr);
  }
}

.booking-card-compact {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border-radius: 12px !important;
  overflow: hidden;
  border: 1px solid rgba(0, 0, 0, 0.06);
  background: white !important;
  position: relative;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.booking-card-compact:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.12) !important;
  border-color: rgba(59, 130, 246, 0.3);
}

.pending-card {
  border-left: 4px solid #f59e0b !important;
}

.approved-card {
  border-left: 4px solid #10b981 !important;
}

.rejected-card {
  border-left: 4px solid #ef4444 !important;
}

.status-banner-compact {
  padding: 6px 12px;
  text-align: center;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.6px;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
}

.status-banner::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, rgba(255,255,255,0.15) 0%, transparent 100%);
  pointer-events: none;
}

.status-banner v-icon,
.status-banner span {
  position: relative;
  z-index: 1;
}

.approved-banner {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: white;
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
}

.pending-banner {
  background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
  color: white;
  box-shadow: 0 4px 12px rgba(245, 158, 11, 0.3);
}

.rejected-banner {
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
  color: white;
  box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);
}

.waitlist-banner {
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  color: white;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
}

.expired-banner {
  background: linear-gradient(135deg, #6b7280 0%, #4b5563 100%);
  color: white;
  box-shadow: 0 4px 12px rgba(107, 114, 128, 0.3);
}

/* Booking Date Header */
.booking-date-header {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 8px 12px;
  background: linear-gradient(135deg, #FFF5F5 0%, #FFEBEE 100%);
  border-radius: 8px;
  margin-bottom: 12px;
  border-left: 3px solid #B71C1C;
}

.booking-date-text {
  font-size: 12px;
  font-weight: 700;
  color: #B71C1C;
  letter-spacing: 0.3px;
}

.booking-court-info-compact {
  text-align: center;
  margin-bottom: 12px;
}

.court-name-compact {
  font-size: 14px;
  font-weight: 700;
  color: #B71C1C;
  margin: 0;
  line-height: 1.2;
}

.time-slots-group {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 4px;
}

.time-slot-display {
  font-weight: 600;
  color: #B71C1C;
}

.booking-details-compact {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.detail-row {
  display: flex;
  align-items: center;
  font-size: 14px;
  color: #374151;
}

.detail-row-compact {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  padding: 8px;
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
  border-radius: 8px;
  border-left: 3px solid transparent;
  transition: all 0.2s ease;
}

.detail-row-compact:hover {
  background: linear-gradient(135deg, #FFF5F5 0%, #FFEBEE 100%);
  border-left-color: #B71C1C;
}

.detail-icon-compact {
  width: 28px;
  height: 28px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.time-icon {
  background: linear-gradient(135deg, #B71C1C 0%, #D32F2F 100%);
  box-shadow: 0 4px 12px rgba(183, 28, 28, 0.3);
}

.user-icon {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
}

.price-icon {
  background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
  box-shadow: 0 4px 12px rgba(245, 158, 11, 0.3);
}

.payment-icon {
  background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%);
  box-shadow: 0 4px 12px rgba(139, 92, 246, 0.3);
}

.approval-icon {
  background: linear-gradient(135deg, #06b6d4 0%, #0891b2 100%);
  box-shadow: 0 4px 12px rgba(6, 182, 212, 0.3);
}

.detail-content-compact {
  flex: 1;
  min-width: 0;
}

.detail-label-compact {
  font-size: 10px;
  font-weight: 600;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.4px;
  margin-bottom: 2px;
}

.detail-value-compact {
  font-size: 12px;
  font-weight: 600;
  color: #B71C1C;
  line-height: 1.3;
}

.price-value-compact {
  font-size: 16px;
  font-weight: 700;
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.rejection-notice-compact {
  display: flex;
  align-items: flex-start;
  gap: 6px;
  padding: 8px;
  background: linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%);
  border-radius: 8px;
  border-left: 4px solid #ef4444;
  margin-top: 16px;
}

.admin-booking-highlight {
  background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%);
  border-left: 3px solid #3b82f6;
  padding-left: 8px;
  border-radius: 6px;
  margin: 4px 0;
}

.rejection-label {
  font-size: 12px;
  font-weight: 600;
  color: #991b1b;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 4px;
}

.rejection-text-compact {
  font-size: 11px;
  color: #7f1d1d;
  line-height: 1.4;
}

.cart-items-compact {
  background: #f8fafc;
  padding: 8px;
  border-radius: 6px;
  border: 1px solid #e2e8f0;
}

.cart-item-row-compact {
  display: flex;
  align-items: center;
  padding: 4px 0;
  border-bottom: 1px solid #e5e7eb;
}

.cart-item-row-compact:last-child {
  border-bottom: none;
}

.booking-actions-compact {
  display: flex;
  justify-content: flex-end;
  gap: 6px;
  margin-top: 8px;
  padding-top: 8px;
  border-top: 1px solid #e5e7eb;
}

.excel-header {
  background: white;
  border: 1px solid #d1d5db;
  border-radius: 8px 8px 0 0;
  padding: 20px 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.excel-title-section {
  flex: 1;
}

.excel-title {
  font-size: 24px;
  font-weight: 700;
  color: #1f2937;
  margin: 0 0 4px 0;
}

.excel-subtitle {
  font-size: 14px;
  color: #6b7280;
  margin: 0;
}

.excel-actions {
  display: flex;
  gap: 12px;
}

.excel-tabs {
  background: white;
  border: 1px solid #d1d5db;
  border-top: none;
  border-radius: 0 0 8px 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.excel-tab-container {
  border: none !important;
}

.excel-tab {
  font-size: 14px !important;
  font-weight: 500 !important;
  text-transform: none !important;
  padding: 16px 24px !important;
}

.excel-tab-window {
  background: white;
  border: 1px solid #d1d5db;
  border-top: none;
  border-radius: 0 0 8px 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.excel-add-btn {
  background: #3b82f6 !important;
  color: white !important;
  font-weight: 600;
  text-transform: none;
  border-radius: 6px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.excel-auth-required {
  background: white;
  border: 1px solid #d1d5db;
  border-top: none;
  border-radius: 0 0 8px 8px;
  padding: 60px 24px;
  text-align: center;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.excel-auth-card {
  max-width: 400px;
  margin: 0 auto;
}

.excel-auth-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

.excel-auth-title {
  font-size: 20px;
  font-weight: 600;
  color: #1f2937;
  margin: 0 0 8px 0;
}

.excel-auth-text {
  font-size: 14px;
  color: #6b7280;
  margin: 0 0 24px 0;
}

.excel-auth-btn {
  background: #3b82f6 !important;
  color: white !important;
  font-weight: 600;
  text-transform: none;
  border-radius: 6px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.excel-toolbar {
  background: white;
  border-left: 1px solid #d1d5db;
  border-right: 1px solid #d1d5db;
  padding: 16px 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
}

.excel-search {
  flex: 1;
  max-width: 300px;
}

.excel-search-field {
  font-size: 14px;
}

.excel-filters {
  display: flex;
  gap: 12px;
  align-items: center;
}

.excel-filter-select {
  min-width: 150px;
  font-size: 14px;
}

.excel-filter-btn,
.excel-export-btn {
  font-size: 14px;
  text-transform: none;
  border-radius: 6px;
}

.excel-table-container {
  background: white;
  border: 1px solid #d1d5db;
  border-top: none;
  border-radius: 0 0 8px 8px;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.excel-data-table {
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

.excel-data-table :deep(.v-data-table__wrapper) {
  border: none;
}

.excel-data-table :deep(.v-data-table-header) {
  background: #f8fafc;
  border-bottom: 2px solid #e2e8f0;
}

.excel-data-table :deep(.v-data-table-header th) {
  background: #f8fafc !important;
  color: #374151 !important;
  font-weight: 600 !important;
  font-size: 14px !important;
  padding: 12px 16px !important;
  border-right: 1px solid #e2e8f0 !important;
  text-transform: none !important;
}

.excel-data-table :deep(.v-data-table-header th:last-child) {
  border-right: none !important;
}

.excel-data-table :deep(.v-data-table__td) {
  padding: 12px 16px !important;
  border-right: 1px solid #f1f5f9 !important;
  font-size: 14px !important;
  vertical-align: middle !important;
}

.excel-data-table :deep(.v-data-table__td:last-child) {
  border-right: none !important;
}

.excel-data-table :deep(.v-data-table__tr:hover) {
  background: #f8fafc !important;
}

.excel-table-row {
  border-bottom: 1px solid #f1f5f9;
}

.excel-cell-content {
  display: flex;
  align-items: center;
  gap: 12px;
}

.excel-cell-icon {
  font-size: 20px;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #eff6ff;
  border-radius: 6px;
}

.excel-cell-text {
  flex: 1;
  min-width: 0;
}

.excel-cell-title {
  font-weight: 600;
  color: #1f2937;
  font-size: 14px;
  margin-bottom: 2px;
}

.excel-cell-subtitle {
  color: #6b7280;
  font-size: 12px;
}

/* Creator Styles */
.excel-creator {
  padding: 8px 0;
}

.excel-creator-content {
  display: flex;
  align-items: center;
  gap: 10px;
}

.excel-creator-icon {
  font-size: 16px;
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f0f9ff;
  border-radius: 6px;
  color: #0369a1;
}

.excel-creator-text {
  flex: 1;
  min-width: 0;
}

.excel-creator-name {
  font-weight: 600;
  color: #1f2937;
  font-size: 13px;
  margin-bottom: 2px;
  line-height: 1.2;
}

.excel-creator-email {
  font-size: 11px;
  color: #6b7280;
  line-height: 1.2;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* Court Image Styles */
.court-image {
  width: 32px;
  height: 32px;
  border-radius: 6px;
  object-fit: cover;
  border: 2px solid #e5e7eb;
}

.court-icon {
  font-size: 20px;
  display: inline-block;
  width: 32px;
  height: 32px;
  line-height: 32px;
  text-align: center;
  background: #f3f4f6;
  border-radius: 6px;
  border: 2px solid #e5e7eb;
}

.excel-datetime {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.excel-date {
  font-weight: 600;
  color: #1f2937;
  font-size: 14px;
}

.excel-time {
  color: #6b7280;
  font-size: 12px;
}

.excel-duration-chip {
  font-weight: 500;
  font-size: 12px;
}

.excel-price {
  display: flex;
  align-items: center;
  gap: 4px;
}

.excel-price-amount {
  color: #059669;
  font-size: 14px;
  font-weight: 600;
}

.excel-currency {
  color: #6b7280;
  font-size: 12px;
  font-weight: 500;
}

.excel-amount {
  color: #1f2937;
  font-weight: 600;
  font-size: 16px;
}

.excel-status-chip {
  font-weight: 500;
  font-size: 12px;
}

.excel-actions {
  display: flex;
  gap: 4px;
}

.excel-action-btn {
  width: 28px !important;
  height: 28px !important;
  min-width: 28px !important;
}

.excel-action-btn-text {
  min-width: auto !important;
  width: auto !important;
  height: 32px !important;
  padding: 0 12px !important;
  margin: 2px !important;
}

.excel-actions-cell {
  display: flex;
  gap: 4px;
  flex-wrap: wrap;
  align-items: center;
}

/* Booking Details Dialog Styles */
.booking-details-dialog {
  display: flex;
  flex-direction: column;
  max-height: 90vh;
  background: #ffffff !important;
}

/* Fixed Header */
.booking-details-dialog > .v-card-title,
.booking-details-dialog > .dialog-title {
  position: sticky;
  top: 0;
  z-index: 10;
  background: linear-gradient(135deg, #B71C1C 0%, #D32F2F 100%) !important;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

/* Scrollable Content */
.booking-details-dialog .v-card-text {
  overflow-y: auto;
  flex: 1;
  max-height: calc(90vh - 140px);
  background: #ffffff !important;
  color: #374151 !important;
}

/* Fixed Footer */
.booking-details-dialog > .v-card-actions {
  position: sticky;
  bottom: 0;
  z-index: 10;
  background: white;
  box-shadow: 0 -2px 4px rgba(0,0,0,0.1);
}

.booking-details-dialog .v-card-text * {
  color: inherit;
}

.booking-details-dialog .v-card-text p,
.booking-details-dialog .v-card-text div,
.booking-details-dialog .v-card-text span {
  color: #374151 !important;
}

.dialog-title {
  background: linear-gradient(135deg, #B71C1C 0%, #D32F2F 100%) !important;
  color: #ffffff !important;
}

.dialog-title .v-icon {
  color: #ffffff !important;
}

.detail-section {
  margin-bottom: 24px;
}

.detail-label {
  font-size: 16px;
  font-weight: 600;
  color: #1f2937 !important;
  margin-bottom: 12px;
  padding-bottom: 8px;
  border-bottom: 2px solid #e5e7eb;
}

.detail-content {
  padding-left: 8px;
  color: #374151 !important;
}

.detail-item {
  margin-bottom: 8px;
  font-size: 14px;
  color: #374151 !important;
  display: flex;
  align-items: center;
  padding: 6px 8px;
  border-radius: 6px;
  transition: all 0.3s ease;
}

.detail-item.admin-booking-highlight {
  background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%);
  border-left: 3px solid #3b82f6;
  padding-left: 12px;
}

.detail-item strong {
  color: #1f2937 !important;
  font-weight: 600;
  margin-right: 6px;
}

.time-slots-detail-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 8px;
}

.time-slots-detail-list .v-chip {
  display: inline-flex;
  align-items: center;
}

.detail-notes {
  background: #f9fafb;
  padding: 12px;
  border-radius: 6px;
  border-left: 4px solid #3b82f6;
  margin: 0;
  font-style: italic;
  color: #6b7280;
}

.qr-code-wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 16px;
}

.qr-code-display {
  max-width: 250px;
  height: auto;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  padding: 16px;
  background: white !important;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  margin: 0 auto;
}

.text-caption {
  color: #6b7280 !important;
}

.text-body-2 {
  color: #374151 !important;
}

.price-amount {
  font-size: 18px;
  font-weight: 700;
  color: #059669;
}

/* Edit Dialog Styles */
.price-alert {
  margin-top: 16px;
}

.price-info {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
}

.price-breakdown {
  font-size: 12px;
  color: #6b7280;
  font-weight: normal;
}

/* Payment Tooltip */
.payment-tooltip {
  padding: 8px;
  background: rgba(0, 0, 0, 0.9);
  border-radius: 6px;
  font-size: 13px;
}

.payment-tooltip strong {
  color: #4ade80;
}

/* Current Booking Info Styles */
.current-booking-info {
  background: #f8fafc;
  padding: 16px;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
}

.info-item {
  margin-bottom: 8px;
  font-size: 14px;
  color: #374151;
  display: flex;
  align-items: center;
  flex-wrap: wrap;
}

.info-item strong {
  color: #1f2937;
  min-width: 100px;
  margin-right: 8px;
}

/* Debug Information Styles */
.debug-code {
  background: #f3f4f6;
  border: 1px solid #d1d5db;
  border-radius: 4px;
  padding: 12px;
  font-size: 12px;
  color: #374151;
  overflow-x: auto;
  max-height: 200px;
  overflow-y: auto;
}


/* Responsive Design */
@media (max-width: 768px) {
  /* Main Container */
  .bookings-container {
    padding: 8px !important;
  }

  /* Toolbar */
  .bookings-toolbar {
    padding: 12px;
    margin-bottom: 12px;
    border-radius: 12px;
  }

  .toolbar-section {
    flex-direction: column;
    gap: 8px;
    align-items: stretch;
  }

  .filters-section {
    flex-direction: column;
    gap: 8px;
    width: 100%;
  }

  .filter-field {
    width: 100% !important;
    min-width: unset !important;
  }

  /* Action Buttons */
  .action-buttons {
    flex-direction: column;
    width: 100%;
    gap: 8px;
  }

  .action-buttons .v-btn {
    width: 100%;
  }

  /* Booking Cards */
  .booking-card-compact {
    border-radius: 8px !important;
  }

  .booking-card-compact .pa-3 {
    padding: 12px !important;
  }

  /* Court Name */
  .court-name-compact {
    font-size: 14px !important;
  }

  /* Detail Rows */
  .detail-row-compact {
    font-size: 12px !important;
  }

  .detail-icon-compact {
    width: 28px !important;
    height: 28px !important;
  }

  .detail-icon-compact .v-icon {
    font-size: 14px !important;
  }

  .detail-label-compact {
    font-size: 10px !important;
  }

  .detail-value-compact {
    font-size: 13px !important;
  }

  /* Actions */
  .booking-actions-compact {
    gap: 4px !important;
  }

  .booking-actions-compact .v-btn {
    min-width: 28px !important;
    width: 28px !important;
    height: 28px !important;
  }

  /* Status Banners */
  .status-banner-compact {
    padding: 4px 8px;
    font-size: 9px;
  }

  /* Court Images */
  .booking-court-info-compact {
    gap: 8px;
  }

  /* Excel Container */
  .excel-container {
    padding: 12px;
  }

  .excel-header {
    flex-direction: column;
    gap: 16px;
    align-items: stretch;
  }

  .excel-toolbar {
    flex-direction: column;
    gap: 12px;
    align-items: stretch;
  }

  .excel-search {
    max-width: none;
  }

  .excel-filters {
    justify-content: space-between;
  }

  /* Auth Container */
  .auth-container {
    padding: 24px 16px;
  }

  .auth-icon {
    font-size: 60px !important;
  }

  .auth-title {
    font-size: 1.5rem !important;
  }

  .auth-subtitle {
    font-size: 0.95rem !important;
  }

  /* Booking Details Dialog */
  .booking-details-dialog .v-card {
    margin: 8px;
  }

  .booking-details-dialog .v-card-title {
    font-size: 1.1rem !important;
    padding: 12px !important;
  }

  .booking-details-dialog .v-card-text {
    padding: 12px !important;
  }

  .detail-section {
    margin-bottom: 16px !important;
  }

  .detail-label {
    font-size: 14px !important;
  }

  .detail-item {
    font-size: 13px !important;
    margin-bottom: 8px !important;
  }

  /* Time Slots Detail List */
  .time-slots-detail-list .v-chip {
    font-size: 11px !important;
    padding: 6px 8px !important;
  }

  /* QR Code */
  .qr-code-wrapper canvas {
    width: 200px !important;
    height: 200px !important;
  }

  /* No Bookings */
  .no-bookings {
    padding: 40px 16px !important;
  }

  .no-bookings .v-icon {
    font-size: 60px !important;
  }

  .no-bookings h3 {
    font-size: 1.2rem !important;
  }

  .no-bookings p {
    font-size: 0.9rem !important;
  }
}

/* Very Small Mobile Devices */
@media (max-width: 480px) {
  .bookings-toolbar {
    padding: 8px;
    margin-bottom: 8px;
  }

  .booking-card-compact .pa-3 {
    padding: 8px !important;
  }

  .court-name-compact {
    font-size: 13px !important;
  }

  .detail-value-compact {
    font-size: 12px !important;
  }

  .status-banner-compact {
    font-size: 8px;
    padding: 3px 6px;
  }

  .booking-actions-compact .v-btn {
    min-width: 24px !important;
    width: 24px !important;
    height: 24px !important;
  }

  .booking-actions-compact .v-icon {
    font-size: 14px !important;
  }
}

/* Edit Dialog Styles - Time Slots */
.time-slots-container {
  max-height: 400px;
  overflow-y: auto;
  padding: 8px;
  background: #f8fafc;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
}

.time-slots-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 12px;
}

.time-slot-chip {
  cursor: pointer;
  transition: all 0.3s ease;
  height: auto !important;
  padding: 12px 16px !important;
  border-radius: 10px !important;
  font-weight: 500;
}

.time-slot-chip:not([disabled]):hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15) !important;
}

.time-slot-chip[disabled] {
  opacity: 0.5;
  cursor: not-allowed;
}

.time-slot-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  width: 100%;
}

.time-text {
  font-size: 14px;
  font-weight: 600;
  white-space: nowrap;
}

.price-text {
  font-size: 13px;
  font-weight: 500;
  opacity: 0.85;
}

/* Scrollbar styling */
.time-slots-container::-webkit-scrollbar {
  width: 8px;
}

.time-slots-container::-webkit-scrollbar-track {
  background: #f1f5f9;
  border-radius: 10px;
}

.time-slots-container::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 10px;
}

.time-slots-container::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}

/* Responsive Dialogs */
@media (max-width: 1280px) {
  .v-dialog.responsive-dialog {
    margin: 0 !important;
  }

  .booking-details-dialog,
  .v-dialog.responsive-dialog .v-card {
    max-height: 100vh;
    height: 100vh;
  }
}

@media (max-width: 960px) {
  .booking-details-dialog .v-card-title,
  .v-dialog .v-card-title {
    font-size: 1.1rem !important;
    padding: 16px !important;
  }

  .booking-details-dialog .v-card-text,
  .v-dialog .v-card-text {
    padding: 16px !important;
  }

  .booking-details-dialog .v-card-actions,
  .v-dialog .v-card-actions {
    padding: 16px !important;
    flex-direction: column;
    gap: 8px;
  }

  .booking-details-dialog .v-card-actions .v-btn,
  .v-dialog .v-card-actions .v-btn {
    width: 100% !important;
  }
}

/* Responsive */
@media (max-width: 768px) {
  .time-slots-grid {
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
    gap: 8px;
  }

  .time-slot-chip {
    padding: 10px 12px !important;
  }

  .time-text {
    font-size: 12px;
  }

  .price-text {
    font-size: 11px;
  }

  .booking-details-dialog .v-card-title,
  .v-dialog .v-card-title {
    font-size: 1rem !important;
    padding: 12px !important;
  }

  .booking-details-dialog .v-card-title .v-icon,
  .v-dialog .v-card-title .v-icon {
    font-size: 20px !important;
  }

  .booking-details-dialog .v-card-text,
  .v-dialog .v-card-text {
    padding: 12px !important;
  }

  .time-slots-detail-list .v-chip {
    font-size: 0.75rem !important;
    margin: 2px !important;
  }

  .qr-canvas {
    max-width: 200px !important;
  }
}

@media (max-width: 600px) {
  .booking-details-dialog .v-card-title .v-icon:first-child,
  .v-dialog .v-card-title .v-icon:first-child {
    display: none;
  }

  .time-slots-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 4px;
  }

  .time-slot-chip {
    padding: 8px 10px !important;
  }

  .time-text {
    font-size: 10px;
  }

  .price-text {
    font-size: 9px;
  }
}

@media (max-width: 400px) {
  .booking-details-dialog,
  .v-dialog .v-card {
    border-radius: 0 !important;
  }

  .time-slots-grid {
    grid-template-columns: 1fr;
  }
}

/* SweetAlert z-index fix for dialogs */
:deep(.swal2-container) {
  z-index: 99999 !important;
}

:deep(.swal2-popup) {
  z-index: 99999 !important;
}

:deep(.swal2-container-high-z) {
  z-index: 99999 !important;
}

:deep(.swal2-backdrop-show) {
  z-index: 99998 !important;
}

/* Proof of Payment Preview Styles */
.proof-preview-container {
  position: relative;
  display: inline-block;
}

.proof-preview-container.proof-preview-clickable {
  cursor: pointer;
  transition: transform 0.2s;
}

.proof-preview-container.proof-preview-clickable:hover {
  transform: scale(1.05);
}
</style>
<template>
  <div class="admin-dashboard">
    <!-- Modern Sports Background -->
    <div class="sports-background">
      <div class="sports-overlay"></div>
      <div class="sports-pattern"></div>
    </div>
    
    <!-- Enhanced Header -->
    <div class="dashboard-header">
      <div class="header-content">
        <div class="header-badge">
          <v-icon color="white" size="20" class="mr-2">mdi-shield-crown</v-icon>
          Admin Control Center
        </div>
        <h1 class="header-title">
          <span class="title-gradient">Champion</span> Dashboard
        </h1>
        <p class="header-subtitle">
          Manage multi-sport court bookings and oversee the entire system with professional precision
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
              <div class="stat-number">{{ stats.pending_bookings || 0 }}</div>
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
              <div class="stat-number">{{ stats.approved_bookings || 0 }}</div>
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
              <div class="stat-number">{{ stats.rejected_bookings || 0 }}</div>
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
      <div class="section-header">
        <div class="section-badge">
          <v-icon color="primary" size="20" class="mr-2">mdi-lightning-bolt</v-icon>
          Quick Actions
        </div>
        <h2 class="section-title">
          <span class="title-gradient">Champion</span> Controls
        </h2>
        <p class="section-subtitle">
          Manage bookings and system operations with professional efficiency
        </p>
      </div>
      
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
            <v-icon color="success" size="48">mdi-check-all</v-icon>
          </div>
          <div class="action-content">
            <h3 class="action-title">Approve All</h3>
            <p class="action-description">Approve all bookings with complete payment</p>
            <v-btn
              class="action-btn"
              color="success"
              size="large"
              @click="approveAllPending"
              :disabled="!pendingBookings.length || pendingBookings.every(booking => getBookingPaymentStatus(booking) !== 'complete')"
              prepend-icon="mdi-check-all"
              elevation="4"
            >
              Approve All
            </v-btn>
          </div>
          <div class="action-glow"></div>
        </div>
        
        <div class="action-card action-card-3">
          <div class="action-icon">
            <v-icon color="info" size="48">mdi-chart-line</v-icon>
          </div>
          <div class="action-content">
            <h3 class="action-title">Refresh Stats</h3>
            <p class="action-description">Update dashboard statistics and metrics</p>
            <v-btn
              class="action-btn"
              color="info"
              size="large"
              @click="loadStats"
              prepend-icon="mdi-chart-line"
              elevation="4"
            >
              Refresh Data
            </v-btn>
          </div>
          <div class="action-glow"></div>
        </div>
        
        <div class="action-card action-card-4">
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

    <!-- Pending Bookings Table -->
    <v-row>
      <v-col cols="12">
        <v-card>
          <v-card-title class="text-h5 pa-6 pb-4">
            <v-icon class="mr-2" color="warning">mdi-clock-alert</v-icon>
            Pending Transactions
            <v-spacer></v-spacer>
            <v-btn
              color="primary"
              variant="outlined"
              prepend-icon="mdi-refresh"
              @click="loadPendingBookings"
              :loading="loading"
            >
              Refresh
            </v-btn>
          </v-card-title>
          <v-divider></v-divider>
          
          <v-data-table
            :headers="headers"
            :items="pendingBookings"
            :loading="loading"
            class="elevation-0"
            no-data-text="No pending transactions found"
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

            <template v-slot:[`item.court_name`]="{ item }">
              <div class="d-flex align-center">
                <CourtImageGallery 
                  :images="item.cart_items?.[0]?.court?.images || []"
                  :court-name="item.court_name"
                  size="small"
                  @image-error="handleImageError"
                />
                <div class="ml-3">
                  <div class="font-weight-medium">{{ item.court_name }}</div>
                  <div class="text-caption text-grey">
                    {{ item.cart_items?.[0]?.court?.sport?.name || 'Multiple Sports' }}
                  </div>
                </div>
              </div>
            </template>

            <template v-slot:[`item.items_count`]="{ item }">
              <v-chip color="info" size="small">
                {{ item.items_count }} slot{{ item.items_count > 1 ? 's' : '' }}
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
    <v-dialog v-model="detailsDialog" max-width="800">
      <v-card>
        <v-card-title class="text-h5 pa-6 pb-4">
          <v-icon class="mr-2" color="primary">mdi-calendar-detail</v-icon>
          Booking Details
        </v-card-title>
        
        <v-divider></v-divider>
        
        <v-card-text class="pa-6" v-if="selectedBooking">
          <!-- User Information -->
          <v-row class="mb-4">
            <v-col cols="12">
              <h4 class="text-h6 mb-3">
                <v-icon class="mr-2" color="info">mdi-account</v-icon>
                User Information
              </h4>
              <v-card variant="outlined" class="pa-4">
                <v-row>
                  <v-col cols="12" md="6">
                    <div class="text-body-2 mb-2">
                      <strong>Name:</strong> {{ selectedBooking.user?.name || 'N/A' }}
                    </div>
                    <div class="text-body-2 mb-2">
                      <strong>Email:</strong> {{ selectedBooking.user?.email || 'N/A' }}
                    </div>
                  </v-col>
                  <v-col cols="12" md="6">
                    <div class="text-body-2 mb-2">
                      <strong>User ID:</strong> #{{ selectedBooking.user?.id || 'N/A' }}
                    </div>
                    <div class="text-body-2 mb-2">
                      <strong>Booking ID:</strong> #{{ selectedBooking.id }}
                    </div>
                  </v-col>
                </v-row>
              </v-card>
            </v-col>
          </v-row>

          <!-- Court Information -->
          <v-row class="mb-4">
            <v-col cols="12">
              <h4 class="text-h6 mb-3">
                <v-icon class="mr-2" color="success">mdi-stadium</v-icon>
                Court Information
              </h4>
              <v-card variant="outlined" class="pa-4">
                <v-row>
                  <v-col cols="12" md="6">
                    <div class="text-body-2 mb-2">
                      <strong>Court:</strong> {{ selectedBooking.court?.name || 'N/A' }}
                    </div>
                    <div class="text-body-2 mb-2">
                      <strong>Sport:</strong> {{ selectedBooking.court?.sport?.name || 'N/A' }}
                    </div>
                    <div class="text-body-2 mb-2">
                      <strong>Location:</strong> {{ selectedBooking.court?.location || 'N/A' }}
                    </div>
                  </v-col>
                  <v-col cols="12" md="6">
                    <div class="text-body-2 mb-2">
                      <strong>Price per Hour:</strong> ₱{{ selectedBooking.court?.price_per_hour || 'N/A' }}
                    </div>
                    <div class="text-body-2 mb-2" v-if="selectedBooking.court?.amenities && selectedBooking.court.amenities.length">
                      <strong>Amenities:</strong>
                      <div class="mt-1">
                        <v-chip
                          v-for="amenity in selectedBooking.court.amenities"
                          :key="amenity"
                          size="x-small"
                          color="primary"
                          variant="outlined"
                          class="mr-1 mb-1"
                        >
                          {{ amenity }}
                        </v-chip>
                      </div>
                    </div>
                  </v-col>
                </v-row>
              </v-card>
            </v-col>
          </v-row>

          <!-- Court Images Gallery -->
          <v-row v-if="selectedBooking.court?.images && selectedBooking.court.images.length > 0" class="mb-4">
            <v-col cols="12">
              <h4 class="text-h6 mb-3">
                <v-icon class="mr-2" color="primary">mdi-image-multiple</v-icon>
                Court Images
              </h4>
              <v-card variant="outlined" class="pa-4">
                <CourtImageGallery 
                  :images="selectedBooking.court.images"
                  :court-name="selectedBooking.court.name"
                  size="large"
                  @image-error="handleImageError"
                />
              </v-card>
            </v-col>
          </v-row>

          <!-- Transaction Details (for cart transactions) -->
          <v-row v-if="selectedBooking.isTransaction" class="mb-4">
            <v-col cols="12">
              <h4 class="text-h6 mb-3">
                <v-icon class="mr-2" color="warning">mdi-receipt-text</v-icon>
                Transaction Details
              </h4>
              <v-card variant="outlined" class="pa-4">
                <v-row>
                  <v-col cols="12" md="6">
                    <div class="text-body-2 mb-2">
                      <strong>Transaction ID:</strong> #{{ selectedBooking.id }}
                    </div>
                    <div class="text-body-2 mb-2">
                      <strong>Created:</strong> {{ formatDate(selectedBooking.created_at) }} at {{ formatTime(selectedBooking.created_at) }}
                    </div>
                    <div class="text-body-2 mb-2">
                      <strong>Items Count:</strong> {{ selectedBooking.items_count }} slot{{ selectedBooking.items_count > 1 ? 's' : '' }}
                    </div>
                  </v-col>
                  <v-col cols="12" md="6">
                    <div class="text-body-2 mb-2">
                      <strong>Approval Status:</strong>
                      <v-chip 
                        :color="selectedBooking.approval_status === 'approved' ? 'success' : selectedBooking.approval_status === 'rejected' ? 'error' : 'warning'"
                        variant="tonal"
                        size="small"
                        class="ml-2"
                      >
                        {{ selectedBooking.approval_status ? selectedBooking.approval_status.charAt(0).toUpperCase() + selectedBooking.approval_status.slice(1) : 'Pending' }}
                      </v-chip>
                    </div>
                    <div class="text-body-2 mb-2">
                      <strong>Total Price:</strong> 
                      <span class="text-h6 text-success">{{ formatPrice(selectedBooking.total_price ?? 0) }}</span>
                    </div>
                  </v-col>
                </v-row>
              </v-card>
            </v-col>
          </v-row>

          <!-- Cart Items in Transaction -->
          <v-row v-if="selectedBooking.isTransaction && selectedBooking.cart_items" class="mb-4">
            <v-col cols="12">
              <h4 class="text-h6 mb-3">
                <v-icon class="mr-2" color="info">mdi-cart</v-icon>
                Cart Items ({{ selectedBooking.cart_items.length }})
              </h4>
              <v-card variant="outlined" class="pa-4">
                <v-list>
                  <v-list-item
                    v-for="item in selectedBooking.cart_items"
                    :key="item.id"
                    class="mb-2"
                  >
                    <template v-slot:prepend>
                      <v-avatar :color="getSportColor(item.court?.sport?.name)" size="40">
                        <v-icon color="white">{{ getSportIcon(item.court?.sport?.name) }}</v-icon>
                      </v-avatar>
                    </template>
                    <v-list-item-title class="font-weight-bold">
                      {{ item.court?.name || 'Unknown Court' }}
                    </v-list-item-title>
                    <v-list-item-subtitle>
                      {{ item.court?.sport?.name || 'Unknown Sport' }} • 
                      {{ formatDate(item.booking_date) }} • 
                      {{ item.start_time }} - {{ item.end_time }} • 
                      <strong class="text-success">₱{{ parseFloat(item.price).toFixed(2) }}</strong>
                    </v-list-item-subtitle>
                  </v-list-item>
                </v-list>
              </v-card>
            </v-col>
          </v-row>

          <!-- Booking Details (for regular bookings) -->
          <v-row v-if="!selectedBooking.isTransaction" class="mb-4">
            <v-col cols="12">
              <h4 class="text-h6 mb-3">
                <v-icon class="mr-2" color="warning">mdi-calendar-clock</v-icon>
                Booking Details
              </h4>
              <v-card variant="outlined" class="pa-4">
                <v-row>
                  <v-col cols="12" md="6">
                    <div class="text-body-2 mb-2">
                      <strong>Date:</strong> {{ formatDate(selectedBooking.start_time) }}
                    </div>
                    <div class="text-body-2 mb-2">
                      <strong>Start Time:</strong> {{ formatTime(selectedBooking.start_time) }}
                    </div>
                    <div class="text-body-2 mb-2">
                      <strong>End Time:</strong> {{ formatTime(selectedBooking.end_time) }}
                    </div>
                    <div class="text-body-2 mb-2">
                      <strong>Duration:</strong> {{ getDuration(selectedBooking.start_time, selectedBooking.end_time) }} hours
                    </div>
                  </v-col>
                  <v-col cols="12" md="6">
                    <div class="text-body-2 mb-2">
                      <strong>Status:</strong>
                      <v-chip 
                        :color="getStatusColor(selectedBooking.status)"
                        variant="tonal"
                        size="small"
                        class="ml-2"
                      >
                        {{ selectedBooking.status ? selectedBooking.status.charAt(0).toUpperCase() + selectedBooking.status.slice(1) : 'Unknown' }}
                      </v-chip>
                    </div>
                    <div class="text-body-2 mb-2">
                      <strong>Total Price:</strong> 
                      <span class="text-h6 text-success">{{ formatPrice(selectedBooking.total_price ?? 0) }}</span>
                    </div>
                    <div class="text-body-2 mb-2" v-if="selectedBooking.notes">
                      <strong>Notes:</strong> {{ selectedBooking.notes }}
                    </div>
                  </v-col>
                </v-row>
              </v-card>
            </v-col>
          </v-row>

          <!-- Frequency Booking Details -->
          <v-row v-if="selectedBooking.frequency_type && selectedBooking.frequency_type !== 'once'" class="mb-4">
            <v-col cols="12">
              <h4 class="text-h6 mb-3">
                <v-icon class="mr-2" color="primary">mdi-repeat</v-icon>
                Frequency Booking Details
              </h4>
              <v-card variant="outlined" class="pa-4">
                <v-row>
                  <v-col cols="12" md="6">
                    <div class="text-body-2 mb-2">
                      <strong>Frequency Type:</strong>
                      <v-chip 
                        :color="getFrequencyColor(selectedBooking.frequency_type)"
                        variant="tonal"
                        size="small"
                        class="ml-2"
                      >
                        {{ formatFrequencyType(selectedBooking.frequency_type) }}
                      </v-chip>
                    </div>
                    <div class="text-body-2 mb-2">
                      <strong>Duration:</strong> {{ selectedBooking.frequency_duration_months || 1 }} month{{ (selectedBooking.frequency_duration_months || 1) > 1 ? 's' : '' }}
                    </div>
                  </v-col>
                  <v-col cols="12" md="6" v-if="selectedBooking.frequency_days && selectedBooking.frequency_days.length > 0">
                    <div class="text-body-2 mb-2">
                      <strong>Selected Days:</strong>
                      <div class="mt-1">
                        <v-chip
                          v-for="day in selectedBooking.frequency_days"
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
              </v-card>
            </v-col>
          </v-row>

          <!-- Payment Information -->
          <v-row class="mb-4">
            <v-col cols="12">
              <h4 class="text-h6 mb-3">
                <v-icon class="mr-2" color="success">mdi-credit-card</v-icon>
                Payment Information
              </h4>
              <v-card variant="outlined" class="pa-4">
                <v-row>
                  <v-col cols="12" md="6">
                    <div class="text-body-2 mb-2">
                      <strong>Payment Method:</strong>
                      <v-chip 
                        :color="selectedBooking.payment_method ? 'success' : 'error'"
                        variant="tonal"
                        size="small"
                        class="ml-2"
                      >
                        {{ selectedBooking.payment_method ? selectedBooking.payment_method.toUpperCase() : 'Not Set' }}
                      </v-chip>
                    </div>
                    <div class="text-body-2 mb-2">
                      <strong>Payment Status:</strong>
                      <v-chip 
                        :color="getPaymentStatusColor(selectedBooking)"
                        variant="tonal"
                        size="small"
                        class="ml-2"
                      >
                        {{ getPaymentStatusText(selectedBooking) }}
                      </v-chip>
                    </div>
                  </v-col>
                  <v-col cols="12" md="6">
                    <div class="text-body-2 mb-2" v-if="selectedBooking.proof_of_payment">
                      <strong>Proof of Payment:</strong>
                      <div class="mt-2">
                        <v-btn
                          color="primary"
                          variant="outlined"
                          size="small"
                          prepend-icon="mdi-eye"
                          @click="viewProofOfPayment(selectedBooking.proof_of_payment)"
                        >
                          View Attachment
                        </v-btn>
                      </div>
                    </div>
                    <div class="text-body-2 mb-2" v-else>
                      <strong>Proof of Payment:</strong>
                      <v-chip color="error" variant="tonal" size="small" class="ml-2">
                        Not Uploaded
                      </v-chip>
                    </div>
                  </v-col>
                </v-row>
              </v-card>
            </v-col>
          </v-row>
        </v-card-text>
        
        <v-divider></v-divider>
        
        <v-card-actions class="pa-6">
          <v-spacer></v-spacer>
          <v-btn
            color="grey"
            variant="outlined"
            @click="detailsDialog = false"
          >
            Close
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

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

    <!-- Image Preview Dialog -->
    <v-dialog v-model="imageDialog" max-width="800">
      <v-card>
        <v-card-title class="text-h5 pa-6 pb-4">
          <v-icon class="mr-2" color="primary">mdi-image</v-icon>
          Proof of Payment
        </v-card-title>
        
        <v-divider></v-divider>
        
        <v-card-text class="pa-6">
          <div class="text-center">
            <img 
              :src="selectedImageUrl" 
              alt="Proof of Payment"
              class="full-size-image"
              style="max-width: 100%; height: auto; border-radius: 8px; box-shadow: 0 4px 8px rgba(0,0,0,0.1);"
            />
          </div>
        </v-card-text>
        
        <v-divider></v-divider>
        
        <v-card-actions class="pa-6">
          <v-spacer></v-spacer>
          <v-btn
            color="primary"
            variant="outlined"
            @click="downloadImage"
          >
            <v-icon class="mr-2">mdi-download</v-icon>
            Download
          </v-btn>
          <v-btn
            color="grey"
            variant="outlined"
            @click="imageDialog = false"
          >
            Close
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
import { ref, onMounted, onUnmounted } from 'vue'
import { bookingService } from '../services/bookingService'
import { cartService } from '../services/cartService'
import { formatPrice } from '../utils/formatters'
import QrCodeScanner from '../components/QrCodeScanner.vue'
import CourtImageGallery from '../components/CourtImageGallery.vue'
export default {
  name: 'AdminDashboard',
  components: {
    QrCodeScanner,
    CourtImageGallery
  },
  setup() {
    const stats = ref({})
    const pendingBookings = ref([])
    const loading = ref(false)
    const rejecting = ref(false)
    const rejectDialog = ref(false)
    const rejectReason = ref('')
    const selectedBookingId = ref(null)
    const detailsDialog = ref(false)
    const selectedBooking = ref(null)
    
    // Image dialog
    const imageDialog = ref(false)
    const selectedImageUrl = ref('')
    
    const snackbar = ref({
      show: false,
      message: '',
      color: 'success'
    })
    const qrScannerDialog = ref(false)

    const headers = [
      { title: 'Transaction ID', key: 'id', sortable: true },
      { title: 'User', key: 'user_name', sortable: false },
      { title: 'Courts', key: 'court_name', sortable: false },
      { title: 'Items', key: 'items_count', sortable: false },
      { title: 'Created At', key: 'created_at', sortable: true },
      { title: 'Total Price', key: 'total_price', sortable: true },
      { title: 'Payment Status', key: 'payment_status', sortable: false },
      { title: 'Notes', key: 'notes', sortable: false },
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

    const loadPendingBookings = async () => {
      try {
        loading.value = true
        // Fetch pending cart transactions instead of bookings
        const transactions = await cartService.getPendingTransactions()
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
        console.error('Failed to load pending transactions:', error)
        showSnackbar('Failed to load pending transactions', 'error')
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

    const approveAllPending = async () => {
      try {
        loading.value = true
        
        // Filter bookings that have complete payment (both payment method and proof of payment)
        const bookingsWithCompletePayment = pendingBookings.value.filter(booking => 
          getBookingPaymentStatus(booking) === 'complete'
        )
        
        if (bookingsWithCompletePayment.length === 0) {
          showSnackbar('No bookings with complete payment found to approve', 'warning')
          return
        }
        
        // Approve only bookings with complete payment
        const promises = bookingsWithCompletePayment.map(booking => 
          bookingService.approveBooking(booking.id)
        )
        await Promise.all(promises)
        
        const totalPending = pendingBookings.value.length
        const approvedCount = bookingsWithCompletePayment.length
        const skippedCount = totalPending - approvedCount
        
        let message = `Successfully approved ${approvedCount} booking${approvedCount !== 1 ? 's' : ''}`
        if (skippedCount > 0) {
          message += `. Skipped ${skippedCount} booking${skippedCount !== 1 ? 's' : ''} without complete payment`
        }
        
        showSnackbar(message, 'success')
        
        // Dispatch event to refresh other components
        window.dispatchEvent(new CustomEvent('booking-updated'))
        
        await loadPendingBookings()
        await loadStats()
      } catch (error) {
        console.error('Failed to approve bookings:', error)
        showSnackbar('Failed to approve bookings', 'error')
      } finally {
        loading.value = false
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

    const viewProofOfPayment = (proofUrl) => {
      if (proofUrl) {
        // Open proof of payment in dialog
        selectedImageUrl.value = `https://bschedule.m4d8q2.com/storage/${proofUrl}`
        imageDialog.value = true
      }
    }

    const downloadImage = () => {
      if (selectedImageUrl.value) {
        const link = document.createElement('a')
        link.href = selectedImageUrl.value
        link.download = `proof_of_payment_${selectedBooking.value?.id || 'booking'}.jpg`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
      }
    }

    const getDuration = (startTime, endTime) => {
      const start = new Date(startTime)
      const end = new Date(endTime)
      const diffInHours = (end - start) / (1000 * 60 * 60)
      return Math.round(diffInHours)
    }

    const getStatusColor = (status) => {
      const colors = {
        pending: 'warning',
        approved: 'success',
        rejected: 'error',
        cancelled: 'error',
        completed: 'info'
      }
      return colors[status] || 'grey'
    }

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

    const getFrequencyColor = (type) => {
      const colors = {
        once: 'grey',
        daily: 'green',
        weekly: 'blue',
        monthly: 'orange',
        yearly: 'red'
      }
      return colors[type] || 'grey'
    }

    const getDayName = (dayNumber) => {
      const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
      return days[dayNumber] || 'Unknown'
    }

    const showSnackbar = (message, color = 'success') => {
      snackbar.value = {
        show: true,
        message,
        color
      }
    }

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

    // Sport helper functions
    const getSportColor = (sportName) => {
      const colors = {
        'Basketball': 'orange',
        'Badminton': 'blue',
        'Tennis': 'green',
        'Volleyball': 'purple',
        'Table Tennis': 'red',
        'Futsal': 'teal'
      }
      return colors[sportName] || 'grey'
    }

    const getSportIcon = (sportName) => {
      const icons = {
        'Basketball': 'mdi-basketball',
        'Badminton': 'mdi-badminton',
        'Tennis': 'mdi-tennis',
        'Volleyball': 'mdi-volleyball',
        'Table Tennis': 'mdi-table-tennis',
        'Futsal': 'mdi-soccer'
      }
      return icons[sportName] || 'mdi-trophy'
    }

    // Listen for booking refresh events
    const handleBookingRefresh = () => {
      loadStats()
      loadPendingBookings()
    }

    onMounted(() => {
      loadStats()
      loadPendingBookings()
      
      // Listen for custom events to refresh admin data
      window.addEventListener('booking-created', handleBookingRefresh)
      window.addEventListener('booking-updated', handleBookingRefresh)
      window.addEventListener('booking-cancelled', handleBookingRefresh)
    })

    onUnmounted(() => {
      // Clean up event listeners
      window.removeEventListener('booking-created', handleBookingRefresh)
      window.removeEventListener('booking-updated', handleBookingRefresh)
      window.removeEventListener('booking-cancelled', handleBookingRefresh)
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
      headers,
      loadStats,
      loadPendingBookings,
      approveBooking,
      showRejectDialog,
      confirmReject,
      approveAllPending,
      exportBookings,
      formatDate,
      formatTime,
      // Payment status functions
      getBookingPaymentStatus,
      getPaymentStatusColor,
      getPaymentStatusText,
      getPaymentStatusIcon,
      // Sport helper functions
      getSportColor,
      getSportIcon,
      // Booking details functions
      viewBookingDetails,
      viewProofOfPayment,
      getDuration,
      getStatusColor,
      formatFrequencyType,
      getFrequencyColor,
      getDayName,
      // Image dialog
      imageDialog,
      selectedImageUrl,
      downloadImage,
      formatPrice
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
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 50px;
  padding: 8px 20px;
  margin-bottom: 24px;
  color: white;
  font-weight: 600;
  font-size: 14px;
  letter-spacing: 0.5px;
}

.header-title {
  font-size: clamp(2.5rem, 5vw, 4rem);
  font-weight: 800;
  line-height: 1.1;
  margin-bottom: 24px;
  color: white;
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
  color: #1e293b;
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

/* Court Image Styles */
.court-image-admin {
  width: 40px;
  height: 40px;
  border-radius: 8px;
  object-fit: cover;
  border: 2px solid #e5e7eb;
  margin-right: 12px;
}
</style>

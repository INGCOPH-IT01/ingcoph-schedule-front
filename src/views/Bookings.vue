<template>
  <div class="bookings-container">
    <!-- Modern Sports Background -->
    <div class="sports-background">
      <div class="sports-overlay"></div>
      <div class="sports-pattern"></div>
    </div>
    
    <!-- Enhanced Header -->
    <div class="bookings-header">
      <div class="header-content">
        <div class="header-badge">
          <v-icon color="white" size="20" class="mr-2">mdi-calendar-check</v-icon>
          Booking Management
        </div>
        <h1 class="header-title">
          <span class="title-gradient">My</span> Bookings
        </h1>
        <p class="header-subtitle">
          Manage your court reservations and recurring schedules with professional precision
        </p>
        <div class="header-actions">
          <v-btn
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
          <!-- Enhanced Toolbar -->
          <div class="bookings-toolbar">
            <div class="toolbar-section">
              <div class="search-section">
                <v-text-field
                  v-model="searchQuery"
                  placeholder="Search bookings..."
                  prepend-inner-icon="mdi-magnify"
                  variant="outlined"
                  density="compact"
                  hide-details
                  class="search-field"
                ></v-text-field>
              </div>
              <div class="filters-section">
                <v-text-field
                  v-model="dateFilter"
                  type="date"
                  placeholder="Filter by date"
                  variant="outlined"
                  density="compact"
                  hide-details
                  class="filter-field"
                  prepend-inner-icon="mdi-calendar"
                  clearable
                ></v-text-field>
                <v-select
                  v-model="statusFilter"
                  :items="statusOptions"
                  item-title="title"
                  item-value="value"
                  placeholder="All Status"
                  variant="outlined"
                  density="compact"
                  hide-details
                  class="filter-field"
                ></v-select>
                <v-btn
                  class="filter-btn"
                  variant="outlined"
                  size="small"
                  prepend-icon="mdi-filter"
                  @click="clearFilters"
                >
                  Clear Filters
                </v-btn>
              <v-btn
                color="primary"
                variant="outlined"
                size="small"
                prepend-icon="mdi-refresh"
                @click="fetchBookings"
                :loading="loading"
                class="ml-2"
              >
                Refresh
              </v-btn>
              <v-btn
                color="grey"
                variant="outlined"
                size="small"
                prepend-icon="mdi-download"
                class="excel-export-btn"
              >
                Export
              </v-btn>
            </div>
          </div>

          <!-- Excel-like Data Table -->
          <div class="excel-table-container">
            <v-data-table
              :headers="headers"
              :items="filteredBookings"
              :loading="loading"
              :items-per-page="15"
              class="excel-data-table"
              no-data-text="No bookings found"
              loading-text="Loading bookings..."
              :item-props="itemProps"
            >
              <template v-slot:item="{ item }">
                <tr class="excel-table-row">
                  <td class="excel-cell">
                    <div class="excel-cell-content">
                      <div class="excel-cell-icon">🏟️</div>
                      <div class="excel-cell-text">
                        <div class="excel-cell-title">{{ item.court?.name || 'Unknown Court' }}</div>
                        <div class="excel-cell-subtitle">{{ item.court?.sport?.name || 'Unknown Sport' }}</div>
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
                <v-chip
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
                :color="getStatusColor(item.status)"
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
                  v-if="item.status === 'pending'"
                  icon="mdi-pencil"
                  size="small"
                  variant="text"
                  color="warning"
                  @click="editBooking(item)"
                  class="excel-action-btn"
                ></v-btn>
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
              </div>
            </td>
          </tr>
              </template>
            </v-data-table>
          </div>
    </div>

    <!-- Booking Details Dialog -->
    <v-dialog v-model="viewDialog" max-width="600px">
      <v-card>
        <v-card-title class="text-h5">
          <v-icon class="mr-2">mdi-calendar-detail</v-icon>
          Booking Details
        </v-card-title>
        
        <v-card-text v-if="selectedBooking">
          <v-row>
            <v-col cols="12" md="6">
              <div class="detail-section">
                <h4 class="detail-label">Court Information</h4>
                <div class="detail-content">
                  <div class="detail-item">
                    <strong>Court:</strong> {{ selectedBooking.court?.name || 'Unknown' }}
                  </div>
                  <div class="detail-item">
                    <strong>Sport:</strong> {{ selectedBooking.court?.sport?.name || 'Unknown' }}
                  </div>
                </div>
              </div>
            </v-col>
            
            <v-col cols="12" md="6">
              <div class="detail-section">
                <h4 class="detail-label">Booking Information</h4>
                <div class="detail-content">
                  <div class="detail-item">
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
                  <div class="detail-item">
                    <strong>Booking ID:</strong> #{{ selectedBooking.id }}
                  </div>
                </div>
              </div>
            </v-col>
          </v-row>
          
          <v-row>
            <v-col cols="12" md="6">
              <div class="detail-section">
                <h4 class="detail-label">Date & Time</h4>
                <div class="detail-content">
                  <div class="detail-item">
                    <strong>Date:</strong> {{ formatDate(selectedBooking.start_time) }}
                  </div>
                  <div class="detail-item">
                    <strong>Time:</strong> {{ formatTime(selectedBooking.start_time) }} - {{ formatTime(selectedBooking.end_time) }}
                  </div>
                  <div class="detail-item">
                    <strong>Duration:</strong> {{ getDuration(selectedBooking.start_time, selectedBooking.end_time) }} hours
                  </div>
                </div>
              </div>
            </v-col>
            
            <v-col cols="12" md="6">
              <div class="detail-section">
                <h4 class="detail-label">Status</h4>
                <div class="detail-content">
                  <div class="detail-item">
                    <v-chip
                      :color="getStatusColor(selectedBooking.status)"
                      variant="tonal"
                      size="small"
                    >
                      {{ selectedBooking.status }}
                    </v-chip>
                  </div>
                </div>
              </div>
            </v-col>
          </v-row>
          
          <v-row v-if="selectedBooking.notes">
            <v-col cols="12">
              <div class="detail-section">
                <h4 class="detail-label">Notes</h4>
                <div class="detail-content">
                  <p class="detail-notes">{{ selectedBooking.notes }}</p>
                </div>
              </div>
            </v-col>
          </v-row>

          <!-- Recurring Schedule Details -->
          <v-row v-if="selectedBooking.status === 'recurring_schedule' && selectedBooking.recurring_schedule_data">
            <v-col cols="12">
              <div class="detail-section">
                <h4 class="detail-label">
                  <v-icon class="mr-2" color="primary">mdi-calendar-repeat</v-icon>
                  Recurring Schedule Details
                </h4>
                <div class="detail-content">
                  <v-card variant="outlined" class="pa-4">
                    <v-row>
                      <v-col cols="12" md="6">
                        <div class="mb-3">
                          <strong>Schedule Name:</strong>
                          <div class="text-h6 text-primary">{{ selectedBooking.recurring_schedule }}</div>
                        </div>
                        <div class="mb-3">
                          <strong>Recurrence Type:</strong>
                          <v-chip 
                            :color="getRecurrenceTypeColor(selectedBooking.recurring_schedule_data.recurrence_type)"
                            variant="tonal"
                            size="small"
                            class="ml-2"
                          >
                            {{ formatRecurrenceType(selectedBooking.recurring_schedule_data.recurrence_type) }}
                          </v-chip>
                        </div>
                        <div class="mb-3">
                          <strong>Interval:</strong> Every {{ selectedBooking.recurring_schedule_data.recurrence_interval || 1 }} 
                          {{ getIntervalSuffix(selectedBooking.recurring_schedule_data.recurrence_type) }}
                        </div>
                        <div class="mb-3">
                          <strong>Auto Approve:</strong>
                          <v-chip 
                            :color="selectedBooking.recurring_schedule_data.auto_approve ? 'success' : 'warning'"
                            variant="tonal"
                            size="small"
                            class="ml-2"
                          >
                            {{ selectedBooking.recurring_schedule_data.auto_approve ? 'Yes' : 'No' }}
                          </v-chip>
                        </div>
                      </v-col>
                      <v-col cols="12" md="6">
                        <div class="mb-3">
                          <strong>Start Date:</strong> {{ formatDate(selectedBooking.recurring_schedule_data.start_date) }}
                        </div>
                        <div class="mb-3">
                          <strong>End Date:</strong> {{ formatDate(selectedBooking.recurring_schedule_data.end_date) || 'No end date' }}
                        </div>
                        <div class="mb-3" v-if="selectedBooking.recurring_schedule_data.max_occurrences">
                          <strong>Max Occurrences:</strong> {{ selectedBooking.recurring_schedule_data.max_occurrences }}
                        </div>
                        <div class="mb-3" v-if="selectedBooking.recurring_schedule_data.description">
                          <strong>Description:</strong> {{ selectedBooking.recurring_schedule_data.description }}
                        </div>
                      </v-col>
                    </v-row>

                    <!-- Day-Specific Times -->
                    <v-row v-if="hasDaySpecificTimes(selectedBooking.recurring_schedule_data)">
                      <v-col cols="12">
                        <v-divider class="my-4"></v-divider>
                        <h5 class="text-h6 mb-3">
                          <v-icon class="mr-2" color="primary">mdi-clock-outline</v-icon>
                          Schedule Times for Each Day
                        </h5>
                        <v-list density="compact">
                          <v-list-item
                            v-for="(dayTime, index) in selectedBooking.recurring_schedule_data.day_specific_times"
                            :key="index"
                            class="mb-2"
                          >
                            <template v-slot:prepend>
                              <v-icon color="primary">mdi-calendar-clock</v-icon>
                            </template>
                            <v-list-item-title>
                              {{ getDayName(dayTime.day) }}
                            </v-list-item-title>
                            <v-list-item-subtitle>
                              {{ dayTime.start_time }} - {{ dayTime.end_time }}
                              ({{ calculateDuration(dayTime.start_time, dayTime.end_time) }}h)
                            </v-list-item-subtitle>
                          </v-list-item>
                        </v-list>
                      </v-col>
                    </v-row>

                    <!-- Regular Recurrence Days -->
                    <v-row v-else-if="hasRecurrenceDays(selectedBooking.recurring_schedule_data)">
                      <v-col cols="12">
                        <v-divider class="my-4"></v-divider>
                        <h5 class="text-h6 mb-3">
                          <v-icon class="mr-2" color="primary">mdi-calendar-week</v-icon>
                          Recurring Days
                        </h5>
                        <div class="mb-3">
                          <strong>Days of Week:</strong>
                          <v-chip
                            v-for="day in selectedBooking.recurring_schedule_data.recurrence_days"
                            :key="day"
                            color="primary"
                            variant="tonal"
                            size="small"
                            class="ml-2"
                          >
                            {{ getDayName(day) }}
                          </v-chip>
                        </div>
                        <div v-if="selectedBooking.recurring_schedule_data.start_time && selectedBooking.recurring_schedule_data.end_time">
                          <strong>Time:</strong> {{ selectedBooking.recurring_schedule_data.start_time }} - {{ selectedBooking.recurring_schedule_data.end_time }}
                          ({{ calculateDuration(selectedBooking.recurring_schedule_data.start_time, selectedBooking.recurring_schedule_data.end_time) }}h)
                        </div>
                      </v-col>
                    </v-row>

                    <!-- Summary -->
                    <v-row>
                      <v-col cols="12">
                        <v-divider class="my-4"></v-divider>
                        <v-alert
                          type="info"
                          variant="tonal"
                          class="mb-0"
                        >
                          <v-icon class="mr-2">mdi-information</v-icon>
                          {{ getRecurringSummaryText(selectedBooking.recurring_schedule_data) }}
                        </v-alert>
                      </v-col>
                    </v-row>
                  </v-card>
                </div>
              </div>
            </v-col>
          </v-row>

          <!-- Frequency Booking Details -->
          <v-row v-if="selectedBooking.frequency_type">
            <v-col cols="12">
              <div class="detail-section">
                <h4 class="detail-label">
                  <v-icon class="mr-2" color="primary">mdi-repeat</v-icon>
                  Frequency Booking Details
                </h4>
                <div class="detail-content">
                  <v-card variant="outlined" class="pa-4">
                    <v-row>
                      <v-col cols="12" md="6">
                        <div class="mb-3">
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
                        <div class="mb-3">
                          <strong>Duration:</strong> {{ selectedBooking.frequency_duration_months || 1 }} month{{ (selectedBooking.frequency_duration_months || 1) > 1 ? 's' : '' }}
                        </div>
                        <div class="mb-3">
                          <strong>Total Price:</strong> {{ formatPriceTemplate(selectedBooking.total_price) }}
                        </div>
                      </v-col>
                      <v-col cols="12" md="6">
                        <div class="mb-3" v-if="selectedBooking.frequency_days && selectedBooking.frequency_days.length > 0">
                          <strong>Selected Days:</strong>
                          <div class="mt-2">
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
                        <div class="mb-3">
                          <strong>Session Time:</strong> {{ formatTime(selectedBooking.start_time) }} - {{ formatTime(selectedBooking.end_time) }}
                        </div>
                        <div class="mb-3">
                          <strong>Session Duration:</strong> {{ getDuration(selectedBooking.start_time, selectedBooking.end_time) }} hours per session
                        </div>
                      </v-col>
                    </v-row>

                    <!-- Summary -->
                    <v-row>
                      <v-col cols="12">
                        <v-divider class="my-4"></v-divider>
                        <v-alert
                          type="info"
                          variant="tonal"
                          class="mb-0"
                        >
                          {{ getFrequencyDetailsText(selectedBooking) }}
                        </v-alert>
                      </v-col>
                    </v-row>
                  </v-card>
                </div>
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

    <!-- Edit Booking Dialog - DEPRECATED: Now using GlobalBookingDialog -->
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
                    <strong>Sport:</strong> {{ editingBooking.court?.sport?.name || 'Unknown' }}
                  </div>
                  <div class="info-item">
                    <strong>Status:</strong> 
                    <v-chip
                      :color="getStatusColor(editingBooking.status)"
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
                    <strong>Sport:</strong> {{ editingBooking.court?.sport?.name || 'Unknown' }}
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
                      :color="getStatusColor(editingBooking.status)"
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
                  <v-row v-if="editForm?.payment_method === 'gcash'">
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
                        <strong>Price per Hour:</strong> {{ formatPriceTemplate(selectedCourt.price_per_hour) }}
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
                      This is a company-owned badminton court system - all bookings are free!
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

    <!-- Global Booking Dialog for Editing -->
    <GlobalBookingDialog
      :is-open="globalEditDialog"
      :editBooking="editingBooking"
      @close="closeGlobalEditDialog"
      @show-snackbar="showSnackbar"
    />
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted, onUnmounted, watch, nextTick } from 'vue'
import { useRoute } from 'vue-router'
import { authService } from '../services/authService'
import { courtService } from '../services/courtService'
import RecurringScheduleViewDialog from '../components/RecurringScheduleViewDialog.vue'
import GlobalBookingDialog from '../components/GlobalBookingDialog.vue'
import Swal from 'sweetalert2'
import { formatPrice, formatNumber } from '../utils/formatters'

export default {
  name: 'Bookings',
  components: {
    RecurringScheduleViewDialog,
    GlobalBookingDialog
  },
  setup() {
    const route = useRoute()
    const bookings = ref([])
    const searchQuery = ref('')
    const statusFilter = ref('')
    const dateFilter = ref('')
    const loading = ref(true)
    const error = ref(null)
    const cancelling = ref(null)
    const updating = ref(null)

    const user = ref(null)
    const authLoading = ref(true)
    const isAuthenticated = computed(() => !!user.value)
    const tokenStatus = computed(() => {
      try {
        return localStorage.getItem('token') ? 'Present' : 'Missing'
      } catch (error) {
        return 'Error accessing localStorage'
      }
    })
    
    // View booking dialog
    const viewDialog = ref(false)
    
    // Recurring schedule view dialog
    const recurringViewDialog = ref(false)
    const selectedRecurringSchedule = ref(null)
    const selectedBooking = ref(null)
    
    // Edit booking dialog
    const editDialog = ref(false)
    const globalEditDialog = ref(false)
    const editingBooking = ref(null)
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
    const editLoading = ref(false)
    const editError = ref('')
    const courts = ref([])
    const availableSlots = ref([])
    const selectedCourt = ref(null)
    const totalPrice = ref(0)
    
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
      { title: 'Pending', value: 'pending' },
      { title: 'Approved', value: 'approved' },
      { title: 'Rejected', value: 'rejected' },
      { title: 'Cancelled', value: 'cancelled' },
      { title: 'Completed', value: 'completed' }
    ]




    const snackbar = ref({
      show: false,
      message: '',
      color: 'success'
    })

    const headers = [
      { title: 'Court', key: 'court_name', sortable: true, width: '20%' },
      { title: 'Date & Time', key: 'start_time', sortable: true, width: '20%' },
      { title: 'Duration', key: 'duration', sortable: false, width: '12%' },
      { title: 'Total Price', key: 'total_price', sortable: true, width: '12%' },
      { title: 'Payment', key: 'payment_status', sortable: true, width: '12%' },
      { title: 'Status', key: 'status', sortable: true, width: '12%' },
      { title: 'Actions', key: 'actions', sortable: false, width: '12%' }
    ]

    const recurringHeaders = [
      { title: 'Title', key: 'title', sortable: true, width: '25%' },
      { title: 'Court', key: 'court_name', sortable: true, width: '20%' },
      { title: 'Time', key: 'start_time', sortable: true, width: '15%' },
      { title: 'Recurrence', key: 'recurrence_type', sortable: true, width: '15%' },
      { title: 'Status', key: 'is_active', sortable: true, width: '10%' },
      { title: 'Actions', key: 'actions', sortable: false, width: '15%' }
    ]

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

      // Filter by search query
      if (searchQuery.value) {
        const query = searchQuery.value.toLowerCase()
        filtered = filtered.filter(booking =>
          booking.court?.name?.toLowerCase().includes(query) ||
          booking.court?.sport?.name?.toLowerCase().includes(query) ||
          booking.status?.toLowerCase().includes(query)
        )
      }

      return filtered
    })


    const itemProps = (item) => ({
      class: 'excel-table-row'
    })

    const fetchBookings = async () => {
      try {
        loading.value = true
        
        const data = await courtService.getBookings()
        
        // Process data to ensure total_price is a number
        bookings.value = (data || []).map(booking => ({
          ...booking,
          total_price: parseFloat(booking.total_price) || 0
        }))
      } catch (err) {
        console.error('Bookings - Error fetching bookings:', err)
        console.error('Bookings - Error response:', err.response?.data)
        console.error('Bookings - Error status:', err.response?.status)
        error.value = err.message
        bookings.value = []
      } finally {
        loading.value = false
      }
    }

    const formatDate = (dateTime) => {
      return new Date(dateTime).toLocaleDateString()
    }

    const formatTime = (dateTime) => {
      return new Date(dateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
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

    // Payment status functions
    const getPaymentStatus = (booking) => {
      if (!booking) return 'unknown'
      
      const hasPaymentMethod = booking.payment_method && booking.payment_method !== ''
      const hasProofOfPayment = booking.proof_of_payment && booking.proof_of_payment !== ''
      
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
      const status = getPaymentStatus(booking)
      const colors = {
        complete: 'success',
        missing_proof: 'warning',
        missing_method: 'warning',
        incomplete: 'error',
        unknown: 'grey'
      }
      return colors[status] || 'grey'
    }

    const getPaymentStatusText = (booking) => {
      const status = getPaymentStatus(booking)
      const texts = {
        complete: 'Complete',
        missing_proof: 'Missing Proof',
        missing_method: 'Missing Method',
        incomplete: 'Incomplete',
        unknown: 'Unknown'
      }
      return texts[status] || 'Unknown'
    }

    const getPaymentStatusIcon = (booking) => {
      const status = getPaymentStatus(booking)
      const icons = {
        complete: 'mdi-check-circle',
        missing_proof: 'mdi-alert-circle',
        missing_method: 'mdi-alert-circle',
        incomplete: 'mdi-close-circle',
        unknown: 'mdi-help-circle'
      }
      return icons[status] || 'mdi-help-circle'
    }

    // Clear all filters function
    const clearFilters = () => {
      searchQuery.value = ''
      statusFilter.value = ''
      dateFilter.value = ''
    }

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
        console.error('Error generating bookings:', error)
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
          console.error('Error deleting recurring schedule:', error)
          showSnackbar('Error deleting recurring schedule: ' + error.message, 'error')
        }
      }
    }

    const cancelBooking = async (bookingId) => {
      const result = await Swal.fire({
        title: 'Cancel Booking?',
        text: 'Are you sure you want to cancel this booking? This action cannot be undone.',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Yes, cancel booking',
        cancelButtonText: 'No, keep booking'
      })

      if (!result.isConfirmed) return
      
      try {
        cancelling.value = bookingId
        await courtService.updateBooking(bookingId, { status: 'cancelled' })
        
        // Dispatch event to refresh other components
        window.dispatchEvent(new CustomEvent('booking-cancelled'))
        
        await fetchBookings() // Refresh the list
        
        // Show success message
        Swal.fire({
          icon: 'success',
          title: 'Booking Cancelled!',
          text: 'Your booking has been cancelled successfully.',
          confirmButtonColor: '#1976d2',
          timer: 3000,
          timerProgressBar: true
        })
      } catch (err) {
        Swal.fire({
          icon: 'error',
          title: 'Cancellation Failed',
          text: 'Failed to cancel booking: ' + err.message,
          confirmButtonColor: '#d33'
        })
      } finally {
        cancelling.value = null
      }
    }

    const openBookingDialog = () => {
      // Emit event to parent (App.vue) to open the global booking dialog
      window.dispatchEvent(new CustomEvent('open-booking-dialog'))
    }

    const viewBooking = (booking) => {
      selectedBooking.value = booking
      viewDialog.value = true
    }

    const testEditDialog = () => {
      console.log('Testing edit dialog...')
      editDialog.value = true
      console.log('Edit dialog state:', editDialog.value)
    }

    const forcePopulateForm = () => {
      console.log('Force populating form...')
      console.log('Current editingBooking:', editingBooking.value)
      
      if (editingBooking.value) {
        // Simple form population
        editForm.court_id = editingBooking.value.court_id || 1
        editForm.date = new Date(editingBooking.value.start_time).toISOString().split('T')[0]
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
        
        console.log('Form force populated:', editForm)
      }
    }


    const editBooking = async (booking) => {
      try {
        // Convert Proxy to plain object to avoid reactivity issues
        const plainBooking = JSON.parse(JSON.stringify(booking))
        editingBooking.value = plainBooking
        globalEditDialog.value = true
      } catch (error) {
        console.error('Error in editBooking:', error)
        showSnackbar('Failed to open edit dialog', 'error')
      }
    }

    const loadCourts = async () => {
      try {
        courts.value = await courtService.getCourts()
      } catch (error) {
        console.error('Failed to load courts:', error)
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
        
        // If we're editing a booking, add the current booking's time slot to available slots
        if (editingBooking.value) {
          const currentStartTime = new Date(editingBooking.value.start_time).toISOString()
          const currentEndTime = new Date(editingBooking.value.end_time).toISOString()
          const currentSlot = {
            start_time: currentStartTime,
            end_time: currentEndTime,
            formatted_time: `${new Date(currentStartTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - ${new Date(currentEndTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
          }
          
          // Check if current slot is already in the list
          const existingSlot = slots.find(slot => slot.start_time === currentStartTime)
          if (!existingSlot) {
            slots.unshift(currentSlot) // Add to beginning
          }
        }
        
        availableSlots.value = slots
        calculatePrice()
      } catch (error) {
        console.error('Failed to load available slots:', error)
        editError.value = 'Failed to load available time slots'
      }
    }

    const onCourtChange = async () => {
      selectedCourt.value = courts.value.find(c => c.id === editForm.court_id)
      editForm.start_time = ''
      availableSlots.value = []
      totalPrice.value = 0
      
      if (editForm.date) {
        await loadAvailableSlots()
      }
    }

    const onDateChange = async () => {
      editForm.start_time = ''
      availableSlots.value = []
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

      const basePrice = selectedCourt.value.price_per_hour * editForm.duration
      
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
          console.error('Validation failed:', {
            court_id: editForm.court_id,
            date: editForm.date,
            start_time: editForm.start_time
          })
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
            console.error('Failed to upload proof of payment:', error)
            showSnackbar('Failed to upload proof of payment', 'error')
          }
        }
        
        // Refresh bookings list
        await fetchBookings()
        
        // Dispatch event to refresh other components
        window.dispatchEvent(new CustomEvent('booking-updated'))
        
        closeEditDialog()
      } catch (error) {
        console.error('Failed to update booking:', error)
        
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
      selectedCourt.value = null
      totalPrice.value = 0
    }

    const closeGlobalEditDialog = () => {
      globalEditDialog.value = false
      editingBooking.value = null
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
        console.error('Bookings - Auth check failed:', error)
        
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
        console.log('Bookings - No token found, user not authenticated')
        user.value = null
      }

      // Always try to fetch bookings regardless of auth status
      console.log('Bookings - Attempting to fetch bookings...')
      await fetchBookings()
      
      authLoading.value = false
      
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
        console.log('Bookings - Route changed to /bookings, refreshing data...')
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
          return
        }
        
        // Validate file type
        if (!file.type.startsWith('image/')) {
          showSnackbar('Please upload an image file', 'error')
          editForm.proof_of_payment = null
          return
        }
        
        showSnackbar('Proof of payment uploaded successfully!', 'success')
      }
    }

    const viewProofOfPayment = () => {
      if (editingBooking.value?.proof_of_payment) {
        // Open proof of payment in a new window/tab
        window.open(editingBooking.value.proof_of_payment, '_blank')
      }
    }

    const uploadProofOfPayment = async (bookingId, file) => {
      try {
        const formData = new FormData()
        formData.append('proof_of_payment', file)
        formData.append('payment_method', editForm.payment_method)
        
        const response = await fetch(`/api/bookings/${bookingId}/upload-proof`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: formData
        })
        
        if (!response.ok) {
          throw new Error('Failed to upload proof of payment')
        }
        
        const result = await response.json()
        return result.data
      } catch (error) {
        console.error('Error uploading proof of payment:', error)
        throw error
      }
    }


    return {
      bookings,
      searchQuery,
      statusFilter,
      dateFilter,
      statusOptions,
      filteredBookings,
      loading,
      error,
      cancelling,
      updating,
      user,
      authLoading,
      isAuthenticated,
      tokenStatus,
      headers,
      itemProps,
      formatDate,
      formatTime,
      getDuration,
      getStatusColor,
      formatRecurrenceType,
      generateBookings,
      editRecurringSchedule,
      viewRecurringSchedule,
      deleteRecurringSchedule,
      cancelBooking,
      openBookingDialog,
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
      snackbar,
      showSnackbar,
      // Payment methods
      onPaymentMethodChange,
      onProofOfPaymentChange,
      viewProofOfPayment,
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
      clearFilters
    }
  }
}
</script>

<style scoped>
/* Modern Sports Bookings Theme */
.bookings-container {
  background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
  min-height: 100vh;
  padding: 32px;
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
  margin: 0 auto 32px;
  line-height: 1.6;
}

.header-actions {
  display: flex;
  justify-content: center;
  gap: 16px;
}

.header-btn-primary {
  background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%) !important;
  color: white !important;
  border-radius: 12px !important;
  font-weight: 700 !important;
  text-transform: none !important;
  padding: 16px 32px !important;
  box-shadow: 0 8px 25px rgba(59, 130, 246, 0.4) !important;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
}

.header-btn-primary:hover {
  transform: translateY(-4px) !important;
  box-shadow: 0 12px 35px rgba(59, 130, 246, 0.6) !important;
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

.search-section {
  flex: 1;
  min-width: 250px;
}

.search-field {
  border-radius: 8px !important;
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
.detail-section {
  margin-bottom: 24px;
}

.detail-label {
  font-size: 16px;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 12px;
  padding-bottom: 8px;
  border-bottom: 2px solid #e5e7eb;
}

.detail-content {
  padding-left: 8px;
}

.detail-item {
  margin-bottom: 8px;
  font-size: 14px;
  color: #374151;
  display: flex;
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
}
</style>
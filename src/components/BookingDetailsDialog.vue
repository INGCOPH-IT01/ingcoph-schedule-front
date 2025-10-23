<template>
  <v-dialog
    :model-value="isOpen"
    @update:model-value="$emit('update:isOpen', $event)"
    max-width="800px"
    class="booking-view-dialog"
    persistent
    :fullscreen="$vuetify.display.mobile"
    transition="dialog-bottom-transition"
  >
    <v-card v-if="booking">
      <v-card-title class="text-h5 dialog-title">
        <div class="d-flex align-center">
          <v-icon class="mr-2">mdi-calendar-check</v-icon>
          Booking Details
        </div>
        <v-btn icon="mdi-close" variant="text" @click="closeDialog"></v-btn>
      </v-card-title>

      <v-card-text class="pa-6">
        <!-- User Information -->
        <div class="detail-section mb-4">
          <h4 class="detail-section-title">
            <v-icon class="mr-2" color="primary">mdi-account</v-icon>
            Customer Information
          </h4>
          <v-card variant="outlined" class="pa-4">
            <div class="detail-row">
              <span class="detail-label">Name:</span>
              <div class="detail-value">
                {{ getDisplayUserName(booking) }}
                <v-chip
                  v-if="isBookedByAdminOrStaff(booking)"
                  size="x-small"
                  :color="getBookedByUserRoleColor(booking)"
                  variant="tonal"
                  class="ml-2"
                >
                  <v-icon size="x-small" class="mr-1">{{ getBookedByUserRoleIcon(booking) }}</v-icon>
                  Booked by {{ booking.user?.name || 'Admin' }}
                </v-chip>
              </div>
            </div>
            <v-divider class="my-2"></v-divider>
            <div class="detail-row">
              <span class="detail-label">Email:</span>
              <span class="detail-value">{{ getDisplayUserEmail(booking) }}</span>
            </div>
            <v-divider class="my-2"></v-divider>
            <div class="detail-row">
              <span class="detail-label">Phone:</span>
              <span class="detail-value">{{ getDisplayUserPhone(booking) }}</span>
            </div>
            <template v-if="isAdminBooking(booking)">
              <v-divider class="my-2"></v-divider>
              <div class="detail-row">
                <span class="detail-label">Created By:</span>
                <div class="detail-value">
                  <v-chip
                    :color="getBookedByUserRoleColor(booking)"
                    size="small"
                    variant="tonal"
                  >
                    <v-icon size="small" class="mr-1">{{ getBookedByUserRoleIcon(booking) }}</v-icon>
                    {{ booking.user?.name || 'N/A' }} ({{ booking.user?.role || 'Admin' }})
                  </v-chip>
                </div>
              </div>
            </template>
            <template v-if="showAdminFeatures">
              <v-divider class="my-2"></v-divider>
              <div class="detail-row">
                <span class="detail-label">User ID:</span>
                <span class="detail-value">#{{ getDisplayUserId(booking) }}</span>
              </div>
              <v-divider class="my-2"></v-divider>
              <div class="detail-row">
                <span class="detail-label">Booking ID:</span>
                <span class="detail-value">#{{ booking.id }}</span>
              </div>
            </template>
          </v-card>
        </div>

        <!-- Court Images Gallery -->
        <div class="detail-section mb-4" v-if="showCourtImages && booking.court?.images && booking.court.images.length > 0">
          <h4 class="detail-section-title">
            <v-icon class="mr-2" color="primary">mdi-image-multiple</v-icon>
            Court Images
          </h4>
          <v-card variant="outlined" class="pa-4">
            <CourtImageGallery
              :images="booking.court.images"
              :court-name="booking.court.name"
              size="large"
              @image-error="handleImageError"
            />
          </v-card>
        </div>

        <!-- Transaction Details (for cart transactions) -->
        <div class="detail-section mb-4" v-if="isTransaction">
          <h4 class="detail-section-title">
            <v-icon class="mr-2" color="primary">mdi-receipt-text</v-icon>
            Transaction Details
          </h4>
          <v-card variant="outlined" class="pa-4">
            <div class="detail-row">
              <span class="detail-label">Transaction ID:</span>
              <span class="detail-value">#{{ booking.id }}</span>
            </div>
            <v-divider class="my-2"></v-divider>
            <div class="detail-row">
              <span class="detail-label">Created:</span>
              <span class="detail-value">{{ formattedCreatedAt }}</span>
            </div>
            <v-divider class="my-2"></v-divider>
            <div class="detail-row">
              <span class="detail-label">Number of Players:</span>
              <v-chip color="primary" variant="tonal" size="small">
                <v-icon class="mr-1" size="small">mdi-account-group</v-icon>
                {{ numberOfPlayers }}
              </v-chip>
            </div>
            <v-divider class="my-2"></v-divider>
            <div class="detail-row">
              <span class="detail-label">Items Count:</span>
              <span class="detail-value">{{ booking.items_count || booking.cart_items?.length || 0 }} slot{{ (booking.items_count || booking.cart_items?.length || 0) > 1 ? 's' : '' }}</span>
            </div>
            <v-divider class="my-2"></v-divider>
            <div class="detail-row">
              <span class="detail-label">Approval Status:</span>
              <v-chip
                :color="statusColor"
                size="small"
                variant="tonal"
              >
                {{ bookingStatus }}
              </v-chip>
            </div>
            <!-- Rejection Reason (Transaction) -->
            <div class="detail-row" v-if="isRejected && rejectionReason">
              <span class="detail-label">Rejection Reason:</span>
              <div class="detail-value" style="white-space: pre-wrap; text-align: left;">{{ rejectionReason }}</div>
            </div>
            <v-divider class="my-2"></v-divider>
            <div class="detail-row">
              <span class="detail-label">Total Price:</span>
              <span class="detail-value font-weight-bold text-h6 text-success">₱{{ totalPrice }}</span>
            </div>
          </v-card>
        </div>

        <!-- Booking Information (for regular bookings) -->
        <div class="detail-section mb-4" v-if="!isTransaction">
          <h4 class="detail-section-title">
            <v-icon class="mr-2" color="primary">mdi-calendar-clock</v-icon>
            Booking Information
          </h4>
          <v-card variant="outlined" class="pa-4">
            <div class="detail-row">
              <span class="detail-label">Booking ID:</span>
              <span class="detail-value">#{{ booking.id }}</span>
            </div>
            <v-divider class="my-2"></v-divider>
            <div class="detail-row">
              <span class="detail-label">Court:</span>
              <div class="detail-value text-right">
                <div>{{ courtName || 'N/A' }}</div>
                <div v-if="booking.court?.surface_type" class="text-caption text-grey">
                  <v-icon size="12" class="mr-1">mdi-texture-box</v-icon>
                  {{ booking.court.surface_type }}
                </div>
              </div>
            </div>
            <v-divider class="my-2"></v-divider>
            <div class="detail-row">
              <span class="detail-label">Date:</span>
              <span class="detail-value">{{ formattedDate }}</span>
            </div>
            <v-divider class="my-2"></v-divider>
            <div class="detail-row">
              <span class="detail-label">Time:</span>
              <span class="detail-value">{{ formattedTimeRange }}</span>
            </div>
            <v-divider class="my-2"></v-divider>
            <div class="detail-row">
              <span class="detail-label">Number of Players:</span>
              <v-chip color="primary" variant="tonal" size="small">
                <v-icon class="mr-1" size="small">mdi-account-group</v-icon>
                {{ booking.number_of_players || 1 }} player
              </v-chip>
            </div>
            <v-divider class="my-2"></v-divider>
            <div class="detail-row">
              <span class="detail-label">Status:</span>
              <v-chip
                :color="statusColor"
                size="small"
                variant="flat"
              >
                {{ bookingStatus }}
              </v-chip>
            </div>
            <!-- Rejection Reason (Regular Booking) -->
            <div class="detail-row" v-if="isRejected && rejectionReason">
              <span class="detail-label">Rejection Reason:</span>
              <div class="detail-value" style="white-space: pre-wrap; text-align: left;">{{ rejectionReason }}</div>
            </div>
          </v-card>
        </div>

        <!-- Cart Items in Transaction (Admin detailed view) - Grouped by Court -->
        <div class="detail-section mb-4" v-if="isTransaction && showAdminFeatures && booking.cart_items && booking.cart_items.length > 0">
          <h4 class="detail-section-title">
            <v-icon class="mr-2" color="primary">mdi-calendar-clock</v-icon>
            Booked Courts & Time Slots ({{ booking.cart_items.length }} items)
          </h4>

          <!-- Grouped by Court -->
          <v-card
            v-for="group in groupedCartItems"
            :key="group.id"
            variant="outlined"
            class="mb-3"
          >
            <!-- Court Header -->
            <v-card-title class="bg-grey-lighten-4 pa-3">
              <div class="d-flex align-center">
                <v-avatar :color="sportService.getSportColor(group.sport?.name)" size="40" class="mr-3">
                  <v-icon color="white" size="24">{{ sportService.getSportIcon(group.sport?.name, group.sport?.icon) }}</v-icon>
                </v-avatar>
                <div class="flex-grow-1">
                  <div class="text-subtitle-1 font-weight-bold">
                    {{ group.court.name }}
                    <span v-if="group.court.surface_type" class="text-caption text-grey font-weight-normal ml-1">
                      ({{ group.court.surface_type }})
                    </span>
                  </div>
                  <div class="text-caption text-grey">
                    {{ group.sport?.name || 'Unknown Sport' }} • {{ group.originalItems.length }} slot{{ group.originalItems.length > 1 ? 's' : '' }}
                  </div>
                </div>
                <v-chip color="success" variant="tonal" size="small">
                  <v-icon start size="small">mdi-cash</v-icon>
                  ₱{{ calculateCourtGroupPrice(group) }}
                </v-chip>
              </div>
            </v-card-title>

            <v-divider></v-divider>

            <!-- Time Slots with Edit/Delete functionality -->
            <v-card-text class="pa-3">
              <!-- Individual items within this court group -->
              <v-card
                v-for="item in group.originalItems"
                :key="item.id"
                variant="outlined"
                class="pa-3 mb-3"
              >
              <!-- Admin Edit Mode for Court -->
              <div v-if="isAdmin && editingCourtItemIndex === item.id" class="mb-3">
                <v-select
                  v-model="selectedCourtId"
                  :items="availableCourtsForItem"
                  item-title="name"
                  item-value="id"
                  label="Select Court"
                  variant="outlined"
                  density="compact"
                  :loading="loadingCourts"
                  class="court-selector mb-2"
                >
                  <template v-slot:item="{ props, item }">
                    <v-list-item
                      v-bind="props"
                      :disabled="!item.raw.is_available"
                    >
                      <template v-slot:title>
                        <div class="d-flex align-center justify-space-between">
                          <span>{{ item.raw.name }}</span>
                          <div class="d-flex gap-1">
                            <v-chip
                              v-if="item.raw.is_current"
                              size="x-small"
                              color="primary"
                              variant="flat"
                              class="ml-1"
                            >
                              Current
                            </v-chip>
                            <v-chip
                              v-if="!item.raw.is_available"
                              size="x-small"
                              color="error"
                              variant="tonal"
                              class="ml-1"
                            >
                              Booked
                            </v-chip>
                            <v-chip
                              v-else-if="!item.raw.is_current"
                              size="x-small"
                              color="success"
                              variant="tonal"
                              class="ml-1"
                            >
                              Available
                            </v-chip>
                          </div>
                        </div>
                      </template>
                      <template v-slot:subtitle v-if="item.raw.surface_type">
                        {{ item.raw.surface_type }}
                      </template>
                    </v-list-item>
                  </template>
                </v-select>
                <div class="d-flex gap-2">
                  <v-btn
                    size="small"
                    color="success"
                    variant="tonal"
                    @click="saveCartItemCourtChange(item)"
                    :loading="savingCourt"
                    :disabled="!courtChanged"
                  >
                    Save
                  </v-btn>
                  <v-btn
                    size="small"
                    color="grey"
                    variant="text"
                    @click="cancelCourtEdit"
                  >
                    Cancel
                  </v-btn>
                </div>
              </div>

              <!-- Admin Edit Mode for Date/Time -->
              <div v-else-if="isAdmin && editingDateTimeItemIndex === item.id" class="mb-3">
                <v-text-field
                  v-model="selectedBookingDate"
                  label="Booking Date"
                  type="date"
                  variant="outlined"
                  density="compact"
                  class="mb-2"
                ></v-text-field>
                <v-row class="mb-2">
                  <v-col cols="6">
                    <v-text-field
                      v-model="selectedStartTime"
                      label="Start Time"
                      type="time"
                      variant="outlined"
                      density="compact"
                    ></v-text-field>
                  </v-col>
                  <v-col cols="6">
                    <v-text-field
                      v-model="selectedEndTime"
                      label="End Time"
                      type="time"
                      variant="outlined"
                      density="compact"
                    ></v-text-field>
                  </v-col>
                </v-row>
                <div class="d-flex gap-2">
                  <v-btn
                    size="small"
                    color="success"
                    variant="tonal"
                    @click="saveCartItemDateTimeChange(item)"
                    :loading="savingDateTime"
                    :disabled="!dateTimeChanged"
                  >
                    Save
                  </v-btn>
                  <v-btn
                    size="small"
                    color="grey"
                    variant="text"
                    @click="cancelDateTimeEdit"
                  >
                    Cancel
                  </v-btn>
                </div>
              </div>

              <!-- Display Mode -->
              <div v-else>
                <div class="d-flex align-center justify-space-between mb-2">
                  <div class="d-flex align-center flex-grow-1">
                    <v-icon size="16" class="mr-2" color="grey">mdi-calendar-outline</v-icon>
                    <span class="text-body-2 font-weight-medium">
                      {{ formatBookingDate(item.booking_date) }}
                    </span>
                  </div>
                  <div v-if="isAdmin" class="d-flex gap-2">
                    <v-btn
                      icon="mdi-pencil"
                      size="x-small"
                      variant="text"
                      color="primary"
                      @click="startCartItemCourtEdit(item)"
                      title="Edit Court"
                    ></v-btn>
                    <v-btn
                      icon="mdi-delete"
                      size="x-small"
                      variant="text"
                      color="error"
                      @click="confirmDeleteTimeSlot(item)"
                      title="Delete Time Slot"
                    ></v-btn>
                  </div>
                </div>

                <v-divider class="my-2"></v-divider>

                <div class="d-flex align-center justify-space-between">
                  <div class="d-flex align-center">
                    <v-icon size="16" class="mr-2" color="grey">mdi-clock-outline</v-icon>
                    <span class="text-body-2">
                      {{ formatTimeSlot(item.start_time) }} - {{ formatTimeSlot(item.end_time) }}
                    </span>
                    <div v-if="isAdmin" class="d-flex ml-2">
                      <v-btn
                        icon="mdi-calendar-edit"
                        size="x-small"
                        variant="text"
                        color="primary"
                        @click="startCartItemDateTimeEdit(item)"
                        title="Edit Date/Time"
                      ></v-btn>
                    </div>
                  </div>
                  <span class="text-body-1 font-weight-bold text-success">
                    ₱{{ parseFloat(item.price).toFixed(2) }}
                  </span>
                </div>
              </div>
            </v-card>
            </v-card-text>
          </v-card>
        </div>

        <!-- Time Slots Details (Simple view for non-admin) - Grouped by Court -->
        <div class="detail-section mb-4" v-if="(!showAdminFeatures || !isTransaction) && booking.cart_items && booking.cart_items.length > 0">
          <h4 class="detail-section-title">
            <v-icon class="mr-2" color="primary">mdi-calendar-clock</v-icon>
            Booked Courts & Time Slots
          </h4>

          <!-- Grouped by Court -->
          <v-card
            v-for="group in groupedCartItems"
            :key="group.id"
            variant="outlined"
            class="mb-3 pa-4"
          >
            <!-- Court Header -->
            <div class="d-flex align-center mb-3">
              <v-avatar :color="sportService.getSportColor(group.sport?.name)" size="40" class="mr-3">
                <v-icon color="white" size="24">{{ sportService.getSportIcon(group.sport?.name, group.sport?.icon) }}</v-icon>
              </v-avatar>
              <div>
                <div class="text-subtitle-1 font-weight-bold">
                  {{ group.court.name }}
                  <span v-if="group.court.surface_type" class="text-caption text-grey font-weight-normal ml-1">
                    ({{ group.court.surface_type }})
                  </span>
                </div>
                <div class="text-caption text-grey">
                  {{ group.sport?.name || 'Unknown Sport' }} • {{ group.originalItems.length }} slot{{ group.originalItems.length > 1 ? 's' : '' }}
                </div>
              </div>
            </div>

            <v-divider class="mb-3"></v-divider>

            <!-- Time Slots List -->
            <div class="time-slots-list">
              <div class="text-caption text-grey mb-2">
                <v-icon size="small" class="mr-1">mdi-calendar-clock</v-icon>
                <strong>Booked Time Slots:</strong>
              </div>
              <div
                v-for="(slot, index) in group.timeSlots"
                :key="index"
                class="d-flex justify-space-between align-center mb-2"
              >
                <div class="d-flex align-center flex-wrap gap-2">
                  <v-chip
                    size="small"
                    color="info"
                    variant="tonal"
                  >
                    <v-icon start size="small">mdi-calendar</v-icon>
                    {{ formatBookingDate(slot.date) }}
                  </v-chip>
                  <v-chip
                    size="small"
                    color="primary"
                    variant="tonal"
                  >
                    <v-icon start size="small">mdi-clock-outline</v-icon>
                    {{ formatTimeSlot(slot.startTime) }} - {{ formatTimeSlot(slot.endTime) }}
                    <span class="text-caption ml-1">
                      ({{ calculateDuration(slot.startTime, slot.endTime) }})
                    </span>
                  </v-chip>
                </div>
                <span class="font-weight-bold text-success ml-2">
                  ₱{{ calculateSlotGroupPrice(slot) }}
                </span>
              </div>
            </div>

            <v-divider class="my-3"></v-divider>

            <!-- Group Total -->
            <div class="d-flex justify-space-between align-center">
              <span class="text-subtitle-2">Court Total:</span>
              <span class="text-h6 font-weight-bold text-success">
                ₱{{ calculateCourtGroupPrice(group) }}
              </span>
            </div>
          </v-card>
        </div>

        <!-- Frequency Booking Details -->
        <div class="detail-section mb-4" v-if="showAdminFeatures && booking.frequency_type && booking.frequency_type !== 'once'">
          <h4 class="detail-section-title">
            <v-icon class="mr-2" color="primary">mdi-repeat</v-icon>
            Frequency Booking Details
          </h4>
          <v-card variant="outlined" class="pa-4">
            <div class="detail-row">
              <span class="detail-label">Frequency Type:</span>
              <v-chip
                :color="getFrequencyColor(booking.frequency_type)"
                variant="tonal"
                size="small"
              >
                {{ formatFrequencyType(booking.frequency_type) }}
              </v-chip>
            </div>
            <v-divider class="my-2"></v-divider>
            <div class="detail-row">
              <span class="detail-label">Duration:</span>
              <span class="detail-value">{{ booking.frequency_duration_months || 1 }} month{{ (booking.frequency_duration_months || 1) > 1 ? 's' : '' }}</span>
            </div>
            <div v-if="booking.frequency_days && booking.frequency_days.length > 0">
              <v-divider class="my-2"></v-divider>
              <div class="detail-row">
                <span class="detail-label">Selected Days:</span>
                <div class="d-flex flex-wrap gap-1">
                  <v-chip
                    v-for="day in booking.frequency_days"
                    :key="day"
                    color="primary"
                    variant="tonal"
                    size="small"
                  >
                    {{ getDayName(day) }}
                  </v-chip>
                </div>
              </div>
            </div>
          </v-card>
        </div>

        <!-- Admin Notes (Staff/Admin only) -->
        <div class="detail-section mb-4" v-if="showAdminFeatures">
          <h4 class="detail-section-title">
            <v-icon class="mr-2" color="warning">mdi-shield-account</v-icon>
            Admin Notes (Internal)
          </h4>
          <v-card variant="outlined" class="pa-4" color="warning" style="background-color: rgba(255, 160, 0, 0.05);">
            <div class="d-flex align-center mb-2">
              <v-chip color="warning" variant="tonal" size="x-small" class="mr-2">
                <v-icon size="x-small" class="mr-1">mdi-lock</v-icon>
                Internal Use Only
              </v-chip>
            </div>
            <div v-if="booking.admin_notes" class="mb-0 text-body-1">
              {{ booking.admin_notes }}
            </div>
            <div v-else-if="booking.cart_items && booking.cart_items.length > 0 && booking.cart_items[0].admin_notes" class="mb-0 text-body-1">
              {{ booking.cart_items[0].admin_notes }}
            </div>
            <div v-else class="mb-0 text-body-2 text-grey">
              <em>No admin notes for this booking</em>
            </div>
          </v-card>
        </div>

        <!-- Client Notes / Special Requests -->
        <div class="detail-section mb-4" v-if="booking.notes || (booking.cart_items && booking.cart_items.length > 0 && booking.cart_items[0].notes)">
          <h4 class="detail-section-title">
            <v-icon class="mr-2" color="primary">mdi-note-text</v-icon>
            Client Notes / Special Requests
          </h4>
          <v-card variant="outlined" class="pa-4">
            <div v-if="booking.notes" class="mb-0 text-body-1">
              {{ booking.notes }}
            </div>
            <div v-else-if="booking.cart_items && booking.cart_items.length > 0 && booking.cart_items[0].notes" class="mb-0 text-body-1">
              {{ booking.cart_items[0].notes }}
            </div>
          </v-card>
        </div>

        <!-- Payment Information -->
        <div class="detail-section mb-4">
          <h4 class="detail-section-title">
            <v-icon class="mr-2" color="primary">mdi-cash</v-icon>
            Payment Information
          </h4>
          <v-card variant="outlined" class="pa-4">
            <!-- Payment QR Code (for unpaid bookings) -->
            <div v-if="booking.payment_status !== 'paid' && !isRejected" class="payment-qr-section mb-4">
              <div class="text-subtitle-2 font-weight-bold mb-3 d-flex align-center">
                <v-icon class="mr-2" color="primary">mdi-qrcode-scan</v-icon>
                Scan to Pay via GCash
              </div>
              <v-card variant="tonal" color="primary" class="pa-4">
                <div v-if="loadingPaymentSettings" class="d-flex flex-column align-center py-4">
                  <v-progress-circular indeterminate color="primary" size="64"></v-progress-circular>
                  <p class="mt-3 text-caption">Loading payment QR code...</p>
                </div>
                <div v-else-if="paymentQrCodeUrl" class="d-flex flex-column align-center">
                  <div class="qr-payment-wrapper mb-3">
                    <img
                      :src="paymentQrCodeUrl"
                      alt="GCash Payment QR Code"
                      class="payment-qr-code"
                      @error="handleQrCodeError"
                    />
                  </div>
                  <v-chip color="primary" size="small" class="mb-2">
                    <v-icon start size="16">mdi-cash</v-icon>
                    Amount: ₱{{ totalPrice }}
                  </v-chip>
                  <p class="text-caption text-center">
                    Scan this QR code with GCash app to complete payment
                  </p>
                  <div v-if="paymentSettings" class="text-center mt-2">
                    <p class="text-caption font-weight-bold">{{ paymentSettings.payment_gcash_name }}</p>
                  </div>
                </div>
                <div v-else class="d-flex flex-column align-center py-4">
                  <v-icon size="48" color="grey">mdi-qrcode-scan</v-icon>
                  <p class="mt-3 text-caption text-center">
                    Payment QR code not available.<br>
                    Please contact support for payment instructions.
                  </p>
                </div>
              </v-card>
              <v-alert type="info" variant="tonal" class="mt-3" density="compact">
                <div class="text-caption">
                  <strong>After Payment:</strong> Please upload your payment screenshot below to confirm your booking.
                </div>
              </v-alert>
            </div>
            <v-divider v-if="booking.payment_status !== 'paid' && !isRejected" class="my-3"></v-divider>

            <div class="detail-row">
              <span class="detail-label">Payment Method:</span>
              <template v-if="showAdminFeatures">
                <v-chip
                  :color="booking.payment_method ? 'success' : 'error'"
                  variant="tonal"
                  size="small"
                >
                  {{ booking.payment_method ? booking.payment_method.toUpperCase() : 'Not Set' }}
                </v-chip>
              </template>
              <span v-else class="detail-value">{{ booking.payment_method || 'N/A' }}</span>
            </div>
            <template v-if="showAdminFeatures">
              <v-divider class="my-2"></v-divider>
              <div class="detail-row">
                <span class="detail-label">Payment Status:</span>
                <v-chip
                  :color="getPaymentStatusColor(booking)"
                  variant="tonal"
                  size="small"
                >
                  <v-icon class="mr-1" size="small">{{ getPaymentStatusIcon(booking) }}</v-icon>
                  {{ getPaymentStatusText(booking) }}
                </v-chip>
              </div>
              <!-- Warning for unpaid bookings -->
              <v-alert
                v-if="booking.payment_status !== 'paid' && !isRejected"
                type="warning"
                variant="tonal"
                class="mt-3"
                density="compact"
              >
                <div class="text-caption">
                  <strong>Payment Required:</strong> This booking cannot be marked as "showed up" until payment is completed.
                </div>
              </v-alert>

              <!-- Upload Proof of Payment Section (available for unpaid and paid bookings) -->
              <!-- Hidden when booking was created by a User role account, unless current user is the booking owner -->
              <v-card
                v-if="showAdminFeatures && !isRejected && (booking.user?.role !== 'user' || booking.user?.id === currentUserId)"
                variant="outlined"
                class="mt-3 pa-3"
              >
                <h5 class="text-subtitle-2 font-weight-bold mb-3">
                  <v-icon size="small" class="mr-1">mdi-upload</v-icon>
                  {{ isAlreadyPaid ? 'Upload Additional Proof of Payment' : 'Upload Proof of Payment' }}
                </h5>

                <ProofOfPaymentUpload
                  v-model="proofFiles"
                  label="Select proof of payment"
                  placeholder="Select images"
                  density="compact"
                  :multiple="true"
                  hint="Upload screenshots or photos of payment receipts (max 5MB each)"
                  :rules="[v => !v || validateFileSize(v) || 'Each file should be less than 5 MB']"
                  class="mb-2"
                />

                <v-btn
                  color="success"
                  :loading="uploadingProof"
                  :disabled="!proofFiles || proofFiles.length === 0"
                  @click="uploadProofOfPayment"
                  block
                >
                  <v-icon start>mdi-upload</v-icon>
                  {{ uploadButtonLabel }}
                </v-btn>
              </v-card>
            </template>
            <v-divider class="my-2"></v-divider>
            <div class="detail-row">
              <span class="detail-label">Total Amount:</span>
              <span class="detail-value font-weight-bold text-h6 text-success">₱{{ totalPrice }}</span>
            </div>
            <template v-if="showAdminFeatures && booking.proof_of_payment">
              <v-divider class="my-2"></v-divider>
              <div class="detail-row" style="display: block;">
                <span class="detail-label mb-2 d-block">Proof of Payment:</span>
                <div class="d-flex flex-wrap gap-2">
                  <v-card
                    v-for="(file, index) in getProofOfPaymentFiles(booking.proof_of_payment)"
                    :key="index"
                    class="proof-thumbnail-card"
                    elevation="2"
                    @click="viewProofOfPayment(index)"
                  >
                    <v-img
                      :src="getProofThumbnailUrl(index)"
                      height="100"
                      width="100"
                      cover
                      class="proof-thumbnail"
                    >
                      <template v-slot:placeholder>
                        <div class="d-flex align-center justify-center fill-height">
                          <v-progress-circular indeterminate color="primary"></v-progress-circular>
                        </div>
                      </template>
                      <template v-slot:error>
                        <div class="d-flex align-center justify-center fill-height bg-grey-lighten-2">
                          <v-icon size="40" color="grey">mdi-file-image</v-icon>
                        </div>
                      </template>
                    </v-img>
                    <v-card-actions class="pa-1">
                      <v-btn
                        size="x-small"
                        variant="text"
                        color="primary"
                        block
                        @click.stop="viewProofOfPayment(index)"
                      >
                        <v-icon start size="16">mdi-eye</v-icon>
                        {{ getProofOfPaymentFiles(booking.proof_of_payment).length > 1 ? `#${index + 1}` : 'View' }}
                      </v-btn>
                    </v-card-actions>
                  </v-card>
                </div>
                <div class="text-caption text-grey mt-2">
                  <v-icon size="14" class="mr-1">mdi-information</v-icon>
                  {{ getProofOfPaymentFiles(booking.proof_of_payment).length }} file{{ getProofOfPaymentFiles(booking.proof_of_payment).length > 1 ? 's' : '' }} uploaded
                </div>
              </div>
            </template>
            <template v-if="showAdminFeatures && !booking.proof_of_payment">
              <v-divider class="my-2"></v-divider>
              <div class="detail-row">
                <span class="detail-label">Proof of Payment:</span>
                <v-chip color="error" variant="tonal" size="small">
                  Not Uploaded
                </v-chip>
              </div>
            </template>
            <v-divider class="my-2"></v-divider>
            <div class="detail-row">
              <span class="detail-label">Created At:</span>
              <span class="detail-value">{{ formattedCreatedAt }}</span>
            </div>
          </v-card>
        </div>

        <!-- QR Code Section (Approved Bookings Only) -->
        <div class="detail-section mb-4" v-if="isApprovedBooking">
          <h4 class="detail-section-title">
            <v-icon class="mr-2" color="primary">mdi-qrcode</v-icon>
            Booking QR Code
          </h4>
          <v-card variant="outlined" class="pa-4">
            <div v-if="loadingQrCode" class="text-center py-4">
              <v-progress-circular indeterminate color="primary" size="64"></v-progress-circular>
              <p class="mt-3 text-body-2">Generating QR code...</p>
            </div>
            <div v-else-if="qrCodeError" class="text-center py-4">
              <v-icon size="64" color="error">mdi-alert-circle</v-icon>
              <p class="mt-3 text-body-2 text-error">{{ qrCodeError }}</p>
              <v-btn
                color="primary"
                variant="outlined"
                size="small"
                class="mt-2"
                @click="loadQrCode"
              >
                Retry
              </v-btn>
            </div>
            <div v-else-if="qrCodeImageUrl" class="text-center">
              <div class="qr-code-wrapper mb-3">
                <img
                  :src="qrCodeImageUrl"
                  alt="Booking QR Code"
                  class="booking-qr-code"
                />
              </div>
              <p class="text-body-2 mb-3">
                Show this QR code at the venue for verification
              </p>
              <div class="d-flex justify-center gap-2">
                <v-btn
                  color="primary"
                  variant="outlined"
                  size="small"
                  prepend-icon="mdi-download"
                  @click="downloadQrCode"
                >
                  Download
                </v-btn>
                <v-btn
                  color="primary"
                  variant="outlined"
                  size="small"
                  prepend-icon="mdi-content-copy"
                  @click="copyQrCodeData"
                >
                  Copy Code
                </v-btn>
              </div>
            </div>
          </v-card>
        </div>

        <!-- Resend Confirmation Email (Approved Bookings Only) -->
        <div class="detail-section mb-4" v-if="isApprovedBooking">
          <h4 class="detail-section-title">
            <v-icon class="mr-2" color="primary">mdi-email</v-icon>
            Confirmation Email
          </h4>
          <v-card variant="outlined" class="pa-4">
            <div class="text-body-2 mb-3">
              Need the confirmation email again? Click below to resend it to {{ getDisplayUserEmail(booking) }}.
            </div>
            <v-btn
              color="primary"
              variant="tonal"
              prepend-icon="mdi-email-send"
              @click="resendConfirmationEmail"
              :loading="resendingEmail"
            >
              Resend Confirmation Email
            </v-btn>
          </v-card>
        </div>

        <!-- Attendance Status (Staff/Admin only, for approved bookings) -->
        <div class="detail-section mb-4" v-if="isStaffOrAdmin && (booking.approval_status === 'approved' || !isTransaction)">
          <h4 class="detail-section-title">
            <v-icon class="mr-2" color="primary">mdi-account-check</v-icon>
            Attendance Status
          </h4>
          <v-card variant="outlined" class="pa-4">
            <div class="detail-row mb-3">
              <span class="detail-label">Number of Players:</span>
              <v-chip color="primary" variant="tonal" size="small">
                <v-icon class="mr-1" size="small">mdi-account-group</v-icon>
                {{ numberOfPlayers }}
              </v-chip>
            </div>
            <div class="detail-row mb-3" v-if="booking.attendance_scan_count !== undefined">
              <span class="detail-label">Scan Count:</span>
              <v-chip :color="booking.attendance_scan_count >= numberOfPlayers ? 'success' : 'warning'" variant="tonal" size="small">
                <v-icon class="mr-1" size="small">mdi-qrcode-scan</v-icon>
                {{ booking.attendance_scan_count || 0 }} / {{ numberOfPlayers }} scanned
              </v-chip>
            </div>
            <div class="detail-row mb-3">
              <span class="detail-label">Current Status:</span>
              <v-chip
                :color="getAttendanceColor(booking.attendance_status)"
                variant="tonal"
                size="small"
              >
                <v-icon class="mr-1" size="small">{{ getAttendanceIcon(booking.attendance_status) }}</v-icon>
                {{ getAttendanceLabel(booking.attendance_status) }}
              </v-chip>
            </div>
            <v-divider class="my-3"></v-divider>
            <div class="detail-row">
              <span class="detail-label">Mark Attendance:</span>
              <div class="d-flex flex-column gap-3">
                <!-- Players Attended Input (only shown for "showed_up") -->
                <v-text-field
                  v-if="showPlayersAttendedInput"
                  v-model.number="playersAttended"
                  type="number"
                  label="How many players attended?"
                  variant="outlined"
                  density="compact"
                  prepend-inner-icon="mdi-account-multiple"
                  :min="0"
                  :max="numberOfPlayers"
                  :rules="[v => v >= 0 || 'Cannot be negative', v => v <= numberOfPlayers || `Cannot exceed ${numberOfPlayers}`]"
                  hint="Enter the number of players who attended"
                  persistent-hint
                ></v-text-field>

                <div class="d-flex flex-wrap gap-2">
                  <v-tooltip :disabled="booking.payment_status === 'paid'" location="top">
                    <template v-slot:activator="{ props: tooltipProps }">
                      <div v-bind="tooltipProps">
                        <v-btn
                          color="success"
                          :variant="booking.attendance_status === 'showed_up' ? 'flat' : 'outlined'"
                          prepend-icon="mdi-check-circle"
                          size="small"
                          @click="handleAttendanceUpdate('showed_up')"
                          :disabled="updatingAttendance || (showPlayersAttendedInput && !playersAttended) || booking.payment_status !== 'paid'"
                        >
                          Showed Up
                        </v-btn>
                      </div>
                    </template>
                    <span>Payment must be completed before marking as showed up</span>
                  </v-tooltip>
                  <v-btn
                    color="error"
                    :variant="booking.attendance_status === 'no_show' ? 'flat' : 'outlined'"
                    prepend-icon="mdi-close-circle"
                    size="small"
                    @click="handleAttendanceUpdate('no_show')"
                    :disabled="updatingAttendance"
                  >
                    No Show
                  </v-btn>
                  <v-btn
                    v-if="booking.attendance_status !== 'not_set'"
                    color="grey"
                    variant="outlined"
                    prepend-icon="mdi-refresh"
                    size="small"
                    @click="handleAttendanceUpdate('not_set')"
                    :disabled="updatingAttendance"
                  >
                    Reset
                  </v-btn>
                </div>
              </div>
            </div>
            <div class="detail-row mt-3" v-if="booking.players_attended !== null && booking.players_attended !== undefined">
              <span class="detail-label">Players Attended:</span>
              <v-chip color="info" variant="tonal" size="small">
                <v-icon class="mr-1" size="small">mdi-account-check</v-icon>
                {{ booking.players_attended }} player(s) attended
              </v-chip>
            </div>
          </v-card>
        </div>
      </v-card-text>

      <v-card-actions class="pa-4">
        <!-- Approve and Reject buttons for Admin only -->
        <template v-if="isAdmin && booking.approval_status === 'pending'">
          <v-btn
            color="success"
            variant="tonal"
            size="small"
            prepend-icon="mdi-check"
            @click="approveBooking"
            :loading="approving"
            :disabled="getBookingPaymentStatus(booking) !== 'complete'"
          >
            Approve
          </v-btn>
          <v-btn
            color="error"
            variant="tonal"
            size="small"
            prepend-icon="mdi-close"
            @click="showRejectDialog"
          >
            Reject
          </v-btn>
        </template>
        <!-- Reject button for approved bookings (Admin only) -->
        <template v-if="isAdmin && booking.approval_status === 'approved'">
          <v-btn
            color="error"
            variant="tonal"
            size="small"
            prepend-icon="mdi-close"
            @click="showRejectDialog"
          >
            Reject Approved Booking
          </v-btn>
        </template>
        <v-spacer></v-spacer>
        <v-btn
          color="primary"
          variant="text"
          @click="closeDialog"
        >
          Close
        </v-btn>
      </v-card-actions>
    </v-card>

    <!-- Proof of Payment Dialog -->
    <v-dialog
      v-model="imageDialog"
      max-width="800"
      @update:model-value="onImageDialogClose"
      :fullscreen="$vuetify.display.mobile"
    >
      <v-card>
        <v-card-title class="text-h5 dialog-title">
          <div class="d-flex align-center">
            <v-icon class="mr-2">mdi-image</v-icon>
            Proof of Payment
          </div>
        </v-card-title>

        <v-divider></v-divider>

        <v-card-text class="pa-6">
          <div class="text-center">
            <img
              :src="selectedImageUrl"
              alt="Proof of Payment"
              class="proof-of-payment-image"
              style="max-width: 100%; height: auto; border-radius: 8px; box-shadow: 0 4px 8px rgba(0,0,0,0.1);"
            />
          </div>
        </v-card-text>

        <v-divider></v-divider>

        <v-card-actions class="pa-4">
          <v-spacer></v-spacer>
          <v-btn
            color="primary"
            variant="outlined"
            prepend-icon="mdi-download"
            @click="downloadImage"
          >
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

    <!-- Delete Time Slot Dialog -->
    <v-dialog v-model="deleteTimeSlotDialog" max-width="500">
      <v-card>
        <v-card-title class="text-h5 pa-6 pb-4">
          <v-icon class="mr-2" color="error">mdi-delete-alert</v-icon>
          Delete Time Slot
        </v-card-title>
        <v-divider></v-divider>
        <v-card-text class="pa-6">
          <p class="text-body-1 mb-2">
            Are you sure you want to delete this time slot?
          </p>
          <v-card v-if="timeSlotToDelete" variant="outlined" class="pa-3 mt-3">
            <div class="d-flex align-center">
              <v-icon class="mr-2" color="primary">mdi-clock-outline</v-icon>
              <div>
                <div class="font-weight-bold">{{ timeSlotToDelete.court?.name || 'Unknown Court' }}</div>
                <div class="text-caption">
                  {{ formatTimeSlot(timeSlotToDelete.start_time) }} - {{ formatTimeSlot(timeSlotToDelete.end_time) }}
                </div>
                <div class="text-caption">
                  {{ formatBookingDate(timeSlotToDelete.booking_date) }}
                </div>
              </div>
            </div>
          </v-card>
          <v-alert type="warning" variant="tonal" class="mt-3" density="compact">
            <div class="text-caption">
              <strong>Note:</strong> This action cannot be undone. The time slot will be removed from the booking and the total price will be recalculated.
            </div>
          </v-alert>
        </v-card-text>
        <v-card-actions class="pa-6 pt-0">
          <v-spacer></v-spacer>
          <v-btn
            color="grey"
            variant="text"
            @click="deleteTimeSlotDialog = false"
          >
            Cancel
          </v-btn>
          <v-btn
            color="error"
            variant="elevated"
            @click="deleteTimeSlot"
            :loading="deletingTimeSlot"
          >
            Delete Time Slot
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
  </v-dialog>
</template>

<script>
import { computed, ref, onMounted, watch } from 'vue'
import QRCode from 'qrcode'
import api from '../services/api'
import { cartService } from '../services/cartService'
import { bookingService } from '../services/bookingService'
import { courtService } from '../services/courtService'
import { sportService } from '../services/sportService'
import { statusService } from '../services/statusService'
import { authService } from '../services/authService'
import { paymentSettingService } from '../services/paymentSettingService'
import CourtImageGallery from './CourtImageGallery.vue'
import ProofOfPaymentUpload from './ProofOfPaymentUpload.vue'

export default {
  name: 'BookingDetailsDialog',
  components: {
    CourtImageGallery,
    ProofOfPaymentUpload
  },
  props: {
    isOpen: {
      type: Boolean,
      required: true,
      default: false
    },
    booking: {
      type: Object,
      default: null
    },
    courtName: {
      type: String,
      default: ''
    },
    showAdminFeatures: {
      type: Boolean,
      default: false
    },
    showCourtImages: {
      type: Boolean,
      default: false
    }
  },
  emits: ['update:isOpen', 'close', 'attendance-updated'],
  setup(props, { emit }) {
    // Image dialog state
    const imageDialog = ref(false)
    const selectedImageUrl = ref('')
    const thumbnailUrls = ref({}) // Store blob URLs for thumbnails
    const updatingAttendance = ref(false)
    const userRole = ref(null)
    const currentUserId = ref(null)
    const playersAttended = ref(null)
    const showPlayersAttendedInput = ref(false)

    // Approve/Reject state
    const approving = ref(false)
    const rejecting = ref(false)
    const rejectDialog = ref(false)
    const rejectReason = ref('')
    const snackbar = ref({
      show: false,
      message: '',
      color: 'success'
    })

    // QR Code state
    const loadingQrCode = ref(false)
    const qrCodeError = ref('')
    const qrCodeImageUrl = ref('')
    const qrCodeData = ref('')

    // Proof of Payment Upload state
    const uploadingProof = ref(false)
    const proofFiles = ref([])

    // Court editing state
    const editingCourtItemIndex = ref(null)
    const selectedCourtId = ref(null)
    const originalCourtId = ref(null)
    const availableCourtsForItem = ref([])
    const loadingCourts = ref(false)
    const savingCourt = ref(false)

    // Date/Time editing state
    const editingDateTimeItemIndex = ref(null)
    const selectedBookingDate = ref(null)
    const selectedStartTime = ref(null)
    const selectedEndTime = ref(null)
    const originalBookingDate = ref(null)
    const originalStartTime = ref(null)
    const originalEndTime = ref(null)
    const savingDateTime = ref(false)

    // Resend confirmation email state
    const resendingEmail = ref(false)

    // Payment settings state
    const paymentSettings = ref(null)
    const loadingPaymentSettings = ref(false)

    // Delete time slot state
    const deleteTimeSlotDialog = ref(false)
    const timeSlotToDelete = ref(null)
    const timeSlotToDeleteIndex = ref(null)
    const deletingTimeSlot = ref(false)

    // Load payment settings
    const loadPaymentSettings = async () => {
      try {
        loadingPaymentSettings.value = true
        const settings = await paymentSettingService.getPaymentSettings()
        paymentSettings.value = settings
      } catch (error) {
        // Silent error handling
      } finally {
        loadingPaymentSettings.value = false
      }
    }

    // Get payment QR code URL
    const paymentQrCodeUrl = computed(() => {
      if (!paymentSettings.value?.payment_qr_code_url) {
        return null
      }
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000'
      return `${apiUrl}${paymentSettings.value.payment_qr_code_url}`
    })

    const closeDialog = () => {
      // Clean up blob URL if it exists
      if (selectedImageUrl.value && selectedImageUrl.value.startsWith('blob:')) {
        URL.revokeObjectURL(selectedImageUrl.value)
        selectedImageUrl.value = ''
      }
      // Clean up thumbnail blob URLs
      Object.values(thumbnailUrls.value).forEach(url => {
        if (url && url.startsWith('blob:')) {
          URL.revokeObjectURL(url)
        }
      })
      thumbnailUrls.value = {}
      // Reset court editing state
      editingCourtItemIndex.value = null
      selectedCourtId.value = null
      originalCourtId.value = null
      availableCourtsForItem.value = [] // Clear cached availability
      emit('update:isOpen', false)
      emit('close')
    }

    // Check if user has staff or admin role
    const isStaffOrAdmin = computed(() => {
      return userRole.value === 'staff' || userRole.value === 'admin'
    })

    // Check if user is admin
    const isAdmin = computed(() => {
      return userRole.value === 'admin'
    })

    // Check if this is a transaction (cart-based) booking
    const isTransaction = computed(() => {
      return props.booking?.isTransaction || (props.booking?.cart_items && props.booking.cart_items.length > 0)
    })

    const formatTimeSlot = (time) => {
      if (!time) return ''
      const [hours, minutes] = time.split(':')
      const hour = parseInt(hours)
      const ampm = hour >= 12 ? 'PM' : 'AM'
      const displayHour = hour % 12 || 12
      return `${displayHour}:${minutes} ${ampm}`
    }

    const formatPrice = (price) => {
      const numPrice = Math.abs(parseFloat(price || 0))
      return numPrice.toFixed(2)
    }

    const formatBookingDate = (date) => {
      if (!date) return 'Unknown'
      const d = new Date(date)
      return d.toLocaleDateString('en-US', {
        weekday: 'short',
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      })
    }

    const formatDateTime = (dateTime) => {
      if (!dateTime) return 'N/A'
      return new Date(dateTime).toLocaleString()
    }

    const getBookingDate = (booking) => {
      // Get the booking date from the first cart item or created_at
      if (booking.cart_items && booking.cart_items.length > 0) {
        return booking.cart_items[0].booking_date
      }
      return booking.created_at
    }

    const getBookingTimeRange = (booking) => {
      if (booking.cart_items && booking.cart_items.length > 0) {
        const items = booking.cart_items
        const sortedItems = [...items].sort((a, b) => a.start_time.localeCompare(b.start_time))
        const start = formatTimeSlot(sortedItems[0].start_time)
        const end = formatTimeSlot(sortedItems[sortedItems.length - 1].end_time)
        return `${start} - ${end}`
      }
      if (booking.start_time && booking.end_time) {
        return `${formatDateTime(booking.start_time)} - ${formatDateTime(booking.end_time)}`
      }
      return 'N/A'
    }

    const getTotalPrice = (booking) => {
      if (booking.cart_items && booking.cart_items.length > 0) {
        const total = booking.cart_items.reduce((sum, item) => {
          return sum + parseFloat(item.price || 0)
        }, 0)
        return total.toFixed(2)
      }
      return formatPrice(booking.total_price || 0)
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

    // Frequency helper functions
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

    // Helper functions to determine display user for admin bookings
    const isAdminBooking = (booking) => {
      if (!booking) return false
      // Check if the first cart item has booking_for_user_id or booking_for_user_name
      const firstCartItem = booking.cart_items?.[0]
      return firstCartItem && (firstCartItem.booking_for_user_id || firstCartItem.booking_for_user_name)
    }

    // Check if booking was created by an admin or staff user
    const isBookedByAdminOrStaff = (booking) => {
      if (!booking) return false
      const role = booking.user?.role?.toLowerCase()
      return role === 'admin' || role === 'staff'
    }

    const getDisplayUserName = (booking) => {
      if (!booking) return 'N/A'
      const firstCartItem = booking.cart_items?.[0]

      // If this is an admin booking, return the "booking for" user
      if (firstCartItem?.booking_for_user_name) {
        return firstCartItem.booking_for_user_name
      }

      // Otherwise, return the transaction creator
      return booking.user?.name || 'N/A'
    }

    const getDisplayUserEmail = (booking) => {
      if (!booking) return 'N/A'
      const firstCartItem = booking.cart_items?.[0]

      // If this is an admin booking with a registered user, return their email
      if (firstCartItem?.booking_for_user_id && firstCartItem?.booking_for_user) {
        return firstCartItem.booking_for_user.email || 'No email'
      }

      // If this is an admin booking for a walk-in customer, show that
      if (firstCartItem?.booking_for_user_name && !firstCartItem?.booking_for_user_id) {
        return 'Walk-in customer'
      }

      // Otherwise, return the transaction creator's email
      return booking.user?.email || 'N/A'
    }

    const getDisplayUserPhone = (booking) => {
      if (!booking) return 'N/A'
      const firstCartItem = booking.cart_items?.[0]

      // If this is an admin booking with a registered user, return their phone
      if (firstCartItem?.booking_for_user_id && firstCartItem?.booking_for_user) {
        return firstCartItem.booking_for_user.phone || 'N/A'
      }

      // If this is an admin booking for a walk-in customer, show N/A
      if (firstCartItem?.booking_for_user_name && !firstCartItem?.booking_for_user_id) {
        return 'N/A'
      }

      // Otherwise, return the transaction creator's phone
      return booking.user?.phone || 'N/A'
    }

    const getDisplayUserId = (booking) => {
      if (!booking) return 'N/A'
      const firstCartItem = booking.cart_items?.[0]

      // If this is an admin booking with a registered user, return their ID
      if (firstCartItem?.booking_for_user_id) {
        return firstCartItem.booking_for_user_id
      }

      // Otherwise, return the transaction creator's ID
      return booking.user?.id || 'N/A'
    }

    const getBookedByUserRoleColor = (booking) => {
      if (!booking) return 'info'
      const role = booking.user?.role?.toLowerCase()
      if (role === 'admin') return 'purple'
      if (role === 'staff') return 'blue'
      return 'info'
    }

    const getBookedByUserRoleIcon = (booking) => {
      if (!booking) return 'mdi-account-tie'
      const role = booking.user?.role?.toLowerCase()
      if (role === 'admin') return 'mdi-shield-crown'
      if (role === 'staff') return 'mdi-account-badge'
      return 'mdi-account-tie'
    }

    const handleAttendanceUpdate = async (status) => {
      if (!props.booking?.id) return

      // Check if payment is required for marking as showed_up
      if (status === 'showed_up' && props.booking.payment_status !== 'paid') {
        alert('Cannot mark as showed up: Payment has not been completed for this booking.')
        return
      }

      // If clicking "Showed Up", show the input field if not already shown
      if (status === 'showed_up' && !showPlayersAttendedInput.value) {
        showPlayersAttendedInput.value = true
        // Pre-fill with the current number of players or existing value
        if (!playersAttended.value) {
          playersAttended.value = props.booking.players_attended || numberOfPlayers.value
        }
        return
      }

      try {
        updatingAttendance.value = true

        const updateData = {
          attendance_status: status
        }

        // Include players_attended if marking as showed_up
        if (status === 'showed_up' && playersAttended.value !== null) {
          updateData.players_attended = playersAttended.value
        }

        await cartService.updateAttendanceStatus(props.booking.id, status, updateData.players_attended)

        // Update the booking object
        if (props.booking) {
          props.booking.attendance_status = status
          if (status === 'showed_up' && playersAttended.value !== null) {
            props.booking.players_attended = playersAttended.value
          }
        }

        // Reset the input field
        showPlayersAttendedInput.value = false
        if (status !== 'showed_up') {
          playersAttended.value = null
        }

        emit('attendance-updated', { bookingId: props.booking.id, status })
      } catch (error) {
        // Show error message to user
        if (error.response?.data?.message) {
          alert(error.response.data.message)
        } else {
          alert('Failed to update attendance status. Please try again.')
        }
      } finally {
        updatingAttendance.value = false
      }
    }

    // Helper to get proof of payment files array
    const getProofOfPaymentFiles = (proofOfPayment) => {
      if (!proofOfPayment) return []

      try {
        // Try to parse as JSON array
        const parsed = JSON.parse(proofOfPayment)
        return Array.isArray(parsed) ? parsed : [proofOfPayment]
      } catch (e) {
        // If not JSON, treat as single file
        return [proofOfPayment]
      }
    }

    // Load thumbnails with authentication
    const loadThumbnails = async () => {
      // Clean up existing blob URLs
      Object.values(thumbnailUrls.value).forEach(url => {
        if (url && url.startsWith('blob:')) {
          URL.revokeObjectURL(url)
        }
      })
      thumbnailUrls.value = {}

      const proofFiles = getProofOfPaymentFiles(props.booking?.proof_of_payment)
      if (!proofFiles.length || !props.booking?.id) return

      // Determine the correct endpoint based on whether this is a transaction or booking
      const endpoint = isTransaction.value
        ? `/cart-transactions/${props.booking.id}/proof-of-payment`
        : `/bookings/${props.booking.id}/proof-of-payment`

      // Load each thumbnail with authentication
      const newUrls = {}
      for (let i = 0; i < proofFiles.length; i++) {
        try {
          const response = await api.get(endpoint, {
            params: { index: i },
            responseType: 'blob'
          })
          const imageBlob = new Blob([response.data], { type: response.headers['content-type'] })
          newUrls[i] = URL.createObjectURL(imageBlob)
        } catch (error) {
          console.error(`Failed to load thumbnail ${i}:`, error)
          // Continue loading other thumbnails even if one fails
        }
      }
      // Update all at once to trigger reactivity
      thumbnailUrls.value = newUrls
    }

    // Get thumbnail URL for proof of payment
    const getProofThumbnailUrl = (index) => {
      // Return the blob URL if available, otherwise return empty string
      return thumbnailUrls.value[index] || ''
    }

    // Proof of payment viewing
    const viewProofOfPayment = async (index = 0) => {
      if (props.booking?.proof_of_payment) {
        try {
          // Determine the correct endpoint based on whether this is a transaction or booking
          const endpoint = isTransaction.value
            ? `/cart-transactions/${props.booking.id}/proof-of-payment`
            : `/bookings/${props.booking.id}/proof-of-payment`

          // Fetch the image as a blob with authentication
          const response = await api.get(endpoint, {
            params: { index },
            responseType: 'blob'
          })

          // Create a blob URL from the response
          const imageBlob = new Blob([response.data], { type: response.headers['content-type'] })
          selectedImageUrl.value = URL.createObjectURL(imageBlob)
          imageDialog.value = true
        } catch (error) {
          // Silent error handling
        }
      }
    }

    const downloadImage = () => {
      if (selectedImageUrl.value) {
        const link = document.createElement('a')
        link.href = selectedImageUrl.value
        link.download = `proof_of_payment_${props.booking?.id || 'booking'}.jpg`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
      }
    }

    const onImageDialogClose = (value) => {
      if (!value && selectedImageUrl.value && selectedImageUrl.value.startsWith('blob:')) {
        // Clean up blob URL when dialog is closed
        URL.revokeObjectURL(selectedImageUrl.value)
        selectedImageUrl.value = ''
      }
    }

    const handleImageError = (event) => {
      // Silent error handling
    }

    const handleQrCodeError = (event) => {
      // Silent error handling
    }

    // Calculate duration between two times
    const calculateDuration = (startTime, endTime) => {
      if (!startTime || !endTime) {
        return '0 hours'
      }
      try {
        const start = startTime.split(':')
        const end = endTime.split(':')
        const startMinutes = parseInt(start[0]) * 60 + parseInt(start[1] || 0)
        const endMinutes = parseInt(end[0]) * 60 + parseInt(end[1] || 0)
        const durationMinutes = endMinutes - startMinutes
        const hours = Math.floor(durationMinutes / 60)
        const minutes = durationMinutes % 60

        if (minutes === 0) {
          return `${hours} hour${hours !== 1 ? 's' : ''}`
        }
        return `${hours}h ${minutes}m`
      } catch (error) {
        return '0 hours'
      }
    }

    // Calculate price for a slot group (merged adjacent time slots)
    const calculateSlotGroupPrice = (slot) => {
      if (!slot || !slot.items || !Array.isArray(slot.items)) {
        return '0.00'
      }
      return slot.items.reduce((sum, item) => {
        const price = item.price || 0
        return sum + parseFloat(price)
      }, 0).toFixed(2)
    }

    // Calculate total price for a court group
    const calculateCourtGroupPrice = (group) => {
      if (!group || !group.originalItems || !Array.isArray(group.originalItems)) {
        return '0.00'
      }
      return group.originalItems.reduce((sum, item) => {
        const price = item.price || 0
        return sum + parseFloat(price)
      }, 0).toFixed(2)
    }

    // Validation function for file sizes
    const validateFileSize = (files) => {
      if (!files) return true
      const fileArray = Array.isArray(files) ? files : [files]
      return fileArray.every(file => file.size < 5242880) // 5MB
    }

    // Proof of Payment Upload functions
    const uploadProofOfPayment = async () => {
      if (isRejected.value) {
        alert('Cannot upload proof of payment: This booking/transaction has been rejected.')
        return
      }
      if (!proofFiles.value || proofFiles.value.length === 0 || !props.booking?.id) {
        return
      }

      try {
        uploadingProof.value = true

        // Convert to array if needed
        const files = Array.isArray(proofFiles.value) ? proofFiles.value : Array.from(proofFiles.value)

        // Use the existing payment_method from booking, or default to 'gcash'
        const paymentMethod = props.booking.payment_method && props.booking.payment_method !== 'pending'
          ? props.booking.payment_method
          : 'gcash'

        // Use the appropriate service based on whether this is a transaction or booking
        let response
        if (isTransaction.value) {
          // For cart transactions, use cartService
          response = await cartService.uploadProofOfPayment(
            props.booking.id,
            files,
            paymentMethod
          )
        } else {
          // For regular bookings, use bookingService
          response = await bookingService.uploadProofOfPayment(
            props.booking.id,
            files,
            paymentMethod
          )
        }

        // Update the booking object with new payment info
        if (props.booking) {
          props.booking.payment_status = 'paid'
          props.booking.payment_method = response.data.payment_method
          props.booking.proof_of_payment = response.data.proof_of_payment
          props.booking.paid_at = response.data.paid_at
        }

        // Reset upload form
        proofFiles.value = []

        // Show success message
        const wasAlreadyPaid = isAlreadyPaid.value
        const filesText = files.length > 1 ? 'Proofs' : 'Proof'
        const successMsg = wasAlreadyPaid
          ? `${filesText} uploaded successfully!`
          : `${filesText} of payment uploaded successfully! Booking is now marked as paid.`
        alert(successMsg)

        // Emit event to refresh booking list if needed
        emit('attendance-updated', { bookingId: props.booking.id, status: 'paid' })
      } catch (error) {
        alert(error.message || 'Failed to upload proof of payment. Please try again.')
      } finally {
        uploadingProof.value = false
      }
    }

    // QR Code functions
    const loadQrCode = async () => {
      if (!props.booking?.id) return

      loadingQrCode.value = true
      qrCodeError.value = ''

      try {
        // Determine the actual booking ID to use
        let bookingId = props.booking.id

        // If this is a transaction (cart-based booking), we need to get the first booking's ID
        // Transaction IDs are formatted as 'transaction_{id}', which is not a real booking PK
        if (isTransaction.value) {
          // Check if cart_transaction has bookings array
          if (props.booking.cart_transaction?.bookings && props.booking.cart_transaction.bookings.length > 0) {
            bookingId = props.booking.cart_transaction.bookings[0].id // Use first booking's PK
          } else if (props.booking.cart_items && props.booking.cart_items.length > 0) {
            // Check if cart_items have bookings relationship loaded (through cart transaction)
            const firstItem = props.booking.cart_items[0]
            if (firstItem.bookings && firstItem.bookings.length > 0) {
              bookingId = firstItem.bookings[0].id
            } else if (firstItem.booking_id) {
              // Direct booking_id on cart item (if exists)
              bookingId = firstItem.booking_id
            } else {
              qrCodeError.value = 'No booking ID found for this transaction'
              loadingQrCode.value = false
              return
            }
          } else {
            qrCodeError.value = 'No booking records found for this transaction'
            loadingQrCode.value = false
            return
          }
        }

        // Use the booking's internal ID (PK) to fetch QR code from the bookings endpoint
        const endpoint = `/bookings/${bookingId}/qr-code`

        // Fetch QR code data from API
        const response = await api.get(endpoint)
        qrCodeData.value = response.data.data.qr_code

        // Generate QR code image
        const dataUrl = await QRCode.toDataURL(qrCodeData.value, {
          width: 256,
          margin: 2,
          color: {
            dark: '#000000',
            light: '#FFFFFF'
          }
        })
        qrCodeImageUrl.value = dataUrl
      } catch (error) {
        qrCodeError.value = error.response?.data?.message || 'Failed to generate QR code'
      } finally {
        loadingQrCode.value = false
      }
    }

    const downloadQrCode = () => {
      if (qrCodeImageUrl.value) {
        const link = document.createElement('a')
        link.download = `booking-${props.booking?.id || 'qr-code'}.png`
        link.href = qrCodeImageUrl.value
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
      }
    }

    const copyQrCodeData = async () => {
      if (qrCodeData.value) {
        try {
          await navigator.clipboard.writeText(qrCodeData.value)
          // Successfully copied (you could show a snackbar here if needed)
        } catch (error) {
          // Silent error handling
        }
      }
    }

    // Show snackbar helper
    const showSnackbar = (message, color = 'success') => {
      snackbar.value = {
        show: true,
        message,
        color
      }
    }

    // Approve booking method
    const approveBooking = async () => {
      if (!props.booking?.id) return

      try {
        approving.value = true

        // Validate payment requirements before approval
        const hasPaymentMethod = props.booking.payment_method && props.booking.payment_method.trim() !== ''
        const hasProofOfPayment = props.booking.proof_of_payment && props.booking.proof_of_payment.trim() !== ''

        if (!hasPaymentMethod) {
          showSnackbar('Cannot approve transaction: Payment method is missing. Please ensure the user has selected GCash as payment method.', 'error')
          return
        }

        if (!hasProofOfPayment) {
          showSnackbar('Cannot approve transaction: Proof of payment is missing. Please ensure the user has uploaded a screenshot of their GCash payment confirmation.', 'error')
          return
        }

        // Approve cart transaction
        await cartService.approveTransaction(props.booking.id)
        showSnackbar('Transaction approved successfully', 'success')

        // Update the booking object
        if (props.booking) {
          props.booking.approval_status = 'approved'
        }

        // Dispatch event to refresh other components
        window.dispatchEvent(new CustomEvent('booking-updated'))

        // Emit event to parent
        emit('attendance-updated', { bookingId: props.booking.id, status: 'approved' })

        // Close dialog after successful approval
        setTimeout(() => {
          closeDialog()
        }, 1500)
      } catch (error) {
        showSnackbar('Failed to approve booking', 'error')
      } finally {
        approving.value = false
      }
    }

    // Show reject dialog
    const showRejectDialogFunc = () => {
      rejectReason.value = ''
      rejectDialog.value = true
    }

    // Confirm reject method
    const confirmReject = async () => {
      if (!props.booking?.id) return

      try {
        rejecting.value = true
        // Reject cart transaction
        await cartService.rejectTransaction(props.booking.id, rejectReason.value)
        showSnackbar('Transaction rejected successfully', 'success')
        rejectDialog.value = false

        // Update the booking object
        if (props.booking) {
          props.booking.approval_status = 'rejected'
        }

        // Dispatch event to refresh other components
        window.dispatchEvent(new CustomEvent('booking-updated'))

        // Emit event to parent
        emit('attendance-updated', { bookingId: props.booking.id, status: 'rejected' })

        // Close dialog after successful rejection
        setTimeout(() => {
          closeDialog()
        }, 1500)
      } catch (error) {
        showSnackbar('Failed to reject transaction', 'error')
      } finally {
        rejecting.value = false
      }
    }

    // Court editing methods
    const loadAvailableCourtsForItem = async (cartItemId) => {
      try {
        loadingCourts.value = true
        // Fetch courts with availability info for this specific cart item
        const response = await api.get(`/admin/cart-items/${cartItemId}/available-courts`)
        availableCourtsForItem.value = response.data.data
      } catch (error) {
        showSnackbar('Failed to load available courts', 'error')
        // Fallback to loading all courts without availability info
        try {
          const courtsData = await courtService.getCourts()
          availableCourtsForItem.value = courtsData.filter(court => court.is_active).map(court => ({
            ...court,
            is_available: true // Assume available if we can't check
          }))
        } catch (fallbackError) {
          // Silent error handling
        }
      } finally {
        loadingCourts.value = false
      }
    }

    const startCartItemCourtEdit = async (item) => {
      // Load courts with availability info for this cart item
      await loadAvailableCourtsForItem(item.id)

      // Set current court ID from cart item
      selectedCourtId.value = item.court?.id || item.court_id
      originalCourtId.value = selectedCourtId.value
      editingCourtItemIndex.value = item.id
    }

    const cancelCourtEdit = () => {
      selectedCourtId.value = originalCourtId.value
      editingCourtItemIndex.value = null
      // Clear cached availability data
      availableCourtsForItem.value = []
    }

    const saveCartItemCourtChange = async (item) => {
      if (!selectedCourtId.value) return

      // Check if the selected court is available
      const selectedCourt = availableCourtsForItem.value.find(c => c.id === selectedCourtId.value)
      if (selectedCourt && !selectedCourt.is_available) {
        showSnackbar('Selected court is not available for this time slot', 'error')
        return
      }

      try {
        savingCourt.value = true

        // Update the cart item via the API
        const response = await api.put(`/admin/cart-items/${item.id}`, {
          court_id: selectedCourtId.value
        })

        // Update the cart item object with fresh data from the server
        if (response.data.success && response.data.data) {
          // Update the item with fresh data from the server
          Object.assign(item, {
            court_id: response.data.data.court_id,
            court: response.data.data.court
          })

          // Also update in the booking.cart_items array if it exists
          if (props.booking?.cart_items) {
            const cartItemIndex = props.booking.cart_items.findIndex(ci => ci.id === item.id)
            if (cartItemIndex !== -1) {
              props.booking.cart_items[cartItemIndex] = {
                ...props.booking.cart_items[cartItemIndex],
                court_id: response.data.data.court_id,
                court: response.data.data.court
              }
            }
          }
        } else if (selectedCourt) {
          // Fallback: use the court from available courts list
          const newCourtData = {
            id: selectedCourt.id,
            name: selectedCourt.name,
            surface_type: selectedCourt.surface_type
          }
          item.court = newCourtData
          item.court_id = selectedCourtId.value

          // Also update in booking.cart_items
          if (props.booking?.cart_items) {
            const cartItemIndex = props.booking.cart_items.findIndex(ci => ci.id === item.id)
            if (cartItemIndex !== -1) {
              props.booking.cart_items[cartItemIndex].court = newCourtData
              props.booking.cart_items[cartItemIndex].court_id = selectedCourtId.value
            }
          }
        }

        // Update originalCourtId to new value
        originalCourtId.value = selectedCourtId.value
        editingCourtItemIndex.value = null

        // Clear cached availability data to force fresh fetch on next edit
        availableCourtsForItem.value = []

        showSnackbar('Court updated successfully', 'success')

        // Dispatch event to refresh other components
        window.dispatchEvent(new CustomEvent('booking-updated'))

        // Emit event to parent
        emit('attendance-updated', { bookingId: props.booking.id, status: 'court_updated' })
      } catch (error) {
        const errorMessage = error.response?.data?.message || error.message || 'Failed to update court'
        showSnackbar(errorMessage, 'error')
      } finally {
        savingCourt.value = false
      }
    }

    // Computed property to check if court was changed
    const courtChanged = computed(() => {
      return selectedCourtId.value !== originalCourtId.value
    })

    // Computed property to check if date/time was changed
    const dateTimeChanged = computed(() => {
      return selectedBookingDate.value !== originalBookingDate.value ||
             selectedStartTime.value !== originalStartTime.value ||
             selectedEndTime.value !== originalEndTime.value
    })

    // Date/Time editing methods
    const startCartItemDateTimeEdit = (item) => {
      // Set current values from cart item
      const bookingDate = item.booking_date ? new Date(item.booking_date) : null
      selectedBookingDate.value = bookingDate ? bookingDate.toISOString().split('T')[0] : ''
      selectedStartTime.value = item.start_time || ''
      selectedEndTime.value = item.end_time || ''

      // Store originals
      originalBookingDate.value = selectedBookingDate.value
      originalStartTime.value = selectedStartTime.value
      originalEndTime.value = selectedEndTime.value

      editingDateTimeItemIndex.value = item.id
    }

    const cancelDateTimeEdit = () => {
      selectedBookingDate.value = originalBookingDate.value
      selectedStartTime.value = originalStartTime.value
      selectedEndTime.value = originalEndTime.value
      editingDateTimeItemIndex.value = null
    }

    const saveCartItemDateTimeChange = async (item) => {
      if (!selectedBookingDate.value || !selectedStartTime.value || !selectedEndTime.value) {
        showSnackbar('Please fill in all date and time fields', 'error')
        return
      }

      try {
        savingDateTime.value = true

        // Prepare the update data
        const updateData = {
          booking_date: selectedBookingDate.value,
          start_time: selectedStartTime.value,
          end_time: selectedEndTime.value
        }

        // Update the cart item via the cartService
        const response = await cartService.updateCartItem(item.id, updateData)

        // Update the cart item object with fresh data from the server
        if (response.success && response.data) {
          // Update the item with fresh data from the server
          Object.assign(item, {
            booking_date: response.data.booking_date,
            start_time: response.data.start_time,
            end_time: response.data.end_time
          })

          // Also update in the booking.cart_items array if it exists
          if (props.booking?.cart_items) {
            const cartItemIndex = props.booking.cart_items.findIndex(ci => ci.id === item.id)
            if (cartItemIndex !== -1) {
              props.booking.cart_items[cartItemIndex] = {
                ...props.booking.cart_items[cartItemIndex],
                booking_date: response.data.booking_date,
                start_time: response.data.start_time,
                end_time: response.data.end_time
              }
            }
          }
        }

        // Update originals to new values
        originalBookingDate.value = selectedBookingDate.value
        originalStartTime.value = selectedStartTime.value
        originalEndTime.value = selectedEndTime.value
        editingDateTimeItemIndex.value = null

        showSnackbar('Date and time updated successfully', 'success')

        // Dispatch event to refresh other components
        window.dispatchEvent(new CustomEvent('booking-updated'))

        // Emit event to parent
        emit('attendance-updated', { bookingId: props.booking.id, status: 'datetime_updated' })
      } catch (error) {
        const errorMessage = error.message || 'Failed to update date and time'
        showSnackbar(errorMessage, 'error')
      } finally {
        savingDateTime.value = false
      }
    }

    // Delete time slot methods
    const confirmDeleteTimeSlot = (item) => {
      timeSlotToDelete.value = item
      timeSlotToDeleteIndex.value = null // Not needed anymore, but kept for compatibility
      deleteTimeSlotDialog.value = true
    }

    const deleteTimeSlot = async () => {
      if (!timeSlotToDelete.value) return

      // Check if this is the last item
      if (props.booking?.cart_items?.length <= 1) {
        showSnackbar('Cannot delete the last time slot. Delete the entire booking instead.', 'error')
        deleteTimeSlotDialog.value = false
        return
      }

      try {
        deletingTimeSlot.value = true

        // Delete the cart item via API
        await api.delete(`/admin/cart-items/${timeSlotToDelete.value.id}`)

        // Remove the item from the local cart_items array
        if (props.booking?.cart_items) {
          const itemIndex = props.booking.cart_items.findIndex(ci => ci.id === timeSlotToDelete.value.id)
          if (itemIndex !== -1) {
            props.booking.cart_items.splice(itemIndex, 1)
          }

          // Recalculate total price
          const newTotal = props.booking.cart_items.reduce((sum, item) => {
            return sum + parseFloat(item.price || 0)
          }, 0)

          // Update the booking total if it exists
          if (props.booking.total_price !== undefined) {
            props.booking.total_price = newTotal.toFixed(2)
          }
        }

        showSnackbar('Time slot deleted successfully', 'success')
        deleteTimeSlotDialog.value = false
        timeSlotToDelete.value = null
        timeSlotToDeleteIndex.value = null

        // Dispatch event to refresh other components
        window.dispatchEvent(new CustomEvent('booking-updated'))

        // Emit event to parent
        emit('attendance-updated', { bookingId: props.booking.id, status: 'time_slot_deleted' })
      } catch (error) {
        const errorMessage = error.response?.data?.message || error.message || 'Failed to delete time slot'
        showSnackbar(errorMessage, 'error')
      } finally {
        deletingTimeSlot.value = false
      }
    }

    // Resend confirmation email method
    const resendConfirmationEmail = async () => {
      if (!props.booking?.id) return

      try {
        resendingEmail.value = true

        // Determine if this is a transaction or regular booking and use appropriate service
        let response
        if (isTransaction.value) {
          response = await cartService.resendConfirmationEmail(props.booking.id)
        } else {
          response = await bookingService.resendConfirmationEmail(props.booking.id)
        }

        showSnackbar(response.message || 'Confirmation email sent successfully', 'success')
      } catch (error) {
        showSnackbar(error.message || 'Failed to send confirmation email', 'error')
      } finally {
        resendingEmail.value = false
      }
    }

    // Computed properties
    const isApprovedBooking = computed(() => {
      if (!props.booking) return false
      const status = props.booking.approval_status || props.booking.status || ''
      return status.toLowerCase() === 'approved'
    })

    const isRejected = computed(() => {
      if (!props.booking) return false
      const status = (props.booking.approval_status || props.booking.status || '').toLowerCase()
      return status === 'rejected'
    })

    const isPendingStatus = computed(() => {
      if (!props.booking) return false
      const status = (props.booking.approval_status || props.booking.status || '').toLowerCase()
      return status === 'pending'
    })

    const rejectionReason = computed(() => {
      if (!props.booking) return ''
      // Transaction-based (cart) view: backend stores rejection reason on transaction
      if (isTransaction.value) {
        return props.booking.rejection_reason || ''
      }
      // Regular booking: reason appended in notes as "Rejection reason: ..."
      const notes = props.booking.notes || ''
      const marker = 'Rejection reason:'
      if (!notes.toLowerCase().includes(marker.toLowerCase())) return ''
      // Extract text after marker
      const idx = notes.toLowerCase().indexOf(marker.toLowerCase())
      return notes.substring(idx + marker.length).trim()
    })

    // Whether booking is already paid
    const isAlreadyPaid = computed(() => {
      return (props.booking?.payment_status || '').toLowerCase() === 'paid'
    })

    // Upload button label varies based on payment status and selected files
    const uploadButtonLabel = computed(() => {
      const count = Array.isArray(proofFiles.value) ? proofFiles.value.length : (proofFiles.value ? 1 : 0)
      const countText = count > 1 ? `${count} Files` : (count === 1 ? '1 File' : '')
      const suffix = isAlreadyPaid.value ? '' : ' and Mark as Paid'
      return `Upload${countText ? ' ' + countText : ''}${suffix}`
    })

    const numberOfPlayers = computed(() => {
      if (!props.booking) return 1
      // For transactions, get from first cart item; for regular bookings, get from booking itself
      return props.booking.cart_items?.[0]?.number_of_players || props.booking.number_of_players || 1
    })

    const formattedDate = computed(() => {
      if (!props.booking) return ''
      return formatBookingDate(getBookingDate(props.booking))
    })

    const formattedTimeRange = computed(() => {
      if (!props.booking) return ''
      return getBookingTimeRange(props.booking)
    })

    // Adjacent time sensitive time ranges
    const adjacentTimeRanges = computed(() => {
      if (!props.booking || !props.booking.cart_items || props.booking.cart_items.length === 0) {
        return []
      }

      const items = props.booking.cart_items

      // Remove duplicates and sort by start time
      const uniqueSlots = []
      const seenSlots = new Set()
      items.forEach(item => {
        const key = `${item.start_time}-${item.end_time}`
        if (!seenSlots.has(key)) {
          seenSlots.add(key)
          uniqueSlots.push({
            start: item.start_time,
            end: item.end_time
          })
        }
      })
      uniqueSlots.sort((a, b) => a.start.localeCompare(b.start))

      // Group consecutive/adjacent slots
      const timeRanges = []
      let currentRange = null
      let currentSlots = []

      uniqueSlots.forEach(slot => {
        if (!currentRange) {
          // Start a new range
          currentRange = {
            start: slot.start,
            end: slot.end
          }
          currentSlots = [slot]
        } else if (currentRange.end === slot.start) {
          // Slot is consecutive (end of current range matches start of this slot)
          currentRange.end = slot.end
          currentSlots.push(slot)
        } else {
          // Gap detected, save current range and start new one
          timeRanges.push({
            ...currentRange,
            slotCount: currentSlots.length
          })
          currentRange = {
            start: slot.start,
            end: slot.end
          }
          currentSlots = [slot]
        }
      })

      // Add the last range
      if (currentRange) {
        timeRanges.push({
          ...currentRange,
          slotCount: currentSlots.length
        })
      }

      return timeRanges
    })

    // Group cart items by court, then merge adjacent time slots within each date
    const groupedCartItems = computed(() => {
      if (!props.booking || !props.booking.cart_items || props.booking.cart_items.length === 0) {
        return []
      }

      // Sort items by court, date, and start time
      const itemsCopy = [...props.booking.cart_items].sort((a, b) => {
        if (!a.court || !b.court) return 0
        if (a.court.id !== b.court.id) return a.court.id - b.court.id
        const dateA = a.booking_date || a.date
        const dateB = b.booking_date || b.date
        if (dateA !== dateB) return dateA.localeCompare(dateB)
        return a.start_time.localeCompare(b.start_time)
      })

      // Group by court first
      const courtGroups = new Map()

      itemsCopy.forEach(item => {
        if (!item || !item.court) return

        const courtId = item.court.id
        if (!courtGroups.has(courtId)) {
          courtGroups.set(courtId, {
            court: item.court,
            sport: item.sport || item.court.sport,
            items: []
          })
        }
        courtGroups.get(courtId).items.push(item)
      })

      // Process each court group to merge adjacent time slots
      const groups = []
      let groupIdCounter = 0

      courtGroups.forEach(courtGroup => {
        // Group by date and merge adjacent time slots
        const dateSlots = new Map()

        courtGroup.items.forEach(item => {
          const itemDate = item.booking_date || item.date

          if (!dateSlots.has(itemDate)) {
            dateSlots.set(itemDate, [])
          }
          dateSlots.get(itemDate).push(item)
        })

        // Merge adjacent time slots within each date
        const timeSlotGroups = []

        dateSlots.forEach((items, date) => {
          let currentSlot = null

          items.forEach(item => {
            if (!currentSlot) {
              currentSlot = {
                date: date,
                startTime: item.start_time,
                endTime: item.end_time,
                items: [item]
              }
            } else {
              // Check if this slot is adjacent to the current one
              if (item.start_time === currentSlot.endTime) {
                // Merge adjacent slots
                currentSlot.endTime = item.end_time
                currentSlot.items.push(item)
              } else {
                // Non-adjacent, save current and start new
                timeSlotGroups.push(currentSlot)
                currentSlot = {
                  date: date,
                  startTime: item.start_time,
                  endTime: item.end_time,
                  items: [item]
                }
              }
            }
          })

          // Add the last slot for this date
          if (currentSlot) {
            timeSlotGroups.push(currentSlot)
          }
        })

        // Create a group for each court with its time slots
        groups.push({
          id: `court-${courtGroup.court.id}-${groupIdCounter++}`,
          court: courtGroup.court,
          sport: courtGroup.sport,
          timeSlots: timeSlotGroups,
          originalItems: courtGroup.items
        })
      })

      return groups
    })

    const totalPrice = computed(() => {
      if (!props.booking) return '0.00'
      return getTotalPrice(props.booking)
    })

    const formattedCreatedAt = computed(() => {
      if (!props.booking) return ''
      return formatBookingDate(props.booking.created_at)
    })

    const bookingStatus = computed(() => {
      if (!props.booking) return ''
      return props.booking.approval_status || props.booking.status || 'Unknown'
    })

    const statusColor = computed(() => {
      return statusService.getStatusColor(bookingStatus.value)
    })

    // Fetch user role and ID on mount
    onMounted(async () => {
      try {
        const user = await authService.getUser()
        userRole.value = user.role
        currentUserId.value = user.id
      } catch (error) {
        userRole.value = 'user' // Default to 'user' role if fetch fails
        currentUserId.value = null
      }
    })

    // Watch for booking changes to load QR code when dialog opens with approved booking
    watch(
      () => props.isOpen,
      (isOpen) => {
        if (isOpen && props.booking) {
          // Reset QR code state when opening
          qrCodeImageUrl.value = ''
          qrCodeData.value = ''
          qrCodeError.value = ''

          // Load payment settings for payment QR code
          loadPaymentSettings()

          // Load QR code if booking is approved
          if (isApprovedBooking.value) {
            loadQrCode()
          }

          // Load proof of payment thumbnails with authentication
          if (props.booking.proof_of_payment) {
            loadThumbnails()
          }
        }
      },
      { immediate: true }
    )

    // Watch for changes in proof_of_payment to reload thumbnails
    watch(
      () => props.booking?.proof_of_payment,
      (newProof) => {
        if (newProof && props.isOpen) {
          loadThumbnails()
        }
      }
    )

    return {
      // Upload helpers
      isAlreadyPaid,
      uploadButtonLabel,
      // State
      imageDialog,
      selectedImageUrl,
      updatingAttendance,
      currentUserId,
      playersAttended,
      showPlayersAttendedInput,
      isTransaction,
      isStaffOrAdmin,
      isAdmin,
      // Approve/Reject state
      approving,
      rejecting,
      rejectDialog,
      rejectReason,
      snackbar,
      // QR Code state
      loadingQrCode,
      qrCodeError,
      qrCodeImageUrl,
      qrCodeData,
      // Rejection state
      isRejected,
      isPendingStatus,
      rejectionReason,
      // Proof of Payment Upload state
      uploadingProof,
      proofFiles,
      // Court editing state
      editingCourtItemIndex,
      selectedCourtId,
      originalCourtId,
      availableCourtsForItem,
      loadingCourts,
      savingCourt,
      courtChanged,
      // Date/Time editing state
      editingDateTimeItemIndex,
      selectedBookingDate,
      selectedStartTime,
      selectedEndTime,
      originalBookingDate,
      originalStartTime,
      originalEndTime,
      savingDateTime,
      dateTimeChanged,
      // Resend confirmation email state
      resendingEmail,
      // Delete time slot state
      deleteTimeSlotDialog,
      timeSlotToDelete,
      timeSlotToDeleteIndex,
      deletingTimeSlot,
      // Methods
      closeDialog,
      formatTimeSlot,
      formatPrice,
      formatBookingDate,
      handleAttendanceUpdate,
      viewProofOfPayment,
      downloadImage,
      onImageDialogClose,
      handleImageError,
      handleQrCodeError,
      // Payment settings
      paymentSettings,
      loadingPaymentSettings,
      paymentQrCodeUrl,
      // Proof of Payment Upload methods
      validateFileSize,
      uploadProofOfPayment,
      getProofOfPaymentFiles,
      getProofThumbnailUrl,
      // QR Code methods
      loadQrCode,
      downloadQrCode,
      copyQrCodeData,
      // Approve/Reject methods
      showSnackbar,
      approveBooking,
      showRejectDialog: showRejectDialogFunc,
      confirmReject,
      getBookingPaymentStatus,
      // Court editing methods
      loadAvailableCourtsForItem,
      startCartItemCourtEdit,
      cancelCourtEdit,
      saveCartItemCourtChange,
      // Date/Time editing methods
      startCartItemDateTimeEdit,
      cancelDateTimeEdit,
      saveCartItemDateTimeChange,
      // Delete time slot methods
      confirmDeleteTimeSlot,
      deleteTimeSlot,
      // Resend confirmation email method
      resendConfirmationEmail,
      // Payment status helpers
      getPaymentStatusColor,
      getPaymentStatusText,
      getPaymentStatusIcon,
      // Frequency helpers
      formatFrequencyType,
      getFrequencyColor,
      getDayName,
      // Attendance helpers
      getAttendanceColor,
      getAttendanceIcon,
      getAttendanceLabel,
      // Admin booking display helpers
      isAdminBooking,
      isBookedByAdminOrStaff,
      getDisplayUserName,
      getDisplayUserEmail,
      getDisplayUserPhone,
      getDisplayUserId,
      getBookedByUserRoleColor,
      getBookedByUserRoleIcon,
      // Computed
      isApprovedBooking,
      formattedDate,
      formattedTimeRange,
      adjacentTimeRanges,
      groupedCartItems,
      totalPrice,
      formattedCreatedAt,
      bookingStatus,
      statusColor,
      numberOfPlayers,
      // Helper functions
      calculateDuration,
      calculateSlotGroupPrice,
      calculateCourtGroupPrice,
      // Services
      sportService,
      statusService,
      courtService
    }
  }
}
</script>

<style scoped>
/* Booking View Dialog Styles */
.booking-view-dialog .dialog-title {
  background: linear-gradient(135deg, #1976d2 0%, #1565c0 100%);
  color: white !important;
  padding: 20px 24px;
  font-weight: 600;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

/* Overall Time Range */
.overall-time-range {
  border-left: 4px solid #1976d2;
  background: linear-gradient(135deg, rgba(25, 118, 210, 0.08) 0%, rgba(25, 118, 210, 0.04) 100%);
}

.booking-view-dialog .dialog-title .v-icon {
  color: white !important;
}

.booking-view-dialog .dialog-title .v-btn {
  color: white !important;
}

.booking-view-dialog .detail-section-title {
  font-size: 18px;
  font-weight: 600;
  color: #1976d2;
  margin-bottom: 12px;
  display: flex;
  align-items: center;
}

.booking-view-dialog .detail-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
}

.booking-view-dialog .detail-label {
  font-weight: 600;
  color: #64748b;
  font-size: 14px;
}

.booking-view-dialog .detail-value {
  color: #1f2937;
  font-size: 14px;
  text-align: right;
}

.detail-section {
  margin-bottom: 16px;
}

/* Proof of Payment Image */
.proof-of-payment-image {
  max-width: 100%;
  height: auto;
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0,0,0,0.1);
}

/* QR Code Styles */
.qr-code-wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 20px;
  background: linear-gradient(135deg, #f5f5f5 0%, #e0e0e0 100%);
  border-radius: 16px;
  box-shadow: inset 0 2px 4px rgba(0,0,0,0.1);
}

.booking-qr-code {
  max-width: 256px;
  height: auto;
  border-radius: 8px;
  background: white;
  padding: 12px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
}

/* Pricing Breakdown Styles */
.pricing-breakdown {
  margin-top: 16px;
}

.pricing-breakdown .v-card {
  transition: all 0.3s ease;
}

.pricing-breakdown .v-card:hover {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.12);
  transform: translateY(-2px);
}

/* Utility Classes */
.gap-1 {
  gap: 4px;
}

.gap-2 {
  gap: 8px;
}

/* Payment QR Code Styles */
.payment-qr-section {
  margin-bottom: 16px;
}

.qr-payment-wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 16px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.payment-qr-code {
  max-width: 200px;
  height: auto;
  display: block;
}

/* Proof of Payment Thumbnail Styles */
.proof-thumbnail-card {
  cursor: pointer;
  transition: all 0.3s ease;
  border-radius: 8px;
  overflow: hidden;
}

.proof-thumbnail-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2) !important;
}

.proof-thumbnail {
  border-radius: 8px 8px 0 0;
}

/* Court selector styles */
.court-selector {
  min-width: 250px;
}

.court-selector .v-select {
  font-size: 14px;
}

/* Mobile Responsive Design */
@media (max-width: 960px) {
  .booking-view-dialog .v-card {
    border-radius: 0;
  }

  .booking-view-dialog .dialog-title {
    padding: 16px;
    font-size: 1.25rem;
  }

  .booking-view-dialog .dialog-title .v-icon {
    font-size: 24px;
  }

  .booking-view-dialog .detail-section-title {
    font-size: 16px;
  }

  .booking-view-dialog .v-card-text {
    padding: 16px !important;
  }

  .booking-view-dialog .detail-section {
    margin-bottom: 16px;
  }

  .booking-view-dialog .pa-4 {
    padding: 12px !important;
  }

  .booking-view-dialog .pa-6 {
    padding: 16px !important;
  }
}

@media (max-width: 600px) {
  .booking-view-dialog .detail-row {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
    padding: 12px 0;
  }

  .booking-view-dialog .detail-label {
    font-size: 13px;
    font-weight: 700;
    color: #475569;
  }

  .booking-view-dialog .detail-value {
    text-align: left;
    font-size: 14px;
    font-weight: 500;
    word-break: break-word;
  }

  .booking-view-dialog .dialog-title {
    padding: 12px 16px;
  }

  .booking-view-dialog .dialog-title .d-flex {
    font-size: 1.1rem;
  }

  .booking-view-dialog .v-card-text {
    padding: 12px !important;
  }

  .booking-view-dialog .detail-section {
    margin-bottom: 12px;
  }

  .booking-view-dialog .v-card.pa-4 {
    padding: 12px !important;
  }

  .booking-view-dialog .detail-section-title {
    font-size: 15px;
    margin-bottom: 10px;
  }

  /* QR Code mobile optimization */
  .qr-code-wrapper {
    padding: 12px;
  }

  .booking-qr-code {
    max-width: 200px;
    padding: 8px;
  }

  /* Payment QR Code mobile optimization */
  .qr-payment-wrapper {
    padding: 12px;
  }

  .payment-qr-code {
    max-width: 160px;
  }

  /* Proof thumbnail mobile optimization */
  .proof-thumbnail-card {
    flex: 0 0 80px;
  }

  .proof-thumbnail {
    height: 80px !important;
    width: 80px !important;
  }

  /* Button adjustments for mobile */
  .booking-view-dialog .v-btn {
    min-width: auto;
  }

  .booking-view-dialog .v-card-actions {
    padding: 12px 16px !important;
  }

  .booking-view-dialog .v-card-actions .v-btn {
    padding: 8px 16px !important;
  }

  /* Chip sizing for mobile */
  .booking-view-dialog .v-chip {
    font-size: 0.75rem;
    height: auto;
    padding: 4px 8px;
  }

  /* File input on mobile */
  .booking-view-dialog .v-file-input {
    font-size: 14px;
  }

  /* Images on mobile */
  .booking-view-dialog .v-img {
    max-height: 250px !important;
  }

  /* List items on mobile */
  .booking-view-dialog .v-list-item {
    padding: 8px 0 !important;
  }

  .booking-view-dialog .v-list-item-title {
    font-size: 14px;
  }

  .booking-view-dialog .v-list-item-subtitle {
    font-size: 12px;
  }

  /* Attendance section mobile */
  .booking-view-dialog .d-flex.gap-2 {
    flex-direction: column;
    width: 100%;
  }

  .booking-view-dialog .d-flex.gap-2 .v-btn {
    width: 100% !important;
  }

  .booking-view-dialog .d-flex.gap-3 {
    gap: 12px;
  }

  /* Alert text sizing */
  .booking-view-dialog .v-alert {
    font-size: 13px;
  }

  .booking-view-dialog .text-caption {
    font-size: 11px;
  }

  /* Text field improvements */
  .booking-view-dialog .v-text-field {
    font-size: 14px;
  }
}

@media (max-width: 400px) {
  .booking-view-dialog .dialog-title {
    padding: 10px 12px;
  }

  .booking-view-dialog .dialog-title .d-flex {
    font-size: 1rem;
  }

  .booking-view-dialog .v-card-text {
    padding: 8px !important;
  }

  .booking-view-dialog .detail-section {
    margin-bottom: 10px;
  }

  .booking-view-dialog .v-card.pa-4 {
    padding: 8px !important;
  }

  .booking-view-dialog .detail-row {
    padding: 8px 0;
  }

  .booking-view-dialog .detail-label {
    font-size: 12px;
  }

  .booking-view-dialog .detail-value {
    font-size: 13px;
  }

  .booking-view-dialog .detail-section-title {
    font-size: 14px;
    margin-bottom: 8px;
  }

  .qr-code-wrapper {
    padding: 8px;
  }

  .booking-qr-code {
    max-width: 180px;
    padding: 6px;
  }

  /* Payment QR Code extra small screens */
  .qr-payment-wrapper {
    padding: 8px;
  }

  .payment-qr-code {
    max-width: 140px;
  }

  /* Proof thumbnail extra small screens */
  .proof-thumbnail-card {
    flex: 0 0 70px;
  }

  .proof-thumbnail {
    height: 70px !important;
    width: 70px !important;
  }

  .booking-view-dialog .v-btn {
    font-size: 13px !important;
    padding: 6px 12px !important;
  }

  .booking-view-dialog .v-chip {
    font-size: 0.7rem;
  }

  .booking-view-dialog .v-list-item-title {
    font-size: 13px;
  }

  .booking-view-dialog .v-list-item-subtitle {
    font-size: 11px;
  }
}

/* Time Slots List */
.time-slots-list {
  background: #f8fafc;
  border-radius: 8px;
  padding: 8px;
  border-left: 3px solid rgb(var(--v-theme-primary));
}

.time-slot-item {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;
  padding: 4px 0;
}

/* Touch-friendly buttons */
@media (max-width: 768px) {
  .booking-view-dialog .v-btn {
    min-height: 44px;
    font-size: 14px;
  }

  .booking-view-dialog .v-btn--icon {
    min-height: 40px;
    min-width: 40px;
  }
}

/* Landscape mobile optimization */
@media (max-width: 960px) and (orientation: landscape) {
  .booking-view-dialog .v-card-text {
    max-height: calc(100vh - 120px);
    overflow-y: auto;
  }
}
</style>

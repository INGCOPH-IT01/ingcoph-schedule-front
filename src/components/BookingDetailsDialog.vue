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
                  v-if="isAdminBooking(booking)"
                  size="x-small"
                  :color="getBookedByUserRoleColor(booking)"
                  variant="tonal"
                  class="ml-2"
                >
                  <v-icon size="x-small" class="mr-1">{{ getBookedByUserRoleIcon(booking) }}</v-icon>
                  Booked by {{ booking.user?.role || 'Admin' }}
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
          </v-card>
        </div>

        <!-- Cart Items in Transaction (Admin detailed view) -->
        <div class="detail-section mb-4" v-if="isTransaction && showAdminFeatures && booking.cart_items && booking.cart_items.length > 0">
          <h4 class="detail-section-title">
            <v-icon class="mr-2" color="primary">mdi-cart</v-icon>
            Cart Items ({{ booking.cart_items.length }})
          </h4>
          <v-card variant="outlined" class="pa-4">
            <v-list>
              <v-list-item
                v-for="item in booking.cart_items"
                :key="item.id"
                class="mb-2"
              >
                <template v-slot:prepend>
                  <v-avatar :color="sportService.getSportColor(item.sport?.name)" size="40">
                    <v-icon color="white">{{ sportService.getSportIcon(item.sport?.name, item.sport?.icon) }}</v-icon>
                  </v-avatar>
                </template>
                <v-list-item-title class="font-weight-bold">
                  {{ item.court?.name || 'Unknown Court' }}
                  <span v-if="item.court?.surface_type" class="text-caption text-grey font-weight-normal ml-2">
                    (<v-icon size="12">mdi-texture-box</v-icon> {{ item.court.surface_type }})
                  </span>
                </v-list-item-title>
                <v-list-item-subtitle>
                  {{ item.sport?.name || 'Unknown Sport' }} •
                  {{ formatBookingDate(item.booking_date) }} •
                  {{ item.start_time }} - {{ item.end_time }} •
                  <strong class="text-success">₱{{ parseFloat(item.price).toFixed(2) }}</strong>
                </v-list-item-subtitle>
              </v-list-item>
            </v-list>
          </v-card>
        </div>

        <!-- Time Slots Details (Simple view for non-admin) -->
        <div class="detail-section mb-4" v-if="(!showAdminFeatures || !isTransaction) && booking.cart_items && booking.cart_items.length > 0">
          <h4 class="detail-section-title">
            <v-icon class="mr-2" color="primary">mdi-clock-outline</v-icon>
            Time Slots
          </h4>
          <v-card variant="outlined" class="pa-4">
            <v-list dense>
              <v-list-item
                v-for="(item, index) in booking.cart_items"
                :key="index"
                class="px-0"
              >
                <v-list-item-title>
                  <div class="d-flex justify-space-between align-center">
                    <span>
                      <v-icon size="small" class="mr-2">mdi-clock-outline</v-icon>
                      {{ formatTimeSlot(item.start_time) }} - {{ formatTimeSlot(item.end_time) }}
                    </span>
                    <span class="font-weight-bold">₱{{ formatPrice(item.price) }}</span>
                  </div>
                </v-list-item-title>
                <v-divider v-if="index < booking.cart_items.length - 1" class="my-2"></v-divider>
              </v-list-item>
            </v-list>
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

        <!-- Payment Information -->
        <div class="detail-section mb-4">
          <h4 class="detail-section-title">
            <v-icon class="mr-2" color="primary">mdi-cash</v-icon>
            Payment Information
          </h4>
          <v-card variant="outlined" class="pa-4">
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
                v-if="booking.payment_status !== 'paid'"
                type="warning"
                variant="tonal"
                class="mt-3"
                density="compact"
              >
                <div class="text-caption">
                  <strong>Payment Required:</strong> This booking cannot be marked as "showed up" until payment is completed.
                </div>
              </v-alert>

              <!-- Upload Proof of Payment Section (for unpaid bookings) -->
              <!-- Hidden when booking was created by a User role account, unless current user is the booking owner -->
              <v-card
                v-if="booking.payment_status !== 'paid' && showAdminFeatures && (booking.user?.role !== 'user' || booking.user?.id === currentUserId)"
                variant="outlined"
                class="mt-3 pa-3"
              >
                <h5 class="text-subtitle-2 font-weight-bold mb-3">
                  <v-icon size="small" class="mr-1">mdi-upload</v-icon>
                  Upload Proof of Payment
                </h5>

                <v-file-input
                  v-model="proofFile"
                  label="Select proof of payment"
                  accept="image/*"
                  prepend-icon="mdi-camera"
                  variant="outlined"
                  density="compact"
                  :rules="[v => !v || v.size < 5242880 || 'File size should be less than 5 MB']"
                  hint="Upload a screenshot or photo of payment receipt (max 5MB)"
                  persistent-hint
                  class="mb-2"
                  @change="handleProofFileChange"
                ></v-file-input>

                <!-- Preview uploaded image -->
                <v-img
                  v-if="proofPreviewUrl"
                  :src="proofPreviewUrl"
                  max-height="200"
                  class="mb-2 rounded"
                  cover
                ></v-img>

                <v-btn
                  color="success"
                  :loading="uploadingProof"
                  :disabled="!proofFile"
                  @click="uploadProofOfPayment"
                  block
                >
                  <v-icon start>mdi-upload</v-icon>
                  Upload and Mark as Paid
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
              <div class="detail-row">
                <span class="detail-label">Proof of Payment:</span>
                <v-btn
                  color="primary"
                  variant="outlined"
                  size="small"
                  prepend-icon="mdi-eye"
                  @click="viewProofOfPayment"
                >
                  View Attachment
                </v-btn>
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

        <!-- Notes -->
        <div class="detail-section" v-if="booking.notes">
          <h4 class="detail-section-title">
            <v-icon class="mr-2" color="primary">mdi-note-text</v-icon>
            Notes
          </h4>
          <v-card variant="outlined" class="pa-4">
            <p class="mb-0">{{ booking.notes }}</p>
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
          <v-btn icon="mdi-close" variant="text" @click="imageDialog = false"></v-btn>
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
import { sportService } from '../services/sportService'
import { statusService } from '../services/statusService'
import { authService } from '../services/authService'
import CourtImageGallery from './CourtImageGallery.vue'

export default {
  name: 'BookingDetailsDialog',
  components: {
    CourtImageGallery
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
    const proofFile = ref(null)
    const proofPreviewUrl = ref('')

    const closeDialog = () => {
      // Clean up blob URL if it exists
      if (selectedImageUrl.value && selectedImageUrl.value.startsWith('blob:')) {
        URL.revokeObjectURL(selectedImageUrl.value)
        selectedImageUrl.value = ''
      }
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
        console.error('Failed to update attendance status:', error)
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

    // Proof of payment viewing
    const viewProofOfPayment = async () => {
      if (props.booking?.proof_of_payment) {
        try {
          // Determine the correct endpoint based on whether this is a transaction or booking
          const endpoint = isTransaction.value
            ? `/cart-transactions/${props.booking.id}/proof-of-payment`
            : `/bookings/${props.booking.id}/proof-of-payment`

          // Fetch the image as a blob with authentication
          const response = await api.get(endpoint, {
            responseType: 'blob'
          })

          // Create a blob URL from the response
          const imageBlob = new Blob([response.data], { type: response.headers['content-type'] })
          selectedImageUrl.value = URL.createObjectURL(imageBlob)
          imageDialog.value = true
        } catch (error) {
          console.error('Failed to load proof of payment:', error)
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
      console.error('Image failed to load:', event)
    }

    // Proof of Payment Upload functions
    const handleProofFileChange = (event) => {
      const file = event.target?.files?.[0] || proofFile.value?.[0]
      if (file) {
        const reader = new FileReader()
        reader.onload = (e) => {
          proofPreviewUrl.value = e.target.result
        }
        reader.readAsDataURL(file)
      } else {
        proofPreviewUrl.value = ''
      }
    }

    const uploadProofOfPayment = async () => {
      if (!proofFile.value || !props.booking?.id) {
        return
      }

      try {
        uploadingProof.value = true

        const file = proofFile.value[0] || proofFile.value
        // Use the existing payment_method from booking, or default to 'gcash'
        const paymentMethod = props.booking.payment_method && props.booking.payment_method !== 'pending'
          ? props.booking.payment_method
          : 'gcash'

        const response = await bookingService.uploadProofOfPayment(
          props.booking.id,
          file,
          paymentMethod
        )

        // Update the booking object with new payment info
        if (props.booking) {
          props.booking.payment_status = 'paid'
          props.booking.payment_method = response.data.payment_method
          props.booking.proof_of_payment = response.data.proof_of_payment
          props.booking.paid_at = response.data.paid_at
        }

        // Reset upload form
        proofFile.value = null
        proofPreviewUrl.value = ''

        // Show success message
        alert('Proof of payment uploaded successfully! Booking is now marked as paid.')

        // Emit event to refresh booking list if needed
        emit('attendance-updated', { bookingId: props.booking.id, status: 'paid' })
      } catch (error) {
        console.error('Failed to upload proof of payment:', error)
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
        console.error('Failed to load QR code:', error)
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
          console.error('Failed to copy QR code data:', error)
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
        console.error('Failed to approve booking:', error)
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
        console.error('Failed to reject transaction:', error)
        showSnackbar('Failed to reject transaction', 'error')
      } finally {
        rejecting.value = false
      }
    }

    // Computed properties
    const isApprovedBooking = computed(() => {
      if (!props.booking) return false
      const status = props.booking.approval_status || props.booking.status || ''
      return status.toLowerCase() === 'approved'
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
        console.error('Failed to fetch user data:', error)
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

          // Load QR code if booking is approved
          if (isApprovedBooking.value) {
            loadQrCode()
          }
        }
      },
      { immediate: true }
    )

    return {
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
      // Proof of Payment Upload state
      uploadingProof,
      proofFile,
      proofPreviewUrl,
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
      // Proof of Payment Upload methods
      handleProofFileChange,
      uploadProofOfPayment,
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
      totalPrice,
      formattedCreatedAt,
      bookingStatus,
      statusColor,
      numberOfPlayers,
      // Services
      sportService,
      statusService
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

/* Utility Classes */
.gap-1 {
  gap: 4px;
}

.gap-2 {
  gap: 8px;
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

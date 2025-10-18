<template>
  <v-dialog
    :model-value="isOpen"
    @update:model-value="$emit('close')"
    max-width="1200px"
    persistent
    class="responsive-dialog"
  >
    <v-card class="booking-dialog">
      <!-- Header -->
      <v-card-title class="dialog-header">
        <div class="header-content">
          <v-icon size="32" class="mr-3">mdi-calendar-check</v-icon>
          <div>
            <h2 class="text-h5">Book a Court</h2>
            <p class="text-subtitle-2 text-grey">Select sport and time slot</p>
          </div>
        </div>
        <v-btn icon="mdi-close" variant="text" @click="$emit('close')"></v-btn>
      </v-card-title>

      <v-divider></v-divider>

      <!-- Stepper -->
      <v-card-text class="pa-6">
        <!-- Progress Indicator -->
        <div class="stepper-header mb-6">
          <div
            v-for="(stepName, index) in ['Sport', 'Court & Time Slot', 'Confirm']"
            :key="index"
            :class="['step-indicator', { 'active': step === index + 1, 'completed': step > index + 1 }]"
          >
            <div class="step-number">{{ index + 1 }}</div>
            <div class="step-label">{{ stepName }}</div>
          </div>
        </div>

        <v-window v-model="step" class="mb-6">
          <!-- Step 1: Select Sport -->
          <v-window-item :value="1">
            <div class="step-content">
              <h3 class="text-h6 mb-4">
                <v-icon class="mr-2" color="primary">mdi-racquetball</v-icon>
                Select a Sport
              </h3>

              <v-row>
                <v-col
                  v-for="sport in sports"
                  :key="sport.id"
                  cols="12"
                  sm="6"
                  md="3"
                >
                  <v-card
                    :class="['sport-card', { 'selected': selectedSport?.id === sport.id }]"
                    @click="selectSport(sport)"
                    hover
                  >
                    <v-icon
                      v-if="selectedSport?.id === sport.id"
                      class="selected-check-icon"
                      color="primary"
                      size="32"
                    >
                      mdi-check-circle
                    </v-icon>
                    <v-card-text class="text-center pa-4">
                      <div class="sport-icon-large"><v-icon :color="sportService.getSportColor(sport.name)">{{ sportService.getSportIcon(sport.name, sport.icon) }}</v-icon></div>
                      <h4 class="text-h6 mt-2">{{ sport.name }}</h4>
                      <p class="text-caption text-grey">{{ sport.description }}</p>
                    </v-card-text>
                  </v-card>
                </v-col>
              </v-row>

              <v-alert v-if="sports.length === 0" type="info" class="mt-4">
                No sports available. Please contact the administrator.
              </v-alert>

              <!-- Number of Players Field -->
              <v-card v-if="selectedSport" variant="outlined" class="mt-6 pa-4">
                <h4 class="text-h6 mb-4">
                  <v-icon class="mr-2" color="primary">mdi-account-multiple</v-icon>
                  Number of Players
                </h4>
                <v-text-field
                  v-model.number="numberOfPlayers"
                  type="number"
                  label="How many players?"
                  variant="outlined"
                  prepend-inner-icon="mdi-account-group"
                  :rules="[v => v >= 1 || 'At least 1 player required']"
                  persistent-hint
                  min="1"
                ></v-text-field>
              </v-card>
            </div>
          </v-window-item>

          <!-- Step 2: Select Court & Time Slot -->
          <v-window-item :value="2">
            <div class="step-content">
              <div class="d-flex align-center justify-space-between mb-4">
                <div class="d-flex align-center">
                  <v-btn icon="mdi-arrow-left" variant="text" @click="step = 1" size="small"></v-btn>
                  <h3 class="text-h6 ml-2">
                    <v-icon class="mr-2" color="primary">mdi-clock-outline</v-icon>
                    Select Court & Time Slots
                  </h3>
                </div>
                <v-chip color="success" v-if="totalBookings > 0">
                  {{ totalBookings }} slot(s) selected
                </v-chip>
              </div>

              <!-- Selected Sport Info -->
              <v-card variant="tonal" color="primary" class="mb-4" v-if="selectedSport">
                <v-card-text class="pa-4">
                  <div class="d-flex align-center justify-space-between">
                    <div class="d-flex align-center">
                      <v-icon size="32" class="mr-3">{{ sportService.getSportIcon(selectedSport.name, selectedSport.icon) }}</v-icon>
                      <div>
                        <h4 class="text-h6">{{ selectedSport.name }} Courts</h4>
                        <p class="text-caption mb-0">{{ selectedSport.description }}</p>
                      </div>
                    </div>
                    <v-chip color="white" size="large">
                      {{ filteredCourts.length }} court(s) available
                    </v-chip>
                  </div>
                </v-card-text>
              </v-card>

              <!-- Date Selection -->
              <v-row class="mb-4">
                <v-col cols="12" md="6">
                  <v-text-field
                    v-model="selectedDate"
                    type="date"
                    label="Select Date"
                    variant="outlined"
                    prepend-inner-icon="mdi-calendar"
                    :min="minDate"
                    @update:model-value="loadTimeSlotsForAllCourts"
                  ></v-text-field>
                </v-col>
              </v-row>

              <!-- Time Slots Grid for Each Court (Filtered by Sport) -->
              <div v-if="selectedDate">
                <v-alert
                  v-if="filteredCourts.length === 0"
                  type="warning"
                  variant="tonal"
                  class="mb-4"
                >
                  <div class="d-flex align-center">
                    <v-icon class="mr-2">mdi-alert-circle</v-icon>
                    <div>
                      <div class="font-weight-bold">No courts available for {{ selectedSport?.name }}</div>
                      <div class="text-caption">Please select a different sport or contact the administrator.</div>
                    </div>
                  </div>
                </v-alert>

                <div
                  v-for="court in filteredCourts"
                  :key="court.id"
                  class="court-time-slots-section mb-6"
                >
                  <v-card variant="outlined" class="pa-4">
                    <div class="d-flex align-center justify-space-between mb-3">
                      <div class="d-flex align-center flex-wrap">
                        <h4 class="text-subtitle-1">
                          <v-icon class="mr-2" color="primary">mdi-stadium</v-icon>
                          {{ court.name }}
                        </h4>
                        <div class="d-flex flex-wrap ml-2">
                          <!-- Show all sports this court supports -->
                          <v-chip
                            v-for="sport in getCourtSports(court)"
                            :key="sport.id"
                            :color="sportService.getSportColor(sport.name)"
                            size="small"
                            class="mr-1 mb-1"
                            :variant="sport.id === selectedSport.id ? 'elevated' : 'outlined'"
                          >
                            <v-icon start size="small">{{ sportService.getSportIcon(sport.name, sport.icon) }}</v-icon>
                            {{ sport.name }}
                          </v-chip>
                        </div>
                      </div>
                      <v-chip
                        v-if="courtTimeSlots[court.id]?.slots.length > 0"
                        color="success"
                        size="small"
                      >
                        {{ courtTimeSlots[court.id].slots.length }} slot(s)
                      </v-chip>
                    </div>

                    <v-progress-circular
                      v-if="loadingSlots"
                      indeterminate
                      color="primary"
                      class="d-block mx-auto"
                    ></v-progress-circular>

                    <div v-else-if="timeSlots[court.id] && timeSlots[court.id].length > 0" class="time-slots-grid">
                      <v-card
                        v-for="slot in timeSlots[court.id]"
                        :key="slot.start"
                        :class="['time-slot-card', {
                          'selected': isTimeSlotSelected(court.id, slot.start),
                          'unavailable': !slot.available
                        }]"
                        @click="slot.available && toggleTimeSlot(court.id, slot)"
                        :disabled="!slot.available"
                      >
                        <v-icon
                          v-if="isTimeSlotSelected(court.id, slot.start)"
                          class="selected-check-icon"
                          color="primary"
                          size="24"
                        >
                          mdi-check-circle
                        </v-icon>
                        <v-card-text class="text-center pa-3">
                          <div class="text-body-2 font-weight-bold">{{ formatTime(slot.start) }}</div>
                          <div class="text-caption">to</div>
                          <div class="text-body-2 font-weight-bold">{{ formatTime(slot.end) }}</div>
                          <v-chip
                            :color="slot.available ? 'success' : 'error'"
                            size="x-small"
                            class="mt-2"
                          >
                            {{ slot.available ? 'Available' : 'Booked' }}
                          </v-chip>
                        </v-card-text>
                      </v-card>
                    </div>

                    <v-alert v-else-if="timeSlots[court.id] && timeSlots[court.id].length === 0" type="info" class="mt-2">
                      No time slots available for {{ court.name }} on this date.
                    </v-alert>

                    <v-alert v-else type="warning" class="mt-2">
                      Please wait, loading time slots for {{ court.name }}...
                    </v-alert>
                  </v-card>
                </div>
              </div>

              <v-alert v-else type="info" class="mt-4">
                Please select a date to view available time slots.
              </v-alert>
            </div>
          </v-window-item>

          <!-- Step 3: Confirm Booking -->
          <v-window-item :value="3">
            <div class="step-content">
              <div class="d-flex align-center mb-4">
                <v-btn icon="mdi-arrow-left" variant="text" @click="step = 2" size="small"></v-btn>
                <h3 class="text-h6 ml-2">
                  <v-icon class="mr-2" color="primary">mdi-check-circle</v-icon>
                  Confirm Your Booking
                </h3>
              </div>

              <v-card variant="outlined" class="booking-summary mb-4">
                <v-card-text>
                  <div class="summary-header mb-4">
                    <h4 class="text-h6">
                      <v-icon class="mr-2" color="primary">mdi-racquetball</v-icon>
                      {{ selectedSport?.name }}
                    </h4>
                    <v-chip color="primary">
                      {{ totalBookings }} booking(s)
                    </v-chip>
                  </div>

                  <v-divider class="mb-4"></v-divider>

                  <!-- Pricing Breakdown by Rate -->
                  <div v-if="getPricingBreakdown().length > 1" class="pricing-breakdown mb-4">
                    <h5 class="text-subtitle-1 font-weight-bold mb-3">
                      <v-icon class="mr-2" color="info">mdi-cash-multiple</v-icon>
                      Pricing Breakdown
                    </h5>

                    <div
                      v-for="(rateGroup, index) in getPricingBreakdown()"
                      :key="index"
                      class="rate-group-section mb-3"
                    >
                      <v-card variant="outlined" class="pa-3">
                        <div class="d-flex align-center justify-space-between mb-2">
                          <div>
                            <h6 class="text-subtitle-2 font-weight-bold">
                              {{ rateGroup.rateName }}
                            </h6>
                            <div v-if="rateGroup.rateDescription" class="text-caption text-grey">
                              {{ rateGroup.rateDescription }}
                            </div>
                          </div>
                          <v-chip color="info" size="small">
                            ₱{{ rateGroup.pricePerHour.toFixed(2) }}/hr
                          </v-chip>
                        </div>

                        <v-divider class="my-2"></v-divider>

                        <div class="rate-slots-list">
                          <div
                            v-for="(slot, slotIndex) in rateGroup.slots"
                            :key="slotIndex"
                            class="d-flex align-center justify-space-between mb-2"
                          >
                            <div class="d-flex align-center flex-grow-1">
                              <v-icon size="16" class="mr-2" color="grey">mdi-stadium</v-icon>
                              <span class="text-body-2">{{ slot.courtName }}</span>
                              <v-icon size="12" class="mx-2" color="grey">mdi-circle-small</v-icon>
                              <span class="text-body-2">
                                {{ formatTime(slot.start) }} - {{ formatTime(slot.end) }}
                              </span>
                            </div>
                            <span class="text-body-2 font-weight-medium">
                              ₱{{ slot.price.toFixed(2) }}
                            </span>
                          </div>
                        </div>

                        <v-divider class="my-2"></v-divider>

                        <div class="d-flex justify-space-between align-center">
                          <span class="text-caption text-grey">
                            {{ rateGroup.slots.length }} slot(s)
                          </span>
                          <span class="text-body-2 font-weight-bold">
                            Subtotal: ₱{{ rateGroup.totalPrice.toFixed(2) }}
                          </span>
                        </div>
                      </v-card>
                    </div>
                  </div>

                  <!-- List all bookings by court (shown when no rate breakdown or single rate) -->
                  <div v-else>
                    <div
                      v-for="(courtData, courtId) in courtTimeSlots"
                      :key="courtId"
                      class="court-bookings-section mb-4"
                    >
                      <v-card variant="tonal" class="pa-3">
                        <div class="d-flex align-center mb-2">
                          <v-icon class="mr-2" color="primary">mdi-stadium</v-icon>
                          <h5 class="text-subtitle-1 font-weight-bold">
                            {{ filteredCourts.find(c => c.id === parseInt(courtId))?.name }}
                          </h5>
                        </div>

                        <div class="text-caption text-grey mb-2">
                          <v-icon size="14" class="mr-1">mdi-calendar</v-icon>
                          {{ formatDate(selectedDate) }}
                        </div>

                        <v-divider class="my-2"></v-divider>

                        <div class="time-slots-list">
                          <v-chip
                            v-for="(slot, index) in courtData.slots"
                            :key="index"
                            color="success"
                            size="small"
                            class="mr-2 mb-2"
                          >
                            <v-icon start size="16">mdi-clock-outline</v-icon>
                            {{ formatTime(slot.start) }} - {{ formatTime(slot.end) }}
                          </v-chip>
                        </div>

                        <div class="text-caption text-grey mt-2">
                          {{ courtData.slots.length }} time slot(s) selected
                        </div>
                      </v-card>
                    </div>
                  </div>

                  <v-divider class="my-4"></v-divider>

                  <div class="summary-total">
                    <div>
                      <div class="text-caption text-grey">Total Price</div>
                      <div class="text-h5 font-weight-bold text-success">
                        ₱{{ calculateTotalPrice() }}
                      </div>
                    </div>
                  </div>
                </v-card-text>
              </v-card>

              <!-- Admin Booking Field - Only for admin users -->
              <v-card v-if="isAdmin" variant="outlined" class="mt-4 admin-booking-field">
                <v-card-text>
                  <h4 class="text-h6 mb-4">
                    <v-icon class="mr-2" color="warning">mdi-account-cog</v-icon>
                    Admin Booking Details
                  </h4>

                  <v-alert type="info" variant="tonal" class="mb-4">
                    <div class="d-flex align-center">
                      <div>
                        <div class="font-weight-bold">Booking on behalf of another user</div>
                        <div class="text-caption">Specify who this booking is actually for</div>
                      </div>
                    </div>
                  </v-alert>

                  <v-combobox
                    v-model="bookingForUser"
                    :items="userNames"
                    label="Booking for (Select or Type User Name)"
                    placeholder="Select from list or type a name"
                    variant="outlined"
                    prepend-inner-icon="mdi-account"
                    hint="Select existing user or type a custom name (e.g., walk-in customer)"
                    persistent-hint
                    clearable
                    class="mb-2"
                    item-title="name"
                    return-object
                  >
                    <template v-slot:item="{ props, item }">
                      <v-list-item v-bind="props">
                        <template v-slot:prepend>
                          <v-avatar size="32" class="mr-2">
                            <v-img :src="`https://ui-avatars.com/api/?name=${item.raw.name}&background=3b82f6&color=fff`"></v-img>
                          </v-avatar>
                        </template>

                      </v-list-item>
                    </template>
                    <template v-slot:chip="{}">
                      <div class="d-flex align-center" v-if="typeof bookingForUser === 'object' && bookingForUser && bookingForUser.name">
                        <v-avatar size="24" class="mr-2">
                          <v-img :src="`https://ui-avatars.com/api/?name=${bookingForUser.name}&background=3b82f6&color=fff`"></v-img>
                        </v-avatar>
                        <span>{{ bookingForUser.name }}</span>
                      </div>
                      <div class="d-flex align-center" v-else>
                        <v-icon size="24" class="mr-2" color="orange">mdi-account-plus</v-icon>
                        <span>{{ bookingForUser }}</span>
                      </div>
                    </template>
                  </v-combobox>

                  <v-textarea
                    v-model="adminNotes"
                    label="Admin Notes (Optional)"
                    placeholder="Add any additional notes about this booking..."
                    variant="outlined"
                    prepend-inner-icon="mdi-note-text"
                    rows="2"
                    hint="Internal notes - not visible to the customer"
                    persistent-hint
                  ></v-textarea>
                </v-card-text>
              </v-card>

              <!-- Payment Options -->
              <v-card variant="outlined" class="mt-4 payment-options">
                <v-card-text>
                  <h4 class="text-h6 mb-4">
                    <v-icon class="mr-2" color="success">mdi-cellphone-check</v-icon>
                    {{ isAdminOrStaff ? 'Payment Options' : 'GCash Payment Required' }}
                  </h4>

                  <v-alert v-if="!isAdminOrStaff" type="info" variant="tonal" class="mb-4">
                    <div class="d-flex align-center">
                      <div>
                        <div class="font-weight-bold">Payment is required to complete your booking</div>
                        <div class="text-caption">All bookings must be paid via GCash before submission</div>
                      </div>
                    </div>
                  </v-alert>

                  <!-- Admin/Staff can choose to skip payment -->
                  <v-alert v-if="isAdminOrStaff" type="info" variant="tonal" class="mb-4">
                    <div class="d-flex align-center">
                      <div>
                        <div class="font-weight-bold">As Admin/Staff, payment is optional</div>
                        <div class="text-caption">You can book time slots without payment, but they cannot be marked as "showed up" until payment is completed</div>
                      </div>
                    </div>
                  </v-alert>

                  <!-- Admin/Staff Payment Checkbox -->
                  <v-checkbox
                    v-if="isAdminOrStaff"
                    v-model="skipPayment"
                    label="Skip payment for now (book without payment)"
                    color="primary"
                    hide-details
                    class="mb-4"
                  ></v-checkbox>

                  <!-- GCash Payment Details -->
                  <v-card v-if="!skipPayment" variant="tonal" color="success" class="pa-4">
                    <div class="d-flex align-center mb-3">
                      <v-avatar size="48" class="mr-3">
                        <v-icon size="32" color="success">mdi-cellphone-check</v-icon>
                      </v-avatar>
                      <div>
                        <h5 class="text-subtitle-1 font-weight-bold">GCash Payment</h5>
                        <p class="text-caption mb-0">Secure and instant payment</p>
                      </div>
                    </div>

                    <v-divider class="my-3"></v-divider>

                    <v-row>
                      <v-col cols="12" md="7">
                        <div class="text-body-2 mb-2">
                          <strong>Amount to Pay:</strong> ₱{{ calculateTotalPrice() }}
                        </div>
                        <div class="text-body-2 mb-2">
                          <strong>GCash Number:</strong> {{ paymentSettings.payment_gcash_number }}
                        </div>
                        <div class="text-body-2 mb-3">
                          <strong>Account Name:</strong> {{ paymentSettings.payment_gcash_name }}
                        </div>

                        <v-file-input
                          v-model="proofOfPayment"
                          label="Proof of Payment"
                          placeholder="Upload screenshot"
                          variant="outlined"
                          density="compact"
                          prepend-icon="mdi-camera"
                          accept="image/*"
                          :rules="skipPayment ? [] : [v => !!v || 'Proof of payment is required']"
                          hint="Upload a screenshot of your GCash payment receipt"
                          persistent-hint
                          @change="handleProofUpload"
                        ></v-file-input>

                        <v-img
                          v-if="proofPreview"
                          :src="proofPreview"
                          max-height="200"
                          class="mt-3 rounded"
                          cover
                        ></v-img>
                      </v-col>
                      <v-col cols="12" md="5" class="d-flex justify-center align-center">
                        <div class="gcash-qr-container">
                          <div class="qr-label text-center mb-2">
                            <v-icon size="20" color="success">mdi-qrcode-scan</v-icon>
                            <span class="text-caption ml-1">Scan to Pay</span>
                          </div>
                          <!-- Custom QR Code Image or Generated Canvas -->
                          <v-img
                            v-if="paymentSettings.payment_qr_code_url"
                            :src="paymentSettings.payment_qr_code_url"
                            class="gcash-qr-code"
                            width="180"
                            height="180"
                          ></v-img>
                          <canvas v-else ref="gcashQrCanvas" class="gcash-qr-code"></canvas>
                          <div class="text-caption text-center mt-2 text-grey-darken-1">
                            GCash QR Code
                          </div>
                        </div>
                      </v-col>
                    </v-row>

                    <v-alert type="info" density="compact" class="mt-3">
                      <div class="text-caption">
                        <strong>Instructions:</strong>
                        <ol class="pl-4 mb-0">
                          <li>Scan QR code or send ₱{{ calculateTotalPrice() }} to {{ paymentSettings.payment_gcash_number }}</li>
                          <li>Take a screenshot of your GCash payment receipt</li>
                          <li>Upload the screenshot above</li>
                          <li>Click "Checkout with GCash" to complete</li>
                        </ol>
                      </div>
                    </v-alert>
                  </v-card>
                </v-card-text>
              </v-card>

              <v-alert v-if="!skipPayment" type="info" class="mt-4" icon="mdi-information">
                Your booking will be confirmed immediately after GCash payment verification.
              </v-alert>

              <v-alert v-if="skipPayment && isAdminOrStaff" type="warning" class="mt-4" icon="mdi-alert">
                <div class="font-weight-bold">Booking without payment</div>
                <div class="text-caption">Time slots will be marked as booked, but cannot be marked as "showed up" until payment is completed.</div>
              </v-alert>
            </div>
          </v-window-item>
        </v-window>
      </v-card-text>

      <v-divider></v-divider>

      <!-- Actions -->
      <v-card-actions class="pa-4">
        <v-spacer></v-spacer>
        <v-btn
          variant="text"
          @click="$emit('close')"
        >
          Cancel
        </v-btn>
        <v-btn
          v-if="step < 3"
          color="primary"
          :disabled="!canProceed"
          @click="nextStep"
        >
          Next
          <v-icon end>mdi-arrow-right</v-icon>
        </v-btn>
        <template v-else>
          <v-btn
            color="info"
            variant="outlined"
            :loading="addingToCart"
            @click="addToCart"
            class="mr-2"
          >
            <v-icon start>mdi-cart-plus</v-icon>
            Add to Booking
          </v-btn>
          <v-btn
            v-if="!skipPayment"
            color="success"
            :loading="submitting"
            :disabled="!proofOfPayment"
            @click="submitBookingWithGCash"
          >
            <v-icon start>mdi-cellphone-check</v-icon>
            Checkout with GCash
          </v-btn>
          <v-btn
            v-if="skipPayment && isAdminOrStaff"
            color="warning"
            :loading="submitting"
            @click="submitBookingWithoutPayment"
          >
            <v-icon start>mdi-calendar-check</v-icon>
            Book Without Payment
          </v-btn>
        </template>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import { ref, computed, watch, onMounted, nextTick } from 'vue'
import { courtService } from '../services/courtService'
import { bookingService } from '../services/bookingService'
import { cartService } from '../services/cartService'
import { sportService } from '../services/sportService'
import { paymentSettingService } from '../services/paymentSettingService'
import api from '../services/api'
import Swal from 'sweetalert2'
import QRCode from 'qrcode'

export default {
  name: 'NewBookingDialog',
  props: {
    isOpen: {
      type: Boolean,
      default: false
    },
    preselectedSport: {
      type: Object,
      default: null
    }
  },
  emits: ['close', 'booking-created'],
  setup(props, { emit }) {
    // SweetAlert with custom z-index configuration
    const showAlert = (options) => {
      return Swal.fire({
        ...options,
        customClass: {
          container: 'swal2-container-high-z'
        },
        didOpen: () => {
          // Ensure the container has the highest z-index
          const container = document.querySelector('.swal2-container')
          if (container) {
            container.style.zIndex = '9999'
          }
        }
      })
    }

    const step = ref(1)
    const sports = ref([])
    const courts = ref([])
    const timeSlots = ref([])
    const loadingSlots = ref(false)
    const submitting = ref(false)
    const addingToCart = ref(false)

    // Payment options
    const paymentMethod = ref('gcash') // GCash payment is required
    const gcashQrCanvas = ref(null)
    const proofOfPayment = ref(null)
    const proofPreview = ref(null)
    const skipPayment = ref(false) // Admin/Staff can skip payment

    // Payment settings from Payment Details module
    const paymentSettings = ref({
      payment_gcash_number: '0917-123-4567',
      payment_gcash_name: 'Company Name',
      payment_instructions: 'Please send payment to our GCash number and upload proof of payment.',
      payment_qr_code_url: null
    })

    // Selections
    const selectedSport = ref(null)
    const selectedDate = ref('')
    const courtTimeSlots = ref({}) // Store time slots per court: { courtId: { date: '', slots: [] } }
    const numberOfPlayers = ref(1) // Number of players for the booking

    // Admin booking fields
    const bookingForUser = ref(null)
    const adminNotes = ref('')
    const currentUser = ref(null)
    const userNames = ref([])

    // Computed
    const minDate = computed(() => {
      const today = new Date()
      return today.toISOString().split('T')[0]
    })

    const isAdmin = computed(() => {
      return currentUser.value?.role === 'admin'
    })

    const isAdminOrStaff = computed(() => {
      return currentUser.value?.role === 'admin' || currentUser.value?.role === 'staff'
    })

    const filteredCourts = computed(() => {
      if (!selectedSport.value) return []

      return courts.value.filter(court => {
        if (!court.is_active) return false

        // Check if court supports the selected sport
        // Handle both single sport_id and multiple sports array
        if (court.sport_id === selectedSport.value.id) {
          return true
        }

        // Check if court has multiple sports (sports array)
        if (court.sports && Array.isArray(court.sports)) {
          return court.sports.some(sport => sport.id === selectedSport.value.id)
        }

        // Check if court has sport_ids array
        if (court.sport_ids && Array.isArray(court.sport_ids)) {
          return court.sport_ids.includes(selectedSport.value.id)
        }

        return false
      })
    })

    const canProceed = computed(() => {
      switch (step.value) {
        case 1: return selectedSport.value !== null && numberOfPlayers.value >= 1 && numberOfPlayers.value <= 100
        case 2: return Object.keys(courtTimeSlots.value).length > 0 &&
                       Object.values(courtTimeSlots.value).some(ct => ct.slots.length > 0)
        default: return false
      }
    })

    const totalBookings = computed(() => {
      return Object.values(courtTimeSlots.value).reduce((total, ct) => total + ct.slots.length, 0)
    })

    // Methods
    const getCourtSports = (court) => {
      const sportsList = []

      // If court has a single sport_id, find the sport object
      if (court.sport_id) {
        const sport = sports.value.find(s => s.id === court.sport_id)
        if (sport) {
          sportsList.push(sport)
        }
      }

      // If court has multiple sports array
      if (court.sports && Array.isArray(court.sports)) {
        court.sports.forEach(sport => {
          if (!sportsList.find(s => s.id === sport.id)) {
            sportsList.push(sport)
          }
        })
      }

      // If court has sport_ids array, find corresponding sport objects
      if (court.sport_ids && Array.isArray(court.sport_ids)) {
        court.sport_ids.forEach(sportId => {
          const sport = sports.value.find(s => s.id === sportId)
          if (sport && !sportsList.find(s => s.id === sport.id)) {
            sportsList.push(sport)
          }
        })
      }

      return sportsList
    }

    const selectSport = (sport) => {
      selectedSport.value = sport
      selectedDate.value = ''
      courtTimeSlots.value = {}
      timeSlots.value = {}
      // Reset to 1 player when changing sport
      if (numberOfPlayers.value === 0) {
        numberOfPlayers.value = 1
      }
    }

    const toggleTimeSlot = (courtId, slot) => {
      if (!slot.available) return

      if (!courtTimeSlots.value[courtId]) {
        courtTimeSlots.value[courtId] = {
          date: selectedDate.value,
          slots: []
        }
      }

      const slots = courtTimeSlots.value[courtId].slots
      const index = slots.findIndex(s => s.start === slot.start)

      if (index > -1) {
        // Remove slot
        slots.splice(index, 1)
        // If no slots left for this court, remove the court entry
        if (slots.length === 0) {
          delete courtTimeSlots.value[courtId]
        }
      } else {
        // Add slot
        slots.push(slot)
      }
    }

    const isTimeSlotSelected = (courtId, slotStart) => {
      return courtTimeSlots.value[courtId]?.slots.some(s => s.start === slotStart) || false
    }

    const nextStep = () => {
      if (canProceed.value) {
        step.value++
      }
    }

    const loadTimeSlots = async () => {
      if (selectedCourts.value.length === 0 || !selectedDate.value) return

      loadingSlots.value = true
      try {
        // Load time slots for all selected courts
        const slotsPromises = selectedCourts.value.map(court =>
          courtService.getAvailableSlots(court.id, selectedDate.value)
            .then(slots => ({ courtId: court.id, slots }))
        )

        const results = await Promise.all(slotsPromises)

        // Store slots by court ID with deduplication
        const newTimeSlots = {}
        results.forEach(result => {
          // Deduplicate slots based on start-end time combination
          const uniqueSlots = []
          const seenKeys = new Set()

          result.slots.forEach(slot => {
            const key = `${slot.start}-${slot.end}`
            if (!seenKeys.has(key)) {
              seenKeys.add(key)
              uniqueSlots.push(slot)
            }
          })

          newTimeSlots[result.courtId] = uniqueSlots
        })
        timeSlots.value = newTimeSlots
      } catch (error) {
        console.error('Failed to load time slots:', error)
        showAlert({
          icon: 'error',
          title: 'Error',
          text: 'Failed to load available time slots. Please try again.'
        })
      } finally {
        loadingSlots.value = false
      }
    }

    const loadTimeSlotsForAllCourts = async () => {
      if (!selectedDate.value) return

      loadingSlots.value = true
      try {
        // Load time slots for all filtered courts
        const slotsPromises = filteredCourts.value.map(court =>
          courtService.getAvailableSlots(court.id, selectedDate.value)
            .then(slots => ({ courtId: court.id, slots }))
        )

        const results = await Promise.all(slotsPromises)

        // Store slots by court ID with deduplication
        const newTimeSlots = {}
        results.forEach(result => {
          // Deduplicate slots based on start-end time combination
          const uniqueSlots = []
          const seenKeys = new Set()

          result.slots.forEach(slot => {
            const key = `${slot.start}-${slot.end}`
            if (!seenKeys.has(key)) {
              seenKeys.add(key)
              uniqueSlots.push(slot)
            }
          })

          newTimeSlots[result.courtId] = uniqueSlots
        })
        timeSlots.value = newTimeSlots
      } catch (error) {
        console.error('Failed to load time slots:', error)
        showAlert({
          icon: 'error',
          title: 'Error',
          text: 'Failed to load available time slots. Please try again.'
        })
      } finally {
        loadingSlots.value = false
      }
    }

    const formatTime = (time) => {
      if (!time) return ''
      const [hours, minutes] = time.split(':')
      const hour = parseInt(hours)
      const ampm = hour >= 12 ? 'PM' : 'AM'
      const hour12 = hour % 12 || 12
      return `${hour12}:${minutes} ${ampm}`
    }

    const formatDate = (date) => {
      if (!date) return ''
      const d = new Date(date)
      return d.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
    }

    /**
     * Get the price per hour for a specific date and time considering time-based pricing
     */
    const getPriceForDateTime = (dateTime) => {
      if (!selectedSport.value) {
        return 0
      }

      // Get all active time-based pricing rules for this sport, ordered by priority (highest first)
      const pricingRules = (selectedSport.value.time_based_pricing || [])
        .filter(rule => rule.is_active)
        .sort((a, b) => (b.priority || 0) - (a.priority || 0))

      // If no pricing rules exist, return the default price
      if (pricingRules.length === 0) {
        return parseFloat(selectedSport.value.price_per_hour || 0)
      }

      const dayOfWeek = dateTime.getDay() // 0 = Sunday, 1 = Monday, etc.
      const time = dateTime.toTimeString().substring(0, 8) // HH:mm:ss format

      // Find the first matching rule with highest priority
      for (const rule of pricingRules) {
        // Check if the rule applies to this day of week
        const daysOfWeek = rule.days_of_week

        // If days_of_week is null or empty, rule applies to all days
        if (daysOfWeek && daysOfWeek.length > 0 && !daysOfWeek.includes(dayOfWeek)) {
          continue
        }

        // Check if the time falls within the rule's time range
        // Convert time strings to comparable format
        const ruleStart = rule.start_time.length === 5 ? `${rule.start_time}:00` : rule.start_time
        const ruleEnd = rule.end_time.length === 5 ? `${rule.end_time}:00` : rule.end_time

        if (time >= ruleStart && time < ruleEnd) {
          return parseFloat(rule.price_per_hour)
        }
      }

      // If no matching rule found, return the default price
      return parseFloat(selectedSport.value.price_per_hour || 0)
    }

    /**
     * Calculate total price for a time range considering time-based pricing
     */
    const calculatePriceForRange = (startDateTime, endDateTime) => {
      let totalPrice = 0
      const currentTime = new Date(startDateTime)

      // Handle midnight crossing: if end time is before start time, it means next day
      let adjustedEndDateTime = new Date(endDateTime)
      if (adjustedEndDateTime <= currentTime) {
        adjustedEndDateTime = new Date(adjustedEndDateTime.getTime() + 24 * 60 * 60 * 1000) // Add 1 day
      }

      // Calculate price for each hour segment
      while (currentTime < adjustedEndDateTime) {
        const nextHour = new Date(currentTime.getTime() + 60 * 60 * 1000) // Add 1 hour

        // If next hour exceeds end time, calculate partial hour
        if (nextHour > adjustedEndDateTime) {
          const fraction = (adjustedEndDateTime - currentTime) / (60 * 60 * 1000)
          totalPrice += getPriceForDateTime(currentTime) * fraction
          break
        }

        // Add full hour price
        totalPrice += getPriceForDateTime(currentTime)
        currentTime.setTime(nextHour.getTime())
      }

      return totalPrice
    }

    /**
     * Get pricing breakdown grouped by rates
     * Returns an array of rate groups with their slots and prices
     */
    const getPricingBreakdown = () => {
      const breakdown = new Map() // Using Map to group by rate

      Object.entries(courtTimeSlots.value).forEach(([courtId, courtData]) => {
        const court = filteredCourts.value.find(c => c.id === parseInt(courtId))
        if (court) {
          courtData.slots.forEach(slot => {
            // Create proper datetime objects with the selected date
            const startDateTime = new Date(`${selectedDate.value}T${slot.start}:00`)
            const endDateTime = new Date(`${selectedDate.value}T${slot.end}:00`)

            // Get the pricing rule that applies to this slot
            const pricePerHour = getPriceForDateTime(startDateTime)
            const slotPrice = calculatePriceForRange(startDateTime, endDateTime)

            // Find the pricing rule name
            let rateName = 'Standard Rate'
            let rateDescription = null

            if (selectedSport.value?.time_based_pricing) {
              const pricingRules = selectedSport.value.time_based_pricing
                .filter(rule => rule.is_active)
                .sort((a, b) => (b.priority || 0) - (a.priority || 0))

              const dayOfWeek = startDateTime.getDay()
              const time = startDateTime.toTimeString().substring(0, 8)

              for (const rule of pricingRules) {
                const daysOfWeek = rule.days_of_week
                if (daysOfWeek && daysOfWeek.length > 0 && !daysOfWeek.includes(dayOfWeek)) {
                  continue
                }

                const ruleStart = rule.start_time.length === 5 ? `${rule.start_time}:00` : rule.start_time
                const ruleEnd = rule.end_time.length === 5 ? `${rule.end_time}:00` : rule.end_time

                if (time >= ruleStart && time < ruleEnd) {
                  rateName = rule.name
                  rateDescription = `${formatTime(rule.start_time)} - ${formatTime(rule.end_time)}`
                  break
                }
              }
            }

            // Create a unique key for this rate
            const rateKey = `${pricePerHour}-${rateName}`

            if (!breakdown.has(rateKey)) {
              breakdown.set(rateKey, {
                rateName,
                rateDescription,
                pricePerHour,
                slots: [],
                totalPrice: 0
              })
            }

            const group = breakdown.get(rateKey)
            group.slots.push({
              courtId,
              courtName: court.name,
              start: slot.start,
              end: slot.end,
              price: slotPrice
            })
            group.totalPrice += slotPrice
          })
        }
      })

      // Convert Map to array and sort by price (highest first)
      return Array.from(breakdown.values()).sort((a, b) => b.pricePerHour - a.pricePerHour)
    }

    const calculateTotalPrice = () => {
      let total = 0
      Object.entries(courtTimeSlots.value).forEach(([courtId, courtData]) => {
        const court = filteredCourts.value.find(c => c.id === parseInt(courtId))
        if (court) {
          courtData.slots.forEach(slot => {
            // Create proper datetime objects with the selected date
            const startDateTime = new Date(`${selectedDate.value}T${slot.start}:00`)
            const endDateTime = new Date(`${selectedDate.value}T${slot.end}:00`)

            // Use time-based pricing calculation
            const slotPrice = calculatePriceForRange(startDateTime, endDateTime)
            total += slotPrice
          })
        }
      })
      return total.toFixed(2)
    }

    const handleProofUpload = (event) => {
      const file = event.target?.files?.[0] || proofOfPayment.value?.[0]
      if (file) {
        const reader = new FileReader()
        reader.onload = (e) => {
          proofPreview.value = e.target.result
        }
        reader.readAsDataURL(file)
      } else {
        proofPreview.value = null
      }
    }

    const handleImageError = (event) => {
      event.target.style.display = 'none'
    }

    const addToCart = async () => {
      addingToCart.value = true

      try {
        // Validate selections
        if (!selectedSport.value || !selectedDate.value) {
          showAlert({
            icon: 'warning',
            title: 'Incomplete Selection',
            text: 'Please select sport and time slots before adding to cart.'
          })
          addingToCart.value = false
          return
        }

        // Prepare admin booking data if admin is booking for someone else
        let adminBookingData = null
        if (isAdmin.value && bookingForUser.value) {
          // Check if bookingForUser is an object (existing user) or string (custom name)
          if (typeof bookingForUser.value === 'object' && bookingForUser.value.id) {
            adminBookingData = {
              booking_for_user_id: bookingForUser.value.id,
              booking_for_user_name: bookingForUser.value.name
            }
          } else {
            adminBookingData = {
              booking_for_user_name: bookingForUser.value
            }
          }

          if (adminNotes.value) {
            adminBookingData.admin_notes = adminNotes.value
          }
        }

        // Create cart items from current selections
        const cartItems = []
        Object.entries(courtTimeSlots.value).forEach(([courtId, courtData]) => {
          const court = filteredCourts.value.find(c => c.id === parseInt(courtId))
          if (court && courtData.slots && courtData.slots.length > 0) {
            courtData.slots.forEach(slot => {
              // Create proper datetime objects with the selected date for accurate pricing
              const startDateTime = new Date(`${selectedDate.value}T${slot.start}:00`)
              const endDateTime = new Date(`${selectedDate.value}T${slot.end}:00`)

              // Use time-based pricing calculation
              const price = calculatePriceForRange(startDateTime, endDateTime)

              const cartItem = {
                court_id: court.id,
                booking_date: selectedDate.value,
                start_time: slot.start,
                end_time: slot.end,
                price: price,
                number_of_players: numberOfPlayers.value || 1
              }

              // Add admin booking fields to each cart item if admin is booking for someone
              if (adminBookingData) {
                Object.assign(cartItem, adminBookingData)
              }

              cartItems.push(cartItem)
            })
          }
        })

        if (cartItems.length === 0) {
          showAlert({
            icon: 'warning',
            title: 'No Time Slots Selected',
            text: 'Please select at least one time slot to add to booking.'
          })
          addingToCart.value = false
          return
        }

        // Add to booking via API
        const response = await cartService.addToCart(cartItems)

        // Dispatch custom events to update cart count and refresh bookings
        window.dispatchEvent(new CustomEvent('cart-updated'))
        window.dispatchEvent(new CustomEvent('booking-created'))

        // Emit booking-created event to refresh bookings list
        emit('booking-created')

        showAlert({
          icon: 'success',
          title: 'Added to Cart!',
          html: `
            <p>Successfully added <strong>${cartItems.length}</strong> booking(s) to your cart!</p>
            <p class="text-muted">You can continue booking or checkout from the cart.</p>
          `,
          confirmButtonText: 'OK',
          timer: 3000
        })

        emit('close')
        resetForm()
      } catch (error) {
        console.error('Failed to add to booking:', error)
        showAlert({
          icon: 'error',
          title: 'Failed',
          text: error.response?.data?.message || 'Failed to add bookings to cart. Please try again.'
        })
      } finally {
        addingToCart.value = false
      }
    }

    const submitBookingWithGCash = async () => {
      if (!proofOfPayment.value) {
        showAlert({
          icon: 'warning',
          title: 'Missing Proof of Payment',
          text: 'Please upload a screenshot of your GCash payment receipt.'
        })
        return
      }

      submitting.value = true
      try {
        // Convert proof of payment to base64
        let proofBase64 = null
        if (proofOfPayment.value) {
          const file = proofOfPayment.value[0] || proofOfPayment.value
          const reader = new FileReader()
          proofBase64 = await new Promise((resolve) => {
            reader.onload = (e) => resolve(e.target.result)
            reader.readAsDataURL(file)
          })
        }

        // Prepare admin booking data if admin is booking for someone else
        let adminBookingData = null
        if (isAdmin.value && bookingForUser.value) {
          // Check if bookingForUser is an object (existing user) or string (custom name)
          if (typeof bookingForUser.value === 'object' && bookingForUser.value.id) {
            adminBookingData = {
              booking_for_user_id: bookingForUser.value.id,
              booking_for_user_name: bookingForUser.value.name
            }
          } else {
            adminBookingData = {
              booking_for_user_name: bookingForUser.value
            }
          }

          if (adminNotes.value) {
            adminBookingData.admin_notes = adminNotes.value
          }
        }

        // Create cart items array with admin booking fields
        const cartItems = []
        Object.entries(courtTimeSlots.value).forEach(([courtId, courtData]) => {
          const court = filteredCourts.value.find(c => c.id === parseInt(courtId))
          if (court) {
            courtData.slots.forEach(slot => {
              // Create proper datetime objects with the selected date for accurate pricing
              const startDateTime = new Date(`${selectedDate.value}T${slot.start}:00`)
              const endDateTime = new Date(`${selectedDate.value}T${slot.end}:00`)

              // Use time-based pricing calculation
              const price = calculatePriceForRange(startDateTime, endDateTime)

              const cartItem = {
                court_id: parseInt(courtId),
                booking_date: selectedDate.value,
                start_time: slot.start,
                end_time: slot.end,
                price: price,
                number_of_players: numberOfPlayers.value || 1
              }

              // Add admin booking fields to each cart item
              if (adminBookingData) {
                Object.assign(cartItem, adminBookingData)
              }

              cartItems.push(cartItem)
            })
          }
        })

        // Add items to cart first
        await cartService.addToCart(cartItems)

        // Get the cart items that were just added
        const cartResponse = await cartService.getCartTransaction()
        const cartItemIds = cartResponse.cart_items.map(item => item.id)

        // Checkout with GCash payment
        await cartService.checkout({
          payment_method: 'gcash',
          proof_of_payment: proofBase64,
          selected_items: cartItemIds
        })

        // Dispatch cart updated event
        window.dispatchEvent(new CustomEvent('cart-updated'))

        // Emit booking-created event immediately to refresh the list
        emit('booking-created')

        // Dispatch global events immediately
        window.dispatchEvent(new CustomEvent('booking-created'))
        window.dispatchEvent(new CustomEvent('cart-updated'))

        // Show success message (non-blocking for list refresh)
        await showAlert({
          icon: 'success',
          title: 'Payment Successful!',
          html: `
            <p>Successfully created <strong>${cartItems.length}</strong> booking(s) with GCash payment!</p>
            <p class="text-success">Your bookings are confirmed and pending admin approval!</p>
          `,
          confirmButtonText: 'OK'
        })

        // Close dialog and reset form after user closes alert
        emit('close')
        resetForm()
      } catch (error) {
        console.error('Failed to create bookings:', error)
        console.error('Error response:', error.response)
        console.error('Error data:', error.response?.data)

        let errorMessage = 'Failed to process GCash payment. Please try again.'

        if (error.response?.data?.message) {
          errorMessage = error.response.data.message
        } else if (error.response?.data?.errors) {
          const errors = Object.values(error.response.data.errors).flat()
          errorMessage = errors.join(', ')
        } else if (error.message) {
          errorMessage = error.message
        }

        showAlert({
          icon: 'error',
          title: 'Payment Failed',
          html: `<p>${errorMessage}</p>
                 ${error.response?.data?.errors ? '<pre style="text-align: left; font-size: 11px; max-height: 200px; overflow: auto;">' + JSON.stringify(error.response.data.errors, null, 2) + '</pre>' : ''}`
        })
      } finally {
        submitting.value = false
      }
    }

    const submitBookingWithoutPayment = async () => {
      submitting.value = true

      try {
        // Validate selections
        if (!selectedSport.value || !selectedDate.value) {
          showAlert({
            icon: 'warning',
            title: 'Incomplete Selection',
            text: 'Please select sport and time slots before booking.'
          })
          submitting.value = false
          return
        }

        // Prepare admin booking data if admin is booking for someone else
        let adminBookingData = null
        if (isAdminOrStaff.value && bookingForUser.value) {
          // Check if bookingForUser is an object (existing user) or string (custom name)
          if (typeof bookingForUser.value === 'object' && bookingForUser.value.id) {
            adminBookingData = {
              booking_for_user_id: bookingForUser.value.id,
              booking_for_user_name: bookingForUser.value.name
            }
          } else {
            adminBookingData = {
              booking_for_user_name: bookingForUser.value
            }
          }

          if (adminNotes.value) {
            adminBookingData.admin_notes = adminNotes.value
          }
        }

        // Create cart items array with admin booking fields
        const cartItems = []
        Object.entries(courtTimeSlots.value).forEach(([courtId, courtData]) => {
          const court = filteredCourts.value.find(c => c.id === parseInt(courtId))
          if (court) {
            courtData.slots.forEach(slot => {
              // Create proper datetime objects with the selected date for accurate pricing
              const startDateTime = new Date(`${selectedDate.value}T${slot.start}:00`)
              const endDateTime = new Date(`${selectedDate.value}T${slot.end}:00`)

              // Use time-based pricing calculation
              const price = calculatePriceForRange(startDateTime, endDateTime)

              const cartItem = {
                court_id: parseInt(courtId),
                booking_date: selectedDate.value,
                start_time: slot.start,
                end_time: slot.end,
                price: price,
                number_of_players: numberOfPlayers.value || 1
              }

              // Add admin booking fields to each cart item
              if (adminBookingData) {
                Object.assign(cartItem, adminBookingData)
              }

              cartItems.push(cartItem)
            })
          }
        })

        if (cartItems.length === 0) {
          showAlert({
            icon: 'warning',
            title: 'No Time Slots Selected',
            text: 'Please select at least one time slot to book.'
          })
          submitting.value = false
          return
        }

        // Add items to cart first
        await cartService.addToCart(cartItems)

        // Get the cart items that were just added
        const cartResponse = await cartService.getCartTransaction()
        const cartItemIds = cartResponse.cart_items.map(item => item.id)

        // Checkout without payment
        await cartService.checkout({
          payment_method: 'pending',
          skip_payment: true,
          selected_items: cartItemIds
        })

        // Dispatch cart updated event
        window.dispatchEvent(new CustomEvent('cart-updated'))

        // Emit booking-created event immediately to refresh the list
        emit('booking-created')

        // Dispatch global events immediately
        window.dispatchEvent(new CustomEvent('booking-created'))
        window.dispatchEvent(new CustomEvent('cart-updated'))

        // Show success message (non-blocking for list refresh)
        await showAlert({
          icon: 'success',
          title: 'Booking Created!',
          html: `
            <p>Successfully created <strong>${cartItems.length}</strong> booking(s) without payment!</p>
            <p class="text-warning">Remember: These bookings cannot be marked as "showed up" until payment is completed.</p>
          `,
          confirmButtonText: 'OK'
        })

        // Close dialog and reset form after user closes alert
        emit('close')
        resetForm()
      } catch (error) {
        console.error('Failed to create bookings:', error)
        console.error('Error response:', error.response)
        console.error('Error data:', error.response?.data)

        let errorMessage = 'Failed to create bookings. Please try again.'

        if (error.response?.data?.message) {
          errorMessage = error.response.data.message
        } else if (error.response?.data?.errors) {
          const errors = Object.values(error.response.data.errors).flat()
          errorMessage = errors.join(', ')
        } else if (error.message) {
          errorMessage = error.message
        }

        showAlert({
          icon: 'error',
          title: 'Booking Failed',
          html: `<p>${errorMessage}</p>
                 ${error.response?.data?.errors ? '<pre style="text-align: left; font-size: 11px; max-height: 200px; overflow: auto;">' + JSON.stringify(error.response.data.errors, null, 2) + '</pre>' : ''}`
        })
      } finally {
        submitting.value = false
      }
    }

    const submitBooking = async () => {
      submitting.value = true
      try {
        // Prepare admin booking data if admin is booking for someone else
        const adminBookingData = {}
        if (isAdmin.value && bookingForUser.value) {
          // Check if bookingForUser is an object (existing user) or string (custom name)
          if (typeof bookingForUser.value === 'object' && bookingForUser.value.id) {
            adminBookingData.booking_for_user_id = bookingForUser.value.id
            adminBookingData.booking_for_user_name = bookingForUser.value.name
          } else {
            adminBookingData.booking_for_user_name = bookingForUser.value
          }

          if (adminNotes.value) {
            adminBookingData.admin_notes = adminNotes.value
          }
        }

        // Create an array of all bookings to be created
        const bookingsToCreate = []
        Object.entries(courtTimeSlots.value).forEach(([courtId, courtData]) => {
          courtData.slots.forEach(slot => {
            // Format start and end times properly
            const startDateTime = `${selectedDate.value} ${slot.start}:00`
            const endDateTime = `${selectedDate.value} ${slot.end}:00`

            bookingsToCreate.push({
              court_id: parseInt(courtId),
              start_time: startDateTime,
              end_time: endDateTime,
              ...adminBookingData
            })
          })
        })

        // Create all bookings
        const bookingPromises = bookingsToCreate.map(bookingData =>
          bookingService.createBooking(bookingData)
        )

        await Promise.all(bookingPromises)

        showAlert({
          icon: 'success',
          title: 'Bookings Created!',
          html: `
            <p>Successfully created <strong>${bookingsToCreate.length}</strong> booking(s)!</p>
            <p class="text-muted">All bookings are pending approval.</p>
          `,
          confirmButtonText: 'OK'
        })

        emit('booking-created')
        emit('close')
        resetForm()
      } catch (error) {
        console.error('Failed to create bookings:', error)
        showAlert({
          icon: 'error',
          title: 'Booking Failed',
          text: error.response?.data?.message || 'Failed to create some bookings. Please try again.'
        })
      } finally {
        submitting.value = false
      }
    }

    const resetForm = () => {
      step.value = 1
      selectedSport.value = null
      selectedDate.value = ''
      courtTimeSlots.value = {}
      timeSlots.value = {}
      numberOfPlayers.value = 1
      paymentMethod.value = 'gcash'
      proofOfPayment.value = null
      proofPreview.value = null
      skipPayment.value = false
      // Reset admin fields
      bookingForUser.value = null
      adminNotes.value = ''
    }

    const fetchSports = async () => {
      try {
        sports.value = await courtService.getSports()
      } catch (error) {
        console.error('Failed to fetch sports:', error)
      }
    }

    const fetchCourts = async () => {
      try {
        courts.value = await courtService.getCourts()
      } catch (error) {
        console.error('Failed to fetch courts:', error)
      }
    }

    const fetchCurrentUser = async () => {
      try {
        const token = localStorage.getItem('token')
        if (token) {
          const userData = JSON.parse(localStorage.getItem('user') || '{}')
          currentUser.value = userData
        }
      } catch (error) {
        console.error('Failed to fetch current user:', error)
        currentUser.value = null
      }
    }

    const fetchUsers = async () => {
      try {
        const response = await api.get('/admin/users')

        if (response.data.success && response.data.data) {
          userNames.value = response.data.data.map(user => ({
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role
          }))
        } else {
          console.error('Failed to fetch users:', response.data.message)
          userNames.value = []
        }
      } catch (error) {
        console.error('Failed to fetch users:', error)
        console.error('Error details:', error.response?.data)
        userNames.value = []
      }
    }

    // Watchers
    /**
     * Generate or load GCash QR code
     * This function retrieves all payment details from the Payment Settings module
     * and either displays the uploaded custom QR code or generates a dynamic one
     */
    const generateGCashQR = async () => {
      try {
        // Step 1: Load all payment settings from Payment Details module
        const settings = await paymentSettingService.getPaymentSettings()
        paymentSettings.value = settings

        // Step 2: Check if custom QR code exists
        if (settings.payment_qr_code_url) {
          // Custom QR code uploaded by admin - use it
          const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000'
          paymentSettings.value.payment_qr_code_url = `${apiUrl}${settings.payment_qr_code_url}`
          // No need to generate canvas, v-img will display the uploaded QR
          return
        }

        // Step 3: No custom QR code - generate dynamic QR using payment settings
        await nextTick()

        if (gcashQrCanvas.value) {
          // Use all details from Payment Settings module
          const gcashNumber = settings.payment_gcash_number.replace(/-/g, '')
          const accountName = settings.payment_gcash_name.replace(/\s+/g, '')
          const amount = calculateTotalPrice()

          // Generate QR code with GCash payment link format
          const qrData = `gcash://pay?number=${gcashNumber}&amount=${amount}&name=${accountName}`

          await QRCode.toCanvas(gcashQrCanvas.value, qrData, {
            width: 180,
            margin: 2,
            color: {
              dark: '#2e7d32',
              light: '#ffffff'
            }
          })
        }
      } catch (error) {
        console.error('Failed to load payment settings or generate QR code:', error)
        // Keep default values if loading fails
      }
    }

    // Watch for payment method change to generate QR
    watch(paymentMethod, async (newMethod) => {
      if (newMethod === 'gcash') {
        await nextTick()
        setTimeout(() => {
          generateGCashQR()
        }, 100)
      }
    })

    // Watch for step changes to generate QR code on step 3
    watch(step, async (newStep) => {
      if (newStep === 3) {
        // Generate QR code when reaching confirmation step
        await nextTick()
        setTimeout(() => {
          generateGCashQR()
        }, 100)
      }
    })

    watch(() => props.isOpen, async (newValue) => {
      if (newValue) {
        await fetchSports()
        await fetchCourts()
        await fetchCurrentUser()

        // Only fetch users if the current user is admin or staff
        if (isAdminOrStaff.value) {
          fetchUsers()
        }

        // If a preselected sport is provided, select it and move to step 2
        if (props.preselectedSport) {
          await nextTick()
          // Find the sport in the loaded sports list by ID
          const sport = sports.value.find(s => s.id === props.preselectedSport.id)
          if (sport) {
            selectSport(sport)
            step.value = 2
          }
        }
      } else {
        resetForm()
      }
    })

    onMounted(async () => {
      if (props.isOpen) {
        await fetchSports()
        await fetchCourts()
        await fetchCurrentUser()

        // Only fetch users if the current user is admin or staff
        if (isAdminOrStaff.value) {
          fetchUsers()
        }

        // If a preselected sport is provided, select it and move to step 2
        if (props.preselectedSport) {
          await nextTick()
          const sport = sports.value.find(s => s.id === props.preselectedSport.id)
          if (sport) {
            selectSport(sport)
            step.value = 2
          }
        }
      }
    })

    return {
      step,
      sports,
      courts,
      timeSlots,
      loadingSlots,
      submitting,
      addingToCart,
      paymentMethod,
      gcashQrCanvas,
      proofOfPayment,
      proofPreview,
      paymentSettings,
      skipPayment,
      selectedSport,
      selectedDate,
      courtTimeSlots,
      numberOfPlayers,
      minDate,
      filteredCourts,
      canProceed,
      totalBookings,
      getCourtSports,
      selectSport,
      toggleTimeSlot,
      isTimeSlotSelected,
      nextStep,
      loadTimeSlots,
      loadTimeSlotsForAllCourts,
      formatTime,
      formatDate,
      getPricingBreakdown,
      calculateTotalPrice,
      handleProofUpload,
      generateGCashQR,
      handleImageError,
      addToCart,
      submitBookingWithGCash,
      submitBookingWithoutPayment,
      submitBooking,
      // Admin fields
      isAdmin,
      isAdminOrStaff,
      bookingForUser,
      adminNotes,
      userNames,
      // Services
      sportService
    }
  }
}
</script>

<style scoped>
.booking-dialog {
  display: flex;
  flex-direction: column;
  max-height: 90vh;
  background: #ffffff !important;
}

/* Fixed Header */
.booking-dialog > .v-card-title,
.booking-dialog > .dialog-header {
  position: sticky;
  top: 0;
  z-index: 10;
  background: linear-gradient(135deg, #1976d2 0%, #1565c0 100%);
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

/* Scrollable Content */
.booking-dialog .v-card-text {
  overflow-y: auto;
  flex: 1;
  max-height: calc(90vh - 180px);
  background: #ffffff !important;
  color: #1f2937 !important;
}

/* Fixed Footer */
.booking-dialog > .v-card-actions {
  position: sticky;
  bottom: 0;
  z-index: 10;
  background: white;
  box-shadow: 0 -2px 4px rgba(0,0,0,0.1);
}

/* Ensure all text is dark and visible */
.booking-dialog h2,
.booking-dialog h3,
.booking-dialog h4,
.booking-dialog p,
.booking-dialog div,
.booking-dialog span,
.booking-dialog label {
  color: #1f2937 !important;
}

.booking-dialog .text-grey,
.booking-dialog .text-subtitle-2 {
  color: #6b7280 !important;
}

.booking-dialog .v-label {
  color: #374151 !important;
}

.booking-dialog .v-field__input {
  color: #1f2937 !important;
}

.booking-dialog .v-text-field input {
  color: #1f2937 !important;
}

.booking-dialog .v-select__selection {
  color: #1f2937 !important;
}

.step-content {
  color: #1f2937 !important;
}

.step-content h3,
.step-content h4 {
  color: #1f2937 !important;
}

.gap-2 {
  gap: 8px;
}

/* Fix SweetAlert z-index to appear above Vuetify dialogs */
:deep(.swal2-container) {
  z-index: 9999 !important;
}

:deep(.swal2-popup) {
  z-index: 10000 !important;
}

:deep(.swal2-container-high-z) {
  z-index: 9999 !important;
}

/* Custom Stepper Header */
.stepper-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 0;
  position: relative;
}

.stepper-header::before {
  content: '';
  position: absolute;
  top: 28px;
  left: 10%;
  right: 10%;
  height: 2px;
  background: #e0e0e0;
  z-index: 0;
}

.step-indicator {
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  z-index: 1;
  flex: 1;
}

.step-number {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: #e0e0e0;
  color: #666;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  margin-bottom: 8px;
  transition: all 0.3s ease;
}

.step-indicator.active .step-number {
  background: #1976d2;
  color: white;
  box-shadow: 0 4px 8px rgba(25, 118, 210, 0.3);
}

.step-indicator.completed .step-number {
  background: #4caf50;
  color: white;
}

.step-label {
  font-size: 12px;
  color: #666 !important;
  text-align: center;
}

.step-indicator.active .step-label {
  color: #1976d2 !important;
  font-weight: bold;
}

.step-indicator.completed .step-label {
  color: #4caf50 !important;
}

.dialog-header {
  background: linear-gradient(135deg, #1976d2 0%, #1565c0 100%);
  color: white;
  padding: 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-content {
  display: flex;
  align-items: center;
}

.step-content {
  min-height: 400px;
  padding: 16px;
  overflow: hidden;
}

/* Sport Cards */
.sport-card {
  cursor: pointer;
  transition: all 0.3s ease;
  border: 2px solid transparent;
  background: #ffffff !important;
  position: relative;
  overflow: hidden;
  height: 100%;
  min-height: 200px;
  display: flex;
  flex-direction: column;
}

.sport-card .v-card-text {
  color: #1f2937 !important;
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

.sport-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  border-color: #90caf9;
}

.sport-card.selected {
  border-color: #1976d2 !important;
  background: linear-gradient(135deg, rgba(25, 118, 210, 0.1) 0%, rgba(21, 101, 192, 0.05) 100%) !important;
  box-shadow: 0 4px 16px rgba(25, 118, 210, 0.3) !important;
  transform: scale(1.0);
}

.sport-card.selected::before {
  content: '';
  position: absolute;
  top: -2px;
  left: -2px;
  right: -2px;
  bottom: -2px;
  border: 2px solid #1976d2;
  border-radius: inherit;
  animation: pulse 2s ease-in-out infinite;
  pointer-events: none;
}

.sport-card.selected .sport-icon-large {
  color: #1976d2 !important;
  transform: scale(1.1);
  transition: transform 0.3s ease;
}

.sport-card.selected h4 {
  color: #1976d2 !important;
  font-weight: 700 !important;
}

.sport-icon-large {
  font-size: 64px;
  line-height: 1;
  transition: all 0.3s ease;
}

.sport-card h4 {
  margin-top: 12px !important;
  margin-bottom: 8px !important;
  min-height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.sport-card p {
  margin: 0 !important;
  min-height: 40px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* Court Cards */
.court-card {
  cursor: pointer;
  transition: all 0.3s ease;
  border: 2px solid transparent;
  position: relative;
  background: #ffffff !important;
}

.court-card .v-card-title,
.court-card .v-card-text,
.court-card .v-card-subtitle {
  color: #1f2937 !important;
}

.court-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.court-card.selected {
  border-color: #1976d2;
  background: rgba(25, 118, 210, 0.05) !important;
}

.selection-badge {
  position: absolute;
  top: 8px;
  right: 8px;
  background: #1976d2;
  border-radius: 50%;
  padding: 4px;
  z-index: 1;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
}

.court-image-container {
  height: 100%;
  min-height: 150px;
  overflow: hidden;
}

.court-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.court-image-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f5f5f5;
}

.amenities-chips {
  margin-top: 8px;
}

/* Time Slots Grid */
.time-slots-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  gap: 12px;
  margin-top: 16px;
}

.time-slot-card {
  cursor: pointer;
  transition: all 0.3s ease;
  border: 2px solid transparent;
  background: #ffffff !important;
  position: relative;
  overflow: hidden;
}

.time-slot-card .v-card-text {
  color: #1f2937 !important;
}

.selected-check-icon {
  position: absolute;
  top: 4px;
  right: 4px;
  z-index: 10;
  background: white;
  border-radius: 50%;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.15);
}

.time-slot-card:hover:not(.unavailable) {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
  border-color: #90caf9;
}

.time-slot-card.selected {
  border-color: #1976d2 !important;
  background: linear-gradient(135deg, rgba(25, 118, 210, 0.15) 0%, rgba(21, 101, 192, 0.1) 100%) !important;
  box-shadow: 0 4px 12px rgba(25, 118, 210, 0.3) !important;
  transform: scale(1.05);
}

.time-slot-card.selected::before {
  content: '';
  position: absolute;
  top: -2px;
  left: -2px;
  right: -2px;
  bottom: -2px;
  border: 2px solid #1976d2;
  border-radius: inherit;
  animation: pulse 2s ease-in-out infinite;
}

.time-slot-card.selected .v-card-text {
  font-weight: 600 !important;
  color: #1976d2 !important;
}

.time-slot-card.selected .v-chip {
  background: #1976d2 !important;
  color: white !important;
}

.time-slot-card.unavailable {
  opacity: 0.5;
  cursor: not-allowed;
  background: #f5f5f5 !important;
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

/* Booking Summary */
.booking-summary {
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
}

.summary-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

/* Pricing Breakdown */
.pricing-breakdown {
  margin-bottom: 16px;
}

.rate-group-section {
  margin-bottom: 12px;
}

.rate-group-section .v-card {
  border-left: 4px solid #2196f3;
  transition: all 0.3s ease;
}

.rate-group-section .v-card:hover {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.12);
}

.rate-slots-list {
  max-height: 300px;
  overflow-y: auto;
}

.rate-slots-list::-webkit-scrollbar {
  width: 6px;
}

.rate-slots-list::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 3px;
}

.rate-slots-list::-webkit-scrollbar-thumb {
  background: #888;
  border-radius: 3px;
}

.rate-slots-list::-webkit-scrollbar-thumb:hover {
  background: #555;
}

.summary-item {
  display: flex;
  align-items: flex-start;
  margin-bottom: 16px;
  color: #1f2937 !important;
}

.summary-item strong {
  color: #1f2937 !important;
}

.summary-item:last-child {
  margin-bottom: 0;
}

.summary-total {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
  background: rgba(76, 175, 80, 0.1);
  border-radius: 8px;
  color: #1f2937 !important;
}

/* Payment Options */
.payment-options {
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
}

.payment-options h4,
.payment-options p,
.payment-options div {
  color: #1f2937 !important;
}

.gcash-details {
  background: white;
  padding: 16px;
  border-radius: 8px;
  margin-top: 12px;
  color: #1f2937 !important;
}

.gcash-details p,
.gcash-details div,
.gcash-details strong {
  color: #1f2937 !important;
}

/* GCash QR Code */
.gcash-qr-container {
  background: white;
  padding: 12px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  display: inline-block;
}

.gcash-qr-code {
  display: block;
  border-radius: 8px;
  border: 3px solid #2e7d32;
}

.qr-label {
  font-weight: 600;
  color: #2e7d32;
}

.court-bookings-section {
  margin-bottom: 16px;
}

.time-slots-list {
  display: flex;
  flex-wrap: wrap;
}

/* Responsive Design */
@media (max-width: 1280px) {
  .v-dialog.responsive-dialog {
    margin: 0 !important;
  }

  .booking-dialog {
    max-height: 100vh;
    height: 100vh;
  }
}

@media (max-width: 960px) {
  .dialog-header {
    flex-direction: column;
    align-items: flex-start !important;
    padding: 16px !important;
  }

  .header-content {
    margin-bottom: 8px;
  }

  .header-content h2 {
    font-size: 1.25rem !important;
  }

  .stepper-header {
    flex-wrap: wrap;
    gap: 8px;
  }

  .step-indicator {
    flex: 0 0 calc(50% - 4px);
    min-width: 0;
  }

  .step-label {
    font-size: 0.75rem !important;
  }

  .step-number {
    width: 30px !important;
    height: 30px !important;
    font-size: 0.875rem !important;
  }

  .time-slots-grid {
    grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
    gap: 8px;
  }

  .summary-item {
    flex-direction: column;
    align-items: flex-start !important;
  }
}

@media (max-width: 600px) {
  /* Mobile content optimizations - keeping modal height */
  .v-card-text {
    padding: 12px !important;
  }

  .dialog-header {
    padding: 12px !important;
  }

  .header-content h2 {
    font-size: 1.1rem !important;
  }

  .header-content .v-icon {
    display: none;
  }

  .stepper-header {
    gap: 4px;
  }

  .step-indicator {
    flex: 0 0 calc(50% - 2px);
  }

  .step-label {
    font-size: 0.7rem !important;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .step-number {
    width: 24px !important;
    height: 24px !important;
    font-size: 0.75rem !important;
    margin-bottom: 4px !important;
  }

  .sport-card,
  .court-card {
    margin-bottom: 8px;
  }

  .time-slots-grid {
    grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
    gap: 6px;
  }

  .time-slot-card .v-card-text {
    padding: 8px !important;
    font-size: 0.8rem !important;
  }

  .booking-summary,
  .payment-options {
    padding: 12px !important;
  }

  .gcash-qr-code {
    max-width: 200px !important;
  }

  .dialog-actions {
    flex-direction: column;
    gap: 8px;
  }

  .dialog-actions .v-btn {
    width: 100% !important;
  }

  /* Additional mobile content optimizations */
  .sport-card .v-card-text,
  .court-card .v-card-text {
    padding: 12px !important;
  }

  .booking-summary .summary-item {
    padding: 8px !important;
  }

  .payment-options .v-radio-group {
    margin-top: 8px !important;
  }

  /* Better touch targets */
  .time-slot-card {
    min-height: 60px !important;
  }

  .sport-card {
    min-height: 120px !important;
  }
}

/* Tablet optimizations - better content layout */
@media (min-width: 601px) and (max-width: 768px) {
  .booking-dialog {
    max-width: 95vw !important;
  }

  .v-card-text {
    padding: 20px !important;
  }

  .dialog-header {
    padding: 20px !important;
  }

  .time-slots-grid {
    grid-template-columns: repeat(auto-fill, minmax(130px, 1fr));
    gap: 10px;
  }

  .sport-card,
  .court-card {
    min-height: 180px !important;
  }

  .step-content {
    padding: 20px !important;
  }
}

@media (max-width: 400px) {
  .step-indicator {
    flex: 0 0 100%;
    flex-direction: row;
    justify-content: flex-start;
    padding: 8px;
  }

  .step-number {
    margin-bottom: 0 !important;
    margin-right: 8px !important;
  }

  .time-slots-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>

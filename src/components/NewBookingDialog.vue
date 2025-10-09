<template>
  <v-dialog
    :model-value="isOpen"
    @update:model-value="$emit('close')"
    max-width="1200"
    persistent
  >
    <v-card class="booking-dialog">
      <!-- Header -->
      <v-card-title class="dialog-header">
        <div class="header-content">
          <v-icon size="32" class="mr-3">mdi-calendar-check</v-icon>
          <div>
            <h2 class="text-h5">Book a Court</h2>
            <p class="text-subtitle-2 text-grey">Select sport, court, and time slot</p>
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
            v-for="(stepName, index) in ['Sport', 'Court', 'Time Slot', 'Confirm']"
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
                      <div class="sport-icon-large">{{ getSportIcon(sport.name) }}</div>
                      <h4 class="text-h6 mt-2">{{ sport.name }}</h4>
                      <p class="text-caption text-grey">{{ sport.description }}</p>
                    </v-card-text>
                  </v-card>
                </v-col>
              </v-row>

              <v-alert v-if="sports.length === 0" type="info" class="mt-4">
                No sports available. Please contact the administrator.
              </v-alert>
            </div>
          </v-window-item>

          <!-- Step 2: Select Courts (Multiple) -->
          <v-window-item :value="2">
            <div class="step-content">
              <div class="d-flex align-center justify-space-between mb-4">
                <div class="d-flex align-items-center">
                  <v-btn icon="mdi-arrow-left" variant="text" @click="step = 1" size="small"></v-btn>
                  <h3 class="text-h6 ml-2">
                    <v-icon class="mr-2" color="primary">mdi-stadium</v-icon>
                    Select Courts for {{ selectedSport?.name }}
                  </h3>
                </div>
                <div class="d-flex align-items-center gap-2">
                  <v-btn
                    v-if="filteredCourts.length > 0"
                    :color="allCourtsSelected ? 'error' : 'primary'"
                    variant="outlined"
                    size="small"
                    @click="toggleSelectAllCourts"
                    prepend-icon="mdi-checkbox-multiple-marked"
                  >
                    {{ allCourtsSelected ? 'Deselect All' : 'Select All' }}
                  </v-btn>
                  <v-chip color="primary" v-if="selectedCourts.length > 0">
                    {{ selectedCourts.length }} court(s) selected
                  </v-chip>
                </div>
              </div>

              <v-row>
                <v-col
                  v-for="court in filteredCourts"
                  :key="court.id"
                  cols="12"
                  md="6"
                >
                  <v-card
                    :class="['court-card', { 'selected': isCourtSelected(court.id) }]"
                    @click="toggleCourt(court)"
                    hover
                  >
                    <div v-if="isCourtSelected(court.id)" class="selection-badge">
                      <v-icon color="white" size="20">mdi-check-circle</v-icon>
                    </div>
                    <v-row no-gutters>
                      <v-col cols="4">
                        <div class="court-image-container">
                          <img
                            v-if="court.images && court.images.length > 0"
                            :src="court.images[0].image_url"
                            :alt="court.name"
                            class="court-image"
                            @error="handleImageError"
                          />
                          <div v-else class="court-image-placeholder">
                            <v-icon size="48" color="grey">mdi-stadium</v-icon>
                          </div>
                        </div>
                      </v-col>
                      <v-col cols="8">
                        <v-card-text>
                          <h4 class="text-h6">{{ court.name }}</h4>
                          <p class="text-caption text-grey mb-2">{{ court.location || 'No location specified' }}</p>
                          <div class="d-flex align-center mb-1">
                            <v-icon size="16" class="mr-1" color="success">mdi-currency-php</v-icon>
                            <span class="text-body-2">{{ court.price_per_hour }}/hour</span>
                          </div>
                          <div v-if="court.amenities && court.amenities.length" class="amenities-chips">
                            <v-chip
                              v-for="(amenity, index) in court.amenities.slice(0, 3)"
                              :key="index"
                              size="x-small"
                              class="mr-1"
                            >
                              {{ amenity }}
                            </v-chip>
                            <span v-if="court.amenities.length > 3" class="text-caption">+{{ court.amenities.length - 3 }} more</span>
                          </div>
                        </v-card-text>
                      </v-col>
                    </v-row>
                  </v-card>
                </v-col>
              </v-row>

              <v-alert v-if="filteredCourts.length === 0" type="info" class="mt-4">
                No courts available for {{ selectedSport?.name }}. Please contact the administrator.
              </v-alert>
            </div>
          </v-window-item>

          <!-- Step 3: Select Date and Time Slots (Multiple) -->
          <v-window-item :value="3">
            <div class="step-content">
              <div class="d-flex align-center justify-space-between mb-4">
                <div class="d-flex align-center">
                  <v-btn icon="mdi-arrow-left" variant="text" @click="step = 2" size="small"></v-btn>
                  <h3 class="text-h6 ml-2">
                    <v-icon class="mr-2" color="primary">mdi-clock-outline</v-icon>
                    Select Date & Time Slots
                  </h3>
                </div>
                <v-chip color="success" v-if="totalBookings > 0">
                  {{ totalBookings }} slot(s) selected
                </v-chip>
              </div>

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
                    @update:model-value="loadTimeSlots"
                  ></v-text-field>
                </v-col>
              </v-row>

              <!-- Time Slots Grid for Each Selected Court -->
              <div v-if="selectedDate">
                <div
                  v-for="court in selectedCourts"
                  :key="court.id"
                  class="court-time-slots-section mb-6"
                >
                  <v-card variant="outlined" class="pa-4">
                    <div class="d-flex align-center justify-space-between mb-3">
                      <h4 class="text-subtitle-1">
                        <v-icon class="mr-2" color="primary">mdi-stadium</v-icon>
                        {{ court.name }}
                      </h4>
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

          <!-- Step 4: Confirm Booking -->
          <v-window-item :value="4">
            <div class="step-content">
              <div class="d-flex align-center mb-4">
                <v-btn icon="mdi-arrow-left" variant="text" @click="step = 3" size="small"></v-btn>
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

                  <!-- List all bookings by court -->
                  <div
                    v-for="(courtData, courtId) in courtTimeSlots"
                    :key="courtId"
                    class="court-bookings-section mb-4"
                  >
                    <v-card variant="tonal" class="pa-3">
                      <div class="d-flex align-center mb-2">
                        <v-icon class="mr-2" color="primary">mdi-stadium</v-icon>
                        <h5 class="text-subtitle-1 font-weight-bold">
                          {{ selectedCourts.find(c => c.id === parseInt(courtId))?.name }}
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

                  <v-divider class="my-4"></v-divider>

                  <div class="summary-total">
                    <v-icon class="mr-2" color="success" size="32">mdi-currency-php</v-icon>
                    <div>
                      <div class="text-caption text-grey">Total Price</div>
                      <div class="text-h5 font-weight-bold text-success">
                        ₱{{ calculateTotalPrice() }}
                      </div>
                    </div>
                  </div>
                </v-card-text>
              </v-card>

              <!-- Payment Options -->
              <v-card variant="outlined" class="mt-4 payment-options">
                <v-card-text>
                  <h4 class="text-h6 mb-4">
                    <v-icon class="mr-2" color="success">mdi-cellphone-check</v-icon>
                    GCash Payment Required
                  </h4>

                  <v-alert type="info" variant="tonal" class="mb-4">
                    <div class="d-flex align-center">
                      
                      <div>
                        <div class="font-weight-bold">Payment is required to complete your booking</div>
                        <div class="text-caption">All bookings must be paid via GCash before submission</div>
                      </div>
                    </div>
                  </v-alert>

                  <!-- GCash Payment Details -->
                  <v-card variant="tonal" color="success" class="pa-4">
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
                          <strong>GCash Number:</strong> 0917-123-4567
                        </div>
                        <div class="text-body-2 mb-3">
                          <strong>Account Name:</strong> Court Booking System
                        </div>

                        <v-text-field
                          v-model="gcashReferenceNumber"
                          label="GCash Reference Number"
                          placeholder="Enter your GCash reference number"
                          variant="outlined"
                          density="compact"
                          prepend-inner-icon="mdi-pound"
                          :rules="[v => !!v || 'Reference number is required']"
                          hint="Enter the reference number from your GCash transaction"
                          persistent-hint
                          class="mb-3"
                        ></v-text-field>

                        <v-file-input
                          v-model="proofOfPayment"
                          label="Proof of Payment"
                          placeholder="Upload screenshot"
                          variant="outlined"
                          density="compact"
                          prepend-icon="mdi-camera"
                          accept="image/*"
                          :rules="[v => !!v || 'Proof of payment is required']"
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
                          <canvas ref="gcashQrCanvas" class="gcash-qr-code"></canvas>
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
                          <li>Scan QR code or send ₱{{ calculateTotalPrice() }} to 0917-123-4567</li>
                          <li>Take a screenshot of your GCash payment receipt</li>
                          <li>Upload the screenshot above</li>
                          <li>Enter the reference number from your receipt</li>
                          <li>Click "Checkout with GCash" to complete</li>
                        </ol>
                      </div>
                    </v-alert>
                  </v-card>
                </v-card-text>
              </v-card>

              <v-alert type="info" class="mt-4" icon="mdi-information">
                Your booking will be confirmed immediately after GCash payment verification.
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
          v-if="step < 4"
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
            Add to Cart
          </v-btn>
          <v-btn
            color="success"
            :loading="submitting"
            :disabled="!gcashReferenceNumber || !proofOfPayment"
            @click="submitBookingWithGCash"
          >
            <v-icon start>mdi-cellphone-check</v-icon>
            Checkout with GCash
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
import Swal from 'sweetalert2'
import QRCode from 'qrcode'

export default {
  name: 'NewBookingDialog',
  props: {
    isOpen: {
      type: Boolean,
      default: false
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
    const gcashReferenceNumber = ref('')
    const gcashQrCanvas = ref(null)
    const proofOfPayment = ref(null)
    const proofPreview = ref(null)

    // Selections
    const selectedSport = ref(null)
    const selectedCourts = ref([]) // Changed to array for multiple courts
    const selectedDate = ref('')
    const courtTimeSlots = ref({}) // Store time slots per court: { courtId: { date: '', slots: [] } }

    // Computed
    const minDate = computed(() => {
      const today = new Date()
      return today.toISOString().split('T')[0]
    })

    const filteredCourts = computed(() => {
      if (!selectedSport.value) return []
      return courts.value.filter(court => court.sport_id === selectedSport.value.id && court.is_active)
    })

    const canProceed = computed(() => {
      switch (step.value) {
        case 1: return selectedSport.value !== null
        case 2: return selectedCourts.value.length > 0
        case 3: return Object.keys(courtTimeSlots.value).length > 0 && 
                       Object.values(courtTimeSlots.value).some(ct => ct.slots.length > 0)
        default: return false
      }
    })

    const totalBookings = computed(() => {
      return Object.values(courtTimeSlots.value).reduce((total, ct) => total + ct.slots.length, 0)
    })

    // Methods
    const getSportIcon = (sportName) => {
      const icons = {
        'Badminton': '🏸',
        'Tennis': '🎾',
        'Basketball': '🏀',
        'Volleyball': '🏐',
        'Football': '⚽',
        'Soccer': '⚽',
        'Table Tennis': '🏓',
        'Squash': '🎾'
      }
      return icons[sportName] || '🏟️'
    }

    const selectSport = (sport) => {
      selectedSport.value = sport
      selectedCourts.value = []
      selectedDate.value = ''
      courtTimeSlots.value = {}
      timeSlots.value = []
    }

    const toggleCourt = (court) => {
      const index = selectedCourts.value.findIndex(c => c.id === court.id)
      if (index > -1) {
        // Remove court
        selectedCourts.value.splice(index, 1)
        // Remove its time slots
        delete courtTimeSlots.value[court.id]
      } else {
        // Add court
        selectedCourts.value.push(court)
      }
    }

    const isCourtSelected = (courtId) => {
      return selectedCourts.value.some(c => c.id === courtId)
    }

    // Check if all courts are selected
    const allCourtsSelected = computed(() => {
      return filteredCourts.value.length > 0 && 
             selectedCourts.value.length === filteredCourts.value.length
    })

    // Toggle select/deselect all courts
    const toggleSelectAllCourts = () => {
      if (allCourtsSelected.value) {
        // Deselect all
        selectedCourts.value = []
        courtTimeSlots.value = {}
      } else {
        // Select all
        selectedCourts.value = [...filteredCourts.value]
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

    const calculateTotalPrice = () => {
      let total = 0
      Object.entries(courtTimeSlots.value).forEach(([courtId, courtData]) => {
        const court = selectedCourts.value.find(c => c.id === parseInt(courtId))
        if (court) {
          courtData.slots.forEach(slot => {
            const start = new Date(`2000-01-01 ${slot.start}`)
            const end = new Date(`2000-01-01 ${slot.end}`)
            const hours = (end - start) / (1000 * 60 * 60)
            total += court.price_per_hour * hours
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
        if (!selectedSport.value || selectedCourts.value.length === 0 || !selectedDate.value) {
          showAlert({
            icon: 'warning',
            title: 'Incomplete Selection',
            text: 'Please select sport, courts, and time slots before adding to cart.'
          })
          addingToCart.value = false
          return
        }

        // Create cart items from current selections
        const cartItems = []
        Object.entries(courtTimeSlots.value).forEach(([courtId, courtData]) => {
          const court = selectedCourts.value.find(c => c.id === parseInt(courtId))
          if (court && courtData.slots && courtData.slots.length > 0) {
            courtData.slots.forEach(slot => {
              cartItems.push({
                court_id: court.id,
                booking_date: selectedDate.value,
                start_time: slot.start,
                end_time: slot.end,
                price: slot.price || 0
              })
            })
          }
        })

        if (cartItems.length === 0) {
          showAlert({
            icon: 'warning',
            title: 'No Time Slots Selected',
            text: 'Please select at least one time slot to add to cart.'
          })
          addingToCart.value = false
          return
        }
        
        // Add to cart via API
        const response = await cartService.addToCart(cartItems)
        
        console.log('Cart items added:', cartItems.length)
        
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
        console.error('Failed to add to cart:', error)
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
      if (!gcashReferenceNumber.value) {
        showAlert({
          icon: 'warning',
          title: 'Missing Reference Number',
          text: 'Please enter your GCash reference number.'
        })
        return
      }

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

        // Create cart items array
        const cartItems = []
        Object.entries(courtTimeSlots.value).forEach(([courtId, courtData]) => {
          const court = selectedCourts.value.find(c => c.id === parseInt(courtId))
          if (court) {
            courtData.slots.forEach(slot => {
              const start = new Date(`2000-01-01 ${slot.start}`)
              const end = new Date(`2000-01-01 ${slot.end}`)
              const hours = (end - start) / (1000 * 60 * 60)
              const price = court.price_per_hour * hours

              cartItems.push({
                court_id: parseInt(courtId),
                booking_date: selectedDate.value,
                start_time: slot.start,
                end_time: slot.end,
                price: price
              })
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
          gcash_reference: gcashReferenceNumber.value,
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
            <p class="text-muted">GCash Reference: <strong>${gcashReferenceNumber.value}</strong></p>
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

    const submitBooking = async () => {
      submitting.value = true
      try {
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
              end_time: endDateTime
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
      selectedCourts.value = []
      selectedDate.value = ''
      courtTimeSlots.value = {}
      timeSlots.value = {}
      paymentMethod.value = 'gcash'
      gcashReferenceNumber.value = ''
      proofOfPayment.value = null
      proofPreview.value = null
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

    // Watchers
    // Generate GCash QR code
    const generateGCashQR = async () => {
      await nextTick()
      if (gcashQrCanvas.value) {
        try {
          const gcashNumber = '09171234567'
          const accountName = 'CourtBookingSystem'
          const amount = calculateTotalPrice()
          
          // Generate QR code with GCash payment link
          const qrData = `gcash://pay?number=${gcashNumber}&amount=${amount}&name=${accountName}`
          
          await QRCode.toCanvas(gcashQrCanvas.value, qrData, {
            width: 180,
            margin: 2,
            color: {
              dark: '#2e7d32',
              light: '#ffffff'
            }
          })
          console.log('GCash QR code generated successfully')
        } catch (error) {
          console.error('Failed to generate GCash QR code:', error)
        }
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

    watch(() => props.isOpen, (newValue) => {
      if (newValue) {
        fetchSports()
        fetchCourts()
      } else {
        resetForm()
      }
    })

    onMounted(() => {
      if (props.isOpen) {
        fetchSports()
        fetchCourts()
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
      gcashReferenceNumber,
      gcashQrCanvas,
      proofOfPayment,
      proofPreview,
      selectedSport,
      selectedCourts,
      selectedDate,
      courtTimeSlots,
      minDate,
      filteredCourts,
      canProceed,
      totalBookings,
      getSportIcon,
      selectSport,
      toggleCourt,
      isCourtSelected,
      allCourtsSelected,
      toggleSelectAllCourts,
      toggleTimeSlot,
      isTimeSlotSelected,
      nextStep,
      loadTimeSlots,
      formatTime,
      formatDate,
      calculateTotalPrice,
      handleProofUpload,
      generateGCashQR,
      handleImageError,
      addToCart,
      submitBookingWithGCash,
      submitBooking
    }
  }
}
</script>

<style scoped>
.booking-dialog {
  max-height: 90vh;
  overflow-y: auto;
  background: #ffffff !important;
}

.booking-dialog .v-card-text {
  background: #ffffff !important;
  color: #1f2937 !important;
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
</style>

<template>
  <div>
    <v-dialog
      :model-value="isOpen"
      @update:model-value="closeModal"
      max-width="900"
      fullscreen-on-mobile
    >
    <v-card class="booking-dialog-card">
      <div class="dialog-header">
        <div class="header-badge">
          <v-icon color="white" size="20" class="mr-2">{{ isEditMode ? 'mdi-pencil' : 'mdi-calendar-plus' }}</v-icon>
          {{ isEditMode ? 'Edit Booking' : 'New Booking' }}
        </div>
        <h2 class="dialog-title">
          <span class="title-gradient">{{ isEditMode ? 'Edit' : 'Book' }}</span> Your Court
        </h2>
        <p class="dialog-subtitle">
          {{ isEditMode ? 'Update your court reservation details' : 'Reserve your court with professional precision' }}
        </p>
      </div>

      <v-divider class="dialog-divider"></v-divider>

      <v-card-text class="pa-6">
        <!-- Court Selection -->
        <v-row class="mb-4">
          <v-col cols="12">
            <v-select
              v-model="form.court_id"
              :items="courts"
              item-title="name"
              item-value="id"
              label="Select Court"
              variant="outlined"
              prepend-inner-icon="mdi-stadium"
              :rules="[v => !!v || 'Court is required']"
              required
              @update:model-value="onCourtChange"
            >
              <template v-slot:item="{ props, item }">
                <v-list-item v-bind="props">
                  <template v-slot:prepend>
                    <CourtImageGallery
                      :images="item.raw.images || []"
                      :court-name="item.raw.name"
                      size="small"
                      @image-error="handleImageError"
                    />
                  </template>
                  <v-list-item-title>{{ item.raw.name }}</v-list-item-title>
                  <v-list-item-subtitle>{{ item.raw.sport.name }} - {{ formatPrice(item.raw.sport.price_per_hour) }}/hour</v-list-item-subtitle>
                </v-list-item>
              </template>
            </v-select>
          </v-col>
        </v-row>

        <!-- Frequency Selection -->
        <v-row v-if="selectedCourt">
          <v-col cols="12">
            <v-card variant="outlined" class="pa-4 mb-4">
              <h4 class="text-h6 mb-3">Booking Frequency</h4>
              <v-select
                v-model="frequencyType"
                :items="frequencyOptions"
                item-title="label"
                item-value="value"
                label="How often do you want to book?"
                placeholder="Select frequency"
                variant="outlined"
                prepend-inner-icon="mdi-repeat"
                @update:model-value="onFrequencyChange"
              ></v-select>
            </v-card>
          </v-col>
        </v-row>

        <!-- Selected Court Info -->
        <v-card v-if="selectedCourt" variant="outlined" class="mb-4">
          <v-card-text class="pa-4">
            <h3 class="text-h6 mb-3">
              <v-icon class="mr-2" color="primary">mdi-stadium</v-icon>
              Court Details
            </h3>
            <v-row>
              <v-col cols="12" md="6">
                <div class="text-body-2 mb-2">
                  <strong>Sport:</strong> {{ selectedCourt.sport.name }}
                </div>
                <div class="text-body-2 mb-2">
                  <strong>Location:</strong> {{ selectedCourt.location || 'N/A' }}
                </div>
                <div class="text-body-2">
                  <strong>Price per Hour:</strong> {{ formatPriceTemplate(selectedCourt?.sport?.price_per_hour) }}
                </div>
              </v-col>
              <v-col cols="12" md="6">
                <div v-if="selectedCourt.amenities && selectedCourt.amenities.length">
                  <strong class="text-body-2">Amenities:</strong>
                  <div class="d-flex flex-wrap gap-1 mt-1">
                    <v-chip
                      v-for="amenity in selectedCourt.amenities"
                      :key="amenity"
                      size="x-small"
                      color="primary"
                      variant="outlined"
                    >
                      {{ amenity }}
                    </v-chip>
                  </div>
                </div>
              </v-col>
            </v-row>

            <!-- Court Images Gallery -->
            <v-row v-if="selectedCourt.images && selectedCourt.images.length > 0">
              <v-col cols="12">
                <v-divider class="my-4"></v-divider>
                <h4 class="text-h6 mb-3">
                  <v-icon class="mr-2" color="primary">mdi-image-multiple</v-icon>
                  Court Images
                </h4>
                <CourtImageGallery
                  :images="selectedCourt.images"
                  :court-name="selectedCourt.name"
                  size="large"
                  @image-error="handleImageError"
                />
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>

        <!-- Frequency-Specific Fields -->
        <v-card v-if="selectedCourt && frequencyType !== 'once'" variant="outlined" class="mb-4">
          <v-card-text class="pa-4">
            <h3 class="text-h6 mb-3">Frequency Settings</h3>

            <!-- Days Selection for Weekly/Monthly/Yearly -->
            <v-row v-if="['weekly', 'monthly', 'yearly'].includes(frequencyType)">
              <v-col cols="12">
                <v-select
                  v-model="form.frequency_days"
                  :items="dayOptions"
                  item-title="label"
                  item-value="value"
                  label="Select Days"
                  placeholder="Choose which days"
                  variant="outlined"
                  prepend-inner-icon="mdi-calendar-week"
                  multiple
                  chips
                  :rules="[v => v && v.length > 0 || 'At least one day is required']"
                ></v-select>
              </v-col>
            </v-row>

            <!-- Duration -->
            <v-row>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="form.frequency_duration_months"
                  label="Duration (months)"
                  type="number"
                  min="1"
                  max="12"
                  :rules="[v => !!v || 'Duration is required', v => v >= 1 || 'Minimum 1 month']"
                  required
                  variant="outlined"
                  prepend-inner-icon="mdi-calendar-range"
                ></v-text-field>
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="form.frequency_end_date"
                  label="End Date (Optional)"
                  type="date"
                  variant="outlined"
                  prepend-inner-icon="mdi-calendar-end"
                  :min="form.date"
                  hint="Leave empty to use duration in months"
                  persistent-hint
                ></v-text-field>
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>

        <!-- Booking Form -->
        <v-form @submit.prevent="handleSubmit" v-if="selectedCourt">
          <v-row>
            <v-col cols="12" md="6">
              <v-text-field
                v-model="form.date"
                label="Start Date"
                type="date"
                :rules="[v => !!v || 'Date is required']"
                required
                variant="outlined"
                prepend-inner-icon="mdi-calendar"
                :min="today"
                @update:model-value="onDateChange"
              ></v-text-field>
            </v-col>

            <v-col cols="12" md="6">
              <v-select
                v-model="form.start_time"
                :items="availableSlots"
                item-title="title"
                item-value="value"
                label="Start Time"
                :rules="[v => !!v || 'Start time is required', validateStartTimeSelection]"
                required
                variant="outlined"
                prepend-inner-icon="mdi-clock-start"
                :disabled="!form.date || availableSlots.length === 0"
                :placeholder="availableSlots.length === 0 ? 'No available slots for this date' : 'Select a time'"
                @update:model-value="onStartTimeChange"
              >
                <!-- <template v-slot:selection="{ item }">
                  <span>{{ getSelectedTimeDisplay(item.value) }}</span>
                </template> -->
                <template v-slot:item="{ props, item }">
                  <v-list-item
                    v-bind="props"
                    :color="item.raw.color"
                    :disabled="item.raw.isBooked && !isEditMode"
                    :class="{
                      'booked-slot': item.raw.isBooked && !isEditMode,
                      'available-slot': !item.raw.isBooked || isEditMode
                    }"
                  >
                    <template v-slot:prepend>
                      <v-icon
                        :color="item.raw.isBooked && !isEditMode ? 'error' : 'success'"
                        :icon="item.raw.isBooked && !isEditMode ? 'mdi-calendar-remove' : 'mdi-calendar-check'"
                      ></v-icon>
                    </template>
                    <!-- <v-list-item-title
                      :class="{
                        'text-grey': item.raw.isBooked && !isEditMode,
                        'text-success': !item.raw.isBooked || isEditMode
                      }"
                    >
                      {{ item.raw.title }}
                    </v-list-item-title> -->
                    <v-list-item-subtitle v-if="item.raw.isBooked && !isEditMode" class="text-error">
                      <v-icon size="small" class="mr-1">mdi-lock</v-icon>
                      This slot is already booked and cannot be selected
                    </v-list-item-subtitle>
                    <v-list-item-subtitle v-else-if="!item.raw.isBooked" class="text-success">
                      <v-icon size="small" class="mr-1">mdi-check</v-icon>
                      Available for booking
                    </v-list-item-subtitle>
                  </v-list-item>
                </template>
              </v-select>
              <v-alert
                v-if="form.date && availableSlots.length === 0"
                type="warning"
                variant="tonal"
                class="mt-2"
                density="compact"
              >
                <v-icon class="mr-2">mdi-calendar-remove</v-icon>
                No available time slots for this date. Please choose a different date.
              </v-alert>
            </v-col>
          </v-row>

          <v-row>
            <v-col cols="12" md="6">
              <v-select
                v-model="form.duration"
                :items="durationOptions"
                label="Duration"
                :rules="[v => !!v || 'Duration is required']"
                required
                variant="outlined"
                prepend-inner-icon="mdi-clock-outline"
                @change="onDurationChange"
              >
                <template v-slot:item="{ props, item }">
                  <v-list-item
                    v-bind="props"
                    :disabled="!item.raw.isAvailable"
                    :class="{ 'text-red': !item.raw.isAvailable }"
                  >
                    <template v-slot:prepend>
                      <v-icon
                        :color="item.raw.isAvailable ? 'success' : 'error'"
                        :icon="item.raw.isAvailable ? 'mdi-check-circle' : 'mdi-close-circle'"
                      ></v-icon>
                    </template>

                    <v-list-item-subtitle v-if="!item.raw.isAvailable">
                      This duration conflicts with existing bookings
                    </v-list-item-subtitle>
                  </v-list-item>
                </template>
              </v-select>

              <!-- Duration Availability Alert -->
              <v-alert
                v-if="form.start_time && durationOptions.some(option => !option.isAvailable)"
                type="warning"
                variant="tonal"
                class="mt-2"
                density="compact"
              >
                <v-icon class="mr-2">mdi-alert-circle</v-icon>
                Some durations are not available for the selected start time due to existing bookings.
              </v-alert>
            </v-col>

            <v-col cols="12" md="6">
              <v-textarea
                v-model="form.notes"
                label="Notes (Optional)"
                placeholder="Any special requests or notes..."
                variant="outlined"
                prepend-inner-icon="mdi-note-text"
                rows="3"
                auto-grow
              ></v-textarea>
            </v-col>
          </v-row>

          <!-- Price Summary -->
          <v-card variant="outlined" class="mt-4">
            <v-card-text class="pa-4">
              <h4 class="text-h6 mb-3">Price Summary</h4>
              <div class="d-flex justify-space-between align-center">
                <div>
                  <div class="text-body-2">
                    <strong>Frequency:</strong> {{ getFrequencyLabel(frequencyType) }}
                  </div>
                  <div class="text-body-2" v-if="frequencyType !== 'once'">
                    <strong>Duration:</strong> {{ form.frequency_duration_months }} month(s)
                  </div>
                  <div class="text-body-2" v-if="form.frequency_days && form.frequency_days.length > 0">
                    <strong>Days:</strong> {{ getSelectedDaysLabel() }}
                  </div>
                </div>
                <div class="text-right">
                  <div class="text-h5 font-weight-bold text-success">
                    Total: {{ formatPriceTemplate(totalPrice) }}
                  </div>
                  <div class="text-caption text-medium-emphasis">
                    {{ getPriceBreakdown() }}
                  </div>
                </div>
              </div>
            </v-card-text>
          </v-card>

          <!-- GCash Payment Section - Only for pending bookings in edit mode -->
          <v-card variant="outlined" class="mt-4 gcash-payment-section">
            <v-card-text class="pa-4">
              <h4 class="text-h6 mb-3">
                <v-icon class="mr-2" color="success">mdi-cellphone</v-icon>
                GCash Payment
                <v-chip
                  :color="getPaymentStatusColor()"
                  variant="tonal"
                  size="small"
                  class="ml-2"
                >
                  {{ getPaymentStatusText() }}
                </v-chip>
              </h4>

              <!-- Payment Status Alert -->
              <v-alert
                :type="getPaymentStatusAlertType()"
                variant="tonal"
                class="mb-4"
                density="compact"
              >

                {{ getPaymentStatusMessage() }}
              </v-alert>

              <!-- Amount Display -->
              <v-row>
                <v-col cols="12">
                  <v-text-field
                    v-model="form.gcash_amount"
                    label="Amount to Pay"
                    variant="outlined"
                    prepend-inner-icon="mdi-currency-php"
                    readonly
                    :value="formatPriceTemplate(totalPrice)"
                    class="mb-4"
                  ></v-text-field>
                </v-col>
              </v-row>

              <!-- GCash QR Code Display -->
              <v-row>
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
                        <strong>Amount:</strong> {{ formatPriceTemplate(totalPrice) }}
                      </p>
                      <p class="text-caption">
                        Scan this QR code with your GCash app to complete payment
                      </p>
                    </div>
                  </v-card>
                </v-col>
              </v-row>

              <!-- Proof of Payment Upload -->
              <v-row>
                <v-col cols="12">
                  <v-file-input
                    v-model="form.proof_of_payment"
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
              <v-row v-if="editBooking?.proof_of_payment">
                <v-col cols="12">
                  <v-alert type="info" variant="tonal">
                    <div class="d-flex align-center">
                      <v-icon class="mr-2">mdi-file-image</v-icon>
                      <div class="flex-grow-1">
                        <strong>Current Proof of Payment:</strong>
                        <div class="mt-2">
                          <!-- Image Preview -->
                          <div class="proof-preview-container">
                            <img
                              :src="`${import.meta.env.VITE_API_URL}/storage/${editBooking.proof_of_payment}`"
                              :alt="'Proof of payment for booking #' + editBooking.id"
                              class="proof-preview-image"
                              @click="openImageDialog(editBooking.proof_of_payment)"
                            />
                            <div class="proof-preview-overlay">
                              <v-btn
                                size="small"
                                variant="elevated"
                                color="primary"
                                @click="openImageDialog(editBooking.proof_of_payment)"
                              >
                                <v-icon class="mr-1">mdi-eye</v-icon>
                                View Full Size
                              </v-btn>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </v-alert>
                </v-col>
              </v-row>
            </v-card-text>
          </v-card>

          <v-alert
            type="info"
            variant="tonal"
            class="mt-4"
          >

            {{ getBookingInfoText() }}
          </v-alert>

          <v-alert
            v-if="error"
            type="error"
            variant="tonal"
            class="mt-4"
          >
            {{ error }}
          </v-alert>
        </v-form>
      </v-card-text>

      <v-divider></v-divider>

      <v-card-actions class="pa-6">
        <v-spacer></v-spacer>
        <v-btn
          color="grey"
          variant="outlined"
          @click="handleCancel"
        >
          Cancel
        </v-btn>
        <v-btn
          color="primary"
          variant="elevated"
          @click="handleSubmit"
          :loading="loading"
          :disabled="loading || !isFrequencyFormValid"
        >
          {{ isEditMode ? 'Update Booking' : 'Submit for Approval' }}
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
  </div>
</template>

<script>
import { ref, computed, watch, onMounted } from 'vue'
import { courtService } from '../services/courtService'
import { bookingService } from '../services/bookingService'
import CourtImageGallery from './CourtImageGallery.vue'
import Swal from 'sweetalert2'
import { formatPrice, formatNumber } from '../utils/formatters'

export default {
  name: 'GlobalBookingDialog',
  components: {
    CourtImageGallery
  },
  props: {
    isOpen: {
      type: Boolean,
      default: false
    },
    editBooking: {
      type: Object,
      default: null
    }
  },
  emits: ['close', 'saved', 'show-snackbar'],
  setup(props, { emit }) {
    const availableSlots = ref([])
    const loading = ref(false)
    const error = ref('')
    const originalStartTime = ref(null)
    const slotsLoaded = ref(false)
    const isSelectingDate = ref(false)
    const courts = ref([])

    const frequencyType = ref('once')
    const isPopulatingForm = ref(false)

    // Image dialog
    const imageDialog = ref(false)
    const selectedImageUrl = ref('')

    // Computed property to determine if we're in edit mode
    const isEditMode = computed(() => !!props.editBooking)


    const form = ref({
      court_id: null,
      date: '',
      start_time: '',
      duration: 1,
      notes: '',
      frequency_days: [],
      frequency_times: [],
      frequency_duration_months: 1,
      frequency_end_date: '',
      payment_method: '',
      gcash_amount: '',
      proof_of_payment: null
    })

    const durationOptions = ref([
      { title: '1 hour', value: 1, isAvailable: true },
      { title: '2 hours', value: 2, isAvailable: true },
      { title: '3 hours', value: 3, isAvailable: true },
      { title: '4 hours', value: 4, isAvailable: true },
      { title: '5 hours', value: 5, isAvailable: true },
      { title: '6 hours', value: 6, isAvailable: true }
    ])

    // Frequency options
    const frequencyOptions = [
      { value: 'once', label: 'One Time Only' },
      { value: 'daily', label: 'Daily' },
      { value: 'weekly', label: 'Weekly' },
      { value: 'monthly', label: 'Monthly' },
      { value: 'yearly', label: 'Yearly' }
    ]

    const dayOptions = [
      { value: 0, label: 'Sunday' },
      { value: 1, label: 'Monday' },
      { value: 2, label: 'Tuesday' },
      { value: 3, label: 'Wednesday' },
      { value: 4, label: 'Thursday' },
      { value: 5, label: 'Friday' },
      { value: 6, label: 'Saturday' }
    ]


    const today = new Date().toISOString().split('T')[0]

    const selectedCourt = ref(null)

    const loadCourts = async () => {
      try {
        const courtsData = await courtService.getCourts()
        courts.value = courtsData.filter(court => court.is_active)

        // Set default court if none selected and not in edit mode
        if (!isEditMode.value && courts.value.length > 0 && !form.value.court_id) {
          form.value.court_id = courts.value[0].id
          selectedCourt.value = courts.value[0]
        }
      } catch (err) {
        console.error('Failed to load courts:', err)
        courts.value = []
      }
    }

    const onCourtChange = async () => {
      if (form.value.court_id) {
        selectedCourt.value = courts.value.find(c => c.id === form.value.court_id)
        // Clear time slots when court changes
        form.value.start_time = ''
        availableSlots.value = []

        // Reload available slots if date is selected
        if (form.value.date) {
          await loadAvailableSlots()
        }
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

    const totalPrice = computed(() => {
      if (!selectedCourt.value || !form.value.duration) return 0

      const basePrice = selectedCourt.value.sport.price_per_hour * form.value.duration

      // Calculate frequency multiplier
      if (frequencyType.value === 'once') {
        return basePrice
      } else if (frequencyType.value === 'daily') {
        // Daily: sessions every day for the duration period
        const daysInPeriod = form.value.frequency_duration_months * 30 // Approximate days per month
        return basePrice * daysInPeriod
      } else if (frequencyType.value === 'weekly') {
        // Weekly: sessions on selected days each week
        const sessionsPerWeek = form.value.frequency_days ? form.value.frequency_days.length : 1
        const weeksInPeriod = form.value.frequency_duration_months * 4 // Approximate weeks per month
        return basePrice * sessionsPerWeek * weeksInPeriod
      } else if (frequencyType.value === 'monthly') {
        // Monthly: sessions on selected days each month
        const sessionsPerMonth = form.value.frequency_days ? form.value.frequency_days.length : 1
        return basePrice * sessionsPerMonth * form.value.frequency_duration_months
      } else if (frequencyType.value === 'yearly') {
        // Yearly: sessions on selected days each month for 12 months
        const sessionsPerMonth = form.value.frequency_days ? form.value.frequency_days.length : 1
        const monthsInYear = 12
        return basePrice * sessionsPerMonth * monthsInYear
      }

      return basePrice
    })

    // Frequency validation
    const isFrequencyFormValid = computed(() => {
      if (!form.value.date || !form.value.start_time || !form.value.duration) return false

      // For edit mode, don't require available slots since we're editing an existing booking
      if (!isEditMode.value && availableSlots.value.length === 0) return false

      if (frequencyType.value === 'once') {
        return true
      } else if (['weekly', 'monthly', 'yearly'].includes(frequencyType.value)) {
        return form.value.frequency_days && form.value.frequency_days.length > 0 && form.value.frequency_duration_months
      } else {
        return form.value.frequency_duration_months
      }
    })

    // Helper functions
    const getFrequencyLabel = (frequencyType) => {
      const option = frequencyOptions.find(opt => opt.value === frequencyType)
      return option ? option.label : frequencyType
    }

    const getSelectedDaysLabel = () => {
      if (!form.value.frequency_days || form.value.frequency_days.length === 0) return 'N/A'
      return form.value.frequency_days.map(day => {
        const dayOption = dayOptions.find(opt => opt.value === day)
        return dayOption ? dayOption.label : day
      }).join(', ')
    }

    const getPriceBreakdown = () => {
      if (!selectedCourt.value) return ''

      const basePrice = selectedCourt.value.sport.price_per_hour * form.value.duration
      if (frequencyType.value === 'once') {
        return `${formatPrice(basePrice)} for ${form.value.duration}h`
      } else {
        const multiplier = getFrequencyMultiplier()
        const frequencyLabel = getFrequencyLabel(frequencyType.value)
        return `${selectedCourt.value.sport.price_per_hour} hr × ${multiplier} sessions (${frequencyLabel})`
      }
    }

    const getFrequencyMultiplier = () => {
      if (frequencyType.value === 'daily') {
        return form.value.frequency_duration_months * 30
      } else if (frequencyType.value === 'weekly') {
        const sessionsPerWeek = form.value.frequency_days ? form.value.frequency_days.length : 1
        return sessionsPerWeek * form.value.frequency_duration_months * 4
      } else if (frequencyType.value === 'monthly') {
        const sessionsPerMonth = form.value.frequency_days ? form.value.frequency_days.length : 1
        return sessionsPerMonth * form.value.frequency_duration_months
      } else if (frequencyType.value === 'yearly') {
        const sessionsPerMonth = form.value.frequency_days ? form.value.frequency_days.length : 1
        return sessionsPerMonth * 12 // 12 months in a year
      }
      return 1
    }

    const getBookingInfoText = () => {
      if (frequencyType.value === 'once') {
        return `Your booking will be submitted for admin approval.`
      } else {
        return `This frequency booking will be submitted for admin approval. You'll be billed once for the entire period`
      }
    }

    // Wrapper functions for template use
    const formatPriceTemplate = (price) => {
      return formatPrice(price)
    }

    const formatNumberTemplate = (number) => {
      return formatNumber(number)
    }

    // Check if a duration is available for the selected start time
    const checkDurationAvailability = () => {
      try {
        // Don't check if we're still loading or don't have all required data
        if (loading.value || !slotsLoaded.value || !form.value.start_time || !form.value.date || availableSlots.value.length === 0 || isSelectingDate.value) {
        // Reset all durations to available if no start time selected
        durationOptions.value.forEach(option => {
          option.isAvailable = true
          // option.title = `${option.value} hour${option.value > 1 ? 's' : ''}`
        })
          return
        }

        // Additional safety check - make sure we have valid slots before proceeding
        const hasValidSlots = availableSlots.value.some(slot =>
          slot && slot.start_time && slot.end_time &&
          typeof slot.start_time === 'string' && typeof slot.end_time === 'string'
        )

        if (!hasValidSlots) {
          return
        }



      // Extract start time from the selected slot
      let startTimeString = form.value.start_time

      // Add null/undefined checks before calling string methods
      if (!startTimeString || typeof startTimeString !== 'string') {
        console.warn('Invalid start_time value:', startTimeString)
        return
      }

      if (startTimeString.includes(' ')) {
        // If it's a full datetime, extract just the time part
        startTimeString = startTimeString.split(' ')[1] || startTimeString.split('T')[1] || startTimeString
      }
      if (startTimeString.includes('T')) {
        startTimeString = startTimeString.split('T')[1]
      }

      const [startHours, startMinutes] = startTimeString.split(':')
      const startTimeInMinutes = parseInt(startHours) * 60 + parseInt(startMinutes)

      // Check each duration option
      durationOptions.value.forEach(option => {
        const endTimeInMinutes = startTimeInMinutes + (option.value * 60)
        const endHours = Math.floor(endTimeInMinutes / 60)
        const endMinutes = endTimeInMinutes % 60

        // Check if this duration conflicts with any existing bookings
        const conflictsWithBooking = availableSlots.value.some(slot => {
          if (slot.is_booked) return false // Skip booked slots in our check

          // Parse slot times with null checks
          let slotStartTime = slot.start_time
          if (!slotStartTime || typeof slotStartTime !== 'string') {
            console.warn('Invalid slot start_time:', slotStartTime)

            // Show alert for invalid slot data
            Swal.fire({
              title: 'Invalid Time Slot Data',
              text: 'There was an issue with the time slot data. The start time has been reset to your original selection.',
              icon: 'warning',
              confirmButtonText: 'OK',
              confirmButtonColor: '#ff6b6b'
            })

            // Reset start time to original selection (if we have it stored)
            if (originalStartTime.value) {
              form.value.start_time = originalStartTime.value
            }

            return false
          }

          if (slotStartTime.includes(' ')) {
            slotStartTime = slotStartTime.split(' ')[1]
          }
          if (slotStartTime.includes('T')) {
            slotStartTime = slotStartTime.split('T')[1]
          }

          const [slotStartHours, slotStartMinutes] = slotStartTime.split(':')
          const slotStartTimeInMinutes = parseInt(slotStartHours) * 60 + parseInt(slotStartMinutes)

          let slotEndTime = slot.end_time
          if (!slotEndTime || typeof slotEndTime !== 'string') {
            console.warn('Invalid slot end_time:', slotEndTime)

            // Show alert for invalid slot data
            Swal.fire({
              title: 'Invalid Time Slot Data',
              text: 'There was an issue with the time slot data. The start time has been reset to your original selection.',
              icon: 'warning',
              confirmButtonText: 'OK',
              confirmButtonColor: '#ff6b6b'
            })

            // Reset start time to original selection (if we have it stored)
            if (originalStartTime.value) {
              form.value.start_time = originalStartTime.value
            }

            return false
          }

          if (slotEndTime.includes(' ')) {
            slotEndTime = slotEndTime.split(' ')[1]
          }
          if (slotEndTime.includes('T')) {
            slotEndTime = slotEndTime.split('T')[1]
          }

          const [slotEndHours, slotEndMinutes] = slotEndTime.split(':')
          const slotEndTimeInMinutes = parseInt(slotEndHours) * 60 + parseInt(slotEndMinutes)

          // Check for overlap
          return (startTimeInMinutes < slotEndTimeInMinutes && endTimeInMinutes > slotStartTimeInMinutes)
        })

        // Check if duration extends beyond court hours (assuming 6 AM to 10 PM)
        const courtCloseTime = 22 * 60 // 10 PM in minutes
        const isWithinCourtHours = endTimeInMinutes <= courtCloseTime

        option.isAvailable = !conflictsWithBooking && isWithinCourtHours

        // Update title with availability status
        if (option.isAvailable) {
          option.title = `${option.value} hour${option.value > 1 ? 's' : ''}`
        } else {
          option.title = `${option.value} hour${option.value > 1 ? 's' : ''} (Occupied)`
        }
      })
      } catch (error) {
        console.error('Error checking duration availability:', error)
        // Reset all durations to available on error
        durationOptions.value.forEach(option => {
          option.isAvailable = true
          // option.title = `${option.value} hour${option.value > 1 ? 's' : ''}`
        })
      }
    }

    const onFrequencyChange = (newFrequencyType) => {
      // Update the frequencyType ref
      frequencyType.value = newFrequencyType

      // Reset frequency-specific fields when changing type
      if (newFrequencyType === 'once') {
        form.value.frequency_days = []
        form.value.frequency_times = []
        form.value.frequency_duration_months = 1
      } else if (!['weekly', 'monthly', 'yearly'].includes(newFrequencyType)) {
        form.value.frequency_days = []
      }
    }

    const populateFormForEdit = () => {
      if (!props.editBooking) return

      const booking = props.editBooking

      // Set flag to prevent watchers from interfering
      isPopulatingForm.value = true

      // Set basic form data
      // Use the full datetime format for start_time
      let startTimeValue = ''
      if (typeof booking.start_time === 'string') {
        if (booking.start_time.includes(' ')) {
          // For SQL format like "2025-09-26 17:00:00", use as is
          startTimeValue = booking.start_time
        } else if (booking.start_time.includes('T')) {
          // For ISO format like "2025-09-26T17:00:00.000000Z", convert to SQL format
          const date = new Date(booking.start_time)
          startTimeValue = date.toISOString().replace('T', ' ').substring(0, 19)
        } else {
          // Already in HH:MM format, construct full datetime
          const date = new Date(booking.start_time)
          startTimeValue = date.toISOString().replace('T', ' ').substring(0, 19)
        }
      } else {
        // For Date objects, convert to SQL format
        startTimeValue = booking.start_time.toISOString().replace('T', ' ').substring(0, 19)
      }

      // Set date (use the original date from the booking)
      const startTimeDate = new Date(booking.start_time)
      form.value.date = startTimeDate.toISOString().split('T')[0]

      // Set start_time to the full datetime format
      form.value.start_time = startTimeValue
      form.value.duration = getDuration(booking.start_time, booking.end_time)
      form.value.notes = booking.notes || ''

      // Set frequency data
      frequencyType.value = booking.frequency_type || 'once'

      // Parse frequency_days if it's a string (from database JSON)
      let parsedFrequencyDays = []
      if (booking.frequency_days) {
        if (typeof booking.frequency_days === 'string') {
          try {
            parsedFrequencyDays = JSON.parse(booking.frequency_days)
          } catch (e) {
            console.warn('Failed to parse frequency_days:', booking.frequency_days)
            parsedFrequencyDays = []
          }
        } else if (Array.isArray(booking.frequency_days)) {
          parsedFrequencyDays = booking.frequency_days
        }
      }

      form.value.frequency_days = parsedFrequencyDays
      form.value.frequency_duration_months = booking.frequency_duration_months || 1
      form.value.frequency_end_date = booking.frequency_end_date || ''

      // Set payment data - GCash only
      form.value.payment_method = 'gcash'
      form.value.gcash_amount = formatPrice(totalPrice.value)
      form.value.proof_of_payment = null

      // Set court selection
      if (booking.court) {
        form.value.court_id = booking.court.id
        selectedCourt.value = booking.court
      }

      // Load available slots
     loadAvailableSlots()

      // Clear the flag after form population is complete
      isPopulatingForm.value = false
    }

    const getDuration = (startTime, endTime) => {
      const start = new Date(startTime)
      const end = new Date(endTime)
      const diffInHours = (end - start) / (1000 * 60 * 60)
      return Math.round(diffInHours)
    }

    // Get the display text for selected time
    const getSelectedTimeDisplay = (timeValue) => {
      if (!timeValue) return ''

      // Find the corresponding slot in availableSlots
      const selectedSlot = availableSlots.value.find(slot => slot.value === timeValue)
      if (selectedSlot) {
        return selectedSlot.title
      }

      // If not found in availableSlots, try to format the timeValue directly
      if (typeof timeValue === 'string') {
        // If it's a datetime string, extract just the time part
        if (timeValue.includes(' ')) {
          const timePart = timeValue.split(' ')[1]
          if (timePart) {
            const [hours, minutes] = timePart.split(':')
            return `${hours}:${minutes}`
          }
        }
        // If it's an ISO string
        if (timeValue.includes('T')) {
          const timePart = timeValue.split('T')[1]
          if (timePart) {
            const [hours, minutes] = timePart.split(':')
            return `${hours}:${minutes}`
          }
        }
      }

      return timeValue
    }

    const resetForm = () => {
      frequencyType.value = 'once'
      form.value = {
        court_id: null,
        date: '',
        start_time: '',
        duration: 1,
        notes: '',
        frequency_days: [],
        frequency_times: [],
        frequency_duration_months: 1,
        frequency_end_date: '',
        payment_method: 'gcash',
        gcash_amount: '',
        proof_of_payment: null
      }

      // Reset original start time
      originalStartTime.value = null
      availableSlots.value = []
      slotsLoaded.value = false
      error.value = ''
    }

    const loadAvailableSlots = async () => {
      if (!form.value.date || !form.value.court_id) {
        availableSlots.value = []
        return
      }

      try {
        slotsLoaded.value = false
        const slots = await courtService.getAvailableSlots(
          form.value.court_id,
          form.value.date,
          form.value.duration || 1
        )


        availableSlots.value = slots.map(slot => {
          // Use the full datetime format for the value
          let timeValue = slot.start_time
          if (typeof timeValue === 'string' && timeValue.includes('T')) {
            // Convert ISO format to SQL format
            timeValue = timeValue.replace('T', ' ').substring(0, 19)
          }

          // Add visual distinction for booked slots
          let displayTitle = slot.formatted_time
          let itemColor = 'primary' // Default color for available slots

          if (slot.is_booked) {
            displayTitle = `${slot.formatted_time} (Booked)`
            itemColor = 'error' // Red color for booked slots
          }

          return {
            title: displayTitle,
            value: timeValue,
            color: itemColor,
            isBooked: slot.is_booked || false,
            bookingId: slot.booking_id || null
          }
        })
        slotsLoaded.value = true
      } catch (err) {
        console.error('Failed to load available slots:', err)
        availableSlots.value = []
        slotsLoaded.value = true
      }
    }

    const onDateChange = async () => {
      // Only clear start_time if we're not populating the form for edit
      if (!isPopulatingForm.value) {
        form.value.start_time = ''
      }
      await loadAvailableSlots()

      // Auto-select the first available slot if not in edit mode
      if (!isEditMode.value && availableSlots.value.length > 0) {
        // Find the first available (non-booked) slot
        const firstAvailableSlot = availableSlots.value.find(slot => !slot.isBooked)
        if (firstAvailableSlot) {
          form.value.start_time = firstAvailableSlot.value
        } else {
          // If no available slots, select the first slot anyway (for edit mode compatibility)
          form.value.start_time = availableSlots.value[0].value
        }
      }
    }

    const handleSubmit = async () => {
      loading.value = true
      error.value = ''

      try {
        // Validate required fields
        if (!form.value.court_id || !form.value.date || !form.value.start_time) {
          throw new Error('Court, date and start time are required')
        }


        // Calculate end time based on start time and duration
        // Ensure start_time is in HH:MM format
        let startTimeString = form.value.start_time

        // Handle different time formats
        if (typeof startTimeString === 'string') {
          if (startTimeString.includes('T')) {
            // If it's a full datetime string with T separator, extract just the time part
            startTimeString = startTimeString.split('T')[1].substring(0, 5)
          } else if (startTimeString.includes(' ')) {
            // If it's a full datetime string with space separator, extract just the time part
            const timePart = startTimeString.split(' ')[1]
            startTimeString = timePart.substring(0, 5)
          } else if (!startTimeString.includes(':')) {
            throw new Error('Invalid start time format - no colon found')
          }
        } else {
          throw new Error('Start time must be a string')
        }

        // Ensure the time is in HH:MM format
        if (!/^\d{2}:\d{2}$/.test(startTimeString)) {
          console.error('Time format validation failed:', startTimeString)
          throw new Error('Time must be in HH:MM format')
        }

        // Construct datetime strings directly without Date objects to avoid timezone issues
        const [year, month, day] = form.value.date.split('-')
        const [startHours, startMinutes] = startTimeString.split(':')

        // Calculate end time by adding duration
        const startTimeInMinutes = parseInt(startHours) * 60 + parseInt(startMinutes)
        const endTimeInMinutes = startTimeInMinutes + (form.value.duration * 60)

        // Convert back to hours and minutes
        const endHours = Math.floor(endTimeInMinutes / 60)
        const endMinutes = endTimeInMinutes % 60

        // Format datetime strings directly
        const startDateTime = `${year}-${month}-${day} ${startHours.padStart(2, '0')}:${startMinutes.padStart(2, '0')}:00`
        const endDateTime = `${year}-${month}-${day} ${String(endHours).padStart(2, '0')}:${String(endMinutes).padStart(2, '0')}:00`

        const bookingData = {
          court_id: form.value.court_id,
          start_time: startDateTime,
          end_time: endDateTime,
          total_price: totalPrice.value,
          status: isEditMode.value ? props.editBooking.status : 'pending',
          notes: form.value.notes,
          frequency_type: frequencyType.value,
          frequency_days: form.value.frequency_days,
          frequency_times: form.value.frequency_times,
          frequency_duration_months: form.value.frequency_duration_months,
          frequency_end_date: form.value.frequency_end_date,
          payment_method: form.value.payment_method || null
        }


        let result
        if (isEditMode.value) {
          // Payment validation removed - users can update bookings regardless of payment status

          result = await courtService.updateBooking(props.editBooking.id, bookingData)

          // Handle proof of payment upload if provided
          const proofFile = Array.isArray(form.value.proof_of_payment) ? form.value.proof_of_payment[0] : form.value.proof_of_payment

          if (proofFile && proofFile instanceof File) {
            try {
              await uploadProofOfPayment(props.editBooking.id, proofFile)
              showSnackbar('Proof of payment uploaded successfully!', 'success')
            } catch (error) {
              console.error('Failed to upload proof of payment:', error)
              showSnackbar('Failed to upload proof of payment', 'error')
            }
          }

          // Dispatch event to refresh bookings table
          window.dispatchEvent(new CustomEvent('booking-updated'))
          showSnackbar('Booking updated successfully!', 'success')

          // Show SweetAlert success message
          Swal.fire({
            icon: 'success',
            title: 'Booking Updated!',
            text: 'Your booking has been updated successfully.',
            confirmButtonColor: '#1976d2',
            timer: 3000,
            timerProgressBar: true
          })
        } else {
          result = await courtService.createBooking(bookingData).then(async (response) => {
            if (form.value.proof_of_payment) {
              await uploadProofOfPayment(response.id, form.value.proof_of_payment)
            }
            showSnackbar('Proof of payment uploaded successfully!', 'success')
          }).catch((error) => {
            console.error('Failed to upload proof of payment:', error)
            showSnackbar('Failed to upload proof of payment', 'error')
          }).finally((error) => {
            console.error('Error creating booking:', error)
          })
          // Dispatch event to refresh bookings table
          window.dispatchEvent(new CustomEvent('booking-created'))
          showSnackbar('Booking created successfully!', 'success')

          // Show SweetAlert success message
          Swal.fire({
            icon: 'success',
            title: 'Booking Submitted!',
            text: 'Your booking has been submitted successfully and is pending admin approval.',
            confirmButtonColor: '#1976d2',
            timer: 4000,
            timerProgressBar: true
          })
        }

        // Close dialog
        closeModal()

      } catch (err) {
        console.error('Error creating booking:', err)
        error.value = err.message || 'Failed to create booking'
        showSnackbar('Error creating booking: ' + (err.message || 'Unknown error'), 'error')
      } finally {
        loading.value = false
      }
    }

    const closeModal = () => {
      resetForm()
      emit('close')
    }

    const handleCancel = () => {
      closeModal()
    }

    const showSnackbar = (message, type = 'info') => {
      emit('show-snackbar', { message, type })
    }

    // Payment-related methods
    const onPaymentMethodChange = (method) => {
      // Always set GCash amount since we only support GCash
      form.value.payment_method = 'gcash'
      form.value.gcash_amount = formatPrice(totalPrice.value)
    }

    const onProofOfPaymentChange = (event) => {
      // Extract files from the event target
      const files = event.target.files

      if (files && files.length > 0) {
        const file = files[0]

        if (file.size > 5000000) { // 5MB limit
          showSnackbar('File size should be less than 5 MB', 'error')
          form.value.proof_of_payment = null
          return
        }

        // Validate file type
        if (!file.type.startsWith('image/')) {
          showSnackbar('Please upload an image file', 'error')
          form.value.proof_of_payment = null
          return
        }

        // Assign the file to the form
        form.value.proof_of_payment = file
        showSnackbar('Proof of payment selected successfully!', 'success')
      }
    }

    const onDurationChange = (duration) => {
      // Check if the selected duration is available
      const selectedOption = durationOptions.value.find(option => option.value === duration)

      if (selectedOption && !selectedOption.isAvailable) {
        // Show alert for occupied duration
        Swal.fire({
          title: 'Duration Not Available',
          text: `The selected duration of ${duration} hour${duration > 1 ? 's' : ''} conflicts with existing bookings for the chosen start time. Please select a different duration or start time.`,
          icon: 'warning',
          confirmButtonText: 'OK',
          confirmButtonColor: '#ff6b6b'
        })

        // Reset to a available duration (preferably 1 hour)
        const availableOption = durationOptions.value.find(option => option.isAvailable)
        if (availableOption) {
          form.value.duration = availableOption.value
        }
      }
    }

    // Validation function for start time selection
    const validateStartTimeSelection = (value) => {
      if (!value) return true // Let required rule handle empty values

      // Find the selected slot
      const selectedSlot = availableSlots.value.find(slot => slot.value === value)

      if (selectedSlot && selectedSlot.isBooked && !isEditMode.value) {
        return 'This time slot is already booked and cannot be selected'
      }

      return true
    }

    // Handler for start time changes
    const onStartTimeChange = (value) => {
      if (!value) return

      // Find the selected slot
      const selectedSlot = availableSlots.value.find(slot => slot.value === value)

      if (selectedSlot && selectedSlot.isBooked && !isEditMode.value) {
        // Show alert for booked slot
        Swal.fire({
          title: 'Time Slot Not Available',
          text: `The selected time slot "${selectedSlot.title}" is already booked. Please select an available time slot.`,
          icon: 'warning',
          confirmButtonText: 'OK',
          confirmButtonColor: '#ff6b6b'
        })

        // Reset to empty or find an available slot
        const availableSlot = availableSlots.value.find(slot => !slot.isBooked)
        if (availableSlot) {
          form.value.start_time = availableSlot.value
        } else {
          form.value.start_time = null
        }

        return
      }

      // If the selection is valid, trigger duration availability check
      checkDurationAvailability()
    }

    const resetToOriginalStartTime = () => {
      if (originalStartTime.value) {
        form.value.start_time = originalStartTime.value
        Swal.fire({
          title: 'Start Time Reset',
          text: 'The start time has been reset to your original selection.',
          icon: 'success',
          confirmButtonText: 'OK',
          confirmButtonColor: '#4caf50'
        })
      }
    }

    const viewProofOfPayment = () => {
      if (props.editBooking?.proof_of_payment) {
        // Open proof of payment in a new window/tab
        window.open(props.editBooking.proof_of_payment, '_blank')
      }
    }

    const openImageDialog = (imageUrl) => {
      selectedImageUrl.value = `${import.meta.env.VITE_API_URL}/storage/${imageUrl}`
      imageDialog.value = true
    }

    const downloadImage = () => {
      if (selectedImageUrl.value) {
        const link = document.createElement('a')
        link.href = selectedImageUrl.value
        link.download = `proof_of_payment_${props.editBooking?.id || 'booking'}.jpg`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
      }
    }

    const uploadProofOfPayment = async (bookingId, file) => {
      try {
        const result = await bookingService.uploadProofOfPayment(
          bookingId,
          file,
          form.value.payment_method
        )

        return result.data
      } catch (error) {
        console.error('Error uploading proof of payment:', error)
        throw error
      }
    }

    // Payment status helper functions
    const getPaymentStatus = () => {
      if (!props.editBooking || props.editBooking.status !== 'pending') return 'not_required'

      const hasPaymentMethod = form.value.payment_method && form.value.payment_method.trim() !== ''
      const hasNewProof = form.value.proof_of_payment && (Array.isArray(form.value.proof_of_payment) ? form.value.proof_of_payment.length > 0 : form.value.proof_of_payment instanceof File)
      const hasExistingProof = props.editBooking.proof_of_payment && props.editBooking.proof_of_payment.trim() !== ''
      const hasProofOfPayment = hasNewProof || hasExistingProof

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

    const getPaymentStatusColor = () => {
      const status = getPaymentStatus()
      const colors = {
        complete: 'success',
        missing_proof: 'warning',
        missing_method: 'warning',
        incomplete: 'error',
        not_required: 'info'
      }
      return colors[status] || 'info'
    }

    const getPaymentStatusText = () => {
      const status = getPaymentStatus()
      const texts = {
        complete: 'Payment Complete',
        missing_proof: 'Missing Proof',
        missing_method: 'Missing Method',
        incomplete: 'Incomplete',
        not_required: 'Not Required'
      }
      return texts[status] || 'Unknown'
    }

    const getPaymentStatusAlertType = () => {
      const status = getPaymentStatus()
      const types = {
        complete: 'success',
        missing_proof: 'warning',
        missing_method: 'warning',
        incomplete: 'error',
        not_required: 'info'
      }
      return types[status] || 'info'
    }

    const getPaymentStatusIcon = () => {
      const status = getPaymentStatus()
      const icons = {
        complete: 'mdi-check-circle',
        missing_proof: 'mdi-camera-off',
        missing_method: 'mdi-credit-card-off',
        incomplete: 'mdi-alert-circle',
        not_required: 'mdi-information'
      }
      return icons[status] || 'mdi-information'
    }

    const getPaymentStatusMessage = () => {
      const status = getPaymentStatus()
      const messages = {
        complete: 'Payment method and proof of payment are complete. This booking can be approved.',
        missing_proof: 'Payment method is set but proof of payment is missing. Please upload a screenshot of your GCash payment confirmation.',
        missing_method: 'Proof of payment is uploaded but payment method is missing. Please ensure GCash is selected.',
        incomplete: 'Both payment method and proof of payment are missing. Please complete both to enable approval.',
        not_required: 'Payment is not required for this booking status.'
      }
      return messages[status] || 'Unknown payment status.'
    }

    const isPaymentIncomplete = () => {
      if (!isEditMode.value || !props.editBooking || props.editBooking.status !== 'pending') {
        return false
      }

      const status = getPaymentStatus()

      // For edit mode, only block if payment is completely missing (no method AND no proof)
      // Allow updates if user has payment method but missing proof, or vice versa
      return status === 'incomplete'
    }

    // Watch for changes in date to load available slots
    watch(() => form.value.date, (newDate) => {
      if (newDate && !isPopulatingForm.value) {
        isSelectingDate.value = true
        loadAvailableSlots()
        // Reset the flag after a delay
        setTimeout(() => {
          isSelectingDate.value = false
        }, 1000)
      }
    })

    // Watch for changes in duration to reload available slots
    watch(() => form.value.duration, () => {
      if (form.value.date && !isPopulatingForm.value) {
        loadAvailableSlots()
      }
    })

    // Watch for changes in start time to check duration availability
    watch(() => form.value.start_time, (newStartTime) => {
      if (!isPopulatingForm.value) {
        // Store the original start time when user first selects it
        if (newStartTime && !originalStartTime.value) {
          originalStartTime.value = newStartTime
        }

        // Only check duration availability if we have a date, slots are loaded, not loading, user actually selected a time, and not selecting date
        if (form.value.date && availableSlots.value.length > 0 && !loading.value && slotsLoaded.value && newStartTime && !isSelectingDate.value) {
          // Add a longer delay to ensure everything is fully processed
          setTimeout(() => {
            // Double-check all conditions before checking duration
            if (form.value.date && availableSlots.value.length > 0 && !loading.value && slotsLoaded.value && form.value.start_time && !isSelectingDate.value) {
              checkDurationAvailability()
            }
          }, 500)
        }
      }
    })

    // Watch for changes in available slots to check duration availability
    watch(() => availableSlots.value, (newSlots) => {
      // Only check if we have a start time selected and valid slots
      if (!isPopulatingForm.value && newSlots && newSlots.length > 0 && !loading.value && slotsLoaded.value && form.value.start_time && form.value.date && !isSelectingDate.value) {
        // Add a longer delay to ensure slots are fully processed and loading is complete
        setTimeout(() => {
          // Double-check that we're not loading before checking duration
          if (!loading.value && slotsLoaded.value && form.value.start_time && form.value.date && !isSelectingDate.value) {
            checkDurationAvailability()
          }
        }, 500)
      }
    }, { deep: true })

    // Watch for changes in total price to update GCash amount
    watch(() => totalPrice.value, (newPrice) => {
      if (isEditMode.value && form.value.payment_method === 'gcash') {
        form.value.gcash_amount = `₱${newPrice.toFixed(2)}`
      }
    })

    // Watch for changes in editBooking prop to populate form
    watch(() => props.editBooking, (newBooking) => {
      if (newBooking) {
        populateFormForEdit()
      } else {
        resetForm()
      }
    }, { immediate: true })

    onMounted(() => {
      loadCourts()
    })

    return {
      courts,
      availableSlots,
      loading,
      error,
      form,
      frequencyType,
      selectedCourt,
      totalPrice,
      isFrequencyFormValid,
      isEditMode,
      durationOptions,
      frequencyOptions,
      dayOptions,
      today,
      getFrequencyLabel,
      getSelectedDaysLabel,
      getPriceBreakdown,
      getBookingInfoText,
      onFrequencyChange,
      onCourtChange,
      onDateChange,
      handleSubmit,
      handleImageError,
      closeModal,
      handleCancel,
      showSnackbar,
      populateFormForEdit,
      getDuration,
      getSelectedTimeDisplay,
      // Payment methods
      onPaymentMethodChange,
      onProofOfPaymentChange,
      onDurationChange,
      validateStartTimeSelection,
      onStartTimeChange,
      resetToOriginalStartTime,
      viewProofOfPayment,
      uploadProofOfPayment,
      // Payment status functions
      getPaymentStatus,
      getPaymentStatusColor,
      getPaymentStatusText,
      getPaymentStatusAlertType,
      getPaymentStatusIcon,
      getPaymentStatusMessage,
      isPaymentIncomplete,
      // Image dialog
      imageDialog,
      selectedImageUrl,
      openImageDialog,
      downloadImage,
      // Form population flag
      isPopulatingForm,
      formatPrice,
      formatNumber,
      formatPriceTemplate,
      formatNumberTemplate,
      checkDurationAvailability,
      originalStartTime,
      slotsLoaded,
      isSelectingDate
    }
  }
}
</script>

<style scoped>
/* Modern Sports Booking Dialog Theme */
.booking-dialog-card {
  border-radius: 20px !important;
  overflow: hidden;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3) !important;
}

.dialog-header {
  background: linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%);
  padding: 32px;
  text-align: center;
  position: relative;
}

.dialog-header::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background:
    radial-gradient(circle at 20% 80%, rgba(59, 130, 246, 0.2) 0%, transparent 50%),
    radial-gradient(circle at 80% 20%, rgba(16, 185, 129, 0.2) 0%, transparent 50%);
  z-index: 1;
}

.header-badge {
  display: inline-flex;
  align-items: center;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 50px;
  padding: 8px 20px;
  margin-bottom: 16px;
  color: white;
  font-weight: 600;
  font-size: 14px;
  letter-spacing: 0.5px;
  position: relative;
  z-index: 2;
}

.dialog-title {
  font-size: clamp(1.8rem, 3vw, 2.5rem);
  font-weight: 800;
  line-height: 1.1;
  margin-bottom: 16px;
  color: white;
  position: relative;
  z-index: 2;
}

.title-gradient {
  background: linear-gradient(135deg, #3b82f6 0%, #10b981 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.dialog-subtitle {
  font-size: 1rem;
  color: rgba(255, 255, 255, 0.8);
  margin: 0;
  line-height: 1.6;
  position: relative;
  z-index: 2;
}

.dialog-divider {
  border-color: rgba(255, 255, 255, 0.1) !important;
  margin: 0 !important;
}

.price-summary {
  background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
  border-radius: 12px;
  padding: 20px;
  border: 1px solid rgba(59, 130, 246, 0.1);
}

.proof-preview-container {
  position: relative;
  display: inline-block;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  cursor: pointer;
  transition: transform 0.2s ease;
}

.proof-preview-container:hover {
  transform: scale(1.02);
}

.proof-preview-image {
  width: 150px;
  height: 100px;
  object-fit: cover;
  display: block;
}

.proof-preview-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.2s ease;
}

.proof-preview-container:hover .proof-preview-overlay {
  opacity: 1;
}

.full-size-image {
  max-width: 100%;
  height: auto;
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0,0,0,0.1);
}

.price-breakdown {
  font-size: 12px;
  color: #6b7280;
}

.qr-code-container {
  display: flex;
  justify-content: center;
  align-items: center;
}

.qr-code-image {
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.payment-section {
  background: #f8f9fa;
  border-radius: 8px;
  padding: 16px;
  margin-top: 16px;
}

.payment-method-card {
  background: #e8f5e8;
  border: 1px solid #4caf50;
  border-radius: 8px;
}

.gcash-qr-section {
  background: linear-gradient(135deg, #4caf50, #66bb6a);
  color: white;
  border-radius: 8px;
  padding: 20px;
  text-align: center;
}

.gcash-payment-section {
  background: linear-gradient(135deg, #e8f5e8, #f1f8e9);
  border: 2px solid #4caf50;
  border-radius: 12px;
}

.gcash-header {
  background: linear-gradient(135deg, #4caf50, #66bb6a);
  color: white;
  border-radius: 8px 8px 0 0;
  padding: 16px;
  margin: -16px -16px 16px -16px;
}

.proof-upload-section {
  background: #fff3e0;
  border: 1px solid #ff9800;
  border-radius: 8px;
  padding: 16px;
}

/* Booked Slot Styling */
.booked-slot {
  background-color: rgba(244, 67, 54, 0.05) !important;
  border-left: 3px solid #f44336 !important;
  opacity: 0.7 !important;
  cursor: not-allowed !important;
}

.booked-slot:hover {
  background-color: rgba(244, 67, 54, 0.1) !important;
  transform: none !important;
}

.available-slot {
  background-color: rgba(76, 175, 80, 0.05) !important;
  border-left: 3px solid #4caf50 !important;
  cursor: pointer !important;
}

.available-slot:hover {
  background-color: rgba(76, 175, 80, 0.1) !important;
  transform: translateX(4px) !important;
}

/* Enhanced text styling for slots */
.text-grey {
  color: #9e9e9e !important;
  text-decoration: line-through;
}

.text-success {
  color: #4caf50 !important;
  font-weight: 600;
}

.text-error {
  color: #f44336 !important;
  font-weight: 500;
}

/* Court Image Styles */
.court-select-image {
  width: 40px;
  height: 40px;
  border-radius: 8px;
  object-fit: cover;
  border: 2px solid #e5e7eb;
}
</style>
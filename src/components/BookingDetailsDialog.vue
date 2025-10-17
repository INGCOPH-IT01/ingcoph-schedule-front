<template>
  <v-dialog
    :model-value="isOpen"
    @update:model-value="$emit('update:isOpen', $event)"
    max-width="800px"
    class="booking-view-dialog"
    persistent
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
              <span class="detail-value">{{ booking.user?.name || 'N/A' }}</span>
            </div>
            <v-divider class="my-2"></v-divider>
            <div class="detail-row">
              <span class="detail-label">Email:</span>
              <span class="detail-value">{{ booking.user?.email || 'N/A' }}</span>
            </div>
            <v-divider class="my-2"></v-divider>
            <div class="detail-row">
              <span class="detail-label">Phone:</span>
              <span class="detail-value">{{ booking.user?.phone || 'N/A' }}</span>
            </div>
            <template v-if="showAdminFeatures">
              <v-divider class="my-2"></v-divider>
              <div class="detail-row">
                <span class="detail-label">User ID:</span>
                <span class="detail-value">#{{ booking.user?.id || 'N/A' }}</span>
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
              <span class="detail-value">{{ courtName || 'N/A' }}</span>
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
                  <v-avatar :color="sportService.getSportColor(item.court?.sport?.name)" size="40">
                    <v-icon color="white">{{ sportService.getSportIcon(item.court?.sport?.name, item.court?.sport?.icon) }}</v-icon>
                  </v-avatar>
                </template>
                <v-list-item-title class="font-weight-bold">
                  {{ item.court?.name || 'Unknown Court' }}
                </v-list-item-title>
                <v-list-item-subtitle>
                  {{ item.court?.sport?.name || 'Unknown Sport' }} •
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

        <!-- Attendance Status (Admin only, for approved bookings) -->
        <div class="detail-section mb-4" v-if="showAdminFeatures && (booking.approval_status === 'approved' || !isTransaction)">
          <h4 class="detail-section-title">
            <v-icon class="mr-2" color="primary">mdi-account-check</v-icon>
            Attendance Status
          </h4>
          <v-card variant="outlined" class="pa-4">
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
              <div class="d-flex flex-wrap gap-2">
                <v-btn
                  color="success"
                  :variant="booking.attendance_status === 'showed_up' ? 'flat' : 'outlined'"
                  prepend-icon="mdi-check-circle"
                  size="small"
                  @click="handleAttendanceUpdate('showed_up')"
                  :disabled="updatingAttendance"
                >
                  Showed Up
                </v-btn>
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
    <v-dialog v-model="imageDialog" max-width="800">
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
  </v-dialog>
</template>

<script>
import { computed, ref } from 'vue'
import { cartService } from '../services/cartService'
import { sportService } from '../services/sportService'
import { statusService } from '../services/statusService'
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

    const closeDialog = () => {
      emit('update:isOpen', false)
      emit('close')
    }

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

    const handleAttendanceUpdate = async (status) => {
      if (!props.booking?.id) return

      try {
        updatingAttendance.value = true
        await cartService.updateAttendanceStatus(props.booking.id, status)

        // Update the booking object
        if (props.booking) {
          props.booking.attendance_status = status
        }

        emit('attendance-updated', { bookingId: props.booking.id, status })
      } catch (error) {
        console.error('Failed to update attendance status:', error)
      } finally {
        updatingAttendance.value = false
      }
    }

    // Proof of payment viewing
    const viewProofOfPayment = () => {
      if (props.booking?.proof_of_payment) {
        selectedImageUrl.value = `${import.meta.env.VITE_API_URL}/storage/${props.booking.proof_of_payment}`
        imageDialog.value = true
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

    const handleImageError = (event) => {
      console.error('Image failed to load:', event)
    }

    // Computed properties
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

    return {
      // State
      imageDialog,
      selectedImageUrl,
      updatingAttendance,
      isTransaction,
      // Methods
      closeDialog,
      formatTimeSlot,
      formatPrice,
      formatBookingDate,
      handleAttendanceUpdate,
      viewProofOfPayment,
      downloadImage,
      handleImageError,
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
      // Computed
      formattedDate,
      formattedTimeRange,
      totalPrice,
      formattedCreatedAt,
      bookingStatus,
      statusColor,
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

/* Utility Classes */
.gap-1 {
  gap: 4px;
}

.gap-2 {
  gap: 8px;
}

/* Responsive adjustments */
@media (max-width: 600px) {
  .booking-view-dialog .detail-row {
    flex-direction: column;
    align-items: flex-start;
    gap: 4px;
  }

  .booking-view-dialog .detail-value {
    text-align: left;
  }
}
</style>

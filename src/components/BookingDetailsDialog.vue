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
          </v-card>
        </div>

        <!-- Booking Information -->
        <div class="detail-section mb-4">
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

        <!-- Time Slots Details (if available) -->
        <div class="detail-section mb-4" v-if="booking.cart_items && booking.cart_items.length > 0">
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

        <!-- Payment Information -->
        <div class="detail-section mb-4">
          <h4 class="detail-section-title">
            <v-icon class="mr-2" color="primary">mdi-cash</v-icon>
            Payment Information
          </h4>
          <v-card variant="outlined" class="pa-4">
            <div class="detail-row">
              <span class="detail-label">Payment Method:</span>
              <span class="detail-value">{{ booking.payment_method || 'N/A' }}</span>
            </div>
            <v-divider class="my-2"></v-divider>
            <div class="detail-row">
              <span class="detail-label">Total Amount:</span>
              <span class="detail-value font-weight-bold text-h6 text-success">₱{{ totalPrice }}</span>
            </div>
            <v-divider class="my-2"></v-divider>
            <div class="detail-row">
              <span class="detail-label">Created At:</span>
              <span class="detail-value">{{ formattedCreatedAt }}</span>
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
  </v-dialog>
</template>

<script>
import { computed } from 'vue'

export default {
  name: 'BookingDetailsDialog',
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
    }
  },
  emits: ['update:isOpen', 'close'],
  setup(props, { emit }) {
    const closeDialog = () => {
      emit('update:isOpen', false)
      emit('close')
    }

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

    const getStatusColor = (status) => {
      const colors = {
        'pending': 'orange',
        'approved': 'success',
        'rejected': 'error',
        'completed': 'blue',
        'cancelled': 'grey',
        'confirmed': 'success',
        'warning': 'warning',
        'info': 'info'
      }
      return colors[status?.toLowerCase()] || 'grey'
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
      return getStatusColor(bookingStatus.value)
    })

    return {
      closeDialog,
      formatTimeSlot,
      formatPrice,
      formattedDate,
      formattedTimeRange,
      totalPrice,
      formattedCreatedAt,
      bookingStatus,
      statusColor
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

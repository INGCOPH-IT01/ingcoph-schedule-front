<template>
  <v-card
    class="booking-card-compact"
    :class="{
      'pending-card': booking.approval_status === 'pending' || booking.approval_status === 'pending_waitlist',
      'approved-card': booking.approval_status === 'approved',
      'rejected-card': booking.approval_status === 'rejected'
    }"
    elevation="2"
  >
    <!-- Status Banner -->
    <div v-if="isExpired" class="status-banner-compact expired-banner">
      <v-icon size="x-small" class="mr-1">mdi-clock-remove</v-icon>
      EXPIRED
    </div>
    <div v-else-if="booking.approval_status === 'pending_waitlist'" class="status-banner-compact waitlist-banner">
      <v-icon size="x-small" class="mr-1">mdi-clock-check</v-icon>
      WAITLIST PENDING
    </div>
    <div v-else-if="booking.approval_status === 'pending'" class="status-banner-compact pending-banner">
      <v-icon size="x-small" class="mr-1">mdi-clock-alert</v-icon>
      PENDING
    </div>
    <div v-else-if="booking.approval_status === 'approved'" class="status-banner-compact approved-banner">
      <v-icon size="x-small" class="mr-1">mdi-check-circle</v-icon>
      APPROVED
    </div>
    <div v-else-if="booking.approval_status === 'rejected'" class="status-banner-compact rejected-banner">
      <v-icon size="x-small" class="mr-1">mdi-close-circle</v-icon>
      REJECTED
    </div>

    <v-card-text class="pa-3">
      <!-- Booking Date Header -->
      <div class="booking-date-header">
        <v-icon color="primary" size="16" class="mr-1">mdi-calendar</v-icon>
        <span class="booking-date-text">
          {{ formattedDate }}
        </span>
      </div>

      <!-- Court Info -->
      <div class="booking-court-info-compact">
        <div>
          <h4 class="court-name-compact">{{ booking.court?.name || 'Unknown Court' }}</h4>
          <v-chip
            :color="sportColor"
            size="x-small"
            variant="flat"
            class="text-white mt-1"
          >
            <v-icon start size="x-small">
              {{ sportIcon }}
            </v-icon>
            {{ booking.sport?.name || 'Unknown Sport' }}
          </v-chip>
        </div>
      </div>

      <!-- Booking Details -->
      <div class="booking-details-compact">
        <!-- Time Slots (Grouped) -->
        <div class="detail-row-compact">
          <div class="detail-icon-compact time-icon">
            <v-icon color="white" size="16">mdi-clock-outline</v-icon>
          </div>
          <div class="detail-content-compact">
            <div class="detail-label-compact">Time Slots</div>
            <div class="detail-value-compact">
              <div class="time-slots-group">
                <div class="time-slot-display">
                  {{ groupedTimeDisplay }}
                </div>
                <v-chip size="x-small" color="blue-grey" variant="flat" class="ml-1 text-white">
                  {{ booking.cart_items.length }} slot{{ booking.cart_items.length > 1 ? 's' : '' }}
                </v-chip>
              </div>
            </div>
          </div>
        </div>

        <!-- Price -->
        <div class="detail-row-compact">
          <div class="detail-icon-compact price-icon">
            <v-icon color="white" size="16">mdi-cash</v-icon>
          </div>
          <div class="detail-content-compact">
            <div class="detail-label-compact">Price</div>
            <div class="detail-value-compact price-value-compact">
              ₱{{ parseFloat(booking.price).toFixed(2) }}
            </div>
          </div>
        </div>

        <!-- Booked By / Booked For -->
        <div class="detail-row-compact" :class="{ 'admin-booking-highlight': bookedForName }">
          <div class="detail-icon-compact user-icon">
            <v-icon color="white" size="16">mdi-account</v-icon>
          </div>
          <div class="detail-content-compact">
            <div class="detail-label-compact">
              {{ bookedForName ? 'Booked For' : 'User' }}
            </div>
            <div class="detail-value-compact">
              {{ bookedForName || booking.user?.name || 'Unknown' }}
              <v-chip
                v-if="bookedForName"
                size="x-small"
                color="info"
                variant="outlined"
                class="ml-1"
              >
                By: {{ booking.user?.name || 'Admin' }}
              </v-chip>
            </div>
          </div>
        </div>

        <!-- Payment Status -->
        <div class="detail-row-compact">
          <div class="detail-icon-compact payment-icon">
            <v-icon color="white" size="16">mdi-credit-card-check</v-icon>
          </div>
          <div class="detail-content-compact">
            <div class="detail-label-compact">Payment</div>
            <div class="detail-value-compact">
              <v-chip
                :color="booking.payment_status === 'paid' ? 'success' : 'warning'"
                size="x-small"
                variant="flat"
                class="text-white"
              >
                {{ booking.payment_status === 'paid' ? 'Paid' : 'Unpaid' }}
              </v-chip>
            </div>
          </div>
        </div>

        <!-- Rejection Reason -->
        <div v-if="booking.approval_status === 'rejected' && booking.rejection_reason" class="rejection-notice-compact mt-2">
          <v-icon color="error" size="16" class="mr-1">mdi-alert-circle</v-icon>
          <div class="rejection-text-compact">{{ booking.rejection_reason }}</div>
        </div>
      </div>

      <!-- Actions -->
      <div class="booking-actions-compact">
        <v-btn
          v-if="booking.approval_status === 'approved' && booking.qr_code"
          icon="mdi-qrcode"
          size="x-small"
          variant="tonal"
          color="success"
          @click="$emit('view', booking)"
          title="Show QR Code"
        ></v-btn>
        <v-btn
          v-if="booking.approval_status === 'pending' || booking.approval_status === 'pending_waitlist'"
          icon="mdi-eye"
          size="x-small"
          variant="tonal"
          color="primary"
          @click="$emit('view', booking)"
          title="View Details"
        ></v-btn>
        <v-btn
          v-if="booking.approval_status === 'rejected'"
          icon="mdi-information"
          size="x-small"
          variant="tonal"
          color="error"
          @click="$emit('view', booking)"
          title="View Rejection Reason"
        ></v-btn>
        <v-btn
          v-if="showCancelButton"
          icon="mdi-delete"
          size="x-small"
          variant="tonal"
          color="error"
          @click="$emit('cancel', booking)"
          title="Cancel Booking"
        ></v-btn>
      </div>
    </v-card-text>
  </v-card>
</template>

<script>
import { computed } from 'vue'
import { sportService } from '../services/sportService'
import { formatDate } from '../utils/formatters'

export default {
  name: 'BookingCard',
  props: {
    booking: {
      type: Object,
      required: true
    }
  },
  emits: ['view', 'cancel'],
  setup(props) {
    // Check if booking is expired
    const isExpired = computed(() => {
      if (!props.booking.booking_date) return false
      const bookingDate = new Date(props.booking.booking_date)
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      return bookingDate < today
    })

    // Format the booking date
    const formattedDate = computed(() => {
      if (!props.booking.booking_date) return 'Unknown Date'
      return formatDate(props.booking.booking_date)
    })

    // Get sport color
    const sportColor = computed(() => {
      return sportService.getSportColor(props.booking.sport?.name)
    })

    // Get sport icon
    const sportIcon = computed(() => {
      return sportService.getSportIcon(props.booking.sport?.name, props.booking.sport?.icon)
    })

    // Get grouped time display
    const groupedTimeDisplay = computed(() => {
      if (!props.booking.cart_items || props.booking.cart_items.length === 0) {
        return 'No time slots'
      }

      // Group cart items by date
      const dateGroups = {}
      props.booking.cart_items.forEach(item => {
        const date = new Date(item.start_time).toDateString()
        if (!dateGroups[date]) {
          dateGroups[date] = []
        }
        dateGroups[date].push(item)
      })

      // Format display for multiple dates
      const dateGroupsArray = Object.entries(dateGroups)
      if (dateGroupsArray.length === 1) {
        // Single date - show all time slots
        const items = dateGroupsArray[0][1]
        items.sort((a, b) => new Date(a.start_time) - new Date(b.start_time))

        if (items.length <= 2) {
          return items.map(item => {
            const start = new Date(item.start_time)
            const end = new Date(item.end_time)
            return `${start.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })} - ${end.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}`
          }).join(', ')
        } else {
          const first = items[0]
          const last = items[items.length - 1]
          const start = new Date(first.start_time)
          const end = new Date(last.end_time)
          return `${start.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })} - ${end.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}`
        }
      } else {
        // Multiple dates
        return `${dateGroupsArray.length} days`
      }
    })

    // Get "booked for" name (for admin bookings)
    const bookedForName = computed(() => {
      if (!props.booking.cart_items || props.booking.cart_items.length === 0) {
        return null
      }
      return props.booking.cart_items[0]?.booking_for_name || null
    })

    // Show cancel button
    const showCancelButton = computed(() => {
      return (
        ((props.booking.approval_status === 'pending' || props.booking.approval_status === 'pending_waitlist') &&
         props.booking.payment_status !== 'paid') ||
        isExpired.value
      )
    })

    return {
      isExpired,
      formattedDate,
      sportColor,
      sportIcon,
      groupedTimeDisplay,
      bookedForName,
      showCancelButton
    }
  }
}
</script>

<style scoped>
/* Component inherits styles from parent Bookings.vue */
/* Additional component-specific styles can be added here if needed */
</style>

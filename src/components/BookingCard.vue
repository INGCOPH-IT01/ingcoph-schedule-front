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
      // First check if booking_date exists
      if (!props.booking.booking_date) {
        // Try to get date from cart_items
        if (props.booking.cart_items && props.booking.cart_items.length > 0) {
          const firstItemDate = props.booking.cart_items[0].booking_date
          if (firstItemDate) {
            const formatted = formatDate(firstItemDate)
            // Check if formatDate returned "Invalid Date"
            if (formatted && formatted !== 'Invalid Date') {
              return formatted
            }
          }
        }
        return 'Unknown Date'
      }

      // Format the booking date
      const formatted = formatDate(props.booking.booking_date)

      // Check if formatDate returned "Invalid Date"
      if (!formatted || formatted === 'Invalid Date') {
        return 'Unknown Date'
      }

      return formatted
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

      // Helper function to normalize time format (remove seconds if present)
      const normalizeTime = (time) => {
        if (!time) return ''
        // If time has seconds (HH:MM:SS), remove them
        if (time.length > 5 && time.split(':').length === 3) {
          return time.substring(0, 5) // Get HH:MM only
        }
        return time
      }

      // Helper function to format time to 12-hour format
      const formatTime12Hour = (time) => {
        if (!time) return ''
        const normalized = normalizeTime(time)
        const [hours, minutes] = normalized.split(':')
        const hour = parseInt(hours)
        const ampm = hour >= 12 ? 'PM' : 'AM'
        const displayHour = hour % 12 || 12
        return `${displayHour}:${minutes} ${ampm}`
      }

      // Sort items by start time
      const sortedItems = [...props.booking.cart_items].sort((a, b) => {
        return (a.start_time || '').localeCompare(b.start_time || '')
      })

      // Group consecutive slots
      const groups = []
      let currentGroup = {
        start: normalizeTime(sortedItems[0].start_time),
        end: normalizeTime(sortedItems[0].end_time)
      }

      for (let i = 1; i < sortedItems.length; i++) {
        const item = sortedItems[i]
        const itemStart = normalizeTime(item.start_time)
        const itemEnd = normalizeTime(item.end_time)

        // Check if this slot is consecutive (current end = next start)
        if (currentGroup.end === itemStart) {
          // Extend the current group
          currentGroup.end = itemEnd
        } else {
          // Save current group and start a new one
          groups.push(`${formatTime12Hour(currentGroup.start)} - ${formatTime12Hour(currentGroup.end)}`)
          currentGroup = {
            start: itemStart,
            end: itemEnd
          }
        }
      }

      // Add the last group
      groups.push(`${formatTime12Hour(currentGroup.start)} - ${formatTime12Hour(currentGroup.end)}`)

      // Return formatted string
      return groups.join(', ')
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
.booking-card-compact {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border-radius: 12px !important;
  overflow: hidden;
  border: 1px solid rgba(0, 0, 0, 0.06);
  background: white !important;
  position: relative;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.booking-card-compact:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.12) !important;
  border-color: rgba(59, 130, 246, 0.3);
}

.pending-card {
  border-left: 4px solid #f59e0b !important;
}

.approved-card {
  border-left: 4px solid #10b981 !important;
}

.rejected-card {
  border-left: 4px solid #ef4444 !important;
}

.status-banner-compact {
  padding: 6px 12px;
  text-align: center;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.6px;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
}

.approved-banner {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: white;
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
}

.pending-banner {
  background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
  color: white;
  box-shadow: 0 4px 12px rgba(245, 158, 11, 0.3);
}

.rejected-banner {
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
  color: white;
  box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);
}

.waitlist-banner {
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  color: white;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
}

.expired-banner {
  background: linear-gradient(135deg, #6b7280 0%, #4b5563 100%);
  color: white;
  box-shadow: 0 4px 12px rgba(107, 114, 128, 0.3);
}

/* Booking Date Header */
.booking-date-header {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 8px 12px;
  background: linear-gradient(135deg, #FFF5F5 0%, #FFEBEE 100%);
  border-radius: 8px;
  margin-bottom: 12px;
  border-left: 3px solid #B71C1C;
}

.booking-date-text {
  font-size: 12px;
  font-weight: 700;
  color: #B71C1C;
  letter-spacing: 0.3px;
}

.booking-court-info-compact {
  text-align: center;
  margin-bottom: 12px;
}

.court-name-compact {
  font-size: 14px;
  font-weight: 700;
  color: #B71C1C;
  margin: 0;
  line-height: 1.2;
}

.time-slots-group {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 4px;
}

.time-slot-display {
  font-weight: 600;
  color: #B71C1C;
}

.booking-details-compact {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.detail-row-compact {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  padding: 8px;
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
  border-radius: 8px;
  border-left: 3px solid transparent;
  transition: all 0.2s ease;
}

.detail-row-compact:hover {
  background: linear-gradient(135deg, #FFF5F5 0%, #FFEBEE 100%);
  border-left-color: #B71C1C;
}

.detail-icon-compact {
  width: 28px;
  height: 28px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.time-icon {
  background: linear-gradient(135deg, #B71C1C 0%, #D32F2F 100%);
  box-shadow: 0 4px 12px rgba(183, 28, 28, 0.3);
}

.user-icon {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
}

.price-icon {
  background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
  box-shadow: 0 4px 12px rgba(245, 158, 11, 0.3);
}

.payment-icon {
  background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%);
  box-shadow: 0 4px 12px rgba(139, 92, 246, 0.3);
}

.detail-content-compact {
  flex: 1;
  min-width: 0;
}

.detail-label-compact {
  font-size: 10px;
  font-weight: 600;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.4px;
  margin-bottom: 2px;
}

.detail-value-compact {
  font-size: 12px;
  font-weight: 600;
  color: #B71C1C;
  line-height: 1.3;
}

.price-value-compact {
  font-size: 16px;
  font-weight: 700;
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.rejection-notice-compact {
  display: flex;
  align-items: flex-start;
  gap: 6px;
  padding: 8px;
  background: linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%);
  border-radius: 8px;
  border-left: 4px solid #ef4444;
  margin-top: 16px;
}

.rejection-text-compact {
  font-size: 11px;
  color: #7f1d1d;
  line-height: 1.4;
}

.admin-booking-highlight {
  background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%);
  border-left: 3px solid #3b82f6;
  padding-left: 8px;
  border-radius: 6px;
  margin: 4px 0;
}

.booking-actions-compact {
  display: flex;
  justify-content: flex-end;
  gap: 6px;
  margin-top: 8px;
  padding-top: 8px;
  border-top: 1px solid #e5e7eb;
}

/* Responsive styles for mobile */
@media (max-width: 768px) {
  .booking-card-compact {
    border-radius: 8px !important;
  }

  .court-name-compact {
    font-size: 14px !important;
  }

  .detail-row-compact {
    font-size: 12px !important;
  }

  .detail-icon-compact {
    width: 28px !important;
    height: 28px !important;
  }

  .detail-label-compact {
    font-size: 10px !important;
  }

  .detail-value-compact {
    font-size: 13px !important;
  }

  .booking-actions-compact {
    gap: 4px !important;
  }

  .status-banner-compact {
    padding: 4px 8px;
    font-size: 9px;
  }
}

@media (max-width: 480px) {
  .court-name-compact {
    font-size: 13px !important;
  }

  .detail-value-compact {
    font-size: 12px !important;
  }

  .status-banner-compact {
    font-size: 8px;
    padding: 3px 6px;
  }
}
</style>

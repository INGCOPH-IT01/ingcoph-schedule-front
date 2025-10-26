<template>
  <v-dialog
    :model-value="isOpen"
    @update:model-value="$emit('update:isOpen', $event)"
    max-width="700px"
    class="booking-details-dialog"
    persistent
  >
    <v-card v-if="slot" class="booking-details-dialog">
      <v-card-title class="text-h5 dialog-title">
        <div class="d-flex align-center">
          <v-icon class="mr-2">mdi-calendar-clock</v-icon>
          Time Slot Details
        </div>
        <v-btn icon="mdi-close" variant="text" @click="closeDialog"></v-btn>
      </v-card-title>

      <v-card-text>
        <v-row>
          <v-col cols="12" md="6">
            <div class="detail-section">
              <h4 class="detail-label">Court Information</h4>
              <div class="detail-content">
                <div class="detail-item">
                  <strong>Court:</strong> {{ court?.name || 'Unknown' }}
                </div>
                <div class="detail-item">
                  <strong>Sport:</strong> {{ court?.sport?.name || 'N/A' }}
                </div>
                <div class="detail-item">
                  <strong>Price:</strong> ₱{{ formatPrice(slot.price) }}/hour
                </div>
              </div>
            </div>
          </v-col>

          <v-col cols="12" md="6">
            <div class="detail-section">
              <h4 class="detail-label">Slot Information</h4>
              <div class="detail-content">
                <div class="detail-item">
                  <strong>Status:</strong>
                  <v-chip
                    :color="slot.available ? 'success' : 'error'"
                    variant="tonal"
                    size="small"
                    class="ml-2"
                  >
                    {{ slot.available ? 'Available' : 'Booked' }}
                  </v-chip>
                </div>
                <div class="detail-item" v-if="!slot.available && slot.type">
                  <strong>Type:</strong>
                  <v-chip
                    :color="getBookingTypeColor(slot.type)"
                    variant="tonal"
                    size="small"
                    class="ml-2"
                  >
                    {{ getBookingTypeLabel(slot.type) }}
                  </v-chip>
                </div>
                <div class="detail-item">
                  <strong>Duration:</strong> {{ formatDuration(slot.duration_hours) }} hour(s)
                </div>
              </div>
            </div>
          </v-col>
        </v-row>

        <v-row>
          <v-col cols="12">
            <div class="detail-section">
              <h4 class="detail-label">Date & Time</h4>
              <div class="detail-content">
                <div class="detail-item">
                  <strong>Date:</strong> {{ formattedDate }}
                </div>
                <div class="detail-item">
                  <strong>Time Slot:</strong>
                  <div class="time-slots-detail-list mt-2">
                    <v-chip
                      color="primary"
                      variant="outlined"
                      size="small"
                      class="mr-2 mb-2"
                    >
                      <v-icon start size="small">mdi-clock-outline</v-icon>
                      {{ formatTimeSlot(slot.start) }} - {{ formatTimeSlot(slot.end) }}
                      <span class="ml-2 font-weight-bold">₱{{ formatPrice(slot.price) }}</span>
                    </v-chip>
                  </div>
                  <div class="mt-2">
                    <strong>Duration:</strong> {{ formatDuration(slot.duration_hours) }} hours
                  </div>
                </div>
              </div>
            </div>
          </v-col>

          <v-col cols="12" md="6">
            <div class="detail-section">
              <h4 class="detail-label">Status & Payment</h4>
              <div class="detail-content">
                <div class="detail-item">
                  <strong>Status:</strong>
                  <v-chip
                    :color="slot.available ? 'success' : 'error'"
                    variant="tonal"
                    size="small"
                    class="ml-2"
                  >
                    {{ slot.available ? 'Available' : 'Booked' }}
                  </v-chip>
                </div>
                <div class="detail-item" v-if="!slot.available && slot.status">
                  <strong>Payment:</strong>
                  <v-chip
                    :color="slot.status === 'paid' ? 'success' : 'warning'"
                    variant="tonal"
                    size="small"
                    class="ml-2"
                  >
                    {{ slot.status }}
                  </v-chip>
                </div>
                <div class="detail-item">
                  <strong>Total Amount:</strong>
                  <span class="ml-2 text-h6 text-success font-weight-bold">
                    ₱{{ formatPrice(slot.price) }}
                  </span>
                </div>
              </div>
            </div>
          </v-col>
        </v-row>

        <!-- Customer Information for Booked Slots -->
        <v-row v-if="!slot.available && hasCustomerInfo">
          <v-col cols="12">
            <div class="detail-section">
              <h4 class="detail-label">
                <v-icon class="mr-2" color="primary">mdi-account</v-icon>
                Customer Information
              </h4>
              <div class="detail-content customer-info">
                <!-- Admin Booking Badge (Prominent) -->
                <div v-if="isAdminBooking" class="detail-item admin-booking-badge mb-3">
                  <v-alert
                    type="info"
                    variant="tonal"
                    density="compact"
                    prominent
                  >
                    <div class="d-flex align-center">
                      <v-icon class="mr-2">mdi-shield-account</v-icon>
                      <div>
                        <strong>Admin/Staff Booking</strong>
                        <div class="text-caption mt-1">
                          Created by: {{ createdByName }} ({{ createdByRole }})
                        </div>
                      </div>
                    </div>
                  </v-alert>
                </div>

                <div class="detail-item" v-if="customerName">
                  <v-icon size="small" class="mr-2">mdi-account-circle</v-icon>
                  <strong>Customer Name:</strong>
                  <span class="ml-2">{{ customerName }}</span>
                </div>
                <div class="detail-item" v-if="customerEmail">
                  <v-icon size="small" class="mr-2">mdi-email</v-icon>
                  <strong>Email:</strong>
                  <span class="ml-2">{{ customerEmail }}</span>
                </div>
                <div class="detail-item" v-if="customerPhone">
                  <v-icon size="small" class="mr-2">mdi-phone</v-icon>
                  <strong>Phone:</strong>
                  <span class="ml-2">{{ customerPhone }}</span>
                </div>
              </div>
            </div>
          </v-col>
        </v-row>

        <!-- Additional Info for Booked Slots -->
        <v-row v-if="!slot.available && slot.type">
          <v-col cols="12">
            <div class="detail-section">
              <h4 class="detail-label">
                <v-icon class="mr-2" :color="getBookingTypeColor(slot.type)">
                  {{ getBookingTypeIcon(slot.type) }}
                </v-icon>
                Booking Type Information
              </h4>
              <div class="detail-content">
                <v-alert
                  :type="slot.type === 'booking' ? 'info' : 'warning'"
                  variant="tonal"
                  class="mb-0"
                >
                  <div class="text-body-2">
                    <strong>{{ getBookingTypeLabel(slot.type) }}</strong><br>
                    {{ getBookingTypeDescription(slot.type) }}
                  </div>
                </v-alert>
              </div>
            </div>
          </v-col>
        </v-row>
      </v-card-text>

      <v-card-actions v-if="slot.available && canUsersBook">
        <v-spacer></v-spacer>
        <v-btn
          color="primary"
          @click="bookNow"
        >
          <v-icon start>mdi-calendar-plus</v-icon>
          Book Now
        </v-btn>
      </v-card-actions>
      <v-card-actions v-else-if="slot.available && !canUsersBook">
        <v-spacer></v-spacer>
        <v-alert type="info" variant="tonal" density="compact">
          Booking creation is disabled for user accounts. Please contact the administrator.
        </v-alert>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import { computed } from 'vue'
import { formatTimeSlot, formatPriceValue, formatDateLong, formatDuration } from '../utils/formatters'

export default {
  name: 'TimeSlotDetailsDialog',
  props: {
    isOpen: {
      type: Boolean,
      required: true
    },
    slot: {
      type: Object,
      default: null
    },
    court: {
      type: Object,
      default: null
    },
    date: {
      type: String,
      default: ''
    },
    canUsersBook: {
      type: Boolean,
      default: true
    }
  },
  emits: ['update:isOpen', 'book-now'],
  setup(props, { emit }) {
    const closeDialog = () => {
      emit('update:isOpen', false)
    }

    const bookNow = () => {
      emit('book-now', props.slot)
    }

    const formattedDate = computed(() => {
      if (!props.date) return ''
      return formatDateLong(props.date)
    })

    // Customer Information computed properties
    const hasCustomerInfo = computed(() => {
      return customerName.value || customerEmail.value || customerPhone.value
    })

    const customerName = computed(() => {
      if (!props.slot) return null
      // Priority: display_name > booking_for_user_name > effective_user.name > user.name
      return props.slot.display_name ||
             props.slot.booking_for_user_name ||
             props.slot.effective_user?.name ||
             props.slot.user?.name ||
             props.slot.user_name ||
             null
    })

    const customerEmail = computed(() => {
      if (!props.slot) return null
      return props.slot.effective_user?.email ||
             props.slot.booking_for_user?.email ||
             props.slot.user?.email ||
             props.slot.user_email ||
             null
    })

    const customerPhone = computed(() => {
      if (!props.slot) return null
      return props.slot.effective_user?.phone ||
             props.slot.booking_for_user?.phone ||
             props.slot.user?.phone ||
             props.slot.user_phone ||
             null
    })

    // Admin booking information
    const isAdminBooking = computed(() => {
      if (!props.slot) return false
      return props.slot.is_admin_booking || false
    })

    const createdByName = computed(() => {
      if (!props.slot || !props.slot.created_by) return 'Unknown'
      return props.slot.created_by.name || 'Unknown'
    })

    const createdByRole = computed(() => {
      if (!props.slot || !props.slot.created_by) return ''
      const role = props.slot.created_by.role || ''
      return role.charAt(0).toUpperCase() + role.slice(1)
    })

    // Use imported functions with aliases
    const formatPrice = formatPriceValue

    const formatDurationHours = (hours) => {
      const numHours = Math.abs(parseFloat(hours || 1))
      return numHours
    }

    const getBookingTypeColor = (type) => {
      const colors = {
        'booking': 'primary',
        'paid': 'success',
        'in_cart': 'warning'
      }
      return colors[type] || 'grey'
    }

    const getBookingTypeIcon = (type) => {
      const icons = {
        'booking': 'mdi-calendar-check',
        'paid': 'mdi-cash-check',
        'in_cart': 'mdi-cart'
      }
      return icons[type] || 'mdi-information'
    }

    const getBookingTypeLabel = (type) => {
      const labels = {
        'booking': 'Confirmed Booking',
        'paid': 'Paid Booking',
        'in_cart': 'In Cart'
      }
      return labels[type] || 'Booked'
    }

    const getBookingTypeDescription = (type) => {
      const descriptions = {
        'booking': 'This time slot has a confirmed booking',
        'paid': 'This time slot has been paid for and confirmed',
        'in_cart': 'This time slot is temporarily reserved in someone\'s cart'
      }
      return descriptions[type] || 'This time slot is not available'
    }

    return {
      closeDialog,
      bookNow,
      formattedDate,
      formatTimeSlot,
      formatPrice,
      formatDuration: formatDurationHours,
      getBookingTypeColor,
      getBookingTypeIcon,
      getBookingTypeLabel,
      getBookingTypeDescription,
      // Customer information
      hasCustomerInfo,
      customerName,
      customerEmail,
      customerPhone,
      // Admin booking information
      isAdminBooking,
      createdByName,
      createdByRole
    }
  }
}
</script>

<style scoped>
/* Booking Details Dialog - Matching Bookings.vue Pattern */
.booking-details-dialog .dialog-title {
  background: linear-gradient(135deg, #1976d2 0%, #1565c0 100%);
  color: white !important;
  padding: 20px 24px;
  font-weight: 600;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.booking-details-dialog .dialog-title .v-icon {
  color: white !important;
}

.booking-details-dialog .dialog-title .v-btn {
  color: white !important;
}

.booking-details-dialog .detail-section {
  margin-bottom: 20px;
}

.booking-details-dialog .detail-label {
  font-size: 16px;
  font-weight: 600;
  color: #1976d2;
  margin-bottom: 12px;
  display: flex;
  align-items: center;
}

.booking-details-dialog .detail-content {
  padding: 12px;
  background: #f5f7fa;
  border-radius: 8px;
  border-left: 4px solid #1976d2;
}

.booking-details-dialog .detail-item {
  margin-bottom: 8px;
  font-size: 14px;
  line-height: 1.6;
}

.booking-details-dialog .detail-item:last-child {
  margin-bottom: 0;
}

.booking-details-dialog .time-slots-detail-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

/* Customer Information Styles */
.booking-details-dialog .customer-info .detail-item {
  display: flex;
  align-items: center;
  padding: 4px 0;
}

.booking-details-dialog .customer-info .v-icon {
  color: #1976d2;
}

.booking-details-dialog .admin-booking-badge {
  width: 100%;
  padding: 0;
}

.booking-details-dialog .admin-booking-badge .v-alert {
  border-left: 4px solid #2196F3;
}
</style>

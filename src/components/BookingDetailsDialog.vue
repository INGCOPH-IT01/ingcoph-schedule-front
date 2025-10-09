<template>
  <v-dialog
    :model-value="isOpen"
    @update:model-value="$emit('update:isOpen', $event)"
    max-width="900px"
    persistent
  >
    <v-card class="booking-details-dialog-card">
      <div class="dialog-header">
        <div class="header-badge">
          <v-icon color="white" size="20" class="mr-2">mdi-calendar-text</v-icon>
          Booking Information
        </div>
        <h2 class="dialog-title">
          <span class="title-gradient">Booking</span> Details
        </h2>
        <p class="dialog-subtitle">
          Comprehensive information about your court reservation
        </p>
      </div>
      <v-divider class="dialog-divider"></v-divider>

      <v-card-text v-if="booking" class="pa-6">
        <!-- Booking Status Header -->
        <div class="status-header mb-6">
          <v-chip
            :color="getStatusColor(booking.status)"
            variant="tonal"
            size="large"
            class="status-chip"
          >
            <v-icon :icon="getStatusIcon(booking.status)" class="mr-2"></v-icon>
            {{ booking.status.toUpperCase() }}
          </v-chip>
          <div class="booking-id">
            <span class="label">Booking ID:</span>
            <span class="value">#{{ booking.id }}</span>
          </div>
        </div>

        <!-- Main Information Grid -->
        <v-row>
          <!-- Court Information -->
          <v-col cols="12" md="6">
            <div class="info-section">
              <h3 class="section-title">
                <v-icon class="mr-2" color="primary">mdi-stadium</v-icon>
                Court Information
              </h3>
              <div class="info-card">
                <div class="info-item">
                  <span class="label">Court Name:</span>
                  <span class="value">{{ booking.court?.name || 'N/A' }}</span>
                </div>
                <div class="info-item">
                  <span class="label">Sport:</span>
                  <span class="value">{{ booking.court?.sport?.name || 'N/A' }}</span>
                </div>
                <div class="info-item">
                  <span class="label">Location:</span>
                  <span class="value">{{ booking.court?.location || 'N/A' }}</span>
                </div>
                <div class="info-item">
                  <span class="label">Price per Hour:</span>
                  <span class="value">{{ formatPrice(booking.court?.price_per_hour || 0) }}</span>
                </div>
              </div>
            </div>
          </v-col>

          <!-- Booking Details -->
          <v-col cols="12" md="6">
            <div class="info-section">
              <h3 class="section-title">
                <v-icon class="mr-2" color="primary">mdi-calendar-clock</v-icon>
                Booking Details
              </h3>
              <div class="info-card">
                <div class="info-item">
                  <span class="label">Date:</span>
                  <span class="value">{{ formatDate(booking.start_time) }}</span>
                </div>
                <div class="info-item">
                  <span class="label">Time:</span>
                  <span class="value">{{ formatTime(booking.start_time) }} - {{ formatTime(booking.end_time) }}</span>
                </div>
                <div class="info-item">
                  <span class="label">Duration:</span>
                  <span class="value">{{ getDuration(booking.start_time, booking.end_time) }} hour(s)</span>
                </div>
                <div class="info-item">
                  <span class="label">Total Price:</span>
                  <span class="value price-highlight">{{ formatPrice(booking.total_price) }}</span>
                </div>
              </div>
            </div>
          </v-col>
        </v-row>

        <!-- Court Images Gallery -->
        <v-row v-if="booking.court?.images && booking.court.images.length > 0" class="mt-4">
          <v-col cols="12">
            <div class="info-section">
              <h3 class="section-title">
                <v-icon class="mr-2" color="primary">mdi-image-multiple</v-icon>
                Court Images
              </h3>
              <div class="info-card">
                <CourtImageGallery 
                  :images="booking.court.images"
                  :court-name="booking.court.name"
                  size="large"
                  @image-error="handleImageError"
                />
              </div>
            </div>
          </v-col>
        </v-row>

        <!-- Payment Information -->
        <v-row v-if="booking.payment_method || booking.proof_of_payment" class="mt-4">
          <v-col cols="12">
            <div class="info-section">
              <h3 class="section-title">
                <v-icon class="mr-2" color="primary">mdi-credit-card</v-icon>
                Payment Information
              </h3>
              <div class="info-card">
                <v-row>
                  <v-col cols="12" md="6">
                    <div class="info-item">
                      <span class="label">Payment Method:</span>
                      <span class="value">{{ formatPaymentMethod(booking.payment_method) }}</span>
                    </div>
                  </v-col>
                  <v-col cols="12" md="6">
                    <div class="info-item">
                      <span class="label">Payment Status:</span>
                      <span class="value">
                        <v-chip
                          :color="getPaymentStatusColor(booking)"
                          variant="tonal"
                          size="small"
                        >
                          <v-icon :icon="getPaymentStatusIcon(booking)" size="small" class="mr-1"></v-icon>
                          {{ getPaymentStatusText(booking) }}
                        </v-chip>
                      </span>
                    </div>
                  </v-col>
                </v-row>
                
                <!-- Proof of Payment -->
                <div v-if="booking.proof_of_payment" class="proof-section mt-4">
                  <div class="info-item">
                    <span class="label">Proof of Payment:</span>
                    <div class="proof-actions">
                      <v-btn
                        color="primary"
                        variant="outlined"
                        size="small"
                        prepend-icon="mdi-eye"
                        @click="viewProofOfPayment"
                      >
                        View Proof
                      </v-btn>
                      <v-btn
                        color="success"
                        variant="outlined"
                        size="small"
                        prepend-icon="mdi-download"
                        @click="downloadProof"
                      >
                        Download
                      </v-btn>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </v-col>
        </v-row>

        <!-- Frequency Information -->
        <v-row v-if="booking.frequency_type && booking.frequency_type !== 'once'" class="mt-4">
          <v-col cols="12">
            <div class="info-section">
              <h3 class="section-title">
                <v-icon class="mr-2" color="primary">mdi-repeat</v-icon>
                Recurring Schedule
              </h3>
              <div class="info-card">
                <v-row>
                  <v-col cols="12" md="4">
                    <div class="info-item">
                      <span class="label">Frequency:</span>
                      <span class="value">{{ formatFrequencyType(booking.frequency_type) }}</span>
                    </div>
                  </v-col>
                  <v-col cols="12" md="4" v-if="booking.frequency_days && booking.frequency_days.length > 0">
                    <div class="info-item">
                      <span class="label">Days:</span>
                      <span class="value">{{ formatFrequencyDays(booking.frequency_days) }}</span>
                    </div>
                  </v-col>
                  <v-col cols="12" md="4" v-if="booking.frequency_duration_months">
                    <div class="info-item">
                      <span class="label">Duration:</span>
                      <span class="value">{{ booking.frequency_duration_months }} month(s)</span>
                    </div>
                  </v-col>
                </v-row>
              </div>
            </div>
          </v-col>
        </v-row>

        <!-- Notes Section -->
        <v-row v-if="booking.notes" class="mt-4">
          <v-col cols="12">
            <div class="info-section">
              <h3 class="section-title">
                <v-icon class="mr-2" color="primary">mdi-note-text</v-icon>
                Additional Notes
              </h3>
              <div class="info-card">
                <div class="notes-content">
                  {{ booking.notes }}
                </div>
              </div>
            </div>
          </v-col>
        </v-row>

        <!-- Booking Timeline -->
        <v-row class="mt-4">
          <v-col cols="12">
            <div class="info-section">
              <h3 class="section-title">
                <v-icon class="mr-2" color="primary">mdi-timeline</v-icon>
                Booking Timeline
              </h3>
              <div class="info-card">
                <div class="timeline">
                  <div class="timeline-item">
                    <div class="timeline-marker created"></div>
                    <div class="timeline-content">
                      <div class="timeline-title">Booking Created</div>
                      <div class="timeline-date">{{ formatDateTime(booking.created_at) }}</div>
                    </div>
                  </div>
                  <div class="timeline-item" v-if="booking.updated_at !== booking.created_at">
                    <div class="timeline-marker updated"></div>
                    <div class="timeline-content">
                      <div class="timeline-title">Last Updated</div>
                      <div class="timeline-date">{{ formatDateTime(booking.updated_at) }}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </v-col>
        </v-row>
      </v-card-text>

      <!-- Dialog Actions -->
      <v-card-actions class="pa-6 pt-0">
        <v-spacer></v-spacer>
        <v-btn
          color="grey"
          variant="outlined"
          @click="$emit('update:isOpen', false)"
        >
          Close
        </v-btn>
        <v-btn
          v-if="booking && booking.status === 'pending'"
          color="primary"
          @click="editBooking"
        >
          <v-icon class="mr-2">mdi-pencil</v-icon>
          Edit Booking
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import { computed } from 'vue'
import CourtImageGallery from './CourtImageGallery.vue'

export default {
  name: 'BookingDetailsDialog',
  components: {
    CourtImageGallery
  },
  props: {
    isOpen: {
      type: Boolean,
      default: false
    },
    booking: {
      type: Object,
      default: null
    }
  },
  emits: ['update:isOpen', 'edit'],
  setup(props, { emit }) {
    // Format functions
    const formatPrice = (price) => {
      return new Intl.NumberFormat('en-PH', {
        style: 'currency',
        currency: 'PHP',
        minimumFractionDigits: 2
      }).format(price)
    }

    const handleImageError = (event) => {
      // Hide the broken image and show fallback icon
      event.target.style.display = 'none'
      const fallback = event.target.nextElementSibling
      if (fallback) {
        fallback.style.display = 'inline'
      }
    }

    const formatDate = (dateString) => {
      if (!dateString) return 'N/A'
      return new Date(dateString).toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    }

    const formatTime = (dateString) => {
      if (!dateString) return 'N/A'
      return new Date(dateString).toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      })
    }

    const formatDateTime = (dateString) => {
      if (!dateString) return 'N/A'
      return new Date(dateString).toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      })
    }

    const getDuration = (startTime, endTime) => {
      if (!startTime || !endTime) return 'N/A'
      const start = new Date(startTime)
      const end = new Date(endTime)
      const diffInHours = (end - start) / (1000 * 60 * 60)
      return Math.round(diffInHours)
    }

    const formatPaymentMethod = (method) => {
      if (!method) return 'N/A'
      return method.charAt(0).toUpperCase() + method.slice(1).replace('_', ' ')
    }

    const formatFrequencyType = (type) => {
      if (!type) return 'N/A'
      const types = {
        'once': 'One-time',
        'daily': 'Daily',
        'weekly': 'Weekly',
        'monthly': 'Monthly',
        'yearly': 'Yearly'
      }
      return types[type] || type
    }

    const formatFrequencyDays = (days) => {
      if (!days || days.length === 0) return 'N/A'
      const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
      return days.map(day => dayNames[day]).join(', ')
    }

    // Status functions
    const getStatusColor = (status) => {
      const colors = {
        'pending': 'orange',
        'approved': 'green',
        'cancelled': 'red',
        'completed': 'blue'
      }
      return colors[status] || 'grey'
    }

    const getStatusIcon = (status) => {
      const icons = {
        'pending': 'mdi-clock-outline',
        'approved': 'mdi-check-circle',
        'cancelled': 'mdi-cancel',
        'completed': 'mdi-check-all'
      }
      return icons[status] || 'mdi-help-circle'
    }

    // Payment status functions
    const getPaymentStatus = (booking) => {
      if (!booking) return 'unknown'
      if (booking.payment_method && booking.proof_of_payment) return 'complete'
      if (booking.payment_method && !booking.proof_of_payment) return 'pending_proof'
      if (!booking.payment_method) return 'no_payment'
      return 'unknown'
    }

    const getPaymentStatusColor = (booking) => {
      const status = getPaymentStatus(booking)
      const colors = {
        'complete': 'green',
        'pending_proof': 'orange',
        'no_payment': 'red',
        'unknown': 'grey'
      }
      return colors[status] || 'grey'
    }

    const getPaymentStatusText = (booking) => {
      const status = getPaymentStatus(booking)
      const texts = {
        'complete': 'Complete',
        'pending_proof': 'Pending Proof',
        'no_payment': 'No Payment',
        'unknown': 'Unknown'
      }
      return texts[status] || 'Unknown'
    }

    const getPaymentStatusIcon = (booking) => {
      const status = getPaymentStatus(booking)
      const icons = {
        'complete': 'mdi-check-circle',
        'pending_proof': 'mdi-clock-outline',
        'no_payment': 'mdi-close-circle',
        'unknown': 'mdi-help-circle'
      }
      return icons[status] || 'mdi-help-circle'
    }

    // Action functions
    const viewProofOfPayment = () => {
      if (props.booking?.proof_of_payment) {
        window.open(props.booking.proof_of_payment, '_blank')
      }
    }

    const downloadProof = () => {
      if (props.booking?.proof_of_payment) {
        const link = document.createElement('a')
        link.href = props.booking.proof_of_payment
        link.download = `proof_of_payment_${props.booking.id}.jpg`
        link.click()
      }
    }

    const editBooking = () => {
      emit('edit', props.booking)
      emit('update:isOpen', false)
    }

    return {
      formatPrice,
      formatDate,
      formatTime,
      formatDateTime,
      getDuration,
      formatPaymentMethod,
      formatFrequencyType,
      formatFrequencyDays,
      getStatusColor,
      getStatusIcon,
      handleImageError,
      getPaymentStatusColor,
      getPaymentStatusText,
      getPaymentStatusIcon,
      viewProofOfPayment,
      downloadProof,
      editBooking
    }
  }
}
</script>

<style scoped>
/* Modern Sports Booking Details Dialog Theme */
.booking-details-dialog-card {
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

/* Status Header */
.status-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
  border-radius: 12px;
  border: 1px solid rgba(59, 130, 246, 0.1);
}

.status-chip {
  font-weight: 700;
  font-size: 14px;
}

.booking-id {
  text-align: right;
}

.booking-id .label {
  color: #64748b;
  font-size: 14px;
  font-weight: 500;
}

.booking-id .value {
  color: #1e293b;
  font-size: 18px;
  font-weight: 700;
  margin-left: 8px;
}

/* Info Sections */
.info-section {
  margin-bottom: 24px;
}

.section-title {
  display: flex;
  align-items: center;
  font-size: 18px;
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 16px;
  padding-bottom: 8px;
  border-bottom: 2px solid #e2e8f0;
}

.info-card {
  background: rgba(255, 255, 255, 0.8);
  border-radius: 12px;
  padding: 20px;
  border: 1px solid rgba(59, 130, 246, 0.1);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

.info-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid #f1f5f9;
}

.info-item:last-child {
  border-bottom: none;
}

.info-item .label {
  color: #64748b;
  font-weight: 600;
  font-size: 14px;
}

.info-item .value {
  color: #1e293b;
  font-weight: 500;
  font-size: 14px;
  text-align: right;
}

.price-highlight {
  color: #059669 !important;
  font-weight: 700 !important;
  font-size: 16px !important;
}

/* Proof Section */
.proof-section {
  padding-top: 16px;
  border-top: 1px solid #e2e8f0;
}

.proof-actions {
  display: flex;
  gap: 12px;
}

/* Notes Content */
.notes-content {
  background: #f8fafc;
  border-radius: 8px;
  padding: 16px;
  color: #475569;
  line-height: 1.6;
  font-style: italic;
}

/* Timeline */
.timeline {
  position: relative;
  padding-left: 24px;
}

.timeline::before {
  content: '';
  position: absolute;
  left: 8px;
  top: 0;
  bottom: 0;
  width: 2px;
  background: linear-gradient(to bottom, #3b82f6, #10b981);
}

.timeline-item {
  position: relative;
  margin-bottom: 24px;
}

.timeline-marker {
  position: absolute;
  left: -16px;
  top: 4px;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  border: 3px solid white;
  box-shadow: 0 0 0 2px #3b82f6;
}

.timeline-marker.created {
  background: #3b82f6;
}

.timeline-marker.updated {
  background: #10b981;
}

.timeline-content {
  margin-left: 16px;
}

.timeline-title {
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 4px;
}

.timeline-date {
  color: #64748b;
  font-size: 14px;
}

/* Responsive Design */
@media (max-width: 768px) {
  .status-header {
    flex-direction: column;
    gap: 16px;
    text-align: center;
  }
  
  .booking-id {
    text-align: center;
  }
  
  .info-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 4px;
  }
  
  .info-item .value {
    text-align: left;
  }
  
  .proof-actions {
    flex-direction: column;
  }
}
</style>

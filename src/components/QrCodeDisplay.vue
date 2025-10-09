<template>
  <div class="qr-display-container">
    <v-card class="qr-display-card">
      <v-card-title class="text-h5 pa-6 pb-4">
        <v-icon class="mr-2" color="primary">mdi-qrcode</v-icon>
        Your Court Access QR Code
      </v-card-title>
      <v-divider></v-divider>
      
      <v-card-text class="pa-6 text-center">
        <div v-if="loading" class="loading-section">
          <v-progress-circular indeterminate color="primary" size="64"></v-progress-circular>
          <p class="mt-4 text-body-1">Generating your QR code...</p>
        </div>

        <div v-else-if="qrCode" class="qr-section">
          <!-- QR Code Display -->
          <div class="qr-code-container mb-4">
            <div class="qr-code-wrapper">
              <img ref="qrCodeImage" class="qr-code" :src="qrCodeImageUrl" alt="QR Code" />
            </div>
          </div>

          <!-- QR Code Text -->
          <v-text-field
            :value="qrCode"
            label="QR Code"
            variant="outlined"
            readonly
            prepend-inner-icon="mdi-content-copy"
            class="mb-4"
            @click="copyQrCode"
          >
            <template v-slot:append>
              <v-btn
                icon="mdi-content-copy"
                variant="text"
                @click="copyQrCode"
                size="small"
              ></v-btn>
            </template>
          </v-text-field>

          <!-- Instructions -->
          <v-alert type="info" variant="tonal" class="mb-4">
            <v-icon class="mr-2">mdi-information</v-icon>
            <div>
              <strong>Instructions:</strong>
              <ul class="mt-2 text-left">
                <li>Show this QR code to the court staff when you arrive</li>
                <li>The QR code is valid only during your booking time</li>
                <li>Make sure your phone screen is bright and clear</li>
                <li>Do not share this QR code with others</li>
              </ul>
            </div>
          </v-alert>

          <!-- Booking Details -->
          <v-card variant="outlined" class="booking-info">
            <v-card-title class="text-h6 pa-4">
              <v-icon class="mr-2" color="primary">mdi-calendar-check</v-icon>
              Booking Information
            </v-card-title>
            <v-card-text class="pa-4">
              <v-row>
                <v-col cols="12" md="6">
                  <div class="info-item mb-3">
                    <strong>Court:</strong> {{ booking.court?.name }}
                  </div>
                  <div class="info-item mb-3">
                    <strong>Date:</strong> {{ formatDate(booking.start_time) }}
                  </div>
                  <div class="info-item mb-3">
                    <strong>Start Time:</strong> {{ formatTime(booking.start_time) }}
                  </div>
                </v-col>
                <v-col cols="12" md="6">
                  <div class="info-item mb-3">
                    <strong>End Time:</strong> {{ formatTime(booking.end_time) }}
                  </div>
                  <div class="info-item mb-3">
                    <strong>Duration:</strong> {{ getDuration(booking.start_time, booking.end_time) }} hours
                  </div>
                  <div class="info-item mb-3">
                    <strong>Status:</strong> 
                    <v-chip 
                      :color="getStatusColor(booking.status)"
                      variant="tonal"
                      size="small"
                      class="ml-2"
                    >
                      {{ booking.status }}
                    </v-chip>
                  </div>
                </v-col>
              </v-row>
            </v-card-text>
          </v-card>
        </div>

        <div v-else-if="error" class="error-section">
          <v-alert type="error" variant="tonal">
            <v-icon class="mr-2">mdi-alert-circle</v-icon>
            {{ error }}
          </v-alert>
        </div>
      </v-card-text>
      
      <v-card-actions class="pa-6">
        <v-spacer></v-spacer>
        <v-btn
          color="grey"
          variant="outlined"
          @click="closeDialog"
        >
          Close
        </v-btn>
        <v-btn
          v-if="qrCode"
          color="primary"
          variant="elevated"
          prepend-icon="mdi-download"
          @click="downloadQrCode"
        >
          Download QR Code
        </v-btn>
      </v-card-actions>
    </v-card>
  </div>
</template>

<script>
import { ref, onMounted, nextTick } from 'vue'
import QRCode from 'qrcode'
import api from '../services/api'

export default {
  name: 'QrCodeDisplay',
  props: {
    booking: {
      type: Object,
      required: true
    }
  },
  emits: ['close'],
  setup(props, { emit }) {
    const qrCode = ref('')
    const loading = ref(false)
    const error = ref('')
    const qrCodeImageUrl = ref('')
    const qrCodeImage = ref(null)

    const generateQrCode = async () => {
      loading.value = true
      error.value = ''

      try {
        const response = await api.get(`/bookings/${props.booking.id}/qr-code`)
        qrCode.value = response.data.data.qr_code

        // Generate QR code image
        const dataUrl = await QRCode.toDataURL(qrCode.value, {
          width: 200,
          margin: 2,
          color: {
            dark: '#000000',
            light: '#FFFFFF'
          }
        })
        qrCodeImageUrl.value = dataUrl
      } catch (err) {
        error.value = err.response?.data?.message || 'Failed to generate QR code'
      } finally {
        loading.value = false
      }
    }

    const copyQrCode = async () => {
      try {
        await navigator.clipboard.writeText(qrCode.value)
        // You could add a snackbar notification here
      } catch (err) {
        console.error('Failed to copy QR code:', err)
      }
    }

    const downloadQrCode = async () => {
      try {
        if (qrCodeImageUrl.value) {
          const link = document.createElement('a')
          link.download = `booking-${props.booking.id}-qr-code.png`
          link.href = qrCodeImageUrl.value
          link.click()
        }
      } catch (err) {
        console.error('Failed to download QR code:', err)
      }
    }

    const formatDate = (dateTime) => {
      return new Date(dateTime).toLocaleDateString()
    }

    const formatTime = (dateTime) => {
      return new Date(dateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }

    const getDuration = (startTime, endTime) => {
      const start = new Date(startTime)
      const end = new Date(endTime)
      return Math.round((end - start) / (1000 * 60 * 60))
    }

    const getStatusColor = (status) => {
      const colors = {
        pending: 'orange',
        approved: 'blue',
        checked_in: 'green',
        rejected: 'red',
        cancelled: 'grey',
        completed: 'success'
      }
      return colors[status] || 'grey'
    }

    const closeDialog = () => {
      emit('close')
    }

    onMounted(() => {
      generateQrCode()
    })

    return {
      qrCode,
      loading,
      error,
      qrCodeImageUrl,
      qrCodeImage,
      copyQrCode,
      downloadQrCode,
      formatDate,
      formatTime,
      getDuration,
      getStatusColor,
      closeDialog
    }
  }
}
</script>

<style scoped>
.qr-display-container {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}

.qr-display-card {
  max-width: 500px;
  width: 90%;
  max-height: 90vh;
  overflow-y: auto;
}

.loading-section {
  padding: 40px 0;
}

.qr-code-container {
  display: flex;
  justify-content: center;
}

.qr-code-wrapper {
  background: white;
  padding: 16px;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  border: 2px solid #e0e0e0;
}

.qr-code {
  display: block;
  width: 200px;
  height: 200px;
}

.booking-info {
  background: #f8f9fa;
}

.info-item {
  display: flex;
  align-items: center;
  font-size: 14px;
}

.info-item strong {
  min-width: 100px;
  margin-right: 8px;
}

.error-section {
  padding: 40px 0;
}
</style>

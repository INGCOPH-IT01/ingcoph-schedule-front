<template>
  <div class="qr-scanner-container">
    <v-card class="qr-scanner-card">
      <v-card-title class="text-h5 pa-6 pb-4">
        <v-icon class="mr-2" color="primary">mdi-qrcode-scan</v-icon>
        Court Check-In Scanner
      </v-card-title>
      <v-divider></v-divider>

      <v-card-text class="pa-6">
        <div class="scanner-section">
          <div class="scanner-instructions mb-4">
            <p class="text-body-1 mb-2">
              <v-icon class="mr-2" color="info">mdi-information</v-icon>
              Point your camera at the player's QR code to automatically scan
            </p>
            <p class="text-caption text-medium-emphasis">
              Make sure the QR code is clearly visible and well-lit
            </p>
          </div>

          <!-- Camera Scanner -->
          <div v-if="!cameraError && !scanResult" class="camera-section mb-4">
            <div class="camera-container">
              <QrcodeStream
                @detect="onDetect"
                @error="onCameraError"
                :camera="camera"
                :track="paintBoundingBox"
                class="qr-camera"
              >
                <div class="scanner-overlay">
                  <div class="scanner-frame">
                    <div class="corner corner-tl"></div>
                    <div class="corner corner-tr"></div>
                    <div class="corner corner-bl"></div>
                    <div class="corner corner-br"></div>
                  </div>
                </div>
              </QrcodeStream>
            </div>

            <!-- Camera Controls -->
            <div class="camera-controls mt-4">
              <v-btn
                v-if="!cameraActive"
                color="primary"
                variant="elevated"
                prepend-icon="mdi-camera"
                @click.prevent="startCamera"
                :loading="startingCamera"
              >
                Start Camera
              </v-btn>
              <v-btn
                v-else
                color="error"
                variant="elevated"
                prepend-icon="mdi-camera-off"
                @click.prevent="stopCamera"
              >
                Stop Camera
              </v-btn>
              <v-btn
                v-if="cameraActive"
                color="secondary"
                variant="outlined"
                prepend-icon="mdi-camera-switch"
                @click.prevent="switchCamera"
                class="ml-2"
              >
                Switch Camera
              </v-btn>
            </div>
          </div>

          <!-- Camera Error -->
          <div v-if="cameraError" class="camera-error mb-4">
            <v-alert type="warning" variant="tonal">
              <v-icon class="mr-2">mdi-camera-off</v-icon>
              <div>
                <strong>Camera Error:</strong> {{ cameraError }}
                <br>
                <small>You can still scan QR codes manually below</small>
              </div>
            </v-alert>
          </div>

          <!-- Manual QR Code Input -->
          <v-text-field
            v-model="manualQrCode"
            label="Or enter QR code manually"
            variant="outlined"
            prepend-inner-icon="mdi-qrcode"
            placeholder="Enter QR code here..."
            class="mb-4"
            @keyup.enter.prevent="validateQrCode"
          ></v-text-field>

          <v-btn
            color="primary"
            variant="elevated"
            size="large"
            prepend-icon="mdi-check"
            @click.prevent="validateQrCode"
            :loading="loading"
            :disabled="!manualQrCode.trim()"
            block
          >
            Validate QR Code
          </v-btn>
        </div>

        <!-- Result Display -->
        <div v-if="result" class="result-section mt-6">
          <v-alert
            :type="result.success ? 'success' : 'error'"
            variant="tonal"
            class="mb-4"
          >
            <v-icon class="mr-2">
              {{ result.success ? 'mdi-check-circle' : 'mdi-alert-circle' }}
            </v-icon>
            {{ result.message }}
          </v-alert>

          <!-- Booking Details -->
          <v-card v-if="result.booking" variant="outlined" class="booking-details">
            <v-card-title class="text-h6 pa-4">
              <v-icon class="mr-2" color="primary">mdi-calendar-check</v-icon>
              Booking Details
            </v-card-title>
            <v-card-text class="pa-4">
              <v-row>
                <v-col cols="12" md="6">
                  <div class="detail-item mb-3">
                    <strong>Player:</strong> {{ result.booking.user?.name }}
                  </div>
                  <div class="detail-item mb-3">
                    <strong>Email:</strong> {{ result.booking.user?.email }}
                  </div>
                  <div class="detail-item mb-3">
                    <strong>Court:</strong> {{ result.booking.court?.name }}
                  </div>
                  <div class="detail-item mb-3">
                    <strong>Sport:</strong> {{ result.booking.court?.sport?.name }}
                  </div>
                </v-col>
                <v-col cols="12" md="6">
                  <div class="detail-item mb-3">
                    <strong>Date:</strong> {{ formatDate(result.booking.start_time) }}
                  </div>
                  <div class="detail-item mb-3">
                    <strong>Time:</strong> {{ formatTime(result.booking.start_time) }} - {{ formatTime(result.booking.end_time) }}
                  </div>
                  <div class="detail-item mb-3">
                    <strong>Status:</strong>
                    <v-chip
                      :color="statusService.getStatusColor(result.booking.status)"
                      variant="tonal"
                      size="small"
                      class="ml-2"
                    >
                      {{ result.booking.status }}
                    </v-chip>
                  </div>
                  <div class="detail-item mb-3">
                    <strong>Booking ID:</strong> #{{ result.booking.id }}
                  </div>
                </v-col>
              </v-row>

              <!-- Court Images Gallery -->
              <v-row v-if="result.booking.court?.images && result.booking.court.images.length > 0">
                <v-col cols="12">
                  <v-divider class="my-4"></v-divider>
                  <h4 class="text-h6 mb-3">
                    <v-icon class="mr-2" color="primary">mdi-image-multiple</v-icon>
                    Court Images
                  </h4>
                  <CourtImageGallery
                    :images="result.booking.court.images"
                    :court-name="result.booking.court.name"
                    size="large"
                    @image-error="handleImageError"
                  />
                </v-col>
              </v-row>
            </v-card-text>
          </v-card>
        </div>
      </v-card-text>

      <v-card-actions class="pa-6">
        <v-spacer></v-spacer>
        <v-btn
          color="grey"
          variant="outlined"
          @click.prevent="closeScanner"
        >
          Close
        </v-btn>
        <v-btn
          v-if="result && result.success"
          color="success"
          variant="elevated"
          @click.prevent="resetScanner"
        >
          Scan Another
        </v-btn>
      </v-card-actions>
    </v-card>
  </div>
</template>

<script>
import { ref, onMounted, onUnmounted } from 'vue'
import { QrcodeStream } from 'vue-qrcode-reader'
import { statusService } from '../services/statusService'
import CourtImageGallery from './CourtImageGallery.vue'
import api from '../services/api'

export default {
  name: 'QrCodeScanner',
  components: {
    QrcodeStream,
    CourtImageGallery
  },
  emits: ['close'],
  setup(props, { emit }) {
    const manualQrCode = ref('')
    const loading = ref(false)
    const result = ref(null)
    const camera = ref('auto')
    const cameraActive = ref(false)
    const startingCamera = ref(false)
    const cameraError = ref('')
    const scanResult = ref(null)

    const startCamera = async () => {
      startingCamera.value = true
      cameraError.value = ''

      try {
        // Request camera permission
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: 'environment' // Use back camera by default
          }
        })
        cameraActive.value = true
        camera.value = 'auto'
        stream.getTracks().forEach(track => track.stop()) // Stop the test stream
      } catch (error) {
        cameraError.value = 'Camera access denied or not available'
      } finally {
        startingCamera.value = false
      }
    }

    const stopCamera = () => {
      cameraActive.value = false
      camera.value = 'off'
    }

    const switchCamera = () => {
      // Toggle between front and back camera
      camera.value = camera.value === 'auto' ? 'user' : 'auto'
    }

    const onCameraError = (error) => {
      cameraError.value = 'Camera error: ' + error.message
      cameraActive.value = false
    }

    const onDetect = async (detectedCodes) => {
      if (detectedCodes.length > 0) {
        const qrCode = detectedCodes[0].rawValue
        scanResult.value = qrCode
        manualQrCode.value = qrCode

        // Automatically validate the detected QR code
        await validateQrCode(qrCode)
      }
    }

    const paintBoundingBox = (detectedCodes, ctx) => {
      detectedCodes.forEach((detectedCode) => {
        const { boundingBox } = detectedCode
        const { x, y, width, height } = boundingBox

        // Draw bounding box
        ctx.strokeStyle = '#00ff00'
        ctx.lineWidth = 2
        ctx.strokeRect(x, y, width, height)

        // Draw corner markers
        const cornerSize = 20
        ctx.strokeStyle = '#00ff00'
        ctx.lineWidth = 4

        // Top-left corner
        ctx.beginPath()
        ctx.moveTo(x, y)
        ctx.lineTo(x + cornerSize, y)
        ctx.moveTo(x, y)
        ctx.lineTo(x, y + cornerSize)
        ctx.stroke()

        // Top-right corner
        ctx.beginPath()
        ctx.moveTo(x + width, y)
        ctx.lineTo(x + width - cornerSize, y)
        ctx.moveTo(x + width, y)
        ctx.lineTo(x + width, y + cornerSize)
        ctx.stroke()

        // Bottom-left corner
        ctx.beginPath()
        ctx.moveTo(x, y + height)
        ctx.lineTo(x + cornerSize, y + height)
        ctx.moveTo(x, y + height)
        ctx.lineTo(x, y + height - cornerSize)
        ctx.stroke()

        // Bottom-right corner
        ctx.beginPath()
        ctx.moveTo(x + width, y + height)
        ctx.lineTo(x + width - cornerSize, y + height)
        ctx.moveTo(x + width, y + height)
        ctx.lineTo(x + width, y + height - cornerSize)
        ctx.stroke()
      })
    }

    const validateQrCode = async (qrCodeOrEvent = null) => {
      // Prevent default behavior if this is an event
      if (qrCodeOrEvent && typeof qrCodeOrEvent === 'object' && qrCodeOrEvent.preventDefault) {
        qrCodeOrEvent.preventDefault()
        qrCodeOrEvent = null
      }

      const codeToValidate = (typeof qrCodeOrEvent === 'string' ? qrCodeOrEvent : null) || manualQrCode.value.trim()
      if (!codeToValidate) return

      loading.value = true
      result.value = null

      try {
        const response = await api.post('/staff/cart-transactions/verify-qr', {
          qr_code: codeToValidate
        })

        result.value = {
          success: response.data.valid,
          message: response.data.message,
          booking: response.data.transaction
        }

        // Clear the input and stop camera
        manualQrCode.value = ''
        scanResult.value = null
        stopCamera()
      } catch (error) {
        result.value = {
          success: false,
          message: error.response?.data?.message || 'Failed to validate QR code',
          booking: error.response?.data?.transaction || null
        }
      } finally {
        loading.value = false
      }
    }

    const formatDate = (dateTime) => {
      return new Date(dateTime).toLocaleDateString()
    }

    const formatTime = (dateTime) => {
      return new Date(dateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }


    const closeScanner = () => {
      stopCamera()
      emit('close')
    }

    const resetScanner = () => {
      result.value = null
      manualQrCode.value = ''
      scanResult.value = null
      cameraError.value = ''
      cameraActive.value = false
    }

    // Cleanup on unmount
    onUnmounted(() => {
      stopCamera()
    })

    return {
      manualQrCode,
      loading,
      result,
      camera,
      cameraActive,
      startingCamera,
      cameraError,
      scanResult,
      startCamera,
      stopCamera,
      switchCamera,
      onDetect,
      onCameraError,
      paintBoundingBox,
      validateQrCode,
      formatDate,
      formatTime,
      statusService,
      closeScanner,
      resetScanner
    }
  }
}
</script>

<style scoped>
.qr-scanner-container {
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

.qr-scanner-card {
  max-width: 600px;
  width: 90%;
  max-height: 90vh;
  overflow-y: auto;
}

.scanner-section {
  text-align: center;
}

.scanner-instructions {
  background: #f8f9fa;
  border-radius: 8px;
  padding: 16px;
  border-left: 4px solid #1976d2;
}

.camera-section {
  background: #f8f9fa;
  border-radius: 12px;
  padding: 20px;
  border: 2px dashed #e0e0e0;
}

.camera-container {
  position: relative;
  max-width: 400px;
  margin: 0 auto;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.qr-camera {
  width: 100%;
  height: 300px;
  background: #000;
}

.scanner-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  display: flex;
  align-items: center;
  justify-content: center;
}

.scanner-frame {
  width: 200px;
  height: 200px;
  position: relative;
}

.corner {
  position: absolute;
  width: 30px;
  height: 30px;
  border: 3px solid #00ff00;
}

.corner-tl {
  top: 0;
  left: 0;
  border-right: none;
  border-bottom: none;
}

.corner-tr {
  top: 0;
  right: 0;
  border-left: none;
  border-bottom: none;
}

.corner-bl {
  bottom: 0;
  left: 0;
  border-right: none;
  border-top: none;
}

.corner-br {
  bottom: 0;
  right: 0;
  border-left: none;
  border-top: none;
}

.camera-controls {
  display: flex;
  justify-content: center;
  gap: 12px;
  flex-wrap: wrap;
}

.camera-error {
  background: #fff3cd;
  border-radius: 8px;
  padding: 16px;
  border-left: 4px solid #ffc107;
}

.result-section {
  border-top: 1px solid #e0e0e0;
  padding-top: 24px;
}

.booking-details {
  background: #f8f9fa;
}

.detail-item {
  display: flex;
  align-items: center;
  font-size: 14px;
}

.detail-item strong {
  min-width: 80px;
  margin-right: 8px;
}
</style>

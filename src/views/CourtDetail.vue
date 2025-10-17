<template>
  <div class="court-detail-container">
    <!-- Modern Sports Background -->
    <div class="sports-background">
      <div class="sports-overlay"></div>
      <div class="sports-pattern"></div>
    </div>

    <div v-if="loading" class="loading-section">
      <div class="loading-card">
        <v-progress-circular indeterminate color="primary" size="64"></v-progress-circular>
        <h2 class="loading-title">Loading Court Details...</h2>
        <p class="loading-text">Please wait while we fetch the court information.</p>
      </div>
    </div>

    <div v-else-if="error" class="error-section">
      <div class="error-card">
        <div class="error-icon">
          <v-icon color="error" size="64">mdi-alert-circle</v-icon>
        </div>
        <h2 class="error-title">Error Loading Court</h2>
        <p class="error-text">{{ error }}</p>
        <v-btn
          class="error-btn"
          :to="{ name: 'Courts' }"
          prepend-icon="mdi-arrow-left"
          elevation="4"
        >
          Back to Courts
        </v-btn>
      </div>
    </div>

    <div v-else-if="court">
      <!-- Enhanced Court Header -->
      <div class="court-header">
        <div class="header-content">
          <div class="back-section">
            <v-btn
              class="back-btn"
              variant="outlined"
              prepend-icon="mdi-arrow-left"
              :to="{ name: 'Courts' }"
            >
              Back to Courts
            </v-btn>
          </div>
        </div>
      </div>

      <!-- Court Information Card -->
      <v-row class="mb-6">
        <v-col cols="12">
          <v-card elevation="2" class="court-info-card">
          <v-card-text class="pa-6">
            <v-row>
              <v-col cols="12" md="8">
                <div class="d-flex align-center mb-4">
                  <v-avatar size="64" color="primary" class="mr-4">
                    <v-icon size="32" color="white">mdi-stadium</v-icon>
                  </v-avatar>
                  <div>
                    <h1 class="text-h3 font-weight-bold">{{ court.name }}</h1>
                    <div class="d-flex align-center gap-4 flex-wrap">
                      <v-chip
                        v-for="sport in (court.sports && court.sports.length > 0 ? court.sports : [court.sport])"
                        :key="sport?.id"
                        color="primary"
                        variant="tonal"
                        size="large"
                      >
                        {{ sport?.name }}
                      </v-chip>
                      <v-chip
                        :color="court.is_active ? 'success' : 'error'"
                        variant="tonal"
                        size="large"
                      >
                        {{ court.is_active ? 'Available' : 'Unavailable' }}
                      </v-chip>
                    </div>
                  </div>
                </div>

                <p v-if="court.description" class="text-h6 text-grey-darken-1 mb-4">
                  {{ court.description }}
                </p>

                <div class="d-flex flex-wrap gap-4 mb-4">
                  <div class="d-flex align-center">
                    <v-icon class="mr-2" color="primary">mdi-map-marker</v-icon>
                    <span class="text-body-1">{{ court.location || 'Location not specified' }}</span>
                  </div>
                  <div class="d-flex align-center pl-2">
                    <span class="text-h5 font-weight-bold text-primary">{{ formatPrice(court.sport?.price_per_hour) }}/hour</span>
                  </div>
                </div>

                <div v-if="court.amenities && court.amenities.length" class="mb-4">
                  <h3 class="text-h6 mb-2">Amenities</h3>
                  <div class="d-flex flex-wrap gap-2">
                    <v-chip
                      v-for="amenity in court.amenities"
                      :key="amenity"
                      color="primary"
                      variant="outlined"
                      prepend-icon="mdi-star"
                    >
                      {{ amenity }}
                    </v-chip>
                  </div>
                </div>
              </v-col>

              <v-col cols="12" md="4">
                <v-card variant="outlined" class="pa-4">
                  <h3 class="text-h6 mb-4">Quick Booking</h3>
                  <v-btn
                    color="primary"
                    size="large"
                    block
                    prepend-icon="mdi-calendar-plus"
                    @click="openBookingDialog"
                    :disabled="!court.is_active"
                  >
                    Book This Court
                  </v-btn>
                  <p v-if="!court.is_active" class="text-caption text-error mt-2 text-center">
                    This court is currently unavailable
                  </p>
                </v-card>
                <v-card class="mt-4">
                  <v-carousel>
                    <v-carousel-item v-for="image in court.images" :key="image.id">
                      <img :src="`${image.image_url}`" class="w-100 h-100" style="object-fit: cover; border-radius: 8px;" />
                    </v-carousel-item>
                  </v-carousel>
                </v-card>
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Court Information Tabs -->
    <v-row>
      <v-col cols="12">
        <v-card elevation="2">
          <v-tabs v-model="activeTab" color="primary">
            <v-tab value="availability">
              <v-icon class="mr-2">mdi-calendar-clock</v-icon>
              Availability
            </v-tab>
            <v-tab value="bookings">
              <v-icon class="mr-2">mdi-calendar-text</v-icon>
              Recent Bookings
            </v-tab>
          </v-tabs>

          <v-card-text>
            <v-window v-model="activeTab">
              <!-- Availability Tab -->
              <v-window-item value="availability">
                <div class="pa-4">
                  <h3 class="text-h6 mb-4">Available Time Slots</h3>
                  <v-row>
                    <v-col cols="12" md="6">
                      <v-text-field
                        v-model="selectedDate"
                        label="Select Date"
                        type="date"
                        variant="outlined"
                        prepend-inner-icon="mdi-calendar"
                        @update:model-value="loadAvailability"
                      ></v-text-field>
                    </v-col>
                  </v-row>

                  <div v-if="availabilityLoading" class="text-center pa-4">
                    <v-progress-circular indeterminate color="primary"></v-progress-circular>
                    <p class="mt-2">Loading availability...</p>
                  </div>

                  <div v-else-if="availableSlots.length === 0" class="text-center pa-4">
                    <v-icon size="48" color="grey">mdi-calendar-remove</v-icon>
                    <p class="text-h6 mt-2">No available slots for this date</p>
                    <p class="text-body-2 text-grey mt-1">All time slots are already booked</p>
                    <v-btn
                      color="primary"
                      variant="outlined"
                      class="mt-3"
                      @click="loadAvailability"
                      :loading="availabilityLoading"
                    >
                      <v-icon class="mr-2">mdi-refresh</v-icon>
                      Refresh Availability
                    </v-btn>
                  </div>

                  <div v-else class="d-flex flex-wrap gap-2">
                    <v-chip
                      v-for="slot in availableSlots"
                      :key="slot"
                      color="success"
                      variant="tonal"
                      size="large"
                      class="ma-1"
                    >
                      {{ slot }}
                    </v-chip>
                  </div>
                </div>
              </v-window-item>

              <!-- Bookings Tab -->
              <v-window-item value="bookings">
                <div class="pa-4">
                  <h3 class="text-h6 mb-4">Recent Bookings</h3>
                  <div v-if="recentBookings.length === 0" class="text-center pa-4">
                    <v-icon size="48" color="grey">mdi-calendar-blank</v-icon>
                    <p class="text-h6 mt-2">No recent bookings</p>
                  </div>
                  <div v-else>
                    <v-list>
                      <v-list-item
                        v-for="booking in recentBookings"
                        :key="booking.id"
                        class="mb-2"
                      >
                        <template v-slot:prepend>
                          <v-avatar color="primary" size="40">
                            <v-icon color="white">mdi-account</v-icon>
                          </v-avatar>
                        </template>
                        <v-list-item-title>{{ booking.user.name }}</v-list-item-title>
                        <v-list-item-subtitle>
                          {{ formatDateTime(booking.start_time) }} - {{ formatDateTime(booking.end_time) }}
                        </v-list-item-subtitle>
                        <template v-slot:append>
                          <v-chip
                            :color="getStatusColor(booking.status)"
                            variant="tonal"
                            size="small"
                          >
                            {{ booking.status }}
                          </v-chip>
                        </template>
                      </v-list-item>
                    </v-list>
                  </div>
                </div>
              </v-window-item>
            </v-window>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { courtService } from '../services/courtService'
import { formatPrice } from '../utils/formatters'
export default {
  name: 'CourtDetail',
  setup() {
    const route = useRoute()
    const court = ref(null)
    const loading = ref(true)
    const error = ref(null)
    const activeTab = ref('availability')
    const selectedDate = ref('')
    const availableSlots = ref([])
    const availabilityLoading = ref(false)
    const recentBookings = ref([])

    const loadCourtDetails = async () => {
      try {
        loading.value = true
        error.value = null
        const courtId = route.params.id

        court.value = await courtService.getCourt(courtId)

        // Set today's date as default
        const today = new Date()
        selectedDate.value = today.toISOString().split('T')[0]

        // Load initial availability
        await loadAvailability()
      } catch (err) {
        console.error('Error loading court details:', err)
        error.value = err.message || 'Failed to load court details'
      } finally {
        loading.value = false
      }
    }

    const loadAvailability = async () => {
      if (!selectedDate.value || !court.value) return

      try {
        availabilityLoading.value = true
        const slots = await courtService.getAvailableSlots(
          court.value.id,
          selectedDate.value
        )
        // Map the slots to display formatted_time
        availableSlots.value = slots.map(slot => slot.formatted_time)
      } catch (err) {
        console.error('Failed to load availability:', err)
        availableSlots.value = []
      } finally {
        availabilityLoading.value = false
      }
    }

    const loadRecentBookings = async () => {
      if (!court.value) return

      try {
        const bookings = await courtService.getBookings()
        recentBookings.value = bookings
          .filter(booking => booking.court_id === court.value.id)
          .slice(0, 10) // Show only recent 10 bookings
      } catch (err) {
        console.error('Failed to load recent bookings:', err)
        recentBookings.value = []
      }
    }

    const openBookingDialog = () => {
      // Emit event to parent (App.vue) to open the global booking dialog
      window.dispatchEvent(new CustomEvent('open-booking-dialog'))
    }

    const handleBookingSaved = () => {
      // Refresh availability and recent bookings
      loadAvailability()
      loadRecentBookings()

      // Dispatch event to refresh bookings table
      window.dispatchEvent(new CustomEvent('booking-created'))
    }

    const formatDateTime = (dateTime) => {
      return new Date(dateTime).toLocaleString()
    }

    const getStatusColor = (status) => {
      const colors = {
        pending: 'warning',
        confirmed: 'success',
        cancelled: 'error',
        completed: 'info'
      }
      return colors[status] || 'grey'
    }

    onMounted(() => {
      loadCourtDetails()
      loadRecentBookings()
    })

    return {
      court,
      loading,
      error,
      activeTab,
      selectedDate,
      availableSlots,
      availabilityLoading,
      recentBookings,
      loadAvailability,
      openBookingDialog,
      handleBookingSaved,
      formatDateTime,
      getStatusColor,
      formatPrice
    }
  }
}
</script>

<style scoped>
/* Modern Sports Court Detail Theme */
.court-detail-container {
  background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
  min-height: 100vh;
  padding: 32px;
  position: relative;
  z-index: 1;
}

/* Enhanced Background */
.sports-background {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #FFFFFF 0%, #FFEBEE 25%, #FFCDD2 50%, #FFEBEE 75%, #FFFFFF 100%);
  z-index: -3;
}

.sports-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background:
    radial-gradient(circle at 20% 80%, rgba(183, 28, 28, 0.08) 0%, transparent 50%),
    radial-gradient(circle at 80% 20%, rgba(198, 40, 40, 0.06) 0%, transparent 50%),
    radial-gradient(circle at 40% 40%, rgba(211, 47, 47, 0.05) 0%, transparent 50%);
  z-index: -2;
}

.sports-pattern {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-image:
    radial-gradient(circle at 1px 1px, rgba(183, 28, 28, 0.03) 1px, transparent 0);
  background-size: 20px 20px;
  z-index: -1;
}

/* Loading Section */
.loading-section {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 60vh;
  padding: 48px 0;
}

.loading-card {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-radius: 24px;
  padding: 48px;
  text-align: center;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.2);
  max-width: 500px;
  width: 100%;
}

.loading-title {
  font-size: 2rem;
  font-weight: 700;
  margin: 24px 0 16px;
  background: linear-gradient(135deg, #1e293b 0%, #3b82f6 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.loading-text {
  color: #64748b;
  line-height: 1.6;
  font-size: 1.1rem;
}

/* Error Section */
.error-section {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 60vh;
  padding: 48px 0;
}

.error-card {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-radius: 24px;
  padding: 48px;
  text-align: center;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.2);
  max-width: 500px;
  width: 100%;
}

.error-icon {
  margin-bottom: 24px;
}

.error-title {
  font-size: 2rem;
  font-weight: 700;
  margin-bottom: 16px;
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.error-text {
  color: #64748b;
  line-height: 1.6;
  margin-bottom: 32px;
  font-size: 1.1rem;
}

.error-btn {
  background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%) !important;
  color: white !important;
  border-radius: 12px !important;
  font-weight: 700 !important;
  text-transform: none !important;
  padding: 16px 32px !important;
  box-shadow: 0 8px 25px rgba(59, 130, 246, 0.4) !important;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
}

.error-btn:hover {
  transform: translateY(-4px) !important;
  box-shadow: 0 12px 35px rgba(59, 130, 246, 0.6) !important;
}

/* Court Header */
.court-header {
  margin-bottom: 48px;
}

.header-content {
  position: relative;
  z-index: 2;
}

.back-section {
  margin-bottom: 24px;
}

.back-btn {
  border-radius: 8px !important;
  font-weight: 600 !important;
  text-transform: none !important;
  border: 1px solid rgba(255, 255, 255, 0.3) !important;
  color: white !important;
  background: rgba(255, 255, 255, 0.1) !important;
  backdrop-filter: blur(10px) !important;
}

.back-btn:hover {
  background: rgba(255, 255, 255, 0.2) !important;
  border-color: rgba(255, 255, 255, 0.5) !important;
}

/* Responsive Design */
@media (max-width: 768px) {
  .court-detail-container {
    padding: 16px;
  }

  .loading-card,
  .error-card {
    padding: 32px 24px;
  }

  .loading-title,
  .error-title {
    font-size: 1.5rem;
  }
}

@media (max-width: 480px) {
  .court-detail-container {
    padding: 12px;
  }

  .loading-card,
  .error-card {
    padding: 24px 16px;
  }
}
</style>
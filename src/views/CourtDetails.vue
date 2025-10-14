<template>
  <div class="court-details-container">
    <!-- Loading State -->
    <div v-if="loading" class="loading-container">
      <v-progress-circular indeterminate size="64" color="primary"></v-progress-circular>
      <p class="mt-4">Loading court details...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="error-container">
      <v-icon size="64" color="error">mdi-alert-circle</v-icon>
      <p class="text-h6 mt-4">{{ error }}</p>
      <v-btn color="primary" class="mt-4" @click="$router.push('/courts')">
        Back to Courts
      </v-btn>
    </div>

    <!-- Court Details -->
    <div v-else-if="court" class="court-details-content">
      <!-- Back Button -->
      <v-btn
        class="back-btn"
        variant="text"
        prepend-icon="mdi-arrow-left"
        @click="$router.push('/courts')"
      >
        Back to Courts
      </v-btn>

      <!-- Court Header -->
      <div class="court-header">
        <div class="court-title-section">
          <h1 class="court-title">{{ court.name }}</h1>
          <v-chip
            :color="court.is_active ? 'success' : 'error'"
            size="large"
            class="status-chip"
          >
            {{ court.is_active ? 'Active' : 'Inactive' }}
          </v-chip>
        </div>
        <div class="sport-chips-container">
          <v-chip
            v-for="sport in (court.sports && court.sports.length > 0 ? court.sports : [court.sport])"
            :key="sport?.id"
            :color="getSportColor(sport?.name)"
            size="large"
            class="sport-chip"
          >
            <v-icon start>{{ getSportIcon(sport?.name) }}</v-icon>
            {{ sport?.name }}
          </v-chip>
        </div>
      </div>

      <!-- Court Images Gallery -->
      <div class="court-gallery">
        <v-carousel
          v-if="court.images && court.images.length > 0"
          height="500"
          show-arrows="hover"
          cycle
          hide-delimiters
        >
          <v-carousel-item
            v-for="(image, index) in court.images"
            :key="index"
            :src="image.image_url"
            cover
          ></v-carousel-item>
        </v-carousel>
        <div v-else class="no-image">
          <v-icon size="120" color="grey-lighten-1">mdi-stadium</v-icon>
          <p class="text-grey mt-4">No images available</p>
        </div>
      </div>

      <!-- Court Information Grid -->
      <v-row class="court-info-grid">
        <v-col cols="12" md="8">
          <!-- Tabs -->
          <v-card class="info-card" elevation="2">
            <v-tabs v-model="activeTab" bg-color="primary" slider-color="white">
              <v-tab value="description">
                <v-icon start>mdi-text</v-icon>
                Description
              </v-tab>
              <v-tab value="availability">
                <v-icon start>mdi-calendar-clock</v-icon>
                Availability
              </v-tab>
              <v-tab value="bookings">
                <v-icon start>mdi-history</v-icon>
                Recent Bookings
              </v-tab>
            </v-tabs>

            <v-window v-model="activeTab">
              <!-- Description Tab -->
              <v-window-item value="description">
                <v-card-text class="pa-6">
                  <p class="text-body-1" style="line-height: 1.8;">
                    {{ court.description || 'No description available.' }}
                  </p>
                </v-card-text>
              </v-window-item>

              <!-- Availability Tab -->
              <v-window-item value="availability">
                <v-card-text>
                  <div class="mb-4">
                    <v-text-field
                      v-model="selectedDate"
                      type="date"
                      label="Select Date"
                      variant="outlined"
                      prepend-inner-icon="mdi-calendar"
                      :min="new Date().toISOString().split('T')[0]"
                      @update:model-value="fetchAvailability"
                    ></v-text-field>
                  </div>

                  <v-progress-linear v-if="loadingAvailability" indeterminate color="primary"></v-progress-linear>

                  <div v-else-if="availableSlots.length > 0">
                    <h4 class="mb-3">Available Time Slots</h4>
                    <v-row>
                      <v-col
                        v-for="(slot, index) in availableSlots"
                        :key="index"
                        cols="6"
                        sm="4"
                        md="3"
                      >
                        <v-chip
                          :color="slot.available ? 'success' : 'error'"
                          variant="flat"
                          size="large"
                          class="availability-chip"
                          block
                        >
                          <v-icon start size="small">
                            {{ slot.available ? 'mdi-check-circle' : 'mdi-close-circle' }}
                          </v-icon>
                          {{ formatTimeSlot(slot.start) }} - {{ formatTimeSlot(slot.end) }}
                        </v-chip>
                      </v-col>
                    </v-row>
                  </div>

                  <div v-else class="text-center py-8">
                    <v-icon size="64" color="grey-lighten-1">mdi-calendar-remove</v-icon>
                    <p class="text-grey mt-4">Select a date to view availability</p>
                  </div>
                </v-card-text>
              </v-window-item>

              <!-- Recent Bookings Tab -->
              <v-window-item value="bookings">
                <v-card-text>
                  <v-progress-linear v-if="loadingBookings" indeterminate color="primary"></v-progress-linear>

                  <div v-else-if="recentBookings.length > 0">
                    <v-list lines="three">
                      <v-list-item
                        v-for="(booking, index) in recentBookings"
                        :key="index"
                        class="booking-item"
                      >
                        <template v-slot:prepend>
                          <v-avatar :color="getStatusColor(booking.approval_status)">
                            <v-icon color="white">{{ getStatusIcon(booking.approval_status) }}</v-icon>
                          </v-avatar>
                        </template>

                        <v-list-item-title class="font-weight-bold">
                          {{ formatBookingDate(getBookingDate(booking)) }}
                        </v-list-item-title>

                        <v-list-item-subtitle>
                          <div class="d-flex flex-column gap-1">
                            <span>
                              <v-icon size="small">mdi-clock-outline</v-icon>
                              {{ getBookingTimeRange(booking) }}
                            </span>
                            <span>
                              <v-icon size="small">mdi-account</v-icon>
                              {{ booking.user?.name || 'Unknown' }}
                            </span>
                            <span>
                              <v-icon size="small">mdi-cash</v-icon>
                              ₱{{ getBookingPrice(booking) }}
                            </span>
                          </div>
                        </v-list-item-subtitle>

                        <template v-slot:append>
                          <v-chip
                            :color="getStatusColor(booking.approval_status)"
                            size="small"
                            variant="flat"
                          >
                            {{ booking.approval_status }}
                          </v-chip>
                        </template>
                      </v-list-item>
                    </v-list>
                  </div>

                  <div v-else class="text-center py-8">
                    <v-icon size="64" color="grey-lighten-1">mdi-calendar-blank</v-icon>
                    <p class="text-grey mt-4">No recent bookings</p>
                  </div>
                </v-card-text>
              </v-window-item>
            </v-window>
          </v-card>
        </v-col>

        <v-col cols="12" md="4">
          <!-- Quick Info -->
          <v-card class="info-card" elevation="2">
            <v-card-title class="info-card-title">
              <v-icon class="mr-2">mdi-information</v-icon>
              Quick Info
            </v-card-title>
            <v-card-text>
              <div class="info-item">
                <div class="info-label">
                  <v-icon size="small" class="mr-2">mdi-cash</v-icon>
                  Price per Hour
                </div>
                <div class="info-value price-value">
                  ₱{{ court.price_per_hour }}
                </div>
              </div>

              <v-divider class="my-3"></v-divider>

              <div class="info-item">
                <div class="info-label">
                  <v-icon size="small" class="mr-2">mdi-map-marker</v-icon>
                  Location
                </div>
                <div class="info-value">
                  {{ court.location || 'Not specified' }}
                </div>
              </div>

              <v-divider class="my-3"></v-divider>

              <div class="info-item">
                <div class="info-label">
                  <v-icon size="small" class="mr-2">mdi-ruler</v-icon>
                  Court Size
                </div>
                <div class="info-value">
                  {{ court.size || 'Standard' }}
                </div>
              </div>

              <v-divider class="my-3"></v-divider>

              <div class="info-item">
                <div class="info-label">
                  <v-icon size="small" class="mr-2">mdi-star</v-icon>
                  Amenities
                </div>
                <div class="info-value mt-2">
                  <div v-if="getAmenitiesArray(court.amenities).length > 0">
                    <v-chip
                      v-for="(amenity, index) in getAmenitiesArray(court.amenities)"
                      :key="index"
                      variant="outlined"
                      color="primary"
                      size="small"
                      class="mr-1 mb-2"
                    >
                      <v-icon start size="x-small">mdi-check-circle</v-icon>
                      {{ amenity }}
                    </v-chip>
                  </div>
                  <div v-else class="text-grey text-caption">
                    No amenities listed
                  </div>
                </div>
              </div>
            </v-card-text>
          </v-card>

          <!-- Book Now Button -->
          <v-btn
            color="primary"
            size="x-large"
            block
            class="mt-4 book-btn"
            prepend-icon="mdi-calendar-check"
            @click="bookCourt"
          >
            Book This Court
          </v-btn>
        </v-col>
      </v-row>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { courtService } from '../services/courtService'
import api from '../services/api'

export default {
  name: 'CourtDetails',
  setup() {
    const route = useRoute()
    const router = useRouter()
    const court = ref(null)
    const loading = ref(true)
    const error = ref(null)
    const activeTab = ref('description')

    // Availability
    const selectedDate = ref('')
    const availableSlots = ref([])
    const loadingAvailability = ref(false)

    // Recent Bookings
    const recentBookings = ref([])
    const loadingBookings = ref(false)

    const getSportColor = (sportName) => {
      const colors = {
        'Basketball': 'orange',
        'Tennis': 'green',
        'Badminton': 'blue',
        'Volleyball': 'red',
        'Football': 'teal',
        'Soccer': 'purple'
      }
      return colors[sportName] || 'grey'
    }

    const getSportIcon = (sportName) => {
      const icons = {
        'Basketball': 'mdi-basketball',
        'Tennis': 'mdi-tennis',
        'Badminton': 'mdi-badminton',
        'Volleyball': 'mdi-volleyball',
        'Football': 'mdi-football',
        'Soccer': 'mdi-soccer'
      }
      return icons[sportName] || 'mdi-stadium'
    }

    const fetchCourtDetails = async () => {
      try {
        loading.value = true
        const courtId = route.params.id
        court.value = await courtService.getCourt(courtId)
      } catch (err) {
        error.value = err.message || 'Failed to load court details'
        console.error('Error fetching court details:', err)
      } finally {
        loading.value = false
      }
    }

    const fetchAvailability = async () => {
      if (!selectedDate.value || !court.value) return

      try {
        loadingAvailability.value = true
        const response = await courtService.getAvailableSlots(court.value.id, selectedDate.value)
        availableSlots.value = response
      } catch (err) {
        console.error('Error fetching availability:', err)
        availableSlots.value = []
      } finally {
        loadingAvailability.value = false
      }
    }

    const fetchRecentBookings = async () => {
      if (!court.value) {
        console.log('No court data available yet')
        return
      }

      try {
        loadingBookings.value = true
        console.log('Fetching recent bookings for court:', court.value.id)
        const response = await api.get(`/courts/${court.value.id}/recent-bookings`)
        console.log('Recent bookings response:', response.data)
        recentBookings.value = response.data.data || response.data
        console.log('Recent bookings:', recentBookings.value)
      } catch (err) {
        console.error('Error fetching recent bookings:', err)
        console.error('Error details:', err.response?.data)
        recentBookings.value = []
      } finally {
        loadingBookings.value = false
      }
    }

    const formatTimeSlot = (time) => {
      if (!time) return ''
      const [hours, minutes] = time.split(':')
      const hour = parseInt(hours)
      const ampm = hour >= 12 ? 'PM' : 'AM'
      const displayHour = hour % 12 || 12
      return `${displayHour}:${minutes} ${ampm}`
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

    const getBookingDate = (booking) => {
      // Get the booking date from the first cart item
      if (booking.cart_items && booking.cart_items.length > 0) {
        return booking.cart_items[0].booking_date
      }
      return booking.created_at
    }

    const getBookingTimeRange = (booking) => {
      if (booking.cart_items && booking.cart_items.length > 0) {
        const items = booking.cart_items
        // Sort items by start_time to get earliest and latest
        const sortedItems = [...items].sort((a, b) => a.start_time.localeCompare(b.start_time))
        const start = formatTimeSlot(sortedItems[0].start_time)
        const end = formatTimeSlot(sortedItems[sortedItems.length - 1].end_time)
        return `${start} - ${end}`
      }
      return 'N/A'
    }

    const getBookingPrice = (booking) => {
      if (booking.cart_items && booking.cart_items.length > 0) {
        // Sum up the price of all cart items for this court
        const total = booking.cart_items.reduce((sum, item) => {
          return sum + parseFloat(item.price || 0)
        }, 0)
        return total.toFixed(2)
      }
      return booking.total_price || '0.00'
    }

    const getStatusColor = (status) => {
      const colors = {
        'pending': 'orange',
        'approved': 'success',
        'rejected': 'error',
        'completed': 'blue',
        'cancelled': 'grey'
      }
      return colors[status] || 'grey'
    }

    const getStatusIcon = (status) => {
      const icons = {
        'pending': 'mdi-clock-outline',
        'approved': 'mdi-check-circle',
        'rejected': 'mdi-close-circle',
        'completed': 'mdi-check-all',
        'cancelled': 'mdi-cancel'
      }
      return icons[status] || 'mdi-help-circle'
    }

    const getAmenitiesArray = (amenities) => {
      if (!amenities) return []

      // If it's already an array, return it
      if (Array.isArray(amenities)) {
        return amenities.filter(a => a && a.trim())
      }

      // If it's a string, split by comma
      if (typeof amenities === 'string') {
        return amenities.split(',').map(a => a.trim()).filter(a => a)
      }

      return []
    }

    const bookCourt = () => {
      // Navigate to booking page or open booking dialog
      router.push('/bookings')
    }

    onMounted(async () => {
      await fetchCourtDetails()
      // Fetch bookings after court is loaded
      if (court.value) {
        await fetchRecentBookings()
      }
    })

    return {
      court,
      loading,
      error,
      activeTab,
      selectedDate,
      availableSlots,
      loadingAvailability,
      recentBookings,
      loadingBookings,
      getSportColor,
      getSportIcon,
      fetchAvailability,
      formatTimeSlot,
      formatBookingDate,
      getBookingDate,
      getBookingTimeRange,
      getBookingPrice,
      getStatusColor,
      getStatusIcon,
      getAmenitiesArray,
      bookCourt
    }
  }
}
</script>

<style scoped>
.court-details-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
  padding: 32px;
}

.loading-container,
.error-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 60vh;
}

.court-details-content {
  max-width: 1400px;
  margin: 0 auto;
}

.back-btn {
  margin-bottom: 24px;
}

.court-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 32px;
  flex-wrap: wrap;
  gap: 16px;
}

.court-title-section {
  display: flex;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;
}

.court-title {
  font-size: 2.5rem;
  font-weight: 700;
  color: #1e293b;
  margin: 0;
}

.status-chip,
.sport-chip {
  font-weight: 600;
}

.sport-chips-container {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.court-gallery {
  margin-bottom: 32px;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.no-image {
  height: 500px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%);
}

.court-info-grid {
  margin-top: 32px;
}

.info-card {
  border-radius: 12px;
}

.info-card-title {
  background: linear-gradient(135deg, #1976d2 0%, #1565c0 100%);
  color: white;
  font-weight: 600;
}

.info-item {
  margin-bottom: 16px;
}

.info-item:last-child {
  margin-bottom: 0;
}

.info-label {
  font-size: 0.875rem;
  color: #64748b;
  font-weight: 600;
  margin-bottom: 4px;
  display: flex;
  align-items: center;
}

.info-value {
  font-size: 1rem;
  color: #1e293b;
  font-weight: 500;
}

.price-value {
  font-size: 1.5rem;
  color: #059669;
  font-weight: 700;
}

.book-btn {
  font-weight: 600;
  box-shadow: 0 4px 12px rgba(25, 118, 210, 0.3);
}

/* Tabs Styles */
.availability-chip {
  justify-content: center;
  font-weight: 600;
}

.booking-item {
  border-bottom: 1px solid #e2e8f0;
}

.booking-item:last-child {
  border-bottom: none;
}

/* Responsive */
@media (max-width: 960px) {
  .court-details-container {
    padding: 16px;
  }

  .court-title {
    font-size: 2rem;
  }

  .court-gallery {
    height: 300px;
  }

  .no-image {
    height: 300px;
  }
}
</style>

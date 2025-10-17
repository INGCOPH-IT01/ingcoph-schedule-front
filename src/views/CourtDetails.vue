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
            <v-icon start>{{ getSportIcon(sport?.name, sport?.icon) }}</v-icon>
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
                <v-card-text class="pa-6">
                  <!-- Date Selection with Quick Actions -->
                  <div class="mb-4">
                    <div class="d-flex align-center justify-space-between mb-3">
                      <h4 class="text-subtitle-1 font-weight-bold">Select Date</h4>
                      <div class="d-flex gap-2">
                        <v-btn
                          size="small"
                          variant="outlined"
                          @click="setToday"
                          :color="isToday(selectedDate) ? 'primary' : 'default'"
                        >
                          Today
                        </v-btn>
                        <v-btn
                          size="small"
                          variant="outlined"
                          @click="setTomorrow"
                        >
                          Tomorrow
                        </v-btn>
                      </div>
                    </div>
                    <v-text-field
                      v-model="selectedDate"
                      type="date"
                      label="Select Date"
                      variant="outlined"
                      prepend-inner-icon="mdi-calendar"
                      :min="new Date().toISOString().split('T')[0]"
                      @update:model-value="fetchAvailability"
                      density="comfortable"
                    ></v-text-field>
                  </div>

                  <v-progress-linear v-if="loadingAvailability" indeterminate color="primary" class="mb-4"></v-progress-linear>

                  <div v-else-if="availableSlots.length > 0">
                    <!-- Availability Summary -->
                    <v-alert
                      type="info"
                      variant="tonal"
                      class="mb-4"
                      density="compact"
                    >
                      <div class="d-flex align-center">
                        <v-icon class="mr-2">mdi-information</v-icon>
                        <div>
                          <strong>{{ getAvailableCount() }}</strong> available slots out of <strong>{{ availableSlots.length }}</strong> total slots
                        </div>
                      </div>
                    </v-alert>

                    <!-- Time Slots Grid - Booking Dialog Pattern -->
                    <h4 class="mb-3 d-flex align-center">
                      <v-icon class="mr-2" color="primary">mdi-clock-outline</v-icon>
                      Available Time Slots
                    </h4>
                    <div class="time-slots-grid">
                      <v-card
                        v-for="(slot, index) in availableSlots"
                        :key="index"
                        :class="['time-slot-card', {
                          'unavailable': !slot.available,
                          'selected': false
                        }]"
                        @click="handleSlotClick(slot)"
                      >
                        <v-card-text class="text-center pa-3">
                          <div class="text-body-2 font-weight-bold">{{ formatTimeSlot(slot.start) }}</div>
                          <div class="text-caption">to</div>
                          <div class="text-body-2 font-weight-bold">{{ formatTimeSlot(slot.end) }}</div>
                          <v-chip
                            :color="slot.available ? 'success' : 'error'"
                            size="x-small"
                            class="mt-2"
                          >
                            {{ slot.available ? 'Available' : 'Booked' }}
                          </v-chip>
                        </v-card-text>
                      </v-card>
                    </div>

                    <!-- Legend -->
                    <div class="mt-4 d-flex gap-4 justify-center flex-wrap">
                      <div class="d-flex align-center">
                        <v-chip color="success" size="x-small" class="mr-2" variant="flat"></v-chip>
                        <span class="text-caption">Available</span>
                      </div>
                      <div class="d-flex align-center">
                        <v-chip color="grey" size="x-small" class="mr-2" variant="flat"></v-chip>
                        <span class="text-caption">Booked</span>
                      </div>
                    </div>
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
                        :class="['booking-item', { 'booking-item-clickable': isAdminOrStaff }]"
                        @click="isAdminOrStaff ? viewBookingDetailsDialog(booking) : null"
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
                          <div class="d-flex align-center gap-2">
                            <v-chip
                              :color="getStatusColor(booking.approval_status)"
                              size="small"
                              variant="flat"
                            >
                              {{ booking.approval_status }}
                            </v-chip>
                            <v-icon v-if="isAdminOrStaff" size="small" color="primary">mdi-chevron-right</v-icon>
                          </div>
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
                  ₱{{ court.sport?.price_per_hour }}
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

    <!-- Booking Details Dialog -->
    <v-dialog
      v-model="bookingDetailsDialog"
      max-width="700px"
      class="booking-details-dialog"
      persistent
    >
      <v-card v-if="selectedBookingSlot" class="booking-details-dialog">
        <v-card-title class="text-h5 dialog-title">
          <div class="d-flex align-center">
            <v-icon class="mr-2">mdi-calendar-clock</v-icon>
            Time Slot Details
          </div>
          <v-btn icon="mdi-close" variant="text" @click="bookingDetailsDialog = false"></v-btn>
        </v-card-title>

        <v-card-text>
          <v-row>
            <v-col cols="12" md="6">
              <div class="detail-section">
                <h4 class="detail-label">Court Information</h4>
                <div class="detail-content">
                  <div class="detail-item">
                    <strong>Court:</strong> {{ court.name || 'Unknown' }}
                  </div>
                  <div class="detail-item">
                    <strong>Sport:</strong> {{ court.sport?.name || 'N/A' }}
                  </div>
                  <div class="detail-item">
                    <strong>Price:</strong> ₱{{ formatPrice(selectedBookingSlot.price) }}/hour
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
                      :color="selectedBookingSlot.available ? 'success' : 'error'"
                      variant="tonal"
                      size="small"
                      class="ml-2"
                    >
                      {{ selectedBookingSlot.available ? 'Available' : 'Booked' }}
                    </v-chip>
                  </div>
                  <div class="detail-item" v-if="!selectedBookingSlot.available && selectedBookingSlot.type">
                    <strong>Type:</strong>
                    <v-chip
                      :color="getBookingTypeColor(selectedBookingSlot.type)"
                      variant="tonal"
                      size="small"
                      class="ml-2"
                    >
                      {{ getBookingTypeLabel(selectedBookingSlot.type) }}
                    </v-chip>
                  </div>
                  <div class="detail-item">
                    <strong>Duration:</strong> {{ formatDuration(selectedBookingSlot.duration_hours) }} hour(s)
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
                    <strong>Date:</strong> {{ formatDate(selectedDate) }}
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
                        {{ formatTimeSlot(selectedBookingSlot.start) }} - {{ formatTimeSlot(selectedBookingSlot.end) }}
                        <span class="ml-2 font-weight-bold">₱{{ formatPrice(selectedBookingSlot.price) }}</span>
                      </v-chip>
                    </div>
                    <div class="mt-2">
                      <strong>Duration:</strong> {{ formatDuration(selectedBookingSlot.duration_hours) }} hours
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
                      :color="selectedBookingSlot.available ? 'success' : 'error'"
                      variant="tonal"
                      size="small"
                      class="ml-2"
                    >
                      {{ selectedBookingSlot.available ? 'Available' : 'Booked' }}
                    </v-chip>
                  </div>
                  <div class="detail-item" v-if="!selectedBookingSlot.available && selectedBookingSlot.status">
                    <strong>Payment:</strong>
                    <v-chip
                      :color="selectedBookingSlot.status === 'paid' ? 'success' : 'warning'"
                      variant="tonal"
                      size="small"
                      class="ml-2"
                    >
                      {{ selectedBookingSlot.status }}
                    </v-chip>
                  </div>
                  <div class="detail-item">
                    <strong>Total Amount:</strong>
                    <span class="ml-2 text-h6 text-success font-weight-bold">
                      ₱{{ formatPrice(selectedBookingSlot.price) }}
                    </span>
                  </div>
                </div>
              </div>
            </v-col>
          </v-row>

          <!-- Additional Info for Booked Slots -->
          <v-row v-if="!selectedBookingSlot.available && selectedBookingSlot.type">
            <v-col cols="12">
              <div class="detail-section">
                <h4 class="detail-label">
                  <v-icon class="mr-2" :color="getBookingTypeColor(selectedBookingSlot.type)">
                    {{ getBookingTypeIcon(selectedBookingSlot.type) }}
                  </v-icon>
                  Booking Type Information
                </h4>
                <div class="detail-content">
                  <v-alert
                    :type="selectedBookingSlot.type === 'booking' ? 'info' : 'warning'"
                    variant="tonal"
                    class="mb-0"
                  >
                    <div class="text-body-2">
                      <strong>{{ getBookingTypeLabel(selectedBookingSlot.type) }}</strong><br>
                      {{ getBookingTypeDescription(selectedBookingSlot.type) }}
                    </div>
                  </v-alert>
                </div>
              </div>
            </v-col>
          </v-row>
        </v-card-text>

        <v-card-actions v-if="selectedBookingSlot.available">
          <v-spacer></v-spacer>
          <v-btn
            color="primary"
            @click="bookTimeSlot(selectedBookingSlot)"
          >
            <v-icon start>mdi-calendar-plus</v-icon>
            Book Now
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Booking Details View Dialog (for admin/staff) -->
    <BookingDetailsDialog
      v-model:is-open="bookingViewDialog"
      :booking="selectedBookingForView"
      :court-name="court?.name"
      @close="bookingViewDialog = false"
    />
  </div>
</template>

<script>
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { courtService } from '../services/courtService'
import { authService } from '../services/authService'
import api from '../services/api'
import BookingDetailsDialog from '../components/BookingDetailsDialog.vue'

export default {
  name: 'CourtDetails',
  components: {
    BookingDetailsDialog
  },
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

    // Booking details dialog
    const bookingDetailsDialog = ref(false)
    const selectedBookingSlot = ref(null)

    // Booking view dialog for admin/staff
    const bookingViewDialog = ref(false)
    const selectedBookingForView = ref(null)
    const userRole = ref(null)

    // Computed property to check if user is admin or staff
    const isAdminOrStaff = computed(() => {
      return userRole.value === 'admin' || userRole.value === 'staff'
    })

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

    const getSportIcon = (sportName, sportIcon = null) => {
      // Return the icon from Sport model if available
      if (sportIcon) {
        return sportIcon
      }

      // Fallback MDI icons if Sport model doesn't have an icon
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
        return
      }

      try {
        loadingBookings.value = true
        const response = await api.get(`/courts/${court.value.id}/recent-bookings`)
        recentBookings.value = response.data.data || response.data
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

    const setToday = () => {
      selectedDate.value = new Date().toISOString().split('T')[0]
    }

    const setTomorrow = () => {
      const tomorrow = new Date()
      tomorrow.setDate(tomorrow.getDate() + 1)
      selectedDate.value = tomorrow.toISOString().split('T')[0]
    }

    const isToday = (date) => {
      if (!date) return false
      const today = new Date().toISOString().split('T')[0]
      return date === today
    }

    const getAvailableCount = () => {
      return availableSlots.value.filter(slot => slot.available).length
    }

    const bookTimeSlot = (slot) => {
      bookingDetailsDialog.value = false
      // Navigate to bookings page with pre-selected court and time
      router.push({
        path: '/bookings',
        query: {
          courtId: court.value.id,
          date: selectedDate.value,
          start: slot.start,
          end: slot.end
        }
      })
    }

    const handleSlotClick = (slot) => {
      selectedBookingSlot.value = slot
      bookingDetailsDialog.value = true
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

    const formatDate = (date) => {
      if (!date) return ''
      const d = new Date(date)
      return d.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    }

    const formatPrice = (price) => {
      const numPrice = Math.abs(parseFloat(price || 0))
      return numPrice.toFixed(2)
    }

    const formatDuration = (hours) => {
      const numHours = Math.abs(parseFloat(hours || 1))
      return numHours
    }

    const viewBookingDetailsDialog = (booking) => {
      selectedBookingForView.value = booking
      bookingViewDialog.value = true
    }

    const checkUserRole = async () => {
      try {
        userRole.value = await authService.getUserRole()
      } catch (error) {
        console.error('Failed to get user role:', error)
        userRole.value = 'user'
      }
    }

    onMounted(async () => {
      await checkUserRole()
      await fetchCourtDetails()
      // Fetch bookings after court is loaded
      if (court.value) {
        await fetchRecentBookings()
      }
      // Set today's date by default
      setToday()
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
      bookCourt,
      setToday,
      setTomorrow,
      isToday,
      getAvailableCount,
      bookTimeSlot,
      handleSlotClick,
      bookingDetailsDialog,
      selectedBookingSlot,
      getBookingTypeColor,
      getBookingTypeIcon,
      getBookingTypeLabel,
      getBookingTypeDescription,
      formatDate,
      formatPrice,
      formatDuration,
      // Booking view dialog
      bookingViewDialog,
      selectedBookingForView,
      viewBookingDetailsDialog,
      isAdminOrStaff
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
  color: #B71C1C;
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
  color: #B71C1C;
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

.booking-item-clickable {
  cursor: pointer;
  transition: all 0.3s ease;
}

.booking-item-clickable:hover {
  background-color: #f8fafc !important;
  transform: translateX(4px);
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

/* Time Slots Grid - Matching Booking Dialog */
.time-slots-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  gap: 12px;
  margin-top: 16px;
}

.time-slot-card {
  cursor: pointer;
  transition: all 0.3s ease;
  border: 2px solid transparent;
  background: #ffffff !important;
  position: relative;
  overflow: hidden;
}

.time-slot-card .v-card-text {
  color: #1f2937 !important;
}

.time-slot-card:hover:not(.unavailable) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  border-color: #90caf9;
  background: #f8fafc !important;
}

.time-slot-card.selected {
  border-color: #1976d2 !important;
  background: linear-gradient(135deg, rgba(25, 118, 210, 0.15) 0%, rgba(21, 101, 192, 0.1) 100%) !important;
  box-shadow: 0 4px 12px rgba(25, 118, 210, 0.3) !important;
  transform: scale(1.05);
}

.time-slot-card.unavailable {
  opacity: 0.8;
  cursor: pointer;
  background: #fff3f3 !important;
  border-color: #ffcdd2;
}

.time-slot-card.unavailable:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(244, 67, 54, 0.2);
  border-color: #ef5350;
}

/* Legacy styles for backward compatibility */
.time-slots-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  gap: 12px;
  margin-top: 16px;
}

.time-slot-card-court {
  cursor: pointer;
  transition: all 0.3s ease;
  border: 2px solid transparent;
  background: #ffffff !important;
  position: relative;
  overflow: hidden;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.time-slot-card-court .v-card-text {
  color: #1f2937 !important;
  padding: 16px 12px !important;
}

.time-slot-card-court:hover:not(.unavailable) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  border-color: #90caf9;
  background: #f8fafc !important;
}

.time-slot-card-court.unavailable {
  opacity: 0.6;
  cursor: not-allowed;
  background: #f8f9fa !important;
}

.time-slot-card-court.unavailable .time-range-text {
  color: #6b7280 !important;
}

.time-slot-card-court.unavailable .status-text {
  color: #9ca3af !important;
}

/* Mobile responsive */
@media (max-width: 768px) {
  .time-slots-grid-enhanced {
    grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
    gap: 12px;
  }

  .time-slot-card-enhanced .v-card-text {
    padding: 16px 12px !important;
  }

  .time-range-text {
    font-size: 14px;
  }

  .time-divider {
    font-size: 10px;
  }

  .status-text {
    font-size: 11px;
  }

  .price-tag {
    font-size: 12px;
  }

  /* Legacy grid responsive */
  .time-slots-grid {
    grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
    gap: 8px;
  }

  .time-slot-card-court .v-card-text {
    padding: 12px 8px !important;
  }
}

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

</style>

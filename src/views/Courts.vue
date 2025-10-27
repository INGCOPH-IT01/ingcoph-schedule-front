<template>
  <div class="courts-container">
    <!-- Enhanced Header -->
    <div class="courts-header">
      <div class="header-content">
        <div class="header-badge">
          <v-icon color="#B71C1C" size="20" class="mr-2">mdi-stadium</v-icon>
          {{ isAdmin ? 'Court Management' : 'Court Directory' }}
        </div>
        <h1 class="header-title">
          <span class="title-gradient">{{ isAdmin ? 'Manage' : 'Explore' }}</span> Courts
        </h1>
        <p class="header-subtitle">
          {{ isAdmin ? 'Manage and organize multi-sport court facilities with professional precision' : 'Discover and book premium multi-sport court facilities' }}
        </p>
        <div v-if="isAdmin" class="header-actions">
          <v-btn
            class="header-btn-primary"
            size="x-large"
            prepend-icon="mdi-plus"
            @click="openAddDialog"
            elevation="8"
          >
            Add New Court
          </v-btn>
        </div>
      </div>
    </div>

    <!-- Enhanced Toolbar -->
    <div class="courts-toolbar">
      <div class="toolbar-section">
        <div class="filters-section">
          <!-- Date Filter for Time Availability -->
          <div class="date-filter-section">
            <v-text-field
              v-model="availabilityDate"
              type="date"
              label="Filter by Date"
              variant="outlined"
              density="compact"
              prepend-inner-icon="mdi-calendar"
              hide-details
              :min="minDate"
              class="date-filter-field"
              @update:model-value="onDateFilterChange"
            ></v-text-field>
            <div class="quick-date-buttons">
              <v-btn
                size="x-small"
                variant="outlined"
                @click="setDateToday"
                :color="isDateToday ? 'primary' : 'default'"
              >
                Today
              </v-btn>
              <v-btn
                size="x-small"
                variant="outlined"
                @click="setDateTomorrow"
              >
                Tomorrow
              </v-btn>
            </div>
          </div>

          <!-- View Toggle (Admin Only) -->
          <v-btn-toggle
            v-if="isAdmin"
            v-model="viewMode"
            mandatory
            density="compact"
            class="mr-2"
          >
            <v-btn value="grid" size="small">
              <v-icon>mdi-view-grid</v-icon>
            </v-btn>
            <v-btn value="table" size="small">
              <v-icon>mdi-table</v-icon>
            </v-btn>
          </v-btn-toggle>

          <v-btn
            class="filter-btn"
            variant="outlined"
            size="small"
            prepend-icon="mdi-download"
          >
            Export Data
          </v-btn>
        </div>
      </div>
    </div>

    <!-- Grid View -->
    <div v-if="viewMode === 'grid'" class="courts-grid-container">
      <v-container fluid>
        <v-row>
          <v-col
            v-for="court in filteredCourts"
            :key="court.id"
            cols="12"
            sm="6"
            md="4"
            lg="3"
          >
            <v-card
              class="court-card"
              elevation="2"
              hover
              @click="navigateToCourtDetails(court.id)"
              style="cursor: pointer;"
            >
              <!-- Court Images -->
              <div class="court-images-wrapper">
                <v-carousel
                  v-if="court.images && court.images.length > 0"
                  height="200"
                  hide-delimiters
                  show-arrows="hover"
                  cycle
                  interval="3000"
                >
                  <v-carousel-item
                    v-for="(image, index) in court.images"
                    :key="index"
                    :src="image.image_url"
                    cover
                  ></v-carousel-item>
                </v-carousel>
                <div v-else class="court-no-image">
                  <v-icon size="64" color="grey-lighten-1">mdi-stadium</v-icon>
                </div>

                <!-- Sport Badges - Multiple Sports Support -->
                <div class="court-sport-badges">
                  <v-chip
                    v-for="sport in (court.sports && court.sports.length > 0 ? court.sports : [court.sport])"
                    :key="sport?.id"
                    class="court-sport-badge"
                    :color="sportService.getSportColor(sport?.name)"
                    size="small"
                    label
                  >
                    <v-icon start size="small">{{ sportService.getSportIcon(sport?.name, sport?.icon) }}</v-icon>
                    {{ sport?.name }}
                  </v-chip>
                </div>

                <!-- Status Badge -->
                <v-chip
                  class="court-status-badge"
                  :color="court.is_active ? 'success' : 'error'"
                  size="x-small"
                  label
                >
                  {{ court.is_active ? 'Active' : 'Inactive' }}
                </v-chip>
              </div>

              <!-- Court Info -->
              <v-card-title class="court-card-title">
                {{ court.name }}
              </v-card-title>

              <v-card-text class="court-card-content">
                <div class="court-info-row">
                  <v-icon size="small" color="success">mdi-cash</v-icon>
                  <span class="court-info-price">{{ getCourtPriceRange(court) }}</span>
                </div>

                <div class="court-info-row">
                  <v-icon size="small" color="info">mdi-clock-outline</v-icon>
                  <span class="court-info-time">{{ getCourtOperatingHours(court) }}</span>
                </div>

                <div v-if="court.surface_type" class="court-info-row">
                  <v-icon size="small" color="primary">mdi-texture-box</v-icon>
                  <span class="court-info-text">{{ court.surface_type }}</span>
                </div>

                <div v-if="court.amenities && typeof court.amenities === 'string'" class="court-amenities">
                  <v-chip
                    v-for="(amenity, index) in court.amenities.split(',').slice(0, 3)"
                    :key="index"
                    size="x-small"
                    variant="outlined"
                    class="mr-1 mb-1"
                  >
                    {{ amenity.trim() }}
                  </v-chip>
                  <v-chip
                    v-if="court.amenities.split(',').length > 3"
                    size="x-small"
                    variant="text"
                    class="mb-1"
                  >
                    +{{ court.amenities.split(',').length - 3 }} more
                  </v-chip>
                </div>

                <!-- Total Booked Hours Display -->
                <div class="total-booked-hours-section mt-3">
                  <div class="d-flex align-center justify-space-between mb-2">
                    <span class="text-caption font-weight-bold">
                      <v-icon size="small" color="primary" class="mr-1">mdi-clock-check</v-icon>
                      Total Booked Hours
                    </span>
                    <v-chip
                      v-if="!loadingTotalBookedHours[court.id]"
                      color="primary"
                      variant="tonal"
                      size="small"
                      class="font-weight-bold"
                    >
                      {{ courtTotalBookedHours[court.id] || 0 }} hrs
                    </v-chip>
                    <v-progress-circular
                      v-else
                      indeterminate
                      size="16"
                      width="2"
                      color="primary"
                    ></v-progress-circular>
                  </div>
                </div>

                <!-- Time Availability Display -->
                <div class="time-availability-section mt-3">
                  <div class="mb-2">
                    <span class="text-caption font-weight-bold">
                      {{ availabilityDate ? formatDateLabel(availabilityDate) : 'Today\'s' }} Availability
                    </span>
                  </div>

                  <div class="time-slots-preview">
                    <v-progress-circular
                      v-if="loadingTimeSlots[court.id]"
                      indeterminate
                      size="20"
                      width="2"
                      color="primary"
                      class="d-block mx-auto"
                    ></v-progress-circular>

                    <div v-else-if="courtTimeSlots[court.id] && courtTimeSlots[court.id].length > 0" class="time-slots-grid-booking-style">
                      <v-card
                        v-for="(slot, index) in courtTimeSlots[court.id]"
                        :key="index"
                        :class="['time-slot-card-booking', {
                          'unavailable': !slot.available
                        }]"
                        @click.stop="slot.available ? null : viewBookingDetails(slot, court)"
                      >
                        <v-card-text class="text-center pa-2">
                          <div class="time-text-small">{{ formatTimeSlot(slot.start) }}</div>
                          <div class="time-divider-small">to</div>
                          <div class="time-text-small">{{ formatTimeSlot(slot.end) }}</div>
                          <v-chip
                            :color="slot.available ? 'success' : 'error'"
                            size="x-small"
                            class="mt-1"
                            variant="flat"
                          >
                            {{ slot.available ? 'Available' : 'Booked' }}
                          </v-chip>
                          <!-- Show customer name when slot is booked -->
                          <div
                            v-if="!slot.available && slot.display_name"
                            class="customer-name-label-small mt-1"
                          >
                            <v-icon size="10" class="mr-1">mdi-account</v-icon>
                            <span class="text-caption">{{ slot.display_name }}</span>
                          </div>
                        </v-card-text>
                      </v-card>
                    </div>

                    <div v-else class="text-caption text-center text-grey py-2">
                      No slots available
                    </div>
                  </div>
                </div>
              </v-card-text>

              <!-- Actions -->
              <v-card-actions v-if="isAdmin" class="court-card-actions">
                <v-btn
                  size="small"
                  variant="text"
                  color="primary"
                  @click.stop="editCourt(court)"
                >
                  <v-icon start size="small">mdi-pencil</v-icon>
                  Edit
                </v-btn>
                <v-spacer></v-spacer>
                <v-btn
                  size="small"
                  variant="text"
                  :color="court.is_active ? 'error' : 'success'"
                  @click.stop="toggleCourtStatus(court)"
                >
                  <v-icon start size="small">
                    {{ court.is_active ? 'mdi-cancel' : 'mdi-check-circle' }}
                  </v-icon>
                  {{ court.is_active ? 'Deactivate' : 'Activate' }}
                </v-btn>
              </v-card-actions>
            </v-card>
          </v-col>
        </v-row>

        <!-- No Courts Message -->
        <v-row v-if="filteredCourts.length === 0 && !loading">
          <v-col cols="12" class="text-center py-12">
            <v-icon size="64" color="grey-lighten-1">mdi-stadium-variant</v-icon>
            <p class="text-h6 text-grey-darken-1 mt-4">No courts found</p>
            <p class="text-grey">Try adjusting your search criteria</p>
          </v-col>
        </v-row>
      </v-container>
    </div>

    <!-- Table View -->
    <div v-else class="excel-table-container">
      <v-data-table
        :headers="headers"
        :items="filteredCourts"
        :loading="loading"
        :items-per-page="15"
        class="excel-data-table"
        no-data-text="No courts found"
        loading-text="Loading courts..."
        :item-props="itemProps"
      >
        <!-- Court Name Column -->
        <template v-slot:[`item.name`]="{ item }">
          <div class="excel-cell-content">
            <div class="excel-cell-icon">🏟️</div>
            <div class="excel-cell-text">
              <div class="excel-cell-title">{{ item.name }}</div>
            </div>
          </div>
        </template>

        <!-- Sport Column - Multiple Sports Support -->
        <template v-slot:[`item.sport_name`]="{ item }">
          <div class="d-flex flex-wrap gap-1">
            <v-chip
              v-for="sport in (item.sports && item.sports.length > 0 ? item.sports : [item.sport])"
              :key="sport?.id"
              color="primary"
              variant="tonal"
              size="small"
              class="excel-chip"
            >
              {{ sport?.name }}
            </v-chip>
          </div>
        </template>

        <!-- Surface Type Column -->
        <template v-slot:[`item.surface_type`]="{ item }">
          <div class="excel-cell-text">
            <span v-if="item.surface_type" class="excel-cell-title">{{ item.surface_type }}</span>
            <span v-else class="excel-empty">-</span>
          </div>
        </template>

        <!-- Price Column -->
        <template v-slot:[`item.price_per_hour`]="{ item }">
          <div class="excel-price">
            <span class="excel-price-amount">{{ getCourtPriceRange(item) }}</span>
          </div>
        </template>


        <!-- Amenities Column -->
        <template v-slot:[`item.amenities`]="{ item }">
          <div v-if="item.amenities && item.amenities.length" class="excel-amenities">
            <v-chip
              v-for="(amenity, index) in item.amenities.slice(0, 2)"
              :key="index"
              size="x-small"
              color="grey"
              variant="outlined"
              class="excel-amenity-chip"
            >
              {{ amenity }}
            </v-chip>
            <v-chip
              v-if="item.amenities.length > 2"
              size="x-small"
              color="grey"
              variant="outlined"
              class="excel-amenity-chip"
            >
              +{{ item.amenities.length - 2 }}
            </v-chip>
          </div>
          <span v-else class="excel-empty">-</span>
        </template>

        <!-- Status Column -->
        <template v-slot:[`item.is_active`]="{ item }">
          <v-chip
            :color="item.is_active ? 'success' : 'error'"
            variant="tonal"
            size="small"
            class="excel-status-chip"
          >
            {{ item.is_active ? 'Active' : 'Inactive' }}
          </v-chip>
        </template>

        <!-- Actions Column -->
        <template v-slot:[`item.actions`]="{ item }">
          <div class="excel-actions">
            <v-btn
              icon="mdi-eye"
              size="small"
              variant="text"
              color="primary"
              :to="`/courts/${item.id}`"
              class="excel-action-btn"
            ></v-btn>
            <v-btn
              v-if="isAdmin"
              icon="mdi-pencil"
              size="small"
              variant="text"
              color="warning"
              @click="openEditDialog(item)"
              class="excel-action-btn"
            ></v-btn>
            <v-btn
              v-if="isAdmin"
              icon="mdi-delete"
              size="small"
              variant="text"
              color="error"
              @click="deleteCourt(item.id)"
              class="excel-action-btn"
            ></v-btn>
          </div>
        </template>
      </v-data-table>
    </div>

    <!-- Court Dialog -->
    <CourtDialog
      :is-open="dialogOpen"
      :court="selectedCourt"
      @close="closeDialog"
      @saved="handleCourtSaved"
    />

    <!-- Time Slot Details Dialog -->
    <TimeSlotDetailsDialog
      v-model:is-open="bookingDetailsDialog"
      :slot="selectedBookingSlot"
      :court="selectedCourtForBooking"
      :date="availabilityDate"
      :can-users-book="canUsersBook"
      @book-now="bookFromDialog"
    />
  </div>
</template>

<script>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { courtService } from '../services/courtService'
import { authService } from '../services/authService'
import { sportService } from '../services/sportService'
import { companySettingService } from '../services/companySettingService'
import CourtDialog from '../components/CourtDialog.vue'
import TimeSlotDetailsDialog from '../components/TimeSlotDetailsDialog.vue'

export default {
  name: 'Courts',
  components: {
    CourtDialog,
    TimeSlotDetailsDialog
  },
  setup() {
    const route = useRoute()
    const router = useRouter()
    const courts = ref([])
    const loading = ref(true)
    const error = ref(null)
    const dialogOpen = ref(false)
    const selectedCourt = ref(null)
    const isAdmin = ref(false)
    const viewMode = ref('grid') // Default to grid view

    // Company settings
    const companySettings = ref({})
    const canUsersBook = ref(true)

    // Time slots state
    const courtTimeSlots = ref({})
    const loadingTimeSlots = ref({})

    // Total booked hours state
    const courtTotalBookedHours = ref({})
    const loadingTotalBookedHours = ref({})

    // Date filter state
    const availabilityDate = ref('')
    const minDate = computed(() => {
      return new Date().toISOString().split('T')[0]
    })
    const isDateToday = computed(() => {
      const today = new Date().toISOString().split('T')[0]
      return availabilityDate.value === today
    })

    // Booking details dialog state
    const bookingDetailsDialog = ref(false)
    const selectedBookingSlot = ref(null)
    const selectedCourtForBooking = ref(null)

    const headers = [
      { title: 'Court Name', key: 'name', sortable: true, width: '20%' },
      { title: 'Type', key: 'sport_name', sortable: true, width: '12%' },
      { title: 'Surface', key: 'surface_type', sortable: true, width: '12%' },
      { title: 'Price/Hour', key: 'price_per_hour', sortable: true, width: '12%' },
      { title: 'Amenities', key: 'amenities', sortable: false, width: '20%' },
      { title: 'Status', key: 'is_active', sortable: true, width: '10%' },
      { title: 'Actions', key: 'actions', sortable: false, width: '14%' }
    ]

    const filteredCourts = computed(() => {
      return courts.value
    })

    const operatingHoursText = computed(() => {
      const opening = companySettings.value.operating_hours_opening || '07:00'
      const closing = companySettings.value.operating_hours_closing || '00:00'

      // Format times to 12-hour format
      const formatTime = (time) => {
        if (!time) return ''

        const [hours, minutes] = time.split(':')
        const hour = parseInt(hours)

        // Handle midnight (00:00) special case
        if (hour === 0 && minutes === '00') {
          return '12:00 MN' // Midnight
        }

        const ampm = hour >= 12 ? 'PM' : 'AM'
        const displayHour = hour % 12 || 12
        return `${displayHour}:${minutes} ${ampm}`
      }

      return `${formatTime(opening)} - ${formatTime(closing)}`
    })

    const itemProps = (item) => ({
      class: 'excel-table-row'
    })

    const fetchData = async () => {
      try {
        loading.value = true
        const courtsData = await courtService.getCourts()
        courts.value = courtsData
        // Load total booked hours and time slots for all courts after courts are fetched
        await loadAllCourtTotalBookedHours()
        await loadAllCourtTimeSlots()
      } catch (err) {
        error.value = err.message
      } finally {
        loading.value = false
      }
    }

    const openAddDialog = () => {
      selectedCourt.value = null
      dialogOpen.value = true
    }

    const openEditDialog = (court) => {
      selectedCourt.value = court
      dialogOpen.value = true
    }

    const closeDialog = () => {
      dialogOpen.value = false
      selectedCourt.value = null
    }

    const handleCourtSaved = () => {
      fetchData() // Refresh the courts list
    }

    const deleteCourt = async (courtId) => {
      if (!confirm('Are you sure you want to delete this court?')) return

      try {
        await courtService.deleteCourt(courtId)
        await fetchData() // Refresh the list
      } catch (err) {
        alert('Failed to delete court: ' + err.message)
      }
    }

    const checkAdminStatus = async () => {
      try {
        const user = await authService.getCurrentUser()
        // Allow both admin and staff to manage courts
        isAdmin.value = user && (user.role === 'admin' || user.role === 'staff')
      } catch (error) {
        isAdmin.value = false
      }
    }

    const getCourtOperatingHours = (court) => {
      return operatingHoursText.value
    }

    const fetchCompanySettings = async () => {
      try {
        const settings = await companySettingService.getSettings()
        // API already returns an object of key -> value
        companySettings.value = settings
        const user = await authService.getCurrentUser()
        canUsersBook.value = await companySettingService.canUserCreateBookings(user?.role || 'user')
      } catch (err) {
      }
    }

    const getCourtPriceRange = (court) => {
      if (!court || !court.sport) {
        return '₱0/hr'
      }

      const sport = court.sport
      const timeBasedPricing = sport.time_based_pricing || []

      // Get all active time-based pricing rules
      const activePrices = timeBasedPricing
        .filter(rule => rule.is_active)
        .map(rule => parseFloat(rule.price_per_hour))

      // If no time-based pricing, return the base price
      if (activePrices.length === 0) {
        return `₱${parseFloat(sport.price_per_hour || 0).toFixed(0)}/hr`
      }

      // Include base price in the range calculation
      const allPrices = [...activePrices, parseFloat(sport.price_per_hour || 0)]
      const minPrice = Math.min(...allPrices)
      const maxPrice = Math.max(...allPrices)

      // If min and max are the same, show single price
      if (minPrice === maxPrice) {
        return `₱${minPrice.toFixed(0)}/hr`
      }

      // Show price range
      return `₱${minPrice.toFixed(0)} - ₱${maxPrice.toFixed(0)}/hr`
    }

    const editCourt = (court) => {
      openEditDialog(court)
    }

    const toggleCourtStatus = async (court) => {
      try {
        const newStatus = !court.is_active
        await courtService.updateCourt(court.id, { is_active: newStatus })
        court.is_active = newStatus
      } catch (err) {
        alert('Failed to update court status: ' + err.message)
      }
    }

    const navigateToCourtDetails = (courtId) => {
      router.push(`/courts/${courtId}`)
    }

    const formatTimeSlot = (time) => {
      if (!time) return ''
      const [hours, minutes] = time.split(':')
      const hour = parseInt(hours)
      const ampm = hour >= 12 ? 'PM' : 'AM'
      const displayHour = hour % 12 || 12
      return `${displayHour}:${minutes} ${ampm}`
    }

    const loadCourtTimeSlots = async (courtId) => {
      try {
        loadingTimeSlots.value[courtId] = true
        const dateToUse = availabilityDate.value || new Date().toISOString().split('T')[0]
        const slots = await courtService.getAvailableSlots(courtId, dateToUse)
        courtTimeSlots.value[courtId] = slots
      } catch (err) {
        courtTimeSlots.value[courtId] = []
      } finally {
        loadingTimeSlots.value[courtId] = false
      }
    }

    const loadCourtTotalBookedHours = async (courtId) => {
      try {
        loadingTotalBookedHours.value[courtId] = true
        const data = await courtService.getTotalBookedHours(courtId)
        courtTotalBookedHours.value[courtId] = data.total_booked_hours || 0
      } catch (err) {
        courtTotalBookedHours.value[courtId] = 0
      } finally {
        loadingTotalBookedHours.value[courtId] = false
      }
    }

    const loadAllCourtTimeSlots = async () => {
      // Load time slots for all courts
      if (courts.value && courts.value.length > 0) {
        for (const court of courts.value) {
          await loadCourtTimeSlots(court.id)
        }
      }
    }

    const loadAllCourtTotalBookedHours = async () => {
      // Load total booked hours for all courts
      if (courts.value && courts.value.length > 0) {
        for (const court of courts.value) {
          await loadCourtTotalBookedHours(court.id)
        }
      }
    }

    const setDateToday = () => {
      availabilityDate.value = new Date().toISOString().split('T')[0]
    }

    const setDateTomorrow = () => {
      const tomorrow = new Date()
      tomorrow.setDate(tomorrow.getDate() + 1)
      availabilityDate.value = tomorrow.toISOString().split('T')[0]
    }

    const onDateFilterChange = async () => {
      // Clear all loaded time slots when date changes
      courtTimeSlots.value = {}
      // Reload time slots for all courts
      await loadAllCourtTimeSlots()
    }

    const formatDateLabel = (date) => {
      if (!date) return 'Today\'s'
      const d = new Date(date)
      const today = new Date()
      const tomorrow = new Date()
      tomorrow.setDate(tomorrow.getDate() + 1)

      const dateStr = date
      const todayStr = today.toISOString().split('T')[0]
      const tomorrowStr = tomorrow.toISOString().split('T')[0]

      if (dateStr === todayStr) return 'Today\'s'
      if (dateStr === tomorrowStr) return 'Tomorrow\'s'

      return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) + '\'s'
    }

    const viewBookingDetails = (slot, court) => {
      selectedBookingSlot.value = slot
      selectedCourtForBooking.value = court
      bookingDetailsDialog.value = true
    }

    const bookFromDialog = () => {
      bookingDetailsDialog.value = false
      router.push('/bookings')
    }

    onMounted(async () => {
      await checkAdminStatus()
      await fetchCompanySettings()
      fetchData()
      // Initialize date filter to today
      setDateToday()
    })

    // Watch for route changes to refresh data when navigating to this page
    watch(() => route.path, (newPath) => {
      if (newPath === '/courts') {
        fetchData()
      }
    })

    return {
      courts,
      filteredCourts,
      loading,
      error,
      dialogOpen,
      selectedCourt,
      isAdmin,
      viewMode,
      headers,
      itemProps,
      openAddDialog,
      openEditDialog,
      closeDialog,
      handleCourtSaved,
      deleteCourt,
      getCourtOperatingHours,
      getCourtPriceRange,
      editCourt,
      toggleCourtStatus,
      navigateToCourtDetails,
      // Time slots
      courtTimeSlots,
      loadingTimeSlots,
      formatTimeSlot,
      // Total booked hours
      courtTotalBookedHours,
      loadingTotalBookedHours,
      // Date filter
      availabilityDate,
      minDate,
      isDateToday,
      setDateToday,
      setDateTomorrow,
      onDateFilterChange,
      formatDateLabel,
      // Booking details dialog
      bookingDetailsDialog,
      selectedBookingSlot,
      selectedCourtForBooking,
      viewBookingDetails,
      bookFromDialog,
      canUsersBook,
      // Services
      sportService
    }
  }
}
</script>

<style scoped>
/* Modern Sports Courts Theme */
.courts-container {
  min-height: 100vh;
  padding: 32px;
  position: relative;
  z-index: 1;
}

/* Background is now handled globally by App.vue */

/* Courts Header */
.courts-header {
  text-align: center;
  margin-bottom: 48px;
  padding: 48px 0;
  position: relative;
}

.header-content {
  position: relative;
  z-index: 2;
}

.header-badge {
  display: inline-flex;
  align-items: center;
  background: rgba(183, 28, 28, 0.1);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(183, 28, 28, 0.2);
  border-radius: 50px;
  padding: 8px 20px;
  margin-bottom: 24px;
  color: #B71C1C;
  font-weight: 600;
  font-size: 14px;
  letter-spacing: 0.5px;
}

.header-title {
  font-size: clamp(2.5rem, 5vw, 4rem);
  font-weight: 800;
  line-height: 1.1;
  margin-bottom: 24px;
  color: #1e293b;
}

.title-gradient {
  background: linear-gradient(135deg, #B71C1C 0%, #D32F2F 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.header-subtitle {
  font-size: clamp(1.1rem, 2vw, 1.3rem);
  color: #64748b;
  max-width: 600px;
  margin: 0 auto 32px;
  line-height: 1.6;
}

.header-actions {
  display: flex;
  justify-content: center;
  gap: 16px;
}

.header-btn-primary {
  background: linear-gradient(135deg, #B71C1C 0%, #D32F2F 100%) !important;
  color: white !important;
  border-radius: 12px !important;
  font-weight: 700 !important;
  text-transform: none !important;
  padding: 16px 32px !important;
  box-shadow: 0 8px 25px rgba(183, 28, 28, 0.4) !important;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
}

.header-btn-primary:hover {
  transform: translateY(-4px) !important;
  box-shadow: 0 12px 35px rgba(183, 28, 28, 0.6) !important;
}

/* Toolbar Section */
.courts-toolbar {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-radius: 16px;
  padding: 24px;
  margin-bottom: 24px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.toolbar-section {
  display: flex;
  gap: 16px;
  align-items: center;
  flex-wrap: wrap;
}

.filters-section {
  display: flex;
  gap: 12px;
  align-items: center;
  flex-wrap: wrap;
  width: 100%;
}

.filter-btn {
  border-radius: 8px !important;
  font-weight: 600 !important;
  text-transform: none !important;
}

/* Date Filter Section */
.date-filter-section {
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-width: 200px;
}

.date-filter-field {
  border-radius: 8px !important;
}

.quick-date-buttons {
  display: flex;
  gap: 6px;
  justify-content: flex-start;
}

.quick-date-buttons .v-btn {
  font-size: 11px;
  text-transform: none;
}

.excel-header {
  background: white;
  border: 1px solid #d1d5db;
  border-radius: 8px 8px 0 0;
  padding: 20px 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.excel-title-section {
  flex: 1;
}

.excel-title {
  font-size: 24px;
  font-weight: 700;
  color: #1f2937;
  margin: 0 0 4px 0;
}

.excel-subtitle {
  font-size: 14px;
  color: #6b7280;
  margin: 0;
}

.excel-actions {
  display: flex;
  gap: 12px;
}

.excel-add-btn {
  background: #3b82f6 !important;
  color: white !important;
  font-weight: 600;
  text-transform: none;
  border-radius: 6px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.excel-toolbar {
  background: white;
  border-left: 1px solid #d1d5db;
  border-right: 1px solid #d1d5db;
  padding: 16px 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
}

.excel-search {
  flex: 1;
  max-width: 300px;
}

.excel-search-field {
  font-size: 14px;
}

.excel-filters {
  display: flex;
  gap: 12px;
  align-items: center;
}

.excel-filter-select {
  min-width: 150px;
  font-size: 14px;
}

.excel-filter-btn,
.excel-export-btn {
  font-size: 14px;
  text-transform: none;
  border-radius: 6px;
}

.excel-table-container {
  background: white;
  border: 1px solid #d1d5db;
  border-top: none;
  border-radius: 0 0 8px 8px;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.excel-data-table {
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

.excel-data-table :deep(.v-data-table__wrapper) {
  border: none;
}

.excel-data-table :deep(.v-data-table-header) {
  background: #f8fafc;
  border-bottom: 2px solid #e2e8f0;
}

.excel-data-table :deep(.v-data-table-header th) {
  background: #f8fafc !important;
  color: #374151 !important;
  font-weight: 600 !important;
  font-size: 14px !important;
  padding: 12px 16px !important;
  border-right: 1px solid #e2e8f0 !important;
  text-transform: none !important;
}

.excel-data-table :deep(.v-data-table-header th:last-child) {
  border-right: none !important;
}

.excel-data-table :deep(.v-data-table__td) {
  padding: 12px 16px !important;
  border-right: 1px solid #f1f5f9 !important;
  font-size: 14px !important;
  vertical-align: middle !important;
}

.excel-data-table :deep(.v-data-table__td:last-child) {
  border-right: none !important;
}

.excel-data-table :deep(.v-data-table__tr:hover) {
  background: #f8fafc !important;
}

.excel-table-row {
  border-bottom: 1px solid #f1f5f9;
}

.excel-cell-content {
  display: flex;
  align-items: center;
  gap: 12px;
}

.excel-cell-icon {
  font-size: 20px;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #eff6ff;
  border-radius: 6px;
}

.excel-cell-text {
  flex: 1;
  min-width: 0;
}

.excel-cell-title {
  font-weight: 600;
  color: #1f2937;
  font-size: 14px;
  margin-bottom: 2px;
}

.excel-cell-subtitle {
  color: #6b7280;
  font-size: 12px;
}

.excel-chip {
  font-weight: 500;
  font-size: 12px;
}

.excel-price {
  display: flex;
  align-items: center;
  gap: 4px;
}

.excel-price-amount {
  color: #059669;
  font-size: 14px;
  font-weight: 600;
}

.excel-currency {
  color: #6b7280;
  font-size: 12px;
  font-weight: 500;
}

.excel-amount {
  color: #1f2937;
  font-weight: 600;
  font-size: 16px;
}

.excel-amenities {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.excel-amenity-chip {
  font-size: 11px;
  height: 20px;
}

.excel-empty {
  color: #9ca3af;
  font-style: italic;
}

.excel-status-chip {
  font-weight: 500;
  font-size: 12px;
}

/* Grid View Styles */
.courts-grid-container {
  background: transparent;
  padding: 24px;
}

.court-card {
  height: 100%;
  display: flex;
  flex-direction: column;
  border-radius: 12px !important;
  overflow: hidden;
  transition: all 0.3s ease;
  border: 1px solid #e2e8f0;
}

.court-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.15) !important;
}

.court-images-wrapper {
  position: relative;
  background: #f1f5f9;
}

.court-no-image {
  height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%);
}

.court-sport-badges {
  position: absolute;
  top: 12px;
  left: 12px;
  z-index: 2;
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  max-width: calc(100% - 80px); /* Leave space for status badge */
}

.court-sport-badge {
  font-weight: 600;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
}

.court-status-badge {
  position: absolute;
  top: 12px;
  right: 12px;
  z-index: 2;
  font-weight: 600;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
}

.court-card-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: #B71C1C;
  padding: 16px 16px 8px 16px;
}

.court-card-content {
  flex-grow: 1;
  padding: 0 16px 16px 16px;
}

.court-info-row {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.court-info-text {
  font-size: 0.875rem;
  color: #64748b;
}

.court-info-price {
  font-size: 1rem;
  font-weight: 600;
  color: #059669;
}

.court-info-time {
  font-size: 0.875rem;
  font-weight: 500;
  color: #3b82f6;
}

.court-amenities {
  margin-top: 12px;
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.court-card-actions {
  border-top: 1px solid #e2e8f0;
  padding: 12px;
  background: #f8fafc;
}

/* Total Booked Hours Styles */
.total-booked-hours-section {
  border-top: 1px solid #e2e8f0;
  padding-top: 12px;
  margin-top: 12px;
  background: linear-gradient(135deg, rgba(33, 150, 243, 0.05) 0%, rgba(21, 101, 192, 0.05) 100%);
  padding: 12px;
  border-radius: 8px;
  border: 1px solid rgba(33, 150, 243, 0.1);
}

/* Time Availability Styles - Booking Dialog Pattern */
.time-availability-section {
  border-top: 1px solid #e2e8f0;
  padding-top: 12px;
  margin-top: 12px;
}

.time-slots-preview {
  margin-top: 8px;
}

.time-slots-grid-booking-style {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(90px, 1fr));
  gap: 8px;
  margin-top: 8px;
}

.time-slot-card-booking {
  cursor: pointer;
  transition: all 0.3s ease;
  border: 2px solid transparent;
  background: #ffffff !important;
  position: relative;
  overflow: hidden;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.time-slot-card-booking:hover:not(.unavailable) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  border-color: #90caf9;
  background: #f8fafc !important;
}

.time-slot-card-booking.unavailable {
  opacity: 0.8;
  cursor: pointer;
  background: #fff3f3 !important;
  border-color: #ffcdd2;
}

.time-slot-card-booking.unavailable:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(244, 67, 54, 0.2);
  border-color: #ef5350;
}

.time-text-small {
  font-size: 11px;
  font-weight: 700;
  color: #1f2937;
  line-height: 1.2;
}

.time-divider-small {
  font-size: 9px;
  color: #9ca3af;
  font-weight: 500;
  margin: 1px 0;
}

.time-slot-card-booking.unavailable .time-text-small {
  color: #c62828;
}

.time-slot-card-booking.unavailable .time-divider-small {
  color: #e57373;
}

.customer-name-label-small {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2px 4px;
  background: rgba(0, 0, 0, 0.05);
  border-radius: 3px;
  color: #1f2937 !important;
  font-weight: 500;
  max-width: 100%;
  overflow: hidden;
  font-size: 9px;
}

.customer-name-label-small span {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  font-size: 9px;
}

.time-slot-card-booking.unavailable .customer-name-label-small {
  background: rgba(198, 40, 40, 0.1);
  color: #c62828 !important;
}

/* Details Dialog Styles */
.details-no-image {
  height: 400px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%);
  border-radius: 8px;
}

.details-section {
  padding: 16px 0;
}

.detail-item {
  display: flex;
  flex-direction: column;
}

.detail-label {
  font-size: 0.875rem;
  font-weight: 600;
  color: #64748b;
  margin-bottom: 8px;
  display: flex;
  align-items: center;
}

.detail-value {
  font-size: 1rem;
  color: #B71C1C;
  font-weight: 500;
}

.excel-actions {
  display: flex;
  gap: 4px;
}

.excel-action-btn {
  width: 28px !important;
  height: 28px !important;
  min-width: 28px !important;
}

/* Responsive Design */
@media (max-width: 768px) {
  .excel-container {
    padding: 12px;
  }

  .excel-header {
    flex-direction: column;
    gap: 16px;
    align-items: stretch;
  }

  .excel-toolbar {
    flex-direction: column;
    gap: 12px;
    align-items: stretch;
  }

  .excel-search {
    max-width: none;
  }

  .excel-filters {
    justify-content: space-between;
  }

  .toolbar-section {
    flex-direction: column;
    align-items: stretch;
  }

  .filters-section {
    flex-direction: column;
    align-items: stretch;
    width: 100%;
  }

  .date-filter-section {
    width: 100%;
  }

  .quick-date-buttons {
    justify-content: space-between;
  }

  .quick-date-buttons .v-btn {
    flex: 1;
  }
}
</style>
<template>
  <div class="sports-home">
    <!-- Dashboard Announcement Banner -->
    <v-alert
      v-if="dashboardSettings.announcement && dashboardSettings.announcement.trim()"
      type="info"
      variant="tonal"
      closable
      class="announcement-banner"
      border="start"
      border-color="primary"
    >
      <div class="d-flex align-center">
        <v-icon class="mr-3" size="32" color="primary">mdi-bullhorn</v-icon>
        <div>
          <div class="text-h6 font-weight-bold mb-1">Announcement</div>
          <div class="text-body-1">{{ dashboardSettings.announcement }}</div>
        </div>
      </div>
    </v-alert>

    <!-- Hero Section with Enhanced Sports Design -->
    <div class="hero-section">
      <div class="hero-background">
        <div class="hero-overlay"></div>
        <div class="hero-pattern"></div>
      </div>
      <v-container class="hero-container">
        <v-row align="center" justify="center" class="min-height-screen">
          <v-col cols="12" md="10" class="text-center">
            <div class="hero-content">
              <!-- Company Logo -->
              <div v-if="companyLogoUrl" class="hero-logo-wrapper">
                <v-img
                  :src="companyLogoUrl"
                  :alt="companyName + ' Logo'"
                  max-height="250"
                  max-width="250"
                  contain
                  class="hero-company-logo"
                ></v-img>
              </div>

              <!-- Welcome Message -->
              <div v-if="dashboardSettings.welcomeMessage && dashboardSettings.welcomeMessage.trim()" class="welcome-message">
                <v-icon color="white" size="32" class="mr-2">mdi-hand-wave</v-icon>
                {{ dashboardSettings.welcomeMessage }}
              </div>

              <div class="hero-badge">
                <v-icon color="white" size="24" class="mr-2">mdi-badminton</v-icon>
                Badminton & Pickleball Courts
              </div>
              <h1 class="hero-title">
                <span class="title-gradient">Perfect</span> Smash
                <br>
                <span class="title-accent">Book & Play</span> Today
            </h1>
              <p class="hero-subtitle">
                Experience premium badminton and pickleball facilities with championship-grade courts.
                From casual games to competitive training, achieve your perfect smash!
              </p>
              <!-- Stats - Show only if enabled -->
              <div v-if="dashboardSettings.showStats" class="hero-stats">
                <div class="stat-item">
                  <div class="stat-number">Premium</div>
                  <div class="stat-label">Facilities</div>
                </div>
                <div class="stat-item">
                  <div class="stat-number">Instant</div>
                  <div class="stat-label">Booking</div>
                </div>
              </div>

              <!-- Operating Hours Card -->
              <div v-if="operatingHoursEnabled && operatingHours" class="operating-hours-card-hero">
                <div class="operating-hours-header">
                  <v-icon size="40" color="white" class="mr-3">mdi-clock-outline</v-icon>
                  <div>
                    <h3 class="operating-hours-title">Operating Hours</h3>
                    <p class="operating-hours-subtitle">We're here to serve you</p>
                  </div>
                </div>
                <v-divider class="my-4" color="white" opacity="0.3"></v-divider>
                <div class="operating-hours-content">
                  <!-- Show only general schedule if all days match -->
                  <div v-if="allDaysMatchGeneral" class="general-hours-only">
                    <div class="hours-label">
                      <v-icon color="white" class="mr-2">mdi-calendar-range</v-icon>
                      <span>{{ hasClosedDays ? 'Open Days' : 'Every Day' }}</span>
                    </div>
                    <div class="hours-time">
                      {{ formatTime(operatingHours.opening) }} - {{ formatTime(operatingHours.closing) }}
                    </div>
                    <!-- Show closed days if any -->
                    <div v-if="hasClosedDays" class="closed-days-info">
                      <v-icon size="18" color="#ffcdd2" class="mr-1">mdi-information-outline</v-icon>
                      <span>Closed on: {{ closedDaysList }}</span>
                    </div>
                  </div>

                  <!-- Show detailed schedule if days differ -->
                  <div v-else>
                    <div class="general-hours mb-4">
                      <div class="hours-label">
                        <v-icon color="white" class="mr-2">mdi-calendar-range</v-icon>
                        <span>General Schedule</span>
                      </div>
                      <div class="hours-time">
                        {{ formatTime(operatingHours.opening) }} - {{ formatTime(operatingHours.closing) }}
                      </div>
                    </div>
                    <div class="day-hours-grid">
                      <div
                        v-for="day in displayDays"
                        :key="day.value"
                        class="day-hours-item"
                        :class="{ 'day-closed': !operatingHours[day.value].operational }"
                      >
                        <div class="day-label">
                          <v-icon size="18" color="white" class="mr-1">{{ day.icon }}</v-icon>
                          {{ day.label }}
                        </div>
                        <div class="day-time">
                          <span v-if="operatingHours[day.value].operational">
                            {{ formatTime(operatingHours[day.value].open) }} - {{ formatTime(operatingHours[day.value].close) }}
                          </span>
                          <span v-else class="closed-badge">
                            <v-icon size="16" color="white" class="mr-1">mdi-close-circle</v-icon>
                            CLOSED
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div class="hero-actions">
                <v-btn
                    size="x-large"
                    class="hero-btn-primary"
                  @click="openBookingDialog"
                  prepend-icon="mdi-calendar-plus"
                    elevation="8"
                >
                    Book Your Court Now
                </v-btn>
              </div>
            </div>
          </v-col>
        </v-row>
      </v-container>
    </div>

    <!-- Available Sports Section -->
    <section class="sports-available-section">
      <div class="sports-background">
        <div class="sports-pattern"></div>
      </div>
      <v-container class="py-16">
        <v-row>
          <v-col cols="12" class="text-center mb-12">
            <div class="section-badge-light">
              <v-icon color="white" size="20" class="mr-2">mdi-trophy</v-icon>
              Our Sports
            </div>
            <h2 class="section-title-light">
              <span class="title-gradient-light">Available</span> Sports
            </h2>
            <p class="section-subtitle-light">
              Choose from our premium sports facilities designed for excellence
            </p>
          </v-col>
        </v-row>

        <v-row v-if="loading">
          <v-col cols="12" class="text-center">
            <v-progress-circular indeterminate color="white" size="64"></v-progress-circular>
          </v-col>
        </v-row>

        <v-row v-else-if="sports.length > 0" class="justify-center">
          <v-col
            v-for="(sport, index) in sports"
            :key="sport.id"
            cols="12"
            md="6"
            lg="5"
          >
            <div class="sport-card" :style="{ animationDelay: `${index * 0.2}s` }">
              <div class="sport-card-content">
                <div class="sport-icon-section">
                  <div class="sport-icon-wrapper" :style="!sport.image ? { background: `linear-gradient(135deg, ${getSportGradientColor(sport.name)})` } : {}">
                    <!-- Show uploaded image if available -->
                    <v-img
                      v-if="sport.image"
                      :src="getImageUrl(sport.image)"
                      :alt="sport.name"
                      max-height="80"
                      max-width="80"
                      contain
                      class="sport-logo-image"
                    ></v-img>
                    <!-- Show icon if no image is available -->
                    <v-icon v-else size="80" color="white">
                      {{ sportService.getSportIcon(sport.name, sport.icon) }}
                    </v-icon>
                  </div>
                  <h3 class="sport-name">{{ sport.name }}</h3>
                  <p class="sport-description" v-if="sport.description">
                    {{ sport.description }}
                  </p>
                  <p class="sport-description" v-else>
                    Professional {{ sport.name.toLowerCase() }} facility with championship-grade equipment
                  </p>
                </div>
                <div class="sport-details">
                  <div class="sport-price-section">
                    <div class="sport-price-display">
                      <span class="sport-price-label">Price per Hour</span>
                      <span class="sport-price-amount">Starts at {{ formatPriceTemplate(sport.lowest_price_per_hour) }}</span>
                    </div>
                    <v-chip
                      :color="sport.is_active ? 'success' : 'error'"
                      variant="flat"
                      size="small"
                      class="mt-2"
                    >
                      <v-icon size="16" class="mr-1">
                        {{ sport.is_active ? 'mdi-check-circle' : 'mdi-close-circle' }}
                      </v-icon>
                      {{ sport.is_active ? 'Available' : 'Unavailable' }}
                    </v-chip>
                  </div>
                </div>
              </div>
            </div>
          </v-col>
        </v-row>

        <v-row v-else>
          <v-col cols="12" class="text-center">
            <v-alert type="info" variant="tonal" color="white">
              No sports available at the moment.
            </v-alert>
          </v-col>
        </v-row>

        <!-- Pricing Disclaimer Note -->
        <v-row v-if="sports.length > 0" class="mt-4">
          <v-col cols="12" class="text-center">
            <PriceDisclaimerNote theme="dark" />
          </v-col>
        </v-row>
      </v-container>
    </section>

    <!-- Features Section with Modern Sports Design -->
    <section class="features-section">
      <v-container class="py-16">
      <v-row>
          <v-col cols="12" class="text-center mb-12">
            <div class="section-badge">
              <v-icon color="primary" size="20" class="mr-2">mdi-star</v-icon>
              Why Choose {{ companyName }}
            </div>
            <h2 class="section-title">
              <span class="title-gradient">Perfect</span> Features
            </h2>
            <p class="section-subtitle">
              Experience the ultimate badminton and pickleball court booking system
            </p>
        </v-col>
      </v-row>

      <v-row>
          <v-col cols="12" md="4" v-for="(feature, index) in features" :key="index">
            <div class="feature-card" :class="`feature-card-${index + 1}`">
              <div class="feature-icon">
                <v-icon :color="feature.color" size="48">{{ feature.icon }}</v-icon>
              </div>
              <div class="feature-content">
                <h3 class="feature-title">{{ feature.title }}</h3>
                <p class="feature-description">{{ feature.description }}</p>
                <div class="feature-highlight">{{ feature.highlight }}</div>
              </div>
              <div class="feature-glow"></div>
            </div>
        </v-col>
      </v-row>
    </v-container>
    </section>

    <!-- Court Preview Section with Enhanced Design -->
    <section class="court-section">
      <div class="court-background">
        <div class="court-pattern"></div>
      </div>
      <v-container class="py-16">
      <v-row>
          <v-col cols="12" class="text-center mb-12">
            <div class="section-badge">
              <v-icon color="success" size="20" class="mr-2">mdi-stadium</v-icon>
              Our Facility
            </div>
            <h2 class="section-title">
              <span class="title-gradient">Premium</span> Courts
            </h2>
            <p class="section-subtitle">
              Championship-grade badminton and pickleball facilities designed for every player
            </p>
        </v-col>
      </v-row>

      <v-row v-if="loading">
        <v-col cols="12" class="text-center">
          <v-progress-circular indeterminate color="primary" size="64"></v-progress-circular>
          <p class="mt-4 text-h6">Loading court information...</p>
        </v-col>
      </v-row>

      <v-row v-else-if="error">
        <v-col cols="12" class="text-center">
          <v-alert type="error" variant="tonal">
            {{ error }}
          </v-alert>
        </v-col>
      </v-row>

      <v-row v-else>
          <v-col cols="12" md="10" offset-md="1">
            <div class="court-card">
              <div class="court-card-content">
              <v-row align="center">
                  <v-col cols="12" md="5" class="text-center">
                    <div class="court-icon-section">
                      <div class="court-icon-wrapper">
                        <v-icon size="100" color="white">mdi-badminton</v-icon>
                        </div>
                      <h3 class="court-name">{{ companyName }} Court</h3>
                      <p class="court-description">
                        Championship-grade facility for badminton and pickleball with premium flooring and professional equipment
                      </p>
                        </div>
                      </v-col>
                  <v-col cols="12" md="7">
                    <div class="court-features">
                      <h4 class="features-title">Premium Features</h4>
                      <div class="features-grid">
                        <div class="feature-item" v-for="(feature, index) in courtFeatures" :key="index">
                          <div class="feature-icon">
                            <v-icon :color="feature.color" size="24">{{ feature.icon }}</v-icon>
                          </div>
                          <div class="feature-text">
                            <div class="feature-name">{{ feature.name }}</div>
                            <div class="feature-desc">{{ feature.description }}</div>
                          </div>
                        </div>
                        </div>
                      <div class="pricing-section">
                        <div class="price-display">
                          <span class="price-label">Starting from</span>
                          <span class="price-amount">{{ formatPriceTemplate(getSportPrice()) }}</span>
                          <span class="price-unit">/hour</span>
                        </div>
                      <v-btn
                          class="book-now-btn"
                          size="x-large"
                          @click="handleBookNowClick"
                        prepend-icon="mdi-calendar-plus"
                          elevation="8"
                      >
                          Book Your Session
                      </v-btn>
                      <div class="mt-3">
                        <PriceDisclaimerNote theme="light" />
                      </div>
                    </div>
                  </div>
                </v-col>
              </v-row>
              </div>
              <div class="court-card-glow"></div>
            </div>
        </v-col>
        </v-row>
      </v-container>
    </section>
  </div>
</template>

<script>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { courtService } from '../services/courtService'
import { companySettingService } from '../services/companySettingService'
import { sportService } from '../services/sportService'
import { formatPrice } from '../utils/formatters'
import PriceDisclaimerNote from '../components/PriceDisclaimerNote.vue'

export default {
  name: 'Home',
  components: {
    PriceDisclaimerNote
  },
  setup() {
    const router = useRouter()
    const sports = ref([])
    const courts = ref([])
    const loading = ref(true)
    const error = ref(null)
    const companyName = ref('Perfect Smash')
    const companyLogoUrl = ref(null)

    // Dashboard settings
    const dashboardSettings = ref({
      welcomeMessage: '',
      announcement: '',
      showStats: true,
      showRecentBookings: true
    })

    // Operating hours
    const operatingHoursEnabled = ref(false)
    const operatingHours = ref(null)

    const displayDays = [
      { value: 'monday', label: 'Monday', icon: 'mdi-numeric-1-circle' },
      { value: 'tuesday', label: 'Tuesday', icon: 'mdi-numeric-2-circle' },
      { value: 'wednesday', label: 'Wednesday', icon: 'mdi-numeric-3-circle' },
      { value: 'thursday', label: 'Thursday', icon: 'mdi-numeric-4-circle' },
      { value: 'friday', label: 'Friday', icon: 'mdi-numeric-5-circle' },
      { value: 'saturday', label: 'Saturday', icon: 'mdi-numeric-6-circle' },
      { value: 'sunday', label: 'Sunday', icon: 'mdi-numeric-7-circle' }
    ]

    // Features data for the features section
    const features = ref([
      {
        icon: 'mdi-badminton',
        title: 'Premium Courts',
        description: 'Championship-grade badminton and pickleball courts with professional flooring and premium equipment',
        highlight: 'Tournament Ready',
        color: 'primary'
      },
      {
        icon: 'mdi-clock-fast',
        title: 'Instant Booking',
        description: 'Book your court in seconds with our lightning-fast booking system and real-time availability',
        highlight: 'Quick Response',
        color: 'success'
      },
      {
        icon: 'mdi-currency-php',
        title: 'Fair Pricing',
        description: 'Competitive rates with transparent pricing. No hidden fees, just pure value for your game',
        highlight: 'Best Rates',
        color: 'warning'
      }
    ])

    // Court features data
    const courtFeatures = ref([
      {
        icon: 'mdi-air-conditioner',
        name: 'Climate Control',
        description: 'Perfect temperature and humidity',
        color: 'primary'
      },
      {
        icon: 'mdi-lightbulb',
        name: 'Professional Lighting',
        description: 'Championship-grade illumination',
        color: 'warning'
      },
      {
        icon: 'mdi-car',
        name: 'Free Parking',
        description: 'Convenient parking spaces',
        color: 'success'
      },
    ])

    const fetchSports = async () => {
      try {
        loading.value = true
        sports.value = await courtService.getSports()
      } catch (err) {
        error.value = err.message
      } finally {
        loading.value = false
      }
    }

    const fetchCourts = async () => {
      try {
        courts.value = await courtService.getCourts()
      } catch (err) {
        console.error('Failed to fetch courts:', err)
      }
    }

    const getSportPrice = () => {
      if (sports.value.length > 0) {
        // Get the lowest price from all sports using their lowest_price_per_hour
        const prices = sports.value
          .filter(sport => sport.lowest_price_per_hour != null)
          .map(sport => sport.lowest_price_per_hour)

        if (prices.length > 0) {
          return Math.min(...prices)
        }
      }
      return 25 // fallback to default price
    }

    // Wrapper function for template use
    const formatPriceTemplate = (price) => {
      return formatPrice(price)
    }

    // Format time (HH:MM to readable format)
    const formatTime = (time) => {
      if (!time) return ''
      const [hours, minutes] = time.split(':')
      const hour = parseInt(hours)
      const ampm = hour >= 12 ? 'PM' : 'AM'
      const displayHour = hour % 12 || 12
      return `${displayHour}:${minutes} ${ampm}`
    }

    // Computed property to check if all operational days have the same hours as general schedule
    const allDaysMatchGeneral = computed(() => {
      if (!operatingHours.value) return false

      const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
      return days.every(day => {
        // If day is closed, it doesn't affect matching (we'll show closed days separately)
        if (!operatingHours.value[day].operational) return true

        // Check if operational day matches general schedule
        return operatingHours.value[day].open === operatingHours.value.opening &&
               operatingHours.value[day].close === operatingHours.value.closing
      })
    })

    // Computed property to check if there are any closed days
    const hasClosedDays = computed(() => {
      if (!operatingHours.value) return false

      const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
      return days.some(day => !operatingHours.value[day].operational)
    })

    // Computed property to get list of closed days
    const closedDaysList = computed(() => {
      if (!operatingHours.value) return ''

      const closedDays = displayDays
        .filter(day => !operatingHours.value[day.value].operational)
        .map(day => day.label)

      if (closedDays.length === 0) return ''
      if (closedDays.length === 1) return closedDays[0]
      if (closedDays.length === 2) return closedDays.join(' & ')

      // For 3 or more days, use comma separation with "and" for the last one
      const lastDay = closedDays.pop()
      return `${closedDays.join(', ')} & ${lastDay}`
    })

    // Get full image URL for sport logo
    const getImageUrl = (imagePath) => {
      if (!imagePath) return ''
      // If it's already a full URL, return as is
      if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
        return imagePath
      }
      // Otherwise, prepend the API URL
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000'
      return `${apiUrl}${imagePath.startsWith('/') ? '' : '/'}${imagePath}`
    }

    // Get gradient color based on sport
    const getSportGradientColor = (sportName) => {
      const color = sportService.getSportColor(sportName)

      const colorMap = {
        'blue': '#1976D2 0%, #1565C0 100%',
        'green': '#388E3C 0%, #2E7D32 100%',
        'orange': '#F57C00 0%, #EF6C00 100%',
        'red': '#D32F2F 0%, #C62828 100%',
        'teal': '#00897B 0%, #00796B 100%',
        'purple': '#7B1FA2 0%, #6A1B9A 100%',
        'pink': '#C2185B 0%, #AD1457 100%',
        'indigo': '#303F9F 0%, #283593 100%',
        'grey': '#616161 0%, #424242 100%'
      }

      return colorMap[color] || '#B71C1C 0%, #C62828 100%'
    }

    const openBookingDialog = () => {
      // Emit event to parent (App.vue) to open the global booking dialog
      window.dispatchEvent(new CustomEvent('open-booking-dialog'))
    }

    const handleBookNowClick = () => {
      // Check if user is authenticated
      const token = localStorage.getItem('token')
      if (!token) {
        router.push('/login')
        return
      }
      router.push({ name: 'Courts' })
    }

    // Load dashboard settings
    const loadDashboardSettings = async () => {
      try {
        const settings = await companySettingService.getSettings()
        dashboardSettings.value = {
          welcomeMessage: settings.dashboard_welcome_message || '',
          announcement: settings.dashboard_announcement || '',
          showStats: settings.dashboard_show_stats !== undefined ? settings.dashboard_show_stats : true,
          showRecentBookings: settings.dashboard_show_recent_bookings !== undefined ? settings.dashboard_show_recent_bookings : true
        }
        // Load company name
        if (settings.company_name) {
          companyName.value = settings.company_name
        }
        // Load company logo
        if (settings.company_logo_url) {
          const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000'
          companyLogoUrl.value = `${apiUrl}${settings.company_logo_url}`
        }
        // Load operating hours
        operatingHoursEnabled.value = settings.operating_hours_enabled !== undefined ? settings.operating_hours_enabled : false
        if (operatingHoursEnabled.value) {
          operatingHours.value = {
            opening: settings.operating_hours_opening || '08:00',
            closing: settings.operating_hours_closing || '22:00',
            monday: {
              open: settings.operating_hours_monday_open || '08:00',
              close: settings.operating_hours_monday_close || '22:00',
              operational: settings.operating_hours_monday_operational !== undefined ? settings.operating_hours_monday_operational : true
            },
            tuesday: {
              open: settings.operating_hours_tuesday_open || '08:00',
              close: settings.operating_hours_tuesday_close || '22:00',
              operational: settings.operating_hours_tuesday_operational !== undefined ? settings.operating_hours_tuesday_operational : true
            },
            wednesday: {
              open: settings.operating_hours_wednesday_open || '08:00',
              close: settings.operating_hours_wednesday_close || '22:00',
              operational: settings.operating_hours_wednesday_operational !== undefined ? settings.operating_hours_wednesday_operational : true
            },
            thursday: {
              open: settings.operating_hours_thursday_open || '08:00',
              close: settings.operating_hours_thursday_close || '22:00',
              operational: settings.operating_hours_thursday_operational !== undefined ? settings.operating_hours_thursday_operational : true
            },
            friday: {
              open: settings.operating_hours_friday_open || '08:00',
              close: settings.operating_hours_friday_close || '22:00',
              operational: settings.operating_hours_friday_operational !== undefined ? settings.operating_hours_friday_operational : true
            },
            saturday: {
              open: settings.operating_hours_saturday_open || '08:00',
              close: settings.operating_hours_saturday_close || '22:00',
              operational: settings.operating_hours_saturday_operational !== undefined ? settings.operating_hours_saturday_operational : true
            },
            sunday: {
              open: settings.operating_hours_sunday_open || '08:00',
              close: settings.operating_hours_sunday_close || '22:00',
              operational: settings.operating_hours_sunday_operational !== undefined ? settings.operating_hours_sunday_operational : true
            }
          }
        }
      } catch (error) {
        console.error('Failed to load dashboard settings:', error)
        // Keep default values on error
      }
    }

    // Event listener for dashboard settings updates
    const handleDashboardUpdate = () => {
      loadDashboardSettings()
    }

    onMounted(async () => {
      await Promise.all([fetchSports(), fetchCourts(), loadDashboardSettings()])

      // Listen for dashboard settings updates
      window.addEventListener('dashboard-settings-updated', handleDashboardUpdate)
    })

    onUnmounted(() => {
      // Cleanup event listener
      window.removeEventListener('dashboard-settings-updated', handleDashboardUpdate)
    })

    return {
      sports,
      courts,
      loading,
      error,
      features,
      courtFeatures,
      dashboardSettings,
      companyName,
      companyLogoUrl,
      operatingHoursEnabled,
      operatingHours,
      displayDays,
      allDaysMatchGeneral,
      hasClosedDays,
      closedDaysList,
      getSportPrice,
      openBookingDialog,
      handleBookNowClick,
      formatPriceTemplate,
      formatTime,
      getImageUrl,
      getSportGradientColor,
      sportService
    }
  }
}
</script>

<style scoped>
/* Modern Sports Design Theme */
.sports-home {
  overflow-x: hidden;
}

/* Announcement Banner */
.announcement-banner {
  margin: 0;
  border-radius: 0;
  z-index: 1000;
  animation: slideInDown 0.5s ease-out;
}

/* Operating Hours Card in Hero Section */
.operating-hours-card-hero {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(20px);
  border-radius: 24px;
  padding: 32px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  margin: 48px auto;
  max-width: 800px;
  animation: fadeInUp 1.2s ease-out;
}

.operating-hours-header {
  display: flex;
  align-items: center;
  margin-bottom: 16px;
}

.operating-hours-title {
  font-size: 2rem;
  font-weight: 800;
  color: white;
  margin-bottom: 4px;
}

.operating-hours-subtitle {
  font-size: 1rem;
  color: rgba(255, 255, 255, 0.8);
  margin: 0;
}

.operating-hours-content {
  color: white;
}

.general-hours {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 16px 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.general-hours-only {
  text-align: center;
  padding: 24px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.general-hours-only .hours-label {
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 1.2rem;
  margin-bottom: 12px;
}

.general-hours-only .hours-time {
  font-size: 2rem;
  font-weight: 800;
  color: white;
  letter-spacing: 1px;
  margin-bottom: 16px;
}

.closed-days-info {
  display: flex;
  align-items: center;
  justify-content: center;
  color: #ffcdd2;
  font-size: 0.95rem;
  font-weight: 600;
  margin-top: 12px;
  padding: 12px 16px;
  background: rgba(244, 67, 54, 0.15);
  border-radius: 8px;
  border: 1px solid rgba(244, 67, 54, 0.3);
}

.hours-label {
  display: flex;
  align-items: center;
  font-weight: 600;
  font-size: 1.1rem;
}

.hours-time {
  font-size: 1.2rem;
  font-weight: 700;
  color: white;
}

.day-hours-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 12px;
}

.day-hours-item {
  background: rgba(255, 255, 255, 0.08);
  border-radius: 10px;
  padding: 12px 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border: 1px solid rgba(255, 255, 255, 0.15);
  transition: all 0.3s ease;
}

.day-hours-item:hover {
  background: rgba(255, 255, 255, 0.15);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.day-label {
  display: flex;
  align-items: center;
  font-weight: 600;
  font-size: 0.95rem;
  color: rgba(255, 255, 255, 0.95);
}

.day-time {
  font-size: 0.9rem;
  font-weight: 600;
  color: white;
  white-space: nowrap;
}

.day-closed {
  opacity: 0.7;
  background: rgba(244, 67, 54, 0.15) !important;
  border-color: rgba(244, 67, 54, 0.3) !important;
}

.closed-badge {
  display: flex;
  align-items: center;
  font-weight: 700;
  color: #ffcdd2;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

/* Hero Company Logo */
.hero-logo-wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 32px;
}

.hero-company-logo {
  animation: fadeInScale 0.8s ease-out;
  filter: drop-shadow(0 4px 12px rgba(0, 0, 0, 0.3));
}

/* Welcome Message */
.welcome-message {
  display: inline-flex;
  align-items: center;
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(10px);
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 50px;
  padding: 12px 28px;
  margin-bottom: 24px;
  color: white;
  font-weight: 600;
  font-size: 16px;
  letter-spacing: 0.5px;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.2);
  animation: fadeInScale 0.6s ease-out;
}

/* Hero Section Styles */
.hero-section {
  position: relative;
  min-height: 100vh;
  display: flex;
  align-items: center;
  overflow: hidden;
}

.hero-background {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%);
  z-index: 1;
}

.hero-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background:
    radial-gradient(circle at 20% 80%, rgba(59, 130, 246, 0.3) 0%, transparent 50%),
    radial-gradient(circle at 80% 20%, rgba(16, 185, 129, 0.3) 0%, transparent 50%),
    radial-gradient(circle at 40% 40%, rgba(245, 158, 11, 0.2) 0%, transparent 50%);
  z-index: 2;
}

.hero-pattern {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-image:
    radial-gradient(circle at 1px 1px, rgba(255, 255, 255, 0.1) 1px, transparent 0);
  background-size: 20px 20px;
  z-index: 3;
}

.hero-container {
  position: relative;
  z-index: 4;
}

.hero-content {
  animation: fadeInUp 1s ease-out;
}

.hero-badge {
  display: inline-flex;
  align-items: center;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 50px;
  padding: 8px 20px;
  margin-bottom: 24px;
  color: white;
  font-weight: 600;
  font-size: 14px;
  letter-spacing: 0.5px;
}

.hero-title {
  font-size: clamp(2.5rem, 5vw, 4rem);
  font-weight: 800;
  line-height: 1.1;
  margin-bottom: 24px;
  color: white;
}

.title-gradient {
  background: linear-gradient(135deg, #B71C1C 0%, #C62828 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.title-accent {
  background: linear-gradient(135deg, #5F6368 0%, #757575 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.hero-subtitle {
  font-size: clamp(1.1rem, 2vw, 1.3rem);
  color: rgba(255, 255, 255, 0.8);
  margin-bottom: 40px;
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;
  line-height: 1.6;
}

.hero-stats {
  display: flex;
  justify-content: center;
  gap: 48px;
  margin-bottom: 48px;
}

.stat-item {
  text-align: center;
  color: white;
}

.stat-number {
  font-size: 2rem;
  font-weight: 800;
  background: linear-gradient(135deg, #B71C1C 0%, #C62828 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-bottom: 8px;
}

.stat-label {
  font-size: 0.9rem;
  color: rgba(255, 255, 255, 0.7);
  font-weight: 600;
  letter-spacing: 0.5px;
}

.hero-actions {
  display: flex;
  gap: 16px;
  justify-content: center;
  flex-wrap: wrap;
}

.hero-btn-primary {
  background: linear-gradient(135deg, #B71C1C 0%, #C62828 100%) !important;
  color: white !important;
  border-radius: 12px !important;
  font-weight: 700 !important;
  text-transform: none !important;
  padding: 16px 32px !important;
  box-shadow: 0 8px 25px rgba(183, 28, 28, 0.4) !important;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
}

.hero-btn-primary:hover {
  transform: translateY(-4px) !important;
  box-shadow: 0 12px 35px rgba(183, 28, 28, 0.6) !important;
}

.hero-btn-secondary {
  background: rgba(255, 255, 255, 0.1) !important;
  color: white !important;
  border: 2px solid rgba(255, 255, 255, 0.3) !important;
  border-radius: 12px !important;
  font-weight: 700 !important;
  text-transform: none !important;
  padding: 16px 32px !important;
  backdrop-filter: blur(10px) !important;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
}

.hero-btn-secondary:hover {
  background: rgba(255, 255, 255, 0.2) !important;
  border-color: rgba(255, 255, 255, 0.5) !important;
  transform: translateY(-4px) !important;
}

/* Available Sports Section */
.sports-available-section {
  position: relative;
  background: linear-gradient(135deg, #B71C1C 0%, #C62828 50%, #D32F2F 100%);
  overflow: hidden;
}

.sports-available-section .v-container {
  position: relative;
  z-index: 2;
}

.sports-background {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1;
}

.sports-pattern {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-image:
    radial-gradient(circle at 2px 2px, rgba(255, 255, 255, 0.1) 1px, transparent 0);
  background-size: 30px 30px;
}

.section-badge-light {
  display: inline-flex;
  align-items: center;
  background: rgba(255, 255, 255, 0.2);
  color: white;
  border-radius: 50px;
  padding: 8px 20px;
  margin-bottom: 16px;
  font-weight: 600;
  font-size: 14px;
  letter-spacing: 0.5px;
  border: 1px solid rgba(255, 255, 255, 0.3);
}

.section-title-light {
  font-size: clamp(2rem, 4vw, 3rem);
  font-weight: 800;
  margin-bottom: 16px;
  color: white;
  position: relative;
  z-index: 2;
}

.title-gradient-light {
  background: linear-gradient(135deg, #FFEBEE 0%, #FFFFFF 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.section-subtitle-light {
  font-size: clamp(1rem, 2vw, 1.2rem);
  color: rgba(255, 255, 255, 0.9);
  max-width: 600px;
  margin: 0 auto;
  line-height: 1.6;
  position: relative;
  z-index: 2;
}

.sport-card {
  position: relative;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-radius: 24px;
  padding: 40px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.2);
  z-index: 2;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  height: 100%;
  opacity: 0;
  animation: fadeInUp 0.8s ease-out forwards;
}

.sport-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 25px 70px rgba(0, 0, 0, 0.4);
}

.sport-card-content {
  position: relative;
  z-index: 3;
  text-align: center;
  display: flex;
  flex-direction: column;
  height: 100%;
}

.sport-icon-section {
  margin-bottom: 24px;
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
}

.sport-icon-wrapper {
  width: 120px;
  height: 120px;
  border-radius: 30px;
  background: linear-gradient(135deg, #B71C1C 0%, #C62828 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 24px;
  box-shadow: 0 8px 25px rgba(183, 28, 28, 0.4);
  transition: all 0.3s ease;
  overflow: hidden;
}

.sport-card:hover .sport-icon-wrapper {
  transform: scale(1.1) rotate(5deg);
}

.sport-logo-image {
  object-fit: contain;
  padding: 10px;
}

.sport-name {
  font-size: 2rem;
  font-weight: 800;
  margin-bottom: 16px;
  background: linear-gradient(135deg, #B71C1C 0%, #5F6368 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.sport-description {
  color: #64748b;
  line-height: 1.6;
  font-size: 1rem;
  margin-bottom: 24px;
}

.sport-details {
  border-top: 1px solid rgba(0, 0, 0, 0.1);
  padding-top: 24px;
  margin-top: auto;
  flex-shrink: 0;
}

.sport-price-section {
  text-align: center;
}

.sport-price-display {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 16px;
}

.sport-price-label {
  font-size: 0.9rem;
  color: #64748b;
  margin-bottom: 8px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.sport-price-amount {
  font-size: 2.5rem;
  font-weight: 800;
  background: linear-gradient(135deg, #B71C1C 0%, #C62828 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

/* Features Section Styles */
.features-section {
  background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
  position: relative;
}

.section-badge {
  display: inline-flex;
  align-items: center;
  background: rgba(183, 28, 28, 0.1);
  color: #B71C1C;
  border-radius: 50px;
  padding: 8px 20px;
  margin-bottom: 16px;
  font-weight: 600;
  font-size: 14px;
  letter-spacing: 0.5px;
}

.section-title {
  font-size: clamp(2rem, 4vw, 3rem);
  font-weight: 800;
  margin-bottom: 16px;
  color: #1e293b;
}

.section-subtitle {
  font-size: clamp(1rem, 2vw, 1.2rem);
  color: #64748b;
  max-width: 600px;
  margin: 0 auto;
  line-height: 1.6;
}

.feature-card {
  position: relative;
  background: white;
  border-radius: 20px;
  padding: 32px;
  height: 100%;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.feature-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, #B71C1C, #C62828, #5F6368);
  opacity: 0;
  transition: opacity 0.3s ease;
}

.feature-card:hover::before {
  opacity: 1;
}

.feature-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
}

.feature-card-1:hover {
  background: linear-gradient(135deg, rgba(183, 28, 28, 0.05) 0%, rgba(183, 28, 28, 0.02) 100%);
}

.feature-card-2:hover {
  background: linear-gradient(135deg, rgba(76, 175, 80, 0.05) 0%, rgba(76, 175, 80, 0.02) 100%);
}

.feature-card-3:hover {
  background: linear-gradient(135deg, rgba(245, 124, 0, 0.05) 0%, rgba(245, 124, 0, 0.02) 100%);
}

.feature-icon {
  width: 80px;
  height: 80px;
  border-radius: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 24px;
  background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
  transition: all 0.3s ease;
}

.feature-card:hover .feature-icon {
  transform: scale(1.1) rotate(5deg);
}

.feature-content {
  text-align: center;
}

.feature-title {
  font-size: 1.5rem;
  font-weight: 700;
  margin-bottom: 16px;
  color: #1e293b;
}

.feature-description {
  color: #64748b;
  line-height: 1.6;
  margin-bottom: 16px;
}

.feature-highlight {
  display: inline-block;
  background: linear-gradient(135deg, #B71C1C 0%, #C62828 100%);
  color: white;
  padding: 6px 16px;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 600;
  letter-spacing: 0.5px;
}

/* Court Section Styles */
.court-section {
  position: relative;
  background: linear-gradient(135deg, #1e293b 0%, #334155 100%);
  overflow: hidden;
}

.court-background {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1;
}

.court-pattern {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-image:
    radial-gradient(circle at 2px 2px, rgba(255, 255, 255, 0.1) 1px, transparent 0);
  background-size: 30px 30px;
}

.court-card {
  position: relative;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-radius: 24px;
  padding: 48px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.2);
  z-index: 2;
}

.court-card-content {
  position: relative;
  z-index: 3;
}

.court-icon-section {
  text-align: center;
}

.court-icon-wrapper {
  width: 120px;
  height: 120px;
  border-radius: 30px;
  background: linear-gradient(135deg, #B71C1C 0%, #C62828 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 24px;
  box-shadow: 0 8px 25px rgba(183, 28, 28, 0.4);
}

.court-name {
  font-size: 2rem;
  font-weight: 800;
  margin-bottom: 16px;
  background: linear-gradient(135deg, #B71C1C 0%, #5F6368 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.court-description {
  color: #64748b;
  line-height: 1.6;
  font-size: 1.1rem;
}

.court-features {
  padding-left: 32px;
}

.features-title {
  font-size: 1.8rem;
  font-weight: 700;
  margin-bottom: 32px;
  color: #1e293b;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
  margin-bottom: 32px;
}

.feature-item {
  display: flex;
  align-items: center;
  padding: 16px;
  background: rgba(248, 250, 252, 0.8);
  border-radius: 12px;
  transition: all 0.3s ease;
}

.feature-item:hover {
  background: rgba(183, 28, 28, 0.05);
  transform: translateX(4px);
}

.feature-icon {
  margin-right: 12px;
}

.feature-text {
  flex: 1;
}

.feature-name {
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 4px;
}

.feature-desc {
  font-size: 0.9rem;
  color: #64748b;
}

.pricing-section {
  text-align: center;
  padding: 24px;
  background: linear-gradient(135deg, rgba(183, 28, 28, 0.05) 0%, rgba(95, 99, 104, 0.05) 100%);
  border-radius: 16px;
}

.price-display {
  margin-bottom: 24px;
}

.price-label {
  display: block;
  font-size: 0.9rem;
  color: #64748b;
  margin-bottom: 8px;
}

.price-amount {
  font-size: 2.5rem;
  font-weight: 800;
  background: linear-gradient(135deg, #B71C1C 0%, #C62828 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.price-unit {
  font-size: 1.2rem;
  color: #64748b;
  font-weight: 600;
}

.book-now-btn {
  background: linear-gradient(135deg, #B71C1C 0%, #C62828 100%) !important;
  color: white !important;
  border-radius: 12px !important;
  font-weight: 700 !important;
  text-transform: none !important;
  padding: 16px 32px !important;
  box-shadow: 0 8px 25px rgba(183, 28, 28, 0.4) !important;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
}

.book-now-btn:hover {
  transform: translateY(-4px) !important;
  box-shadow: 0 12px 35px rgba(183, 28, 28, 0.6) !important;
}

/* Animations */
@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes fadeInUp {
  from {
    transform: translateY(30px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

@keyframes slideInDown {
  from {
    transform: translateY(-100%);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

@keyframes fadeInScale {
  from {
    transform: scale(0.8);
    opacity: 0;
  }
  to {
    transform: scale(1);
    opacity: 1;
  }
}

/* Responsive Design */
@media (max-width: 768px) {
  .hero-logo-wrapper {
    margin-bottom: 24px;
  }

  .hero-company-logo {
    max-height: 80px !important;
    max-width: 200px !important;
  }

  .hero-stats {
    gap: 24px;
  }

  .hero-actions {
    flex-direction: column;
    align-items: center;
  }

  .features-grid {
    grid-template-columns: 1fr;
  }

  .court-features {
    padding-left: 0;
    margin-top: 32px;
  }

  .court-card {
    padding: 32px 24px;
  }

  .operating-hours-card-hero {
    padding: 24px;
    margin: 32px auto;
  }

  .general-hours {
    flex-direction: column;
    gap: 8px;
    text-align: center;
  }

  .general-hours-only {
    padding: 20px;
  }

  .general-hours-only .hours-time {
    font-size: 1.5rem;
  }

  .closed-days-info {
    font-size: 0.85rem;
    padding: 10px 12px;
  }

  .day-hours-grid {
    grid-template-columns: 1fr;
  }

  .sport-card {
    padding: 32px 24px;
  }

  .sport-icon-wrapper {
    width: 100px;
    height: 100px;
  }

  .sport-name {
    font-size: 1.75rem;
  }

  .sport-price-amount {
    font-size: 2rem;
  }
}

@media (max-width: 480px) {
  .hero-logo-wrapper {
    margin-bottom: 20px;
  }

  .hero-company-logo {
    max-height: 60px !important;
    max-width: 150px !important;
  }

  .hero-stats {
    flex-direction: column;
    gap: 16px;
  }

  .court-card {
    padding: 24px 16px;
  }

  .operating-hours-card-hero {
    padding: 20px;
    margin: 24px auto;
  }

  .general-hours-only {
    padding: 16px;
  }

  .general-hours-only .hours-time {
    font-size: 1.3rem;
  }

  .closed-days-info {
    flex-direction: column;
    text-align: center;
    font-size: 0.8rem;
  }

  .features-grid {
    gap: 12px;
  }

  .feature-item {
    padding: 12px;
  }

  .sport-card {
    padding: 24px 16px;
  }

  .sport-icon-wrapper {
    width: 80px;
    height: 80px;
  }

  .sport-icon-wrapper .v-icon {
    font-size: 50px !important;
  }

  .sport-name {
    font-size: 1.5rem;
  }

  .sport-description {
    font-size: 0.9rem;
  }

  .sport-price-amount {
    font-size: 1.8rem;
  }
}
</style>
<template>
  <div class="sports-container">
    <!-- Enhanced Header -->
    <div class="sports-header">
      <div class="header-content">
        <div class="header-badge">
          <v-icon color="#B71C1C" size="20" class="mr-2">mdi-racquetball</v-icon>
          Multi-Sport Facility
        </div>
        <h1 class="header-title">
          <span class="title-gradient">Our</span> Sports
        </h1>
        <p class="header-subtitle">
          Professional sports facility designed for champions and enthusiasts of all skill levels
        </p>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="loading-section">
      <div class="loading-card">
        <v-progress-circular indeterminate color="primary" size="64"></v-progress-circular>
        <h2 class="loading-title">Loading Sports Information...</h2>
        <p class="loading-text">Please wait while we fetch the sports court details.</p>
      </div>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="error-section">
      <div class="error-card">
        <div class="error-icon">
          <v-icon color="error" size="64">mdi-alert-circle</v-icon>
        </div>
        <h2 class="error-title">Error Loading Sports</h2>
        <p class="error-text">{{ error }}</p>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else-if="sports.length === 0" class="excel-empty">
      <div class="excel-empty-icon">🏟️</div>
      <h3 class="excel-empty-title">No Sports Available</h3>
      <p class="excel-empty-text">There are currently no sports available. Please check back later.</p>
    </div>

    <!-- Dynamic Sports Display -->
    <div v-else class="excel-court-container">
      <div class="sports-grid">
        <div
          v-for="sport in sports"
          :key="sport.id"
          class="excel-court-card"
        >
        <div class="excel-court-header">
          <div class="excel-court-icon-wrapper">
            <!-- Use MDI icon if available, otherwise fallback to emoji -->
            <v-icon v-if="sport.icon" size="48" color="white">{{ sport.icon }}</v-icon>
            <span v-else class="excel-court-icon-emoji">{{ sportService.getSportIcon(sport.name, sport.icon) }}</span>
          </div>
          <v-chip
            :color="sport.is_active ? 'success' : 'error'"
            variant="tonal"
            size="large"
            class="excel-court-status"
          >
            {{ sport.is_active ? 'Available' : 'Unavailable' }}
          </v-chip>
        </div>

        <div class="excel-court-content">
          <h2 class="excel-court-title">{{ sport.name }}</h2>
          <p class="excel-court-description">
            {{ sport.description || `Professional ${sport.name.toLowerCase()} court with modern facilities` }}
          </p>

          <div class="excel-court-features">
            <h4 class="excel-features-title">Court Features</h4>
            <div class="excel-features-grid">
              <div class="excel-feature-item">
                <v-icon size="20" color="success" class="mr-2">mdi-check-circle</v-icon>
                <span>Air Conditioning</span>
              </div>
              <div class="excel-feature-item">
                <v-icon size="20" color="success" class="mr-2">mdi-check-circle</v-icon>
                <span>Equipment Rental</span>
              </div>
              <div class="excel-feature-item">
                <v-icon size="20" color="success" class="mr-2">mdi-check-circle</v-icon>
                <span>Parking Available</span>
              </div>
              <div class="excel-feature-item">
                <v-icon size="20" color="success" class="mr-2">mdi-check-circle</v-icon>
                <span>Professional Lighting</span>
              </div>
              <div class="excel-feature-item">
                <v-icon size="20" color="success" class="mr-2">mdi-check-circle</v-icon>
                <span>Sound System</span>
              </div>
              <div class="excel-feature-item">
                <v-icon size="20" color="success" class="mr-2">mdi-cash</v-icon>
                <span>₱{{ sport.price_per_hour || 0 }}/hour</span>
              </div>
            </div>
          </div>
        </div>

        <div class="excel-court-footer">
          <v-btn
            color="primary"
            variant="elevated"
            size="large"
            class="excel-court-btn"
            @click="handleBookNowClick(sport)"
            :disabled="!sport.is_active"
          >
            <v-icon>mdi-calendar-plus</v-icon>
            Book Now - {{ formatPriceTemplate(sport.price_per_hour || 0) }}/hour
          </v-btn>
        </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Booking Dialog -->
  <NewBookingDialog
    :is-open="bookingDialogOpen"
    :preselected-sport="selectedSportForBooking"
    @close="closeBookingDialog"
    @booking-created="handleBookingCreated"
  />
</template>

<script>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { courtService } from '../services/courtService'
import { sportService } from '../services/sportService'
import { formatPrice } from '../utils/formatters'
import NewBookingDialog from '../components/NewBookingDialog.vue'

export default {
  name: 'Sports',
  components: {
    NewBookingDialog
  },
  setup() {
    const router = useRouter()
    const sports = ref([])
    const loading = ref(true)
    const error = ref(null)
    const bookingDialogOpen = ref(false)
    const selectedSportForBooking = ref(null)

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

    // Wrapper function for template use
    const formatPriceTemplate = (price) => {
      return formatPrice(price)
    }

    const handleBookNowClick = (sport) => {
      // Check if user is authenticated
      const token = localStorage.getItem('token')
      if (!token) {
        router.push('/login')
        return
      }

      // Open booking dialog with the selected sport
      selectedSportForBooking.value = sport
      bookingDialogOpen.value = true
    }

    const closeBookingDialog = () => {
      bookingDialogOpen.value = false
      selectedSportForBooking.value = null
    }

    const handleBookingCreated = () => {
      // Optionally refresh sports data or show a success message
      // The dialog will close itself after booking is created
      closeBookingDialog()
    }

    onMounted(async () => {
      await fetchSports()
    })

    return {
      sports,
      loading,
      error,
      bookingDialogOpen,
      selectedSportForBooking,
      handleBookNowClick,
      closeBookingDialog,
      handleBookingCreated,
      formatPriceTemplate,
      // Services
      sportService
    }
  }
}
</script>

<style scoped>
/* Modern Sports Theme */
.sports-container {
  min-height: 100vh;
  padding: 32px;
  position: relative;
  z-index: 1;
}

/* Background is now handled globally by App.vue */

/* Sports Header */
.sports-header {
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
  margin: 0 auto;
  line-height: 1.6;
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
  background: linear-gradient(135deg, #1e293b 0%, #B71C1C 100%);
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
  font-size: 1.1rem;
}

.excel-court-container {
  background: white;
  border: 1px solid #d1d5db;
  border-top: none;
  border-radius: 0 0 8px 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  padding: 40px;
}

.sports-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 32px;
  width: 100%;
}

/* Two columns for medium screens and up */
@media (min-width: 960px) {
  .sports-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

.excel-court-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.excel-court-header {
  background: linear-gradient(135deg, #B71C1C 0%, #D32F2F 100%);
  padding: 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.excel-court-icon-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 60px;
}

.excel-court-icon-emoji {
  font-size: 48px;
  color: white;
}

.excel-court-status {
  font-size: 16px !important;
  font-weight: 600 !important;
}

.excel-court-content {
  padding: 32px;
  flex: 1;
}

.excel-court-title {
  font-size: 32px;
  font-weight: 700;
  color: #1f2937;
  margin: 0 0 16px 0;
}

.excel-court-description {
  font-size: 18px;
  color: #6b7280;
  margin: 0 0 32px 0;
  line-height: 1.6;
}

.excel-court-features {
  margin-bottom: 32px;
}

.excel-features-title {
  font-size: 20px;
  font-weight: 600;
  color: #1f2937;
  margin: 0 0 20px 0;
}

.excel-features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 16px;
}

.excel-feature-item {
  display: flex;
  align-items: center;
  font-size: 16px;
  color: #374151;
  padding: 8px 0;
}

.excel-court-time {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px 0;
  margin-top: 16px;
  background: rgba(183, 28, 28, 0.05);
  border-radius: 8px;
}

.excel-time-text {
  font-size: 0.9rem;
  font-weight: 500;
  color: #B71C1C;
}

.excel-court-footer {
  padding: 24px 32px;
  background: #f8fafc;
  text-align: center;
}

.excel-court-btn {
  font-size: 18px !important;
  font-weight: 600 !important;
  /* padding: 16px 32px !important; */
  border-radius: 8px !important;
}

.excel-header {
  background: white;
  border: 1px solid #d1d5db;
  border-radius: 8px 8px 0 0;
  padding: 20px 24px;
  margin-bottom: 0;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.excel-title-section {
  text-align: center;
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

.excel-loading {
  background: white;
  border: 1px solid #d1d5db;
  border-top: none;
  padding: 60px 24px;
  text-align: center;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.excel-loading-text {
  margin-top: 16px;
  color: #6b7280;
  font-size: 16px;
}

.excel-error {
  background: white;
  border: 1px solid #d1d5db;
  border-top: none;
  padding: 24px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.excel-sports-container {
  background: white;
  border: 1px solid #d1d5db;
  border-top: none;
  border-radius: 0 0 8px 8px;
  padding: 24px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.excel-sports-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
}

.excel-sport-card {
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 20px;
  background: white;
  transition: all 0.2s;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.excel-sport-card:hover {
  border-color: #3b82f6;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}

.excel-sport-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.excel-sport-icon {
  font-size: 32px;
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #eff6ff;
  border-radius: 8px;
}

.excel-sport-status {
  font-weight: 500;
  font-size: 12px;
}

.excel-sport-content {
  flex: 1;
}

.excel-sport-title {
  font-size: 18px;
  font-weight: 600;
  color: #1f2937;
  margin: 0 0 8px 0;
}

.excel-sport-description {
  font-size: 14px;
  color: #6b7280;
  margin: 0;
  line-height: 1.5;
}

.excel-sport-actions {
  display: flex;
  justify-content: center;
}

.excel-sport-btn {
  font-size: 14px;
  text-transform: none;
  border-radius: 6px;
  font-weight: 500;
}

.excel-empty {
  background: white;
  border: 1px solid #d1d5db;
  border-top: none;
  border-radius: 0 0 8px 8px;
  padding: 60px 24px;
  text-align: center;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.excel-empty-icon {
  font-size: 64px;
  margin-bottom: 16px;
}

.excel-empty-title {
  font-size: 20px;
  font-weight: 600;
  color: #1f2937;
  margin: 0 0 8px 0;
}

.excel-empty-text {
  font-size: 16px;
  color: #6b7280;
  margin: 0;
}

/* Responsive Design */
@media (max-width: 768px) {
  .sports-container {
    padding: 16px;
  }

  .excel-court-container {
    padding: 20px;
  }

  .sports-grid {
    grid-template-columns: 1fr;
    gap: 24px;
  }

  .excel-court-card {
    margin-bottom: 0;
  }

  .excel-court-title {
    font-size: 24px;
  }

  .excel-court-description {
    font-size: 16px;
  }

  .excel-features-grid {
    grid-template-columns: 1fr;
  }
}
</style>
<template>
  <div class="sports-home">
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
              <div class="hero-badge">
                <v-icon color="white" size="24" class="mr-2">mdi-trophy</v-icon>
                Professional Badminton Courts
              </div>
              <h1 class="hero-title">
                <span class="title-gradient">Champion</span> Your Game
                <br>
                <span class="title-accent">Book & Play</span> Today
            </h1>
              <p class="hero-subtitle">
                Experience world-class badminton facilities with our premium court booking system. 
                From casual games to competitive training, we've got you covered.
              </p>
              <div class="hero-stats">
                <div class="stat-item">
                  <div class="stat-number">24/7</div>
                  <div class="stat-label">Available</div>
                </div>
                <div class="stat-item">
                  <div class="stat-number">Premium</div>
                  <div class="stat-label">Facilities</div>
                </div>
                <div class="stat-item">
                  <div class="stat-number">Instant</div>
                  <div class="stat-label">Booking</div>
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
              <v-btn
                  size="x-large"
                  class="hero-btn-secondary"
                :to="{ name: 'Courts' }"
                prepend-icon="mdi-stadium"
                variant="outlined"
              >
                  Explore Courts
              </v-btn>
              </div>
            </div>
          </v-col>
        </v-row>
      </v-container>
    </div>

    <!-- Features Section with Modern Sports Design -->
    <section class="features-section">
      <v-container class="py-16">
      <v-row>
          <v-col cols="12" class="text-center mb-12">
            <div class="section-badge">
              <v-icon color="primary" size="20" class="mr-2">mdi-star</v-icon>
              Why Choose Us
            </div>
            <h2 class="section-title">
              <span class="title-gradient">Champion</span> Features
            </h2>
            <p class="section-subtitle">
              Experience the ultimate badminton court booking system designed for champions
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
              <span class="title-gradient">Premium</span> Badminton Court
            </h2>
            <p class="section-subtitle">
              Professional-grade facility designed for champions and enthusiasts alike
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
                        <v-icon size="100" color="white">mdi-racquetball</v-icon>
                        </div>
                      <h3 class="court-name">Champion Court</h3>
                      <p class="court-description">
                        Professional-grade badminton facility with premium wooden flooring and championship-level equipment
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
                          <span class="price-amount">{{ formatPriceTemplate(getCourtPrice()) }}</span>
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
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { courtService } from '../services/courtService'
import { formatPrice } from '../utils/formatters'

export default {
  name: 'Home',
  setup() {
    const router = useRouter()
    const sports = ref([])
    const courts = ref([])
    const loading = ref(true)
    const error = ref(null)

    // Features data for the features section
    const features = ref([
      {
        icon: 'mdi-racquetball',
        title: 'Professional Courts',
        description: 'World-class badminton facilities with premium wooden flooring and championship-level equipment',
        highlight: 'Tournament Ready',
        color: 'primary'
      },
      {
        icon: 'mdi-clock-fast',
        title: 'Instant Booking',
        description: 'Book your court in seconds with our lightning-fast booking system and real-time availability',
        highlight: '24/7 Available',
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
      {
        icon: 'mdi-music',
        name: 'Sound System',
        description: 'Premium audio equipment',
        color: 'info'
      },
      {
        icon: 'mdi-tools',
        name: 'Equipment Rental',
        description: 'Rackets and shuttlecocks available',
        color: 'secondary'
      },
      {
        icon: 'mdi-security',
        name: 'Secure Facility',
        description: '24/7 security and monitoring',
        color: 'error'
      }
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

    const getCourtPrice = () => {
      if (courts.value.length > 0) {
        // Get the first court's price, or you could get the average/min/max
        return courts.value[0].price_per_hour
      }
      return 25 // fallback to default price
    }

    // Wrapper function for template use
    const formatPriceTemplate = (price) => {
      return formatPrice(price)
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

    onMounted(async () => {
      await Promise.all([fetchSports(), fetchCourts()])
    })

    return {
      sports,
      courts,
      loading,
      error,
      features,
      courtFeatures,
      getCourtPrice,
      openBookingDialog,
      handleBookNowClick,
      formatPriceTemplate
    }
  }
}
</script>

<style scoped>
/* Modern Sports Design Theme */
.sports-home {
  overflow-x: hidden;
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
  background: linear-gradient(135deg, #3b82f6 0%, #10b981 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.title-accent {
  background: linear-gradient(135deg, #f59e0b 0%, #ef4444 100%);
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
  background: linear-gradient(135deg, #3b82f6 0%, #10b981 100%);
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
  background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%) !important;
  color: white !important;
  border-radius: 12px !important;
  font-weight: 700 !important;
  text-transform: none !important;
  padding: 16px 32px !important;
  box-shadow: 0 8px 25px rgba(59, 130, 246, 0.4) !important;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
}

.hero-btn-primary:hover {
  transform: translateY(-4px) !important;
  box-shadow: 0 12px 35px rgba(59, 130, 246, 0.6) !important;
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

/* Features Section Styles */
.features-section {
  background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
  position: relative;
}

.section-badge {
  display: inline-flex;
  align-items: center;
  background: rgba(59, 130, 246, 0.1);
  color: #3b82f6;
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
  background: linear-gradient(90deg, #3b82f6, #10b981, #f59e0b);
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
  background: linear-gradient(135deg, rgba(59, 130, 246, 0.05) 0%, rgba(59, 130, 246, 0.02) 100%);
}

.feature-card-2:hover {
  background: linear-gradient(135deg, rgba(16, 185, 129, 0.05) 0%, rgba(16, 185, 129, 0.02) 100%);
}

.feature-card-3:hover {
  background: linear-gradient(135deg, rgba(245, 158, 11, 0.05) 0%, rgba(245, 158, 11, 0.02) 100%);
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
  background: linear-gradient(135deg, #3b82f6 0%, #10b981 100%);
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
  background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 24px;
  box-shadow: 0 8px 25px rgba(59, 130, 246, 0.4);
}

.court-name {
  font-size: 2rem;
  font-weight: 800;
  margin-bottom: 16px;
  background: linear-gradient(135deg, #1e293b 0%, #3b82f6 100%);
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
  background: rgba(59, 130, 246, 0.05);
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
  background: linear-gradient(135deg, rgba(59, 130, 246, 0.05) 0%, rgba(16, 185, 129, 0.05) 100%);
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
  background: linear-gradient(135deg, #3b82f6 0%, #10b981 100%);
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
  background: linear-gradient(135deg, #10b981 0%, #059669 100%) !important;
  color: white !important;
  border-radius: 12px !important;
  font-weight: 700 !important;
  text-transform: none !important;
  padding: 16px 32px !important;
  box-shadow: 0 8px 25px rgba(16, 185, 129, 0.4) !important;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
}

.book-now-btn:hover {
  transform: translateY(-4px) !important;
  box-shadow: 0 12px 35px rgba(16, 185, 129, 0.6) !important;
}

/* Animations */
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

/* Responsive Design */
@media (max-width: 768px) {
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
}

@media (max-width: 480px) {
  .hero-stats {
    flex-direction: column;
    gap: 16px;
  }
  
  .court-card {
    padding: 24px 16px;
  }
  
  .features-grid {
    gap: 12px;
  }
  
  .feature-item {
    padding: 12px;
  }
}
</style>
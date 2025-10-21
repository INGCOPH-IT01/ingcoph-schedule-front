<template>
  <v-app>
    <!-- Dynamic Global Background -->
    <div class="global-background" :style="backgroundStyle"></div>

    <v-app-bar class="excel-app-bar">
      <v-app-bar-nav-icon @click="drawer = !drawer" class="excel-nav-icon"></v-app-bar-nav-icon>
      <v-toolbar-title class="excel-app-title d-flex align-center" @click="router.push({ name: 'Home' })" style="cursor: pointer;">
        <v-avatar v-if="companyLogo" size="40" class="mr-3 company-logo-avatar">
          <v-img :src="companyLogo" alt="Company Logo" cover></v-img>
        </v-avatar>
        {{ companyName }}
      </v-toolbar-title>
      <v-spacer></v-spacer>
      <v-btn
        v-if="isAuthenticated"
        icon
        class="excel-cart-btn mr-2"
        @click="cartDialogOpen = true"
      >
        <v-badge
          :content="cartCount"
          :model-value="cartCount > 0"
          color="error"
          overlap
        >
          <v-icon>mdi-cart</v-icon>
        </v-badge>
      </v-btn>

      <!-- Login/Register buttons for non-authenticated users -->
      <template v-if="!isAuthenticated">
        <v-btn
          variant="outlined"
          class="mr-2"
          :to="{ name: 'Login' }"
          prepend-icon="mdi-login"
        >
          Login
        </v-btn>
        <v-btn
          variant="elevated"
          color="primary"
          :to="{ name: 'Register' }"
          prepend-icon="mdi-account-plus"
        >
          Register
        </v-btn>
      </template>

      <!-- User avatar and profile menu for authenticated users -->
      <v-menu v-else offset-y>
        <template v-slot:activator="{ props }">
          <v-btn
            icon
            v-bind="props"
            class="excel-profile-btn"
          >
            <v-avatar size="40">
              <v-img :src="`https://ui-avatars.com/api/?name=${user?.name}&background=3b82f6&color=fff`"></v-img>
            </v-avatar>
          </v-btn>
        </template>
        <v-list>
          <v-list-item
            prepend-icon="mdi-account-cog"
            :to="{ name: 'UserProfile' }"
          >
            <v-list-item-title>My Profile</v-list-item-title>
          </v-list-item>
          <v-divider></v-divider>
          <v-list-item
            prepend-icon="mdi-logout"
            @click="logout"
          >
            <v-list-item-title>Logout</v-list-item-title>
          </v-list-item>
        </v-list>
      </v-menu>
    </v-app-bar>

    <v-main class="excel-main">
      <v-navigation-drawer
        v-model="drawer"
        :rail="rail"
        @click="rail = false"
        class="excel-sidebar"
        fixed
      >
        <v-list density="compact" nav class="excel-nav-list">
          <v-list-item
            prepend-icon="mdi-view-dashboard"
            title="Dashboard"
            value="dashboard"
            :to="{ name: 'Home' }"
            class="excel-nav-item"
          ></v-list-item>

          <v-list-item
            prepend-icon="mdi-racquetball"
            title="Sports"
            value="sports"
            :to="{ name: 'Sports' }"
            class="excel-nav-item"
          ></v-list-item>

          <!-- Courts - Only show for admin/staff users -->
          <v-list-item
            v-if="isAuthenticated && (isAdmin || isStaff)"
            prepend-icon="mdi-stadium"
            title="Courts"
            value="courts"
            @click="handleCourtsClick"
            class="excel-nav-item"
          ></v-list-item>

          <v-list-item
            prepend-icon="mdi-calendar"
            title="My Bookings"
            value="bookings"
            @click="handleBookingsClick"
            class="excel-nav-item"
          ></v-list-item>

          <!-- Admin Panel - Only for admin users -->
          <v-list-item
            v-if="isAuthenticated && isAdmin"
            prepend-icon="mdi-shield-account"
            title="Admin Panel"
            value="admin"
            :to="{ name: 'AdminDashboard' }"
            class="excel-nav-item"
          ></v-list-item>

          <!-- User Management - Only for admin users -->
          <v-list-item
            v-if="isAuthenticated && isAdmin"
            prepend-icon="mdi-account-group"
            title="User Management"
            value="users"
            :to="{ name: 'UserManagement' }"
            class="excel-nav-item"
          ></v-list-item>

          <!-- Sports Management - Only for admin users -->
          <v-list-item
            v-if="isAuthenticated && isAdmin"
            prepend-icon="mdi-tennis-ball"
            title="Sports Management"
            value="sports-management"
            :to="{ name: 'SportsManagement' }"
            class="excel-nav-item"
          ></v-list-item>

          <!-- Company Settings - Only for admin users -->
          <v-list-item
            v-if="isAuthenticated && isAdmin"
            prepend-icon="mdi-cog"
            title="Company Settings"
            value="company-settings"
            :to="{ name: 'CompanySettings' }"
            class="excel-nav-item"
          ></v-list-item>

          <!-- Payment Settings - Only for admin users -->
          <v-list-item
            v-if="isAuthenticated && isAdmin"
            prepend-icon="mdi-cash-multiple"
            title="Payment Settings"
            value="payment-settings"
            :to="{ name: 'PaymentSettings' }"
            class="excel-nav-item"
          ></v-list-item>

          <!-- Holiday Management - Only for admin users -->
          <v-list-item
            v-if="isAuthenticated && isAdmin"
            prepend-icon="mdi-calendar-star"
            title="Holiday Management"
            value="holiday-management"
            :to="{ name: 'HolidayManagement' }"
            class="excel-nav-item"
          ></v-list-item>

          <!-- Staff Scanner - Only for staff/admin users -->
          <v-list-item
            v-if="isAuthenticated && (isStaff || isAdmin)"
            prepend-icon="mdi-qrcode-scan"
            title="Staff Scanner"
            value="staff"
            :to="{ name: 'StaffDashboard' }"
            class="excel-nav-item"
          ></v-list-item>
        </v-list>
      </v-navigation-drawer>

      <v-container fluid class="excel-container">
        <router-view :key="$route.fullPath" />
      </v-container>
    </v-main>

    <!-- New Booking Dialog -->
    <NewBookingDialog
      :is-open="bookingDialogOpen"
      @close="closeBookingDialog"
      @booking-created="handleBookingCreated"
    />

    <!-- Booking Cart Dialog -->
    <BookingCart
      :is-open="cartDialogOpen"
      @close="cartDialogOpen = false"
      @checkout-complete="handleCheckoutComplete"
    />

    <!-- Floating Action Button for Quick Booking -->
    <!-- <v-fab
      v-if="isAuthenticated"
      icon="mdi-calendar-plus"
      color="primary"
      size="large"
      location="bottom end"
      class="excel-fab"
      @click="openBookingDialog"
    ></v-fab> -->
  </v-app>
</template>

<script>
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { authService } from './services/authService'
import { cartService } from './services/cartService'
import { companySettingService } from './services/companySettingService'
import NewBookingDialog from './components/NewBookingDialog.vue'
import BookingCart from './components/BookingCart.vue'

export default {
  name: 'App',
  components: {
    NewBookingDialog,
    BookingCart
  },
  setup() {
    const router = useRouter()
    const route = useRoute()
    const user = ref(null)
    const drawer = ref(true)
    const rail = ref(false)
    const bookingDialogOpen = ref(false)
    const cartDialogOpen = ref(false)
    const cartCount = ref(0)
    const companyName = ref('Perfect Smash')
    const companyLogo = ref(null)
    const isAuthenticated = computed(() => !!user.value)
    const isAdmin = computed(() => user.value?.role === 'admin')
    const isStaff = computed(() => user.value?.role === 'staff')

    // Background colors
    const bgPrimaryColor = ref('#FFFFFF')
    const bgSecondaryColor = ref('#FFEBEE')
    const bgAccentColor = ref('#FFCDD2')

    const backgroundStyle = computed(() => ({
      background: `linear-gradient(135deg, ${bgPrimaryColor.value} 0%, ${bgSecondaryColor.value} 25%, ${bgAccentColor.value} 50%, ${bgSecondaryColor.value} 75%, ${bgPrimaryColor.value} 100%)`
    }))

    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('token')
        if (token) {
          const userData = await authService.getUser()
          user.value = userData
          // Dispatch auth change event
          window.dispatchEvent(new CustomEvent('auth-changed', { detail: { user: userData } }))
        } else {
          user.value = null
          // Dispatch auth change event
          window.dispatchEvent(new CustomEvent('auth-changed', { detail: { user: null } }))
        }
      } catch (error) {
        localStorage.removeItem('token')
        user.value = null
        // Dispatch auth change event
        window.dispatchEvent(new CustomEvent('auth-changed', { detail: { user: null } }))
      }
    }

    const logout = async () => {
      try {
        await authService.logout()
        user.value = null
        // Dispatch auth change event
        window.dispatchEvent(new CustomEvent('auth-changed', { detail: { user: null } }))
        router.push('/login')
      } catch (error) {
        console.error('Logout error:', error)
      }
    }

    const openBookingDialog = () => {
      if (!isAuthenticated.value) {
        router.push('/login')
        return
      }
      bookingDialogOpen.value = true
    }

    const handleCourtsClick = () => {
      if (!isAuthenticated.value) {
        router.push('/login')
        return
      }
      router.push({ name: 'Courts' })
    }

    const handleBookingsClick = () => {
      if (!isAuthenticated.value) {
        router.push('/login')
        return
      }
      router.push({ name: 'Bookings' })
    }


    const closeBookingDialog = () => {
      bookingDialogOpen.value = false
    }

    const handleBookingCreated = () => {
      // Update cart count when booking is created (added to cart)
      updateCartCount()
    }

    const handleCheckoutComplete = () => {
      updateCartCount()
    }

    const updateCartCount = async () => {
      try {
        if (user.value) {
          const count = await cartService.getCartCount()
          cartCount.value = count
        } else {
          cartCount.value = 0
        }
      } catch (error) {
        console.error('Failed to update cart count:', error)
        cartCount.value = 0
      }
    }

    const loadCompanySettings = async () => {
      try {
        const settings = await companySettingService.getSettings()
        if (settings.company_name) {
          companyName.value = settings.company_name
          // Update document title with company name
          document.title = `${settings.company_name} - Badminton & Pickleball Court Booking`
        }

        // Load company logo if exists
        if (settings.company_logo_url) {
          const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000'
          companyLogo.value = `${apiUrl}${settings.company_logo_url}`
        } else {
          companyLogo.value = null
        }

        // Load background colors
        if (settings.bg_primary_color) {
          bgPrimaryColor.value = settings.bg_primary_color
        }
        if (settings.bg_secondary_color) {
          bgSecondaryColor.value = settings.bg_secondary_color
        }
        if (settings.bg_accent_color) {
          bgAccentColor.value = settings.bg_accent_color
        }
      } catch (error) {
        console.error('Failed to load company settings:', error)
        // Keep default name, logo, and colors if loading fails
      }
    }

    const updateBackgroundColors = (colors) => {
      if (colors.primary) bgPrimaryColor.value = colors.primary
      if (colors.secondary) bgSecondaryColor.value = colors.secondary
      if (colors.accent) bgAccentColor.value = colors.accent
    }

    onMounted(() => {
      updateCartCount()
      checkAuth()
      loadCompanySettings()


      // Update cart count every 30 seconds (for expiration detection)
      // This helps notify users when cart items expire
      setInterval(updateCartCount, 30000) // 30 seconds instead of 5

      // Listen for custom event from child components
      window.addEventListener('open-booking-dialog', openBookingDialog)
      window.addEventListener('cart-updated', updateCartCount)
      window.addEventListener('open-cart', () => {
        cartDialogOpen.value = true
      })

      // Listen for authentication changes
      window.addEventListener('auth-changed', (event) => {
        user.value = event.detail.user
      })

      // Listen for company settings updates
      window.addEventListener('company-settings-updated', loadCompanySettings)

      // Listen for background color updates
      window.addEventListener('background-colors-updated', (event) => {
        updateBackgroundColors(event.detail)
      })
    })

    // Watch for route changes to ensure components re-initialize
    watch(() => route.path, (newPath, oldPath) => {
      // Force re-render by dispatching a custom event
      window.dispatchEvent(new CustomEvent('route-changed', {
        detail: { newPath, oldPath }
      }))
    })

    return {
      user,
      drawer,
      rail,
      isAuthenticated,
      isAdmin,
      isStaff,
      bookingDialogOpen,
      cartDialogOpen,
      cartCount,
      companyName,
      companyLogo,
      route,
      router,
      logout,
      openBookingDialog,
      closeBookingDialog,
      handleBookingCreated,
      handleCheckoutComplete,
      handleCourtsClick,
      handleBookingsClick,
      backgroundStyle
    }
  }
}
</script>

<style scoped>
/* Dynamic Global Background */
.global-background {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: -1;
  transition: background 0.5s ease;
}

/* Modern Sports Theme - Dynamic Athletic Design */
.excel-sidebar {
  background: linear-gradient(180deg, #ffffff 0%, #f8fafc 50%, #f1f5f9 100%) !important;
  border-right: 1px solid #e2e8f0 !important;
  box-shadow: 2px 0 16px rgba(0, 0, 0, 0.06) !important;
}

.excel-nav-list {
  padding: 16px 12px;
}

.excel-nav-item {
  border-radius: 12px !important;
  margin-bottom: 8px !important;
  color: #475569 !important;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
  position: relative;
  overflow: hidden;
  padding: 12px 16px !important;
  min-height: 48px !important;
}

.excel-nav-item::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 4px;
  height: 100%;
  background: linear-gradient(180deg, #B71C1C 0%, #C62828 100%);
  transform: scaleY(0);
  transition: transform 0.3s ease;
  border-radius: 0 4px 4px 0;
}

.excel-nav-item:hover::before {
  transform: scaleY(1);
}

.excel-nav-item::after {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(183, 28, 28, 0.08), transparent);
  transition: left 0.6s ease;
}

.excel-nav-item:hover::after {
  left: 100%;
}

.excel-nav-item:hover {
  background: linear-gradient(135deg, #ffebee 0%, #ffcdd2 100%) !important;
  color: #b71c1c !important;
  transform: translateX(6px);
  box-shadow: 0 4px 12px rgba(183, 28, 28, 0.15);
}

.excel-nav-item.v-list-item--active {
  background: linear-gradient(135deg, #B71C1C 0%, #C62828 100%) !important;
  color: #ffffff !important;
  font-weight: 600 !important;
  box-shadow: 0 4px 16px rgba(183, 28, 28, 0.3);
  transform: translateX(6px);
}

.excel-nav-item.v-list-item--active::before {
  transform: scaleY(1);
  background: linear-gradient(180deg, #ffffff 0%, #ffcdd2 100%);
}

/* Icon styling */
.excel-nav-item :deep(.v-list-item__prepend) {
  margin-inline-end: 16px !important;
}

.excel-nav-item :deep(.v-icon) {
  font-size: 22px !important;
  transition: all 0.3s ease;
}

.excel-nav-item:hover :deep(.v-icon) {
  transform: scale(1.1) rotate(5deg);
}

.excel-nav-item.v-list-item--active :deep(.v-icon) {
  transform: scale(1.05);
}

.excel-app-bar {
  background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%) !important;
  border-bottom: 1px solid #e2e8f0 !important;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08) !important;
  backdrop-filter: blur(10px);
}

.excel-nav-icon {
  color: #64748b !important;
}

.excel-app-title {
  background: linear-gradient(135deg, #B71C1C 0%, #5F6368 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  font-weight: 700 !important;
  font-size: 20px !important;
  letter-spacing: -0.5px;
}

.company-logo-avatar {
  border: 2px solid rgba(183, 28, 28, 0.2);
  box-shadow: 0 2px 8px rgba(183, 28, 28, 0.15);
  transition: all 0.3s ease;
}

.company-logo-avatar:hover {
  transform: scale(1.05);
  box-shadow: 0 4px 12px rgba(183, 28, 28, 0.25);
}

.excel-notification-btn,
.excel-profile-btn {
  color: #64748b !important;
  transition: all 0.3s ease !important;
}

.excel-notification-btn:hover,
.excel-profile-btn:hover {
  color: #B71C1C !important;
  transform: scale(1.1);
}

.excel-main {
  background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 25%, #cbd5e1 50%, #e2e8f0 75%, #f8fafc 100%) !important;
  background-attachment: fixed;
  position: relative;
}

.excel-main::before {
  content: '';
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background:
    radial-gradient(circle at 20% 80%, rgba(183, 28, 28, 0.1) 0%, transparent 50%),
    radial-gradient(circle at 80% 20%, rgba(95, 99, 104, 0.1) 0%, transparent 50%),
    radial-gradient(circle at 40% 40%, rgba(198, 40, 40, 0.05) 0%, transparent 50%);
  pointer-events: none;
  z-index: 0;
}

.excel-container {
  padding: 0 !important;
  position: relative;
  z-index: 1;
}

/* Global overrides */
:deep(.v-navigation-drawer__content) {
  background: linear-gradient(180deg, #ffffff 0%, #f8fafc 50%, #f1f5f9 100%);
}

:deep(.v-list-item__prepend) {
  margin-inline-end: 16px;
}

:deep(.v-list-item__title) {
  font-size: 15px;
  font-weight: 600;
  letter-spacing: 0.3px;
}

:deep(.v-list-item__subtitle) {
  font-size: 13px;
  color: #64748b;
  font-weight: 500;
}

:deep(.v-app-bar) {
  backdrop-filter: blur(20px);
}

:deep(.v-btn) {
  text-transform: none !important;
  font-weight: 600 !important;
  letter-spacing: 0.3px !important;
}

/* Enhanced Animations */
@keyframes slideInFromLeft {
  from {
    transform: translateX(-30px);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.excel-nav-item {
  animation: slideInFromLeft 0.4s ease-out;
  animation-fill-mode: both;
}

.excel-nav-item:nth-child(1) { animation-delay: 0.05s; }
.excel-nav-item:nth-child(2) { animation-delay: 0.1s; }
.excel-nav-item:nth-child(3) { animation-delay: 0.15s; }
.excel-nav-item:nth-child(4) { animation-delay: 0.2s; }
.excel-nav-item:nth-child(5) { animation-delay: 0.25s; }
.excel-nav-item:nth-child(6) { animation-delay: 0.3s; }
.excel-nav-item:nth-child(7) { animation-delay: 0.35s; }
.excel-nav-item:nth-child(8) { animation-delay: 0.4s; }

/* Responsive Design */
@media (max-width: 768px) {
  .excel-app-title {
    font-size: 18px !important;
  }

  .excel-nav-list {
    padding: 12px 8px;
  }

  .excel-nav-item {
    margin-bottom: 6px !important;
    border-radius: 10px !important;
    padding: 10px 12px !important;
  }

  .excel-sidebar {
    box-shadow: 2px 0 12px rgba(0, 0, 0, 0.08) !important;
  }
}

@media (max-width: 480px) {
  .excel-app-title {
    font-size: 16px !important;
  }

  .excel-nav-list {
    padding: 10px 6px;
  }

  .excel-nav-item {
    padding: 8px 10px !important;
  }
}

/* Floating Action Button */
.excel-fab {
  position: fixed !important;
  bottom: 24px !important;
  right: 24px !important;
  z-index: 1000;
  background: linear-gradient(135deg, #B71C1C 0%, #C62828 100%) !important;
  box-shadow: 0 8px 25px rgba(183, 28, 28, 0.4) !important;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
}

.excel-fab:hover {
  transform: translateY(-4px) scale(1.05) !important;
  box-shadow: 0 12px 35px rgba(183, 28, 28, 0.6) !important;
}

/* Sports-themed scrollbar */
:deep(.v-navigation-drawer__content)::-webkit-scrollbar {
  width: 8px;
}

:deep(.v-navigation-drawer__content)::-webkit-scrollbar-track {
  background: #f1f5f9;
  border-radius: 4px;
  margin: 4px 0;
}

:deep(.v-navigation-drawer__content)::-webkit-scrollbar-thumb {
  background: linear-gradient(180deg, #B71C1C 0%, #C62828 100%);
  border-radius: 4px;
  border: 2px solid #f1f5f9;
}

:deep(.v-navigation-drawer__content)::-webkit-scrollbar-thumb:hover {
  background: linear-gradient(180deg, #C62828 0%, #D32F2F 100%);
  border-color: #e2e8f0;
}

/* Global Light Red Background */
:deep(.v-main) {
  background: linear-gradient(135deg, #FFFFFF 0%, #FFF5F5 25%, #FFF0F0 50%, #FFF5F5 75%, #FFFFFF 100%) !important;
  position: relative;
}

:deep(.v-main)::before {
  content: '';
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background:
    radial-gradient(circle at 20% 80%, rgba(239, 83, 80, 0.04) 0%, transparent 50%),
    radial-gradient(circle at 80% 20%, rgba(244, 67, 54, 0.03) 0%, transparent 50%),
    radial-gradient(circle at 40% 40%, rgba(239, 83, 80, 0.02) 0%, transparent 50%);
  pointer-events: none;
  z-index: 0;
}

:deep(.v-main)::after {
  content: '';
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-image:
    radial-gradient(circle at 2px 2px, rgba(239, 83, 80, 0.02) 1px, transparent 0);
  background-size: 30px 30px;
  pointer-events: none;
  z-index: 0;
}

/* Global Dialog Theme - Light Red & White */
:deep(.v-dialog .v-card) {
  background: linear-gradient(135deg, #FFFFFF 0%, #FFF8F8 50%, #FFFFFF 100%) !important;
  border: 1px solid rgba(239, 83, 80, 0.1) !important;
  box-shadow: 0 12px 48px rgba(183, 28, 28, 0.12) !important;
}

:deep(.v-dialog .v-card-title) {
  background: linear-gradient(135deg, #FFF5F5 0%, #FFEBEE 100%) !important;
  color: #B71C1C !important;
  border-bottom: 2px solid rgba(183, 28, 28, 0.1) !important;
  font-weight: 700 !important;
}

:deep(.v-dialog .v-card-text) {
  color: #1e293b !important;
}

:deep(.v-overlay) {
  background: rgba(183, 28, 28, 0.08) !important;
  backdrop-filter: blur(4px) !important;
}

/* Dialog Buttons */
:deep(.v-dialog .v-btn) {
  font-weight: 600 !important;
  text-transform: none !important;
  letter-spacing: 0.5px !important;
}

:deep(.v-dialog .v-btn.bg-primary),
:deep(.v-dialog .v-btn[color="primary"]) {
  background: linear-gradient(135deg, #B71C1C 0%, #D32F2F 100%) !important;
  box-shadow: 0 4px 12px rgba(183, 28, 28, 0.3) !important;
}

:deep(.v-dialog .v-btn.bg-primary):hover,
:deep(.v-dialog .v-btn[color="primary"]:hover) {
  box-shadow: 0 6px 16px rgba(183, 28, 28, 0.4) !important;
  transform: translateY(-2px);
}

/* Form Fields in Dialogs */
:deep(.v-dialog .v-text-field .v-field) {
  background: rgba(255, 255, 255, 0.8) !important;
  border: 1px solid rgba(239, 83, 80, 0.1) !important;
}

:deep(.v-dialog .v-text-field .v-field:focus-within) {
  border-color: #B71C1C !important;
  box-shadow: 0 0 0 3px rgba(183, 28, 28, 0.1) !important;
}

:deep(.v-dialog .v-select .v-field),
:deep(.v-dialog .v-textarea .v-field) {
  background: rgba(255, 255, 255, 0.8) !important;
  border: 1px solid rgba(239, 83, 80, 0.1) !important;
}

/* Dialog Close Button */
:deep(.v-dialog .v-btn--icon) {
  background: rgba(183, 28, 28, 0.05) !important;
}

:deep(.v-dialog .v-btn--icon):hover {
  background: rgba(183, 28, 28, 0.1) !important;
}

/* Snackbar Theme */
:deep(.v-snackbar .v-snackbar__wrapper) {
  background: linear-gradient(135deg, #FFFFFF 0%, #FFF8F8 100%) !important;
  border: 1px solid rgba(239, 83, 80, 0.2) !important;
  box-shadow: 0 8px 24px rgba(183, 28, 28, 0.15) !important;
  color: #1e293b !important;
}

:deep(.v-snackbar.v-snackbar--variant-flat) {
  background: transparent !important;
}

/* Menu Theme */
:deep(.v-menu .v-list) {
  background: linear-gradient(135deg, #FFFFFF 0%, #FFF8F8 100%) !important;
  border: 1px solid rgba(239, 83, 80, 0.1) !important;
  box-shadow: 0 8px 24px rgba(183, 28, 28, 0.12) !important;
}

:deep(.v-menu .v-list-item:hover) {
  background: rgba(183, 28, 28, 0.05) !important;
}

:deep(.v-menu .v-list-item--active) {
  background: rgba(183, 28, 28, 0.1) !important;
  color: #B71C1C !important;
}

/* Tooltip Theme */
:deep(.v-tooltip .v-overlay__content) {
  background: linear-gradient(135deg, #B71C1C 0%, #D32F2F 100%) !important;
  box-shadow: 0 4px 12px rgba(183, 28, 28, 0.3) !important;
}

/* Data Table Theme */
:deep(.v-data-table) {
  background: rgba(255, 255, 255, 0.95) !important;
  border: 1px solid rgba(239, 83, 80, 0.1) !important;
}

:deep(.v-data-table .v-data-table__thead) {
  background: linear-gradient(135deg, #FFF5F5 0%, #FFEBEE 100%) !important;
}

:deep(.v-data-table .v-data-table-header th) {
  color: #B71C1C !important;
  font-weight: 700 !important;
}

:deep(.v-data-table .v-data-table__tr:hover) {
  background: rgba(183, 28, 28, 0.03) !important;
}

/* Card Theme */
:deep(.v-card) {
  background: rgba(255, 255, 255, 0.95) !important;
  border: 1px solid rgba(239, 83, 80, 0.08) !important;
}

:deep(.v-card:hover) {
  border-color: rgba(239, 83, 80, 0.15) !important;
}

/* Chip Theme */
:deep(.v-chip) {
  font-weight: 600 !important;
}

:deep(.v-chip.bg-primary),
:deep(.v-chip[color="primary"]) {
  background: linear-gradient(135deg, #B71C1C 0%, #D32F2F 100%) !important;
}

/* Progress Circular/Linear Theme */
:deep(.v-progress-circular) {
  color: #B71C1C !important;
}

:deep(.v-progress-linear) {
  background: rgba(183, 28, 28, 0.1) !important;
}

:deep(.v-progress-linear .v-progress-linear__determinate) {
  background: linear-gradient(90deg, #B71C1C 0%, #D32F2F 100%) !important;
}

/* Divider Theme */
:deep(.v-divider) {
  border-color: rgba(239, 83, 80, 0.1) !important;
}

/* Badge Theme */
:deep(.v-badge .v-badge__badge) {
  background: linear-gradient(135deg, #B71C1C 0%, #D32F2F 100%) !important;
}
</style>
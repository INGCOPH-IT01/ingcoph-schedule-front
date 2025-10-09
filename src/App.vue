<template>
  <v-app>
    <v-navigation-drawer
      v-model="drawer"
      :rail="rail"
      permanent
      @click="rail = false"
      class="excel-sidebar"
    >
      <v-list-item
        :prepend-avatar="isAuthenticated ? `https://ui-avatars.com/api/?name=${user?.name}&background=3b82f6&color=fff` : 'https://ui-avatars.com/api/?name=Guest&background=6b7280&color=fff'"
        :title="isAuthenticated ? user?.name : 'Guest'"
        :subtitle="isAuthenticated ? user?.email : 'Please login'"
        nav
        class="excel-user-info"
      >
        <template v-slot:append>
          <v-btn
            variant="text"
            icon="mdi-chevron-left"
            @click.stop="rail = !rail"
            class="excel-rail-btn"
          ></v-btn>
        </template>
      </v-list-item>

      <v-divider class="excel-divider"></v-divider>

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

        <v-list-item
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

        <v-list-item
          v-if="isAuthenticated"
          prepend-icon="mdi-account-cog"
          title="My Profile"
          value="profile"
          :to="{ name: 'UserProfile' }"
          class="excel-nav-item"
        ></v-list-item>

        <v-list-item
          v-if="isAuthenticated && isAdmin"
          prepend-icon="mdi-shield-account"
          title="Admin Panel"
          value="admin"
          :to="{ name: 'AdminDashboard' }"
          class="excel-nav-item"
        ></v-list-item>

        <v-list-item
          v-if="isAuthenticated && isAdmin"
          prepend-icon="mdi-account-group"
          title="User Management"
          value="users"
          :to="{ name: 'UserManagement' }"
          class="excel-nav-item"
        ></v-list-item>

        <v-list-item
          v-if="isAuthenticated && (isStaff || isAdmin)"
          prepend-icon="mdi-qrcode-scan"
          title="Staff Scanner"
          value="staff"
          :to="{ name: 'StaffDashboard' }"
          class="excel-nav-item"
        ></v-list-item>
      </v-list>

      <template v-slot:append>
        <v-divider class="excel-divider"></v-divider>
        <div v-if="!isAuthenticated" class="excel-auth-section">
          <v-btn
            block
            variant="outlined"
            class="excel-auth-btn mb-2"
            :to="{ name: 'Login' }"
            prepend-icon="mdi-login"
          >
            Login
          </v-btn>
          <v-btn
            block
            variant="elevated"
            :to="{ name: 'Register' }"
            prepend-icon="mdi-account-plus"
            class="excel-auth-btn"
          >
            Register
          </v-btn>
        </div>
        <div v-else class="excel-auth-section">
          <v-btn
            block
            variant="outlined"
            color="error"
            @click="logout"
            prepend-icon="mdi-logout"
            class="excel-logout-btn"
          >
            Logout
          </v-btn>
        </div>
      </template>
    </v-navigation-drawer>

    <v-app-bar class="excel-app-bar">
      <v-app-bar-nav-icon @click="drawer = !drawer" class="excel-nav-icon"></v-app-bar-nav-icon>
      <v-toolbar-title class="excel-app-title">Multi-Sport Court Booking</v-toolbar-title>
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
      <!-- <v-btn icon class="excel-notification-btn">
        <v-icon>mdi-bell</v-icon>
      </v-btn>
      <v-btn icon class="excel-profile-btn">
        <v-icon>mdi-account-circle</v-icon>
      </v-btn> -->
    </v-app-bar>

    <v-main class="excel-main">
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
    <v-fab
      v-if="isAuthenticated"
      icon="mdi-calendar-plus"
      color="primary"
      size="large"
      location="bottom end"
      class="excel-fab"
      @click="openBookingDialog"
    ></v-fab>
  </v-app>
</template>

<script>
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { authService } from './services/authService'
import { cartService } from './services/cartService'
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
    const isAuthenticated = computed(() => !!user.value)
    const isAdmin = computed(() => user.value?.role === 'admin')
    const isStaff = computed(() => user.value?.role === 'staff')

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
      console.log('Booking created successfully')
    }

    const handleCheckoutComplete = () => {
      updateCartCount()
      console.log('Checkout completed successfully')
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

    onMounted(() => {
      updateCartCount()
      // Update cart count every 5 seconds
      setInterval(updateCartCount, 5000)
      checkAuth()
      
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
    })

    // Watch for route changes to ensure components re-initialize
    watch(() => route.path, (newPath, oldPath) => {
      console.log('Route changed from', oldPath, 'to', newPath)
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
      route,
      logout,
      openBookingDialog,
      closeBookingDialog,
      handleBookingCreated,
      handleCheckoutComplete,
      handleCourtsClick,
      handleBookingsClick
    }
  }
}
</script>

<style scoped>
/* Modern Sports Theme - Dynamic Athletic Design */
.excel-sidebar {
  background: linear-gradient(180deg, #0f172a 0%, #1e293b 50%, #334155 100%) !important;
  border-right: 1px solid #475569 !important;
  box-shadow: 4px 0 20px rgba(0, 0, 0, 0.15) !important;
}

.excel-user-info {
  background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%) !important;
  margin: 12px;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(10px);
}

.excel-rail-btn {
  color: #94a3b8 !important;
}

.excel-divider {
  border-color: #475569 !important;
  margin: 12px 0 !important;
}

.excel-nav-list {
  padding: 0 12px;
}

.excel-nav-item {
  border-radius: 10px !important;
  margin-bottom: 6px !important;
  color: #cbd5e1 !important;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
  position: relative;
  overflow: hidden;
}

.excel-nav-item::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1), transparent);
  transition: left 0.5s;
}

.excel-nav-item:hover::before {
  left: 100%;
}

.excel-nav-item:hover {
  background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%) !important;
  color: #ffffff !important;
  transform: translateX(4px);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
}

.excel-nav-item.v-list-item--active {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%) !important;
  color: #ffffff !important;
  font-weight: 600 !important;
  box-shadow: 0 4px 16px rgba(16, 185, 129, 0.4);
  transform: translateX(4px);
}

.excel-auth-section {
  padding: 12px;
}

.excel-auth-btn {
  font-size: 14px !important;
  text-transform: none !important;
  border-radius: 8px !important;
  font-weight: 600 !important;
  background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%) !important;
  color: white !important;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3) !important;
  transition: all 0.3s ease !important;
}

.excel-auth-btn:hover {
  transform: translateY(-2px) !important;
  box-shadow: 0 6px 20px rgba(59, 130, 246, 0.4) !important;
}

.excel-logout-btn {
  font-size: 14px !important;
  text-transform: none !important;
  border-radius: 8px !important;
  font-weight: 600 !important;
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%) !important;
  color: white !important;
  box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3) !important;
  transition: all 0.3s ease !important;
}

.excel-logout-btn:hover {
  transform: translateY(-2px) !important;
  box-shadow: 0 6px 20px rgba(239, 68, 68, 0.4) !important;
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
  background: linear-gradient(135deg, #1e293b 0%, #3b82f6 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  font-weight: 700 !important;
  font-size: 20px !important;
  letter-spacing: -0.5px;
}

.excel-notification-btn,
.excel-profile-btn {
  color: #64748b !important;
  transition: all 0.3s ease !important;
}

.excel-notification-btn:hover,
.excel-profile-btn:hover {
  color: #3b82f6 !important;
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
    radial-gradient(circle at 20% 80%, rgba(59, 130, 246, 0.1) 0%, transparent 50%),
    radial-gradient(circle at 80% 20%, rgba(16, 185, 129, 0.1) 0%, transparent 50%),
    radial-gradient(circle at 40% 40%, rgba(245, 158, 11, 0.05) 0%, transparent 50%);
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
  background: linear-gradient(180deg, #0f172a 0%, #1e293b 50%, #334155 100%);
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
  color: #94a3b8;
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
    transform: translateX(-100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
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

.excel-nav-item {
  animation: slideInFromLeft 0.6s ease-out;
}

.excel-user-info {
  animation: fadeInUp 0.8s ease-out;
}

/* Responsive Design */
@media (max-width: 768px) {
  .excel-app-title {
    font-size: 18px !important;
  }
  
  .excel-user-info {
    margin: 8px;
    border-radius: 10px;
  }
  
  .excel-auth-section {
    padding: 8px;
  }
  
  .excel-nav-item {
    margin-bottom: 4px !important;
    border-radius: 8px !important;
  }
  
  .excel-sidebar {
    box-shadow: 2px 0 15px rgba(0, 0, 0, 0.1) !important;
  }
}

@media (max-width: 480px) {
  .excel-app-title {
    font-size: 16px !important;
  }
  
  .excel-user-info {
    margin: 6px;
  }
  
  .excel-auth-section {
    padding: 6px;
  }
}

/* Floating Action Button */
.excel-fab {
  position: fixed !important;
  bottom: 24px !important;
  right: 24px !important;
  z-index: 1000;
  background: linear-gradient(135deg, #10b981 0%, #059669 100%) !important;
  box-shadow: 0 8px 25px rgba(16, 185, 129, 0.4) !important;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
}

.excel-fab:hover {
  transform: translateY(-4px) scale(1.05) !important;
  box-shadow: 0 12px 35px rgba(16, 185, 129, 0.6) !important;
}

/* Sports-themed scrollbar */
:deep(.v-navigation-drawer__content)::-webkit-scrollbar {
  width: 6px;
}

:deep(.v-navigation-drawer__content)::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 3px;
}

:deep(.v-navigation-drawer__content)::-webkit-scrollbar-thumb {
  background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
  border-radius: 3px;
}

:deep(.v-navigation-drawer__content)::-webkit-scrollbar-thumb:hover {
  background: linear-gradient(135deg, #1d4ed8 0%, #1e40af 100%);
}
</style>
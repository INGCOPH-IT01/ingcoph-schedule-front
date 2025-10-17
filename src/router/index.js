import { createRouter, createWebHashHistory } from 'vue-router'
import Home from '../views/Home.vue'
import Login from '../views/Login.vue'
import Register from '../views/Register.vue'
import Sports from '../views/Sports.vue'
import Courts from '../views/Courts.vue'
import Bookings from '../views/Bookings.vue'
import CourtDetails from '../views/CourtDetails.vue'
import AdminDashboard from '../views/AdminDashboard.vue'
import StaffDashboard from '../views/StaffDashboard.vue'
import UserManagement from '../views/UserManagement.vue'
import UserProfile from '../views/UserProfile.vue'
import SportsManagement from '../views/SportsManagement.vue'
import CompanySettings from '../views/CompanySettings.vue'
import PaymentSettings from '../views/PaymentSettings.vue'
import { authService } from '../services/authService'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home
  },
  {
    path: '/login',
    name: 'Login',
    component: Login
  },
  {
    path: '/register',
    name: 'Register',
    component: Register
  },
  {
    path: '/sports',
    name: 'Sports',
    component: Sports
  },
  {
    path: '/courts',
    name: 'Courts',
    component: Courts,
    beforeEnter: async (to, from, next) => {
      try {
        const user = await authService.getCurrentUser()
        // Only staff and admin can access courts listing
        if (user && (user.role === 'staff' || user.role === 'admin')) {
          next()
        } else {
          next('/sports')
        }
      } catch (error) {
        next('/sports')
      }
    }
  },
  {
    path: '/courts/:id',
    name: 'CourtDetails',
    component: CourtDetails,
    props: true,
    beforeEnter: async (to, from, next) => {
      try {
        const user = await authService.getCurrentUser()
        // Only staff and admin can access court details
        if (user && (user.role === 'staff' || user.role === 'admin')) {
          next()
        } else {
          next('/sports')
        }
      } catch (error) {
        next('/sports')
      }
    }
  },
  {
    path: '/bookings',
    name: 'Bookings',
    component: Bookings,
    beforeEnter: async (to, from, next) => {
      try {
        const isAuthenticated = localStorage.getItem('token')
        if (isAuthenticated) {
          next()
        } else {
          next('/login')
        }
      } catch (error) {
        next('/login')
      }
    }
  },
  {
    path: '/profile',
    name: 'UserProfile',
    component: UserProfile,
    beforeEnter: async (to, from, next) => {
      try {
        const isAuthenticated = localStorage.getItem('token')
        if (isAuthenticated) {
          next()
        } else {
          next('/login')
        }
      } catch (error) {
        next('/login')
      }
    }
  },
  {
    path: '/admin',
    name: 'AdminDashboard',
    component: AdminDashboard,
    beforeEnter: async (to, from, next) => {
      try {
        const isAdmin = await authService.isAdmin()
        if (isAdmin) {
          next()
        } else {
          next('/')
        }
      } catch (error) {
        next('/')
      }
    }
  },
  {
    path: '/staff',
    name: 'StaffDashboard',
    component: StaffDashboard,
    beforeEnter: async (to, from, next) => {
      try {
        const user = await authService.getCurrentUser()
        if (user && (user.role === 'staff' || user.role === 'admin')) {
          next()
        } else {
          next('/')
        }
      } catch (error) {
        next('/')
      }
    }
  },
  {
    path: '/admin/users',
    name: 'UserManagement',
    component: UserManagement,
    beforeEnter: async (to, from, next) => {
      try {
        const isAdmin = await authService.isAdmin()
        if (isAdmin) {
          next()
        } else {
          next('/')
        }
      } catch (error) {
        next('/')
      }
    }
  },
  {
    path: '/admin/sports',
    name: 'SportsManagement',
    component: SportsManagement,
    beforeEnter: async (to, from, next) => {
      try {
        const isAdmin = await authService.isAdmin()
        if (isAdmin) {
          next()
        } else {
          next('/')
        }
      } catch (error) {
        next('/')
      }
    }
  },
  {
    path: '/admin/company-settings',
    name: 'CompanySettings',
    component: CompanySettings,
    beforeEnter: async (to, from, next) => {
      try {
        const isAdmin = await authService.isAdmin()
        if (isAdmin) {
          next()
        } else {
          next('/')
        }
      } catch (error) {
        next('/')
      }
    }
  },
  {
    path: '/admin/payment-settings',
    name: 'PaymentSettings',
    component: PaymentSettings,
    beforeEnter: async (to, from, next) => {
      try {
        const isAdmin = await authService.isAdmin()
        if (isAdmin) {
          next()
        } else {
          next('/')
        }
      } catch (error) {
        next('/')
      }
    }
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    redirect: '/'
  }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

export default router

import { createRouter, createWebHashHistory } from 'vue-router'
import { authService } from '../services/authService'

// Lazy load all route components for better initial bundle size
const routes = [
  {
    path: '/',
    name: 'Home',
    component: () => import('../views/Home.vue')
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('../views/Login.vue')
  },
  {
    path: '/register',
    name: 'Register',
    component: () => import('../views/Register.vue')
  },
  {
    path: '/sports',
    name: 'Sports',
    component: () => import('../views/Sports.vue')
  },
  {
    path: '/courts',
    name: 'Courts',
    component: () => import('../views/Courts.vue'),
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
    component: () => import('../views/CourtDetails.vue'),
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
    component: () => import(/* webpackChunkName: "bookings" */ '../views/Bookings.vue'),
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
    component: () => import('../views/UserProfile.vue'),
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
    component: () => import(/* webpackChunkName: "admin" */ '../views/AdminDashboard.vue'),
    beforeEnter: async (to, from, next) => {
      try {
        const user = await authService.getCurrentUser()
        // Allow both admin and staff to access admin dashboard
        if (user && (user.role === 'admin' || user.role === 'staff')) {
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
    component: () => import(/* webpackChunkName: "staff" */ '../views/StaffDashboard.vue'),
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
    component: () => import(/* webpackChunkName: "admin" */ '../views/UserManagement.vue'),
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
    component: () => import(/* webpackChunkName: "admin" */ '../views/SportsManagement.vue'),
    beforeEnter: async (to, from, next) => {
      try {
        const user = await authService.getCurrentUser()
        // Allow both admin and staff to access sports management
        if (user && (user.role === 'admin' || user.role === 'staff')) {
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
    component: () => import(/* webpackChunkName: "admin" */ '../views/CompanySettings.vue'),
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
    component: () => import(/* webpackChunkName: "admin" */ '../views/PaymentSettings.vue'),
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
    path: '/admin/holidays',
    name: 'HolidayManagement',
    component: () => import(/* webpackChunkName: "admin" */ '../views/HolidayManagement.vue'),
    beforeEnter: async (to, from, next) => {
      try {
        const user = await authService.getCurrentUser()
        // Allow both admin and staff to access holiday management
        if (user && (user.role === 'admin' || user.role === 'staff')) {
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

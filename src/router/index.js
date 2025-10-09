import { createRouter, createWebHashHistory } from 'vue-router'
import Home from '../views/Home.vue'
import Login from '../views/Login.vue'
import Register from '../views/Register.vue'
import Sports from '../views/Sports.vue'
import Courts from '../views/Courts.vue'
import Bookings from '../views/Bookings.vue'
import CourtDetail from '../views/CourtDetail.vue'
import AdminDashboard from '../views/AdminDashboard.vue'
import StaffDashboard from '../views/StaffDashboard.vue'
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
    component: Courts
  },
  {
    path: '/courts/:id',
    name: 'CourtDetail',
    component: CourtDetail,
    props: true
  },
  {
    path: '/bookings',
    name: 'Bookings',
    component: Bookings
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
  }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

export default router

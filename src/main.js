import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import vuetify from './plugins/vuetify'
import './style.css'
import { initializeEcho } from './services/echo'
import { startVersionCheck } from './utils/versionCheck'
import 'vue-virtual-scroller/dist/vue-virtual-scroller.css'

const app = createApp(App)

// Use plugins
app.use(router)
app.use(vuetify)

// Initialize Echo when user is authenticated
router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('token')
  if (token && to.path !== '/login') {
    // Initialize Echo for authenticated routes
    initializeEcho()
  }
  next()
})

// Mount the app
app.mount('#app')

// Start version checking (checks every 5 minutes)
// This will notify users when a new version is deployed
if (import.meta.env.PROD) {
  startVersionCheck(1) // Check every 1 minute in production
}

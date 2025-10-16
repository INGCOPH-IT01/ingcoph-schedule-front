import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import vuetify from './plugins/vuetify'
import './style.css'
import { initializeEcho } from './services/echo'

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

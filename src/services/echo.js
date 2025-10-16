import Echo from 'laravel-echo'
import Pusher from 'pusher-js'

// Make Pusher available globally for Laravel Echo
window.Pusher = Pusher

let echo = null

export const initializeEcho = () => {
  if (echo) {
    return echo
  }

  const token = localStorage.getItem('token')
  
  if (!token) {
    console.warn('No auth token found, Echo not initialized')
    return null
  }

  echo = new Echo({
    broadcaster: 'reverb',
    key: import.meta.env.VITE_REVERB_APP_KEY || 'your-app-key',
    wsHost: import.meta.env.VITE_REVERB_HOST || 'bschedule.m4d8q2.com',
    wsPort: import.meta.env.VITE_REVERB_PORT || 443,
    wssPort: import.meta.env.VITE_REVERB_PORT || 443,
    forceTLS: (import.meta.env.VITE_REVERB_SCHEME || 'https') === 'https',
    enabledTransports: ['ws', 'wss'],
    authEndpoint: 'http://192.168.10.57:8010/api/broadcasting/auth',
    auth: {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/json',
      },
    },
  })

  console.log('Echo initialized with config:', {
    wsHost: import.meta.env.VITE_REVERB_HOST || 'bschedule.m4d8q2.com',
    wsPort: import.meta.env.VITE_REVERB_PORT || 443,
    forceTLS: (import.meta.env.VITE_REVERB_SCHEME || 'https') === 'https',
  })

  return echo
}

export const getEcho = () => {
  if (!echo) {
    return initializeEcho()
  }
  return echo
}

export const disconnectEcho = () => {
  if (echo) {
    echo.disconnect()
    echo = null
    console.log('Echo disconnected')
  }
}

export const reconnectEcho = () => {
  disconnectEcho()
  return initializeEcho()
}

export default {
  initializeEcho,
  getEcho,
  disconnectEcho,
  reconnectEcho,
}


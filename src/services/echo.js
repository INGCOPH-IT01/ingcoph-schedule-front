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
    return null
  }

  // Get configuration from environment variables with proper fallbacks
  const reverbKey = import.meta.env.VITE_REVERB_APP_KEY || 'kx677b9udp95kpffwpcg'
  const reverbHost = import.meta.env.VITE_REVERB_HOST || 'localhost'
  const reverbPort = parseInt(import.meta.env.VITE_REVERB_PORT || '8080')
  const reverbScheme = import.meta.env.VITE_REVERB_SCHEME || 'http'
  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8010'

  const useTLS = reverbScheme === 'https'

  console.log('Initializing Echo with config:', {
    broadcaster: 'reverb',
    key: reverbKey,
    wsHost: reverbHost,
    wsPort: reverbPort,
    wssPort: reverbPort,
    forceTLS: useTLS,
    authEndpoint: `${apiBaseUrl}/api/broadcasting/auth`
  })

  echo = new Echo({
    broadcaster: 'reverb',
    key: reverbKey,
    wsHost: reverbHost,
    wsPort: reverbPort,
    wssPort: reverbPort,
    forceTLS: useTLS,
    enabledTransports: ['ws', 'wss'],
    authEndpoint: `${apiBaseUrl}/api/broadcasting/auth`,
    auth: {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/json',
      },
    },
  })

  // Log connection events for debugging
  echo.connector.pusher.connection.bind('connected', () => {
    console.log('✅ Reverb: Connected successfully')
  })

  echo.connector.pusher.connection.bind('disconnected', () => {
    console.log('⚠️ Reverb: Disconnected')
  })

  echo.connector.pusher.connection.bind('error', (err) => {
    console.error('❌ Reverb: Connection error', err)
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

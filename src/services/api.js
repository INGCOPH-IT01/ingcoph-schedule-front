import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_URL + '/api'

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  },
  // 30-second timeout — gives mobile connections room to breathe while
  // still surfacing real failures (network drop, server error, etc.)
  timeout: 30000
})

// Request interceptor: attach auth token and handle FormData
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }

    // Let the browser set the correct Content-Type (with boundary) for multipart
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type']
    }

    return config
  },
  (error) => Promise.reject(error)
)

// Response interceptor: handle 401 and add retry logic for transient errors
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const config = error.config

    // 401 — clear session and redirect to login
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      if (window.location.pathname !== '/login') {
        window.location.href = '/login'
      }
      return Promise.reject(error)
    }

    // Retry on network errors or 5xx responses — common on mobile (connection drops,
    // brief offline moments, server blips). Do NOT retry POST /cart/checkout to avoid
    // duplicate bookings; do not retry if already retried.
    const isCheckout = config?.url?.includes('/cart/checkout')
    const isRetriable =
      !isCheckout &&
      !config?._retried &&
      (
        !error.response ||                            // network error / timeout
        error.response.status === 502 ||
        error.response.status === 503 ||
        error.response.status === 504 ||
        error.code === 'ECONNABORTED'                 // axios timeout
      )

    if (isRetriable) {
      config._retried = true
      // Wait 2 seconds before retrying (gives the connection a moment to stabilise)
      await new Promise(resolve => setTimeout(resolve, 2000))
      return api(config)
    }

    return Promise.reject(error)
  }
)

export default api

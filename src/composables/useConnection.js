/**
 * Connection-Aware Composable
 *
 * Detects network connection quality and allows adaptive behavior
 * based on connection speed (2G, 3G, 4G, etc.)
 */

import { ref, computed, onMounted, onUnmounted } from 'vue'

export function useConnection() {
  const isOnline = ref(navigator.onLine)
  const connectionType = ref('unknown')
  const effectiveType = ref('4g')
  const downlink = ref(10) // Mbps
  const rtt = ref(50) // Round-trip time in ms
  const saveData = ref(false)

  // Update connection info
  const updateConnectionInfo = () => {
    const connection = navigator.connection ||
                      navigator.mozConnection ||
                      navigator.webkitConnection

    if (connection) {
      effectiveType.value = connection.effectiveType || '4g'
      downlink.value = connection.downlink || 10
      rtt.value = connection.rtt || 50
      saveData.value = connection.saveData || false

      if (connection.type) {
        connectionType.value = connection.type
      }
    }
  }

  // Connection quality levels
  const connectionQuality = computed(() => {
    if (!isOnline.value) return 'offline'

    // Check for slow connection indicators
    if (saveData.value) return 'slow'

    switch (effectiveType.value) {
      case 'slow-2g':
      case '2g':
        return 'slow'
      case '3g':
        return 'medium'
      case '4g':
      case '5g':
        return 'fast'
      default:
        // Fallback to RTT and downlink
        if (rtt.value > 300 || downlink.value < 1) return 'slow'
        if (rtt.value > 150 || downlink.value < 5) return 'medium'
        return 'fast'
    }
  })

  // Computed flags for easy checks
  const isSlowConnection = computed(() => connectionQuality.value === 'slow')
  const isMediumConnection = computed(() => connectionQuality.value === 'medium')
  const isFastConnection = computed(() => connectionQuality.value === 'fast')
  const isOffline = computed(() => !isOnline.value)

  // Adaptive features based on connection
  const shouldReduceQuality = computed(() => {
    return isSlowConnection.value || saveData.value
  })

  const shouldDisableAnimations = computed(() => {
    return isSlowConnection.value || saveData.value
  })

  const shouldLazyLoadImages = computed(() => {
    return isSlowConnection.value || isMediumConnection.value
  })

  const pollingInterval = computed(() => {
    // Adjust polling frequency based on connection
    if (isOffline.value) return null // Don't poll when offline
    if (isSlowConnection.value) return 120000 // 2 minutes
    if (isMediumConnection.value) return 60000 // 1 minute
    return 30000 // 30 seconds for fast connections
  })

  const maxImageSize = computed(() => {
    // Suggested max image dimensions based on connection
    if (isSlowConnection.value) return { width: 480, height: 360 }
    if (isMediumConnection.value) return { width: 720, height: 540 }
    return { width: 1920, height: 1080 }
  })

  // Event handlers
  const handleOnline = () => {
    isOnline.value = true
    updateConnectionInfo()
  }

  const handleOffline = () => {
    isOnline.value = false
  }

  const handleConnectionChange = () => {
    updateConnectionInfo()
  }

  // Setup event listeners
  onMounted(() => {
    updateConnectionInfo()

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    const connection = navigator.connection ||
                      navigator.mozConnection ||
                      navigator.webkitConnection

    if (connection) {
      connection.addEventListener('change', handleConnectionChange)
    }
  })

  // Cleanup event listeners
  onUnmounted(() => {
    window.removeEventListener('online', handleOnline)
    window.removeEventListener('offline', handleOffline)

    const connection = navigator.connection ||
                      navigator.mozConnection ||
                      navigator.webkitConnection

    if (connection) {
      connection.removeEventListener('change', handleConnectionChange)
    }
  })

  return {
    // Connection state
    isOnline,
    isOffline,
    connectionType,
    effectiveType,
    downlink,
    rtt,
    saveData,

    // Connection quality
    connectionQuality,
    isSlowConnection,
    isMediumConnection,
    isFastConnection,

    // Adaptive recommendations
    shouldReduceQuality,
    shouldDisableAnimations,
    shouldLazyLoadImages,
    pollingInterval,
    maxImageSize,

    // Methods
    updateConnectionInfo
  }
}

/**
 * Standalone function to check if user has slow connection
 * Useful for one-time checks without composable setup
 */
export function hasSlowConnection() {
  const connection = navigator.connection ||
                    navigator.mozConnection ||
                    navigator.webkitConnection

  if (!connection) return false

  const effectiveType = connection.effectiveType
  const saveData = connection.saveData
  const rtt = connection.rtt || 0

  if (saveData) return true
  if (effectiveType === 'slow-2g' || effectiveType === '2g') return true
  if (rtt > 300) return true

  return false
}

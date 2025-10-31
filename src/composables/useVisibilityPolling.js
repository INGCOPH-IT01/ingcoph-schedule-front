/**
 * Smart Polling Composable
 * Only polls when the browser tab is visible
 * Automatically pauses when tab is hidden
 */
import { ref, onMounted, onUnmounted } from 'vue'

export function useVisibilityPolling(callback, interval = 60000) {
  const isPolling = ref(false)
  let intervalId = null

  const startPolling = () => {
    if (isPolling.value || document.hidden) return

    isPolling.value = true

    // Execute immediately
    callback()

    // Then set up interval
    intervalId = setInterval(() => {
      if (!document.hidden) {
        callback()
      }
    }, interval)
  }

  const stopPolling = () => {
    if (intervalId) {
      clearInterval(intervalId)
      intervalId = null
    }
    isPolling.value = false
  }

  const handleVisibilityChange = () => {
    if (document.hidden) {
      stopPolling()
    } else {
      startPolling()
    }
  }

  onMounted(() => {
    document.addEventListener('visibilitychange', handleVisibilityChange)
    startPolling()
  })

  onUnmounted(() => {
    document.removeEventListener('visibilitychange', handleVisibilityChange)
    stopPolling()
  })

  return {
    isPolling,
    startPolling,
    stopPolling,
  }
}

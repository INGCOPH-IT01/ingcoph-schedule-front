/**
 * Event Bus Composable
 * Provides a clean way to manage window events with automatic cleanup
 */
import { onUnmounted } from 'vue'

export function useEventBus() {
  const listeners = []

  /**
   * Register an event listener
   * @param {string} event - Event name
   * @param {Function} handler - Event handler function
   * @param {Object} options - Event listener options
   */
  const on = (event, handler, options = {}) => {
    window.addEventListener(event, handler, options)
    listeners.push({ event, handler, options })
  }

  /**
   * Emit a custom event
   * @param {string} event - Event name
   * @param {*} detail - Event detail data
   */
  const emit = (event, detail = null) => {
    const customEvent = new CustomEvent(event, { detail })
    window.dispatchEvent(customEvent)
  }

  /**
   * Remove a specific event listener
   * @param {string} event - Event name
   * @param {Function} handler - Event handler function
   */
  const off = (event, handler) => {
    window.removeEventListener(event, handler)
    const index = listeners.findIndex(
      (listener) => listener.event === event && listener.handler === handler
    )
    if (index > -1) {
      listeners.splice(index, 1)
    }
  }

  /**
   * Register a one-time event listener
   * @param {string} event - Event name
   * @param {Function} handler - Event handler function
   */
  const once = (event, handler) => {
    const wrappedHandler = (e) => {
      handler(e)
      off(event, wrappedHandler)
    }
    on(event, wrappedHandler)
  }

  // Automatic cleanup on component unmount
  onUnmounted(() => {
    listeners.forEach(({ event, handler, options }) => {
      window.removeEventListener(event, handler, options)
    })
    listeners.length = 0
  })

  return {
    on,
    emit,
    off,
    once,
  }
}

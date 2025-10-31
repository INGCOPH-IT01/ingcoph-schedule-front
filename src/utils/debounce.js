/**
 * Creates a debounced function that delays invoking func until after wait milliseconds
 * have elapsed since the last time the debounced function was invoked.
 *
 * @param {Function} func - The function to debounce
 * @param {number} wait - The number of milliseconds to delay
 * @returns {Function} - The debounced function
 */
export function debounce(func, wait = 300) {
  let timeoutId = null

  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeoutId)
      func(...args)
    }

    clearTimeout(timeoutId)
    timeoutId = setTimeout(later, wait)
  }
}

/**
 * Creates a throttled function that only invokes func at most once per every wait milliseconds.
 *
 * @param {Function} func - The function to throttle
 * @param {number} wait - The number of milliseconds to throttle
 * @returns {Function} - The throttled function
 */
export function throttle(func, wait = 300) {
  let inThrottle = false
  let lastFunc = null
  let lastRan = null

  return function executedFunction(...args) {
    if (!inThrottle) {
      func(...args)
      lastRan = Date.now()
      inThrottle = true

      setTimeout(() => {
        inThrottle = false
        if (lastFunc) {
          lastFunc()
          lastFunc = null
        }
      }, wait)
    } else {
      lastFunc = () => func(...args)
    }
  }
}

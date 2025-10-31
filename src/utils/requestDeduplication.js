/**
 * Request Deduplication Utility
 *
 * Prevents duplicate API calls from being made simultaneously.
 * If multiple components request the same data at the same time,
 * only one API call is made and all requests share the result.
 */

const pendingRequests = new Map()

/**
 * Wraps an async function to deduplicate simultaneous calls
 * @param {string} key - Unique identifier for the request
 * @param {Function} fn - Async function to execute
 * @returns {Promise} - Shared promise for all simultaneous calls
 */
export function deduplicateRequest(key, fn) {
  // If there's already a pending request for this key, return it
  if (pendingRequests.has(key)) {
    return pendingRequests.get(key)
  }

  // Create a new request promise
  const promise = fn()
    .then(result => {
      // Clean up the pending request after success
      pendingRequests.delete(key)
      return result
    })
    .catch(error => {
      // Clean up the pending request after error
      pendingRequests.delete(key)
      throw error
    })

  // Store the pending request
  pendingRequests.set(key, promise)

  return promise
}

/**
 * Creates a deduplicated version of an API service method
 * @param {Function} fn - The service method to wrap
 * @param {Function} keyGenerator - Function to generate a unique key from arguments
 * @returns {Function} - Wrapped function with deduplication
 */
export function createDeduplicated(fn, keyGenerator = (...args) => JSON.stringify(args)) {
  return function(...args) {
    const key = keyGenerator(...args)
    return deduplicateRequest(key, () => fn.apply(this, args))
  }
}

/**
 * Clear all pending requests (useful for cleanup or testing)
 */
export function clearPendingRequests() {
  pendingRequests.clear()
}

/**
 * Get count of pending requests (useful for debugging)
 */
export function getPendingRequestCount() {
  return pendingRequests.size
}

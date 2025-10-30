/**
 * Simple API response caching utility
 * Caches API responses with TTL (Time To Live)
 */
class ApiCache {
  constructor() {
    this.cache = new Map()
    this.timestamps = new Map()
  }

  /**
   * Set a cached value with optional TTL
   * @param {string} key - Cache key
   * @param {*} value - Value to cache
   * @param {number} ttl - Time to live in milliseconds (default 5 minutes)
   */
  set(key, value, ttl = 300000) {
    this.cache.set(key, value)
    this.timestamps.set(key, Date.now() + ttl)
  }

  /**
   * Get a cached value
   * @param {string} key - Cache key
   * @returns {*} - Cached value or null if expired/not found
   */
  get(key) {
    const timestamp = this.timestamps.get(key)

    // Check if cache exists and is not expired
    if (!timestamp || Date.now() > timestamp) {
      this.delete(key)
      return null
    }

    return this.cache.get(key)
  }

  /**
   * Check if a key exists and is not expired
   * @param {string} key - Cache key
   * @returns {boolean}
   */
  has(key) {
    return this.get(key) !== null
  }

  /**
   * Delete a cached value
   * @param {string} key - Cache key
   */
  delete(key) {
    this.cache.delete(key)
    this.timestamps.delete(key)
  }

  /**
   * Clear all cached values
   */
  clear() {
    this.cache.clear()
    this.timestamps.clear()
  }

  /**
   * Get cache size
   * @returns {number} - Number of cached items
   */
  size() {
    // Clean up expired items first
    for (const [key, timestamp] of this.timestamps.entries()) {
      if (Date.now() > timestamp) {
        this.delete(key)
      }
    }
    return this.cache.size
  }

  /**
   * Get all cache keys
   * @returns {Array<string>}
   */
  keys() {
    return Array.from(this.cache.keys())
  }
}

// Singleton instance
export const apiCache = new ApiCache()

// Export class for testing or multiple instances
export default ApiCache

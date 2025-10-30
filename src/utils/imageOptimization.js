/**
 * Image Optimization Utilities
 *
 * Provides helpers for optimized image loading including:
 * - WebP format detection and fallback
 * - Responsive image srcset generation
 * - Lazy loading helpers
 * - Image preloading
 */

/**
 * Check if browser supports WebP format
 */
let webpSupport = null

export async function checkWebPSupport() {
  if (webpSupport !== null) return webpSupport

  return new Promise((resolve) => {
    const img = new Image()
    img.onload = () => {
      webpSupport = img.width > 0 && img.height > 0
      resolve(webpSupport)
    }
    img.onerror = () => {
      webpSupport = false
      resolve(false)
    }
    img.src = 'data:image/webp;base64,UklGRhoAAABXRUJQVlA4TA0AAAAvAAAAEAcQERGIiP4HAA=='
  })
}

/**
 * Get optimized image URL with WebP support
 * @param {string} url - Original image URL
 * @param {boolean} useWebP - Force WebP usage (if supported)
 * @returns {string} - Optimized image URL
 */
export function getOptimizedImageUrl(url, useWebP = true) {
  if (!url) return url

  // If WebP is supported and enabled, try to get WebP version
  if (useWebP && webpSupport && !url.endsWith('.webp')) {
    // Check if the URL already has WebP parameter
    if (url.includes('?')) {
      return `${url}&format=webp`
    } else {
      return `${url}?format=webp`
    }
  }

  return url
}

/**
 * Generate srcset for responsive images
 * @param {string} baseUrl - Base image URL
 * @param {Array} widths - Array of widths to generate [480, 768, 1024, 1920]
 * @returns {string} - Srcset string
 */
export function generateSrcSet(baseUrl, widths = [480, 768, 1024, 1920]) {
  if (!baseUrl) return ''

  return widths
    .map(width => {
      const url = baseUrl.includes('?')
        ? `${baseUrl}&w=${width}`
        : `${baseUrl}?w=${width}`
      return `${url} ${width}w`
    })
    .join(', ')
}

/**
 * Preload an image
 * @param {string} url - Image URL to preload
 * @returns {Promise} - Resolves when image is loaded
 */
export function preloadImage(url) {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = reject
    img.src = url
  })
}

/**
 * Preload multiple images
 * @param {Array<string>} urls - Array of image URLs
 * @returns {Promise<Array>} - Resolves when all images are loaded
 */
export function preloadImages(urls) {
  return Promise.all(urls.map(url => preloadImage(url)))
}

/**
 * Get image dimensions without loading the full image
 * @param {string} url - Image URL
 * @returns {Promise<{width: number, height: number}>}
 */
export function getImageDimensions(url) {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => {
      resolve({ width: img.width, height: img.height })
    }
    img.onerror = reject
    img.src = url
  })
}

/**
 * Create a low-quality image placeholder (LQIP) data URL
 * @param {string} url - Original image URL
 * @param {number} width - Placeholder width (default: 40px)
 * @returns {Promise<string>} - Data URL of placeholder
 */
export async function createLQIP(url, width = 40) {
  try {
    const img = await preloadImage(url)
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')

    // Calculate proportional height
    const aspectRatio = img.height / img.width
    const height = Math.round(width * aspectRatio)

    canvas.width = width
    canvas.height = height

    // Draw and blur the image
    ctx.filter = 'blur(10px)'
    ctx.drawImage(img, 0, 0, width, height)

    return canvas.toDataURL('image/jpeg', 0.5)
  } catch (error) {
    console.warn('Failed to create LQIP:', error)
    return ''
  }
}

/**
 * Lazy load image with Intersection Observer
 * @param {HTMLImageElement} imgElement - Image element
 * @param {string} src - Image source URL
 * @param {Object} options - Intersection Observer options
 */
export function lazyLoadImage(imgElement, src, options = {}) {
  const defaultOptions = {
    root: null,
    rootMargin: '50px',
    threshold: 0.01,
    ...options
  }

  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const img = entry.target
        img.src = src

        img.onload = () => {
          img.classList.add('loaded')
        }

        obs.unobserve(img)
      }
    })
  }, defaultOptions)

  observer.observe(imgElement)

  return observer
}

/**
 * Convert image URL to WebP if supported
 * Useful for user-uploaded images
 * @param {string} url - Original image URL
 * @returns {string} - WebP URL or original
 */
export function toWebP(url) {
  if (!url || !webpSupport) return url

  // Don't convert if already WebP
  if (url.endsWith('.webp')) return url

  // Try common image CDN patterns
  const patterns = [
    { test: /\.(jpg|jpeg|png)$/, replace: '.webp' },
    { test: /\.(jpg|jpeg|png)\?/, replace: '.webp?' },
  ]

  for (const pattern of patterns) {
    if (pattern.test.test(url)) {
      return url.replace(pattern.test, pattern.replace)
    }
  }

  // Fallback: add format parameter
  return getOptimizedImageUrl(url, true)
}

/**
 * Vue directive for lazy loading images
 * Usage: v-lazy-img="imageUrl"
 */
export const vLazyImg = {
  mounted(el, binding) {
    const src = binding.value

    if (!src) return

    // Set placeholder if provided
    if (binding.modifiers.placeholder) {
      el.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300"%3E%3Crect width="400" height="300" fill="%23f0f0f0"/%3E%3C/svg%3E'
    }

    lazyLoadImage(el, src, binding.arg ? JSON.parse(binding.arg) : {})
  }
}

/**
 * Initialize WebP support check on module load
 */
checkWebPSupport()

export default {
  checkWebPSupport,
  getOptimizedImageUrl,
  generateSrcSet,
  preloadImage,
  preloadImages,
  getImageDimensions,
  createLQIP,
  lazyLoadImage,
  toWebP,
  vLazyImg
}

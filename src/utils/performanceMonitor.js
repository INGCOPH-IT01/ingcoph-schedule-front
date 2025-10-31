/**
 * Performance Monitoring Utility
 *
 * Lightweight performance tracking without external dependencies.
 * Tracks key metrics like page load, API calls, and user interactions.
 */

class PerformanceMonitor {
  constructor() {
    this.metrics = []
    this.marks = new Map()
    this.observers = []
    this.enabled = true
  }

  /**
   * Start a performance measurement
   */
  mark(name) {
    if (!this.enabled) return

    try {
      const markName = `${name}_start`
      performance.mark(markName)
      this.marks.set(name, markName)
    } catch (error) {
      console.warn('Performance mark failed:', error)
    }
  }

  /**
   * End a performance measurement and calculate duration
   */
  measure(name, details = {}) {
    if (!this.enabled) return null

    try {
      const markName = this.marks.get(name)
      if (!markName) {
        console.warn(`No start mark found for: ${name}`)
        return null
      }

      const measureName = `${name}_measure`
      performance.measure(measureName, markName)

      const measure = performance.getEntriesByName(measureName)[0]
      const metric = {
        name,
        duration: measure.duration,
        timestamp: Date.now(),
        ...details
      }

      this.metrics.push(metric)

      // Clean up
      performance.clearMarks(markName)
      performance.clearMeasures(measureName)
      this.marks.delete(name)

      return metric
    } catch (error) {
      console.warn('Performance measure failed:', error)
      return null
    }
  }

  /**
   * Track an API call
   */
  trackApiCall(endpoint, method, duration, status) {
    const metric = {
      type: 'api_call',
      endpoint,
      method,
      duration,
      status,
      timestamp: Date.now()
    }

    this.metrics.push(metric)
    return metric
  }

  /**
   * Track a route change
   */
  trackRouteChange(from, to, duration) {
    const metric = {
      type: 'route_change',
      from,
      to,
      duration,
      timestamp: Date.now()
    }

    this.metrics.push(metric)
    return metric
  }

  /**
   * Track component render time
   */
  trackComponentRender(componentName, duration) {
    const metric = {
      type: 'component_render',
      component: componentName,
      duration,
      timestamp: Date.now()
    }

    this.metrics.push(metric)
    return metric
  }

  /**
   * Get Web Vitals (simplified version)
   */
  getWebVitals() {
    const vitals = {
      fcp: null,  // First Contentful Paint
      lcp: null,  // Largest Contentful Paint
      fid: null,  // First Input Delay
      cls: null,  // Cumulative Layout Shift
      ttfb: null  // Time to First Byte
    }

    try {
      // Get navigation timing
      const navigation = performance.getEntriesByType('navigation')[0]
      if (navigation) {
        vitals.ttfb = navigation.responseStart - navigation.requestStart
      }

      // Get paint timing
      const paintEntries = performance.getEntriesByType('paint')
      paintEntries.forEach(entry => {
        if (entry.name === 'first-contentful-paint') {
          vitals.fcp = entry.startTime
        }
      })

      // Get LCP (requires PerformanceObserver)
      const lcpEntries = performance.getEntriesByType('largest-contentful-paint')
      if (lcpEntries.length > 0) {
        vitals.lcp = lcpEntries[lcpEntries.length - 1].startTime
      }

      // Get CLS
      const clsEntries = performance.getEntriesByType('layout-shift')
      let clsScore = 0
      clsEntries.forEach(entry => {
        if (!entry.hadRecentInput) {
          clsScore += entry.value
        }
      })
      vitals.cls = clsScore

    } catch (error) {
      console.warn('Error getting Web Vitals:', error)
    }

    return vitals
  }

  /**
   * Get all metrics
   */
  getMetrics(type = null) {
    if (type) {
      return this.metrics.filter(m => m.type === type)
    }
    return [...this.metrics]
  }

  /**
   * Get metrics summary
   */
  getSummary() {
    const apiCalls = this.metrics.filter(m => m.type === 'api_call')
    const routeChanges = this.metrics.filter(m => m.type === 'route_change')
    const componentRenders = this.metrics.filter(m => m.type === 'component_render')

    return {
      totalMetrics: this.metrics.length,
      apiCalls: {
        count: apiCalls.length,
        avgDuration: apiCalls.length > 0
          ? apiCalls.reduce((sum, m) => sum + m.duration, 0) / apiCalls.length
          : 0,
        slowest: apiCalls.length > 0
          ? Math.max(...apiCalls.map(m => m.duration))
          : 0
      },
      routeChanges: {
        count: routeChanges.length,
        avgDuration: routeChanges.length > 0
          ? routeChanges.reduce((sum, m) => sum + m.duration, 0) / routeChanges.length
          : 0
      },
      componentRenders: {
        count: componentRenders.length,
        avgDuration: componentRenders.length > 0
          ? componentRenders.reduce((sum, m) => sum + m.duration, 0) / componentRenders.length
          : 0
      },
      webVitals: this.getWebVitals()
    }
  }

  /**
   * Clear all metrics
   */
  clear() {
    this.metrics = []
    this.marks.clear()
  }

  /**
   * Export metrics as JSON
   */
  export() {
    return {
      metrics: this.getMetrics(),
      summary: this.getSummary(),
      exportTime: new Date().toISOString()
    }
  }

  /**
   * Enable/disable monitoring
   */
  setEnabled(enabled) {
    this.enabled = enabled
  }

  /**
   * Log summary to console
   */
  logSummary() {
    const summary = this.getSummary()
    console.group('📊 Performance Summary')
    console.log('Total Metrics:', summary.totalMetrics)
    console.log('API Calls:', summary.apiCalls)
    console.log('Route Changes:', summary.routeChanges)
    console.log('Component Renders:', summary.componentRenders)
    console.log('Web Vitals:', summary.webVitals)
    console.groupEnd()
  }
}

// Create singleton instance
const performanceMonitor = new PerformanceMonitor()

// Disable in production by default (enable via env var if needed)
if (import.meta.env.PROD && !import.meta.env.VITE_ENABLE_PERF_MONITOR) {
  performanceMonitor.setEnabled(false)
}

export { performanceMonitor }

/**
 * Vue composable for performance monitoring
 */
export function usePerformanceMonitor() {
  const startMeasure = (name) => {
    performanceMonitor.mark(name)
  }

  const endMeasure = (name, details) => {
    return performanceMonitor.measure(name, details)
  }

  const trackApiCall = (endpoint, method, duration, status) => {
    return performanceMonitor.trackApiCall(endpoint, method, duration, status)
  }

  const trackRender = (componentName, duration) => {
    return performanceMonitor.trackComponentRender(componentName, duration)
  }

  return {
    startMeasure,
    endMeasure,
    trackApiCall,
    trackRender,
    getMetrics: () => performanceMonitor.getMetrics(),
    getSummary: () => performanceMonitor.getSummary(),
    logSummary: () => performanceMonitor.logSummary()
  }
}

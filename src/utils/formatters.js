/**
 * Centralized Formatting Service
 * All data formatting functions consolidated in one place to practice DRY code
 */

// ============================================================================
// CURRENCY & NUMBER FORMATTING
// ============================================================================

/**
 * Format number with thousands separators
 * @param {number} number - The number to format
 * @param {number} decimals - Number of decimal places (default: 2)
 * @returns {string} Formatted number with commas
 */
export function formatCurrency(number, decimals = 2) {
  if (isNaN(number) || number === null || number === undefined) {
    return '0.00'
  }

  return parseFloat(number).toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  })
}

/**
 * Format price with peso symbol and thousands separators
 * @param {number} price - The price to format
 * @param {number} decimals - Number of decimal places (default: 2)
 * @returns {string} Formatted price with ₱ symbol
 */
export function formatPrice(price, decimals = 2) {
  if (price === null || price === undefined || price === '') {
    return '₱0.00'
  }
  return `₱${formatCurrency(price, decimals)}`
}

/**
 * Format number with thousands separators (no currency symbol)
 * @param {number} number - The number to format
 * @param {number} decimals - Number of decimal places (default: 2)
 * @returns {string} Formatted number with commas
 */
export function formatNumber(number, decimals = 2) {
  return formatCurrency(number, decimals)
}

/**
 * Format price with absolute value (removes negative sign)
 * @param {number} price - The price to format
 * @returns {string} Formatted price without currency symbol
 */
export function formatPriceValue(price) {
  const numPrice = Math.abs(parseFloat(price || 0))
  return numPrice.toFixed(2)
}

/**
 * Get court price range from sport data
 * @param {Object} courtData - Court data with sport information
 * @returns {string} Formatted price range (e.g., "₱100/hr" or "₱100 - ₱200/hr")
 */
export function formatCourtPriceRange(courtData) {
  if (!courtData || !courtData.sport) {
    return '₱0/hr'
  }

  const sport = courtData.sport
  const timeBasedPricing = sport.time_based_pricing || []

  // Get all active time-based pricing rules
  const activePrices = timeBasedPricing
    .filter(rule => rule.is_active)
    .map(rule => parseFloat(rule.price_per_hour))

  // If no time-based pricing, return the base price
  if (activePrices.length === 0) {
    return `₱${parseFloat(sport.price_per_hour || 0).toFixed(0)}/hr`
  }

  // Include base price in the range calculation
  const allPrices = [...activePrices, parseFloat(sport.price_per_hour || 0)]
  const minPrice = Math.min(...allPrices)
  const maxPrice = Math.max(...allPrices)

  // If min and max are the same, show single price
  if (minPrice === maxPrice) {
    return `₱${minPrice.toFixed(0)}/hr`
  }

  // Show price range
  return `₱${minPrice.toFixed(0)} - ₱${maxPrice.toFixed(0)}/hr`
}

// ============================================================================
// TIME FORMATTING
// ============================================================================

/**
 * Format time slot from 24-hour to 12-hour format with AM/PM
 * @param {string} time - Time in HH:MM format
 * @returns {string} Formatted time (e.g., "2:30 PM")
 */
export function formatTimeSlot(time) {
  if (!time) return ''
  const [hours, minutes] = time.split(':')
  const hour = parseInt(hours)
  const ampm = hour >= 12 ? 'PM' : 'AM'
  const displayHour = hour % 12 || 12
  return `${displayHour}:${minutes} ${ampm}`
}

/**
 * Alias for formatTimeSlot - converts 24hr to 12hr AM/PM format
 * @param {string} time - Time in HH:MM format
 * @returns {string} Formatted time (e.g., "2:30 PM")
 */
export function formatTime(time) {
  return formatTimeSlot(time)
}

/**
 * Format full datetime to locale string
 * @param {string} dateTime - DateTime string
 * @returns {string} Formatted datetime
 */
export function formatDateTime(dateTime) {
  if (!dateTime) return 'N/A'
  return new Date(dateTime).toLocaleString()
}

/**
 * Format time only from datetime string WITH timezone conversion
 * Converts UTC datetime to local timezone, then formats to 12-hour format
 * Handles both ISO format (2025-10-28T18:00:00.000000Z) and space-separated format
 * @param {string} dateTime - DateTime string (typically in UTC)
 * @returns {string} Formatted time in 12-hour format (converted to local timezone)
 */
export function formatWaitlistTime(dateTime) {
  if (!dateTime) return ''

  try {
    // Parse the datetime string as a Date object (automatically converts to local timezone)
    const date = new Date(dateTime)

    // Check if valid date
    if (isNaN(date.getTime())) {
      return ''
    }

    // Extract local time components
    const hours = date.getHours()
    const minutes = date.getMinutes()

    // Format minutes with leading zero if needed
    const minutesStr = minutes.toString().padStart(2, '0')

    // Convert to 12-hour format
    const ampm = hours >= 12 ? 'PM' : 'AM'
    const displayHour = hours % 12 || 12

    return `${displayHour}:${minutesStr} ${ampm}`
  } catch (error) {
    return ''
  }
}

/**
 * Format duration in hours
 * @param {number} hours - Duration in hours
 * @returns {string} Formatted duration
 */
export function formatDuration(hours) {
  if (!hours) return '0'
  return hours.toString()
}

// ============================================================================
// DATE FORMATTING
// ============================================================================

/**
 * Format date in local timezone as YYYY-MM-DD
 * @param {Date} date - Date object
 * @returns {string} Formatted date string
 */
export function formatDateLocal(date) {
  if (!date) return ''
  const d = date instanceof Date ? date : new Date(date)
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

/**
 * Format booking date with weekday, month, day, year
 * Handles timezone-safe parsing for date-only strings (YYYY-MM-DD)
 * Uses MANUAL formatting to completely avoid timezone issues
 * SPECIAL HANDLING: For UTC timestamps that represent midnight in local time,
 * we parse them in local timezone to get the correct date
 * @param {string} date - Date string
 * @returns {string} Formatted date (e.g., "Mon, Jan 15, 2025")
 */
export function formatBookingDate(date) {
  if (!date) return 'Unknown'

  try {
    let datePart = date

    // Special handling for UTC datetime strings (YYYY-MM-DDTHH:MM:SSZ format)
    // If it's a UTC timestamp, parse it in LOCAL timezone to avoid the date shift
    if (typeof date === 'string' && date.includes('T') && (date.endsWith('Z') || date.includes('+') || date.includes('.'))) {
      // Create Date object from UTC string, then get local date components
      const dateObj = new Date(date)
      if (!isNaN(dateObj.getTime())) {
        // Get date components in LOCAL timezone (not UTC)
        const year = dateObj.getFullYear()
        const month = dateObj.getMonth() + 1
        const day = dateObj.getDate()

        // Validate date components
        if (year >= 1900 && year <= 2100 && month >= 1 && month <= 12 && day >= 1 && day <= 31) {
          const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
          const weekdayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

          // Calculate day of week using Zeller's congruence
          let m = month
          let y = year
          if (m < 3) {
            m += 12
            y -= 1
          }
          const k = y % 100
          const j = Math.floor(y / 100)
          const h = (day + Math.floor((13 * (m + 1)) / 5) + k + Math.floor(k / 4) + Math.floor(j / 4) - (2 * j)) % 7
          const dayOfWeek = (h + 6) % 7

          return `${weekdayNames[dayOfWeek]}, ${monthNames[month - 1]} ${day}, ${year}`
        }
      }
    }

    // Extract date part from datetime strings (for non-UTC formats)
    if (typeof date === 'string') {
      if (date.includes('T')) {
        datePart = date.split('T')[0]
      } else if (date.includes(' ')) {
        datePart = date.split(' ')[0]
      }
    }

    // Parse as YYYY-MM-DD without timezone conversion
    const dateOnlyPattern = /^\d{4}-\d{2}-\d{2}$/
    if (dateOnlyPattern.test(datePart)) {
      const [year, month, day] = datePart.split('-').map(Number)

      // Validate date components
      if (year < 1900 || year > 2100 || month < 1 || month > 12 || day < 1 || day > 31) {
        return 'Unknown'
      }

      // Manual formatting without Date objects to avoid timezone issues
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
      const weekdayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

      // Calculate day of week using Zeller's congruence (works for Gregorian calendar)
      let m = month
      let y = year
      if (m < 3) {
        m += 12
        y -= 1
      }
      const k = y % 100
      const j = Math.floor(y / 100)
      const h = (day + Math.floor((13 * (m + 1)) / 5) + k + Math.floor(k / 4) + Math.floor(j / 4) - (2 * j)) % 7
      const dayOfWeek = (h + 6) % 7 // Adjust to make Sunday = 0

      return `${weekdayNames[dayOfWeek]}, ${monthNames[month - 1]} ${day}, ${year}`
    }

    return 'Unknown'
  } catch (error) {
    return 'Unknown'
  }
}

/**
 * Format date in long format
 * Handles timezone-safe parsing for date-only strings (YYYY-MM-DD)
 * Uses MANUAL formatting to completely avoid timezone issues
 * @param {string} date - Date string
 * @returns {string} Formatted date (e.g., "Monday, January 15, 2025")
 */
export function formatDateLong(date) {
  if (!date) return ''

  try {
    let datePart = date

    // Extract date part from datetime strings
    if (typeof date === 'string') {
      if (date.includes('T')) {
        datePart = date.split('T')[0]
      } else if (date.includes(' ')) {
        datePart = date.split(' ')[0]
      }
    }

    // Parse as YYYY-MM-DD without timezone conversion
    const dateOnlyPattern = /^\d{4}-\d{2}-\d{2}$/
    if (dateOnlyPattern.test(datePart)) {
      const [year, month, day] = datePart.split('-').map(Number)

      // Validate date components
      if (year < 1900 || year > 2100 || month < 1 || month > 12 || day < 1 || day > 31) {
        return ''
      }

      // Manual formatting without Date objects to avoid timezone issues
      const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
                          'July', 'August', 'September', 'October', 'November', 'December']
      const weekdayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

      // Calculate day of week using Zeller's congruence (works for Gregorian calendar)
      let m = month
      let y = year
      if (m < 3) {
        m += 12
        y -= 1
      }
      const k = y % 100
      const j = Math.floor(y / 100)
      const h = (day + Math.floor((13 * (m + 1)) / 5) + k + Math.floor(k / 4) + Math.floor(j / 4) - (2 * j)) % 7
      const dayOfWeek = (h + 6) % 7 // Adjust to make Sunday = 0

      return `${weekdayNames[dayOfWeek]}, ${monthNames[month - 1]} ${day}, ${year}`
    }

    return ''
  } catch (error) {
    return ''
  }
}

/**
 * Format date in short format
 * Handles timezone-safe parsing for date-only strings (YYYY-MM-DD)
 * Returns date in M/D/YYYY format without timezone conversion
 * @param {string} dateString - Date string
 * @returns {string} Formatted date
 */
export function formatDate(dateString) {
  if (!dateString) return ''

  try {
    let datePart = dateString

    // For datetime strings with 'T' separator or space separator, extract the date part
    if (typeof dateString === 'string') {
      if (dateString.includes('T')) {
        datePart = dateString.split('T')[0]
      } else if (dateString.includes(' ')) {
        datePart = dateString.split(' ')[0]
      }
    }

    // Now datePart should be in YYYY-MM-DD format
    const dateOnlyPattern = /^\d{4}-\d{2}-\d{2}$/
    if (dateOnlyPattern.test(datePart)) {
      const [year, month, day] = datePart.split('-').map(Number)

      // Validate date components
      if (year < 1900 || year > 2100 || month < 1 || month > 12 || day < 1 || day > 31) {
        return ''
      }

      // Format manually without using Date object to avoid ANY timezone conversion
      // Return in M/D/YYYY format (common US format)
      return `${month}/${day}/${year}`
    }

    // Fallback: try to parse as Date object and extract components
    const date = new Date(dateString)
    if (isNaN(date.getTime())) {
      return ''
    }

    // Use UTC methods to avoid timezone conversion
    const year = date.getUTCFullYear()
    const month = date.getUTCMonth() + 1
    const day = date.getUTCDate()

    return `${month}/${day}/${year}`
  } catch (error) {
    return ''
  }
}

/**
 * Format relative time (e.g., "5 mins ago", "2 hours ago")
 * @param {string} dateTime - DateTime string
 * @returns {string} Relative time string
 */
export function formatWaitlistDate(dateTime) {
  if (!dateTime) return 'N/A'
  const date = new Date(dateTime)
  const now = new Date()
  const diffMs = now - date
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return 'just now'
  if (diffMins < 60) return `${diffMins} min${diffMins > 1 ? 's' : ''} ago`
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`
  if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`

  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
  })
}

/**
 * Format time only from date string
 * @param {string} dateString - Date string
 * @returns {string} Formatted time
 */
export function formatTimeOnly(dateString) {
  if (!dateString) return ''
  return new Date(dateString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

// ============================================================================
// BOOKING HELPER FUNCTIONS
// ============================================================================

/**
 * Get booking date from cart items or created_at
 * @param {Object} booking - Booking object
 * @returns {string} Booking date
 */
export function getBookingDate(booking) {
  if (!booking) return null
  if (booking.cart_items && booking.cart_items.length > 0) {
    return booking.cart_items[0].booking_date
  }
  return booking.created_at
}

/**
 * Get booking time range from cart items
 * @param {Object} booking - Booking object
 * @returns {string} Time range (e.g., "2:00 PM - 4:00 PM")
 */
export function getBookingTimeRange(booking) {
  if (!booking) return 'N/A'

  if (booking.cart_items && booking.cart_items.length > 0) {
    const items = booking.cart_items
    const sortedItems = [...items].sort((a, b) => a.start_time.localeCompare(b.start_time))
    const start = formatTimeSlot(sortedItems[0].start_time)
    const end = formatTimeSlot(sortedItems[sortedItems.length - 1].end_time)
    return `${start} - ${end}`
  }

  if (booking.start_time && booking.end_time) {
    return `${formatDateTime(booking.start_time)} - ${formatDateTime(booking.end_time)}`
  }

  return 'N/A'
}

/**
 * Get total price from cart items
 * @param {Object} booking - Booking object
 * @returns {string} Formatted total price
 */
export function getTotalPrice(booking) {
  if (!booking) return '0.00'

  if (booking.cart_items && booking.cart_items.length > 0) {
    const total = booking.cart_items.reduce((sum, item) => {
      return sum + parseFloat(item.price || 0)
    }, 0)
    return total.toFixed(2)
  }

  return formatPriceValue(booking.total_price || 0)
}

// ============================================================================
// STATUS FORMATTING
// ============================================================================

/**
 * Format waitlist status to readable label
 * @param {string} status - Status value
 * @returns {string} Formatted status label
 */
export function formatWaitlistStatus(status) {
  const labels = {
    'pending': 'Pending',
    'notified': 'Notified',
    'converted': 'Converted',
    'expired': 'Expired',
    'cancelled': 'Cancelled'
  }
  return labels[status] || status
}

/**
 * Format frequency type to readable label
 * @param {string} type - Frequency type
 * @returns {string} Formatted label
 */
export function formatFrequencyType(type) {
  const types = {
    once: 'One-time',
    daily: 'Daily',
    weekly: 'Weekly',
    monthly: 'Monthly',
    yearly: 'Yearly'
  }
  return types[type] || type
}

/**
 * Format attendance status to readable label
 * @param {string} status - Attendance status
 * @returns {string} Formatted label
 */
export function formatAttendanceLabel(status) {
  const labels = {
    'showed_up': 'Showed Up',
    'no_show': 'No Show',
    'not_set': 'Not Set'
  }
  return labels[status] || 'Not Set'
}

/**
 * Format approval status to readable text
 * @param {string} status - Approval status
 * @returns {string} Formatted text
 */
export function formatApprovalStatus(status) {
  const texts = {
    'approved': 'Approved',
    'rejected': 'Rejected',
    'pending': 'Pending',
    'pending_waitlist': 'Pending Waitlist'
  }
  return texts[status] || 'Pending'
}

// ============================================================================
// PAYMENT STATUS FORMATTING
// ============================================================================

/**
 * Determine payment status from booking data
 * @param {Object} booking - Booking object
 * @returns {string} Payment status
 */
export function getPaymentStatus(booking) {
  if (!booking) return 'unknown'

  const hasPaymentMethod = booking.payment_method && booking.payment_method.trim() !== ''
  const hasProofOfPayment = booking.proof_of_payment && booking.proof_of_payment.trim() !== ''

  if (hasPaymentMethod && hasProofOfPayment) {
    return 'complete'
  } else if (hasPaymentMethod && !hasProofOfPayment) {
    return 'missing_proof'
  } else if (!hasPaymentMethod && hasProofOfPayment) {
    return 'missing_method'
  } else {
    return 'incomplete'
  }
}

/**
 * Get payment status text
 * @param {Object} booking - Booking object
 * @returns {string} Payment status text
 */
export function getPaymentStatusText(booking) {
  if (!booking) return 'Unknown'

  // Check for new payment fields
  if (booking.payment_status === 'paid') {
    if (booking.payment_method === 'gcash') {
      return 'GCash Paid'
    }
    return 'Paid'
  }

  if (booking.payment_status === 'unpaid') {
    return 'Pending Payment'
  }

  // Legacy payment status check
  const status = getPaymentStatus(booking)
  const texts = {
    complete: 'Complete',
    missing_proof: 'Missing Proof',
    missing_method: 'Missing Method',
    incomplete: 'Incomplete',
    unknown: 'Pending'
  }
  return texts[status] || 'Pending'
}

// ============================================================================
// COLOR MAPPING
// ============================================================================

/**
 * Get color for waitlist status
 * @param {string} status - Waitlist status
 * @returns {string} Vuetify color name
 */
export function getWaitlistStatusColor(status) {
  const colors = {
    'pending': 'warning',
    'notified': 'info',
    'converted': 'success',
    'expired': 'grey',
    'cancelled': 'error'
  }
  return colors[status] || 'grey'
}

/**
 * Get color for frequency type
 * @param {string} type - Frequency type
 * @returns {string} Vuetify color name
 */
export function getFrequencyColor(type) {
  const colors = {
    once: 'grey',
    daily: 'green',
    weekly: 'blue',
    monthly: 'orange',
    yearly: 'red'
  }
  return colors[type] || 'grey'
}

/**
 * Get color for attendance status
 * @param {string} status - Attendance status
 * @returns {string} Vuetify color name
 */
export function getAttendanceColor(status) {
  const colors = {
    'showed_up': 'success',
    'no_show': 'error',
    'not_set': 'grey'
  }
  return colors[status] || 'grey'
}

/**
 * Get color for payment status
 * @param {Object} booking - Booking object
 * @returns {string} Vuetify color name
 */
export function getPaymentStatusColor(booking) {
  if (!booking) return 'grey'

  // Check for new payment fields
  if (booking.payment_status === 'paid') {
    return 'success'
  }

  if (booking.payment_status === 'unpaid') {
    return 'warning'
  }

  // Legacy payment status check
  const status = getPaymentStatus(booking)
  const colors = {
    complete: 'success',
    missing_proof: 'warning',
    missing_method: 'warning',
    incomplete: 'error',
    unknown: 'grey'
  }
  return colors[status] || 'grey'
}

/**
 * Get color for approval status
 * @param {string} status - Approval status
 * @returns {string} Vuetify color name
 */
export function getApprovalStatusColor(status) {
  const colors = {
    'approved': 'success',
    'rejected': 'error',
    'pending': 'warning',
    'pending_waitlist': 'info'
  }
  return colors[status] || 'warning'
}

/**
 * Get color for payment type
 * @param {string} type - Payment type
 * @returns {string} Vuetify color name
 */
export function getPaymentTypeColor(type) {
  const colors = {
    'cash': 'success',
    'gcash': 'info',
    'card': 'primary',
    'bank_transfer': 'secondary'
  }
  return colors[type] || 'grey'
}

// ============================================================================
// ICON MAPPING
// ============================================================================

/**
 * Get icon for payment status
 * @param {Object} booking - Booking object
 * @returns {string} Material Design icon name
 */
export function getPaymentStatusIcon(booking) {
  if (!booking) return 'mdi-help-circle'

  // Check for new payment fields
  if (booking.payment_status === 'paid') {
    if (booking.payment_method === 'gcash') {
      return 'mdi-cellphone-check'
    }
    return 'mdi-check-circle'
  }

  if (booking.payment_status === 'unpaid') {
    return 'mdi-clock-outline'
  }

  // Legacy payment status check
  const status = getPaymentStatus(booking)
  const icons = {
    complete: 'mdi-check-circle',
    missing_proof: 'mdi-alert-circle',
    missing_method: 'mdi-alert-circle',
    incomplete: 'mdi-close-circle',
    unknown: 'mdi-help-circle'
  }
  return icons[status] || 'mdi-help-circle'
}

/**
 * Get icon for attendance status
 * @param {string} status - Attendance status
 * @returns {string} Material Design icon name
 */
export function getAttendanceIcon(status) {
  const icons = {
    'showed_up': 'mdi-account-check',
    'no_show': 'mdi-account-remove',
    'not_set': 'mdi-account-question'
  }
  return icons[status] || 'mdi-account-question'
}

/**
 * Get icon for payment type
 * @param {string} type - Payment type
 * @returns {string} Material Design icon name
 */
export function getPaymentTypeIcon(type) {
  const icons = {
    'cash': 'mdi-cash',
    'gcash': 'mdi-cellphone',
    'card': 'mdi-credit-card',
    'bank_transfer': 'mdi-bank'
  }
  return icons[type] || 'mdi-cash'
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Get day name from day number
 * @param {number} dayNumber - Day number (0-6)
 * @returns {string} Day name
 */
export function getDayName(dayNumber) {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
  return days[dayNumber] || 'Unknown'
}

/**
 * Check if booking is an admin booking
 * @param {Object} booking - Booking object
 * @returns {boolean} True if admin booking
 */
export function isAdminBooking(booking) {
  if (!booking) return false
  const firstCartItem = booking.cart_items?.[0]
  return firstCartItem && (firstCartItem.booking_for_user_id || firstCartItem.booking_for_user_name)
}

/**
 * Export all formatters as a service object for easy importing
 */
export const formatters = {
  // Currency & Numbers
  formatCurrency,
  formatPrice,
  formatNumber,
  formatPriceValue,
  formatCourtPriceRange,

  // Time
  formatTimeSlot,
  formatTime,
  formatDateTime,
  formatWaitlistTime,
  formatDuration,
  formatTimeOnly,

  // Date
  formatDateLocal,
  formatBookingDate,
  formatDateLong,
  formatDate,
  formatWaitlistDate,

  // Booking Helpers
  getBookingDate,
  getBookingTimeRange,
  getTotalPrice,

  // Status Formatting
  formatWaitlistStatus,
  formatFrequencyType,
  formatAttendanceLabel,
  formatApprovalStatus,

  // Payment Status
  getPaymentStatus,
  getPaymentStatusText,

  // Color Mapping
  getWaitlistStatusColor,
  getFrequencyColor,
  getAttendanceColor,
  getPaymentStatusColor,
  getApprovalStatusColor,
  getPaymentTypeColor,

  // Icon Mapping
  getPaymentStatusIcon,
  getAttendanceIcon,
  getPaymentTypeIcon,

  // Utilities
  getDayName,
  isAdminBooking
}

export default formatters

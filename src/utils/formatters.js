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

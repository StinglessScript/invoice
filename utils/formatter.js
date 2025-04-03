/**
 * Format a number as Vietnamese currency
 * @param {number} amount The amount to format
 * @returns {string} Formatted amount
 */
export function formatCurrency(amount) {
  if (isNaN(amount)) return '0 ₫';
  
  // Format with thousands separator and add currency symbol
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
}

/**
 * Parse a currency string into a number
 * @param {string} value The currency string to parse
 * @returns {number} Parsed number
 */
export function parseCurrency(value) {
  if (!value) return 0;
  
  // Remove currency symbols and separators
  const numericValue = value.replace(/[^\d]/g, '');
  return parseInt(numericValue, 10) || 0;
}

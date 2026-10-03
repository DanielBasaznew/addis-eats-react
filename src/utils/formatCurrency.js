/**
 * Formats a numeric value into an ETB currency string.
 *
 * @param {number|string} amount
 * @returns {string} e.g. "450 ETB"
 */
export function formatCurrency(amount) {
  const numeric = Number(amount) || 0
  return `${numeric.toLocaleString()} ETB`
}

export default formatCurrency

export const FIRST_ORDER_DISCOUNT = 50

export function isEligibleForFirstOrderDiscount(ordersOrCount) {
  const count = Array.isArray(ordersOrCount)
    ? ordersOrCount.length
    : Number(ordersOrCount) || 0
  return count === 0
}

export function calculateOrderTotals(subtotal, deliveryFee, discount = 0) {
  const safeSubtotal = Math.max(0, Number(subtotal) || 0)
  const safeDelivery = Math.max(0, Number(deliveryFee) || 0)
  const safeDiscount = Math.max(0, Number(discount) || 0)
  const grandTotal = Math.max(0, safeSubtotal + safeDelivery - safeDiscount)

  return {
    subtotal: safeSubtotal,
    deliveryFee: safeDelivery,
    discount: safeDiscount,
    grandTotal,
  }
}

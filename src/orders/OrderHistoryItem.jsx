import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useCartStore } from '../cart/cartStore'
import { fetchDishes } from '../api/dishes'
import { formatCurrency } from '../utils/formatCurrency'

function OrderHistoryItem({ order }) {
  const [isReordering, setIsReordering] = useState(false)
  const [reorderFeedback, setReorderFeedback] = useState(null)
  const addItem = useCartStore((state) => state.addItem)

  if (!order) {
    return null
  }

  const orderId = order.id || order.orderId || 'N/A'
  const customerName = order.customerName || order.customer?.fullName || order.customer?.name || ''
  const deliveryArea =
    order.deliveryArea ||
    order.delivery?.area ||
    order.area ||
    order.deliveryAddress ||
    order.address ||
    'Standard Delivery'
  const deliveryAddress = order.deliveryAddress || order.delivery?.address || order.address || ''
  const status = order.status || 'Pending'
  const paymentMethod = order.paymentMethod || 'Telebirr'
  const specialInstructions =
    order.specialInstructions || order.instructions || order.notes || ''

  const items = Array.isArray(order.items) ? order.items : []
  const subtotal = Number(order.subtotal ?? order.itemsSubtotal ?? 0)
  const deliveryFee = Number(order.deliveryFee ?? order.delivery?.fee ?? 0)
  const discount = Number(order.discount ?? 0)
  const grandTotal = Number(
    order.grandTotal ?? order.total ?? Math.max(0, subtotal + deliveryFee - discount)
  )
  const estimatedDeliveryTime =
    order.estimatedDeliveryTime || order.delivery?.estimatedTime || null

  const formattedDate = order.createdAt || order.date
    ? new Date(order.createdAt || order.date).toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : 'Recent Order'

  const handleReorder = async () => {
    if (!items || items.length === 0) {
      setReorderFeedback({
        type: 'error',
        message: 'No items in this order to reorder.',
      })
      return
    }

    setIsReordering(true)
    setReorderFeedback(null)

    try {
      // 1. Fetch current menu data to check real-time dish availability
      let menuDishes = []
      try {
        menuDishes = await fetchDishes()
      } catch {
        menuDishes = []
      }

      const availableItems = []
      const unavailableNames = []

      // 2. Filter available dishes based on current menu status
      items.forEach((item) => {
        const currentDish = menuDishes.find(
          (dish) => String(dish.id) === String(item.id)
        )

        if (currentDish && currentDish.available === false) {
          unavailableNames.push(item.name || `Dish #${item.id}`)
        } else {
          availableItems.push(item)
        }
      })

      if (availableItems.length === 0) {
        setReorderFeedback({
          type: 'error',
          message: 'None of the dishes from this order are currently available.',
          unavailableItems: unavailableNames,
        })
        return
      }

      // 3. Add each available item to cart using cartStore.addItem
      availableItems.forEach((item) => {
        const quantity = Number(item.quantity) || 1
        addItem(
          {
            id: item.id,
            name: item.name,
            price: Number(item.price) || 0,
            image: item.image || '',
          },
          quantity
        )
      })

      // 4. Set clear feedback and action link to /cart
      if (unavailableNames.length > 0) {
        setReorderFeedback({
          type: 'warning',
          message: `Added ${availableItems.length} available item${availableItems.length === 1 ? '' : 's'} to your cart.`,
          unavailableItems: unavailableNames,
        })
      } else {
        setReorderFeedback({
          type: 'success',
          message: 'All items from this order have been added to your cart!',
        })
      }
    } catch {
      setReorderFeedback({
        type: 'error',
        message: 'An unexpected error occurred while reordering. Please try again.',
      })
    } finally {
      setIsReordering(false)
    }
  }

  const isTableOrder = order.orderingType === 'table' || Boolean(order.tableNumber)
  const tableNumber = order.tableNumber

  return (
    <article
      className="order-history-card"
      aria-labelledby={`order-heading-${orderId}`}
    >
      {/* Order Header / Meta */}
      <header className="order-card-header">
        <div className="order-card-meta-main">
          <h2 className="order-id-badge" id={`order-heading-${orderId}`}>
            {orderId}
          </h2>
          <time className="order-date" dateTime={order.createdAt || order.date || undefined}>
            {formattedDate}
          </time>
        </div>

        <div className="order-card-badges">
          <span
            className={`order-status-pill status-${status.toLowerCase().replace(/\s+/g, '-')}`}
          >
            {status}
          </span>
          {isTableOrder ? (
            <span className="order-area-pill table">
              <span className="material-symbols-outlined area-icon" aria-hidden="true">
                table_restaurant
              </span>
              Table #{tableNumber} (Dine-In)
            </span>
          ) : (
            <span className="order-area-pill">
              <span className="material-symbols-outlined area-icon" aria-hidden="true">
                near_me
              </span>
              {deliveryArea}
            </span>
          )}
        </div>
      </header>

      {/* Customer & Address Details if available */}
      {(customerName || deliveryAddress || specialInstructions || isTableOrder) && (
        <div className="order-delivery-info">
          {customerName && (
            <span className="order-customer-name">
              <strong>Customer:</strong> {customerName}
            </span>
          )}
          {isTableOrder ? (
            <span className="order-customer-address">
              <strong>Dining Station:</strong> Table #{tableNumber} (Dine-In Table Service)
            </span>
          ) : (
            deliveryAddress && (
              <span className="order-customer-address">
                <strong>Destination:</strong> {deliveryAddress}
              </span>
            )
          )}
          <span className="order-customer-payment">
            <strong>Settlement:</strong> {paymentMethod}
          </span>
          {specialInstructions && (
            <span className="order-customer-instructions">
              <strong>{isTableOrder ? 'Kitchen Note:' : 'Courier Note:'}</strong> {specialInstructions}
            </span>
          )}
        </div>
      )}

      {/* Ordered Items List */}
      <div className="order-items-section">
        <h3 className="order-items-heading">
          Manifest Items ({items.reduce((sum, it) => sum + (Number(it.quantity) || 1), 0)})
        </h3>
        <ul className="order-items-list" aria-label={`Items for order ${orderId}`}>
          {items.map((item, index) => {
            const itemPrice = Number(item.price) || 0
            const itemQuantity = Number(item.quantity) || 1
            const itemSubtotal = item.itemSubtotal ?? itemPrice * itemQuantity

            return (
              <li key={item.id || index} className="order-item-row">
                <div className="order-item-main">
                  {item.image && (
                    <img
                      src={item.image}
                      alt={item.name}
                      className="order-item-thumb"
                      loading="lazy"
                    />
                  )}
                  <div className="order-item-details">
                    <span className="order-item-name">{item.name}</span>
                    <span className="order-item-unit-price">
                      {formatCurrency(itemPrice)} each
                    </span>
                  </div>
                </div>

                <div className="order-item-meta-totals">
                  <span className="order-item-qty">
                    &times; {itemQuantity}
                  </span>
                  <span className="order-item-total">
                    {formatCurrency(itemSubtotal)}
                  </span>
                </div>
              </li>
            )
          })}
        </ul>
      </div>

      {/* Financial Totals Summary */}
      <footer className="order-card-footer">
        <div className="order-totals-breakdown">
          <div className="order-total-row">
            <span className="total-row-label">Subtotal:</span>
            <span className="total-row-value">{formatCurrency(subtotal)}</span>
          </div>

          <div className="order-total-row">
            <span className="total-row-label">
              {isTableOrder ? 'Dine-In Service:' : 'Delivery Fee:'}
            </span>
            <span className="total-row-value">
              {isTableOrder ? 'FREE (0 ETB)' : formatCurrency(deliveryFee)}
            </span>
          </div>

          {discount > 0 && (
            <div className="order-total-row discount-row">
              <span className="total-row-label">First-Order Discount:</span>
              <span className="total-row-value discount-value">-{formatCurrency(discount)}</span>
            </div>
          )}

          <div className="order-total-row grand-total-row">
            <span className="grand-total-label">Grand Total:</span>
            <span className="grand-total-value">{formatCurrency(grandTotal)}</span>
          </div>
        </div>

        <div className="order-footer-right">
          {estimatedDeliveryTime && (
            <div className="order-estimate-badge">
              <span className="material-symbols-outlined estimate-icon" aria-hidden="true">
                schedule
              </span>
              <span>Est. Delivery: {estimatedDeliveryTime}</span>
            </div>
          )}

          {/* Reorder Action Button */}
          <button
            type="button"
            className="btn-reorder"
            onClick={handleReorder}
            disabled={isReordering}
            aria-label={`Reorder all available dishes from order ${orderId}`}
          >
            <span className="material-symbols-outlined reorder-icon" aria-hidden="true">
              replay
            </span>
            <span>{isReordering ? 'Checking Availability...' : 'Reorder Manifest'}</span>
          </button>
        </div>
      </footer>

      {/* Reorder Customer Feedback & Action to Continue to Cart */}
      {reorderFeedback && (
        <div
          className={`order-reorder-banner ${reorderFeedback.type}`}
          role="status"
          aria-live="polite"
        >
          <div className="reorder-banner-content">
            <p className="reorder-banner-message">{reorderFeedback.message}</p>
            {reorderFeedback.unavailableItems && reorderFeedback.unavailableItems.length > 0 && (
              <p className="reorder-unavailable-text">
                Currently sold out:{' '}
                <strong>{reorderFeedback.unavailableItems.join(', ')}</strong>
              </p>
            )}
          </div>

          {(reorderFeedback.type === 'success' || reorderFeedback.type === 'warning') && (
            <Link to="/cart" className="btn-reorder-cart">
              Go to Bag <span aria-hidden="true">&rarr;</span>
            </Link>
          )}
        </div>
      )}
    </article>
  )
}

export default OrderHistoryItem

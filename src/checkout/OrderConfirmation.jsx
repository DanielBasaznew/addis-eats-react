import { useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { formatCurrency } from '../utils/formatCurrency'

function OrderConfirmation({ order }) {
  const confirmationRef = useRef(null)

  useEffect(() => {
    if (confirmationRef.current) {
      confirmationRef.current.focus()
    }
  }, [])

  if (!order) {
    return null
  }

  const {
    id,
    customerName,
    customerPhone,
    deliveryAddress,
    deliveryArea,
    estimatedDeliveryTime,
    items = [],
    itemsSubtotal = 0,
    deliveryFee = 0,
    discount = 0,
    grandTotal = 0,
    createdAt,
    paymentMethod = 'Telebirr SuperApp',
    specialInstructions = '',
  } = order

  const formattedDate = createdAt
    ? new Date(createdAt).toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : null

  const isTableOrder = order.orderingType === 'table' || Boolean(order.tableNumber)
  const tableNumber = order.tableNumber

  return (
    <article
      ref={confirmationRef}
      tabIndex={-1}
      className="order-confirmation-card"
      aria-labelledby="confirmation-heading"
    >
      <div
        role="status"
        aria-live="polite"
        className="order-confirmation-banner"
      >
        <div className="order-confirmation-badge" aria-hidden="true">
          <span className="material-symbols-outlined check-icon">
            check_circle
          </span>
        </div>

        <div className="confirmation-header-text">
          <span className="sub-title-caps">
            {isTableOrder ? `Table #${tableNumber} Service Authorized` : 'Dispatch Authorized'}
          </span>
          <h1 id="confirmation-heading" className="order-confirmation-title">
            Order Confirmed!
          </h1>
          <p className="order-confirmation-subtitle">
            Thank you, <strong>{customerName}</strong>!{' '}
            {isTableOrder
              ? `Your order for Table #${tableNumber} has been received by our kitchen atelier and is being prepared for table service.`
              : 'Your order has been placed successfully with our kitchen atelier and is being prepared.'}
          </p>
        </div>
      </div>

      <section className="order-meta-section" aria-label="Order summary information">
        <div className="order-meta-grid">
          <div className="meta-item">
            <span className="meta-label">Order Manifest ID</span>
            <span className="meta-value order-id-code">{id}</span>
          </div>

          <div className="meta-item">
            <span className="meta-label">Customer Name</span>
            <span className="meta-value">{customerName}</span>
          </div>

          <div className="meta-item">
            <span className="meta-label">Contact Phone</span>
            <span className="meta-value">{customerPhone}</span>
          </div>

          <div className="meta-item">
            <span className="meta-label">
              {isTableOrder ? 'Estimated Kitchen Time' : 'Estimated Delivery'}
            </span>
            <span className="meta-value delivery-time-badge">
              <span className="material-symbols-outlined" aria-hidden="true">
                schedule
              </span>
              {isTableOrder ? '15–25 mins (Table Service)' : estimatedDeliveryTime}
            </span>
          </div>

          <div className="meta-item">
            <span className="meta-label">Settlement Gateway</span>
            <span className="meta-value font-medium">{paymentMethod}</span>
          </div>

          <div className="meta-item meta-item-full">
            <span className="meta-label">
              {isTableOrder ? 'Dining Location' : 'Delivery Destination'}
            </span>
            <span className="meta-value">
              {isTableOrder ? (
                <span className="dining-station-value">
                  <span className="material-symbols-outlined inline-icon" aria-hidden="true">table_restaurant</span>
                  <strong>Table #{tableNumber}</strong> (Dine-In Table Service)
                </span>
              ) : (
                <>
                  {deliveryAddress}
                  {deliveryArea && deliveryArea !== deliveryAddress && (
                    <span className="area-pill"> ({deliveryArea})</span>
                  )}
                </>
              )}
            </span>
          </div>

          {formattedDate && (
            <div className="meta-item meta-item-full">
              <span className="meta-label">Timestamp</span>
              <span className="meta-value date-value">{formattedDate}</span>
            </div>
          )}

          {specialInstructions && (
            <div className="meta-item meta-item-full">
              <span className="meta-label">Courier &amp; Kitchen Notes</span>
              <span className="meta-value special-instructions-text">
                {specialInstructions}
              </span>
            </div>
          )}
        </div>
      </section>

      <section className="order-items-section" aria-label="Ordered items breakdown">
        <h2 className="section-subtitle">Delicacies in this Manifest</h2>

        <div className="ordered-items-list">
          {items.map((item, index) => {
            const itemPrice = Number(item.price) || 0
            const itemQty = Number(item.quantity) || 1
            const itemTotal = item.itemSubtotal || itemPrice * itemQty

            return (
              <div key={item.id || index} className="ordered-item-row">
                <div className="ordered-item-main">
                  {item.image && (
                    <img
                      src={item.image}
                      alt={item.name}
                      className="ordered-item-thumbnail"
                      loading="lazy"
                    />
                  )}
                  <div className="ordered-item-info">
                    <span className="ordered-item-name">{item.name}</span>
                    <span className="ordered-item-unit-price">
                      {formatCurrency(itemPrice)} each
                    </span>
                  </div>
                </div>

                <div className="ordered-item-quantities">
                  <span className="ordered-item-qty" aria-label={`Quantity: ${itemQty}`}>
                    &times; {itemQty}
                  </span>
                  <span className="ordered-item-total">
                    {formatCurrency(itemTotal)}
                  </span>
                </div>
              </div>
            )
          })}
        </div>

        <div className="confirmation-totals-summary">
          <div className="totals-row">
            <span className="totals-label">Items Subtotal:</span>
            <span className="totals-value">{formatCurrency(itemsSubtotal)}</span>
          </div>

          <div className="totals-row">
            <span className="totals-label">
              {isTableOrder ? 'Dine-In Table Service:' : 'Delivery Fee:'}
            </span>
            <span className="totals-value">
              {isTableOrder ? 'FREE (0 ETB)' : formatCurrency(deliveryFee)}
            </span>
          </div>

          {Number(discount) > 0 && (
            <div className="totals-row discount-row">
              <span className="totals-label">First-Order Welcome Gift:</span>
              <span className="totals-value discount-value">
                -{formatCurrency(discount)}
              </span>
            </div>
          )}

          <div className="totals-row totals-grand-row">
            <span className="totals-grand-label">Grand Total:</span>
            <span className="totals-grand-value">{formatCurrency(grandTotal)}</span>
          </div>
        </div>
      </section>

      <nav className="order-confirmation-actions" aria-label="Confirmation navigation">
        <Link
          to="/menu"
          className="btn-confirmation-primary"
          aria-label="Back to Menu to browse our dishes"
        >
          <span className="material-symbols-outlined" aria-hidden="true">
            restaurant_menu
          </span>
          Browse More Dishes
        </Link>

        <Link
          to="/orders"
          className="btn-confirmation-secondary"
          aria-label="View your order history"
        >
          <span className="material-symbols-outlined" aria-hidden="true">
            receipt_long
          </span>
          View Order History
        </Link>
      </nav>
    </article>
  )
}

export default OrderConfirmation

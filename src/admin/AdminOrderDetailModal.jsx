import { useEffect } from 'react'
import { formatCurrency } from '../utils/formatCurrency'
import { ORDER_STATUSES } from '../orders/orderHistoryStore'

function AdminOrderDetailModal({ order, onClose, onStatusChange, onDeleteOrder }) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  if (!order) return null

  const orderId = order.id || order.orderId || 'N/A'
  const customerName =
    order.customerName ||
    order.customer?.fullName ||
    order.customer?.name ||
    'Guest Customer'
  const customerPhone =
    order.customerPhone || order.customer?.phone || order.phone || 'Not provided'
  const deliveryAddress =
    order.deliveryAddress ||
    order.delivery?.address ||
    order.address ||
    'Addis Ababa, Ethiopia'
  const deliveryArea =
    order.deliveryArea ||
    order.delivery?.area ||
    order.area ||
    'Standard Delivery Area'
  const estimatedTime =
    order.estimatedDeliveryTime ||
    order.delivery?.estimatedTime ||
    '35 - 45 mins'
  const paymentMethod = order.paymentMethod || 'Telebirr Mobile'
  const specialInstructions =
    order.specialInstructions || order.instructions || order.notes || ''
  const status = order.status || 'Pending'

  const isTableOrder = order.orderingType === 'table' || Boolean(order.tableNumber)
  const tableNumber = order.tableNumber

  const items = Array.isArray(order.items) ? order.items : []
  const subtotal = Number(order.subtotal ?? order.itemsSubtotal ?? 0)
  const deliveryFee = Number(order.deliveryFee ?? order.delivery?.fee ?? 0)
  const discount = Number(order.discount ?? 0)
  const grandTotal = Number(
    order.grandTotal ??
      order.total ??
      Math.max(0, subtotal + deliveryFee - discount)
  )

  const formattedDate = order.createdAt || order.date
    ? new Date(order.createdAt || order.date).toLocaleDateString(undefined, {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : 'Recent Order'

  const totalItemsCount = items.reduce(
    (sum, it) => sum + (Number(it.quantity) || 1),
    0
  )

  const statusKey = status.toLowerCase().replace(/\s+/g, '-')

  return (
    <div
      className="admin-modal-backdrop"
      role="presentation"
      onClick={onClose}
    >
      <div
        className="admin-modal-dialog admin-order-modal-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="order-detail-title"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="admin-modal-header">
          <div className="admin-order-modal-header-meta">
            <div className="admin-order-id-status-row">
              <span className="sub-title-caps">Order Details</span>
              <div className="admin-status-control-wrap modal-status-wrap">
                <label
                  htmlFor={`modal-status-${orderId}`}
                  className="modal-status-label"
                >
                  Status:
                </label>
                <select
                  id={`modal-status-${orderId}`}
                  className={`admin-order-status-select status-${statusKey}`}
                  value={status}
                  onChange={(e) => onStatusChange?.(orderId, e.target.value)}
                  aria-label={`Update status for order #${orderId}`}
                >
                  {ORDER_STATUSES.map((st) => (
                    <option key={st} value={st}>
                      {st}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="admin-modal-title-row">
              <h3 id="order-detail-title" className="admin-modal-title">
                Order #{orderId}
              </h3>
              {isTableOrder ? (
                <span className="admin-order-type-badge table">
                  <span className="material-symbols-outlined type-icon" aria-hidden="true">
                    table_restaurant
                  </span>
                  Table {tableNumber} (Dine-In)
                </span>
              ) : (
                <span className="admin-order-type-badge delivery">
                  <span className="material-symbols-outlined type-icon" aria-hidden="true">
                    delivery_dining
                  </span>
                  Delivery
                </span>
              )}
            </div>
            <span className="admin-order-modal-date">
              Placed on {formattedDate}
            </span>
          </div>
          <button
            type="button"
            className="admin-modal-close"
            onClick={onClose}
            aria-label="Close order details"
          >
            &times;
          </button>
        </header>

        <div className="admin-modal-body admin-order-modal-body">
          <div className="admin-order-info-grid">
            <div className="admin-order-info-card">
              <div className="info-card-header">
                <span
                  className="material-symbols-outlined info-icon"
                  aria-hidden="true"
                >
                  person
                </span>
                <span className="info-card-title">Customer Information</span>
              </div>
              <div className="info-card-content">
                <div className="info-item">
                  <span className="info-label">Full Name:</span>
                  <span className="info-value font-semibold">{customerName}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Phone:</span>
                  <span className="info-value">{customerPhone}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Payment:</span>
                  <span className="info-value">{paymentMethod}</span>
                </div>
              </div>
            </div>

            <div className="admin-order-info-card">
              <div className="info-card-header">
                <span
                  className="material-symbols-outlined info-icon"
                  aria-hidden="true"
                >
                  {isTableOrder ? 'table_restaurant' : 'local_shipping'}
                </span>
                <span className="info-card-title">
                  {isTableOrder ? 'Dining Station Information' : 'Delivery Information'}
                </span>
              </div>
              <div className="info-card-content">
                {isTableOrder ? (
                  <>
                    <div className="info-item">
                      <span className="info-label">Dining Station:</span>
                      <span className="info-value font-bold text-accent">
                        Table #{tableNumber} (Dine-In)
                      </span>
                    </div>
                    <div className="info-item">
                      <span className="info-label">Order Type:</span>
                      <span className="info-value">Table-Side Service</span>
                    </div>
                    <div className="info-item">
                      <span className="info-label">Kitchen Prep:</span>
                      <span className="info-value">15 – 25 mins</span>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="info-item">
                      <span className="info-label">Destination:</span>
                      <span className="info-value">{deliveryAddress}</span>
                    </div>
                    <div className="info-item">
                      <span className="info-label">Delivery Zone:</span>
                      <span className="info-value">{deliveryArea}</span>
                    </div>
                    <div className="info-item">
                      <span className="info-label">Est. Courier Time:</span>
                      <span className="info-value">{estimatedTime}</span>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          {specialInstructions && (
            <div className="admin-order-instructions-box">
              <div className="instructions-header">
                <span
                  className="material-symbols-outlined instructions-icon"
                  aria-hidden="true"
                >
                  edit_note
                </span>
                <span className="instructions-title">
                  Special Preparation &amp; Courier Instructions
                </span>
              </div>
              <p className="instructions-text">&ldquo;{specialInstructions}&rdquo;</p>
            </div>
          )}

          <div className="admin-order-items-section">
            <div className="admin-order-items-header">
              <span className="items-section-title">
                Ordered Items ({totalItemsCount})
              </span>
              <span className="items-section-count">
                {items.length} {items.length === 1 ? 'line item' : 'line items'}
              </span>
            </div>

            <div className="admin-order-items-list" role="list">
              {items.map((item, index) => {
                const price = Number(item.price) || 0
                const quantity = Number(item.quantity) || 1
                const itemTotal =
                  item.itemSubtotal !== undefined
                    ? Number(item.itemSubtotal)
                    : price * quantity

                return (
                  <div
                    key={item.id ? `${item.id}-${index}` : index}
                    className="admin-order-item-row"
                    role="listitem"
                  >
                    <div className="admin-order-item-product">
                      {item.image ? (
                        <img
                          src={item.image}
                          alt={item.name}
                          className="admin-order-item-img"
                          loading="lazy"
                        />
                      ) : (
                        <div
                          className="admin-order-item-placeholder"
                          aria-hidden="true"
                        >
                          <span className="material-symbols-outlined">
                            restaurant
                          </span>
                        </div>
                      )}
                      <div className="admin-order-item-info">
                        <span className="admin-order-item-name">
                          {item.name}
                        </span>
                        <span className="admin-order-item-unit">
                          {formatCurrency(price)} each
                        </span>
                      </div>
                    </div>

                    <div className="admin-order-item-figures">
                      <span className="admin-order-item-qty">
                        &times; {quantity}
                      </span>
                      <span className="admin-order-item-subtotal">
                        {formatCurrency(itemTotal)}
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          <div className="admin-order-financials">
            <div className="financial-row">
              <span className="financial-label">Items Subtotal:</span>
              <span className="financial-value">{formatCurrency(subtotal)}</span>
            </div>

            <div className="financial-row">
              <span className="financial-label">
                {isTableOrder ? 'Dine-In Service:' : 'Delivery Fee:'}
              </span>
              <span className="financial-value">
                {isTableOrder
                  ? 'FREE (0 ETB)'
                  : deliveryFee === 0
                  ? 'Free'
                  : formatCurrency(deliveryFee)}
              </span>
            </div>

            {discount > 0 && (
              <div className="financial-row discount">
                <span className="financial-label">Discount:</span>
                <span className="financial-value">
                  &minus;{formatCurrency(discount)}
                </span>
              </div>
            )}

            <div className="financial-row total-row">
              <span className="financial-label-total">Grand Total:</span>
              <span className="financial-value-total">
                {formatCurrency(grandTotal)}
              </span>
            </div>
          </div>
        </div>

        <footer className="admin-modal-footer">
          {onDeleteOrder && (
            <button
              type="button"
              className="admin-modal-btn btn-danger-delete btn-order-modal-delete"
              onClick={() => onDeleteOrder(order)}
            >
              <span className="material-symbols-outlined action-icon" aria-hidden="true">
                delete
              </span>
              <span>Delete Order</span>
            </button>
          )}
          <button
            type="button"
            className="admin-modal-btn cancel"
            onClick={onClose}
          >
            Close Details
          </button>
        </footer>
      </div>
    </div>
  )
}

export default AdminOrderDetailModal

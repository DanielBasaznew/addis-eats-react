import { Link, useSearchParams } from 'react-router-dom'
import { useCartStore } from './cartStore'
import CartItem from './CartItem'
import { formatCurrency } from '../utils/formatCurrency'
import { useOrderHistoryStore, selectIsFirstOrder } from '../orders/orderHistoryStore'
import { FIRST_ORDER_DISCOUNT } from '../utils/orderPricing'
import { appendTableQuery, getTableNumber } from '../utils/tableOrder'

function Cart() {
  const [searchParams] = useSearchParams()
  const tableNumber = getTableNumber(searchParams)

  const items = useCartStore((state) => state.items)
  const subtotal = useCartStore((state) => state.subtotal)
  const totalItems = useCartStore((state) => state.totalItems)

  const isFirstOrder = useOrderHistoryStore(selectIsFirstOrder)
  const discount = isFirstOrder ? FIRST_ORDER_DISCOUNT : 0
  const estimatedTotal = Math.max(0, subtotal - discount)

  if (!items || items.length === 0) {
    return (
      <div className="cart-page">
        <div className="cart-empty-state">
          <div className="cart-empty-icon-wrapper" aria-hidden="true">
            <span className="material-symbols-outlined empty-bag-icon">
              shopping_bag
            </span>
          </div>
          <h1 className="cart-empty-title">Your Bag is Empty</h1>
          <p className="cart-empty-message">
            Looks like you haven&apos;t added any authentic Ethiopian dishes yet.
            Explore our curated selection to start your culinary journey.
          </p>
          <Link to={appendTableQuery('/menu', tableNumber)} className="btn-browse-menu">
            Explore Menu
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="cart-page">
      <header className="cart-header">
        <div>
          <span className="sub-title-caps">Selected Delicacies</span>
          <h1 className="cart-title">Your Order Bag</h1>
        </div>
        <span className="cart-count-badge">
          {totalItems} {totalItems === 1 ? 'item' : 'items'}
        </span>
      </header>

      <div className="cart-layout">
        {/* Items List Column */}
        <section className="cart-items-section" aria-label="Cart items">
          <h2 className="sr-only">Cart items list</h2>
          <div className="cart-items-list">
            {items.map((item) => (
              <CartItem key={item.id} item={item} />
            ))}
          </div>

          {/* Courier & Gate Instructions Card */}
          <div className="cart-courier-note-card">
            <div className="note-card-header">
              <span className="material-symbols-outlined text-terracotta" aria-hidden="true">
                notes
              </span>
              <div>
                <h3 className="note-card-title">Courier &amp; Delivery Instructions</h3>
                <p className="note-card-sub">
                  You can specify gate codes, apartment numbers, and preparation preferences during checkout.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Order Summary Sidebar */}
        <aside className="cart-summary" aria-label="Order summary">
          <h2 className="cart-summary-title">Payment Summary</h2>

          {/* Applied First-Order Promo Banner */}
          {isFirstOrder && (
            <div className="promo-badge-box">
              <div className="promo-badge-left">
                <span className="material-symbols-outlined promo-check-icon" aria-hidden="true">
                  check_circle
                </span>
                <div>
                  <div className="promo-tag-row">
                    <span className="promo-code">ADDISFIRST</span>
                    <span className="promo-status">Applied</span>
                  </div>
                  <span className="promo-text">
                    Welcome feast incentive: {formatCurrency(FIRST_ORDER_DISCOUNT)} saved on your first order!
                  </span>
                </div>
              </div>
            </div>
          )}

          <div className="cart-summary-rows">
            <div className="cart-summary-row">
              <span className="cart-summary-label">Items Subtotal ({totalItems}):</span>
              <span className="cart-summary-value">{formatCurrency(subtotal)}</span>
            </div>

            {tableNumber ? (
              <div className="cart-summary-row table-service-row">
                <span className="cart-summary-label">
                  Dining Station:
                </span>
                <span className="cart-summary-value text-accent font-semibold">
                  Table #{tableNumber} (Free)
                </span>
              </div>
            ) : (
              <div className="cart-summary-row">
                <span className="cart-summary-label">Estimated Delivery:</span>
                <span className="cart-summary-value text-muted">Calculated at Checkout</span>
              </div>
            )}

            {discount > 0 && (
              <div className="cart-summary-row discount-row">
                <span className="cart-summary-label">First-Order Discount:</span>
                <span className="cart-summary-value discount-value">
                  -{formatCurrency(discount)}
                </span>
              </div>
            )}

            <div className="cart-summary-row subtotal-row">
              <span className="cart-subtotal-label">Estimated Subtotal:</span>
              <span className="cart-subtotal-amount">{formatCurrency(estimatedTotal)}</span>
            </div>
          </div>

          <div className="cart-actions">
            <Link to={appendTableQuery('/checkout', tableNumber)} className="btn-checkout">
              Proceed to Checkout <span aria-hidden="true">&rarr;</span>
            </Link>
            <Link to={appendTableQuery('/menu', tableNumber)} className="btn-continue-shopping">
              <span aria-hidden="true">&larr; </span>Continue Shopping
            </Link>
          </div>
        </aside>
      </div>
    </div>
  )
}

export default Cart

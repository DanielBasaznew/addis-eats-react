import { Link } from 'react-router-dom'
import { useOrderHistoryStore, selectOrders } from './orderHistoryStore'
import OrderHistoryItem from './OrderHistoryItem'

function OrderHistory() {
  // Read orders directly from centralized orderHistoryStore
  const orders = useOrderHistoryStore(selectOrders)

  // Empty state when no orders have been placed yet
  if (!orders || orders.length === 0) {
    return (
      <div className="orders-page">
        <div className="orders-empty-state">
          <div className="orders-empty-icon-wrapper" aria-hidden="true">
            <span className="material-symbols-outlined empty-order-icon">
              receipt_long
            </span>
          </div>
          <h1 className="orders-empty-title">No Orders Placed Yet</h1>
          <p className="orders-empty-message">
            You haven&apos;t placed any orders yet. Discover our authentic Ethiopian dishes and place your first order!
          </p>
          <Link to="/menu" className="btn-browse-menu">
            Explore Menu
          </Link>
        </div>
      </div>
    )
  }

  // Active list of completed orders
  return (
    <div className="orders-page">
      <header className="orders-header">
        <div className="orders-header-text">
          <span className="sub-title-caps">Culinary History</span>
          <h1 className="orders-title">Past Deliveries</h1>
          <p className="orders-subtitle">
            Review your past orders, delivery manifests, and item receipts.
          </p>
        </div>
        <span className="orders-count-badge" aria-label={`${orders.length} total orders`}>
          {orders.length} {orders.length === 1 ? 'order' : 'orders'}
        </span>
      </header>

      <section className="orders-list-section" aria-label="Completed orders list">
        <div className="orders-list">
          {orders.map((order, index) => {
            const key = order.id || order.orderId || index
            return <OrderHistoryItem key={key} order={order} />
          })}
        </div>
      </section>
    </div>
  )
}

export default OrderHistory

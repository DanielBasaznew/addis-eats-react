import { useState, useMemo } from 'react'
import {
  useOrderHistoryStore,
  selectOrders,
  ORDER_STATUSES,
} from '../orders/orderHistoryStore'
import { formatCurrency } from '../utils/formatCurrency'
import AdminOrderDetailModal from './AdminOrderDetailModal'
import DeleteOrderModal from './DeleteOrderModal'

function AdminOrders() {
  const orders = useOrderHistoryStore(selectOrders)
  const updateOrderStatus = useOrderHistoryStore((state) => state.updateOrderStatus)
  const deleteOrder = useOrderHistoryStore((state) => state.deleteOrder)

  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [orderToDelete, setOrderToDelete] = useState(null)

  const statusOptions = useMemo(() => {
    return ['All', ...ORDER_STATUSES]
  }, [])

  const handleStatusChange = (orderId, newStatus) => {
    updateOrderStatus(orderId, newStatus)
    setSelectedOrder((prev) => {
      if (!prev) return null
      const currentId = prev.id || prev.orderId
      if (String(currentId) === String(orderId)) {
        return { ...prev, status: newStatus }
      }
      return prev
    })
  }

  const handleConfirmDelete = (orderId) => {
    deleteOrder(orderId)
    if (selectedOrder) {
      const currentId = selectedOrder.id || selectedOrder.orderId
      if (String(currentId) === String(orderId)) {
        setSelectedOrder(null)
      }
    }
    setOrderToDelete(null)
  }

  const filteredOrders = useMemo(() => {
    const query = searchQuery.trim().toLowerCase()

    return orders.filter((order) => {
      const orderStatus = order.status || 'Pending'
      const matchesStatus =
        statusFilter.toLowerCase() === 'all' ||
        orderStatus.toLowerCase() === statusFilter.toLowerCase()

      if (!matchesStatus) return false

      if (!query) return true

      const id = String(order.id || order.orderId || '').toLowerCase()
      const customer = String(
        order.customerName ||
        order.customer?.fullName ||
        order.customer?.name ||
        ''
      ).toLowerCase()
      const phone = String(
        order.customerPhone || order.customer?.phone || order.phone || ''
      ).toLowerCase()
      const address = String(
        order.deliveryAddress ||
        order.delivery?.address ||
        order.address ||
        ''
      ).toLowerCase()
      const area = String(
        order.deliveryArea ||
        order.delivery?.area ||
        order.area ||
        ''
      ).toLowerCase()
      const tableNumber = String(order.tableNumber || '').toLowerCase()
      const isTable = order.orderingType === 'table' || Boolean(order.tableNumber)
      const tableMatch = isTable && (
        tableNumber === query ||
        `table ${tableNumber}`.includes(query) ||
        `table #${tableNumber}`.includes(query) ||
        query === 'table' ||
        query === 'dine-in'
      )

      const matchesItems =
        Array.isArray(order.items) &&
        order.items.some((item) =>
          String(item.name || '').toLowerCase().includes(query)
        )

      return (
        id.includes(query) ||
        customer.includes(query) ||
        phone.includes(query) ||
        address.includes(query) ||
        area.includes(query) ||
        tableMatch ||
        matchesItems
      )
    })
  }, [orders, searchQuery, statusFilter])

  const formatOrderDate = (isoString) => {
    if (!isoString) return 'Recent'
    try {
      return new Date(isoString).toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    } catch {
      return 'Recent'
    }
  }

  const getItemsSummary = (order) => {
    const items = Array.isArray(order.items) ? order.items : []
    const totalCount =
      order.totalItems ??
      items.reduce((sum, item) => sum + (Number(item.quantity) || 1), 0)

    if (items.length === 0) return '0 items'

    const previewNames = items
      .slice(0, 2)
      .map((item) => item.name)
      .filter(Boolean)
      .join(', ')

    const hasMore = items.length > 2

    return {
      count: totalCount,
      preview: `${previewNames}${hasMore ? '...' : ''}`,
    }
  }

  return (
    <div className="admin-section-panel">
      <div className="panel-header">
        <div>
          <h2 className="panel-title">Order Management</h2>
          <p className="panel-subtitle">
            Review customer orders, delivery destinations, manifest line items, and fulfillment details.
          </p>
        </div>
        <div className="panel-header-badges">
          <span className="panel-badge panel-badge-live">
            {orders.length} {orders.length === 1 ? 'Order' : 'Orders'} Recorded
          </span>
        </div>
      </div>

      {orders.length === 0 ? (
        <div className="admin-state-box">
          <span
            className="material-symbols-outlined admin-state-icon"
            aria-hidden="true"
          >
            receipt_long
          </span>
          <h3 className="admin-state-title">No Customer Orders Yet</h3>
          <p className="admin-state-text">
            No orders have been recorded in the system yet. When customers complete checkout on the storefront, their orders will appear here automatically with full manifest details.
          </p>
        </div>
      ) : (
        <>
          <div className="admin-menu-toolbar">
            <div className="admin-search-wrapper">
              <span
                className="material-symbols-outlined search-icon"
                aria-hidden="true"
              >
                search
              </span>
              <input
                type="text"
                id="admin-order-search"
                className="admin-search-input"
                placeholder="Search by Order ID, customer, phone, or dish..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                aria-label="Search orders"
              />
              {searchQuery && (
                <button
                  type="button"
                  className="admin-search-clear"
                  onClick={() => setSearchQuery('')}
                  aria-label="Clear search input"
                >
                  &times;
                </button>
              )}
            </div>

            <div className="admin-filter-group">
              <div className="admin-select-wrapper">
                <select
                  id="admin-order-status-filter"
                  className="admin-filter-select"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  aria-label="Filter by order status"
                >
                  {statusOptions.map((opt) => (
                    <option key={opt} value={opt}>
                      Status: {opt}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {(searchQuery || statusFilter !== 'All') && (
            <div className="admin-toolbar-meta">
              <span>
                Showing <strong>{filteredOrders.length}</strong> of{' '}
                <strong>{orders.length}</strong> orders
                {searchQuery && ` matching "${searchQuery}"`}
                {statusFilter !== 'All' && ` with status "${statusFilter}"`}
              </span>
              <button
                type="button"
                className="admin-btn-reset-filters"
                onClick={() => {
                  setSearchQuery('')
                  setStatusFilter('All')
                }}
              >
                Reset filters
              </button>
            </div>
          )}

          {filteredOrders.length === 0 ? (
            <div className="admin-state-box">
              <span
                className="material-symbols-outlined admin-state-icon"
                aria-hidden="true"
              >
                search_off
              </span>
              <h3 className="admin-state-title">No Matching Orders</h3>
              <p className="admin-state-text">
                No orders match your search query &ldquo;{searchQuery}&rdquo;
                {statusFilter !== 'All' ? ` and status "${statusFilter}"` : ''}.
              </p>
              <button
                type="button"
                className="admin-btn-clear-search"
                onClick={() => {
                  setSearchQuery('')
                  setStatusFilter('All')
                }}
              >
                Clear Filters
              </button>
            </div>
          ) : (
            <div className="admin-table-container">
              <table
                className="admin-dishes-table admin-orders-table"
                aria-label="Customer orders list"
              >
                <thead>
                  <tr>
                    <th scope="col" className="col-order-id">
                      Order ID
                    </th>
                    <th scope="col" className="col-customer">
                      Customer
                    </th>
                    <th scope="col" className="col-date">
                      Date &amp; Time
                    </th>
                    <th scope="col" className="col-items">
                      Items / Count
                    </th>
                    <th scope="col" className="col-total">
                      Total
                    </th>
                    <th scope="col" className="col-status">
                      Status
                    </th>
                    <th scope="col" className="col-actions">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOrders.map((order, idx) => {
                    const orderId = order.id || order.orderId || `ORD-${idx + 1}`
                    const customerName =
                      order.customerName ||
                      order.customer?.fullName ||
                      order.customer?.name ||
                      'Guest Customer'
                    const customerPhone =
                      order.customerPhone ||
                      order.customer?.phone ||
                      order.phone ||
                      ''
                    const orderDate = order.createdAt || order.date
                    const grandTotal = Number(
                      order.grandTotal ?? order.total ?? 0
                    )
                    const status = order.status || 'Received'
                    const itemsSummary = getItemsSummary(order)
                    const statusKey = status.toLowerCase().replace(/\s+/g, '-')

                    return (
                      <tr key={orderId} className="admin-table-row">
                        <td className="col-order-id">
                          <div className="admin-order-id-cell">
                            <span className="admin-order-id-tag">#{orderId}</span>
                            {order.orderingType === 'table' || order.tableNumber ? (
                              <span className="admin-order-type-badge table">
                                <span className="material-symbols-outlined type-icon" aria-hidden="true">table_restaurant</span>
                                Table {order.tableNumber}
                              </span>
                            ) : (
                              <span className="admin-order-type-badge delivery">
                                <span className="material-symbols-outlined type-icon" aria-hidden="true">delivery_dining</span>
                                Delivery
                              </span>
                            )}
                          </div>
                        </td>

                        <td className="col-customer">
                          <div className="admin-order-customer-cell">
                            <span className="admin-order-customer-name">
                              {customerName}
                            </span>
                            {customerPhone && (
                              <span className="admin-order-customer-phone">
                                {customerPhone}
                              </span>
                            )}
                          </div>
                        </td>

                        <td className="col-date">
                          <span className="admin-order-date-text">
                            {formatOrderDate(orderDate)}
                          </span>
                        </td>

                        <td className="col-items">
                          <div className="admin-order-items-cell">
                            <span className="admin-order-items-badge">
                              {itemsSummary.count}{' '}
                              {itemsSummary.count === 1 ? 'item' : 'items'}
                            </span>
                            {itemsSummary.preview && (
                              <span
                                className="admin-order-items-preview"
                                title={itemsSummary.preview}
                              >
                                {itemsSummary.preview}
                              </span>
                            )}
                          </div>
                        </td>

                        <td className="col-total">
                          <span className="admin-price-value admin-order-total-value">
                            {formatCurrency(grandTotal)}
                          </span>
                        </td>

                        <td className="col-status">
                          <div className="admin-status-control-wrap">
                            <select
                              className={`admin-order-status-select status-${statusKey}`}
                              value={status}
                              onChange={(e) => handleStatusChange(orderId, e.target.value)}
                              aria-label={`Update status for order #${orderId}`}
                            >
                              {ORDER_STATUSES.map((st) => (
                                <option key={st} value={st}>
                                  {st}
                                </option>
                              ))}
                            </select>
                          </div>
                        </td>

                        <td className="col-actions">
                          <div className="admin-actions-group">
                            <button
                              type="button"
                              className="admin-btn-action edit btn-view-order-details"
                              onClick={() => setSelectedOrder(order)}
                              title={`View full details for order #${orderId}`}
                              aria-label={`View details for order #${orderId}`}
                            >
                              <span
                                className="material-symbols-outlined action-icon"
                                aria-hidden="true"
                              >
                                visibility
                              </span>
                              <span>View Details</span>
                            </button>
                            <button
                              type="button"
                              className="admin-btn-action delete btn-delete-order"
                              onClick={() => setOrderToDelete(order)}
                              title={`Delete order #${orderId}`}
                              aria-label={`Delete order #${orderId}`}
                            >
                              <span
                                className="material-symbols-outlined action-icon"
                                aria-hidden="true"
                              >
                                delete
                              </span>
                              <span>Delete</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {selectedOrder && (
        <AdminOrderDetailModal
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
          onStatusChange={handleStatusChange}
          onDeleteOrder={(ord) => setOrderToDelete(ord)}
        />
      )}

      {orderToDelete && (
        <DeleteOrderModal
          order={orderToDelete}
          isOpen={Boolean(orderToDelete)}
          onClose={() => setOrderToDelete(null)}
          onConfirmDelete={handleConfirmDelete}
        />
      )}
    </div>
  )
}

export default AdminOrders

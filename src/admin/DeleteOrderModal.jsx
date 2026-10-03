import { useEffect } from 'react'
import { formatCurrency } from '../utils/formatCurrency'

function DeleteOrderModal({ order, isOpen, onClose, onConfirmDelete }) {
  useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  if (!isOpen || !order) return null

  const orderId = order.id || order.orderId || 'N/A'
  const customerName =
    order.customerName ||
    order.customer?.fullName ||
    order.customer?.name ||
    'Guest Customer'
  const customerPhone =
    order.customerPhone || order.customer?.phone || order.phone || ''
  const grandTotal = Number(order.grandTotal ?? order.total ?? 0)
  const status = order.status || 'Pending'

  const items = Array.isArray(order.items) ? order.items : []
  const itemsCount =
    order.totalItems ??
    items.reduce((sum, item) => sum + (Number(item.quantity) || 1), 0)

  const formattedDate = order.createdAt || order.date
    ? new Date(order.createdAt || order.date).toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : 'Recent'

  const handleConfirm = () => {
    onConfirmDelete(orderId)
    onClose()
  }

  return (
    <div
      className="admin-modal-backdrop"
      role="presentation"
      onClick={onClose}
    >
      <div
        className="admin-modal-dialog admin-delete-modal-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="delete-order-modal-title"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="admin-modal-header admin-delete-modal-header">
          <div className="admin-delete-header-meta">
            <div className="admin-delete-icon-wrap" aria-hidden="true">
              <span className="material-symbols-outlined">warning</span>
            </div>
            <div>
              <span className="sub-title-caps text-danger">Warning — Irreversible Action</span>
              <h3 id="delete-order-modal-title" className="admin-modal-title">
                Delete Order
              </h3>
            </div>
          </div>
          <button
            type="button"
            className="admin-modal-close"
            onClick={onClose}
            aria-label="Close dialog"
          >
            &times;
          </button>
        </header>

        <div className="admin-modal-body admin-delete-modal-body">
          <p className="admin-delete-confirm-text">
            Are you sure you want to permanently delete order <strong>#{orderId}</strong> placed by <strong>{customerName}</strong>?
          </p>

          <div className="admin-delete-dish-preview">
            <div className="preview-row">
              <span className="preview-label">Order ID:</span>
              <span className="preview-value">#{orderId}</span>
            </div>
            <div className="preview-row">
              <span className="preview-label">Customer:</span>
              <span className="preview-value">
                {customerName}
                {customerPhone ? ` (${customerPhone})` : ''}
              </span>
            </div>
            <div className="preview-row">
              <span className="preview-label">Date &amp; Time:</span>
              <span className="preview-value">{formattedDate}</span>
            </div>
            <div className="preview-row">
              <span className="preview-label">Items Count:</span>
              <span className="preview-value">
                {itemsCount} {itemsCount === 1 ? 'item' : 'items'}
              </span>
            </div>
            <div className="preview-row">
              <span className="preview-label">Total Amount:</span>
              <span className="preview-value">{formatCurrency(grandTotal)}</span>
            </div>
            <div className="preview-row">
              <span className="preview-label">Current Status:</span>
              <span className="preview-value">{status}</span>
            </div>
          </div>

          <p className="admin-delete-subtext">
            This order record will be permanently deleted from the store and cannot be recovered.
          </p>
        </div>

        <footer className="admin-modal-footer">
          <button
            type="button"
            className="admin-modal-btn cancel"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            type="button"
            className="admin-modal-btn btn-danger-delete"
            onClick={handleConfirm}
            autoFocus
          >
            Delete Order
          </button>
        </footer>
      </div>
    </div>
  )
}

export default DeleteOrderModal

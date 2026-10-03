import { useEffect } from 'react'
import { formatCurrency } from '../utils/formatCurrency'

function DeleteDishModal({ dish, isOpen, onClose, onConfirmDelete }) {
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

  if (!isOpen || !dish) return null

  const handleConfirm = () => {
    onConfirmDelete(dish.id)
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
        aria-labelledby="delete-dish-modal-title"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="admin-modal-header admin-delete-modal-header">
          <div className="admin-delete-header-meta">
            <div className="admin-delete-icon-wrap" aria-hidden="true">
              <span className="material-symbols-outlined">warning</span>
            </div>
            <div>
              <span className="sub-title-caps text-danger">Warning — Irreversible Action</span>
              <h3 id="delete-dish-modal-title" className="admin-modal-title">
                Delete Dish
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
            Are you sure you want to permanently delete <strong>&ldquo;{dish.name}&rdquo;</strong> from the menu catalog?
          </p>

          <div className="admin-delete-dish-preview">
            <div className="preview-row">
              <span className="preview-label">Category:</span>
              <span className="preview-value">{dish.category || 'General'}</span>
            </div>
            <div className="preview-row">
              <span className="preview-label">Price:</span>
              <span className="preview-value">{formatCurrency(dish.price)}</span>
            </div>
            <div className="preview-row">
              <span className="preview-label">Status:</span>
              <span className="preview-value">
                {dish.available !== false ? 'Available' : 'Sold Out'}
              </span>
            </div>
          </div>

          <p className="admin-delete-subtext">
            This dish will be removed immediately from both the internal admin catalog and the customer storefront.
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
            Delete Dish
          </button>
        </footer>
      </div>
    </div>
  )
}

export default DeleteDishModal

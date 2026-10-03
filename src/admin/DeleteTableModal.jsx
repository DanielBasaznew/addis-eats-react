import { useEffect } from 'react'

function DeleteTableModal({ table, isOpen, onClose, onConfirmDelete }) {
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

  if (!isOpen || !table) return null

  const handleConfirm = () => {
    onConfirmDelete(table.id)
    onClose()
  }

  const origin = typeof window !== 'undefined' ? window.location.origin : ''
  const targetUrl = `${origin}/menu?table=${table.number}`

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
        aria-labelledby="delete-table-modal-title"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="admin-modal-header admin-delete-modal-header">
          <div className="admin-delete-header-meta">
            <div className="admin-delete-icon-wrap" aria-hidden="true">
              <span className="material-symbols-outlined">warning</span>
            </div>
            <div>
              <span className="sub-title-caps text-danger">Warning — Irreversible Action</span>
              <h3 id="delete-table-modal-title" className="admin-modal-title">
                Delete Table
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
            Are you sure you want to permanently delete <strong>Table {table.number}</strong> ({table.label})?
          </p>

          <div className="admin-delete-dish-preview">
            <div className="preview-row">
              <span className="preview-label">Table Number:</span>
              <span className="preview-value">Table {table.number}</span>
            </div>
            <div className="preview-row">
              <span className="preview-label">Section / Area:</span>
              <span className="preview-value">{table.label || 'General Dining'}</span>
            </div>
            <div className="preview-row">
              <span className="preview-label">Seating Capacity:</span>
              <span className="preview-value">{table.seats || 4} seats</span>
            </div>
            <div className="preview-row">
              <span className="preview-label">Encoded Menu Link:</span>
              <span className="preview-value" style={{ wordBreak: 'break-all', fontSize: '0.8rem' }}>
                {targetUrl}
              </span>
            </div>
          </div>

          <p className="admin-delete-subtext">
            Any physical QR codes, table tents, or printed stickers for this table station will no longer be recognized.
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
            Delete Table
          </button>
        </footer>
      </div>
    </div>
  )
}

export default DeleteTableModal

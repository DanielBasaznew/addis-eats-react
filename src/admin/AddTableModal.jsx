import { useState, useEffect, useCallback } from 'react'

function AddTableModal({ isOpen, onClose, onAddTable, existingTables = [] }) {
  const [tableNumber, setTableNumber] = useState('')
  const [label, setLabel] = useState('')
  const [seats, setSeats] = useState('4')
  const [errors, setErrors] = useState({})

  const handleReset = useCallback(() => {
    setTableNumber('')
    setLabel('')
    setSeats('4')
    setErrors({})
  }, [])

  const handleClose = useCallback(() => {
    handleReset()
    onClose()
  }, [handleReset, onClose])

  useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        handleClose()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, handleClose])

  if (!isOpen) return null

  const handleSubmit = (e) => {
    e.preventDefault()
    const newErrors = {}
    const trimmedNumber = tableNumber.trim()

    if (!trimmedNumber) {
      newErrors.number = 'Table number is required.'
    } else {
      const isDuplicate = existingTables.some(
        (tbl) => String(tbl.number).toLowerCase() === trimmedNumber.toLowerCase()
      )
      if (isDuplicate) {
        newErrors.number = `Table "${trimmedNumber}" already exists. Please choose a unique number.`
      }
    }

    const parsedSeats = parseInt(seats, 10)
    if (isNaN(parsedSeats) || parsedSeats < 1) {
      newErrors.seats = 'Seating capacity must be at least 1.'
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    onAddTable({
      number: trimmedNumber,
      label: label.trim() || 'General Dining',
      seats: parsedSeats,
    })

    handleClose()
  }

  return (
    <div
      className="admin-modal-backdrop"
      role="presentation"
      onClick={handleClose}
    >
      <div
        className="admin-modal-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="add-table-modal-title"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="admin-modal-header">
          <div>
            <span className="sub-title-caps">Dining Station Setup</span>
            <h3 id="add-table-modal-title" className="admin-modal-title">
              Register New Table
            </h3>
          </div>
          <button
            type="button"
            className="admin-modal-close"
            onClick={handleClose}
            aria-label="Close dialog"
          >
            &times;
          </button>
        </header>

        <form onSubmit={handleSubmit} noValidate>
          <div className="admin-modal-body">
            <div className="admin-form-group">
              <label htmlFor="add-table-number" className="admin-form-label">
                Table Number / Identifier <span className="required-star">*</span>
              </label>
              <input
                type="text"
                id="add-table-number"
                className={`admin-form-input ${errors.number ? 'input-error' : ''}`}
                placeholder="e.g. 7, 12, T-10, VIP-2"
                value={tableNumber}
                onChange={(e) => {
                  setTableNumber(e.target.value)
                  if (errors.number) setErrors((prev) => ({ ...prev, number: null }))
                }}
                autoFocus
                aria-invalid={Boolean(errors.number)}
                aria-describedby={errors.number ? 'add-table-number-error' : undefined}
              />
              {errors.number && (
                <span id="add-table-number-error" className="admin-form-error" role="alert">
                  {errors.number}
                </span>
              )}
            </div>

            <div className="admin-form-group">
              <label htmlFor="add-table-label" className="admin-form-label">
                Section / Area Label
              </label>
              <input
                type="text"
                id="add-table-label"
                className="admin-form-input"
                placeholder="e.g. Garden Patio, Window Booth, Main Hall, Rooftop"
                value={label}
                onChange={(e) => setLabel(e.target.value)}
              />
              <span className="admin-form-hint">
                Helps floor staff identify the table zone.
              </span>
            </div>

            <div className="admin-form-group">
              <label htmlFor="add-table-seats" className="admin-form-label">
                Seating Capacity
              </label>
              <input
                type="number"
                id="add-table-seats"
                min="1"
                max="50"
                className={`admin-form-input ${errors.seats ? 'input-error' : ''}`}
                value={seats}
                onChange={(e) => {
                  setSeats(e.target.value)
                  if (errors.seats) setErrors((prev) => ({ ...prev, seats: null }))
                }}
                aria-invalid={Boolean(errors.seats)}
                aria-describedby={errors.seats ? 'add-table-seats-error' : undefined}
              />
              {errors.seats && (
                <span id="add-table-seats-error" className="admin-form-error" role="alert">
                  {errors.seats}
                </span>
              )}
            </div>
          </div>

          <footer className="admin-modal-footer">
            <button
              type="button"
              className="admin-modal-btn cancel"
              onClick={handleClose}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="admin-modal-btn save"
            >
              Create Table &amp; Generate QR
            </button>
          </footer>
        </form>
      </div>
    </div>
  )
}

export default AddTableModal

import { useState, useEffect, useCallback } from 'react'

function AddDishModal({ categories, isOpen, onClose, onAddDish }) {
  const defaultCategory =
    categories && categories.length > 0 ? categories[0] : 'Traditional'

  const [form, setForm] = useState({
    name: '',
    price: '',
    category: defaultCategory,
    available: true,
  })

  const [errors, setErrors] = useState({})

  const handleClose = useCallback(() => {
    setForm({
      name: '',
      price: '',
      category: defaultCategory,
      available: true,
    })
    setErrors({})
    onClose()
  }, [defaultCategory, onClose])

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

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: null }))
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const validationErrors = {}
    const trimmedName = form.name.trim()
    const parsedPrice = parseFloat(form.price)
    const trimmedCategory = form.category.trim()

    if (!trimmedName) {
      validationErrors.name = 'Dish name is required.'
    }

    if (isNaN(parsedPrice) || parsedPrice <= 0) {
      validationErrors.price = 'Price must be a valid number greater than 0.'
    }

    if (!trimmedCategory) {
      validationErrors.category = 'Category is required.'
    }

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      return
    }

    onAddDish({
      name: trimmedName,
      price: parsedPrice,
      category: trimmedCategory,
      available: Boolean(form.available),
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
        aria-labelledby="add-dish-modal-title"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="admin-modal-header">
          <div>
            <span className="sub-title-caps">Menu Catalog Control</span>
            <h3 id="add-dish-modal-title" className="admin-modal-title">
              Add New Dish
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

        <form onSubmit={handleSubmit} className="admin-modal-form" noValidate>
          <div className="admin-modal-body">
            <div className="admin-form-group">
              <label htmlFor="add-dish-name" className="admin-form-label">
                Dish Name <span className="required-star">*</span>
              </label>
              <input
                type="text"
                id="add-dish-name"
                className={`admin-form-input ${errors.name ? 'input-error' : ''}`}
                value={form.name}
                onChange={(e) => handleChange('name', e.target.value)}
                placeholder="e.g. Gored Gored Special"
                aria-invalid={Boolean(errors.name)}
                aria-describedby={errors.name ? 'add-name-error' : undefined}
                autoFocus
              />
              {errors.name && (
                <span id="add-name-error" className="admin-form-error">
                  {errors.name}
                </span>
              )}
            </div>

            <div className="admin-form-group">
              <label htmlFor="add-dish-price" className="admin-form-label">
                Price (ETB) <span className="required-star">*</span>
              </label>
              <input
                type="number"
                id="add-dish-price"
                step="any"
                min="1"
                className={`admin-form-input ${errors.price ? 'input-error' : ''}`}
                value={form.price}
                onChange={(e) => handleChange('price', e.target.value)}
                placeholder="e.g. 350"
                aria-invalid={Boolean(errors.price)}
                aria-describedby={errors.price ? 'add-price-error' : undefined}
              />
              {errors.price && (
                <span id="add-price-error" className="admin-form-error">
                  {errors.price}
                </span>
              )}
            </div>

            <div className="admin-form-group">
              <label htmlFor="add-dish-category" className="admin-form-label">
                Category <span className="required-star">*</span>
              </label>
              <select
                id="add-dish-category"
                className={`admin-form-select ${errors.category ? 'input-error' : ''}`}
                value={form.category}
                onChange={(e) => handleChange('category', e.target.value)}
                aria-invalid={Boolean(errors.category)}
                aria-describedby={errors.category ? 'add-category-error' : undefined}
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
              {errors.category && (
                <span id="add-category-error" className="admin-form-error">
                  {errors.category}
                </span>
              )}
            </div>

            <div className="admin-form-group admin-availability-control">
              <span className="admin-form-label">Availability Status</span>
              <label
                className="admin-toggle-switch-label"
                htmlFor="add-dish-available"
              >
                <input
                  type="checkbox"
                  id="add-dish-available"
                  checked={form.available}
                  onChange={(e) => handleChange('available', e.target.checked)}
                  className="admin-switch-checkbox"
                />
                <span className="admin-switch-slider" aria-hidden="true" />
                <span className="admin-switch-text">
                  {form.available ? (
                    <span className="switch-status available">
                      <span className="badge-dot" aria-hidden="true" /> Available to order
                    </span>
                  ) : (
                    <span className="switch-status unavailable">
                      <span className="badge-dot" aria-hidden="true" /> Sold Out (Disabled)
                    </span>
                  )}
                </span>
              </label>
            </div>
          </div>

          <footer className="admin-modal-footer">
            <button
              type="button"
              className="admin-modal-btn cancel"
              onClick={onClose}
            >
              Cancel
            </button>
            <button type="submit" className="admin-modal-btn save">
              Add Dish
            </button>
          </footer>
        </form>
      </div>
    </div>
  )
}

export default AddDishModal

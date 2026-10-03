import { useState, useEffect } from 'react'
import { useParams, Link, useSearchParams } from 'react-router-dom'
import { fetchDishById } from '../api/dishes'
import { useCartStore } from '../cart/cartStore'
import { formatCurrency } from '../utils/formatCurrency'
import FavoriteButton from '../favorites/FavoriteButton'
import { appendTableQuery, getTableNumber } from '../utils/tableOrder'
import { DishDetailSkeleton, Skeleton } from '../skeleton'

function DishDetail() {
  const { id } = useParams()
  const [searchParams] = useSearchParams()
  const tableNumber = getTableNumber(searchParams)
  const [dish, setDish] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [quantity, setQuantity] = useState(1)
  const [addedToast, setAddedToast] = useState(false)
  const [imageLoaded, setImageLoaded] = useState(false)

  const addItem = useCartStore((state) => state.addItem)

  useEffect(() => {
    let isMounted = true

    async function loadDish() {
      try {
        setLoading(true)
        setError(null)
        const data = await fetchDishById(id)
        if (isMounted) {
          setDish(data)
        }
      } catch (err) {
        if (isMounted) {
          setError(err.message || 'Failed to load dish details.')
        }
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    loadDish()

    return () => {
      isMounted = false
    }
  }, [id])

  const handleDecrease = () => {
    setQuantity((prev) => (prev > 1 ? prev - 1 : 1))
  }

  const handleIncrease = () => {
    setQuantity((prev) => prev + 1)
  }

  const handleAddToCart = () => {
    if (!dish || dish.available === false) return
    addItem(dish, quantity)
    setAddedToast(true)
    setTimeout(() => setAddedToast(false), 2000)
  }

  if (loading) {
    return <DishDetailSkeleton />
  }

  if (error) {
    return (
      <div className="dish-detail-page">
        <div className="status-box error">
          <p>Error: {error}</p>
          <Link to="/menu" className="btn btn-secondary">
            Back to Menu
          </Link>
        </div>
      </div>
    )
  }

  if (!dish) {
    return (
      <div className="dish-detail-page">
        <div className="status-box not-found">
          <h2>Dish Not Found</h2>
          <p>We could not find a dish matching ID &ldquo;{id}&rdquo;.</p>
          <Link to="/menu" className="btn btn-primary">
            Browse Menu
          </Link>
        </div>
      </div>
    )
  }

  const isAvailable = dish.available !== false
  const dishPrice = Number(dish.price) || 0
  const subtotal = dishPrice * quantity

  return (
    <div className="dish-detail-page">
      {/* Breadcrumb Navigation */}
      <nav className="detail-breadcrumb" aria-label="Breadcrumb navigation">
        <Link to={appendTableQuery('/menu', tableNumber)} className="breadcrumb-link">
          <span className="material-symbols-outlined" aria-hidden="true">
            arrow_back
          </span>
          <span>Back to Menu</span>
        </Link>
        {tableNumber && (
          <span className="detail-table-pill">
            <span className="material-symbols-outlined" aria-hidden="true">table_restaurant</span>
            <span>Table #{tableNumber}</span>
          </span>
        )}
        <span className="breadcrumb-separator" aria-hidden="true">/</span>
        <span className="breadcrumb-category">{dish.category}</span>
        <span className="breadcrumb-separator" aria-hidden="true">/</span>
        <span className="breadcrumb-current" aria-current="page">{dish.name}</span>
      </nav>

      {/* Main 2-Column Detail Card */}
      <div className="dish-detail-layout">
        {/* Left Column: Visual Media Stage */}
        <div className="detail-visual">
          <div className="detail-image-wrapper">
            {!imageLoaded && (
              <Skeleton
                variant="rectangular"
                style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', borderRadius: 0 }}
              />
            )}
            <img
              src={dish.image}
              alt={dish.name}
              className="detail-image"
              loading="eager"
              onLoad={() => setImageLoaded(true)}
              style={{ opacity: imageLoaded ? 1 : 0, transition: 'opacity 0.25s ease' }}
            />
            <span className="detail-category-tag">{dish.category}</span>
            <span
              className={`detail-status-tag ${
                isAvailable ? 'available' : 'unavailable'
              }`}
            >
              {isAvailable ? 'In Stock' : 'Sold Out'}
            </span>
            <FavoriteButton dish={dish} className="detail-favorite-btn" />
          </div>
        </div>

        {/* Right Column: Dish Info & Ordering Actions */}
        <div className="detail-info">
          <div className="detail-header">
            <span className="detail-eyebrow">Traditional Specialty</span>
            <h1 className="detail-title">{dish.name}</h1>
            <div className="detail-price-row">
              <span className="detail-price">{formatCurrency(dish.price)}</span>
              <span className="detail-portion">Fresh Portion with Teff Injera</span>
            </div>
          </div>

          <p className="detail-description">{dish.description}</p>

          {/* Ingredients Section */}
          {dish.ingredients && dish.ingredients.length > 0 && (
            <div className="detail-ingredients-section">
              <h2 className="ingredients-heading">Ingredients &amp; Spices</h2>
              <div className="ingredients-chips-wrap">
                {dish.ingredients.map((ingredient, index) => (
                  <span key={index} className="ingredient-chip">
                    {ingredient}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Order Action Panel */}
          <div className="detail-order-panel">
            <div className="order-stepper-row">
              <div className="quantity-stepper">
                <span className="stepper-label">Quantity</span>
                <div
                  className="stepper-controls"
                  role="group"
                  aria-label={`Quantity controls for ${dish.name}`}
                >
                  <button
                    type="button"
                    className="btn-step"
                    onClick={handleDecrease}
                    disabled={quantity <= 1}
                    aria-label="Decrease quantity"
                  >
                    &minus;
                  </button>
                  <span className="step-val" aria-live="polite">
                    {quantity}
                  </span>
                  <button
                    type="button"
                    className="btn-step"
                    onClick={handleIncrease}
                    aria-label="Increase quantity"
                  >
                    &#43;
                  </button>
                </div>
              </div>

              <div className="order-subtotal">
                <span className="subtotal-label">Subtotal</span>
                <span className="subtotal-amount">{formatCurrency(subtotal)}</span>
              </div>
            </div>

            {/* Add to Cart CTA */}
            {isAvailable ? (
              <button
                type="button"
                className={`btn btn-primary btn-add-cart ${
                  addedToast ? 'btn-added' : ''
                }`}
                onClick={handleAddToCart}
              >
                <span className="material-symbols-outlined" aria-hidden="true">
                  {addedToast ? 'check_circle' : 'shopping_bag'}
                </span>
                <span>
                  {addedToast
                    ? 'Added to Bag!'
                    : `Add to Bag • ${formatCurrency(subtotal)}`}
                </span>
              </button>
            ) : (
              <button
                type="button"
                className="btn btn-primary btn-add-cart disabled"
                disabled
              >
                Currently Sold Out
              </button>
            )}

            {/* Quick Helper Links */}
            <div className="detail-helper-links">
              <Link to={appendTableQuery('/cart', tableNumber)} className="link-cart">
                Go to Bag &rarr;
              </Link>
              <Link to={appendTableQuery('/menu', tableNumber)} className="link-menu">
                &larr; Continue Exploring Menu
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DishDetail

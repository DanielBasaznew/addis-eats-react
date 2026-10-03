import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useCartStore } from '../cart/cartStore'
import { formatCurrency } from '../utils/formatCurrency'
import FavoriteButton from '../favorites/FavoriteButton'
import { appendTableQuery, getTableNumber } from '../utils/tableOrder'
import { Skeleton } from '../skeleton'

function DishCard({ dish, tableNumber }) {
  const { id, name, description, price, category, image, ingredients, available } = dish
  const addItem = useCartStore((state) => state.addItem)
  const effectiveTable = tableNumber || getTableNumber()
  const [imageLoaded, setImageLoaded] = useState(false)

  const isAvailable = available !== false

  const handleAddToCart = () => {
    if (!isAvailable) return
    addItem(dish)
  }

  return (
    <article className="dish-card">
      <div className="dish-card-image-wrapper">
        {!imageLoaded && (
          <Skeleton
            variant="rectangular"
            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', borderRadius: 0 }}
          />
        )}
        <img
          src={image}
          alt={name}
          className="dish-card-image"
          loading="lazy"
          onLoad={() => setImageLoaded(true)}
          style={{ opacity: imageLoaded ? 1 : 0, transition: 'opacity 0.25s ease' }}
        />
        <span className="dish-category-badge">{category}</span>
        {available !== undefined && (
          <span className={`dish-status-badge ${available ? 'available' : 'unavailable'}`}>
            {available ? 'Available' : 'Sold Out'}
          </span>
        )}
        <FavoriteButton dish={dish} className="dish-card-favorite" />
      </div>

      <div className="dish-card-body">
        <div className="dish-card-header">
          <h3 className="dish-card-title">{name}</h3>
          <span className="dish-card-price">{formatCurrency(price)}</span>
        </div>

        <p className="dish-card-description">{description}</p>

        {ingredients && ingredients.length > 0 && (
          <div className="dish-card-ingredients" aria-label="Ingredients">
            {ingredients.slice(0, 3).map((ingredient, i) => (
              <span key={i} className="ingredient-tag">
                {ingredient}
              </span>
            ))}
            {ingredients.length > 3 && (
              <span className="ingredient-tag-more">
                +{ingredients.length - 3}
              </span>
            )}
          </div>
        )}

        <div className="dish-card-footer">
          <Link
            to={appendTableQuery(`/menu/${id}`, effectiveTable)}
            className="dish-detail-link"
            aria-label={`View details for ${name}`}
          >
            View Details <span aria-hidden="true">&rarr;</span>
          </Link>
          {isAvailable ? (
            <button
              type="button"
              className="add-to-cart-btn"
              onClick={handleAddToCart}
              aria-label={`Add ${name} to cart`}
            >
              Add to Cart
            </button>
          ) : (
            <button
              type="button"
              className="add-to-cart-btn disabled"
              disabled
              aria-label={`${name} is sold out`}
            >
              Sold Out
            </button>
          )}
        </div>
      </div>
    </article>
  )
}

export default DishCard

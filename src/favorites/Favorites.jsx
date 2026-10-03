import { Link } from 'react-router-dom'
import { useFavoritesStore, selectFavorites } from './favoritesStore'
import { useCartStore } from '../cart/cartStore'
import FavoriteButton from './FavoriteButton'
import { formatCurrency } from '../utils/formatCurrency'

function Favorites() {
  // Read saved favorites directly from centralized store
  const favorites = useFavoritesStore(selectFavorites)
  const addItem = useCartStore((state) => state.addItem)

  const handleAddToCart = (dish) => {
    if (dish.available === false) return
    addItem(dish)
  }

  // Empty state when no dishes have been favorited yet
  if (!favorites || favorites.length === 0) {
    return (
      <div className="favorites-page">
        <div className="favorites-empty-state">
          <div className="favorites-empty-icon-wrapper" aria-hidden="true">
            <span className="material-symbols-outlined empty-fav-icon">
              favorite
            </span>
          </div>
          <h1 className="favorites-empty-title">No Saved Favorites Yet</h1>
          <p className="favorites-empty-message">
            You haven&apos;t saved any dishes to your favorites yet. Explore our authentic Ethiopian menu and click the heart icon on any dish you love!
          </p>
          <Link to="/menu" className="btn-browse-menu">
            Explore Menu
          </Link>
        </div>
      </div>
    )
  }

  // Active list of favorite dishes
  return (
    <div className="favorites-page">
      <header className="favorites-header">
        <div className="favorites-header-text">
          <span className="sub-title-caps">Saved Collection</span>
          <h1 className="favorites-title">Your Favorite Dishes</h1>
          <p className="favorites-subtitle">
            Curated dishes saved for effortless reordering and culinary enjoyment.
          </p>
        </div>
        <span
          className="favorites-count-badge"
          aria-label={`${favorites.length} saved favorites`}
        >
          {favorites.length} {favorites.length === 1 ? 'favorite' : 'favorites'}
        </span>
      </header>

      <section
        className="favorites-grid-section"
        aria-label="List of favorite dishes"
      >
        <h2 className="sr-only">Saved favorite dishes</h2>
        <div className="dish-grid">
          {favorites.map((dish) => {
            const isAvailable = dish.available !== false

            return (
              <article key={dish.id} className="dish-card favorite-dish-card">
                <div className="dish-card-image-wrapper">
                  {dish.image && (
                    <img
                      src={dish.image}
                      alt={dish.name}
                      className="dish-card-image"
                      loading="lazy"
                    />
                  )}
                  {dish.category && (
                    <span className="dish-category-badge">{dish.category}</span>
                  )}
                  {dish.available !== undefined && (
                    <span
                      className={`dish-status-badge ${
                        isAvailable ? 'available' : 'unavailable'
                      }`}
                    >
                      {isAvailable ? 'Available' : 'Sold Out'}
                    </span>
                  )}
                  <FavoriteButton dish={dish} className="dish-card-favorite" />
                </div>

                <div className="dish-card-body">
                  <div className="dish-card-header">
                    <h3 className="dish-card-title">{dish.name}</h3>
                    <span className="dish-card-price">
                      {formatCurrency(dish.price)}
                    </span>
                  </div>

                  {dish.description && (
                    <p className="dish-card-description">{dish.description}</p>
                  )}

                  {dish.ingredients && dish.ingredients.length > 0 && (
                    <div className="dish-card-ingredients" aria-label="Ingredients">
                      {dish.ingredients.slice(0, 3).map((ingredient, i) => (
                        <span key={i} className="ingredient-tag">
                          {ingredient}
                        </span>
                      ))}
                      {dish.ingredients.length > 3 && (
                        <span className="ingredient-tag-more">
                          +{dish.ingredients.length - 3}
                        </span>
                      )}
                    </div>
                  )}

                  <div className="dish-card-footer favorite-card-footer">
                    <Link
                      to={`/menu/${dish.id}`}
                      className="dish-detail-link"
                      aria-label={`View details for ${dish.name}`}
                    >
                      View Details <span aria-hidden="true">&rarr;</span>
                    </Link>
                    {isAvailable ? (
                      <button
                        type="button"
                        className="add-to-cart-btn"
                        onClick={() => handleAddToCart(dish)}
                        aria-label={`Add ${dish.name} to cart`}
                      >
                        Add to Cart
                      </button>
                    ) : (
                      <button
                        type="button"
                        className="add-to-cart-btn disabled"
                        disabled
                        aria-label={`${dish.name} is sold out`}
                      >
                        Sold Out
                      </button>
                    )}
                  </div>
                </div>
              </article>
            )
          })}
        </div>
      </section>
    </div>
  )
}

export default Favorites

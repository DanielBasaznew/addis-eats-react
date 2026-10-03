import { useFavoritesStore } from './favoritesStore'

function FavoriteButton({ dish, className = '' }) {
  const dishId = dish?.id

  // Subscribe directly to favorites state using the dish ID
  const isFav = useFavoritesStore((state) =>
    dishId !== undefined && dishId !== null
      ? state.favorites.some((item) => String(item.id) === String(dishId))
      : false
  )
  const toggleFavorite = useFavoritesStore((state) => state.toggleFavorite)

  if (!dish || dishId === undefined || dishId === null) {
    return null
  }

  const dishName = dish.name || 'dish'
  const accessibleLabel = isFav
    ? `Remove ${dishName} from favorites`
    : `Add ${dishName} to favorites`

  const handleClick = (e) => {
    // Prevent bubbling to parent card links or navigation triggers
    e.preventDefault()
    e.stopPropagation()
    toggleFavorite(dish)
  }

  return (
    <button
      type="button"
      className={`favorite-btn ${isFav ? 'favorited' : ''} ${className}`.trim()}
      onClick={handleClick}
      aria-label={accessibleLabel}
      aria-pressed={isFav}
      title={accessibleLabel}
    >
      <svg
        viewBox="0 0 24 24"
        className="favorite-heart-icon"
        aria-hidden="true"
        fill={isFav ? 'currentColor' : 'none'}
        stroke="currentColor"
        strokeWidth={isFav ? '0' : '2'}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
      </svg>
    </button>
  )
}

export default FavoriteButton

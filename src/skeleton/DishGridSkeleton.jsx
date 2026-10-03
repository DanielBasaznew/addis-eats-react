import DishCardSkeleton from './DishCardSkeleton'

/**
 * DishGridSkeleton renders a grid of DishCardSkeleton placeholders.
 * @param {Object} props
 * @param {number} [props.count=6] Number of skeleton cards to render
 */
function DishGridSkeleton({ count = 6 }) {
  const items = Array.from({ length: count }, (_, i) => i)

  return (
    <div
      className="dish-grid"
      role="status"
      aria-label="Loading menu dishes..."
      aria-busy="true"
    >
      {items.map((key) => (
        <DishCardSkeleton key={key} />
      ))}
    </div>
  )
}

export default DishGridSkeleton

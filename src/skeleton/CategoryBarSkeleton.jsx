import Skeleton from './Skeleton'

/**
 * CategoryBarSkeleton renders placeholder pills for the horizontal category bar.
 */
function CategoryBarSkeleton({ count = 5 }) {
  const defaultWidths = ['4rem', '8.5rem', '7.2rem', '9.5rem', '7.8rem']

  return (
    <nav
      className="category-bar category-bar-skeleton"
      aria-hidden="true"
      aria-label="Loading categories..."
    >
      {Array.from({ length: count }, (_, i) => (
        <Skeleton
          key={i}
          variant="pill"
          className="category-pill-skeleton"
          width={defaultWidths[i % defaultWidths.length]}
        />
      ))}
    </nav>
  )
}

export default CategoryBarSkeleton

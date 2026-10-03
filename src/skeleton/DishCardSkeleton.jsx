import Skeleton from './Skeleton'

/**
 * DishCardSkeleton component that mirrors the structure and layout of DishCard.
 * Provides a seamless visual placeholder during data fetching.
 */
function DishCardSkeleton() {
  return (
    <article className="dish-card dish-card-skeleton" aria-hidden="true">
      <div className="dish-card-image-wrapper dish-card-skeleton-image-wrap">
        <Skeleton variant="rectangular" className="dish-card-skeleton-badge" />
        <Skeleton variant="rectangular" className="dish-card-skeleton-status" />
        <Skeleton variant="circular" className="dish-card-skeleton-fav" />
      </div>

      <div className="dish-card-body dish-card-skeleton-body">
        <div className="dish-card-skeleton-header">
          <Skeleton variant="text" className="dish-card-skeleton-title heading-md" />
          <Skeleton variant="text" className="dish-card-skeleton-price heading-md" />
        </div>

        <div className="dish-card-skeleton-desc">
          <Skeleton variant="text" className="dish-card-skeleton-desc-line" width="96%" />
          <Skeleton variant="text" className="dish-card-skeleton-desc-line" width="82%" />
        </div>

        <div className="dish-card-skeleton-ingredients">
          <Skeleton variant="pill" className="dish-card-skeleton-chip" width="4.2rem" />
          <Skeleton variant="pill" className="dish-card-skeleton-chip" width="5.2rem" />
          <Skeleton variant="pill" className="dish-card-skeleton-chip" width="4.6rem" />
        </div>

        <div className="dish-card-skeleton-footer">
          <Skeleton variant="rectangular" className="dish-card-skeleton-link" />
          <Skeleton variant="rectangular" className="dish-card-skeleton-btn" />
        </div>
      </div>
    </article>
  )
}

export default DishCardSkeleton

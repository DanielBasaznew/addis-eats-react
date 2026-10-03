import Skeleton from './Skeleton'

/**
 * DishDetailSkeleton mirrors the full-page 2-column layout of the DishDetail view.
 */
function DishDetailSkeleton() {
  return (
    <div
      className="dish-detail-page dish-detail-skeleton-page"
      role="status"
      aria-label="Loading dish details..."
      aria-busy="true"
    >
      {/* Breadcrumb Skeleton */}
      <nav className="detail-breadcrumb detail-breadcrumb-skeleton" aria-hidden="true">
        <Skeleton variant="text" className="breadcrumb-skeleton-item" width="6.5rem" />
        <span className="breadcrumb-separator">/</span>
        <Skeleton variant="text" className="breadcrumb-skeleton-item" width="5.5rem" />
        <span className="breadcrumb-separator">/</span>
        <Skeleton variant="text" className="breadcrumb-skeleton-item" width="8rem" />
      </nav>

      {/* Main 2-Column Detail Layout */}
      <div className="dish-detail-layout detail-layout-skeleton" aria-hidden="true">
        {/* Left Column: Visual Media Skeleton */}
        <div className="detail-visual">
          <div className="detail-image-wrapper detail-visual-skeleton">
            <Skeleton variant="rectangular" width="100%" height="100%" />
            <Skeleton variant="rectangular" className="dish-card-skeleton-badge" />
            <Skeleton variant="rectangular" className="dish-card-skeleton-status" />
            <Skeleton variant="circular" className="dish-card-skeleton-fav" />
          </div>
        </div>

        {/* Right Column: Info & Action Skeletons */}
        <div className="detail-info detail-info-skeleton">
          <div className="detail-header detail-header-skeleton">
            <Skeleton variant="text" className="detail-eyebrow-skeleton" />
            <Skeleton variant="text" className="detail-title-skeleton" />
            <div className="detail-price-row-skeleton">
              <Skeleton variant="text" className="detail-price-skeleton" />
              <Skeleton variant="text" className="detail-portion-skeleton" />
            </div>
          </div>

          {/* Description Paragraphs */}
          <div className="detail-desc-skeleton">
            <Skeleton variant="text" className="detail-desc-line-skeleton" width="100%" />
            <Skeleton variant="text" className="detail-desc-line-skeleton" width="94%" />
            <Skeleton variant="text" className="detail-desc-line-skeleton" width="82%" />
          </div>

          {/* Ingredients & Chips */}
          <div className="detail-chips-section-skeleton">
            <Skeleton variant="text" width="9rem" height="1rem" />
            <div className="detail-chips-row-skeleton">
              <Skeleton variant="pill" className="detail-chip-skeleton" width="5.5rem" />
              <Skeleton variant="pill" className="detail-chip-skeleton" width="6.8rem" />
              <Skeleton variant="pill" className="detail-chip-skeleton" width="5rem" />
              <Skeleton variant="pill" className="detail-chip-skeleton" width="6rem" />
            </div>
          </div>

          {/* Stepper and Action Button */}
          <div className="detail-action-panel-skeleton">
            <div className="detail-stepper-skeleton-row">
              <Skeleton variant="text" width="5rem" height="1.1rem" />
              <Skeleton variant="rectangular" className="detail-stepper-skeleton-box" />
            </div>
            <div className="detail-btn-skeleton-row">
              <Skeleton variant="rectangular" className="detail-btn-skeleton-main" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DishDetailSkeleton

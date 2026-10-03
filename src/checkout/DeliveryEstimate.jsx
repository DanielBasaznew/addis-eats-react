import { formatCurrency } from '../utils/formatCurrency'

function DeliveryEstimate({ estimate }) {
  if (!estimate || estimate.isEmpty) {
    return (
      <div className="delivery-estimate-box prompt">
        <div className="delivery-estimate-icon" aria-hidden="true">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="estimate-svg"
          >
            <rect x="1" y="3" width="15" height="13" />
            <polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
            <circle cx="5.5" cy="18.5" r="2.5" />
            <circle cx="18.5" cy="18.5" r="2.5" />
          </svg>
        </div>
        <p className="delivery-estimate-prompt">
          Enter your delivery area above to see delivery fee and estimated time.
        </p>
      </div>
    )
  }

  const { fee, time, isRecognized, matchedArea } = estimate

  return (
    <div className={`delivery-estimate-box ${isRecognized ? 'recognized' : 'standard'}`}>
      <div className="delivery-estimate-header">
        <div className="delivery-estimate-title-wrap">
          <span className="delivery-badge" aria-hidden="true">
            {isRecognized ? 'Direct Zone' : 'Standard Rate'}
          </span>
          <span className="delivery-area-name">{matchedArea}</span>
        </div>
        {!isRecognized && (
          <span className="delivery-notice">
            Standard city-wide delivery applied
          </span>
        )}
      </div>

      <div className="delivery-estimate-details">
        <div className="estimate-metric">
          <span className="metric-label">Delivery Fee</span>
          <span className="metric-value fee-value">{formatCurrency(fee)}</span>
        </div>

        <div className="estimate-metric-divider" aria-hidden="true" />

        <div className="estimate-metric">
          <span className="metric-label">Estimated Time</span>
          <span className="metric-value time-value">{time}</span>
        </div>
      </div>
    </div>
  )
}

export default DeliveryEstimate

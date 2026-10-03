import { useCartStore } from './cartStore'
import { formatCurrency } from '../utils/formatCurrency'

function CartItem({ item, onIncrease, onDecrease, onRemove }) {
  const storeIncrease = useCartStore((state) => state.increaseQuantity)
  const storeDecrease = useCartStore((state) => state.decreaseQuantity)
  const storeRemove = useCartStore((state) => state.removeItem)

  const handleIncrease = () => {
    if (onIncrease) {
      onIncrease(item.id)
    } else {
      storeIncrease(item.id)
    }
  }

  const handleDecrease = () => {
    if (item.quantity <= 1) return
    if (onDecrease) {
      onDecrease(item.id)
    } else {
      storeDecrease(item.id)
    }
  }

  const handleRemove = () => {
    if (onRemove) {
      onRemove(item.id)
    } else {
      storeRemove(item.id)
    }
  }

  const itemSubtotal = (Number(item.price) || 0) * (Number(item.quantity) || 0)

  return (
    <article className="cart-item">
      <div className="cart-item-image-wrapper">
        <img
          src={item.image}
          alt={item.name}
          className="cart-item-image"
          loading="lazy"
        />
      </div>

      <div className="cart-item-info">
        <div className="cart-item-details">
          <h3 className="cart-item-title">{item.name}</h3>
          <p className="cart-item-unit-price">{formatCurrency(item.price)} each</p>
        </div>

        <div className="cart-item-actions">
          <div
            className="quantity-control"
            role="group"
            aria-label={`Quantity controls for ${item.name}`}
          >
            <button
              type="button"
              className="qty-btn qty-decrease"
              onClick={handleDecrease}
              disabled={item.quantity <= 1}
              aria-label={`Decrease quantity of ${item.name}`}
            >
              <span className="material-symbols-outlined" aria-hidden="true">remove</span>
            </button>
            <span
              className="qty-value"
              aria-live="polite"
              aria-label={`Quantity: ${item.quantity}`}
            >
              {item.quantity}
            </span>
            <button
              type="button"
              className="qty-btn qty-increase"
              onClick={handleIncrease}
              aria-label={`Increase quantity of ${item.name}`}
            >
              <span className="material-symbols-outlined" aria-hidden="true">add</span>
            </button>
          </div>

          <button
            type="button"
            className="cart-item-remove-btn"
            onClick={handleRemove}
            aria-label={`Remove ${item.name} from cart`}
            title="Remove item"
          >
            <span className="material-symbols-outlined remove-icon" aria-hidden="true">
              delete_outline
            </span>
            <span className="remove-text">Remove</span>
          </button>
        </div>
      </div>

      <div className="cart-item-subtotal-section">
        <span className="cart-item-subtotal-label">Subtotal</span>
        <span className="cart-item-subtotal-amount">
          {formatCurrency(itemSubtotal)}
        </span>
      </div>
    </article>
  )
}

export default CartItem

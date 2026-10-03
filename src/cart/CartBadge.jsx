import { useCartStore, selectTotalItems } from './cartStore'

function CartBadge() {
  const totalItems = useCartStore(selectTotalItems)

  if (!totalItems || totalItems <= 0) {
    return null
  }

  return (
    <span className="cart-badge cart-nav-badge" aria-hidden="true">
      {totalItems}
    </span>
  )
}

export default CartBadge

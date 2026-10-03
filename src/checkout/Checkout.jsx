import { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useCartStore } from '../cart/cartStore'
import { formatCurrency } from '../utils/formatCurrency'
import { calculateDeliveryEstimate } from '../utils/deliveryEstimate'
import { validateCheckout } from './validate'
import DeliveryEstimate from './DeliveryEstimate'
import OrderConfirmation from './OrderConfirmation'
import { orderHistoryStore, useOrderHistoryStore, selectIsFirstOrder } from '../orders/orderHistoryStore'
import { FIRST_ORDER_DISCOUNT, calculateOrderTotals } from '../utils/orderPricing'
import { getTableNumber, clearTableSession, appendTableQuery } from '../utils/tableOrder'

function generateOrderId() {
  const randomSuffix = Math.random().toString(36).substring(2, 6).toUpperCase()
  return `ORD-${Date.now().toString(36).toUpperCase()}-${randomSuffix}`
}

function Checkout() {
  const [searchParams] = useSearchParams()
  const tableNumber = getTableNumber(searchParams)
  const isTableOrder = Boolean(tableNumber)

  const items = useCartStore((state) => state.items)
  const subtotal = useCartStore((state) => state.subtotal)
  const totalItems = useCartStore((state) => state.totalItems)
  const clearCart = useCartStore((state) => state.clearCart)
  const addOrder = orderHistoryStore((state) => state.addOrder)

  // Derive first-order discount eligibility directly from persisted orderHistoryStore
  const isFirstOrder = useOrderHistoryStore(selectIsFirstOrder)
  const discount = isFirstOrder ? FIRST_ORDER_DISCOUNT : 0

  // Controlled form state owned exclusively by Checkout.jsx
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    address: '',
  })

  // Payment method selection matching Stitch UI (Telebirr, CBE Birr, Cash)
  const [paymentMethod, setPaymentMethod] = useState('telebirr')

  // Optional special instructions kept as local React state in Checkout.jsx
  const [specialInstructions, setSpecialInstructions] = useState('')

  const [errors, setErrors] = useState({})
  // Temporary state holding the newly created order for confirmation
  const [createdOrder, setCreatedOrder] = useState(null)

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))

    // Clear field error as user types
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: null,
      }))
    }
  }

  // Purely derived delivery calculation (0 ETB for table orders)
  const deliveryEstimate = isTableOrder
    ? {
        fee: 0,
        isEmpty: false,
        matchedArea: `Table ${tableNumber}`,
        time: '15 - 20 mins',
      }
    : calculateDeliveryEstimate(formData.address)

  const deliveryFee = isTableOrder ? 0 : (deliveryEstimate.isEmpty ? 0 : deliveryEstimate.fee)
  const { grandTotal } = calculateOrderTotals(subtotal, deliveryFee, discount)

  const handleSubmit = (e) => {
    e.preventDefault()

    // Guard: Prevent order creation if cart is empty
    if (!items || items.length === 0) {
      return
    }

    // Validate inputs (address bypassed for table orders)
    const validation = validateCheckout(formData, { isTableOrder })
    if (!validation.isValid) {
      setErrors(validation.errors)
      return
    }

    setErrors({})

    // Generate unique client-side order ID
    const uniqueOrderId = generateOrderId()
    const trimmedInstructions = specialInstructions.trim()

    // Friendly payment name for order snapshot
    const paymentLabel =
      paymentMethod === 'cbe'
        ? 'CBE Birr Mobile'
        : paymentMethod === 'cash'
          ? (isTableOrder ? 'Cash at Table' : 'Cash on Delivery')
          : 'Telebirr SuperApp'

    // Construct immutable order snapshot preserving current items, prices, table and instructions
    const newOrder = {
      id: uniqueOrderId,
      orderId: uniqueOrderId,
      orderingType: isTableOrder ? 'table' : 'delivery',
      tableNumber: isTableOrder ? String(tableNumber) : null,
      customerName: formData.fullName.trim(),
      customerPhone: formData.phone.trim(),
      phone: formData.phone.trim(),
      customer: {
        fullName: formData.fullName.trim(),
        name: formData.fullName.trim(),
        phone: formData.phone.trim(),
      },
      deliveryAddress: isTableOrder
        ? `Table ${tableNumber} (Dine-In)`
        : formData.address.trim(),
      address: isTableOrder
        ? `Table ${tableNumber} (Dine-In)`
        : formData.address.trim(),
      deliveryArea: isTableOrder
        ? `Table ${tableNumber}`
        : (deliveryEstimate.matchedArea || 'Standard Delivery'),
      area: isTableOrder
        ? `Table ${tableNumber}`
        : (deliveryEstimate.matchedArea || 'Standard Delivery'),
      delivery: {
        address: isTableOrder
          ? `Table ${tableNumber} (Dine-In)`
          : formData.address.trim(),
        area: isTableOrder
          ? `Table ${tableNumber}`
          : (deliveryEstimate.matchedArea || 'Standard Delivery'),
        fee: deliveryFee,
        estimatedTime: deliveryEstimate.time || (isTableOrder ? '15 - 20 mins' : '35 - 45 mins'),
      },
      paymentMethod: paymentLabel,
      specialInstructions: trimmedInstructions || '',
      instructions: trimmedInstructions || '',
      notes: trimmedInstructions || '',
      items: items.map((item) => ({
        id: item.id,
        name: item.name,
        price: Number(item.price) || 0,
        quantity: Number(item.quantity) || 1,
        itemSubtotal: (Number(item.price) || 0) * (Number(item.quantity) || 1),
        image: item.image,
      })),
      totalItems,
      subtotal,
      itemsSubtotal: subtotal,
      deliveryFee,
      discount,
      grandTotal,
      total: grandTotal,
      estimatedDeliveryTime: deliveryEstimate.time || (isTableOrder ? '15 - 20 mins' : '35 - 45 mins'),
      createdAt: new Date().toISOString(),
      date: new Date().toISOString(),
    }

    // Record completed order in centralized order-history store
    addOrder(newOrder)

    // Clear the cart using existing cart store action
    clearCart()

    // Clear active table session once order is authorized
    if (isTableOrder) {
      clearTableSession()
    }

    // Store temporary created order for confirmation display
    setCreatedOrder(newOrder)
  }

  // 1. Order Confirmation view when order has been successfully created
  if (createdOrder) {
    return (
      <div className="checkout-page">
        <OrderConfirmation order={createdOrder} />
      </div>
    )
  }

  // 2. Empty cart protection
  if (!items || items.length === 0) {
    return (
      <div className="checkout-page">
        <div className="checkout-empty-state">
          <div className="checkout-empty-icon" aria-hidden="true">
            <span className="material-symbols-outlined empty-bag-icon">
              shopping_bag
            </span>
          </div>
          <h1 className="checkout-empty-title">Your Bag is Empty</h1>
          <p className="checkout-empty-message">
            You don&apos;t have any items in your cart to checkout. Please explore our menu to select your favorite Ethiopian dishes.
          </p>
          <Link to="/menu" className="btn-return-menu">
            <span aria-hidden="true">&larr; </span>Return to Menu
          </Link>
        </div>
      </div>
    )
  }

  // 3. Normal checkout form
  return (
    <div className="checkout-page">
      <header className="checkout-header">
        <span className="sub-title-caps">
          {isTableOrder ? `Dine-In Authorization • Table #${tableNumber}` : 'Culinary Dispatch Authorization'}
        </span>
        <h1 className="checkout-title">Checkout</h1>
        <p className="checkout-subtitle">
          {isTableOrder
            ? `Please provide your contact information and settlement preference to serve your order to Table #${tableNumber}.`
            : 'Please provide your contact, delivery location, and settlement preference to dispatch your order.'}
        </p>
      </header>

      <div className="checkout-layout">
        {/* Checkout Form */}
        <form className="checkout-form" onSubmit={handleSubmit} noValidate>
          {/* Customer Information */}
          <section className="checkout-section">
            <div className="section-header-row">
              <div className="section-icon-badge" aria-hidden="true">
                <span className="material-symbols-outlined">person</span>
              </div>
              <h2 className="checkout-section-title">Customer Information</h2>
            </div>

            <div className="form-group">
              <label htmlFor="fullName" className="form-label">
                Full Name <span className="required-star" aria-hidden="true">*</span>
              </label>
              <input
                type="text"
                id="fullName"
                name="fullName"
                className={`form-input ${errors.fullName ? 'has-error' : ''}`}
                placeholder="e.g. Abebe Bikila"
                value={formData.fullName}
                onChange={handleChange}
                autoComplete="name"
                required
                aria-required="true"
                aria-invalid={errors.fullName ? 'true' : 'false'}
                aria-describedby={errors.fullName ? 'fullName-error' : undefined}
              />
              {errors.fullName && (
                <span id="fullName-error" className="form-field-error" role="alert">
                  {errors.fullName}
                </span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="phone" className="form-label">
                Phone Number <span className="required-star" aria-hidden="true">*</span>
              </label>
              <input
                type="tel"
                id="phone"
                name="phone"
                className={`form-input ${errors.phone ? 'has-error' : ''}`}
                placeholder="e.g. 0911 234 567"
                value={formData.phone}
                onChange={handleChange}
                autoComplete="tel"
                required
                aria-required="true"
                aria-invalid={errors.phone ? 'true' : 'false'}
                aria-describedby={errors.phone ? 'phone-error' : undefined}
              />
              {errors.phone && (
                <span id="phone-error" className="form-field-error" role="alert">
                  {errors.phone}
                </span>
              )}
            </div>
          </section>

          {/* Delivery Information OR Dine-In Table Station */}
          {isTableOrder ? (
            <section className="checkout-section checkout-table-station-section">
              <div className="section-header-row">
                <div className="section-icon-badge" aria-hidden="true">
                  <span className="material-symbols-outlined">table_restaurant</span>
                </div>
                <div>
                  <h2 className="checkout-section-title">Dining Station: Table #{tableNumber}</h2>
                  <p className="section-subtext">Contactless in-house dining order</p>
                </div>
              </div>

              <div className="checkout-table-station-card">
                <div className="table-station-header">
                  <span className="table-station-pill">
                    <span className="material-symbols-outlined" aria-hidden="true">
                      room_service
                    </span>
                    Direct-to-Table Kitchen Service
                  </span>
                  <span className="table-free-badge">0 ETB Delivery Fee</span>
                </div>
                <p className="table-station-text">
                  Your meal will be freshly prepared in our kitchen atelier and served directly to <strong>Table #{tableNumber}</strong>. No delivery address is required.
                </p>
              </div>
            </section>
          ) : (
            <section className="checkout-section">
              <div className="section-header-row">
                <div className="section-icon-badge" aria-hidden="true">
                  <span className="material-symbols-outlined">local_shipping</span>
                </div>
                <h2 className="checkout-section-title">Delivery Location &amp; Dispatch</h2>
              </div>

              <div className="form-group">
                <label htmlFor="address" className="form-label">
                  Delivery Area / Address <span className="required-star" aria-hidden="true">*</span>
                </label>
                <textarea
                  id="address"
                  name="address"
                  className={`form-input form-textarea ${errors.address ? 'has-error' : ''}`}
                  placeholder="e.g. Bole Medhanialem, House 123 (or Kazanchis, Piassa, Saris, CMC, Hayahulet...)"
                  rows={3}
                  value={formData.address}
                  onChange={handleChange}
                  autoComplete="street-address"
                  required
                  aria-required="true"
                  aria-invalid={errors.address ? 'true' : 'false'}
                  aria-describedby={errors.address ? 'address-error' : undefined}
                />
                {errors.address && (
                  <span id="address-error" className="form-field-error" role="alert">
                    {errors.address}
                  </span>
                )}
              </div>

              {/* Delivery Estimate Card */}
              <DeliveryEstimate estimate={deliveryEstimate} />
            </section>
          )}

          {/* Payment Method Selection (Stitch feature) */}
          <section className="checkout-section">
            <div className="section-header-row">
              <div className="section-icon-badge" aria-hidden="true">
                <span className="material-symbols-outlined">account_balance_wallet</span>
              </div>
              <div>
                <h2 className="checkout-section-title">Settlement Gateway</h2>
                <p className="section-subtext">Select your preferred Ethiopian payment option</p>
              </div>
            </div>

            <div className="payment-options-grid" role="radiogroup" aria-label="Payment Method">
              {/* Option 1: Telebirr */}
              <label
                className={`payment-option-card ${paymentMethod === 'telebirr' ? 'selected' : ''}`}
              >
                <div className="option-top">
                  <div className="option-radio-label">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="telebirr"
                      checked={paymentMethod === 'telebirr'}
                      onChange={() => setPaymentMethod('telebirr')}
                      className="payment-radio-input"
                    />
                    <div>
                      <div className="option-title-row">
                        <strong className="option-title">Telebirr SuperApp</strong>
                        <span className="badge-instant">Instant Pay</span>
                        <span className="badge-recommended">Recommended</span>
                      </div>
                      <p className="option-desc">
                        Official Ethio Telecom gateway. Instant push prompt to your phone.
                      </p>
                    </div>
                  </div>
                  <span className="badge-brand">TELEBIRR</span>
                </div>
              </label>

              {/* Option 2: CBE Birr */}
              <label
                className={`payment-option-card ${paymentMethod === 'cbe' ? 'selected' : ''}`}
              >
                <div className="option-top">
                  <div className="option-radio-label">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="cbe"
                      checked={paymentMethod === 'cbe'}
                      onChange={() => setPaymentMethod('cbe')}
                      className="payment-radio-input"
                    />
                    <div>
                      <div className="option-title-row">
                        <strong className="option-title">CBE Birr Mobile</strong>
                        <span className="badge-sub">Commercial Bank of Ethiopia</span>
                      </div>
                      <p className="option-desc">
                        Direct account transfer via CBE Birr mobile banking authorization.
                      </p>
                    </div>
                  </div>
                  <span className="badge-brand">CBE BIRR</span>
                </div>
              </label>

              {/* Option 3: Cash on Delivery */}
              <label
                className={`payment-option-card ${paymentMethod === 'cash' ? 'selected' : ''}`}
              >
                <div className="option-top">
                  <div className="option-radio-label">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="cash"
                      checked={paymentMethod === 'cash'}
                      onChange={() => setPaymentMethod('cash')}
                      className="payment-radio-input"
                    />
                    <div>
                      <div className="option-title-row">
                        <strong className="option-title">
                          {isTableOrder ? 'Cash at Table' : 'Cash on Delivery'}
                        </strong>
                        <span className="badge-sub">
                          {isTableOrder ? 'Floor Waiter' : 'Physical Settlement'}
                        </span>
                      </div>
                      <p className="option-desc">
                        {isTableOrder
                          ? 'Pay cash or local mobile transfer to the floor waiter upon dining service.'
                          : 'Pay exact cash or local mobile transfer to the courier upon arrival.'}
                      </p>
                    </div>
                  </div>
                  <span className="badge-brand">CASH</span>
                </div>
              </label>
            </div>
          </section>

          {/* Special Instructions (Optional) */}
          <section className="checkout-section">
            <div className="section-header-row">
              <div className="section-icon-badge" aria-hidden="true">
                <span className="material-symbols-outlined">notes</span>
              </div>
              <h2 className="checkout-section-title">Special Instructions</h2>
            </div>

            <div className="form-group">
              <label htmlFor="specialInstructions" className="form-label">
                Courier &amp; Kitchen Notes <span className="optional-tag">(Optional)</span>
              </label>
              <textarea
                id="specialInstructions"
                name="specialInstructions"
                className="form-input form-textarea"
                placeholder="e.g. Ring buzzer #3B, sauce on the side, extra spicy awaze, leave at front desk..."
                rows={3}
                value={specialInstructions}
                onChange={(e) => setSpecialInstructions(e.target.value)}
              />
            </div>
          </section>

          {/* Place Order Button */}
          <div className="checkout-form-actions">
            <button type="submit" className="btn-place-order">
              <span className="material-symbols-outlined" aria-hidden="true">
                lock
              </span>
              Authorize &amp; Place Order • {formatCurrency(grandTotal)}
            </button>
            <Link to={appendTableQuery('/cart', tableNumber)} className="back-to-cart-link">
              <span aria-hidden="true">&larr; </span>Return to Bag
            </Link>
          </div>
        </form>

        {/* Order Summary Sidebar */}
        <aside className="checkout-summary" aria-label="Order summary">
          <div className="summary-header-row">
            <h2 className="checkout-summary-title">Delicacy Manifest</h2>
            <span className="currency-chip">ETB</span>
          </div>

          <div className="checkout-summary-items">
            {items.map((item) => {
              const itemSubtotal = (Number(item.price) || 0) * (Number(item.quantity) || 0)
              return (
                <div key={item.id} className="checkout-summary-item">
                  <div className="checkout-item-details">
                    <span className="checkout-item-name">{item.name}</span>
                    <span className="checkout-item-meta">
                      {item.quantity} &times; {formatCurrency(item.price)}
                    </span>
                  </div>
                  <span className="checkout-item-subtotal">
                    {formatCurrency(itemSubtotal)}
                  </span>
                </div>
              )
            })}
          </div>

          <div className="checkout-summary-totals">
            <div className="checkout-total-row">
              <span className="checkout-total-label">Items Subtotal ({totalItems}):</span>
              <span className="checkout-total-value">
                {formatCurrency(subtotal)}
              </span>
            </div>

            <div className="checkout-total-row">
              <span className="checkout-total-label">
                {isTableOrder
                  ? `Dine-In Service (Table #${tableNumber}):`
                  : `Delivery Fee (${deliveryEstimate.matchedArea || 'City-wide'}):`}
              </span>
              <span className="checkout-total-value fee-row">
                {isTableOrder
                  ? 'FREE (0 ETB)'
                  : deliveryEstimate.isEmpty
                  ? '—'
                  : formatCurrency(deliveryFee)}
              </span>
            </div>

            {discount > 0 && (
              <div className="checkout-total-row discount-row">
                <span className="checkout-total-label">First-Order Welcome Gift:</span>
                <span className="checkout-total-value discount-value">
                  -{formatCurrency(discount)}
                </span>
              </div>
            )}

            <div className="checkout-total-row grand-total-row">
              <span className="checkout-grand-total-label">Grand Total:</span>
              <span className="checkout-grand-total-amount">
                {formatCurrency(grandTotal)}
              </span>
            </div>
          </div>
        </aside>
      </div>
    </div>
  )
}

export default Checkout

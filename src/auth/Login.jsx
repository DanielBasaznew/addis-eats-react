import { useState } from 'react'
import { useLocation, useNavigate, Link } from 'react-router-dom'
import { useAuth } from './useAuth'

function Login() {
  const { user, isAuthenticated, login, logout } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()

  const from = location.state?.from
    ? `${location.state.from.pathname}${location.state.from.search || ''}`
    : '/checkout'

  const [formData, setFormData] = useState({
    email: 'customer@addiseats.com',
    password: '••••••••',
  })

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleLoginSubmit = (e) => {
    e.preventDefault()

    const customerName = formData.email.includes('@')
      ? formData.email.split('@')[0].replace(/[._-]/g, ' ')
      : formData.email || 'Abebe Bikila'

    const capitalizedName = customerName
      .split(' ')
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ')

    login({
      name: capitalizedName || 'Abebe Bikila',
      email: formData.email || 'customer@addiseats.com',
    })

    navigate(from, { replace: true })
  }

  const handleQuickLogin = () => {
    login({
      name: 'Abebe Bikila',
      email: 'abebe@example.com',
      phone: '0911234567',
    })
    navigate(from, { replace: true })
  }

  // If already authenticated, show status and direct navigation
  if (isAuthenticated && user) {
    return (
      <div className="login-page">
        <div className="login-card">
          <div className="login-badge-icon" aria-hidden="true">
            <svg
              viewBox="0 0 24 24"
              width="36"
              height="36"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
          </div>

          <h1 className="login-title">Already Signed In</h1>
          <p className="login-subtitle">
            You are currently signed in as <strong>{user.name || user.fullName || 'Customer'}</strong> ({user.email || 'Verified'}).
          </p>

          <div className="login-actions">
            <button
              type="button"
              className="btn-place-order"
              onClick={() => navigate(from, { replace: true })}
            >
              Continue to {from.startsWith('/checkout') ? 'Checkout' : 'Page'}{' '}
              <span aria-hidden="true">&rarr;</span>
            </button>
            <button
              type="button"
              className="btn-continue-shopping"
              onClick={logout}
            >
              Sign Out
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-badge-icon" aria-hidden="true">
          <svg
            viewBox="0 0 24 24"
            width="36"
            height="36"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
        </div>

        <h1 className="login-title">Sign In Required</h1>
        <p className="login-subtitle">
          {location.state?.from ? (
            <span className="login-redirect-notice">
              Please sign in to access checkout and place your order.
            </span>
          ) : (
            'Welcome back! Sign in to continue ordering authentic Ethiopian dishes.'
          )}
        </p>

        <form className="login-form" onSubmit={handleLoginSubmit} noValidate>
          <div className="form-group">
            <label htmlFor="login-email" className="form-label">
              Email or Phone Number
            </label>
            <input
              type="text"
              id="login-email"
              name="email"
              className="form-input"
              value={formData.email}
              onChange={handleChange}
              placeholder="e.g. abebe@example.com or 0911234567"
              autoComplete="username"
              required
              aria-required="true"
            />
          </div>

          <div className="form-group">
            <label htmlFor="login-password" className="form-label">
              Password
            </label>
            <input
              type="password"
              id="login-password"
              name="password"
              className="form-input"
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter your password"
              autoComplete="current-password"
              required
              aria-required="true"
            />
          </div>

          <div className="login-actions">
            <button type="submit" className="btn-place-order">
              Sign In &amp; Proceed to Checkout
            </button>

            <button
              type="button"
              className="btn-continue-shopping login-demo-btn"
              onClick={handleQuickLogin}
            >
              One-Click Demo Customer Sign In
            </button>
          </div>
        </form>

        <div className="login-footer-nav">
          <Link to="/cart" className="back-to-cart-link">
            <span aria-hidden="true">&larr; </span>Back to Cart
          </Link>
        </div>
      </div>
    </div>
  )
}

export default Login

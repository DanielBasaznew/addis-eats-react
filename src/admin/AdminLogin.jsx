import { useState } from 'react'
import { useLocation, useNavigate, Link } from 'react-router-dom'
import { useAdminAuth } from './useAdminAuth'

function AdminLogin() {
  const { adminUser, isAdminAuthenticated, adminLogin, adminLogout } = useAdminAuth()
  const location = useLocation()
  const navigate = useNavigate()

  const from = location.state?.from
    ? `${location.state.from.pathname}${location.state.from.search || ''}`
    : '/admin'

  const [username, setUsername] = useState('admin')
  const [password, setPassword] = useState('admin123')
  const [error, setError] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    setError('')

    if (!username.trim()) {
      setError('Please enter your administrator username.')
      return
    }

    const result = adminLogin(username.trim(), password)
    if (result.success) {
      navigate(from, { replace: true })
    } else {
      setError(result.error || 'Failed to authenticate administrator.')
    }
  }

  const handleQuickLogin = () => {
    const result = adminLogin('admin', 'admin123')
    if (result.success) {
      navigate(from, { replace: true })
    }
  }

  if (isAdminAuthenticated && adminUser) {
    return (
      <div className="login-page">
        <div className="login-card">
          <div className="login-badge-icon" aria-hidden="true">
            <span className="material-symbols-outlined" style={{ fontSize: '36px' }}>
              admin_panel_settings
            </span>
          </div>

          <h1 className="login-title">Administrator Session Active</h1>
          <p className="login-subtitle">
            Signed in as <strong>{adminUser.username}</strong> ({adminUser.role || 'Operations Control'}).
          </p>

          <div className="login-actions">
            <button
              type="button"
              className="btn-place-order"
              onClick={() => navigate(from, { replace: true })}
            >
              Go to Operations Dashboard &rarr;
            </button>
            <button
              type="button"
              className="btn-continue-shopping"
              onClick={() => adminLogout()}
            >
              Sign Out of Admin
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
          <span className="material-symbols-outlined" style={{ fontSize: '36px' }}>
            admin_panel_settings
          </span>
        </div>

        <h1 className="login-title">Administrator Portal</h1>
        <p className="login-subtitle">
          Authorized restaurant operations &amp; dispatch management
        </p>

        {error && (
          <div className="admin-modal-error-banner" role="alert" style={{ marginBottom: '1rem' }}>
            <span className="material-symbols-outlined error-icon" aria-hidden="true">
              error
            </span>
            <span>{error}</span>
          </div>
        )}

        <form className="login-form" onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label htmlFor="admin-username" className="form-label">
              Username
            </label>
            <input
              type="text"
              id="admin-username"
              name="username"
              className="form-input"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="e.g. admin"
              autoComplete="username"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="admin-password" className="form-label">
              Password
            </label>
            <input
              type="password"
              id="admin-password"
              name="password"
              className="form-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              autoComplete="current-password"
              required
            />
          </div>

          <button type="submit" className="btn-place-order">
            <span>Sign In to Admin</span>
            <span aria-hidden="true">&rarr;</span>
          </button>

          <button
            type="button"
            className="btn-quick-login"
            onClick={handleQuickLogin}
          >
            Quick Admin Sign In (Demo Mode)
          </button>
        </form>

        <div className="login-footer">
          <p className="login-hint">
            Authorized staff only. For customer dining, return to{' '}
            <Link to="/" className="link-home">
              Storefront
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default AdminLogin

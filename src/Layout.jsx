import { useState, useEffect } from 'react'
import { NavLink, Link, Outlet, useSearchParams } from 'react-router-dom'
import CartBadge from './cart/CartBadge'
import { useCartStore, selectTotalItems } from './cart/cartStore'
import ThemeToggle from './theme/ThemeToggle'
import { useAuth } from './auth/useAuth'
import { appendTableQuery, getTableNumber } from './utils/tableOrder'

function Layout() {
  const [searchParams] = useSearchParams()
  const tableNumber = getTableNumber(searchParams)

  const totalItems = useCartStore(selectTotalItems)
  const { user, isAuthenticated, logout } = useAuth()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  // Close mobile drawer when Escape key is pressed
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && mobileMenuOpen) {
        setMobileMenuOpen(false)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [mobileMenuOpen])

  const cartLabel =
    totalItems > 0
      ? `Cart, ${totalItems} ${totalItems === 1 ? 'item' : 'items'}`
      : 'Cart'

  return (
    <div className="layout">
      {/* Editorial Navbar */}
      <header className="navbar">
        <div className="navbar-container">
          <div className="nav-brand-group">
            <NavLink to="/" className="brand-logo" aria-label="Addis Eats Home">
              <span className="brand-crest-icon" aria-hidden="true">
                <svg
                  viewBox="0 0 32 32"
                  width="30"
                  height="30"
                  fill="none"
                  className="mesob-crest-svg"
                >
                  <circle cx="16" cy="16" r="14" fill="#9f3c16" fillOpacity="0.12" stroke="#9f3c16" strokeWidth="1.5" />
                  <path
                    d="M16 6c-3 3-5 6.5-5 10 0 3.5 2.5 6 5 6s5-2.5 5-6c0-3.5-2-7-5-10z"
                    fill="#9f3c16"
                  />
                  <path
                    d="M16 11c-1.5 2-2.5 4-2.5 6 0 1.8 1.2 3 2.5 3s2.5-1.2 2.5-3c0-2-1-4-2.5-6z"
                    fill="#fdba45"
                  />
                </svg>
              </span>
              <div className="brand-text">
                <span className="brand-name">Addis Eats</span>
                <span className="brand-subtitle">Culinary Addis</span>
              </div>
            </NavLink>
            {tableNumber && (
              <div className="navbar-table-indicator" role="status" title={`Active Table #${tableNumber}`}>
                <span className="material-symbols-outlined indicator-icon" aria-hidden="true">
                  table_restaurant
                </span>
                <span>Table #{tableNumber}</span>
              </div>
            )}
          </div>

          {/* Desktop Navigation Links (Unchanged for desktop) */}
          <nav className="nav-links desktop-nav" aria-label="Main navigation">
            <NavLink
              to="/"
              end
              className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}
            >
              Home
            </NavLink>
            <NavLink
              to={appendTableQuery('/menu', tableNumber)}
              end
              className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}
            >
              Menu
            </NavLink>
            <NavLink
              to={appendTableQuery('/cart', tableNumber)}
              className={({ isActive }) =>
                isActive ? 'nav-link active nav-link-cart' : 'nav-link nav-link-cart'
              }
              aria-label={cartLabel}
            >
              <span className="nav-link-text">Bag</span>
              <CartBadge />
            </NavLink>
            <NavLink
              to={appendTableQuery('/checkout', tableNumber)}
              className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}
            >
              Checkout
            </NavLink>
            <NavLink
              to="/orders"
              className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}
            >
              Orders
            </NavLink>
            <NavLink
              to="/favorites"
              className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}
            >
              Favorites
            </NavLink>

            {isAuthenticated ? (
              <button
                type="button"
                className="nav-link btn-auth-logout"
                onClick={logout}
                title={`Logged in as ${user?.name || 'Customer'}`}
                aria-label={`Sign out of account (${user?.name || 'Customer'})`}
              >
                Sign Out
              </button>
            ) : (
              <NavLink
                to="/login"
                className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}
              >
                Sign In
              </NavLink>
            )}

            <ThemeToggle />
          </nav>

          {/* Mobile Navigation Header Controls (Visible only on mobile) */}
          <div className="mobile-nav-actions" aria-label="Mobile navigation controls">
            <NavLink
              to={appendTableQuery('/cart', tableNumber)}
              className="mobile-cart-btn"
              aria-label={cartLabel}
            >
              <span className="material-symbols-outlined" aria-hidden="true">
                shopping_bag
              </span>
              <CartBadge />
            </NavLink>

            <ThemeToggle />

            <button
              type="button"
              className="hamburger-btn"
              onClick={() => setMobileMenuOpen((prev) => !prev)}
              aria-expanded={mobileMenuOpen}
              aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
              aria-controls="mobile-navigation-menu"
            >
              <span className="material-symbols-outlined hamburger-icon" aria-hidden="true">
                {mobileMenuOpen ? 'close' : 'menu'}
              </span>
            </button>
          </div>
        </div>

        {/* Mobile Slide-down Navigation Drawer */}
        <div
          id="mobile-navigation-menu"
          className={`mobile-nav-drawer ${mobileMenuOpen ? 'open' : ''}`}
          aria-hidden={!mobileMenuOpen}
        >
          <nav className="mobile-nav-links" aria-label="Mobile navigation">
            <NavLink
              to="/"
              end
              className={({ isActive }) =>
                isActive ? 'mobile-nav-link active' : 'mobile-nav-link'
              }
              onClick={() => setMobileMenuOpen(false)}
            >
              <span className="material-symbols-outlined" aria-hidden="true">
                home
              </span>
              <span>Home</span>
            </NavLink>
            <NavLink
              to={appendTableQuery('/menu', tableNumber)}
              end
              className={({ isActive }) =>
                isActive ? 'mobile-nav-link active' : 'mobile-nav-link'
              }
              onClick={() => setMobileMenuOpen(false)}
            >
              <span className="material-symbols-outlined" aria-hidden="true">
                restaurant_menu
              </span>
              <span>Menu</span>
            </NavLink>
            <NavLink
              to={appendTableQuery('/cart', tableNumber)}
              className={({ isActive }) =>
                isActive ? 'mobile-nav-link active' : 'mobile-nav-link'
              }
              onClick={() => setMobileMenuOpen(false)}
            >
              <span className="material-symbols-outlined" aria-hidden="true">
                shopping_bag
              </span>
              <span className="mobile-nav-link-text">Bag</span>
              <CartBadge />
            </NavLink>
            <NavLink
              to={appendTableQuery('/checkout', tableNumber)}
              className={({ isActive }) =>
                isActive ? 'mobile-nav-link active' : 'mobile-nav-link'
              }
              onClick={() => setMobileMenuOpen(false)}
            >
              <span className="material-symbols-outlined" aria-hidden="true">
                payments
              </span>
              <span>Checkout</span>
            </NavLink>
            <NavLink
              to="/orders"
              className={({ isActive }) =>
                isActive ? 'mobile-nav-link active' : 'mobile-nav-link'
              }
              onClick={() => setMobileMenuOpen(false)}
            >
              <span className="material-symbols-outlined" aria-hidden="true">
                receipt_long
              </span>
              <span>Orders</span>
            </NavLink>
            <NavLink
              to="/favorites"
              className={({ isActive }) =>
                isActive ? 'mobile-nav-link active' : 'mobile-nav-link'
              }
              onClick={() => setMobileMenuOpen(false)}
            >
              <span className="material-symbols-outlined" aria-hidden="true">
                favorite
              </span>
              <span>Favorites</span>
            </NavLink>

            {isAuthenticated ? (
              <button
                type="button"
                className="mobile-nav-link mobile-btn-logout"
                onClick={() => {
                  logout()
                  setMobileMenuOpen(false)
                }}
              >
                <span className="material-symbols-outlined" aria-hidden="true">
                  logout
                </span>
                <span>Sign Out ({user?.name || 'Customer'})</span>
              </button>
            ) : (
              <NavLink
                to="/login"
                className={({ isActive }) =>
                  isActive ? 'mobile-nav-link active' : 'mobile-nav-link'
                }
                onClick={() => setMobileMenuOpen(false)}
              >
                <span className="material-symbols-outlined" aria-hidden="true">
                  login
                </span>
                <span>Sign In</span>
              </NavLink>
            )}
          </nav>
        </div>

        {/* Mobile Menu Backdrop */}
        {mobileMenuOpen && (
          <div
            className="mobile-nav-backdrop"
            onClick={() => setMobileMenuOpen(false)}
            aria-hidden="true"
          />
        )}
      </header>

      {/* Main App Canvas */}
      <main className="main-content">
        <Outlet />
      </main>

      {/* Editorial Heritage Footer */}
      <footer className="footer">
        <div className="footer-container">
          <div className="footer-top">
            <div className="footer-brand-col">
              <div className="footer-brand">
                <span className="brand-name">Addis Eats</span>
                <span className="brand-subtitle">Modern Ethiopian Dining</span>
              </div>
              <p className="footer-manifesto">
                Artisanal highland stews, hand-harvested pure teff injera, and fire-tossed
                meats. Dispatched hot in thermal earthenware packaging across Addis Ababa.
              </p>
            </div>

            <div className="footer-nav-col">
              <span className="footer-col-title">Navigation</span>
              <ul className="footer-links">
                <li><Link to="/">Home</Link></li>
                <li><Link to="/menu">Curated Menu</Link></li>
                <li><Link to="/cart">Order Bag</Link></li>
                <li><Link to="/favorites">Saved Favorites</Link></li>
                <li><Link to="/orders">Order History</Link></li>
                <li><Link to="/admin">Admin Portal</Link></li>
              </ul>
            </div>

            <div className="footer-nav-col">
              <span className="footer-col-title">Ateliers &amp; Kitchens</span>
              <ul className="footer-info">
                <li>Bole Medhanialem Hub (Primary)</li>
                <li>Kazanchis Heritage Atelier</li>
                <li>Old Airport / Sarbet Express</li>
                <li>Daily: 11:00 AM – 10:30 PM</li>
              </ul>
            </div>
          </div>

          <div className="footer-bottom">
            <p>&copy; {new Date().getFullYear()} Addis Eats Culinary Co. All rights reserved.</p>
            <p className="footer-legal">Bespoke Ethiopian Hospitality • Gursha Culture</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default Layout

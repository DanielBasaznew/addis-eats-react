import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useOrderHistoryStore, selectOrders } from '../orders/orderHistoryStore'
import { fetchDishes, saveDishOverride, addDish, deleteDish } from '../api/dishes'
import { formatCurrency } from '../utils/formatCurrency'
import { useAdminAuth } from './useAdminAuth'
import AdminOrders from './AdminOrders'
import AdminTables from './AdminTables'
import AddDishModal from './AddDishModal'
import DeleteDishModal from './DeleteDishModal'
import { Skeleton, AdminDishTableSkeleton } from '../skeleton'

function Admin() {
  const { tab } = useParams()
  const navigate = useNavigate()
  const { adminUser, adminLogout } = useAdminAuth()
  const validTabs = ['dashboard', 'menu', 'orders', 'tables']
  const activeTab = validTabs.includes(tab) ? tab : 'dashboard'

  const handleTabChange = (tabId) => {
    navigate(tabId === 'dashboard' ? '/admin' : `/admin/${tabId}`)
  }

  const handleAdminLogout = () => {
    adminLogout()
    navigate('/admin/login')
  }

  const [dishes, setDishes] = useState([])
  const [loadingDishes, setLoadingDishes] = useState(true)
  const [dishesError, setDishesError] = useState(null)

  // Menu management search & filter states
  const [menuSearchQuery, setMenuSearchQuery] = useState('')
  const [menuSelectedCategory, setMenuSelectedCategory] = useState('All')
  const [menuAvailabilityFilter, setMenuAvailabilityFilter] = useState('all') // 'all', 'available', 'unavailable'

  // Edit Dish Modal states
  const [editingDish, setEditingDish] = useState(null)
  const [editForm, setEditForm] = useState({
    name: '',
    price: '',
    category: '',
    available: true,
  })
  const [editErrors, setEditErrors] = useState({})

  // Add Dish Modal state (Admin Step 5)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)

  // Delete Dish Modal state (Admin Step 5)
  const [deletingDish, setDeletingDish] = useState(null)

  // Live order history subscription from existing centralized store
  const orders = useOrderHistoryStore(selectOrders)

  const [reloadTrigger, setReloadTrigger] = useState(0)

  // Fetch dishes from existing API endpoint on mount and when retried
  useEffect(() => {
    let isMounted = true

    async function loadMenuData() {
      try {
        setLoadingDishes(true)
        setDishesError(null)
        const data = await fetchDishes()
        if (isMounted && Array.isArray(data)) {
          setDishes(data)
        }
      } catch (err) {
        if (isMounted) {
          console.error('Failed to load menu dishes for admin:', err)
          setDishesError(err.message || 'Failed to load menu dishes.')
        }
      } finally {
        if (isMounted) {
          setLoadingDishes(false)
        }
      }
    }

    loadMenuData()

    return () => {
      isMounted = false
    }
  }, [reloadTrigger])

  const handleRetryDishes = () => {
    setReloadTrigger((prev) => prev + 1)
  }

  // Close edit modal when Escape is pressed
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && editingDish) {
        setEditingDish(null)
        setEditErrors({})
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [editingDish])

  // Toggle dish availability
  const handleToggleAvailability = (dish) => {
    const currentAvailable = dish.available !== false
    const newAvailable = !currentAvailable

    // Persist via localStorage overrides
    saveDishOverride(dish.id, { available: newAvailable })

    // Immediately update local state
    setDishes((prevDishes) =>
      prevDishes.map((item) =>
        item.id === dish.id ? { ...item, available: newAvailable } : item
      )
    )
  }

  // Open Edit Dish Modal
  const handleOpenEditModal = (dish) => {
    setEditingDish(dish)
    setEditForm({
      name: dish.name || '',
      price: dish.price !== undefined ? String(dish.price) : '',
      category: dish.category || 'Traditional',
      available: dish.available !== false,
    })
    setEditErrors({})
  }

  // Close Edit Dish Modal
  const handleCloseEditModal = () => {
    setEditingDish(null)
    setEditErrors({})
  }

  // Handle Edit Dish Form Change
  const handleEditFormChange = (field, value) => {
    setEditForm((prev) => ({ ...prev, [field]: value }))
    if (editErrors[field]) {
      setEditErrors((prev) => ({ ...prev, [field]: null }))
    }
  }

  // Handle Save Edit Form
  const handleSaveEdit = (e) => {
    e.preventDefault()
    const errors = {}
    const trimmedName = editForm.name.trim()
    const parsedPrice = parseFloat(editForm.price)
    const trimmedCategory = editForm.category.trim()

    if (!trimmedName) {
      errors.name = 'Dish name is required.'
    }

    if (isNaN(parsedPrice) || parsedPrice <= 0) {
      errors.price = 'Price must be a valid number greater than 0.'
    }

    if (!trimmedCategory) {
      errors.category = 'Category is required.'
    }

    if (Object.keys(errors).length > 0) {
      setEditErrors(errors)
      return
    }

    const updates = {
      name: trimmedName,
      price: parsedPrice,
      category: trimmedCategory,
      available: Boolean(editForm.available),
    }

    // Persist in localStorage overrides
    saveDishOverride(editingDish.id, updates)

    // Immediately update in admin list state
    setDishes((prevDishes) =>
      prevDishes.map((item) =>
        item.id === editingDish.id ? { ...item, ...updates } : item
      )
    )

    // Close modal
    setEditingDish(null)
    setEditErrors({})
  }

  // Handle Add Dish (Admin Step 5)
  const handleOpenAddModal = () => {
    setIsAddModalOpen(true)
  }

  const handleCloseAddModal = () => {
    setIsAddModalOpen(false)
  }

  const handleCreateDish = (dishData) => {
    const newDish = addDish(dishData)
    // Immediately show new dish in local state
    setDishes((prevDishes) => [newDish, ...prevDishes])
  }

  // Handle Delete Dish (Admin Step 5)
  const handleRequestDelete = (dish) => {
    setDeletingDish(dish)
  }

  const handleCloseDeleteModal = () => {
    setDeletingDish(null)
  }

  const handleConfirmDelete = (id) => {
    deleteDish(id)
    // Immediately remove from local state
    setDishes((prevDishes) => prevDishes.filter((dish) => String(dish.id) !== String(id)))
    setDeletingDish(null)
  }

  // Derived real-time metrics
  const totalRevenue = orders.reduce((sum, order) => {
    const amount = Number(order.grandTotal ?? order.total ?? 0)
    return sum + (isNaN(amount) ? 0 : amount)
  }, 0)

  const totalOrders = orders.length
  const totalDishes = dishes.length
  const activeDishes = dishes.filter((dish) => dish.available !== false).length

  // Base list of categories ensuring all catalog options exist
  const defaultCategories = ['Traditional', 'Meat & Grill', 'Vegetarian', 'Breakfast', 'Beverages', 'Dessert']
  const editCategoriesList = Array.from(
    new Set([...defaultCategories, ...dishes.map((d) => d.category).filter(Boolean)])
  )

  // Derive unique categories dynamically for filtering
  const filterCategories = [
    'All',
    ...Array.from(new Set(dishes.map((dish) => dish.category).filter(Boolean))),
  ]

  // Filtered dishes for Menu Management catalog table
  const filteredDishes = dishes.filter((dish) => {
    const matchesCategory =
      menuSelectedCategory.toLowerCase() === 'all' ||
      dish.category?.toLowerCase() === menuSelectedCategory.toLowerCase()

    const isAvailable = dish.available !== false
    const matchesAvailability =
      menuAvailabilityFilter === 'all' ||
      (menuAvailabilityFilter === 'available' && isAvailable) ||
      (menuAvailabilityFilter === 'unavailable' && !isAvailable)

    const query = menuSearchQuery.trim().toLowerCase()
    const matchesSearch =
      !query ||
      dish.name?.toLowerCase().includes(query) ||
      dish.description?.toLowerCase().includes(query) ||
      dish.category?.toLowerCase().includes(query) ||
      (Array.isArray(dish.ingredients) &&
        dish.ingredients.some((ingredient) =>
          ingredient.toLowerCase().includes(query)
        ))

    return matchesCategory && matchesAvailability && matchesSearch
  })

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: 'dashboard', description: 'Operations overview & daily metrics' },
    { id: 'menu', label: 'Menu Management', icon: 'restaurant_menu', description: 'Dish catalog, pricing & stock status' },
    { id: 'orders', label: 'Orders', icon: 'receipt_long', description: 'Live kitchen tickets & dispatch status' },
    { id: 'tables', label: 'Tables / QR', icon: 'qr_code_scanner', description: 'Table mapping & digital QR ordering' },
  ]

  return (
    <div className="admin-container">
      {/* Admin Portal Header */}
      <header className="admin-header">
        <div className="admin-header-main">
          <span className="sub-title-caps">Operations &amp; Management Portal</span>
          <h1 className="admin-title">Addis Eats Administration</h1>
          <p className="admin-subtitle">
            Internal operations control for menu cataloging, live kitchen orders, table assignments, and dispatch management.
          </p>
        </div>
        <div className="admin-header-actions">
          <div className="admin-status-pill">
            <span className="admin-status-dot" aria-hidden="true" />
            <span>Admin: {adminUser?.username || 'Active'}</span>
          </div>
          <button
            type="button"
            className="admin-btn-logout"
            onClick={handleAdminLogout}
            title="Sign out of Administrator Portal"
            aria-label="Sign out of admin"
          >
            <span className="material-symbols-outlined action-icon" aria-hidden="true">
              logout
            </span>
            <span>Sign Out</span>
          </button>
        </div>
      </header>

      {/* Admin Layout: Sidebar + Main Content Stage */}
      <div className="admin-layout">
        {/* Navigation Sidebar */}
        <aside className="admin-sidebar" aria-label="Admin navigation">
          <nav className="admin-nav-list" role="tablist">
            {navItems.map((item) => {
              const isActive = activeTab === item.id
              return (
                <button
                  key={item.id}
                  type="button"
                  role="tab"
                  id={`admin-tab-${item.id}`}
                  aria-selected={isActive}
                  aria-controls={`admin-panel-${item.id}`}
                  className={`admin-nav-item ${isActive ? 'active' : ''}`}
                  onClick={() => handleTabChange(item.id)}
                >
                  <span className="material-symbols-outlined admin-nav-icon" aria-hidden="true">
                    {item.icon}
                  </span>
                  <div className="admin-nav-text">
                    <span className="admin-nav-label">{item.label}</span>
                    <span className="admin-nav-desc">{item.description}</span>
                  </div>
                </button>
              )
            })}
          </nav>
        </aside>

        {/* Main Content Area */}
        <main className="admin-content-area" id={`admin-panel-${activeTab}`} role="tabpanel" aria-labelledby={`admin-tab-${activeTab}`}>
          {/* 1. Dashboard Overview */}
          {activeTab === 'dashboard' && (
            <div className="admin-section-panel">
              <div className="panel-header">
                <div>
                  <h2 className="panel-title">Operations Dashboard</h2>
                  <p className="panel-subtitle">Daily restaurant activity summary, service readiness, and key metrics.</p>
                </div>
                <span className="panel-badge panel-badge-live">Live Metrics</span>
              </div>

              {/* Core Metric Cards */}
              <div className="admin-stats-grid" role="region" aria-label="Restaurant operational metrics">
                {/* 1. Total Revenue */}
                <div className="admin-stat-card">
                  <div className="admin-stat-header">
                    <span className="admin-stat-label">Total Revenue</span>
                    <div className="admin-stat-icon-wrap revenue" aria-hidden="true">
                      <span className="material-symbols-outlined">payments</span>
                    </div>
                  </div>
                  <div className="admin-stat-value">{formatCurrency(totalRevenue)}</div>
                  <div className="admin-stat-footer">
                    <span className="admin-stat-subtext">
                      From {totalOrders} completed {totalOrders === 1 ? 'order' : 'orders'}
                    </span>
                  </div>
                </div>

                {/* 2. Total Orders (Clickable to open Orders tab) */}
                <div
                  className="admin-stat-card admin-stat-card-interactive"
                  role="button"
                  tabIndex={0}
                  onClick={() => handleTabChange('orders')}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault()
                      handleTabChange('orders')
                    }
                  }}
                  title="Click to view all customer orders"
                  aria-label="Total orders. Click to view order manifests."
                >
                  <div className="admin-stat-header">
                    <span className="admin-stat-label">Total Orders</span>
                    <div className="admin-stat-icon-wrap orders" aria-hidden="true">
                      <span className="material-symbols-outlined">receipt_long</span>
                    </div>
                  </div>
                  <div className="admin-stat-value">{totalOrders}</div>
                  <div className="admin-stat-footer">
                    <span className="admin-stat-subtext">
                      {totalOrders === 0
                        ? 'No orders recorded yet'
                        : 'View customer order queue →'}
                    </span>
                  </div>
                </div>

                {/* 3. Active / Available Dishes */}
                <div className="admin-stat-card">
                  <div className="admin-stat-header">
                    <span className="admin-stat-label">Active/Available Dishes</span>
                    <div className="admin-stat-icon-wrap active-dishes" aria-hidden="true">
                      <span className="material-symbols-outlined">check_circle</span>
                    </div>
                  </div>
                  <div className="admin-stat-value">
                    {loadingDishes ? (
                      <Skeleton variant="text" width="3.8rem" height="2.2rem" borderRadius="6px" />
                    ) : (
                      activeDishes
                    )}
                  </div>
                  <div className="admin-stat-footer">
                    <span className="admin-stat-subtext">
                      {loadingDishes
                        ? 'Loading catalog...'
                        : `${activeDishes} of ${totalDishes} items available`}
                    </span>
                  </div>
                </div>

                {/* 4. Total Dishes */}
                <div className="admin-stat-card">
                  <div className="admin-stat-header">
                    <span className="admin-stat-label">Total Dishes</span>
                    <div className="admin-stat-icon-wrap total-dishes" aria-hidden="true">
                      <span className="material-symbols-outlined">restaurant_menu</span>
                    </div>
                  </div>
                  <div className="admin-stat-value">
                    {loadingDishes ? (
                      <Skeleton variant="text" width="3.8rem" height="2.2rem" borderRadius="6px" />
                    ) : (
                      totalDishes
                    )}
                  </div>
                  <div className="admin-stat-footer">
                    <span className="admin-stat-subtext">
                      {loadingDishes
                        ? 'Loading catalog...'
                        : 'Cataloged Ethiopian dishes'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 2. Menu Management Section (Phase 3) */}
          {activeTab === 'menu' && (
            <div className="admin-section-panel">
              <div className="panel-header">
                <div>
                  <h2 className="panel-title">Menu Management</h2>
                  <p className="panel-subtitle">Dish catalog, pricing, categories, and real-time availability status.</p>
                </div>
                <div className="panel-header-badges">
                  <span className="panel-badge panel-badge-live">
                    {dishes.length} {dishes.length === 1 ? 'Dish' : 'Dishes'} Cataloged
                  </span>
                  <button
                    type="button"
                    className="admin-btn-primary admin-btn-add-dish"
                    onClick={handleOpenAddModal}
                    title="Add a new dish to the catalog"
                    aria-label="Add new dish"
                  >
                    <span className="material-symbols-outlined action-icon" aria-hidden="true">
                      add_circle
                    </span>
                    <span>Add Dish</span>
                  </button>
                </div>
              </div>

              {/* Toolbar: Search and Filter Controls */}
              <div className="admin-menu-toolbar">
                <div className="admin-search-wrapper">
                  <span className="material-symbols-outlined search-icon" aria-hidden="true">
                    search
                  </span>
                  <input
                    type="text"
                    id="admin-dish-search"
                    className="admin-search-input"
                    placeholder="Search dishes by name, description, or ingredients..."
                    value={menuSearchQuery}
                    onChange={(e) => setMenuSearchQuery(e.target.value)}
                    aria-label="Search catalog dishes"
                  />
                  {menuSearchQuery && (
                    <button
                      type="button"
                      className="admin-search-clear"
                      onClick={() => setMenuSearchQuery('')}
                      aria-label="Clear search query"
                    >
                      &times;
                    </button>
                  )}
                </div>

                <div className="admin-filter-group">
                  <div className="admin-select-wrapper">
                    <label htmlFor="admin-category-filter" className="sr-only">
                      Filter by Category
                    </label>
                    <select
                      id="admin-category-filter"
                      className="admin-filter-select"
                      value={menuSelectedCategory}
                      onChange={(e) => setMenuSelectedCategory(e.target.value)}
                    >
                      {filterCategories.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat === 'All' ? 'All Categories' : cat}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="admin-select-wrapper">
                    <label htmlFor="admin-status-filter" className="sr-only">
                      Filter by Status
                    </label>
                    <select
                      id="admin-status-filter"
                      className="admin-filter-select"
                      value={menuAvailabilityFilter}
                      onChange={(e) => setMenuAvailabilityFilter(e.target.value)}
                    >
                      <option value="all">All Statuses</option>
                      <option value="available">Available Only</option>
                      <option value="unavailable">Sold Out Only</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Status Meta Indicator */}
              <div className="admin-toolbar-meta">
                <span>
                  Showing <strong>{filteredDishes.length}</strong> of <strong>{dishes.length}</strong> dishes
                </span>
                {(menuSearchQuery || menuSelectedCategory !== 'All' || menuAvailabilityFilter !== 'all') && (
                  <button
                    type="button"
                    className="admin-btn-reset-filters"
                    onClick={() => {
                      setMenuSearchQuery('')
                      setMenuSelectedCategory('All')
                      setMenuAvailabilityFilter('all')
                    }}
                  >
                    Reset filters
                  </button>
                )}
              </div>

              {/* Loading State */}
              {loadingDishes && <AdminDishTableSkeleton rowCount={5} />}

              {/* Error State */}
              {!loadingDishes && dishesError && (
                <div className="admin-state-box error" role="alert">
                  <span className="material-symbols-outlined admin-state-icon" aria-hidden="true">
                    error
                  </span>
                  <h3 className="admin-state-title">Failed to load menu dishes</h3>
                  <p className="admin-state-text">{dishesError}</p>
                  <button
                    type="button"
                    className="admin-btn-retry"
                    onClick={handleRetryDishes}
                  >
                    Retry
                  </button>
                </div>
              )}

              {/* Empty State (Filtered or No Dishes) */}
              {!loadingDishes && !dishesError && filteredDishes.length === 0 && (
                <div className="admin-state-box empty">
                  <span className="material-symbols-outlined admin-state-icon" aria-hidden="true">
                    {dishes.length === 0 ? 'restaurant_menu' : 'search_off'}
                  </span>
                  <h3 className="admin-state-title">
                    {dishes.length === 0 ? 'No Dishes in Menu Catalog' : 'No matching dishes found'}
                  </h3>
                  <p className="admin-state-text">
                    {dishes.length === 0
                      ? 'All dishes have been removed or no dishes have been cataloged yet. Add your first dish to make it available on the storefront.'
                      : 'No dishes match your active search and filter criteria.'}
                  </p>
                  {dishes.length === 0 ? (
                    <button
                      type="button"
                      className="admin-btn-primary admin-btn-add-dish"
                      onClick={handleOpenAddModal}
                    >
                      <span className="material-symbols-outlined action-icon" aria-hidden="true">
                        add_circle
                      </span>
                      <span>Add First Dish</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      className="admin-btn-clear-search"
                      onClick={() => {
                        setMenuSearchQuery('')
                        setMenuSelectedCategory('All')
                        setMenuAvailabilityFilter('all')
                      }}
                    >
                      Clear Filters
                    </button>
                  )}
                </div>
              )}

              {/* Dishes Catalog Table */}
              {!loadingDishes && !dishesError && filteredDishes.length > 0 && (
                <div className="admin-table-container">
                  <table className="admin-dishes-table" aria-label="Menu Dishes Catalog">
                    <thead>
                      <tr>
                        <th scope="col" className="col-dish">Dish Name</th>
                        <th scope="col" className="col-category">Category</th>
                        <th scope="col" className="col-price">Price</th>
                        <th scope="col" className="col-status">Availability</th>
                        <th scope="col" className="col-actions">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredDishes.map((dish) => {
                        const isAvailable = dish.available !== false
                        return (
                          <tr key={dish.id} className="admin-table-row">
                            <td className="col-dish">
                              <div className="admin-dish-cell">
                                {dish.image ? (
                                  <img
                                    src={dish.image}
                                    alt=""
                                    className="admin-dish-thumb"
                                    loading="lazy"
                                  />
                                ) : (
                                  <div className="admin-dish-thumb-placeholder" aria-hidden="true">
                                    <span className="material-symbols-outlined">restaurant</span>
                                  </div>
                                )}
                                <div className="admin-dish-info">
                                  <span className="admin-dish-name">{dish.name}</span>
                                  {dish.description && (
                                    <span className="admin-dish-desc-snippet" title={dish.description}>
                                      {dish.description}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </td>
                            <td className="col-category">
                              <span className="admin-category-badge">
                                {dish.category || 'General'}
                              </span>
                            </td>
                            <td className="col-price">
                              <span className="admin-price-value">
                                {formatCurrency(dish.price)}
                              </span>
                            </td>
                            <td className="col-status">
                              <span
                                className={`admin-availability-badge ${
                                  isAvailable ? 'available' : 'unavailable'
                                }`}
                              >
                                <span className="badge-dot" aria-hidden="true" />
                                {isAvailable ? 'Available' : 'Sold Out'}
                              </span>
                            </td>
                            <td className="col-actions">
                              <div className="admin-actions-group">
                                <button
                                  type="button"
                                  className={`admin-btn-action toggle ${isAvailable ? 'btn-mark-soldout' : 'btn-mark-available'}`}
                                  onClick={() => handleToggleAvailability(dish)}
                                  title={isAvailable ? 'Click to mark sold out' : 'Click to mark available'}
                                  aria-label={`${isAvailable ? 'Disable' : 'Enable'} ${dish.name}`}
                                >
                                  <span className="material-symbols-outlined action-icon" aria-hidden="true">
                                    {isAvailable ? 'toggle_on' : 'toggle_off'}
                                  </span>
                                  <span>{isAvailable ? 'Disable' : 'Enable'}</span>
                                </button>
                                <button
                                  type="button"
                                  className="admin-btn-action edit"
                                  onClick={() => handleOpenEditModal(dish)}
                                  title={`Edit ${dish.name}`}
                                  aria-label={`Edit ${dish.name}`}
                                >
                                  <span className="material-symbols-outlined action-icon" aria-hidden="true">
                                    edit
                                  </span>
                                  <span>Edit</span>
                                </button>
                                <button
                                  type="button"
                                  className="admin-btn-action delete btn-delete-dish"
                                  onClick={() => handleRequestDelete(dish)}
                                  title={`Delete ${dish.name}`}
                                  aria-label={`Delete ${dish.name}`}
                                >
                                  <span className="material-symbols-outlined action-icon" aria-hidden="true">
                                    delete
                                  </span>
                                  <span>Delete</span>
                                </button>
                              </div>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Add Dish Modal (Admin Step 5) */}
              <AddDishModal
                categories={editCategoriesList}
                isOpen={isAddModalOpen}
                onClose={handleCloseAddModal}
                onAddDish={handleCreateDish}
              />

              {/* Delete Dish Confirmation Modal (Admin Step 5) */}
              <DeleteDishModal
                dish={deletingDish}
                isOpen={Boolean(deletingDish)}
                onClose={handleCloseDeleteModal}
                onConfirmDelete={handleConfirmDelete}
              />
              {editingDish && (
                <div
                  className="admin-modal-backdrop"
                  role="presentation"
                  onClick={handleCloseEditModal}
                >
                  <div
                    className="admin-modal-dialog"
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="edit-dish-modal-title"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <header className="admin-modal-header">
                      <div>
                        <span className="sub-title-caps">Menu Catalog Control</span>
                        <h3 id="edit-dish-modal-title" className="admin-modal-title">
                          Edit Dish Details
                        </h3>
                      </div>
                      <button
                        type="button"
                        className="admin-modal-close"
                        onClick={handleCloseEditModal}
                        aria-label="Close edit dialog"
                      >
                        &times;
                      </button>
                    </header>

                    <form onSubmit={handleSaveEdit} className="admin-modal-form" noValidate>
                      <div className="admin-modal-body">
                        {/* Dish Name */}
                        <div className="admin-form-group">
                          <label htmlFor="edit-dish-name" className="admin-form-label">
                            Dish Name <span className="required-star">*</span>
                          </label>
                          <input
                            type="text"
                            id="edit-dish-name"
                            className={`admin-form-input ${editErrors.name ? 'input-error' : ''}`}
                            value={editForm.name}
                            onChange={(e) => handleEditFormChange('name', e.target.value)}
                            placeholder="e.g. Special Beef Tibs"
                            aria-invalid={Boolean(editErrors.name)}
                            aria-describedby={editErrors.name ? 'edit-name-error' : undefined}
                          />
                          {editErrors.name && (
                            <span id="edit-name-error" className="admin-form-error">
                              {editErrors.name}
                            </span>
                          )}
                        </div>

                        {/* Price in ETB */}
                        <div className="admin-form-group">
                          <label htmlFor="edit-dish-price" className="admin-form-label">
                            Price (ETB) <span className="required-star">*</span>
                          </label>
                          <input
                            type="number"
                            id="edit-dish-price"
                            step="any"
                            min="1"
                            className={`admin-form-input ${editErrors.price ? 'input-error' : ''}`}
                            value={editForm.price}
                            onChange={(e) => handleEditFormChange('price', e.target.value)}
                            placeholder="e.g. 380"
                            aria-invalid={Boolean(editErrors.price)}
                            aria-describedby={editErrors.price ? 'edit-price-error' : undefined}
                          />
                          {editErrors.price && (
                            <span id="edit-price-error" className="admin-form-error">
                              {editErrors.price}
                            </span>
                          )}
                        </div>

                        {/* Category */}
                        <div className="admin-form-group">
                          <label htmlFor="edit-dish-category" className="admin-form-label">
                            Category <span className="required-star">*</span>
                          </label>
                          <select
                            id="edit-dish-category"
                            className={`admin-form-select ${editErrors.category ? 'input-error' : ''}`}
                            value={editForm.category}
                            onChange={(e) => handleEditFormChange('category', e.target.value)}
                            aria-invalid={Boolean(editErrors.category)}
                            aria-describedby={editErrors.category ? 'edit-category-error' : undefined}
                          >
                            {editCategoriesList.map((cat) => (
                              <option key={cat} value={cat}>
                                {cat}
                              </option>
                            ))}
                          </select>
                          {editErrors.category && (
                            <span id="edit-category-error" className="admin-form-error">
                              {editErrors.category}
                            </span>
                          )}
                        </div>

                        {/* Availability Toggle */}
                        <div className="admin-form-group admin-availability-control">
                          <span className="admin-form-label">Availability Status</span>
                          <label className="admin-toggle-switch-label" htmlFor="edit-dish-available">
                            <input
                              type="checkbox"
                              id="edit-dish-available"
                              checked={editForm.available}
                              onChange={(e) => handleEditFormChange('available', e.target.checked)}
                              className="admin-switch-checkbox"
                            />
                            <span className="admin-switch-slider" aria-hidden="true" />
                            <span className="admin-switch-text">
                              {editForm.available ? (
                                <span className="switch-status available">
                                  <span className="badge-dot" aria-hidden="true" /> Available to order
                                </span>
                              ) : (
                                <span className="switch-status unavailable">
                                  <span className="badge-dot" aria-hidden="true" /> Sold Out (Disabled)
                                </span>
                              )}
                            </span>
                          </label>
                        </div>
                      </div>

                      <footer className="admin-modal-footer">
                        <button
                          type="button"
                          className="admin-modal-btn cancel"
                          onClick={handleCloseEditModal}
                        >
                          Cancel
                        </button>
                        <button type="submit" className="admin-modal-btn save">
                          Save Changes
                        </button>
                      </footer>
                    </form>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* 3. Orders Management (Admin Step 4A) */}
          {activeTab === 'orders' && <AdminOrders />}

          {/* 4. Tables / QR Management (Admin Step 7) */}
          {activeTab === 'tables' && <AdminTables />}
        </main>
      </div>
    </div>
  )
}

export default Admin

import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { fetchDishes } from '../api/dishes'
import { getTableNumber } from '../utils/tableOrder'
import CategoryBar from './CategoryBar'
import DishList from './DishList'
import { CategoryBarSkeleton, DishGridSkeleton } from '../skeleton'

function Menu() {
  const [dishes, setDishes] = useState([])
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // URL query parameter is the single source of truth for selected category
  const [searchParams, setSearchParams] = useSearchParams()
  const categoryParam = searchParams.get('category')
  const tableNumber = getTableNumber(searchParams)

  useEffect(() => {
    let isMounted = true

    async function loadDishes() {
      try {
        setLoading(true)
        setError(null)
        const data = await fetchDishes()
        if (isMounted) {
          setDishes(data)
        }
      } catch (err) {
        if (isMounted) {
          setError(err.message || 'Failed to load dishes.')
        }
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    loadDishes()

    return () => {
      isMounted = false
    }
  }, [])

  // Derive unique categories dynamically from fetched dishes
  const categories = [
    'All',
    ...Array.from(new Set(dishes.map((dish) => dish.category).filter(Boolean))),
  ]

  // Resolve active category from URL param (case-insensitive)
  const selectedCategory = categoryParam
    ? categories.find(
        (cat) => cat.toLowerCase() === categoryParam.trim().toLowerCase()
      ) || categoryParam.trim()
    : 'All'

  // Update URL search parameters when category is selected
  const handleSelectCategory = (category) => {
    const newParams = new URLSearchParams(searchParams)
    if (!category || category.toLowerCase() === 'all') {
      newParams.delete('category')
    } else {
      newParams.set('category', category.toLowerCase())
    }
    setSearchParams(newParams)
  }

  // Filter based on both URL category and live search query
  const filteredDishes = dishes.filter((dish) => {
    const matchesCategory =
      selectedCategory.toLowerCase() === 'all' ||
      dish.category.toLowerCase() === selectedCategory.toLowerCase()

    const query = searchQuery.trim().toLowerCase()
    const matchesSearch =
      !query ||
      dish.name?.toLowerCase().includes(query) ||
      dish.description?.toLowerCase().includes(query) ||
      (Array.isArray(dish.ingredients) &&
        dish.ingredients.some((ingredient) =>
          ingredient.toLowerCase().includes(query)
        ))

    return matchesCategory && matchesSearch
  })

  return (
    <div className="menu-container">
      <header className="menu-header">
        <span className="sub-title-caps">Addis Culinary Heritage</span>
        <h1>Our Menu</h1>
        <p>Explore our authentic Ethiopian dishes freshly prepared with traditional spices and 100% teff injera.</p>
        {tableNumber && (
          <div className="menu-table-banner" role="status">
            <span className="material-symbols-outlined banner-icon" aria-hidden="true">
              table_restaurant
            </span>
            <span className="banner-text">
              Dine-In Service &bull; Ordering for <strong>Table #{tableNumber}</strong>
            </span>
            <span className="banner-badge">0 ETB Table Delivery</span>
          </div>
        )}
      </header>

      {/* Controls: Search and Category Filtering */}
      <section className="menu-controls" aria-label="Menu filters and search">
        <div className="search-section">
          <div className="search-input-wrapper">
            <label htmlFor="dish-search" className="sr-only">
              Search dishes
            </label>
            <input
              type="text"
              id="dish-search"
              className="search-input"
              placeholder="Search by dish name, description, or ingredient (e.g., Tibs, Shiro, Ginger)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              aria-label="Search dishes by name, description, or ingredient"
            />
            {searchQuery && (
              <button
                type="button"
                className="search-clear-btn"
                onClick={() => setSearchQuery('')}
                aria-label="Clear search input"
              >
                <span aria-hidden="true">&times;</span>
              </button>
            )}
          </div>
        </div>

        {loading && <CategoryBarSkeleton count={6} />}
        {!loading && !error && (
          <CategoryBar
            categories={categories}
            selectedCategory={selectedCategory}
            onSelectCategory={handleSelectCategory}
          />
        )}
      </section>

      {loading && (
        <section className="menu-content" aria-label="Loading dishes">
          <DishGridSkeleton count={8} />
        </section>
      )}

      {error && (
        <div className="menu-status-box error">
          <p>Error: {error}</p>
        </div>
      )}

      {!loading && !error && (
        <section className="menu-content" aria-label="Menu dishes">
          <h2 className="sr-only">Menu Dishes</h2>
          <div className="menu-meta">
            {searchQuery.trim() || selectedCategory.toLowerCase() !== 'all' ? (
              <span>
                Found <strong>{filteredDishes.length}</strong> matching{' '}
                {filteredDishes.length === 1 ? 'dish' : 'dishes'}
                {selectedCategory.toLowerCase() !== 'all' && (
                  <> in category <strong>&ldquo;{selectedCategory}&rdquo;</strong></>
                )}
                {searchQuery.trim() && (
                  <> for &ldquo;{searchQuery}&rdquo;</>
                )}
              </span>
            ) : (
              <span>Showing all {dishes.length} dishes</span>
            )}
          </div>
          <DishList dishes={filteredDishes} tableNumber={tableNumber} />
        </section>
      )}
    </div>
  )
}

export default Menu

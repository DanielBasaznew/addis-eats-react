function CategoryBar({ categories, selectedCategory, onSelectCategory }) {
  if (!categories || categories.length === 0) {
    return null
  }

  const normalizedSelected = (selectedCategory || 'all').toLowerCase()

  return (
    <nav className="category-bar" aria-label="Dish categories">
      {categories.map((category) => {
        const isActive = category.toLowerCase() === normalizedSelected
        return (
          <button
            key={category}
            type="button"
            className={`category-btn ${isActive ? 'active' : ''}`}
            onClick={() => onSelectCategory(category)}
            aria-pressed={isActive}
          >
            {category}
          </button>
        )
      })}
    </nav>
  )
}

export default CategoryBar

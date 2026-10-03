const STORAGE_KEY = 'addis-eats-menu-overrides'
const CUSTOM_DISHES_KEY = 'addis-eats-custom-dishes'
const DELETED_DISHES_KEY = 'addis-eats-deleted-dishes'

export function getDishOverrides() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    return stored ? JSON.parse(stored) : {}
  } catch (err) {
    console.error('Failed to read dish overrides from storage:', err)
    return {}
  }
}

export function saveDishOverride(id, updates) {
  try {
    const current = getDishOverrides()
    const dishKey = String(id)
    const updated = {
      ...current,
      [dishKey]: {
        ...(current[dishKey] || {}),
        ...updates,
      },
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
    return updated
  } catch (err) {
    console.error('Failed to save dish override to storage:', err)
    return {}
  }
}

export function getCustomDishes() {
  try {
    const stored = localStorage.getItem(CUSTOM_DISHES_KEY)
    const list = stored ? JSON.parse(stored) : []
    return Array.isArray(list) ? list : []
  } catch (err) {
    console.error('Failed to read custom dishes from storage:', err)
    return []
  }
}

export function getDeletedDishIds() {
  try {
    const stored = localStorage.getItem(DELETED_DISHES_KEY)
    const list = stored ? JSON.parse(stored) : []
    return new Set(Array.isArray(list) ? list.map(String) : [])
  } catch (err) {
    console.error('Failed to read deleted dish IDs from storage:', err)
    return new Set()
  }
}

export function addDish(dishData) {
  try {
    const current = getCustomDishes()
    const uniqueId = dishData.id || Date.now()
    const newDish = {
      id: uniqueId,
      name: (dishData.name || '').trim(),
      category: (dishData.category || 'Traditional').trim(),
      price: Number(dishData.price) || 0,
      available: dishData.available !== false,
      description:
        (dishData.description || '').trim() ||
        `Freshly prepared ${dishData.category || 'Traditional'} specialty crafted with authentic Ethiopian herbs and aromatic spiced butter.`,
      image:
        (dishData.image || '').trim() ||
        'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&auto=format&fit=crop&q=60',
      ingredients: Array.isArray(dishData.ingredients)
        ? dishData.ingredients
        : ['Traditional Spices', 'Organic Ethiopian Ingredients', 'Fresh Injera'],
    }

    const updated = [newDish, ...current]
    localStorage.setItem(CUSTOM_DISHES_KEY, JSON.stringify(updated))
    return newDish
  } catch (err) {
    console.error('Failed to add custom dish to storage:', err)
    throw err
  }
}

export function deleteDish(id) {
  try {
    const dishKey = String(id)

    const currentCustom = getCustomDishes()
    const updatedCustom = currentCustom.filter((item) => String(item.id) !== dishKey)
    localStorage.setItem(CUSTOM_DISHES_KEY, JSON.stringify(updatedCustom))

    const deletedSet = getDeletedDishIds()
    deletedSet.add(dishKey)
    localStorage.setItem(DELETED_DISHES_KEY, JSON.stringify(Array.from(deletedSet)))

    saveDishOverride(id, { deleted: true })
    return true
  } catch (err) {
    console.error('Failed to delete dish from storage:', err)
    return false
  }
}

export function applyDishOverrides(dishes) {
  if (!Array.isArray(dishes)) return dishes
  const overrides = getDishOverrides()
  const deletedIds = getDeletedDishIds()

  return dishes
    .filter((dish) => {
      const idStr = String(dish.id)
      return !deletedIds.has(idStr) && !overrides[idStr]?.deleted
    })
    .map((dish) => {
      const override = overrides[String(dish.id)]
      if (override) {
        return { ...dish, ...override }
      }
      return dish
    })
}

export async function fetchDishes() {
  const response = await fetch('/menu-data.json')
  
  if (!response.ok) {
    throw new Error(`Failed to load menu dishes: HTTP ${response.status} ${response.statusText}`)
  }
  
  const data = await response.json()
  const customDishes = getCustomDishes()
  const combined = [...customDishes, ...data]
  return applyDishOverrides(combined)
}

export async function fetchDishById(id) {
  const dishes = await fetchDishes()
  const dish = dishes.find((item) => String(item.id) === String(id))
  return dish || null
}

import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

export const useFavoritesStore = create(
  persist(
    (set, get) => ({
      favorites: [],

      addFavorite: (dish) => {
        if (!dish || dish.id === undefined || dish.id === null) {
          return
        }

        set((state) => {
          const alreadyFavorited = state.favorites.some(
            (item) => String(item.id) === String(dish.id)
          )

          if (alreadyFavorited) {
            return state
          }

          const newFavorite = {
            id: dish.id,
            name: dish.name || '',
            price: typeof dish.price === 'number' ? dish.price : Number(dish.price) || 0,
            image: dish.image || '',
            category: dish.category || '',
            description: dish.description || '',
            available: dish.available !== false,
          }

          return {
            favorites: [...state.favorites, newFavorite],
          }
        })
      },

      removeFavorite: (id) => {
        if (id === undefined || id === null) {
          return
        }

        const targetId = String(id)
        set((state) => ({
          favorites: state.favorites.filter(
            (item) => String(item.id) !== targetId
          ),
        }))
      },

      toggleFavorite: (dish) => {
        if (!dish) {
          return
        }

        const dishId = typeof dish === 'object' && dish !== null ? dish.id : dish
        if (dishId === undefined || dishId === null) {
          return
        }

        const isFav = get().isFavorite(dishId)
        if (isFav) {
          get().removeFavorite(dishId)
        } else if (typeof dish === 'object' && dish !== null) {
          get().addFavorite(dish)
        }
      },

      isFavorite: (id) => {
        if (id === undefined || id === null) {
          return false
        }
        const searchId = String(id)
        return get().favorites.some((item) => String(item.id) === searchId)
      },

      clearFavorites: () => {
        set({ favorites: [] })
      },

      getFavorites: () => {
        return get().favorites
      },

      getTotalFavorites: () => {
        return get().favorites.length
      },

      addToFavorites: (dish) => get().addFavorite(dish),
      removeFromFavorites: (id) => get().removeFavorite(id),
    }),
    {
      name: 'addis-eats-favorites',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        favorites: state.favorites,
      }),
      merge: (persistedState, currentState) => ({
        ...currentState,
        favorites: Array.isArray(persistedState?.favorites)
          ? persistedState.favorites
          : [],
      }),
    }
  )
)

export const selectFavorites = (state) => state.favorites
export const selectTotalFavorites = (state) => state.favorites.length
export const selectIsFavorite = (id) => (state) =>
  state.favorites.some((item) => String(item.id) === String(id))

export const favoritesStore = useFavoritesStore

favoritesStore.addFavorite = (dish) => useFavoritesStore.getState().addFavorite(dish)
favoritesStore.removeFavorite = (id) => useFavoritesStore.getState().removeFavorite(id)
favoritesStore.toggleFavorite = (dish) => useFavoritesStore.getState().toggleFavorite(dish)
favoritesStore.isFavorite = (id) => useFavoritesStore.getState().isFavorite(id)
favoritesStore.clearFavorites = () => useFavoritesStore.getState().clearFavorites()
favoritesStore.getFavorites = () => useFavoritesStore.getState().getFavorites()
favoritesStore.getTotalFavorites = () => useFavoritesStore.getState().getTotalFavorites()

export default useFavoritesStore

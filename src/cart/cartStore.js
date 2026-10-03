import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

const calculateTotals = (items = []) => {
  const totalItems = items.reduce(
    (sum, item) => sum + (Number(item.quantity) || 0),
    0
  )
  const subtotal = items.reduce(
    (sum, item) =>
      sum + (Number(item.price) || 0) * (Number(item.quantity) || 0),
    0
  )
  return { totalItems, subtotal }
}

export const useCartStore = create(
  persist(
    (set, get) => ({
      items: [],
      totalItems: 0,
      subtotal: 0,

      addItem: (item, quantity = 1) => {
        if (!item || item.id === undefined || item.id === null) return

        const qtyToAdd =
          typeof quantity === 'number' && quantity > 0
            ? quantity
            : typeof item.quantity === 'number' && item.quantity > 0
              ? item.quantity
              : 1

        const parsedPrice =
          typeof item.price === 'number' ? item.price : Number(item.price) || 0

        set((state) => {
          const existingIndex = state.items.findIndex(
            (cartItem) => String(cartItem.id) === String(item.id)
          )

          let nextItems
          if (existingIndex > -1) {
            nextItems = state.items.map((cartItem, index) => {
              if (index === existingIndex) {
                return {
                  ...cartItem,
                  quantity: cartItem.quantity + qtyToAdd,
                }
              }
              return cartItem
            })
          } else {
            const newItem = {
              id: item.id,
              name: item.name || '',
              price: parsedPrice,
              image: item.image || '',
              quantity: qtyToAdd,
            }
            nextItems = [...state.items, newItem]
          }

          return {
            items: nextItems,
            ...calculateTotals(nextItems),
          }
        })
      },

      removeItem: (id) => {
        set((state) => {
          const nextItems = state.items.filter(
            (item) => String(item.id) !== String(id)
          )
          return {
            items: nextItems,
            ...calculateTotals(nextItems),
          }
        })
      },

      increaseQuantity: (id, amount = 1) => {
        const step = typeof amount === 'number' && amount > 0 ? amount : 1
        set((state) => {
          const nextItems = state.items.map((item) => {
            if (String(item.id) === String(id)) {
              return {
                ...item,
                quantity: item.quantity + step,
              }
            }
            return item
          })
          return {
            items: nextItems,
            ...calculateTotals(nextItems),
          }
        })
      },

      decreaseQuantity: (id, amount = 1) => {
        const step = typeof amount === 'number' && amount > 0 ? amount : 1
        set((state) => {
          const nextItems = state.items
            .map((item) => {
              if (String(item.id) === String(id)) {
                return {
                  ...item,
                  quantity: item.quantity - step,
                }
              }
              return item
            })
            .filter((item) => item.quantity > 0)

          return {
            items: nextItems,
            ...calculateTotals(nextItems),
          }
        })
      },

      clearCart: () => {
        set({
          items: [],
          totalItems: 0,
          subtotal: 0,
        })
      },

      getTotalItems: () => {
        return get().items.reduce(
          (total, item) => total + (Number(item.quantity) || 0),
          0
        )
      },

      getSubtotal: () => {
        return get().items.reduce(
          (total, item) =>
            total + (Number(item.price) || 0) * (Number(item.quantity) || 0),
          0
        )
      },

      addToCart: (item, quantity) => get().addItem(item, quantity),
      removeFromCart: (id) => get().removeItem(id),
    }),
    {
      name: 'addis-eats-cart',
      storage: createJSONStorage(() => localStorage),
      // Derived totals are recalculated on hydration
      partialize: (state) => ({
        items: state.items,
      }),
      merge: (persistedState, currentState) => {
        const items = Array.isArray(persistedState?.items)
          ? persistedState.items
          : []
        const { totalItems, subtotal } = calculateTotals(items)
        return {
          ...currentState,
          items,
          totalItems,
          subtotal,
        }
      },
    }
  )
)

export const selectCartItems = (state) => state.items
export const selectTotalItems = (state) =>
  state.totalItems !== undefined
    ? state.totalItems
    : state.items.reduce((total, item) => total + (Number(item.quantity) || 0), 0)
export const selectSubtotal = (state) =>
  state.subtotal !== undefined
    ? state.subtotal
    : state.items.reduce(
      (total, item) =>
        total + (Number(item.price) || 0) * (Number(item.quantity) || 0),
      0
    )

export const cartStore = useCartStore
export default useCartStore

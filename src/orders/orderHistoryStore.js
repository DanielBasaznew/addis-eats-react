import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

export const useOrderHistoryStore = create(
  persist(
    (set, get) => ({
      orders: [],

      addOrder: (order) => {
        if (!order || (!order.id && !order.orderId)) {
          return
        }

        set((state) => ({
          orders: [order, ...state.orders],
        }))
      },

      clearOrderHistory: () => {
        set({ orders: [] })
      },

      getOrders: () => {
        return get().orders
      },

      getOrderById: (id) => {
        if (!id) return undefined
        const searchId = String(id)
        return get().orders.find(
          (order) =>
            String(order.id) === searchId || String(order.orderId) === searchId
        )
      },

      updateOrderStatus: (id, status) => {
        if (!id || !status) return
        const searchId = String(id)
        set((state) => ({
          orders: state.orders.map((order) =>
            String(order.id) === searchId || String(order.orderId) === searchId
              ? { ...order, status }
              : order
          ),
        }))
      },

      deleteOrder: (id) => {
        if (!id) return
        const searchId = String(id)
        set((state) => ({
          orders: state.orders.filter(
            (order) =>
              String(order.id) !== searchId && String(order.orderId) !== searchId
          ),
        }))
      },
    }),
    {
      name: 'addis-eats-orders',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        orders: state.orders,
      }),
      merge: (persistedState, currentState) => ({
        ...currentState,
        orders: Array.isArray(persistedState?.orders)
          ? persistedState.orders
          : [],
      }),
    }
  )
)

export const ORDER_STATUSES = [
  'Pending',
  'Confirmed',
  'Preparing',
  'Out for Delivery',
  'Delivered',
  'Cancelled',
]

export const selectOrders = (state) => state.orders
export const selectTotalOrders = (state) => state.orders.length
export const selectIsFirstOrder = (state) => state.orders.length === 0
export const selectUpdateOrderStatus = (state) => state.updateOrderStatus
export const selectDeleteOrder = (state) => state.deleteOrder
export const selectOrderById = (id) => (state) =>
  state.orders.find(
    (order) => String(order.id) === String(id) || String(order.orderId) === String(id)
  )

export const orderHistoryStore = useOrderHistoryStore

// Direct store method bindings for non-hook contexts
orderHistoryStore.addOrder = (order) => useOrderHistoryStore.getState().addOrder(order)
orderHistoryStore.updateOrderStatus = (id, status) =>
  useOrderHistoryStore.getState().updateOrderStatus(id, status)
orderHistoryStore.deleteOrder = (id) =>
  useOrderHistoryStore.getState().deleteOrder(id)
orderHistoryStore.clearOrderHistory = () => useOrderHistoryStore.getState().clearOrderHistory()
orderHistoryStore.getOrders = () => useOrderHistoryStore.getState().getOrders()
orderHistoryStore.getOrderById = (id) => useOrderHistoryStore.getState().getOrderById(id)

export default useOrderHistoryStore

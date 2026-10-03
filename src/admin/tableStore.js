import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

export const DEFAULT_TABLES = [
  {
    id: 'tbl-1',
    number: '1',
    label: 'Window Booth',
    seats: 4,
    createdAt: '2026-09-01T10:00:00.000Z',
  },
  {
    id: 'tbl-2',
    number: '2',
    label: 'Main Hall',
    seats: 2,
    createdAt: '2026-09-01T10:00:00.000Z',
  },
  {
    id: 'tbl-3',
    number: '3',
    label: 'Main Hall',
    seats: 4,
    createdAt: '2026-09-01T10:00:00.000Z',
  },
  {
    id: 'tbl-4',
    number: '4',
    label: 'Garden Patio',
    seats: 6,
    createdAt: '2026-09-01T10:00:00.000Z',
  },
  {
    id: 'tbl-5',
    number: '5',
    label: 'Garden Patio',
    seats: 4,
    createdAt: '2026-09-01T10:00:00.000Z',
  },
  {
    id: 'tbl-6',
    number: '6',
    label: 'VIP Lounge',
    seats: 8,
    createdAt: '2026-09-01T10:00:00.000Z',
  },
]

export const useTableStore = create(
  persist(
    (set, get) => ({
      tables: DEFAULT_TABLES,

      addTable: (tableData) => {
        const trimmedNumber = String(tableData.number || '').trim()
        if (!trimmedNumber) return null

        const newTable = {
          id: `tbl-${Date.now()}`,
          number: trimmedNumber,
          label: String(tableData.label || '').trim() || 'General Dining',
          seats: Number(tableData.seats) || 4,
          createdAt: new Date().toISOString(),
        }

        set((state) => ({
          tables: [...state.tables, newTable],
        }))

        return newTable
      },

      deleteTable: (id) => {
        if (!id) return
        set((state) => ({
          tables: state.tables.filter((table) => String(table.id) !== String(id)),
        }))
      },

      resetDefaultTables: () => {
        set({ tables: DEFAULT_TABLES })
      },

      getTables: () => get().tables,
    }),
    {
      name: 'addis-eats-tables',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        tables: state.tables,
      }),
      merge: (persistedState, currentState) => ({
        ...currentState,
        tables: Array.isArray(persistedState?.tables)
          ? persistedState.tables
          : DEFAULT_TABLES,
      }),
    }
  )
)

export const selectTables = (state) => state.tables
export const selectTotalTables = (state) => state.tables.length
export const selectAddTable = (state) => state.addTable
export const selectDeleteTable = (state) => state.deleteTable
export const selectResetDefaultTables = (state) => state.resetDefaultTables

export default useTableStore

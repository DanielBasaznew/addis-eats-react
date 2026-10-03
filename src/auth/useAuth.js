import { useContext } from 'react'
import { AuthContext } from './AuthProvider'

/**
 * Custom hook to consume Addis Eats AuthContext safely.
 *
 * Exposes:
 * - user: Object | null
 * - isAuthenticated: boolean
 * - login: (userData?: Object) => Object
 * - logout: () => void
 *
 * @returns {{ user: Object|null, isAuthenticated: boolean, login: Function, logout: Function }}
 */
export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export default useAuth

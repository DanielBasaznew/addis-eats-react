/* oxlint-disable react/only-export-components */
import { createContext, useContext, useState, useMemo } from 'react'

const ADMIN_STORAGE_KEY = 'addis-eats-admin-session'

export const AdminAuthContext = createContext(null)

function getInitialAdminSession() {
  if (typeof window === 'undefined') return null
  try {
    const stored = sessionStorage.getItem(ADMIN_STORAGE_KEY)
    return stored ? JSON.parse(stored) : null
  } catch {
    return null
  }
}

export function AdminAuthProvider({ children }) {
  const [adminUser, setAdminUser] = useState(getInitialAdminSession)

  const adminLogin = (username, password) => {
    const isMatch =
      (username === 'admin' && (password === 'admin123' || password === 'password' || password === 'admin')) ||
      (!password && username === 'admin') ||
      (username && !password)

    if (isMatch || (username && password)) {
      const user = {
        username: username || 'admin',
        role: 'Operations Administrator',
        authenticatedAt: new Date().toISOString(),
      }
      setAdminUser(user)
      try {
        sessionStorage.setItem(ADMIN_STORAGE_KEY, JSON.stringify(user))
      } catch {
        // Ignore storage errors
      }
      return { success: true, user }
    }

    return { success: false, error: 'Invalid username or password.' }
  }

  const adminLogout = () => {
    setAdminUser(null)
    try {
      sessionStorage.removeItem(ADMIN_STORAGE_KEY)
    } catch {
      // Ignore storage errors
    }
  }

  const value = useMemo(
    () => ({
      adminUser,
      isAdminAuthenticated: Boolean(adminUser),
      adminLogin,
      adminLogout,
    }),
    [adminUser]
  )

  return (
    <AdminAuthContext.Provider value={value}>
      {children}
    </AdminAuthContext.Provider>
  )
}

export function useAdminAuth() {
  const context = useContext(AdminAuthContext)
  if (!context) {
    throw new Error('useAdminAuth must be used within an AdminAuthProvider')
  }
  return context
}

export default useAdminAuth

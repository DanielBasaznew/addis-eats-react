/* oxlint-disable react/only-export-components */
import { createContext, useState, useMemo } from 'react'

export const AuthContext = createContext(null)

const AUTH_STORAGE_KEY = 'addis-eats-auth-user'

function getInitialUser() {
  if (typeof window === 'undefined') return null

  try {
    const saved = localStorage.getItem(AUTH_STORAGE_KEY)
    return saved ? JSON.parse(saved) : null
  } catch {
    return null
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(getInitialUser)

  // Authenticate user with provided credentials/data or standard customer defaults
  const login = (userData) => {
    const defaultUser = {
      id: 'user-101',
      name: 'Abebe Bikila',
      fullName: 'Abebe Bikila',
      email: 'abebe@example.com',
      phone: '0911234567',
    }

    const authenticatedUser =
      userData && typeof userData === 'object'
        ? { ...defaultUser, ...userData }
        : defaultUser

    setUser(authenticatedUser)

    try {
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(authenticatedUser))
    } catch {
      // Ignore write errors
    }

    return authenticatedUser
  }

  // Terminate active customer session
  const logout = () => {
    setUser(null)
    try {
      localStorage.removeItem(AUTH_STORAGE_KEY)
    } catch {
      // Ignore write errors
    }
  }

  const contextValue = useMemo(
    () => ({
      user,
      isAuthenticated: Boolean(user),
      login,
      logout,
    }),
    [user]
  )

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  )
}

export default AuthProvider

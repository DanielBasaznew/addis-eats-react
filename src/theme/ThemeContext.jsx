/* oxlint-disable react/only-export-components */
import { createContext, useContext, useState, useEffect } from 'react'

const THEMES = {
  LIGHT: 'light',
  DARK: 'dark',
}

const THEME_STORAGE_KEY = 'addis-eats-theme'

export const ThemeContext = createContext(null)

function getInitialTheme() {
  if (typeof window === 'undefined') return THEMES.LIGHT

  try {
    const savedTheme = localStorage.getItem(THEME_STORAGE_KEY)
    if (savedTheme === THEMES.DARK || savedTheme === THEMES.LIGHT) {
      return savedTheme
    }
  } catch {
    // LocalStorage access may fail in restricted sandboxes; fallback to light
  }

  return THEMES.LIGHT
}

export function ThemeProvider({ children }) {
  const [theme, setThemeState] = useState(getInitialTheme)

  // Toggle between light and dark themes
  const toggleTheme = () => {
    setThemeState((prevTheme) =>
      prevTheme === THEMES.DARK ? THEMES.LIGHT : THEMES.DARK
    )
  }

  // Explicitly set theme to a specific value
  const setTheme = (newTheme) => {
    if (newTheme === THEMES.DARK || newTheme === THEMES.LIGHT) {
      setThemeState(newTheme)
    }
  }

  // Apply theme globally to the document and persist to localStorage
  useEffect(() => {
    const root = document.documentElement
    const body = document.body

    // Apply data-theme attribute on root and body
    root.setAttribute('data-theme', theme)
    if (body) {
      body.setAttribute('data-theme', theme)
    }

    // Toggle clean class on root and body
    if (theme === THEMES.DARK) {
      root.classList.add('dark')
      root.classList.remove('light')
      if (body) {
        body.classList.add('dark')
        body.classList.remove('light')
      }
    } else {
      root.classList.add('light')
      root.classList.remove('dark')
      if (body) {
        body.classList.add('light')
        body.classList.remove('dark')
      }
    }

    // Persist preference to localStorage
    try {
      localStorage.setItem(THEME_STORAGE_KEY, theme)
    } catch {
      // Ignore write errors (e.g. storage disabled)
    }
  }, [theme])

  const contextValue = {
    theme,
    toggleTheme,
    setTheme,
    isDark: theme === THEMES.DARK,
  }

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  )
}

/**
 * Custom hook to consume ThemeContext safely
 */
export function useTheme() {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}

export default ThemeContext

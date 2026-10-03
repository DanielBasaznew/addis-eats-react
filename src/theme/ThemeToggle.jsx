import { useTheme } from './ThemeContext'

function ThemeToggle({ className = '' }) {
  const { theme, toggleTheme } = useTheme()
  const isDark = theme === 'dark'

  const accessibleLabel = isDark
    ? 'Switch to light theme'
    : 'Switch to dark theme'

  return (
    <button
      type="button"
      className={`theme-toggle-btn ${isDark ? 'dark-mode' : 'light-mode'} ${className}`.trim()}
      onClick={toggleTheme}
      aria-label={accessibleLabel}
      title={accessibleLabel}
      aria-pressed={isDark}
    >
      <span className="theme-toggle-text">
        {isDark ? 'Light' : 'Dark'}
      </span>
    </button>
  )
}

export default ThemeToggle

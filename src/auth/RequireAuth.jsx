import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from './useAuth'

function RequireAuth({ children }) {
  const { isAuthenticated, user } = useAuth()
  const location = useLocation()

  if (!isAuthenticated && !user) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  return children ? children : null
}

export default RequireAuth

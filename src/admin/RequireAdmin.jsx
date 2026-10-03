import { Navigate, useLocation } from 'react-router-dom'
import { useAdminAuth } from './useAdminAuth'

function RequireAdmin({ children }) {
  const { isAdminAuthenticated, adminUser } = useAdminAuth()
  const location = useLocation()

  if (!isAdminAuthenticated && !adminUser) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />
  }

  return children ? children : null
}

export default RequireAdmin

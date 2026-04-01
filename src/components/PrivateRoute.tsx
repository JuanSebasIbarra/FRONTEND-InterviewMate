import type { ReactElement } from 'react'
import { Navigate } from 'react-router-dom'
import { isAuthenticated } from '../lib/auth'

type PrivateRouteProps = {
  children: ReactElement
}

function PrivateRoute({ children }: PrivateRouteProps) {
  const hasAccess = isAuthenticated()

  return hasAccess ? children : <Navigate to="/login" replace />
}

export default PrivateRoute
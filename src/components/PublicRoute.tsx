import type { ReactElement } from 'react'
import { Navigate } from 'react-router-dom'
import { isAuthenticated } from '../lib/auth'

type PublicRouteProps = {
  children: ReactElement
}

function PublicRoute({ children }: PublicRouteProps) {
  const hasSession = isAuthenticated()
  return hasSession ? <Navigate to="/dashboard" replace /> : children
}

export default PublicRoute
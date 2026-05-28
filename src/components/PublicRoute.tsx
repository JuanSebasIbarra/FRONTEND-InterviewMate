import type { ReactElement } from 'react'
import { Navigate } from 'react-router-dom'
import { useSession } from '../contexts/SessionContext'

type PublicRouteProps = {
  children: ReactElement
}

function PublicRoute({ children }: PublicRouteProps) {
  const { status } = useSession()

  if (status === 'checking') {
    return null
  }

  return status === 'authenticated' ? <Navigate to="/dashboard" replace /> : children
}

export default PublicRoute
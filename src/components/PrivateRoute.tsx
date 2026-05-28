import type { ReactElement } from 'react'
import { Navigate } from 'react-router-dom'
import { useSession } from '../contexts/SessionContext'

type PrivateRouteProps = {
  children: ReactElement
}

function PrivateRoute({ children }: PrivateRouteProps) {
  const { status } = useSession()

  if (status === 'checking') {
    return null
  }

  return status === 'authenticated' ? children : <Navigate to="/login" replace />
}

export default PrivateRoute
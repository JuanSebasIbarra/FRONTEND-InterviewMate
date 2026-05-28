import { useEffect, useState } from 'react'
import type { ReactElement } from 'react'
import { Navigate } from 'react-router-dom'
import { getMe } from '../services/authService'

type PrivateRouteProps = {
  children: ReactElement
}

function PrivateRoute({ children }: PrivateRouteProps) {
  const [status, setStatus] = useState<'checking' | 'authenticated' | 'unauthenticated'>('checking')

  useEffect(() => {
    let active = true

    const validateSession = async () => {
      try {
        await getMe()
        if (active) {
          setStatus('authenticated')
        }
      } catch {
        if (active) {
          setStatus('unauthenticated')
        }
      }
    }

    void validateSession()

    return () => {
      active = false
    }
  }, [])

  if (status === 'checking') {
    return null
  }

  return status === 'authenticated' ? children : <Navigate to="/login" replace />
}

export default PrivateRoute
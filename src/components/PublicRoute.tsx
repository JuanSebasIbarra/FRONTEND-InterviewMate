import { useEffect, useState } from 'react'
import type { ReactElement } from 'react'
import { Navigate } from 'react-router-dom'
import { getMe } from '../services/authService'

type PublicRouteProps = {
  children: ReactElement
}

function PublicRoute({ children }: PublicRouteProps) {
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

  return status === 'authenticated' ? <Navigate to="/dashboard" replace /> : children
}

export default PublicRoute
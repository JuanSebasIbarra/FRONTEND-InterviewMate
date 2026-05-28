import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { AUTH_STATE_EVENT, type AuthStateEventDetail } from '../lib/auth'
import { getMe } from '../services/authService'

type SessionStatus = 'idle' | 'checking' | 'authenticated' | 'unauthenticated'

type SessionContextValue = {
  status: SessionStatus
  refreshSession: () => Promise<SessionStatus>
}

const SessionContext = createContext<SessionContextValue | null>(null)

function readAuthStatusFromEvent(event: Event): SessionStatus | null {
  const customEvent = event as CustomEvent<AuthStateEventDetail>
  const authStatus = customEvent.detail?.status
  if (authStatus === 'authenticated' || authStatus === 'unauthenticated') {
    return authStatus
  }
  return null
}

export function SessionProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<SessionStatus>('idle')
  const inFlightValidationRef = useRef<Promise<SessionStatus> | null>(null)

  const refreshSession = useCallback(async (): Promise<SessionStatus> => {
    if (inFlightValidationRef.current) {
      return inFlightValidationRef.current
    }

    setStatus('checking')

    const validationPromise = (async () => {
      try {
        await getMe()
        setStatus('authenticated')
        return 'authenticated' as const
      } catch (error) {
        // Retry once after a short delay (helps with OAuth cookie timing)
        await new Promise((resolve) => setTimeout(resolve, 1000))
        try {
          await getMe()
          setStatus('authenticated')
          return 'authenticated' as const
        } catch {
          setStatus('unauthenticated')
          return 'unauthenticated' as const
        }
      } finally {
        inFlightValidationRef.current = null
      }
    })()

    inFlightValidationRef.current = validationPromise
    return validationPromise
  }, [])

  useEffect(() => {
    const onAuthStateChanged = (event: Event) => {
      const nextStatus = readAuthStatusFromEvent(event)
      if (nextStatus) {
        setStatus(nextStatus)
        inFlightValidationRef.current = null
      }
    }

    window.addEventListener(AUTH_STATE_EVENT, onAuthStateChanged)
    return () => {
      window.removeEventListener(AUTH_STATE_EVENT, onAuthStateChanged)
    }
  }, [])

  const contextValue = useMemo<SessionContextValue>(
    () => ({ status, refreshSession }),
    [refreshSession, status],
  )

  return <SessionContext.Provider value={contextValue}>{children}</SessionContext.Provider>
}

export function useSession() {
  const contextValue = useContext(SessionContext)
  if (!contextValue) {
    throw new Error('useSession must be used inside SessionProvider')
  }
  return contextValue
}

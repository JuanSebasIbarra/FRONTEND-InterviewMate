import { useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import {
  handleOAuthCallback,
  OAUTH_CALLBACK_PARAMS,
} from '../controllers/authController'

/**
 * OAuthCallbackPage
 *
 * Canonical landing point for the Google OAuth2 redirect.
 * The backend redirects here after a successful authentication with the token
 * in the query string, e.g.:
 *   /auth/callback?token=eyJ...&expiresAt=2026-04-04T00:00:00Z
 *
 * Flow:
 *  1. Read `token` (required) and `expiresAt` (optional) from URL params.
 *  2. If an `error` param is present or `token` is missing → redirect to /login.
 *  3. Persist the token via the auth controller.
 *  4. Replace the current history entry with /dashboard so the callback URL
 *     is never re-visited via the back button.
 */
function OAuthCallbackPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  useEffect(() => {
    const processCallback = async () => {
      const token = searchParams.get(OAUTH_CALLBACK_PARAMS.TOKEN)
      const expiresAt = searchParams.get(OAUTH_CALLBACK_PARAMS.EXPIRES_AT)
      const error = searchParams.get(OAUTH_CALLBACK_PARAMS.ERROR)

      console.log('[OAuth Callback] URL params:', { token: token ? '***' : null, expiresAt, error })

      if (error) {
        console.error('[OAuth Callback] Error in callback:', error)
        navigate('/login', {
          replace: true,
          state: { oauthError: error },
        })
        return
      }

      // If backend sends token in URL, save it
      if (token) {
        console.log('[OAuth Callback] Saving token from URL')
        handleOAuthCallback({ token, expiresAt })
      } else {
        console.log('[OAuth Callback] No token in URL, using session cookies')
      }

      // Small delay to ensure cookies are properly set
      await new Promise((resolve) => setTimeout(resolve, 500))

      console.log('[OAuth Callback] Navigating to dashboard')
      navigate('/dashboard', { replace: true })
    }

    void processCallback()
  }, [navigate, searchParams])

  return (
    <>
      <style>{`
        @keyframes oauth-spin {
          to { transform: rotate(360deg); }
        }
        .oauth-cb {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          background: #f5f5f4;
          font-family: 'DM Sans', sans-serif;
          gap: 16px;
        }
        .oauth-cb__spinner {
          width: 32px;
          height: 32px;
          border: 2px solid #e5e5e5;
          border-top-color: #111;
          border-radius: 50%;
          animation: oauth-spin 0.75s linear infinite;
        }
        .oauth-cb__text {
          font-size: 14px;
          color: #888;
          margin: 0;
          font-weight: 300;
        }
      `}</style>
      <div className="oauth-cb">
        <div className="oauth-cb__spinner" aria-hidden="true" />
        <p className="oauth-cb__text">Autenticando con Google…</p>
      </div>
    </>
  )
}

export default OAuthCallbackPage

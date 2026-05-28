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

      console.log('[OAuth Callback] Full URL:', window.location.href)
      console.log('[OAuth Callback] URL params:', { 
        token: token ? `${token.substring(0, 20)}...` : null, 
        expiresAt, 
        error 
      })
      console.log('[OAuth Callback] Cookies:', document.cookie)

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
        console.log('[OAuth Callback] ✓ Token received in URL, saving...')
        handleOAuthCallback({ token, expiresAt })
      } else {
        console.warn('[OAuth Callback] ⚠ No token in URL, relying on session cookies')
        console.warn('[OAuth Callback] Note: Cross-site cookies may be blocked by browser')
      }

      // If no token, warn about potential issues
      if (!token) {
        const hasCookie = document.cookie.includes('JSESSIONID')
        console.warn('[OAuth Callback] Backend authentication method:', hasCookie ? 'Session cookies' : 'Unknown')
        
        if (!hasCookie) {
          console.error('[OAuth Callback] ⚠️ CRITICAL: No token in URL and no session cookie found')
          console.error('[OAuth Callback] The backend must either:')
          console.error('[OAuth Callback]   1. Send JWT token in URL: /auth/callback?token=<JWT>')
          console.error('[OAuth Callback]   2. Set cookies with SameSite=None; Secure for cross-site')
          
          // Show error to user
          navigate('/login', {
            replace: true,
            state: { 
              oauthError: 'cookie_blocked',
              errorMessage: 'El navegador bloqueó las cookies de autenticación. Por favor, contacta al administrador o usa el login tradicional.'
            },
          })
          return
        }
      }

      // Longer delay to ensure cookies are propagated (especially for cross-site)
      console.log('[OAuth Callback] Waiting 1s for cookies to propagate...')
      await new Promise((resolve) => setTimeout(resolve, 1000))

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

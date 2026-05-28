import type { LoginRequest, LoginResponse, RegisterRequest, User } from '../models/auth'
import { buildApiUrl } from '../lib/api'
import { httpRequest } from './httpClient'

export function login(request: LoginRequest) {
  return httpRequest<LoginResponse>('/auth/login', {
    method: 'POST',
    body: JSON.stringify(request),
  })
}

export function register(request: RegisterRequest) {
  return httpRequest<unknown>('/auth/register', {
    method: 'POST',
    body: JSON.stringify(request),
  })
}

export function getMe() {
  return httpRequest<User>('/auth/me')
}

async function tryLogout(path: string, method: 'POST' | 'GET' = 'POST') {
  try {
    const response = await fetch(buildApiUrl(path), {
      method,
      credentials: 'include',
    })
    return response.ok
  } catch {
    return false
  }
}

/**
 * Attempts to invalidate server-side session/cookies.
 * We try common logout paths because backend deployments may expose
 * different endpoints depending on security configuration.
 */
export async function logoutUser() {
  const attempts: Array<{ path: string; method?: 'POST' | 'GET' }> = [
    { path: '/logout', method: 'POST' },
    { path: '/api/v1/auth/logout', method: 'POST' },
    { path: '/auth/logout', method: 'POST' },
    { path: '/logout', method: 'GET' },
  ]

  for (const attempt of attempts) {
    const didLogout = await tryLogout(attempt.path, attempt.method)
    if (didLogout) {
      return
    }
  }
}

/**
 * Returns the absolute frontend URL that the backend should redirect to
 * after a successful OAuth2 sign-in.
 *
 * Configurable via `VITE_OAUTH_CALLBACK_PATH` (defaults to `/auth/callback`).
 * The backend must be configured to use this URL as its success redirect URI.
 *
 * Example resulting URL: https://app.interviewmate.io/auth/callback
 */
export function getOAuthCallbackUrl(): string {
  const callbackPath =
    import.meta.env.VITE_OAUTH_CALLBACK_PATH ?? '/auth/callback'
  return `${window.location.origin}${callbackPath}`
}

/**
 * Returns the backend URL that initiates the Google OAuth2 flow.
 * Configured via `VITE_GOOGLE_OAUTH_START_PATH`.
 */
export function getGoogleOAuthStartUrl() {
  const startPath = import.meta.env.VITE_GOOGLE_OAUTH_START_PATH ?? '/auth/oauth2/google'
  return buildApiUrl(startPath)
}

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

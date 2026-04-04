import { saveAuthToken } from '../lib/auth'
import type { LoginRequest, RegisterRequest } from '../models/auth'
import * as authService from '../services/authService'

// ─── OAuth2 callback ──────────────────────────────────────────────────────────

/**
 * Query-param keys that the backend includes in the OAuth2 success redirect URL.
 * Centralised here so every consumer reads from a single source of truth.
 */
export const OAUTH_CALLBACK_PARAMS = {
  TOKEN: 'token',
  EXPIRES_AT: 'expiresAt',
  ERROR: 'error',
} as const

/** Shape of the data extracted from the OAuth2 callback URL */
export type OAuthCallbackParams = {
  /** JWT / Bearer token returned by the backend */
  token: string
  /** ISO-8601 expiration timestamp (optional) */
  expiresAt?: string | null
}

/**
 * Persists the auth credentials received from the OAuth2 callback redirect.
 * Call this once the callback URL params have been validated, before
 * navigating the user away from the callback page.
 */
export function handleOAuthCallback(params: OAuthCallbackParams): void {
  saveAuthToken(params.token, {
    expiresAt: params.expiresAt ?? undefined,
  })
}

// ─── Standard auth ───────────────────────────────────────────────────────────

export async function loginUser(request: LoginRequest) {
  const response = await authService.login(request)
  if (!response.token) {
    throw new Error('La respuesta no incluyó token de sesión.')
  }
  saveAuthToken(response.token, { expiresAt: response.expiresAt })
  return response
}

export async function registerUser(payload: {
  username: string
  email: string
  password: string
  confirmPassword: string
}) {
  const request: RegisterRequest = {
    username: payload.username,
    email: payload.email,
    password: payload.password,
    confirmPassword: payload.confirmPassword,
  }

  await authService.register(request)
}

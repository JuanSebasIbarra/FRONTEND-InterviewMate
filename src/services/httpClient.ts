import { getAuthToken } from '../lib/auth'
import { buildApiUrl } from '../lib/api'
import type { ApiErrorPayload, ApiResponse } from '../models/api'

const useCredentials = String(import.meta.env.VITE_USE_CREDENTIALS ?? '').toLowerCase() === 'true'
const PUBLIC_ENDPOINTS = new Set(['/auth/login', '/auth/register'])

function normalizePath(path: string) {
  return path.startsWith('/') ? path : `/${path}`
}

function tryParseJson(raw: string) {
  if (!raw) return null
  try {
    return JSON.parse(raw) as unknown
  } catch {
    return null
  }
}

function isWrappedResponse<T>(value: unknown): value is ApiResponse<T> {
  return Boolean(
    value &&
      typeof value === 'object' &&
      'success' in value &&
      'message' in value &&
      'data' in value,
  )
}

function extractErrorMessage(payload: unknown, fallback: string) {
  const data = (payload ?? {}) as ApiErrorPayload
  if (typeof data.message === 'string' && data.message.trim()) return data.message
  if (typeof data.error === 'string' && data.error.trim()) return data.error
  if (data.fieldErrors && Object.keys(data.fieldErrors).length > 0) {
    return Object.values(data.fieldErrors).join(' · ')
  }
  return fallback
}

export async function httpRequest<T>(path: string, init?: RequestInit): Promise<T> {
  const normalizedPath = normalizePath(path)
  const requiresAuth = !PUBLIC_ENDPOINTS.has(normalizedPath)
  const token = getAuthToken()
  const headers = new Headers(init?.headers ?? {})

  if (requiresAuth && !token.trim()) {
    throw new Error('Debes iniciar sesion para realizar esta accion.')
  }

  if (!headers.has('Content-Type') && init?.body) {
    headers.set('Content-Type', 'application/json')
  }

  if (token.trim() && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${token}`)
  }

  const response = await fetch(buildApiUrl(normalizedPath), {
    ...init,
    headers,
    credentials: useCredentials ? 'include' : init?.credentials,
  })

  const raw = await response.text()
  const parsed = tryParseJson(raw)

  if (!response.ok) {
    throw new Error(extractErrorMessage(parsed, 'No se pudo completar la operación.'))
  }

  if (isWrappedResponse<T>(parsed)) {
    if (!parsed.success) {
      throw new Error(parsed.message || 'La operación no fue exitosa.')
    }
    return parsed.data
  }

  return (parsed as T) ?? (null as T)
}

const rawApiUrl = import.meta.env.VITE_API_URL ?? 'http://localhost:8080'

export const API_BASE_URL = rawApiUrl.replace(/\/$/, '')

export function buildApiUrl(path: string) {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`
  return `${API_BASE_URL}${normalizedPath}`
}

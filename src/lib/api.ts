const rawApiUrl = import.meta.env.VITE_API_URL ?? 'http://localhost:8081'

export const API_BASE_URL = rawApiUrl.replace(/\/$/, '')
export const API_V1_PREFIX = '/api/v1'

export function buildApiUrl(path: string) {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`
  // Check if the path already includes the API_V1_PREFIX
  if (normalizedPath.startsWith(API_V1_PREFIX)) {
    return `${API_BASE_URL}${normalizedPath}`
  }
  return `${API_BASE_URL}${API_V1_PREFIX}${normalizedPath}`
}

export function buildApiV1Path(path: string) {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`
  return `${API_V1_PREFIX}${normalizedPath}`
}

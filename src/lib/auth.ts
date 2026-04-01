export const TOKEN_STORAGE_KEY = 'interviewmate_token'
export const TOKEN_COOKIE_NAME = 'interviewmate_auth'

type SaveAuthTokenOptions = {
  expiresAt?: string
}

function isBrowser() {
  return typeof document !== 'undefined'
}

function getCookieValue(name: string) {
  if (!isBrowser()) return ''

  const cookies = document.cookie ? document.cookie.split('; ') : []
  const prefix = `${name}=`
  const match = cookies.find((entry) => entry.startsWith(prefix))

  if (!match) return ''

  return decodeURIComponent(match.slice(prefix.length))
}

function buildCookieAttributes(expiresAt?: string) {
  const attributes = ['Path=/', 'SameSite=Strict']

  if (window.location.protocol === 'https:') {
    attributes.push('Secure')
  }

  if (!expiresAt) {
    return attributes
  }

  const expirationDate = new Date(expiresAt)
  if (Number.isNaN(expirationDate.getTime())) {
    return attributes
  }

  attributes.push(`Expires=${expirationDate.toUTCString()}`)
  return attributes
}

function setTokenCookie(token: string, expiresAt?: string) {
  if (!isBrowser()) return
  const attributes = buildCookieAttributes(expiresAt)
  document.cookie = `${TOKEN_COOKIE_NAME}=${encodeURIComponent(token)}; ${attributes.join('; ')}`
}

function clearTokenCookie() {
  if (!isBrowser()) return
  document.cookie = `${TOKEN_COOKIE_NAME}=; Path=/; Max-Age=0; SameSite=Strict`
}

export function getAuthToken() {
  const cookieToken = getCookieValue(TOKEN_COOKIE_NAME)
  if (cookieToken.trim()) {
    return cookieToken
  }

  const legacyToken = localStorage.getItem(TOKEN_STORAGE_KEY) ?? ''
  if (!legacyToken.trim()) {
    return ''
  }

  setTokenCookie(legacyToken)
  localStorage.removeItem(TOKEN_STORAGE_KEY)
  return legacyToken
}

export function isAuthenticated() {
  return Boolean(getAuthToken().trim())
}

export function saveAuthToken(token: string, options?: SaveAuthTokenOptions) {
  setTokenCookie(token, options?.expiresAt)
  localStorage.removeItem(TOKEN_STORAGE_KEY)
}

export function clearAuthToken() {
  clearTokenCookie()
  localStorage.removeItem(TOKEN_STORAGE_KEY)
}

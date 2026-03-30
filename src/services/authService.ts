import type { LoginRequest, LoginResponse, RegisterRequest, User } from '../models/auth'
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

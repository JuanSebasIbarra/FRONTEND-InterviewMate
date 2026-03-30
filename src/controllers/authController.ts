import { saveAuthToken } from '../lib/auth'
import type { LoginRequest, RegisterRequest } from '../models/auth'
import * as authService from '../services/authService'

export async function loginUser(request: LoginRequest) {
  const response = await authService.login(request)
  if (!response.token) {
    throw new Error('La respuesta no incluyó token de sesión.')
  }
  saveAuthToken(response.token)
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

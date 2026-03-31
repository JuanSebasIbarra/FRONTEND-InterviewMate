import type { User } from '../models/auth'
import { httpRequest } from './httpClient'

export type UpdateUserRequest = {
  username: string
  email: string
  password: string
  confirmPassword: string
}

export function updateUserById(userId: number, request: UpdateUserRequest) {
  return httpRequest<User>(`/usuarios/${userId}`, {
    method: 'PUT',
    body: JSON.stringify(request),
  })
}

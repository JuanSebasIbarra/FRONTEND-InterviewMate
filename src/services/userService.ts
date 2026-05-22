import type { PageResponse } from '../models/api'
import type { User } from '../models/auth'
import { httpRequest } from './httpClient'

export type UpdateUserRequest = {
  username: string
  email: string
  password: string
  confirmPassword: string
}

export function getUsers(page = 0, size = 10, sort = 'createdAt,desc') {
  return httpRequest<PageResponse<User>>(`/users?page=${page}&size=${size}&sort=${encodeURIComponent(sort)}`)
}

export function getUserById(userId: number) {
  return httpRequest<User>(`/users/${userId}`)
}

export function createUser(request: UpdateUserRequest) {
  return httpRequest<User>('/users', {
    method: 'POST',
    body: JSON.stringify(request),
  })
}

export function updateUserById(userId: number, request: UpdateUserRequest) {
  return httpRequest<User>(`/users/${userId}`, {
    method: 'PUT',
    body: JSON.stringify(request),
  })
}

export function deleteUser(userId: number) {
  return httpRequest<void>(`/users/${userId}`, {
    method: 'DELETE',
  })
}

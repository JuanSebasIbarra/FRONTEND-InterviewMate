import type { ProfileResponse, UpdateProfileRequest } from '../models/auth'
import { httpRequest } from './httpClient'

export function getProfile() {
  return httpRequest<ProfileResponse>('/users/perfil')
}

export function updateProfile(request: UpdateProfileRequest) {
  return httpRequest<ProfileResponse>('/users/perfil', {
    method: 'PUT',
    body: JSON.stringify(request),
  })
}

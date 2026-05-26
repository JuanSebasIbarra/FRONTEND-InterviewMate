import type { ProfileResponse, UpdateProfileRequest } from '../models/auth'
import { httpRequest } from './httpClient'

export function getProfile() {
  return httpRequest<ProfileResponse>('/api/v1/users/perfil')
}

export function updateProfile(request: UpdateProfileRequest) {
  return httpRequest<ProfileResponse>('/api/v1/users/perfil', {
    method: 'PUT',
    body: JSON.stringify(request),
  })
}

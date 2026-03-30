import type { ProfileResponse, UpdateProfileRequest } from '../models/auth'
import { httpRequest } from './httpClient'

export function getProfile() {
  return httpRequest<ProfileResponse>('/usuarios/perfil')
}

export function updateProfile(request: UpdateProfileRequest) {
  return httpRequest<ProfileResponse>('/usuarios/perfil', {
    method: 'PUT',
    body: JSON.stringify(request),
  })
}

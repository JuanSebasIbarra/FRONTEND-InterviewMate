import type { ProfileResponse } from '../models/auth'
import { getProfile, updateProfile } from '../services/profileService'

export function loadProfileData(): Promise<ProfileResponse> {
  return getProfile()
}

export function saveProfileData(perfilProfesional: string): Promise<ProfileResponse> {
  return updateProfile({ perfilProfesional })
}

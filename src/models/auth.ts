export type Role = string

export type AuthProvider = 'LOCAL' | 'GOOGLE'

export type User = {
  id: number
  username: string
  email: string
  roles: Role[]
  createdAt: string
}

export type LoginRequest = {
  username: string
  password: string
}

export type LoginResponse = {
  token: string
  tokenType?: string
  expiresAt?: string
  username?: string
  email?: string
  roles?: string[]
}

export type RegisterRequest = {
  username: string
  email: string
  password: string
  confirmPassword: string
}

export type ProfileResponse = {
  id: number
  username: string
  email: string
  perfilProfesional: string | null
  profilePictureUrl: string | null
  authProvider: AuthProvider
  roles: string[]
  createdAt: string
}

export type UpdateProfileRequest = {
  username?: string
  email?: string
  perfilProfesional?: string
  profilePictureUrl?: string
}

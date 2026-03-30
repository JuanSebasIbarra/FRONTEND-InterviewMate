export type Role = string

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
  username: string
  email: string
  perfilProfesional: string
  roles: string[]
  createdAt: string
}

export type UpdateProfileRequest = {
  perfilProfesional: string
}

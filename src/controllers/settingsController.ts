import { getMe } from '../services/authService'
import { getProfile, updateProfile } from '../services/profileService'
import { updateUserById } from '../services/userService'

const SETTINGS_LOCAL_STORAGE_KEY = 'interviewmate.settings.local'

export type LocalSettingsAssets = {
  firstName: string
  lastName: string
  avatarDataUrl: string
  cvFileName: string
}

export type SettingsData = {
  userId: number
  username: string
  email: string
  perfilProfesional: string
  local: LocalSettingsAssets
}

function readLocalSettings(): LocalSettingsAssets {
  const fallback: LocalSettingsAssets = {
    firstName: '',
    lastName: '',
    avatarDataUrl: '',
    cvFileName: '',
  }

  try {
    const raw = localStorage.getItem(SETTINGS_LOCAL_STORAGE_KEY)
    if (!raw) return fallback
    const parsed = JSON.parse(raw) as Partial<LocalSettingsAssets>
    return {
      firstName: parsed.firstName ?? '',
      lastName: parsed.lastName ?? '',
      avatarDataUrl: parsed.avatarDataUrl ?? '',
      cvFileName: parsed.cvFileName ?? '',
    }
  } catch {
    return fallback
  }
}

function writeLocalSettings(nextLocal: LocalSettingsAssets) {
  localStorage.setItem(SETTINGS_LOCAL_STORAGE_KEY, JSON.stringify(nextLocal))
}

function toDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(typeof reader.result === 'string' ? reader.result : '')
    reader.onerror = () => reject(new Error('No se pudo leer el archivo de imagen.'))
    reader.readAsDataURL(file)
  })
}

export async function loadProfileData(): Promise<SettingsData> {
  const [user, profile] = await Promise.all([getMe(), getProfile()])
  return {
    userId: user.id,
    username: profile.username,
    email: profile.email,
    perfilProfesional: profile.perfilProfesional ?? '',
    local: readLocalSettings(),
  }
}

export async function savePersonalInfo(payload: {
  firstName: string
  lastName: string
  avatarFile: File | null
  perfilProfesional: string
}): Promise<SettingsData> {
  await updateProfile({ perfilProfesional: payload.perfilProfesional })

  const current = readLocalSettings()
  const avatarDataUrl = payload.avatarFile
    ? await toDataUrl(payload.avatarFile)
    : current.avatarDataUrl

  writeLocalSettings({
    firstName: payload.firstName,
    lastName: payload.lastName,
    avatarDataUrl,
    cvFileName: current.cvFileName,
  })

  const [user, profile] = await Promise.all([getMe(), getProfile()])
  return {
    userId: user.id,
    username: profile.username,
    email: profile.email,
    perfilProfesional: profile.perfilProfesional ?? '',
    local: readLocalSettings(),
  }
}

export async function saveSecurityData(payload: {
  userId: number
  username: string
  email: string
  newPassword: string
  confirmPassword: string
}): Promise<{ username: string; email: string }> {
  const password = payload.newPassword.trim()
  const confirm = payload.confirmPassword.trim()

  if (!password) {
    throw new Error('Ingresa la nueva contraseña.')
  }
  if (password.length < 8) {
    throw new Error('La contraseña debe tener al menos 8 caracteres.')
  }
  if (password !== confirm) {
    throw new Error('La contraseña y su confirmación no coinciden.')
  }
  if (!payload.username.trim() || !payload.email.trim()) {
    throw new Error('El usuario y el correo son obligatorios.')
  }

  const updated = await updateUserById(payload.userId, {
    username: payload.username.trim(),
    email: payload.email.trim(),
    password,
    confirmPassword: confirm,
  })

  return { username: updated.username, email: updated.email }
}

export function saveCvLocally(cvFile: File): string {
  const current = readLocalSettings()
  writeLocalSettings({ ...current, cvFileName: cvFile.name })
  return cvFile.name
}

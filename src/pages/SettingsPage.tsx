import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import {
  loadProfileData,
  savePersonalInfo,
  saveSecurityData,
  saveCvLocally,
  type SettingsData,
} from '../controllers/settingsController'

type Section = 'personal' | 'security' | 'documents'

const SIDEBAR_ITEMS: { id: Section; label: string }[] = [
  { id: 'personal', label: 'Información personal' },
  { id: 'security', label: 'Seguridad y acceso' },
  { id: 'documents', label: 'Documentos' },
]

function SettingsPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [activeSection, setActiveSection] = useState<Section>(() => {
    const param = searchParams.get('section')
    return param === 'security' || param === 'documents' ? param : 'personal'
  })

  const [loading, setLoading] = useState(true)
  const [globalError, setGlobalError] = useState('')
  const [profileData, setProfileData] = useState<SettingsData | null>(null)

  // — Personal
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [perfilProfesional, setPerfilProfesional] = useState('')
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [avatarPreview, setAvatarPreview] = useState('')
  const [savingPersonal, setSavingPersonal] = useState(false)
  const [personalError, setPersonalError] = useState('')
  const [personalSuccess, setPersonalSuccess] = useState('')

  // — Security
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [savingSecurity, setSavingSecurity] = useState(false)
  const [securityError, setSecurityError] = useState('')
  const [securitySuccess, setSecuritySuccess] = useState('')

  // — Documents
  const [cvFileName, setCvFileName] = useState('')
  const [cvFile, setCvFile] = useState<File | null>(null)
  const [cvError, setCvError] = useState('')
  const [cvSuccess, setCvSuccess] = useState('')

  useEffect(() => {
    void hydrate()
  }, [])

  useEffect(() => {
    const param = searchParams.get('section')
    if (param === 'personal' || param === 'security' || param === 'documents') {
      setActiveSection(param)
    }
  }, [searchParams])

  const hydrate = async () => {
    setLoading(true)
    setGlobalError('')
    try {
      const data = await loadProfileData()
      applyData(data)
    } catch (err) {
      setGlobalError((err as Error).message)
    } finally {
      setLoading(false)
    }
  }

  const applyData = (data: SettingsData) => {
    setProfileData(data)
    setFirstName(data.local.firstName)
    setLastName(data.local.lastName)
    setPerfilProfesional(data.perfilProfesional)
    setAvatarPreview(data.local.avatarDataUrl)
    setUsername(data.username)
    setEmail(data.email)
    setCvFileName(data.local.cvFileName)
  }

  const navigateTo = (section: Section) => {
    setActiveSection(section)
    setSearchParams({ section })
    setPersonalError('')
    setPersonalSuccess('')
    setSecurityError('')
    setSecuritySuccess('')
    setCvError('')
    setCvSuccess('')
  }

  const onAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/')) {
      setPersonalError('La foto de perfil debe ser una imagen.')
      return
    }
    setPersonalError('')
    setAvatarFile(file)
    const reader = new FileReader()
    reader.onload = () => {
      setAvatarPreview(typeof reader.result === 'string' ? reader.result : '')
    }
    reader.readAsDataURL(file)
  }

  const onCvChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return
    const isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')
    if (!isPdf) {
      setCvError('El CV debe estar en formato PDF.')
      return
    }
    setCvError('')
    setCvFile(file)
    setCvFileName(file.name)
  }

  const onSavePersonal = async () => {
    setSavingPersonal(true)
    setPersonalError('')
    setPersonalSuccess('')
    try {
      const updated = await savePersonalInfo({ firstName, lastName, avatarFile, perfilProfesional })
      applyData(updated)
      setAvatarFile(null)
      setPersonalSuccess('Información personal actualizada.')
    } catch (err) {
      setPersonalError((err as Error).message)
    } finally {
      setSavingPersonal(false)
    }
  }

  const onSaveSecurity = async () => {
    if (!profileData) return
    setSavingSecurity(true)
    setSecurityError('')
    setSecuritySuccess('')
    try {
      const updated = await saveSecurityData({
        userId: profileData.userId,
        username,
        email,
        newPassword,
        confirmPassword,
      })
      setProfileData((prev) =>
        prev ? { ...prev, username: updated.username, email: updated.email } : prev,
      )
      setNewPassword('')
      setConfirmPassword('')
      setSecuritySuccess('Datos de seguridad actualizados correctamente.')
    } catch (err) {
      setSecurityError((err as Error).message)
    } finally {
      setSavingSecurity(false)
    }
  }

  const onSaveCv = () => {
    setCvError('')
    setCvSuccess('')
    if (!cvFile) {
      setCvError('Selecciona un archivo PDF primero.')
      return
    }
    const name = saveCvLocally(cvFile)
    setCvFileName(name)
    setCvFile(null)
    setCvSuccess(`CV "${name}" guardado correctamente.`)
  }

  const displayName = [firstName, lastName].filter(Boolean).join(' ') || profileData?.username || '—'
  const avatarInitial = (displayName[0] ?? '?').toUpperCase()

  if (loading) {
    return (
      <section className="settings-google">
        <p className="settings-loading">Cargando perfil...</p>
      </section>
    )
  }

  return (
    <section className="settings-google">
      {globalError && <p className="alert error">{globalError}</p>}

      {/* ── Cabecera de perfil ── */}
      <div className="settings-profile-header">
        <div className="settings-avatar-preview settings-avatar-large">
          {avatarPreview ? (
            <img src={avatarPreview} alt="Foto de perfil" />
          ) : (
            <span>{avatarInitial}</span>
          )}
        </div>
        <h2 className="settings-profile-name">{displayName}</h2>
        <p className="settings-profile-email">{profileData?.email ?? '—'}</p>
      </div>

      {/* ── Cuerpo: sidebar + contenido ── */}
      <div className="settings-body">
        {/* Sidebar */}
        <nav className="settings-sidebar" aria-label="Secciones de configuración">
          {SIDEBAR_ITEMS.map((item) => (
            <button
              key={item.id}
              type="button"
              className={`settings-sidebar-item${activeSection === item.id ? ' settings-sidebar-item--active' : ''}`}
              onClick={() => navigateTo(item.id)}
              aria-current={activeSection === item.id ? 'page' : undefined}
            >
              {item.label}
            </button>
          ))}
        </nav>

        {/* Contenido */}
        <div className="settings-content">
          {/* ── Información personal ── */}
          {activeSection === 'personal' && (
            <>
              <h3>Información personal</h3>
              <p className="settings-content-subtitle">
                Administra tu foto, nombres y descripción profesional.
              </p>

              {personalError && <p className="alert error">{personalError}</p>}
              {personalSuccess && <p className="alert success">{personalSuccess}</p>}

              <div className="stack">
                <div className="settings-avatar-row">
                  <div className="settings-avatar-preview">
                    {avatarPreview ? (
                      <img src={avatarPreview} alt="Foto de perfil" />
                    ) : (
                      <span>{avatarInitial}</span>
                    )}
                  </div>
                  <label>
                    Foto de perfil
                    <input type="file" accept="image/*" onChange={onAvatarChange} />
                  </label>
                </div>

                <div className="grid two">
                  <label>
                    Nombres
                    <input
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      placeholder="Ej. Sebastián"
                    />
                  </label>
                  <label>
                    Apellidos
                    <input
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      placeholder="Ej. Ibarra"
                    />
                  </label>
                </div>

                <label>
                  Perfil profesional
                  <textarea
                    rows={6}
                    value={perfilProfesional}
                    onChange={(e) => setPerfilProfesional(e.target.value)}
                    placeholder="Describe tu experiencia, stack y objetivos profesionales"
                  />
                </label>

                <button type="button" onClick={onSavePersonal} disabled={savingPersonal}>
                  {savingPersonal ? 'Guardando...' : 'Guardar información personal'}
                </button>
              </div>
            </>
          )}

          {/* ── Seguridad y acceso ── */}
          {activeSection === 'security' && (
            <>
              <h3>Seguridad y acceso</h3>
              <p className="settings-content-subtitle">
                Actualiza tu usuario, correo vinculado y contraseña. Se requiere contraseña nueva
                para guardar cualquier cambio.
              </p>

              {securityError && <p className="alert error">{securityError}</p>}
              {securitySuccess && <p className="alert success">{securitySuccess}</p>}

              <div className="stack">
                <label>
                  Usuario
                  <input
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Nombre de usuario"
                  />
                </label>

                <label>
                  Correo vinculado
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="correo@ejemplo.com"
                  />
                </label>

                <div className="grid two">
                  <label>
                    Nueva contraseña
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Mínimo 8 caracteres"
                    />
                  </label>
                  <label>
                    Confirmar contraseña
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Repite la contraseña"
                    />
                  </label>
                </div>

                <button
                  type="button"
                  onClick={onSaveSecurity}
                  disabled={
                    savingSecurity || !username.trim() || !email.trim() || !newPassword.trim()
                  }
                >
                  {savingSecurity ? 'Guardando...' : 'Guardar cambios de seguridad'}
                </button>
              </div>
            </>
          )}

          {/* ── Documentos ── */}
          {activeSection === 'documents' && (
            <>
              <h3>Documentos</h3>
              <p className="settings-content-subtitle">
                Sube tu CV en formato PDF para tenerlo disponible en tu perfil.
              </p>

              {cvError && <p className="alert error">{cvError}</p>}
              {cvSuccess && <p className="alert success">{cvSuccess}</p>}

              <div className="stack">
                <div className="cv-drop-area">
                  {cvFileName ? (
                    <p className="cv-drop-name">{cvFileName}</p>
                  ) : (
                    <p className="cv-drop-placeholder">Ningún CV cargado</p>
                  )}
                </div>

                <label>
                  Seleccionar CV (PDF)
                  <input type="file" accept="application/pdf,.pdf" onChange={onCvChange} />
                </label>

                <button type="button" onClick={onSaveCv} disabled={!cvFile}>
                  Guardar CV
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </section>
  )
}

export default SettingsPage

import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import DashboardSidebar from '../components/dashboard/DashboardSidebar'
import { logoutUser } from '../controllers/authController'
import {
  loadProfileData,
  savePersonalInfo,
  saveSecurityData,
  type SettingsData,
} from '../controllers/settingsController'

type Section = 'personal' | 'security'

function SettingsPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [activeSection, setActiveSection] = useState<Section>(() => {
    const param = searchParams.get('section')
    return param === 'security' ? param : 'personal'
  })

  const [loading, setLoading] = useState(true)
  const [globalError, setGlobalError] = useState('')
  const [profileData, setProfileData] = useState<SettingsData | null>(null)

  // — Personal
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [perfilProfesional, setPerfilProfesional] = useState('')
  const [language, setLanguage] = useState<'ES' | 'EN'>('ES')
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

  useEffect(() => {
    void hydrate()
  }, [])

  useEffect(() => {
    const param = searchParams.get('section')
    if (param === 'personal' || param === 'security') {
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
    setLanguage(data.language)
    setAvatarPreview(data.local.avatarDataUrl)
    setUsername(data.username)
    setEmail(data.email)
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

  const onSavePersonal = async () => {
    setSavingPersonal(true)
    setPersonalError('')
    setPersonalSuccess('')
    try {
      const updated = await savePersonalInfo({ firstName, lastName, avatarFile, perfilProfesional, language })
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

  const onLogout = async () => {
    await logoutUser()
    navigate('/login', { replace: true })
  }

  const displayName = [firstName, lastName].filter(Boolean).join(' ') || profileData?.username || '—'
  const avatarInitial = (displayName[0] ?? '?').toUpperCase()

  if (loading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-stone-100">
        <p className="text-sm text-zinc-500">Cargando perfil...</p>
      </div>
    )
  }

  return (
    <>
      <style>{`
        .st * { box-sizing: border-box; margin: 0; padding: 0; }

        .st-root {
          font-family: 'DM Sans', sans-serif;
          background: #f5f5f4;
          min-height: 100vh;
        }

        .st-alert-error {
          font-size: 11px;
          color: #dc2626;
          background: #FEF2F2;
          border: 0.5px solid #FECACA;
          border-radius: 6px;
          padding: 8px 10px;
        }

        .st-main {
          padding: 1.75rem;
          display: flex;
          flex-direction: column;
          gap: 1rem;
          overflow-y: auto;
          height: 100vh;
        }
        .st-main-sub {
          font-size: 13px;
          color: #999;
          font-weight: 300;
          margin-top: 3px;
        }

        .st-content {
          background: #fff;
          border-radius: 10px;
          border: 0.5px solid #e5e5e5;
          padding: 1rem;
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }
        .st-section-title {
          font-size: 14px;
          color: #111;
          font-weight: 500;
        }
        .st-section-sub {
          font-size: 12px;
          color: #999;
          font-weight: 300;
          margin-top: 2px;
          line-height: 1.5;
        }
        .st-alert-success {
          font-size: 11px;
          color: #166534;
          background: #DCFCE7;
          border: 0.5px solid #BBF7D0;
          border-radius: 6px;
          padding: 8px 10px;
        }

        .st-stack { display: grid; gap: 0.75rem; }
        .st-grid-two {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 0.75rem;
        }
        .st-label {
          display: grid;
          gap: 4px;
          font-size: 12px;
          color: #666;
          font-weight: 500;
        }
        .st-input,
        .st-textarea,
        .st-file,
        .st-select {
          font-family: 'DM Sans', sans-serif;
          font-size: 12px;
          font-weight: 300;
          padding: 8px 10px;
          border: 0.5px solid #ddd;
          border-radius: 7px;
          background: #fff;
          color: #111;
          outline: none;
          width: 100%;
          transition: border-color 0.15s;
        }
        .st-input:focus,
        .st-textarea:focus,
        .st-file:focus,
        .st-select:focus {
          border-color: #aaa;
        }
        .st-textarea { resize: vertical; min-height: 120px; }
        .st-select { cursor: pointer; }

        .st-avatar-row {
          display: grid;
          grid-template-columns: 96px 1fr;
          align-items: center;
          gap: 0.9rem;
        }
        .st-avatar-preview {
          width: 96px;
          height: 96px;
          border-radius: 999px;
          border: 1px solid #ddd;
          background: #f5f5f4;
          display: grid;
          place-items: center;
          overflow: hidden;
          color: #555;
          font-weight: 500;
          font-size: 1.5rem;
        }
        .st-avatar-preview img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .st-btn {
          font-family: 'DM Sans', sans-serif;
          font-size: 12px;
          padding: 8px 14px;
          border-radius: 7px;
          background: #111;
          color: #fff;
          border: none;
          cursor: pointer;
          transition: opacity 0.15s;
          width: fit-content;
        }
        .st-btn:hover:not(:disabled) { opacity: 0.85; }
        .st-btn:disabled {
          opacity: 0.4;
          cursor: not-allowed;
        }

        @media (max-width: 860px) {
          .st-grid-two { grid-template-columns: 1fr; }
        }
      `}</style>

      <div className="flex h-screen w-screen bg-stone-100">
        <DashboardSidebar onLogout={onLogout} />

        <div className="st-root st flex-1">
          <main className="st-main">
            <header className="mb-4 border-b border-zinc-200 pb-5">
              <p className="text-xs uppercase tracking-widest text-zinc-500">Panel principal</p>
              <h1 className="mt-2 font-serif text-4xl font-normal tracking-[-0.02em] text-zinc-900 sm:text-5xl">
                Configuración
              </h1>
              <p className="st-main-sub">
                Administra tu información personal y seguridad desde un único panel
              </p>
            </header>

            {globalError && <p className="st-alert-error">{globalError}</p>}

            <div className="st-content">
              {activeSection === 'personal' && (
                <>
                  <div>
                    <div className="st-section-title">Información personal</div>
                    <div className="st-section-sub">
                      Administra tu foto, nombres y descripción profesional.
                    </div>
                  </div>

                  {personalError && <p className="st-alert-error">{personalError}</p>}
                  {personalSuccess && <p className="st-alert-success">{personalSuccess}</p>}

                  <div className="st-stack">
                    <div className="st-avatar-row">
                      <div className="st-avatar-preview">
                        {avatarPreview ? (
                          <img src={avatarPreview} alt="Foto de perfil" />
                        ) : (
                          <span>{avatarInitial}</span>
                        )}
                      </div>
                      <label className="st-label">
                        Foto de perfil
                        <input
                          className="st-file"
                          type="file"
                          accept="image/*"
                          onChange={onAvatarChange}
                        />
                      </label>
                    </div>

                    <div className="st-grid-two">
                      <label className="st-label">
                        Nombres
                        <input
                          className="st-input"
                          value={firstName}
                          onChange={(e) => setFirstName(e.target.value)}
                          placeholder="Ej. Sebastián"
                        />
                      </label>
                      <label className="st-label">
                        Apellidos
                        <input
                          className="st-input"
                          value={lastName}
                          onChange={(e) => setLastName(e.target.value)}
                          placeholder="Ej. Ibarra"
                        />
                      </label>
                    </div>

                    <label className="st-label">
                      Perfil profesional
                      <textarea
                        className="st-textarea"
                        rows={6}
                        value={perfilProfesional}
                        onChange={(e) => setPerfilProfesional(e.target.value)}
                        placeholder="Describe tu experiencia, stack y objetivos profesionales"
                      />
                    </label>

                    <label className="st-label">
                      Idioma de las entrevistas
                      <select
                        className="st-select"
                        value={language}
                        onChange={(e) => setLanguage(e.target.value as 'ES' | 'EN')}
                      >
                        <option value="ES">🇪🇸 Español</option>
                        <option value="EN">🇬🇧 English</option>
                      </select>
                    </label>

                    <button
                      type="button"
                      className="st-btn"
                      onClick={onSavePersonal}
                      disabled={savingPersonal}
                    >
                      {savingPersonal ? 'Guardando...' : 'Guardar información personal'}
                    </button>
                  </div>
                </>
              )}

              {activeSection === 'security' && (
                <>
                  <div>
                    <div className="st-section-title">Seguridad</div>
                    <div className="st-section-sub">
                      Actualiza tu usuario, correo vinculado y contraseña.
                    </div>
                  </div>

                  {securityError && <p className="st-alert-error">{securityError}</p>}
                  {securitySuccess && <p className="st-alert-success">{securitySuccess}</p>}

                  <div className="st-stack">
                    <label className="st-label">
                      Usuario
                      <input
                        className="st-input"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder="Nombre de usuario"
                      />
                    </label>

                    <label className="st-label">
                      Correo vinculado
                      <input
                        className="st-input"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="correo@ejemplo.com"
                      />
                    </label>

                    <div className="st-grid-two">
                      <label className="st-label">
                        Nueva contraseña
                        <input
                          className="st-input"
                          type="password"
                          onChange={(e) => setNewPassword(e.target.value)}
                          placeholder="Dejar vacío para no cambiar"
                        />
                      </label>
                      <label className="st-label">
                        Confirmar contraseña
                        <input
                          className="st-input"
                          type="password"
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          placeholder="Repetir nueva contraseña"
                        />
                      </label>
                    </div>

                    <button
                      type="button"
                      className="st-btn"
                      onClick={onSaveSecurity}
                      disabled={
                        savingSecurity || !username.trim() || !email.trim()
                      }
                    >
                      {savingSecurity ? 'Guardando...' : 'Guardar cambios'}
                    </button>
                  </div>
                </>
              )}

            </div>
          </main>
        </div>
      </div>
    </>
  )
}

export default SettingsPage

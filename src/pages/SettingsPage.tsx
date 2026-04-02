import { useEffect, useRef, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { clearAuthToken } from '../lib/auth'
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
  const navigate = useNavigate()
  const menuRef = useRef<HTMLDivElement>(null)
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
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    void hydrate()
  }, [])

  useEffect(() => {
    const param = searchParams.get('section')
    if (param === 'personal' || param === 'security' || param === 'documents') {
      setActiveSection(param)
    }
  }, [searchParams])

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false)
      }
    }
    document.addEventListener('click', handleOutsideClick)
    return () => document.removeEventListener('click', handleOutsideClick)
  }, [])

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

  const onLogout = () => {
    clearAuthToken()
    setMenuOpen(false)
    navigate('/login', { replace: true })
  }

  const displayName = [firstName, lastName].filter(Boolean).join(' ') || profileData?.username || '—'
  const avatarInitial = (displayName[0] ?? '?').toUpperCase()

  if (loading) {
    return (
      <div className="st-root">
        <style>{`
          .st-root {
            font-family: 'DM Sans', sans-serif;
            background: #f5f5f4;
            min-height: 100vh;
            display: grid;
            place-items: center;
          }
          .st-loading {
            font-size: 13px;
            color: #888;
            font-weight: 300;
          }
        `}</style>
        <p className="st-loading">Cargando perfil...</p>
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
          display: grid;
          grid-template-rows: 52px 1fr;
        }

        .st-topbar {
          background: #fff;
          border-bottom: 0.5px solid #e5e5e5;
          padding: 0 2rem;
          display: flex;
          align-items: center;
          justify-content: space-between;
          position: sticky;
          top: 0;
          z-index: 10;
          overflow: visible;
        }
        .st-brand {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 14px;
          font-weight: 500;
          color: #111;
          cursor: pointer;
        }
        .st-brand-dot {
          width: 20px;
          height: 20px;
          border-radius: 5px;
          background: #111;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .st-topbar-right {
          display: flex;
          align-items: center;
          gap: 10px;
          position: relative;
          overflow: visible;
        }
        .st-menu {
          position: relative;
        }
        .st-back {
          font-size: 12px;
          color: #888;
          border: 0.5px solid #e5e5e5;
          border-radius: 6px;
          padding: 5px 10px;
          background: none;
          cursor: pointer;
          font-family: 'DM Sans', sans-serif;
          transition: background 0.12s;
        }
        .st-back:hover {
          background: #f5f5f4;
          color: #111;
        }
        .st-avatar {
          width: 30px;
          height: 30px;
          border-radius: 50%;
          background: #EEEDFE;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 11px;
          font-weight: 500;
          color: #534AB7;
          border: 0.5px solid #ddd;
        }
        .st-avatar-btn {
          border: 0.5px solid #ddd;
          cursor: pointer;
          font-family: 'DM Sans', sans-serif;
          transition: background 0.12s;
        }
        .st-avatar-btn:hover {
          background: #e9e7ff;
        }
        .st-menu-dropdown {
          position: absolute;
          top: calc(100% + 6px);
          right: 0;
          width: 210px;
          background: #fff;
          border: 0.5px solid #e5e5e5;
          border-radius: 8px;
          padding: 6px;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
          z-index: 1000;
          display: flex;
          flex-direction: column;
          gap: 3px;
        }
        .st-menu-item {
          border: none;
          background: transparent;
          text-align: left;
          width: 100%;
          border-radius: 6px;
          padding: 8px 10px;
          color: #444;
          font-size: 12px;
          cursor: pointer;
          font-family: 'DM Sans', sans-serif;
        }
        .st-menu-item:hover {
          background: #f5f5f4;
        }
        .st-menu-divider {
          border: none;
          border-top: 0.5px solid #ececec;
          margin: 3px 0;
        }
        .st-menu-item-danger {
          color: #dc2626;
        }

        .st-body {
          display: grid;
          grid-template-columns: 284px 1fr;
          min-height: 0;
        }

        .st-sidebar {
          background: #fff;
          border-right: 0.5px solid #e5e5e5;
          padding: 1.5rem;
          display: flex;
          flex-direction: column;
          gap: 1rem;
          overflow-y: auto;
        }
        .st-sidebar-label {
          font-size: 10px;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: #bbb;
          margin-bottom: 4px;
        }
        .st-profile-card {
          background: #f9f9f8;
          border: 0.5px solid #e5e5e5;
          border-radius: 8px;
          padding: 10px 12px;
          display: grid;
          gap: 7px;
        }
        .st-profile-main {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .st-profile-avatar {
          width: 34px;
          height: 34px;
          border-radius: 50%;
          background: #EEF2FF;
          display: grid;
          place-items: center;
          color: #4338CA;
          font-weight: 500;
          font-size: 12px;
          overflow: hidden;
          border: 0.5px solid #ddd;
          flex-shrink: 0;
        }
        .st-profile-avatar img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        .st-profile-name {
          font-size: 12px;
          color: #111;
          font-weight: 500;
          line-height: 1.3;
        }
        .st-profile-email {
          font-size: 11px;
          color: #999;
          font-weight: 300;
          line-height: 1.3;
          word-break: break-all;
        }
        .st-nav {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }
        .st-nav-item {
          border: none;
          background: transparent;
          text-align: left;
          padding: 8px 10px;
          border-radius: 8px;
          color: #555;
          font-size: 13px;
          cursor: pointer;
          font-family: 'DM Sans', sans-serif;
          transition: background 0.12s;
        }
        .st-nav-item:hover { background: #f5f5f4; }
        .st-nav-item.st-active {
          background: #111;
          color: #fff;
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
        }
        .st-main-title {
          font-family: 'Instrument Serif', serif;
          font-size: 1.5rem;
          font-weight: 400;
          letter-spacing: -0.02em;
          color: #111;
          line-height: 1.2;
        }
        .st-main-title em { font-style: italic; color: #aaa; }
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
        .st-file {
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
        .st-file:focus {
          border-color: #aaa;
        }
        .st-textarea { resize: vertical; min-height: 120px; }

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

        .st-cv-box {
          border: 0.5px dashed #d4d4d4;
          border-radius: 8px;
          padding: 14px;
          text-align: center;
          background: #fafaf9;
        }
        .st-cv-name {
          font-size: 12px;
          color: #111;
          font-weight: 500;
        }
        .st-cv-empty {
          font-size: 12px;
          color: #bbb;
          font-weight: 300;
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
          .st-body { grid-template-columns: 1fr; }
          .st-grid-two { grid-template-columns: 1fr; }
        }
      `}</style>

      <div className="st-root st">
        <div className="st-topbar">
          <div className="st-brand" onClick={() => navigate('/dashboard')}>
            <div className="st-brand-dot">
              <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
                <circle cx="6" cy="6" r="4" fill="white" />
                <circle cx="6" cy="6" r="2" fill="#111" />
              </svg>
            </div>
            InterviewMate
          </div>
          <div className="st-topbar-right">
            <button type="button" className="st-back" onClick={() => navigate('/dashboard')}>
              ← Dashboard
            </button>
            <div className="st-menu" ref={menuRef}>
              <button
                type="button"
                className="st-avatar st-avatar-btn"
                onClick={(event) => {
                  event.stopPropagation()
                  setMenuOpen((value) => !value)
                }}
                aria-label="Abrir menú"
                aria-expanded={menuOpen}
                aria-haspopup="true"
              >
                {avatarInitial}
              </button>

              {menuOpen && (
                <div className="st-menu-dropdown" role="menu">
                  <button
                    type="button"
                    className="st-menu-item"
                    role="menuitem"
                    onClick={() => {
                      setMenuOpen(false)
                      navigate('/dashboard')
                    }}
                  >
                    Dashboard
                  </button>
                  <button
                    type="button"
                    className="st-menu-item"
                    role="menuitem"
                    onClick={() => {
                      setMenuOpen(false)
                      navigate('/settings')
                    }}
                  >
                    Editar perfil
                  </button>
                  <hr className="st-menu-divider" />
                  <button
                    type="button"
                    className="st-menu-item st-menu-item-danger"
                    role="menuitem"
                    onClick={onLogout}
                  >
                    Cerrar sesión
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="st-body">
          <aside className="st-sidebar">
            <div>
              <div className="st-sidebar-label">Perfil</div>
              <div className="st-profile-card">
                <div className="st-profile-main">
                  <div className="st-profile-avatar">
                    {avatarPreview ? (
                      <img src={avatarPreview} alt="Foto de perfil" />
                    ) : (
                      <span>{avatarInitial}</span>
                    )}
                  </div>
                  <div>
                    <div className="st-profile-name">{displayName}</div>
                    <div className="st-profile-email">{profileData?.email ?? '—'}</div>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <div className="st-sidebar-label">Configuración</div>
              <nav className="st-nav" aria-label="Secciones de configuración">
                {SIDEBAR_ITEMS.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    className={`st-nav-item ${activeSection === item.id ? 'st-active' : ''}`}
                    onClick={() => navigateTo(item.id)}
                    aria-current={activeSection === item.id ? 'page' : undefined}
                  >
                    {item.label}
                  </button>
                ))}
              </nav>
            </div>

            {globalError && <p className="st-alert-error">{globalError}</p>}
          </aside>

          <main className="st-main">
            <div>
              <div className="st-main-title">
                Ajustes de perfil, <em>rápidos y claros</em>
              </div>
              <div className="st-main-sub">
                Administra tu información personal, seguridad y documentos desde un único panel
              </div>
            </div>

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
                    <div className="st-section-title">Seguridad y acceso</div>
                    <div className="st-section-sub">
                      Actualiza tu usuario, correo vinculado y contraseña. Se requiere
                      contraseña nueva para guardar cualquier cambio.
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
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          placeholder="Mínimo 8 caracteres"
                        />
                      </label>
                      <label className="st-label">
                        Confirmar contraseña
                        <input
                          className="st-input"
                          type="password"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          placeholder="Repite la contraseña"
                        />
                      </label>
                    </div>

                    <button
                      type="button"
                      className="st-btn"
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

              {activeSection === 'documents' && (
                <>
                  <div>
                    <div className="st-section-title">Documentos</div>
                    <div className="st-section-sub">
                      Sube tu CV en formato PDF para tenerlo disponible en tu perfil.
                    </div>
                  </div>

                  {cvError && <p className="st-alert-error">{cvError}</p>}
                  {cvSuccess && <p className="st-alert-success">{cvSuccess}</p>}

                  <div className="st-stack">
                    <div className="st-cv-box">
                      {cvFileName ? (
                        <p className="st-cv-name">{cvFileName}</p>
                      ) : (
                        <p className="st-cv-empty">Ningún CV cargado</p>
                      )}
                    </div>

                    <label className="st-label">
                      Seleccionar CV (PDF)
                      <input
                        className="st-file"
                        type="file"
                        accept="application/pdf,.pdf"
                        onChange={onCvChange}
                      />
                    </label>

                    <button type="button" className="st-btn" onClick={onSaveCv} disabled={!cvFile}>
                      Guardar CV
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

import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {loadDashboardData,  startNewInterview,  type DashboardData,} from '../controllers/dashboardController'
import { clearAuthToken } from '../lib/auth'

  <link href="https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;1,9..40,300&display=swap" rel="stylesheet" />


function getGreeting(): string {
  const hour = new Date().getHours()
  if (hour >= 6 && hour < 12)  return 'Buenos días'
  if (hour >= 12 && hour < 19) return 'Buenas tardes'
  return 'Buenas noches'
}

function getInitials(username: string): string {
  return username
    .split(/[\s_-]/)
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase() ?? '')
    .join('')
}


function scoreClass(score: number | null | undefined): string {
  if (score == null) return 'score-na'
  if (score >= 7.5)  return 'score-hi'
  if (score >= 5)    return 'score-md'
  return 'score-lo'
}


const INTERVIEW_TYPE_LABELS: Record<string, string> = {
  TECHNICAL:     'Técnica',
  HR:            'RRHH',
  PSYCHOLOGICAL: 'Psicológica',
}

function DashboardPage() {
  const navigate = useNavigate()
  const menuRef = useRef<HTMLDivElement>(null)
  const [data, setData]               = useState<DashboardData | null>(null)
  const [loading, setLoading]         = useState(true)
  const [error, setError]             = useState('')
  const [creating, setCreating]       = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => { void loadData() }, [])

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false)
      }
    }
    document.addEventListener('click', handleOutsideClick)
    return () => document.removeEventListener('click', handleOutsideClick)
  }, [])

  const loadData = async () => {
    setLoading(true)
    setError('')
    try {
      const nextData = await loadDashboardData()
      setData(nextData)
    } catch (loadError) {
      setError((loadError as Error).message)
    } finally {
      setLoading(false)
    }
  }

  const onStartInterview = async () => {
    setCreating(true)
    setError('')
    try {
      const session = await startNewInterview({
        enterprise: 'InterviewMate AI',
        type: 'TECHNICAL',
        position: 'Simulación personalizada',
      })
      navigate(`/dashboard/session/${session.id}`)
    } catch (createError) {
      setError((createError as Error).message)
    } finally {
      setCreating(false)
    }
  }

  const onLogout = () => {
    clearAuthToken()
    setMenuOpen(false)
    navigate('/login', { replace: true })
  }

  const username         = data?.user?.username ?? ''
  const initials         = getInitials(username || 'U')
  const greeting         = getGreeting()
  const latestResult     = data?.latestResult ?? null
  const templatesCount   = data?.templates.length ?? 0
  const completedSessions = data?.results.length ?? 0
  const history          = data?.results ?? []

  return (
    <>
      <style>{`
        .db * { box-sizing: border-box; margin: 0; padding: 0; }

        /* ── LAYOUT RAÍZ ── */
        .db-root {
          font-family: 'DM Sans', sans-serif;
          background: #f5f5f4;
          min-height: 100vh;
          display: grid;
          grid-template-rows: 52px 1fr;
        }

        /* ── TOPBAR ── */
        .db-topbar {
          background: #fff;
          border-bottom: 0.5px solid #e5e5e5;
          padding: 0 2rem;
          display: flex; align-items: center; justify-content: space-between;
          position: sticky; top: 0; z-index: 10;
        }
        .db-brand {
          display: flex; align-items: center; gap: 8px;
          font-size: 14px; font-weight: 500; color: #111;
          text-decoration: none; cursor: pointer;
        }
        .db-brand-dot {
          width: 20px; height: 20px; border-radius: 5px;
          background: #111;
          display: flex; align-items: center; justify-content: center;
        }
        .db-topbar-right { display: flex; align-items: center; gap: 12px; }
        .db-greeting { font-size: 13px; color: #888; font-weight: 300; }
        .db-greeting strong { color: #111; font-weight: 500; }
        .db-avatar {
          width: 32px; height: 32px; border-radius: 50%;
          background: #EEEDFE;
          display: flex; align-items: center; justify-content: center;
          font-size: 12px; font-weight: 500; color: #534AB7;
          border: 0.5px solid #ddd; cursor: pointer;
          flex-shrink: 0;
        }
        .db-avatar-btn {
          font-family: 'DM Sans', sans-serif;
          transition: background 0.12s;
        }
        .db-avatar-btn:hover { background: #e9e7ff; }
        .db-menu { position: relative; }
        .db-menu-dropdown {
          position: absolute;
          top: calc(100% + 6px);
          right: 0;
          width: 190px;
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
        .db-menu-item {
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
        .db-menu-item:hover { background: #f5f5f4; }
        .db-menu-divider {
          border: none;
          border-top: 0.5px solid #ececec;
          margin: 3px 0;
        }
        .db-menu-item-danger { color: #dc2626; }

        /* ── BODY ── */
        .db-body {
          display: grid;
          grid-template-columns: 256px 1fr;
          min-height: 0;
        }

        /* ── SIDEBAR ── */
        .db-sidebar {
          background: #fff;
          border-right: 0.5px solid #e5e5e5;
          padding: 1.5rem;
          display: flex; flex-direction: column; gap: 1.5rem;
          overflow-y: auto;
        }
        .db-sidebar-section { display: flex; flex-direction: column; gap: 6px; }
        .db-sidebar-label {
          font-size: 10px; letter-spacing: 0.1em;
          text-transform: uppercase; color: #bbb; margin-bottom: 2px;
        }
        .db-nav-item {
          display: flex; align-items: center; gap: 10px;
          padding: 8px 10px; border-radius: 8px;
          font-size: 13px; color: #555; cursor: pointer;
          transition: background 0.12s; border: none; background: none;
          font-family: 'DM Sans', sans-serif; width: 100%; text-align: left;
        }
        .db-nav-item:hover       { background: #f5f5f4; }
        .db-nav-item.db-active   { background: #111; color: #fff; }
        .db-nav-icon { width: 16px; height: 16px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }

        /* Stats mini */
        .db-stat-mini {
          background: #f9f9f8;
          border: 0.5px solid #e5e5e5;
          border-radius: 8px; padding: 10px 12px;
          display: flex; flex-direction: column; gap: 2px;
        }
        .db-stat-mini-label { font-size: 11px; color: #999; font-weight: 300; }
        .db-stat-mini-val {
          font-family: 'Instrument Serif', serif;
          font-size: 1.5rem; font-weight: 400; color: #111;
          line-height: 1; letter-spacing: -0.02em;
        }
        .db-stat-mini-sub { font-size: 11px; color: #bbb; margin-top: 1px; }

        /* Botones sidebar */
        .db-btn-primary {
          font-family: 'DM Sans', sans-serif;
          font-size: 13px; font-weight: 400;
          padding: 9px 14px; border-radius: 8px;
          background: #111; color: #fff;
          border: none; cursor: pointer;
          transition: opacity 0.15s; width: 100%;
          display: flex; align-items: center; gap: 8px;
        }
        .db-btn-primary:hover { opacity: 0.8; }
        .db-btn-secondary {
          font-family: 'DM Sans', sans-serif;
          font-size: 13px; font-weight: 400;
          padding: 9px 14px; border-radius: 8px;
          background: transparent; color: #555;
          border: 0.5px solid #e5e5e5; cursor: pointer;
          transition: background 0.15s; width: 100%;
          display: flex; align-items: center; gap: 8px;
        }
        .db-btn-secondary:hover { background: #f5f5f4; }

        /* ── FORMULARIO NUEVA ENTREVISTA ── */
        .db-create-form {
          display: flex; flex-direction: column; gap: 8px;
          margin-top: 4px;
        }
        .db-field { display: flex; flex-direction: column; gap: 4px; }
        .db-label { font-size: 11px; font-weight: 500; color: #666; }
        .db-input, .db-select, .db-textarea {
          font-family: 'DM Sans', sans-serif;
          font-size: 12px; font-weight: 300;
          padding: 7px 10px;
          border: 0.5px solid #ddd; border-radius: 6px;
          background: #fff; color: #111;
          outline: none; transition: border-color 0.15s; width: 100%;
        }
        .db-input:focus, .db-select:focus, .db-textarea:focus { border-color: #aaa; }
        .db-input::placeholder, .db-textarea::placeholder { color: #ccc; }
        .db-textarea { resize: vertical; min-height: 60px; }

        /* ── MAIN ── */
        .db-main {
          padding: 1.75rem;
          display: flex; flex-direction: column; gap: 1.25rem;
          overflow-y: auto;
        }
        .db-main-title {
          font-family: 'Instrument Serif', serif;
          font-size: 1.5rem; font-weight: 400;
          letter-spacing: -0.02em; color: #111; line-height: 1.2;
        }
        .db-main-title em { font-style: italic; color: #aaa; }
        .db-main-sub { font-size: 13px; color: #999; font-weight: 300; margin-top: 3px; }

        /* Score card destacado */
        .db-score-card {
          background: #111; border-radius: 12px;
          padding: 1.25rem 1.5rem;
          display: flex; align-items: center; justify-content: space-between;
        }
        .db-score-left { display: flex; flex-direction: column; gap: 4px; }
        .db-score-label {
          font-size: 10px; color: #555;
          letter-spacing: 0.08em; text-transform: uppercase;
        }
        .db-score-num {
          font-family: 'Instrument Serif', serif;
          font-size: 2.75rem; font-weight: 400; color: #fff;
          line-height: 1; letter-spacing: -0.03em;
        }
        .db-score-date { font-size: 11px; color: #555; margin-top: 2px; }
        .db-score-tags { display: flex; flex-direction: column; align-items: flex-end; gap: 6px; }
        .db-score-tag {
          font-size: 11px; padding: 4px 10px;
          border-radius: 999px;
          background: #1a1a1a; border: 0.5px solid #333;
          color: #888;
        }
        .db-score-empty {
          background: #f9f9f8; border-radius: 12px;
          border: 0.5px dashed #e5e5e5;
          padding: 1.5rem; text-align: center;
        }
        .db-score-empty p { font-size: 13px; color: #bbb; font-weight: 300; }

        /* Error / loading */
        .db-error {
          font-size: 12px; color: #dc2626;
          background: #FEF2F2; border: 0.5px solid #FECACA;
          border-radius: 6px; padding: 8px 10px;
        }
        .db-loading { font-size: 13px; color: #bbb; font-weight: 300; }

        /* ── HISTORIAL ── */
        .db-section-title {
          font-size: 11px; font-weight: 500; color: #999;
          letter-spacing: 0.06em; text-transform: uppercase;
          margin-bottom: 8px;
        }
        .db-history { display: flex; flex-direction: column; gap: 6px; }
        .db-history-item {
          background: #fff; border-radius: 10px;
          border: 0.5px solid #e5e5e5;
          padding: 12px 14px;
          display: flex; align-items: center; gap: 12px;
        }
        .db-history-icon {
          width: 32px; height: 32px; border-radius: 8px;
          background: #f5f5f4;
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0;
        }
        .db-history-info { flex: 1; min-width: 0; }
        .db-history-name {
          font-size: 13px; font-weight: 500; color: #111;
          white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
        }
        .db-history-meta { font-size: 11px; color: #999; margin-top: 2px; font-weight: 300; }
        .db-history-right { display: flex; align-items: center; gap: 8px; flex-shrink: 0; }
        .db-score-pill {
          font-size: 12px; font-weight: 500;
          padding: 3px 10px; border-radius: 999px;
        }
        .score-hi { background: #DCFCE7; color: #166534; }
        .score-md { background: #FEF9C3; color: #854D0E; }
        .score-lo { background: #FEF2F2; color: #991B1B; }
        .score-na { background: #f5f5f4; color: #999; }
        .db-history-status {
          font-size: 11px; color: #bbb;
          padding: 3px 8px; border-radius: 999px;
          border: 0.5px solid #e5e5e5;
        }
        .db-history-btn {
          font-size: 11px; color: #555;
          background: none; border: 0.5px solid #e5e5e5;
          border-radius: 6px; padding: 4px 10px;
          cursor: pointer; font-family: 'DM Sans', sans-serif;
          transition: background 0.12s;
        }
        .db-history-btn:hover { background: #f5f5f4; }
        .db-history-empty {
          background: #fff; border-radius: 10px;
          border: 0.5px dashed #e5e5e5;
          padding: 2.5rem; text-align: center;
        }
        .db-history-empty p { font-size: 13px; color: #bbb; font-weight: 300; margin-top: 4px; }
      `}</style>

      <div className="db-root">

        {/* ── TOPBAR ── */}
        <div className="db-topbar">
          <div className="db-brand" onClick={() => navigate('/dashboard')}>
            <div className="db-brand-dot">
              <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
                <circle cx="6" cy="6" r="4" fill="white" />
                <circle cx="6" cy="6" r="2" fill="#111" />
              </svg>
            </div>
            InterviewMate
          </div>
          <div className="db-topbar-right">
            {!loading && username && (
              <span className="db-greeting">
                {greeting}, <strong>{username}</strong>
              </span>
            )}
            <div className="db-menu" ref={menuRef}>
              <button
                type="button"
                className="db-avatar db-avatar-btn"
                title={username}
                onClick={(event) => {
                  event.stopPropagation()
                  setMenuOpen((value) => !value)
                }}
                aria-label="Abrir menú"
                aria-expanded={menuOpen}
                aria-haspopup="true"
              >
                {initials}
              </button>

              {menuOpen && (
                <div className="db-menu-dropdown" role="menu">
                  <button
                    type="button"
                    className="db-menu-item"
                    role="menuitem"
                    onClick={() => {
                      setMenuOpen(false)
                      navigate('/settings')
                    }}
                  >
                    Editar perfil
                  </button>
                  <hr className="db-menu-divider" />
                  <button
                    type="button"
                    className="db-menu-item db-menu-item-danger"
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

        {/* ── BODY ── */}
        <div className="db-body">

          {/* ── SIDEBAR ── */}
          <div className="db-sidebar">

            {/* Navegación */}
            <div className="db-sidebar-section">
              <div className="db-sidebar-label">Menú</div>
              <button
                type="button"
                className="db-nav-item db-active"
                onClick={() => navigate('/dashboard')}
              >
                <span className="db-nav-icon">
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <rect x="1" y="1" width="5" height="5" rx="1.5" fill="currentColor" />
                    <rect x="8" y="1" width="5" height="5" rx="1.5" fill="currentColor" opacity=".5" />
                    <rect x="1" y="8" width="5" height="5" rx="1.5" fill="currentColor" opacity=".5" />
                    <rect x="8" y="8" width="5" height="5" rx="1.5" fill="currentColor" opacity=".5" />
                  </svg>
                </span>
                Dashboard
              </button>
              <button
                type="button"
                className="db-nav-item"
                onClick={() => navigate('/study/live')}
              >
                <span className="db-nav-icon">
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <path d="M2 3a1 1 0 011-1h8a1 1 0 011 1v7a1 1 0 01-1 1H5L2 13V3z" stroke="currentColor" strokeWidth="1.2" fill="none" />
                  </svg>
                </span>
                Modo estudio
              </button>
            </div>

            {/* Stats rápidas */}
            <div className="db-sidebar-section">
              <div className="db-sidebar-label">Resumen</div>
              <div className="db-stat-mini">
                <div className="db-stat-mini-label">Sesiones completadas</div>
                <div className="db-stat-mini-val">{loading ? '—' : completedSessions}</div>
              </div>
              <div className="db-stat-mini">
                <div className="db-stat-mini-label">Plantillas creadas</div>
                <div className="db-stat-mini-val">{loading ? '—' : templatesCount}</div>
              </div>
            </div>

            {/* Acciones */}
            <div className="db-sidebar-section">
              <div className="db-sidebar-label">Acciones</div>
              <button
                type="button"
                className="db-btn-primary"
                onClick={onStartInterview}
                disabled={creating || loading}
              >
                <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                  <circle cx="6.5" cy="6.5" r="5.5" stroke="white" strokeWidth="1.2" />
                  <path d="M6.5 4v5M4 6.5h5" stroke="white" strokeWidth="1.2" strokeLinecap="round" />
                </svg>
                {creating ? 'Preparando...' : 'Nueva entrevista'}
              </button>
              <button
                type="button"
                className="db-btn-secondary"
                onClick={() => navigate('/study/live')}
              >
                <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                  <path d="M2 10l3-3 2 2 4-5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                Modo estudio
              </button>
            </div>
          </div>

          {/* ── MAIN ── */}
          <div className="db-main">

            {error && <p className="db-error">{error}</p>}

            {/* Título */}
            <div>
              <div className="db-main-title">
                Tu progreso, <em>de un vistazo</em>
              </div>
              <div className="db-main-sub">
                {loading
                  ? 'Cargando datos...'
                  : history.length > 0
                    ? `${completedSessions} sesión${completedSessions !== 1 ? 'es' : ''} completada${completedSessions !== 1 ? 's' : ''}`
                    : 'Aún no tienes sesiones registradas'}
              </div>
            </div>

            {/* Score destacado del último resultado */}
            {loading ? (
              <p className="db-loading">Cargando...</p>
            ) : latestResult ? (
              <div className="db-score-card">
                <div className="db-score-left">
                  <div className="db-score-label">Último resultado</div>
                  <div className="db-score-num">
                    {latestResult.totalScore?.toFixed(1) ?? 'N/A'}
                  </div>
                  <div className="db-score-date">
                    {new Date(latestResult.generatedAt).toLocaleDateString('es-ES', {
                      day: '2-digit', month: 'long', year: 'numeric',
                    })}
                  </div>
                </div>
                <div className="db-score-tags">
                  <span className="db-score-tag">{latestResult.status}</span>
                  <span className="db-score-tag">
                    Intento #{latestResult.attemptNumber}
                  </span>
                </div>
              </div>
            ) : (
              <div className="db-score-empty">
                <p>Aún no tienes resultados. Completa tu primera sesión para ver tu score aquí.</p>
              </div>
            )}

            {/* Historial */}
            <div>
              <div className="db-section-title">Historial de sesiones</div>
              {loading ? (
                <p className="db-loading">Cargando historial...</p>
              ) : history.length === 0 ? (
                <div className="db-history-empty">
                  <p>No tienes sesiones registradas todavía.</p>
                  <p>Comienza tu primera entrevista desde el panel izquierdo.</p>
                </div>
              ) : (
                <div className="db-history">
                  {history.map((result) => (
                    <div className="db-history-item" key={result.id}>
                      <div className="db-history-icon">
                        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                          <path d="M2 3a1 1 0 011-1h8a1 1 0 011 1v7a1 1 0 01-1 1H5L2 13V3z" stroke="#bbb" strokeWidth="1.2" fill="none" />
                        </svg>
                      </div>
                      <div className="db-history-info">
                        <div className="db-history-name">
                          Sesión {result.sessionId.slice(0, 8)}
                        </div>
                        <div className="db-history-meta">
                          {INTERVIEW_TYPE_LABELS[result.type ?? ''] ?? result.type} · Intento #{result.attemptNumber} ·{' '}
                          {new Date(result.generatedAt).toLocaleDateString('es-ES', {
                            day: '2-digit', month: 'short', year: 'numeric',
                          })}
                        </div>
                      </div>
                      <div className="db-history-right">
                        <span className={`db-score-pill ${scoreClass(result.totalScore)}`}>
                          {result.totalScore?.toFixed(1) ?? 'N/A'}
                        </span>
                        <span className="db-history-status">{result.status}</span>
                        <button
                          type="button"
                          className="db-history-btn"
                          onClick={() => navigate(`/dashboard/session/${result.sessionId}`)}
                        >
                          Ver
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        </div>
      </div>
    </>
  )
}

export default DashboardPage
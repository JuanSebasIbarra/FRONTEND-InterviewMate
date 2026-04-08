import { useEffect, useRef, useState } from 'react'
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { clearAuthToken, isAuthenticated } from './lib/auth'
import heroLogo from './assets/interviewmate-icon.svg'

function Main() {
  const navigate = useNavigate()
  const location = useLocation()
  const authenticated = isAuthenticated()
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  const useNewInterfaceNavbar =
    location.pathname === '/' ||
    location.pathname.startsWith('/login') ||
    location.pathname.startsWith('/register') ||
    location.pathname.startsWith('/interview/live') ||
    location.pathname.startsWith('/dashboard') ||
    location.pathname.startsWith('/study/live') ||
    location.pathname.startsWith('/settings') ||
    location.pathname.startsWith('/templates') ||
    location.pathname.startsWith('/Template')

  const onLogout = () => {
    clearAuthToken()
    setMenuOpen(false)
    navigate('/login', { replace: true })
  }

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleOutsideClick)
    return () => document.removeEventListener('mousedown', handleOutsideClick)
  }, [])

  if (useNewInterfaceNavbar) {
    return <Outlet />
  }

  return (
    <div className="layout">
      <header className="layout__header">
        <Link
          to={authenticated ? '/dashboard' : '/'}
          className="brand-link"
          aria-label="Ir a inicio de InterviewMate"
        >
          <img src={heroLogo} alt="InterviewMate" className="brand-link__logo" />
          <span className="brand-link__text">InterviewMate</span>
        </Link>

        <nav className="layout__nav">
          {authenticated && (
            <div className="settings-menu" ref={menuRef}>
              <button
                type="button"
                className="settings-btn"
                onClick={() => setMenuOpen((v) => !v)}
                aria-expanded={menuOpen}
                aria-haspopup="true"
              >
                Ajustes <span className="settings-btn__icon">{menuOpen ? '✕' : '☰'}</span>
              </button>

              {menuOpen && (
                <div className="settings-dropdown" role="menu">
                  <button
                    type="button"
                    className="dropdown-item"
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
                    className="dropdown-item"
                    role="menuitem"
                    onClick={() => {
                      setMenuOpen(false)
                      navigate('/study/live')
                    }}
                  >
                      Modo estudio
                  </button>
                  <hr className="dropdown-divider" />
                  <button
                    type="button"
                    className="dropdown-item"
                    role="menuitem"
                    onClick={() => {
                      navigate('/settings')
                      setMenuOpen(false)
                    }}
                  >
                      Editar perfil
                  </button>
                  <button
                    type="button"
                    className="dropdown-item"
                    role="menuitem"
                    onClick={() => {
                        navigate('/settings?section=security')
                      setMenuOpen(false)
                    }}
                  >
                      Cambiar contraseña
                  </button>
                  <hr className="dropdown-divider" />
                  <button
                    type="button"
                    className="dropdown-item dropdown-item--danger"
                    role="menuitem"
                    onClick={onLogout}
                  >
                      Cerrar sesión
                  </button>
                </div>
              )}
            </div>
          )}
        </nav>
      </header>

      <main className="layout__content">
        <Outlet />
      </main>
    </div>
  )
}

export default Main

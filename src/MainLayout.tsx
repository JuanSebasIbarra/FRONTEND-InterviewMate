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
      <main className="layout__content">
        <Outlet />
      </main>
    </div>
  )
}

export default Main

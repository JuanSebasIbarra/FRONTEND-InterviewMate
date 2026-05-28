import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import InterviewMateIcon from '../../assets/interviewmate-main-logo.png'

type DashboardSidebarProps = {
  onLogout: () => void
}

function DashboardSidebar({ onLogout }: DashboardSidebarProps) {
  const location = useLocation()
  const searchParams = new URLSearchParams(location.search)
  const activeSettingsSection = searchParams.get('section') ?? 'personal'
  const [isConfigOpen, setIsConfigOpen] = useState(location.pathname === '/settings')

  useEffect(() => {
    setIsConfigOpen(location.pathname === '/settings')
  }, [location.pathname])

  const toggleConfig = () => {
    setIsConfigOpen((prev) => !prev)
  }

  return (
    <aside className="flex min-h-105 w-72 flex-col border border-zinc-300 bg-zinc-50 px-3 py-6">
      <div className="flex flex-col gap-2">
        <div className="flex w-full items-center justify-center rounded-md px-3 py-3 mb-2">
          <img
            src={InterviewMateIcon}
            alt="InterviewMate"
            className="h-auto w-full max-w-[190px] object-contain"
          />
        </div>
        
        <Link
          to="/dashboard"
          className={`w-full border-b border-black/75 px-4 py-3 text-left text-sm rounded-t-md text-zinc-700 transition hover:scale-105 hover:bg-interviewmate-blue/25 ${location.pathname === '/dashboard' ? 'bg-interviewmate-blue/15 font-medium' : ''}`}
        >
          Dashboard
        </Link>

        <Link
          to="/history"
          className={`w-full border-b border-black/75 px-4 py-3 text-left text-sm rounded-t-md text-zinc-700 transition hover:scale-105 hover:bg-interviewmate-blue/25 ${location.pathname === '/history' ? 'bg-interviewmate-blue/15 font-medium' : ''}`}
        >
          Historial
        </Link>

        <div className="w-full">
          <button
            type="button"
            onClick={toggleConfig}
            className={`w-full border-b border-black/75 px-4 py-3 text-left text-sm rounded-t-md text-zinc-700 transition hover:scale-105 hover:bg-interviewmate-blue/25 flex items-center justify-between ${location.pathname === '/settings' ? 'bg-interviewmate-blue/15 font-medium' : ''}`}
          >
            <span>Configuración</span>
            <svg
              className={`w-4 h-4 transition-transform ${isConfigOpen ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          {isConfigOpen && (
            <div className="bg-zinc-100/50 border-b border-black/75">
              <Link
                to="/settings?section=personal"
                className={`block w-full px-8 py-2.5 text-left text-sm text-zinc-600 transition hover:bg-interviewmate-blue/15 ${location.pathname === '/settings' && activeSettingsSection === 'personal' ? 'bg-interviewmate-blue/25 font-medium text-zinc-900' : ''}`}
              >
                Información personal
              </Link>
              <Link
                to="/settings?section=security"
                className={`block w-full px-8 py-2.5 text-left text-sm text-zinc-600 transition hover:bg-interviewmate-blue/15 ${location.pathname === '/settings' && activeSettingsSection === 'security' ? 'bg-interviewmate-blue/25 font-medium text-zinc-900' : ''}`}
              >
                Seguridad y acceso
              </Link>
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={onLogout}
          className="w-full border-b border-black/75 px-4 py-3 text-left text-sm rounded-t-md text-red-600 transition hover:scale-105 hover:bg-red-50"
        >
          Cerrar sesión
        </button>
      </div>
    </aside>
  )
}

export default DashboardSidebar

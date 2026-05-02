import { Link, useLocation } from 'react-router-dom'
import LoggedUserMenu from './LoggedUserMenu'
import InterviewMateIcon from '../../assets/interviewmate-logo.svg'
import { readLocalSettings } from '../../controllers/settingsController'

type DashboardSidebarProps = {
  onLogout: () => void
}

function DashboardSidebar({ onLogout }: DashboardSidebarProps) {
  const location = useLocation()
  const searchParams = new URLSearchParams(location.search)
  const activeSettingsSection = searchParams.get('section') ?? 'personal'
  const localSettings = readLocalSettings()
  const displayName = [localSettings.firstName, localSettings.lastName]
    .filter((value) => Boolean(value?.trim()))
    .join(' ')
    .trim() || 'Usuario'

  return (
    <aside className="flex min-h-105 flex-col border border-zinc-300 bg-zinc-50 px-3 py-6 w-2xs">
      <div className="flex flex-col items-center gap-2">
        <Link
          to="/dashboard"
          className="flex w-full px-4 py-3 text-left text-lg items-center justify-center text-zinc-700 transition hover:bg-interviewmate-blue/25"
        >
          <img src={InterviewMateIcon} alt="icon" className="w-16"/>
          InterviewMate
        </Link>
        <Link
          to="/settings?section=personal"
          className={`w-full border-b border-black/75 px-4 py-3 text-left text-sm rounded-t-md text-zinc-700 transition hover:scale-105 hover:bg-interviewmate-blue/25 ${location.pathname === '/settings' && activeSettingsSection === 'personal' ? 'bg-interviewmate-blue/15 font-medium' : ''}`}
        >
          Perfil
        </Link>
        <Link
          to="/settings?section=security"
          className={`w-full border-b border-black/75 px-4 py-3 text-left text-sm rounded-t-md text-zinc-700 transition hover:scale-105 hover:bg-interviewmate-blue/25 ${location.pathname === '/settings' && activeSettingsSection === 'security' ? 'bg-interviewmate-blue/15 font-medium' : ''}`}
        >
          Configuración
        </Link>
        <Link
          to="/history"
          className={`w-full border-b border-black/75 px-4 py-3 text-left text-sm rounded-t-md text-zinc-700 transition hover:scale-105 hover:bg-interviewmate-blue/25 ${location.pathname === '/history' ? 'bg-interviewmate-blue/15 font-medium' : ''}`}
        >
          Historial
        </Link>
      </div>

      <div className="mt-auto pt-6">
        <LoggedUserMenu username={displayName} onLogout={onLogout} />
      </div>
    </aside>
  )
}

export default DashboardSidebar

import LoggedUserMenu from './LoggedUserMenu'
import InterviewMateIcon from '../../assets/interviewmate-icon.svg'

type DashboardSidebarProps = {
  onLogout: () => void
}

function DashboardSidebar({ onLogout }: DashboardSidebarProps) {
  return (
    <aside className="flex min-h-105 flex-col border border-zinc-300 bg-zinc-50 px-3 py-6 w-2xs">
      <div className="flex flex-col items-center gap-2">
        <a
          href='/'
          className="flex w-full px-4 py-3 text-left text-lg items-center justify-center text-zinc-700 transition hover:bg-interviewmate-blue/25"
        >
          <img src={InterviewMateIcon} alt="icon" className="w-16"/>
          InterviewMate
        </a>
        <a
          href='/'
          className="w-full border-b border-black/75 px-4 py-3 text-left text-sm rounded-t-md hover:scale-105 text-zinc-700 transition hover:bg-interviewmate-blue/25"
        >
          Perfil
        </a>
        <a
          href='/'
          className="w-full border-b border-black/75 px-4 py-3 text-left text-sm rounded-t-md hover:scale-105 text-zinc-700 transition hover:bg-interviewmate-blue/25"
        >
          Configuración
        </a>
      </div>

      <div className="mt-auto pt-6">
        <LoggedUserMenu username="Sebastian" onLogout={onLogout} />
      </div>
    </aside>
  )
}

export default DashboardSidebar

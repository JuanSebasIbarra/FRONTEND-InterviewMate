import LoggedUserMenu from './LoggedUserMenu'

type DashboardSidebarProps = {
  onProfile: () => void
  onSettings: () => void
  onLogout: () => void
}

function DashboardSidebar({ onProfile, onSettings, onLogout }: DashboardSidebarProps) {
  return (
    <aside className="flex min-h-[420px] flex-col rounded-3xl border border-zinc-300 bg-zinc-50 p-6">
      <div className="space-y-2">
        <button
          type="button"
          onClick={onProfile}
          className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-left text-sm text-zinc-700 transition hover:bg-zinc-100"
        >
          Perfil
        </button>
        <button
          type="button"
          onClick={onSettings}
          className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-left text-sm text-zinc-700 transition hover:bg-zinc-100"
        >
          Configuración
        </button>
      </div>

      <div className="mt-auto pt-6">
        <LoggedUserMenu username="Sebastian" onLogout={onLogout} />
      </div>
    </aside>
  )
}

export default DashboardSidebar

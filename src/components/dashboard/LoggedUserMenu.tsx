import { useEffect, useRef, useState } from 'react'

type LoggedUserMenuProps = {
  username: string
  onLogout: () => void
}

function getInitials(username: string): string {
  return username
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('')
}

function LoggedUserMenu({ username, onLogout }: LoggedUserMenuProps) {
  const [isOpen, setIsOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('click', handleOutsideClick)
    return () => document.removeEventListener('click', handleOutsideClick)
  }, [])

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="flex w-full items-center gap-3 border border-zinc-300 bg-white p-3 text-left transition hover:bg-zinc-100"
      >
        <span className="flex h-9 w-9 items-center justify-center rounded-full border border-zinc-300 bg-stone-100 text-xs font-semibold text-zinc-700">
          {getInitials(username)}
        </span>
        <span className="text-sm text-zinc-700">{username}</span>
      </button>

      {isOpen ? (
        <div className="absolute bottom-[calc(100%+0.5rem)] left-0 w-full border border-zinc-300 bg-white p-2 shadow-lg">
          <button
            type="button"
            onClick={onLogout}
            className="w-full px-3 py-2 text-left text-sm text-red-600 transition hover:bg-zinc-100"
          >
            Cerrar sesión
          </button>
        </div>
      ) : null}
    </div>
  )
}

export default LoggedUserMenu

type SessionModeModalProps = {
  isOpen: boolean
  templateName: string
  onClose: () => void
  onStudy: () => void
  onInterview: () => void
}

function SessionModeModal({
  isOpen,
  templateName,
  onClose,
  onStudy,
  onInterview,
}: SessionModeModalProps) {
  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-xl rounded-2xl border border-zinc-200 bg-white p-8 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="mb-6 border-b border-zinc-100 pb-4">
          <p className="text-xs uppercase tracking-widest text-zinc-400">Nueva sesión</p>
          <h2 className="mt-1 font-serif text-2xl font-normal tracking-[-0.02em] text-zinc-900">
            {templateName}
          </h2>
        </div>

        {/* Mode cards */}
        <div className="grid grid-cols-2 gap-4">
          {/* Study mode */}
          <button
            type="button"
            onClick={onStudy}
            className="group flex flex-col items-center gap-5 rounded-xl border border-zinc-200 bg-stone-50 p-8 transition hover:border-[#638ea3] hover:bg-[#638ea3]/5 focus:outline-none"
          >
            <div className="flex h-20 w-20 items-center justify-center">
              <div className="h-14 w-14 rotate-45 rounded-lg border-2 border-zinc-400 bg-white transition group-hover:border-[#638ea3] group-hover:bg-[#638ea3]/10" />
            </div>
            <div className="text-center">
              <p className="font-serif text-lg font-normal tracking-tight text-zinc-900 group-hover:text-[#638ea3]">
                Sesión de Estudio
              </p>
              <p className="mt-1 text-xs text-zinc-500">Practica a tu ritmo</p>
            </div>
          </button>

          {/* Interview mode */}
          <button
            type="button"
            onClick={onInterview}
            className="group flex flex-col items-center gap-5 rounded-xl border border-zinc-200 bg-stone-50 p-8 transition hover:border-zinc-800 hover:bg-zinc-900/5 focus:outline-none"
          >
            <div className="flex h-20 w-20 items-center justify-center">
              <div className="h-14 w-14 rotate-45 rounded-lg border-2 border-zinc-400 bg-white transition group-hover:border-zinc-800 group-hover:bg-zinc-900/10" />
            </div>
            <div className="text-center">
              <p className="font-serif text-lg font-normal tracking-tight text-zinc-900">
                Entrevista
              </p>
              <p className="mt-1 text-xs text-zinc-500">Simula una entrevista real</p>
            </div>
          </button>
        </div>

        {/* Close button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 rounded-md p-1 text-zinc-400 transition hover:bg-zinc-100 hover:text-zinc-700"
          aria-label="Cerrar"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M18 6 6 18" />
            <path d="m6 6 12 12" />
          </svg>
        </button>
      </div>
    </div>
  )
}

export default SessionModeModal

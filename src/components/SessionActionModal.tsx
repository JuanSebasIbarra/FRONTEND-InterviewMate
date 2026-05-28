type SessionActionModalProps = {
  isOpen: boolean
  sessionType: 'Sesion de estudio' | 'Entrevista'
  sessionDate: string
  isDeleting?: boolean
  onCancel: () => void
  onContinue: () => void
  onDelete: () => void
}

function SessionActionModal({
  isOpen,
  sessionType,
  sessionDate,
  isDeleting = false,
  onCancel,
  onContinue,
  onDelete,
}: SessionActionModalProps) {
  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 backdrop-blur-sm"
      onClick={isDeleting ? undefined : onCancel}
    >
      <div
        className="relative w-full max-w-md rounded-2xl border border-zinc-200 bg-white p-6 shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="mb-5">
          <h2 className="font-serif text-2xl font-normal tracking-[-0.02em] text-zinc-900">
            {sessionType}
          </h2>
          <p className="mt-2 text-sm text-zinc-600">
            Creada el <span className="font-medium text-zinc-900">{sessionDate}</span>
          </p>
          <p className="mt-3 text-sm text-zinc-600">
            ¿Qué deseas hacer con esta sesión?
          </p>
        </div>

        <div className="flex flex-col gap-3">
          <button
            type="button"
            onClick={onContinue}
            disabled={isDeleting}
            className="w-full rounded-full bg-zinc-900 px-4 py-2.5 text-sm font-medium text-white transition hover:opacity-80 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Continuar sesión
          </button>
          <button
            type="button"
            onClick={onDelete}
            disabled={isDeleting}
            className="w-full rounded-full bg-red-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isDeleting ? 'Eliminando...' : 'Eliminar sesión'}
          </button>
          <button
            type="button"
            onClick={onCancel}
            disabled={isDeleting}
            className="w-full rounded-full border border-zinc-300 bg-white px-4 py-2.5 text-sm font-medium text-zinc-700 transition hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  )
}

export default SessionActionModal

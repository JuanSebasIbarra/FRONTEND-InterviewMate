type ExitConfirmModalProps = {
  isOpen: boolean
  onConfirm: () => void
  onCancel: () => void
}

function ExitConfirmModal({ isOpen, onConfirm, onCancel }: ExitConfirmModalProps) {
  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={onCancel}
    >
      <div
        className="relative w-full max-w-sm rounded-xl border border-zinc-200 bg-white p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4">
          <h2 className="font-serif text-xl font-normal tracking-[-0.02em] text-zinc-900">
            ¿Salir de la sesión?
          </h2>
          <p className="mt-2 text-sm text-zinc-600">
            Tus respuestas se guardarán y la plantilla quedará marcada como pendiente. ¿Deseas
            continuar?
          </p>
        </div>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 rounded-lg border border-zinc-300 bg-white px-4 py-2.5 text-sm font-medium text-zinc-700 transition hover:bg-zinc-100"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="flex-1 rounded-lg bg-red-600 px-4 py-2.5 text-sm font-medium text-white transition hover:opacity-80"
          >
            Salir
          </button>
        </div>
      </div>
    </div>
  )
}

export default ExitConfirmModal

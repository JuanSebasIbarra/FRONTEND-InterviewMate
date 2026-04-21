type DeleteTemplateModalProps = {
  isOpen: boolean
  templateName: string
  isDeleting?: boolean
  onCancel: () => void
  onConfirm: () => void
}

function DeleteTemplateModal({
  isOpen,
  templateName,
  isDeleting = false,
  onCancel,
  onConfirm,
}: DeleteTemplateModalProps) {
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
            ¿Eliminar plantilla?
          </h2>
          <p className="mt-2 text-sm text-zinc-600">
            Esta accion eliminara
            {' '}
            <span className="font-medium text-zinc-900">{templateName}</span>
            {' '}
            de tu listado. Esta accion no se puede deshacer.
          </p>
        </div>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={onCancel}
            disabled={isDeleting}
            className="flex-1 rounded-full bg-zinc-900 px-4 py-2.5 text-sm font-medium text-white transition hover:opacity-80 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isDeleting}
            className="flex-1 rounded-full bg-red-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isDeleting ? 'Eliminando...' : 'Eliminar'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default DeleteTemplateModal
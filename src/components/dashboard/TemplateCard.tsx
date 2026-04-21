type TemplateCardProps = {
  name: string
  subtitle?: string
  onAdd: () => void
  onHistory: () => void
  onOpen?: () => void
  secondaryActionLabel?: string
  onDelete?: () => void
}

function TemplateCard({
  name,
  subtitle,
  onAdd,
  onHistory,
  onOpen,
  secondaryActionLabel = 'Ver mas',
  onDelete,
}: TemplateCardProps) {
  return (
    <article className="flex flex-col border border-zinc-300 bg-white p-4 shadow-sm hover:bg-black/5 transition rounded-lg">
      <div className="flex flex-col gap-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1 space-y-1">
            <button
              type="button"
              onClick={onOpen ?? onHistory}
              className="text-left text-sm font-medium text-zinc-800 hover:underline"
            >
              {name}
            </button>
            {subtitle && (
              <p className="text-xs text-zinc-500">{subtitle}</p>
            )}
          </div>
          {onDelete && (
            <button
              type="button"
              onClick={onDelete}
              className="ml-auto inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-red-200 bg-white text-red-600 transition hover:bg-red-50"
              aria-label={`Eliminar ${name}`}
              title="Eliminar plantilla"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                <path d="M3.333 4.667h9.334M6.667 2.667h2.666m-5 2L4.667 12a1.333 1.333 0 001.333 1.333h4a1.333 1.333 0 001.333-1.333l.334-7.333" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onAdd}
            className="bg-zinc-900 px-4 py-2 text-xs font-medium text-white transition hover:opacity-80"
          >
            Nuevo
          </button>
          <button
            type="button"
            onClick={onHistory}
            className="border border-zinc-300 bg-white px-4 py-2 text-xs font-medium text-zinc-700 transition hover:bg-zinc-100"
          >
            {secondaryActionLabel}
          </button>
        </div>
      </div>
    </article>
  )
}

export default TemplateCard

type TemplateCardProps = {
  name: string
  onAdd: () => void
  onHistory: () => void
}

function TemplateCard({ name, onAdd, onHistory }: TemplateCardProps) {
  return (
    <article className="rounded-2xl border border-zinc-300 bg-white p-4 shadow-sm">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <span className="text-sm font-medium text-zinc-800">{name}</span>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onAdd}
            className="rounded-full bg-zinc-900 px-4 py-2 text-xs font-medium text-white transition hover:opacity-80"
          >
            Add
          </button>
          <button
            type="button"
            onClick={onHistory}
            className="rounded-full border border-zinc-300 bg-white px-4 py-2 text-xs font-medium text-zinc-700 transition hover:bg-zinc-100"
          >
            Historial
          </button>
        </div>
      </div>
    </article>
  )
}

export default TemplateCard

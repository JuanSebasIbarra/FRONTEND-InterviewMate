type TemplateCardProps = {
  name: string
  onAdd: () => void
  onHistory: () => void
}

function TemplateCard({ name, onAdd, onHistory }: TemplateCardProps) {
  return (
    <article className="border border-zinc-300 bg-white p-4 shadow-sm">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <span className="text-sm font-medium text-zinc-800">{name}</span>

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
            Ver más
          </button>
        </div>
      </div>
    </article>
  )
}

export default TemplateCard

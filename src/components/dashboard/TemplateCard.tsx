type TemplateCardProps = {
  name: string
  onAdd: () => void
  onHistory: () => void
  onOpen?: () => void
}

function TemplateCard({ name, onAdd, onHistory, onOpen }: TemplateCardProps) {
  return (
    <article className="flex flex-col border border-zinc-300 bg-white p-4 shadow-sm hover:bg-black/5 transition rounded-lg">
      <div className="flex flex-col gap-4">
        <button
          type="button"
          onClick={onOpen ?? onHistory}
          className="text-left text-sm font-medium text-zinc-800 hover:underline"
        >
          {name}
        </button>

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

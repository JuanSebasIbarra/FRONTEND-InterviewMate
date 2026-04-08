type SessionHistoryCardProps = {
  date: string
  score: string
  type: 'Sesion de estudio' | 'Entrevista'
}

function SessionHistoryCard({ date, score, type }: SessionHistoryCardProps) {
  return (
    <article className="rounded-2xl border border-zinc-300 bg-white px-5 py-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[11px] uppercase tracking-widest text-zinc-400">{type}</p>
          <p className="mt-2 text-sm font-medium text-zinc-900">{date}</p>
        </div>
        <div className="rounded-full border border-zinc-300 px-3 py-1 text-xs font-medium text-zinc-700">
          Score {score}
        </div>
      </div>
    </article>
  )
}

export default SessionHistoryCard
import SessionHistoryCard from '../components/SessionHistoryCard'

const STUDY_SESSIONS = [
  { id: 'study-1', date: '1 marzo', score: '8.6/10', type: 'Sesion de estudio' as const },
  { id: 'study-2', date: '18 febrero', score: '7.9/10', type: 'Sesion de estudio' as const },
  { id: 'study-3', date: '6 febrero', score: '8.1/10', type: 'Sesion de estudio' as const },
]

const INTERVIEW_SESSIONS = [
  { id: 'interview-1', date: '28 febrero', score: '7.2/10', type: 'Entrevista' as const },
  { id: 'interview-2', date: '14 febrero', score: '8.0/10', type: 'Entrevista' as const },
  { id: 'interview-3', date: '30 enero', score: '7.5/10', type: 'Entrevista' as const },
]

function SessionPage() {
  return (
    <div className="min-h-screen bg-stone-100 px-3 py-3 sm:px-6 sm:py-6">
      <main className="mx-auto grid min-h-[calc(100vh-1.5rem)] max-w-7xl grid-cols-1 gap-4 rounded-3xl border border-zinc-300 bg-white p-4 sm:min-h-[calc(100vh-3rem)] sm:p-6 lg:grid-cols-[280px_minmax(0,1fr)] lg:gap-6 lg:p-8">
        <aside className="rounded-3xl border border-zinc-300 bg-zinc-50 p-6">
          <div className="flex h-full min-h-72 items-center justify-center rounded-2xl border border-dashed border-zinc-300 bg-white text-center">
            <div>
              <p className="text-[11px] uppercase tracking-widest text-zinc-400">Sidebar</p>
              <p className="mt-2 text-sm text-zinc-600">Placeholder para el componente futuro</p>
            </div>
          </div>
        </aside>

        <section className="rounded-3xl border border-zinc-300 bg-stone-50 p-5 sm:p-7">
          <header className="mb-7 border-b border-zinc-200 pb-5">
            <p className="text-xs uppercase tracking-widest text-zinc-500">Panel de sesiones</p>
            <h1 className="mt-2 font-serif text-4xl font-normal tracking-[-0.02em] text-zinc-900 sm:text-5xl">
              Ninja Shinobi Engineer
            </h1>
          </header>

          <div className="space-y-9">
            <article>
              <div className="mb-4 flex items-center justify-between gap-3">
                <h2 className="font-serif text-[2rem] font-normal tracking-[-0.02em] text-zinc-900">
                  Estudio Session
                </h2>
                <button
                  type="button"
                  className="rounded-full bg-zinc-900 px-6 py-2.5 text-sm font-medium text-white transition hover:opacity-80"
                >
                  Estudiar
                </button>
              </div>

              <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                {STUDY_SESSIONS.map((session) => (
                  <SessionHistoryCard
                    key={session.id}
                    date={session.date}
                    score={session.score}
                    type={session.type}
                  />
                ))}
              </div>
            </article>

            <article>
              <div className="mb-4 flex items-center justify-between gap-3">
                <h2 className="font-serif text-[2rem] font-normal tracking-[-0.02em] text-zinc-900">
                  Entrevistas
                </h2>
                <button
                  type="button"
                  className="rounded-full bg-zinc-900 px-6 py-2.5 text-sm font-medium text-white transition hover:opacity-80"
                >
                  Entrevista
                </button>
              </div>

              <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                {INTERVIEW_SESSIONS.map((session) => (
                  <SessionHistoryCard
                    key={session.id}
                    date={session.date}
                    score={session.score}
                    type={session.type}
                  />
                ))}
              </div>
            </article>
          </div>
        </section>
      </main>
    </div>
  )
}

export default SessionPage

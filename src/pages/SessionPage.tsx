import SessionHistoryCard from "../components/SessionHistoryCard";
import DashboardSidebar from "../components/dashboard/DashboardSidebar";
import { useNavigate } from 'react-router-dom'

const STUDY_SESSIONS = [
  {
    id: "study-1",
    date: "1 marzo",
    score: "8.6/10",
    type: "Sesion de estudio" as const,
  },
  {
    id: "study-2",
    date: "18 febrero",
    score: "7.9/10",
    type: "Sesion de estudio" as const,
  },
  {
    id: "study-3",
    date: "6 febrero",
    score: "8.1/10",
    type: "Sesion de estudio" as const,
  },
];

const INTERVIEW_SESSIONS = [
  {
    id: "interview-1",
    date: "28 febrero",
    score: "7.2/10",
    type: "Entrevista" as const,
  },
  {
    id: "interview-2",
    date: "14 febrero",
    score: "8.0/10",
    type: "Entrevista" as const,
  },
  {
    id: "interview-3",
    date: "30 enero",
    score: "7.5/10",
    type: "Entrevista" as const,
  },
];

function SessionPage() {
  const navigate = useNavigate()

  const handleLogout = () => {
    navigate('/login')
  }

  return (
    <div className="h-screen w-screen bg-stone-100 flex">
      <DashboardSidebar
          onLogout={handleLogout}
        />
      <main className="w-full h-full sm:h-full sm:lg:grid-cols-[280px_minmax(0,1fr)] lg:gap-6">
        <section className="border-zinc-300 bg-stone-50 p-5 sm:p-7 h-full">
          <header className="mb-7 border-b border-zinc-200 pb-5">
            <p className="text-xs uppercase tracking-widest text-zinc-500">
              Panel de sesiones
            </p>
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
  );
}

export default SessionPage;

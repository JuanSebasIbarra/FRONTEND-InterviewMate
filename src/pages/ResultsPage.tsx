import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

type QuestionStatus = 'correct' | 'improvable' | 'incorrect'

type Question = {
  id: number
  text: string
  status: QuestionStatus
}

type FeedbackItem = {
  id: number
  title: string
  description: string
}

const MOCK_TEMPLATE = 'Entrevista: Shinobi Engineer'
const MOCK_SCORE = 5
const MOCK_SCORE_MAX = 10
const MOCK_OPINION =
  'El entrevistado es apto para el puesto, sin embargo carece de habilidades sólidas con shuriken y manejo avanzado de herramientas de ninjutsu moderno. Se recomienda profundizar en estos temas antes de la siguiente evaluación.'

const MOCK_QUESTIONS: Question[] = [
  { id: 1, text: '¿Cuál es tu experiencia con React?', status: 'correct' },
  { id: 2, text: '¿Cómo manejas el estado global en una aplicación?', status: 'improvable' },
  { id: 3, text: '¿Qué es el virtual DOM?', status: 'incorrect' },
  { id: 4, text: '¿Qué patrones de diseño conoces?', status: 'improvable' },
  { id: 5, text: '¿Cómo optimizarías el rendimiento de una app?', status: 'correct' },
]

const MOCK_FEEDBACK: FeedbackItem[] = [
  {
    id: 1,
    title: 'Refuerza conceptos de estado global',
    description:
      'Se recomienda estudiar herramientas como Zustand, Redux o Context API con mayor profundidad, ya que las respuestas dadas fueron parcialmente correctas.',
  },
  {
    id: 2,
    title: 'Profundiza en patrones de diseño',
    description:
      'Conocer patrones como Observer, Factory o Strategy es clave para roles senior. Practica implementando al menos uno por semana.',
  },
  {
    id: 3,
    title: 'Domina los fundamentos del DOM',
    description:
      'La respuesta sobre el virtual DOM fue incorrecta. Se sugiere revisar la documentación oficial de React y repasar cómo React reconcilia cambios.',
  },
]

const STATUS_CONFIG: Record<
  QuestionStatus,
  { label: string; labelClass: string; dotClass: string }
> = {
  correct: {
    label: 'Correcto',
    labelClass: 'text-emerald-700 bg-emerald-50 border border-emerald-200',
    dotClass: 'bg-emerald-500',
  },
  improvable: {
    label: 'Mejorable',
    labelClass: 'text-amber-700 bg-amber-50 border border-amber-200',
    dotClass: 'bg-amber-400',
  },
  incorrect: {
    label: 'Incorrecto',
    labelClass: 'text-red-700 bg-red-50 border border-red-200',
    dotClass: 'bg-red-500',
  },
}

function ScoreBadge({ score, max }: { score: number; max: number }) {
  const pct = score / max
  const color =
    pct >= 0.7 ? 'text-emerald-600' : pct >= 0.5 ? 'text-amber-500' : 'text-red-500'
  const emoji = pct >= 0.7 ? '🏆' : pct >= 0.5 ? '🔥' : '😓'
  return (
    <span className={`inline-flex items-center gap-1.5 font-medium ${color}`}>
      {score}/{max}
      <span>{emoji}</span>
    </span>
  )
}

type Tab = 'results' | 'feedback'

function ResultsPage() {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState<Tab>('results')

  const handleHome = () => navigate('/dashboard')
  const handleRetry = () => navigate('/sessions')

  return (
    <div className="h-screen w-screen bg-stone-100 flex overflow-hidden">
      {/* ── Local sidebar ── */}
      <aside className="flex min-h-full flex-col border-r border-zinc-300 bg-zinc-50 px-3 py-6 w-52 shrink-0">
        <p className="mb-4 px-2 text-[10px] uppercase tracking-widest text-zinc-400">
          Navegación
        </p>
        <nav className="flex flex-col gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('results')}
            className={`w-full rounded-md px-4 py-2.5 text-left text-sm font-medium transition ${
              activeTab === 'results'
                ? 'bg-emerald-400 text-white shadow-sm'
                : 'border border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-100'
            }`}
          >
            Resultados
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('feedback')}
            className={`w-full rounded-md px-4 py-2.5 text-left text-sm font-medium transition ${
              activeTab === 'feedback'
                ? 'bg-emerald-400 text-white shadow-sm'
                : 'border border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-100'
            }`}
          >
            Feedback
          </button>
        </nav>
      </aside>

      {/* ── Main content ── */}
      <main className="flex flex-1 flex-col overflow-hidden">
        <div className="flex flex-1 flex-col overflow-y-auto p-5 sm:p-7">
          {/* Header */}
          <header className="mb-6 border-b border-zinc-200 pb-5">
            <p className="text-xs uppercase tracking-widest text-zinc-500">
              {activeTab === 'results' ? 'Resumen de sesión' : 'Recomendaciones de la IA'}
            </p>
            <h1 className="mt-2 font-serif text-4xl font-normal tracking-[-0.02em] text-zinc-900 sm:text-5xl">
              {activeTab === 'results' ? 'Resultados' : 'Feedback'}
            </h1>
          </header>

          {activeTab === 'results' ? (
            /* ── RESULTS tab ── */
            <section className="flex flex-1 flex-col rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
              {/* Template + score */}
              <div className="mb-6 border-b border-zinc-100 pb-4">
                <p className="font-serif text-lg text-zinc-800">{MOCK_TEMPLATE}</p>
                <div className="mt-1 flex items-center gap-2 text-sm text-zinc-500">
                  Calificación:&nbsp;
                  <ScoreBadge score={MOCK_SCORE} max={MOCK_SCORE_MAX} />
                </div>
              </div>

              {/* Questions list */}
              <div className="flex-1">
                <p className="mb-3 text-xs uppercase tracking-widest text-zinc-400">
                  Lista de preguntas
                </p>
                <ul className="space-y-3">
                  {MOCK_QUESTIONS.map((q, idx) => {
                    const cfg = STATUS_CONFIG[q.status]
                    return (
                      <li
                        key={q.id}
                        className="flex items-start gap-3 rounded-lg border border-zinc-100 bg-stone-50 px-4 py-3"
                      >
                        <span className="mt-0.5 shrink-0 text-xs font-medium text-zinc-400">
                          {idx + 1}.
                        </span>
                        <span className="flex-1 text-sm text-zinc-800">{q.text}</span>
                        <span
                          className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium ${cfg.labelClass}`}
                        >
                          <span
                            className={`mr-1.5 inline-block h-1.5 w-1.5 rounded-full align-middle ${cfg.dotClass}`}
                          />
                          {cfg.label}
                        </span>
                      </li>
                    )
                  })}
                </ul>
              </div>

              {/* Opinion */}
              <div className="mt-6 rounded-lg border border-zinc-200 bg-stone-50 p-4">
                <p className="mb-1 text-xs uppercase tracking-widest text-zinc-400">
                  Opinión del contratador
                </p>
                <p className="text-sm leading-relaxed text-zinc-700">{MOCK_OPINION}</p>
              </div>
            </section>
          ) : (
            /* ── FEEDBACK tab ── */
            <section className="flex flex-1 flex-col rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
              <div className="mb-4 border-b border-zinc-100 pb-4">
                <p className="font-serif text-lg text-zinc-800">{MOCK_TEMPLATE}</p>
                <p className="mt-1 text-sm text-zinc-500">
                  Recomendaciones generadas por IA basadas en tus respuestas
                </p>
              </div>
              <ul className="flex-1 space-y-4">
                {MOCK_FEEDBACK.map((item) => (
                  <li
                    key={item.id}
                    className="rounded-lg border border-interviewmate-blue/30 bg-interviewmate-blue/5 px-5 py-4"
                  >
                    <p className="mb-1 text-sm font-medium text-zinc-900">{item.title}</p>
                    <p className="text-sm leading-relaxed text-zinc-600">{item.description}</p>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>

        {/* ── Bottom action bar ── */}
        <div className="flex items-center gap-3 border-t border-zinc-200 bg-stone-50 px-6 py-4">
          <button
            type="button"
            onClick={handleHome}
            className="flex-1 rounded-lg border border-zinc-300 bg-white px-6 py-2.5 text-sm font-medium text-zinc-700 transition hover:bg-zinc-100"
          >
            Volver al Inicio
          </button>
          <button
            type="button"
            onClick={handleRetry}
            className="flex-1 rounded-lg bg-zinc-900 px-6 py-2.5 text-sm font-medium text-white transition hover:opacity-80"
          >
            Reintentar
          </button>
        </div>
      </main>
    </div>
  )
}

export default ResultsPage

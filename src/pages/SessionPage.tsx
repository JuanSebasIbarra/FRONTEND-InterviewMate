import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import SessionHistoryCard from '../components/SessionHistoryCard'
import DashboardSidebar from '../components/dashboard/DashboardSidebar'
import { clearAuthToken } from '../lib/auth'
import type { InterviewSession, InterviewTemplate } from '../models/interview'
import { getSessionsByTemplate } from '../services/sessionService'
import { getTemplateById } from '../services/templateService'

function formatSessionDate(value?: string) {
  if (!value) return 'Sin fecha'

  const parsedDate = new Date(value)
  if (Number.isNaN(parsedDate.getTime())) {
    return 'Sin fecha'
  }

  return new Intl.DateTimeFormat('es-ES', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  }).format(parsedDate)
}

function SessionPage() {
  const navigate = useNavigate()
  const { templateId } = useParams<{ templateId: string }>()
  const [sessions, setSessions] = useState<InterviewSession[]>([])
  const [template, setTemplate] = useState<InterviewTemplate | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    if (!templateId) {
      setErrorMessage('No se encontro la plantilla seleccionada.')
      setIsLoading(false)
      return
    }

    let isMounted = true

    const loadSessionData = async () => {
      setIsLoading(true)
      setErrorMessage('')

      try {
        const [templatePayload, sessionPayload] = await Promise.all([
          getTemplateById(templateId),
          getSessionsByTemplate(templateId),
        ])

        if (!isMounted) return

        setTemplate(templatePayload)
        setSessions(sessionPayload ?? [])
      } catch (error) {
        if (!isMounted) return

        const message =
          error instanceof Error
            ? error.message
            : 'No se pudo cargar la informacion de la plantilla.'
        setErrorMessage(message)
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    void loadSessionData()

    return () => {
      isMounted = false
    }
  }, [templateId])

  const handleLogout = () => {
    clearAuthToken()
    navigate('/login')
  }

  const pageTitle = template
    ? `${template.position} - ${template.enterprise}`
    : 'Sesiones de plantilla'

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
              {pageTitle}
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
                <p className="text-sm text-zinc-600">
                  El historial de estudio no depende de esta plantilla en este modulo.
                </p>
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
                {isLoading && <p className="text-sm text-zinc-600">Cargando sesiones...</p>}

                {!isLoading && errorMessage && (
                  <p className="text-sm text-red-700">{errorMessage}</p>
                )}

                {!isLoading && !errorMessage && sessions.length === 0 && (
                  <p className="text-sm text-zinc-600">No hay sesiones registradas para esta plantilla.</p>
                )}

                {!isLoading && !errorMessage && sessions.map((session) => (
                  <SessionHistoryCard
                    key={session.id}
                    date={formatSessionDate(session.startedAt ?? session.completedAt)}
                    score={`Intento ${session.attemptNumber}`}
                    type="Entrevista"
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

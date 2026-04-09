import { useEffect, useRef, useState } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import SessionHistoryCard from '../components/SessionHistoryCard'
import DashboardSidebar from '../components/dashboard/DashboardSidebar'
import { clearAuthToken } from '../lib/auth'
import type { InterviewSession, InterviewTemplate } from '../models/interview'
import type { StudySessionSummary } from '../models/study'
import { beginSession, createSession, getSessionsByTemplate } from '../services/sessionService'
import { getMyStudySessions, startStudy } from '../services/studyService'
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

function formatInterviewStatus(status: InterviewSession['status']) {
  if (status === 'COMPLETED') return 'COMPLETADO'
  if (status === 'ABANDONED') return 'ABANDONADO'
  return 'PENDIENTE'
}

function SessionPage() {
  const navigate = useNavigate()
  const { templateId } = useParams<{ templateId: string }>()
  const [searchParams] = useSearchParams()
  const [interviewSessions, setInterviewSessions] = useState<InterviewSession[]>([])
  const [studySessions, setStudySessions] = useState<StudySessionSummary[]>([])
  const [template, setTemplate] = useState<InterviewTemplate | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isCreatingInterview, setIsCreatingInterview] = useState(false)
  const [isCreatingStudy, setIsCreatingStudy] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const didAutoStartStudyRef = useRef(false)

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
        const [templatePayload, sessionPayload, studyPayload] = await Promise.all([
          getTemplateById(templateId),
          getSessionsByTemplate(templateId),
          getMyStudySessions(),
        ])

        if (!isMounted) return

        setTemplate(templatePayload)
        setInterviewSessions(sessionPayload ?? [])
        setStudySessions((studyPayload ?? []).filter((session) => session.templateId === templateId))
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

  useEffect(() => {
    if (!templateId) return
    if (searchParams.get('mode') !== 'study') return
    if (didAutoStartStudyRef.current) return

    didAutoStartStudyRef.current = true
    navigate(`/sessions/${templateId}`, { replace: true })
    void handleStartStudy()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [templateId, searchParams])

  const handleLogout = () => {
    clearAuthToken()
    navigate('/login')
  }

  const handleStartInterview = async () => {
    if (!templateId || isCreatingInterview) return

    setIsCreatingInterview(true)
    setErrorMessage('')

    try {
      const createdSession = await createSession({ templateId })
      const activeSession = await beginSession(createdSession.id)
      navigate(`/sessions/${activeSession.id}/interview`, { replace: true })
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'No se pudo iniciar la entrevista. Intenta nuevamente.'
      setErrorMessage(message)
    } finally {
      setIsCreatingInterview(false)
    }
  }

  const handleStartStudy = async () => {
    if (!templateId || isCreatingStudy) return

    setIsCreatingStudy(true)
    setErrorMessage('')

    try {
      const studySession = await startStudy({
        templateId,
        topic: template?.position,
      })
      navigate(`/sessions/${studySession.id}/study`, { replace: true })
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'No se pudo iniciar la sesion de estudio. Intenta nuevamente.'
      setErrorMessage(message)
    } finally {
      setIsCreatingStudy(false)
    }
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
                  onClick={handleStartStudy}
                  disabled={!templateId || isCreatingStudy}
                  className="rounded-full bg-zinc-900 px-6 py-2.5 text-sm font-medium text-white transition hover:opacity-80"
                >
                  {isCreatingStudy ? 'Iniciando...' : 'Estudiar'}
                </button>
              </div>

              <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                {isLoading && <p className="text-sm text-zinc-600">Cargando sesiones de estudio...</p>}

                {!isLoading && !errorMessage && studySessions.length === 0 && (
                  <p className="text-sm text-zinc-600">No hay sesiones de estudio registradas para esta plantilla.</p>
                )}

                {!isLoading && !errorMessage && studySessions.map((session) => (
                  <SessionHistoryCard
                    key={session.id}
                    date={formatSessionDate(session.createdAt)}
                    status="PENDIENTE"
                    type="Sesion de estudio"
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
                  onClick={handleStartInterview}
                  disabled={!templateId || isCreatingInterview}
                  className="rounded-full bg-zinc-900 px-6 py-2.5 text-sm font-medium text-white transition hover:opacity-80"
                >
                  {isCreatingInterview ? 'Iniciando...' : 'Entrevista'}
                </button>
              </div>

              <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                {isLoading && <p className="text-sm text-zinc-600">Cargando sesiones...</p>}

                {!isLoading && errorMessage && (
                  <p className="text-sm text-red-700">{errorMessage}</p>
                )}

                {!isLoading && !errorMessage && interviewSessions.length === 0 && (
                  <p className="text-sm text-zinc-600">No hay sesiones registradas para esta plantilla.</p>
                )}

                {!isLoading && !errorMessage && interviewSessions.map((session) => (
                  <SessionHistoryCard
                    key={session.id}
                    date={formatSessionDate(session.startedAt ?? session.completedAt)}
                    status={formatInterviewStatus(session.status)}
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

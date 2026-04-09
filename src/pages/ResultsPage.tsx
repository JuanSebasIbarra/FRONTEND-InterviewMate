import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import type { InterviewResult, InterviewSession } from '../models/interview'
import type { StudySession } from '../models/study'
import { getStudySessionAnswers } from '../lib/studySessionAnswers'
import { getQuestionsBySession } from '../services/questionService'
import { generateSessionReview, getResultBySession } from '../services/resultService'
import { getSessionById } from '../services/sessionService'
import { getStudyById } from '../services/studyService'

type Tab = 'questions' | 'feedback' | 'result'
type SessionMode = 'interview' | 'study'

type NormalizedQuestion = {
  id: string
  orderIndex: number
  text: string
  answer?: string
  score?: number | null
  aiFeedback?: string | null
}

type StudyReview = {
  generalFeedback: string
  strengths: string
  weaknesses: string
  totalScore: number
  status: 'PASSED' | 'FAILED' | 'PENDING_REVIEW'
  generatedAt: string
}

function ScoreBadge({ score, max }: { score: number; max: number }) {
  const pct = max > 0 ? score / max : 0
  const color =
    pct >= 0.7 ? 'text-emerald-600' : pct >= 0.5 ? 'text-amber-500' : 'text-red-500'

  return <span className={`inline-flex items-center gap-1.5 font-medium ${color}`}>{score}/{max}</span>
}

function ResultsPage() {
  const navigate = useNavigate()
  const { sessionId } = useParams<{ sessionId: string }>()
  const [activeTab, setActiveTab] = useState<Tab>('result')
  const [mode, setMode] = useState<SessionMode>('interview')
  const [session, setSession] = useState<InterviewSession | null>(null)
  const [studySession, setStudySession] = useState<StudySession | null>(null)
  const [result, setResult] = useState<InterviewResult | null>(null)
  const [studyReview, setStudyReview] = useState<StudyReview | null>(null)
  const [questions, setQuestions] = useState<NormalizedQuestion[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    if (!sessionId) {
      setErrorMessage('No se encontro la sesion a evaluar.')
      setIsLoading(false)
      return
    }

    let mounted = true

    const loadData = async () => {
      setIsLoading(true)
      setErrorMessage('')

      const studySnapshot = getStudySessionAnswers(sessionId)

      try {
        const interviewSession = await getSessionById(sessionId)
        const interviewQuestions = await getQuestionsBySession(sessionId)

        if (!mounted) return

        setMode('interview')
        setSession(interviewSession)
        setStudySession(null)
        setQuestions(
          [...interviewQuestions]
            .sort((a, b) => a.orderIndex - b.orderIndex)
            .map((question) => ({
              id: question.id,
              orderIndex: question.orderIndex,
              text: question.question,
              answer: question.answer ?? '',
              score: question.score ?? null,
              aiFeedback: question.aiFeedback ?? null,
            })),
        )

        try {
          const generatedResult = await generateSessionReview(sessionId)
          if (!mounted) return
          setResult(generatedResult)
        } catch {
          try {
            const existingResult = await getResultBySession(sessionId)
            if (!mounted) return
            setResult(existingResult)
          } catch {
            if (!mounted) return
            setErrorMessage('No se pudo generar el resultado de la entrevista.')
          }
        }
      } catch {
        try {
          const studyPayload = await getStudyById(sessionId)
          if (!mounted) return

          const storedAnswers = studySnapshot?.answers ?? []
          const answersById = storedAnswers.reduce<Record<string, string>>((acc, answer) => {
            acc[answer.questionId] = answer.answer
            return acc
          }, {})

          const normalizedStudyQuestions = [...(studyPayload.questions ?? [])]
            .sort((a, b) => a.orderIndex - b.orderIndex)
            .map((question) => ({
              id: question.id,
              orderIndex: question.orderIndex,
              text: question.questionText,
              answer: answersById[question.id] ?? '',
              score: null,
              aiFeedback: null,
            }))

          const answeredCount = normalizedStudyQuestions.filter((question) => Boolean(question.answer?.trim())).length
          const totalQuestions = normalizedStudyQuestions.length || 1
          const completionRate = Math.round((answeredCount / totalQuestions) * 100)
          const pendingCount = Math.max(totalQuestions - answeredCount, 0)

          setMode('study')
          setSession(null)
          setStudySession(studyPayload)
          setQuestions(normalizedStudyQuestions)
          setStudyReview({
            generalFeedback:
              answeredCount > 0
                ? `Completaste ${answeredCount} de ${normalizedStudyQuestions.length} preguntas. La sesion de estudio quedo lista para revisar tu avance.`
                : 'Aun no respondiste ninguna pregunta en esta sesion de estudio.',
            strengths:
              answeredCount > 0
                ? 'Ya tienes respuestas registradas y eso te permite repasar el contenido con contexto.'
                : 'Cuando respondas preguntas, aqui se resumiran tus fortalezas.',
            weaknesses:
              pendingCount > 0
                ? `Te quedan ${pendingCount} preguntas por responder o repasar.`
                : 'No hay preguntas pendientes en esta sesion.',
            totalScore: completionRate,
            status: answeredCount >= normalizedStudyQuestions.length ? 'PASSED' : 'PENDING_REVIEW',
            generatedAt: new Date().toISOString(),
          })
        } catch {
          if (!mounted) return
          setErrorMessage('No se pudo cargar la sesion para mostrar resultados.')
        }
      } finally {
        if (mounted) {
          setIsLoading(false)
        }
      }
    }

    void loadData()

    return () => {
      mounted = false
    }
  }, [sessionId])

  const templateLabel = useMemo(() => {
    if (mode === 'study') {
      return studySession?.topic || 'Resultado de estudio'
    }

    if (result?.position || result?.enterprise) {
      const position = result.position ?? 'Posicion'
      const enterprise = result.enterprise ?? 'Empresa'
      return `${position} - ${enterprise}`
    }

    if (session?.templatePosition || session?.templateEnterprise) {
      const position = session.templatePosition ?? 'Posicion'
      const enterprise = session.templateEnterprise ?? 'Empresa'
      return `${position} - ${enterprise}`
    }

    return 'Resultado de entrevista'
  }, [mode, result?.enterprise, result?.position, session?.templateEnterprise, session?.templatePosition, studySession?.topic])

  const answeredCount = useMemo(
    () => questions.filter((question) => Boolean(question.answer?.trim())).length,
    [questions],
  )

  const totalQuestions = questions.length

  const displayReview = mode === 'study'
    ? studyReview
    : result
      ? {
          generalFeedback: result.generalFeedback || 'No hay resumen disponible.',
          strengths: result.strengths || 'Sin datos.',
          weaknesses: result.weaknesses || 'Sin datos.',
          totalScore: result.totalScore ?? 0,
          status: result.status,
          generatedAt: result.generatedAt,
        }
      : null

  const handleHome = () => navigate('/dashboard')
  const handleRetry = () => {
    const templateId = mode === 'study' ? studySession?.templateId : session?.templateId
    if (templateId) {
      navigate(`/sessions/${templateId}`)
      return
    }

    navigate('/dashboard')
  }

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-stone-100">
      <aside className="flex min-h-full w-52 shrink-0 flex-col border-r border-zinc-300 bg-zinc-50 px-3 py-6">
        <p className="mb-4 px-2 text-[10px] uppercase tracking-widest text-zinc-400">
          Navegacion
        </p>
        <nav className="flex flex-col gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('result')}
            className={`w-full rounded-md px-4 py-2.5 text-left text-sm font-medium transition ${
              activeTab === 'result'
                ? 'bg-emerald-400 text-white shadow-sm'
                : 'border border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-100'
            }`}
          >
            Resultado
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('questions')}
            className={`w-full rounded-md px-4 py-2.5 text-left text-sm font-medium transition ${
              activeTab === 'questions'
                ? 'bg-emerald-400 text-white shadow-sm'
                : 'border border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-100'
            }`}
          >
            Preguntas
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

      <main className="flex flex-1 flex-col overflow-hidden">
        <div className="flex flex-1 flex-col overflow-y-auto p-5 sm:p-7">
          <header className="mb-6 border-b border-zinc-200 pb-5">
            <p className="text-xs uppercase tracking-widest text-zinc-500">
              {activeTab === 'result'
                ? 'Resultado final'
                : activeTab === 'questions'
                  ? 'Resumen de preguntas'
                  : 'Revision de desempeno'}
            </p>
            <h1 className="mt-2 font-serif text-4xl font-normal tracking-[-0.02em] text-zinc-900 sm:text-5xl">
              {activeTab === 'result' ? 'Resultado' : activeTab === 'questions' ? 'Preguntas' : 'Feedback'}
            </h1>
          </header>

          {errorMessage && (
            <p className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {errorMessage}
            </p>
          )}

          {activeTab === 'result' && (
            <section className="flex flex-1 flex-col rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
              <div className="mb-6 border-b border-zinc-100 pb-4">
                <p className="font-serif text-lg text-zinc-800">{templateLabel}</p>
                <div className="mt-1 flex items-center gap-2 text-sm text-zinc-500">
                  {isLoading ? (
                    'Cargando resultado...'
                  ) : displayReview ? (
                    <>
                      Calificacion:&nbsp;
                      <ScoreBadge score={displayReview.totalScore} max={100} />
                    </>
                  ) : (
                    'Resultado no disponible aun'
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <article className="rounded-lg border border-zinc-200 bg-stone-50 px-4 py-3">
                  <p className="text-xs uppercase tracking-widest text-zinc-400">Preguntas</p>
                  <p className="mt-1 text-xl font-medium text-zinc-900">{totalQuestions}</p>
                </article>
                <article className="rounded-lg border border-zinc-200 bg-stone-50 px-4 py-3">
                  <p className="text-xs uppercase tracking-widest text-zinc-400">Respondidas</p>
                  <p className="mt-1 text-xl font-medium text-zinc-900">{answeredCount}</p>
                </article>
                <article className="rounded-lg border border-zinc-200 bg-stone-50 px-4 py-3">
                  <p className="text-xs uppercase tracking-widest text-zinc-400">Estado</p>
                  <p className="mt-1 text-xl font-medium text-zinc-900">
                    {displayReview?.status ?? (mode === 'study' ? 'PENDING_REVIEW' : result?.status ?? 'PENDING')}
                  </p>
                </article>
              </div>

              <div className="mt-6 rounded-lg border border-zinc-200 bg-stone-50 p-4">
                <p className="mb-1 text-xs uppercase tracking-widest text-zinc-400">Resumen</p>
                <p className="text-sm leading-relaxed text-zinc-700">
                  {displayReview?.generalFeedback || 'Aun no hay resumen generado para esta sesion.'}
                </p>
              </div>
            </section>
          )}

          {activeTab === 'questions' && (
            <section className="flex flex-1 flex-col rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
              <div className="mb-4 border-b border-zinc-100 pb-4">
                <p className="font-serif text-lg text-zinc-800">{templateLabel}</p>
                <p className="mt-1 text-sm text-zinc-500">Preguntas de la sesion y estado de respuesta</p>
              </div>

              {isLoading ? (
                <p className="text-sm text-zinc-600">Cargando preguntas...</p>
              ) : questions.length === 0 ? (
                <p className="text-sm text-zinc-600">No hay preguntas disponibles para esta sesion.</p>
              ) : (
                <ul className="space-y-3">
                  {questions.map((question, index) => {
                    const isAnswered = Boolean(question.answer?.trim())
                    return (
                      <li
                        key={question.id}
                        className="flex items-start gap-3 rounded-lg border border-zinc-100 bg-stone-50 px-4 py-3"
                      >
                        <span className="mt-0.5 shrink-0 text-xs font-medium text-zinc-400">
                          {index + 1}.
                        </span>
                        <span className="flex-1 text-sm text-zinc-800">{question.text}</span>
                        <span
                          className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium ${
                            isAnswered
                              ? 'border border-emerald-200 bg-emerald-50 text-emerald-700'
                              : 'border border-zinc-200 bg-zinc-100 text-zinc-700'
                          }`}
                        >
                          {isAnswered ? 'Respondida' : 'Sin responder'}
                        </span>
                      </li>
                    )
                  })}
                </ul>
              )}
            </section>
          )}

          {activeTab === 'feedback' && (
            <section className="flex flex-1 flex-col rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
              <div className="mb-4 border-b border-zinc-100 pb-4">
                <p className="font-serif text-lg text-zinc-800">{templateLabel}</p>
                <p className="mt-1 text-sm text-zinc-500">
                  El feedback y el resultado se generan automaticamente al abrir esta pantalla.
                </p>
              </div>

              {isLoading ? (
                <p className="text-sm text-zinc-600">Generando feedback...</p>
              ) : displayReview ? (
                <div className="space-y-4">
                  <article className="rounded-lg border border-zinc-200 bg-stone-50 p-4">
                    <p className="mb-1 text-xs uppercase tracking-widest text-zinc-400">Feedback general</p>
                    <p className="text-sm leading-relaxed text-zinc-700">{displayReview.generalFeedback}</p>
                  </article>

                  <article className="rounded-lg border border-zinc-200 bg-stone-50 p-4">
                    <p className="mb-1 text-xs uppercase tracking-widest text-zinc-400">Fortalezas</p>
                    <p className="text-sm leading-relaxed text-zinc-700">{displayReview.strengths}</p>
                  </article>

                  <article className="rounded-lg border border-zinc-200 bg-stone-50 p-4">
                    <p className="mb-1 text-xs uppercase tracking-widest text-zinc-400">Puntos a mejorar</p>
                    <p className="text-sm leading-relaxed text-zinc-700">{displayReview.weaknesses}</p>
                  </article>
                </div>
              ) : (
                <p className="text-sm text-zinc-600">No hay feedback disponible para esta sesion.</p>
              )}
            </section>
          )}
        </div>

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

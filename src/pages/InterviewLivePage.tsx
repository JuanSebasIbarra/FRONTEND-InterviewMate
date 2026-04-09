import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  finishInterviewSession,
  loadInterviewSessionData,
  submitQuestionAnswer,
} from '../controllers/interviewSessionController'
import type { InterviewQuestion, InterviewSession } from '../models/interview'

type TranscriptEntry = {
  id: number
  text: string
}

type ExitMode = 'cancel' | 'stop'

type SpeechRecognitionResultLike = {
  isFinal: boolean
  0: {
    transcript: string
  }
}

type SpeechRecognitionEventLike = {
  resultIndex: number
  results: {
    [index: number]: SpeechRecognitionResultLike
    length: number
  }
}

type SpeechRecognitionInstanceLike = {
  continuous: boolean
  interimResults: boolean
  lang: string
  onresult: ((event: SpeechRecognitionEventLike) => void) | null
  onerror: (() => void) | null
  onend: (() => void) | null
  start: () => void
  stop: () => void
}

type SpeechRecognitionConstructorLike = new () => SpeechRecognitionInstanceLike

declare global {
  interface Window {
    SpeechRecognition?: SpeechRecognitionConstructorLike
    webkitSpeechRecognition?: SpeechRecognitionConstructorLike
  }
}

const FALLBACK_QUESTIONS = [
  'If Sasuke escapes from Konoha again what will you do?',
  'Cuentame sobre un desafio tecnico dificil y como lo resolviste.',
  'Como reaccionas cuando recibes feedback duro sobre tu trabajo?',
]

function InterviewerAvatar() {
  return (
    <div className="mx-auto flex h-40 w-40 items-center justify-center rounded-full border border-zinc-700 bg-stone-50">
      <svg
        viewBox="0 0 180 180"
        aria-hidden="true"
        className="h-32 w-32 text-zinc-800"
        fill="none"
        stroke="currentColor"
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx="90" cy="52" r="24" />
        <path d="M53 128c3-26 18-44 37-44s34 18 37 44" />
        <path d="M90 90 72 108l18 18 18-18-18-18Z" />
        <path d="M90 126v20" />
      </svg>
    </div>
  )
}

function InterviewLivePage() {
  const navigate = useNavigate()
  const { sessionId } = useParams<{ sessionId: string }>()
  const recognitionRef = useRef<SpeechRecognitionInstanceLike | null>(null)

  const [session, setSession] = useState<InterviewSession | null>(null)
  const [questions, setQuestions] = useState<InterviewQuestion[]>([])
  const [fallbackQuestionIndex, setFallbackQuestionIndex] = useState(0)
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [answersByQuestion, setAnswersByQuestion] = useState<Record<string, TranscriptEntry[]>>({})
  const [typedAnswersByQuestion, setTypedAnswersByQuestion] = useState<Record<string, string>>({})
  const [answeredQuestionIds, setAnsweredQuestionIds] = useState<string[]>([])
  const [isRecording, setIsRecording] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isSavingAnswer, setIsSavingAnswer] = useState(false)
  const [isFinishingSession, setIsFinishingSession] = useState(false)
  const [isExitModalOpen, setIsExitModalOpen] = useState(false)
  const [exitMode, setExitMode] = useState<ExitMode>('cancel')
  const [errorMessage, setErrorMessage] = useState('')

  const speechRecognitionSupported = Boolean(
    window.SpeechRecognition || window.webkitSpeechRecognition,
  )

  useEffect(() => {
    if (!sessionId) {
      setErrorMessage('No se encontro el identificador de la sesion.')
      setIsLoading(false)
      return
    }

    let mounted = true

    const loadData = async () => {
      setIsLoading(true)
      setErrorMessage('')

      try {
        const data = await loadInterviewSessionData(sessionId)
        if (!mounted) return

        const sortedQuestions = [...(data.questions ?? [])].sort(
          (a, b) => a.orderIndex - b.orderIndex,
        )

        setSession(data.session)
        setQuestions(sortedQuestions)
        setTypedAnswersByQuestion(
          sortedQuestions.reduce<Record<string, string>>((acc, question) => {
            acc[question.id] = question.answer ?? ''
            return acc
          }, {}),
        )
        setAnsweredQuestionIds(
          sortedQuestions
            .filter((question) => Boolean(question.answer?.trim()))
            .map((question) => question.id),
        )
      } catch (error) {
        if (!mounted) return

        const message =
          error instanceof Error
            ? error.message
            : 'No se pudo cargar la sesion de entrevista.'
        setErrorMessage(message)
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

  useEffect(() => {
    return () => {
      recognitionRef.current?.stop()
    }
  }, [])

  useEffect(() => {
    if (typeof window === 'undefined') return

    const handlePopState = () => {
      window.history.pushState(null, '', window.location.href)
    }

    window.history.pushState(null, '', window.location.href)
    window.addEventListener('popstate', handlePopState)

    return () => {
      window.removeEventListener('popstate', handlePopState)
    }
  }, [])

  const fallbackQuestion = FALLBACK_QUESTIONS[fallbackQuestionIndex] ?? FALLBACK_QUESTIONS[0]
  const hasBackendQuestions = questions.length > 0
  const questionKey = hasBackendQuestions
    ? questions[currentQuestionIndex]?.id ?? `q-${currentQuestionIndex}`
    : `fallback-${fallbackQuestionIndex}`
  const currentQuestionText = hasBackendQuestions
    ? questions[currentQuestionIndex]?.question ?? ''
    : fallbackQuestion
  const currentEntries = answersByQuestion[questionKey] ?? []
  const currentTypedAnswer = typedAnswersByQuestion[questionKey] ?? ''

  const hasAnyAnswerInCurrentQuestion = useMemo(
    () =>
      currentEntries.some((entry) => entry.text.trim().length > 0) ||
      currentTypedAnswer.trim().length > 0,
    [currentEntries, currentTypedAnswer],
  )

  const stopRecording = () => {
    recognitionRef.current?.stop()
    setIsRecording(false)
  }

  const startRecording = () => {
    if (!speechRecognitionSupported) {
      setErrorMessage('Tu navegador no soporta transcripcion de voz en tiempo real.')
      return
    }

    const SpeechRecognitionApi =
      (window.SpeechRecognition || window.webkitSpeechRecognition) as
      | SpeechRecognitionConstructorLike
      | undefined

    if (!SpeechRecognitionApi) {
      setErrorMessage('No se pudo inicializar el reconocimiento de voz.')
      return
    }

    setErrorMessage('')

    const entryId = Date.now()
    setAnswersByQuestion((prev) => ({
      ...prev,
      [questionKey]: [...(prev[questionKey] ?? []), { id: entryId, text: '' }],
    }))

    const recognition = new SpeechRecognitionApi()
    recognition.lang = 'es-ES'
    recognition.continuous = true
    recognition.interimResults = true

    recognition.onresult = (event) => {
      let transcript = ''

      for (let index = event.resultIndex; index < event.results.length; index += 1) {
        const result = event.results[index]
        transcript += result[0].transcript
      }

      const normalizedTranscript = transcript.trim()

      setAnswersByQuestion((prev) => ({
        ...prev,
        [questionKey]: (prev[questionKey] ?? []).map((entry) =>
          entry.id === entryId ? { ...entry, text: normalizedTranscript } : entry,
        ),
      }))
    }

    recognition.onerror = () => {
      setErrorMessage('No se pudo procesar el audio. Verifica permisos del microfono.')
      setIsRecording(false)
    }

    recognition.onend = () => {
      setIsRecording(false)
    }

    recognitionRef.current = recognition

    try {
      recognition.start()
      setIsRecording(true)
    } catch {
      setErrorMessage('No se pudo iniciar la transcripcion.')
      setIsRecording(false)
    }
  }

  const toggleRecording = () => {
    if (isRecording) {
      stopRecording()
      return
    }

    startRecording()
  }

  const persistCurrentAnswerIfNeeded = async () => {
    if (!hasBackendQuestions) return { ok: true, answeredQuestionId: null as string | null }

    const currentQuestion = questions[currentQuestionIndex]
    if (!currentQuestion) return { ok: true, answeredQuestionId: null as string | null }

    const typedAnswer = (typedAnswersByQuestion[currentQuestion.id] ?? '').trim()

    const transcriptAnswer = (answersByQuestion[currentQuestion.id] ?? [])
      .map((entry) => entry.text.trim())
      .filter(Boolean)
      .join(' ')
      .trim()

    const answer = typedAnswer || transcriptAnswer

    if (!answer) return { ok: true, answeredQuestionId: null as string | null }

    setIsSavingAnswer(true)
    try {
      await submitQuestionAnswer(currentQuestion.id, answer)
      setAnsweredQuestionIds((prev) => {
        if (prev.includes(currentQuestion.id)) return prev
        return [...prev, currentQuestion.id]
      })
      return { ok: true, answeredQuestionId: currentQuestion.id }
    } catch {
      setErrorMessage('No se pudo guardar la respuesta. Puedes intentarlo nuevamente.')
      return { ok: false, answeredQuestionId: null as string | null }
    } finally {
      setIsSavingAnswer(false)
    }
  }

  const goToNextQuestion = async () => {
    if (isRecording) {
      stopRecording()
    }

    const persistResult = await persistCurrentAnswerIfNeeded()
    if (!persistResult.ok) return

    if (hasBackendQuestions) {
      const isLastQuestion = currentQuestionIndex >= questions.length - 1
      if (isLastQuestion) {
        const answeredCount = answeredQuestionIds.includes(persistResult.answeredQuestionId ?? '')
          ? answeredQuestionIds.length
          : answeredQuestionIds.length + (persistResult.answeredQuestionId ? 1 : 0)

        if (answeredCount < 1) {
          setErrorMessage('Debes responder al menos 1 pregunta antes de finalizar la sesion.')
          return
        }

        if (!sessionId) {
          navigate('/dashboard', { replace: true })
          return
        }

        setIsFinishingSession(true)
        try {
          await finishInterviewSession(sessionId)
        } catch {
          setErrorMessage('No se pudo cerrar la sesion correctamente.')
        } finally {
          setIsFinishingSession(false)
          navigate(`/sessions/${sessionId}/results`, { replace: true })
        }
        return
      }

      setCurrentQuestionIndex((prev) => prev + 1)
      return
    }

    const isLastFallbackQuestion = fallbackQuestionIndex >= FALLBACK_QUESTIONS.length - 1
    if (isLastFallbackQuestion) {
      if (sessionId) {
        navigate(`/sessions/${sessionId}/results`, { replace: true })
      } else {
        navigate('/dashboard', { replace: true })
      }
      return
    }

    setFallbackQuestionIndex((prev) => prev + 1)
  }

  const openExitModal = (mode: ExitMode) => {
    setExitMode(mode)
    setIsExitModalOpen(true)
  }

  const closeExitModal = () => {
    setIsExitModalOpen(false)
  }

  const confirmExitInterview = () => {
    if (isRecording) {
      stopRecording()
    }

    const templateId = session?.templateId
    if (templateId) {
      navigate(`/sessions/${templateId}`, { replace: true })
      return
    }

    navigate('/dashboard', { replace: true })
  }

  const nextButtonLabel = hasBackendQuestions && currentQuestionIndex >= questions.length - 1
    ? 'Finalizar'
    : 'Siguiente'

  return (
    <div className="h-screen w-screen overflow-hidden bg-stone-100 px-2 py-3 sm:px-4 sm:py-4">
      <div className="mx-auto flex h-full w-full max-w-6xl flex-col overflow-hidden rounded-md border border-zinc-300 bg-stone-50 px-3 py-4 shadow-sm sm:px-5 sm:py-5">
        <div className="mb-6 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => openExitModal('stop')}
            className="rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm font-medium text-zinc-900 transition hover:bg-zinc-100"
          >
            Detener entrevista
          </button>
        </div>

        {isLoading ? (
          <div className="flex min-h-0 flex-1 items-center justify-center rounded-md border border-dashed border-zinc-300 bg-white">
            <p className="text-sm text-zinc-600">Cargando entrevista...</p>
          </div>
        ) : (
          <div className="mx-auto flex min-h-0 w-full max-w-5xl flex-1 flex-col gap-5 overflow-hidden py-1">
            <InterviewerAvatar />

            <div className="rounded-md border border-zinc-300 bg-white px-4 py-5 sm:px-5">
              <p className="text-center font-serif text-2xl tracking-[-0.02em] text-zinc-900 sm:text-3xl">
                {currentQuestionText}
              </p>
            </div>

            <div className="flex min-h-0 flex-1 flex-col rounded-md border border-zinc-300 bg-white px-3 py-4 sm:px-4">
              <p className="mb-3 text-xs uppercase tracking-widest text-zinc-500">
                Tu transcripcion
              </p>

              {!hasAnyAnswerInCurrentQuestion && !isRecording && (
                <p className="text-sm text-zinc-500">
                  Presiona Responder y comienza a hablar para registrar tu respuesta.
                </p>
              )}

              <div className="min-h-0 flex-1 space-y-3 overflow-y-auto pr-1">
                {currentEntries.map((entry) => (
                  <p
                    key={entry.id}
                    className="rounded-md border border-zinc-200 bg-stone-50 px-3 py-3 text-sm leading-relaxed text-zinc-800"
                  >
                    {entry.text || 'Escuchando...'}
                  </p>
                ))}
              </div>
            </div>

            <div className="rounded-md border border-zinc-300 bg-white px-3 py-4 sm:px-4">
              <p className="mb-2 text-xs uppercase tracking-widest text-zinc-500">
                Respuesta por texto
              </p>
              <textarea
                value={currentTypedAnswer}
                onChange={(event) => {
                  const value = event.target.value
                  setTypedAnswersByQuestion((prev) => ({
                    ...prev,
                    [questionKey]: value,
                  }))
                }}
                rows={4}
                placeholder="Tambien puedes responder escribiendo aqui..."
                className="w-full rounded-md border border-zinc-300 bg-stone-50 px-3 py-2 text-sm text-zinc-800 outline-none transition focus:border-zinc-500"
              />
            </div>

            {errorMessage && (
              <p className="rounded-md border border-red-200 bg-red-50 px-3 py-3 text-sm text-red-700">
                {errorMessage}
              </p>
            )}

            {!speechRecognitionSupported && (
              <p className="rounded-md border border-amber-200 bg-amber-50 px-3 py-3 text-sm text-amber-700">
                Tu navegador no soporta transcripcion automatica. Intenta en Chrome o Edge.
              </p>
            )}

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <button
                type="button"
                onClick={toggleRecording}
                disabled={!speechRecognitionSupported || isLoading || isSavingAnswer || isFinishingSession}
                className={`rounded-md border px-5 py-2.5 text-base font-medium transition ${
                  isRecording
                    ? 'border-red-700 bg-red-600 text-white hover:bg-red-700'
                    : 'border-zinc-800 bg-white text-zinc-900 hover:bg-zinc-100'
                } disabled:cursor-not-allowed disabled:opacity-50`}
              >
                {isRecording ? 'Detener transcripcion' : 'Responder'}
              </button>

              <button
                type="button"
                onClick={goToNextQuestion}
                disabled={isLoading || isSavingAnswer || isFinishingSession}
                className="rounded-md border border-zinc-300 bg-white px-5 py-2.5 text-base font-medium text-zinc-900 transition hover:bg-zinc-100 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isSavingAnswer || isFinishingSession ? 'Guardando...' : nextButtonLabel}
              </button>
            </div>
          </div>
        )}
      </div>

      {isExitModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 px-4"
          onClick={closeExitModal}
        >
          <div
            className="w-full max-w-lg rounded-md border border-zinc-200 bg-white p-5 shadow-xl"
            onClick={(event) => event.stopPropagation()}
          >
            <p className="text-xs uppercase tracking-widest text-zinc-500">Confirmar salida</p>
            <h2 className="mt-2 font-serif text-3xl tracking-[-0.02em] text-zinc-900">
              {exitMode === 'stop' ? 'Detener entrevista' : 'Salir de entrevista'}
            </h2>
            <p className="mt-3 text-sm text-zinc-700">
              Si sales ahora se cancelara la entrevista y no habra feedback generado.
            </p>

            <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
              <button
                type="button"
                onClick={closeExitModal}
                className="rounded-md border border-zinc-300 bg-white px-4 py-2.5 text-sm font-medium text-zinc-700 transition hover:bg-zinc-100"
              >
                Continuar entrevista
              </button>
              <button
                type="button"
                onClick={confirmExitInterview}
                className="rounded-md bg-zinc-900 px-4 py-2.5 text-sm font-medium text-white transition hover:opacity-85"
              >
                Confirmar salida
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default InterviewLivePage

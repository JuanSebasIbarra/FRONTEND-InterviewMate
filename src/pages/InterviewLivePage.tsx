import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import AvatarScene from '../components/avatar/AvatarScene'
import type { AvatarState } from '../components/AvatarGLB'
import { readLocalSettings } from '../controllers/settingsController'
import {
  finishInterviewSession,
  loadInterviewSessionData,
  submitQuestionAnswer,
} from '../controllers/interviewSessionController'
import type { InterviewQuestion, InterviewSession } from '../models/interview'
import './InterviewLivePage.css'

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
  const [elapsedSeconds, setElapsedSeconds] = useState(0)
  const [isQuestionIntroActive, setIsQuestionIntroActive] = useState(true)
  const [userAvatarUrl, setUserAvatarUrl] = useState('')
  const [userDisplayName, setUserDisplayName] = useState('Candidato')

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
    const localSettings = readLocalSettings()
    setUserAvatarUrl(localSettings.avatarDataUrl)

    const displayName = [localSettings.firstName, localSettings.lastName]
      .filter(Boolean)
      .join(' ')
      .trim()

    setUserDisplayName(displayName || 'Candidato')
  }, [])

  useEffect(() => {
    if (!session?.startedAt) {
      setElapsedSeconds(0)
      return
    }

    const startTime = new Date(session.startedAt).getTime()

    const tick = () => {
      const diff = Math.max(0, Math.floor((Date.now() - startTime) / 1000))
      setElapsedSeconds(diff)
    }

    tick()
    const interval = window.setInterval(tick, 1000)

    return () => {
      window.clearInterval(interval)
    }
  }, [session?.startedAt])

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

  useEffect(() => {
    setIsQuestionIntroActive(true)
    const timeout = window.setTimeout(() => {
      setIsQuestionIntroActive(false)
    }, 2800)

    return () => {
      window.clearTimeout(timeout)
    }
  }, [questionKey])

  const avatarState: AvatarState = useMemo(() => {
    if (isSavingAnswer || isFinishingSession) return 'thinking'
    if (isRecording) return 'listening'
    if (isQuestionIntroActive) return 'talking'
    return 'idle'
  }, [isFinishingSession, isQuestionIntroActive, isRecording, isSavingAnswer])

  const callDurationLabel = useMemo(() => {
    const hours = Math.floor(elapsedSeconds / 3600)
    const minutes = Math.floor((elapsedSeconds % 3600) / 60)
    const seconds = elapsedSeconds % 60

    const hh = String(hours).padStart(2, '0')
    const mm = String(minutes).padStart(2, '0')
    const ss = String(seconds).padStart(2, '0')

    return `${hh}:${mm}:${ss}`
  }, [elapsedSeconds])

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
    <div className="teams-call-container">
      <header className="teams-top-bar">
        <div className="teams-top-left">
          <div className="teams-meeting-title">InterviewMate - Entrevista en progreso</div>
          <div className="teams-meeting-meta">Duracion {callDurationLabel}</div>
        </div>
      </header>

      <div className="teams-content-area">
        <section className="teams-main-stage">
          {isLoading ? (
            <div className="teams-loading-stage">
              <p>Cargando entrevista...</p>
            </div>
          ) : (
            <AvatarScene
              avatarState={avatarState}
              interviewerName="Entrevistador IA"
              modelUrl="/models/avatar_1776746364480.glb"
            />
          )}

          <div className="participant-label">Entrevistador IA</div>

          <div className="pip-self">
            {userAvatarUrl ? (
              <img src={userAvatarUrl} alt={userDisplayName} className="pip-profile-photo" />
            ) : (
              <div className="pip-placeholder">
                <span>{userDisplayName.charAt(0).toUpperCase()}</span>
                <small>{userDisplayName}</small>
              </div>
            )}
          </div>
        </section>

        <aside className="teams-side-panel">
          <section className="teams-card">
            <p className="teams-card-kicker">Pregunta actual</p>
            <p className="teams-question-text">{currentQuestionText}</p>
          </section>

          <section className="teams-card teams-card-scroll">
            <p className="teams-card-kicker">Transcripcion</p>
            {!hasAnyAnswerInCurrentQuestion && !isRecording && (
              <p className="teams-muted-text">
                Presiona Silenciar para iniciar la transcripcion de tu respuesta.
              </p>
            )}

            <div className="teams-transcript-list">
              {currentEntries.map((entry) => (
                <p key={entry.id} className="teams-transcript-item">
                  {entry.text || 'Escuchando...'}
                </p>
              ))}
            </div>
          </section>

          <section className="teams-card">
            <p className="teams-card-kicker">Respuesta por texto</p>
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
              className="teams-answer-input"
            />
          </section>

          {errorMessage && (
            <p className="teams-alert teams-alert-error">{errorMessage}</p>
          )}

          {!speechRecognitionSupported && (
            <p className="teams-alert teams-alert-warning">
              Tu navegador no soporta transcripcion automatica. Intenta en Chrome o Edge.
            </p>
          )}
        </aside>
      </div>

      <footer className="teams-bottom-bar">
        <div className="teams-bottom-actions">
          <button
            type="button"
            onClick={toggleRecording}
            disabled={!speechRecognitionSupported || isLoading || isSavingAnswer || isFinishingSession}
            className={`teams-action-btn ${isRecording ? 'teams-action-btn-accent' : ''}`}
          >
            {isRecording ? 'Detener respuesta' : 'Responder'}
          </button>
          <button
            type="button"
            onClick={goToNextQuestion}
            disabled={isLoading || isSavingAnswer || isFinishingSession}
            className="teams-action-btn teams-action-btn-primary"
          >
            {isSavingAnswer || isFinishingSession ? 'Guardando...' : nextButtonLabel}
          </button>
        </div>

        <button
          type="button"
          onClick={() => openExitModal('stop')}
          className="teams-hangup-btn"
        >
          Finalizar
        </button>
      </footer>

      {isExitModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 px-4"
          onClick={closeExitModal}
        >
          <div
            className="teams-exit-modal"
            onClick={(event) => event.stopPropagation()}
          >
            <p className="teams-card-kicker">Confirmar salida</p>
            <h2 className="teams-exit-title">
              {exitMode === 'stop' ? 'Detener entrevista' : 'Salir de entrevista'}
            </h2>
            <p className="teams-exit-text">
              Si sales ahora se cancelara la entrevista y no habra feedback generado.
            </p>

            <div className="teams-exit-actions">
              <button
                type="button"
                onClick={closeExitModal}
                className="teams-action-btn teams-action-btn-visual"
              >
                Continuar entrevista
              </button>
              <button
                type="button"
                onClick={confirmExitInterview}
                className="teams-hangup-btn"
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

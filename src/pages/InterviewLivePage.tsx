import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { AvatarScene } from '../components/avatar/AvatarScene'
import type { AvatarState } from '../components/AvatarGLB'
import { readLocalSettings } from '../controllers/settingsController'
import {
  loadInterviewSessionData,
  submitQuestionAnswer,
} from '../controllers/interviewSessionController'
import type { InterviewQuestion, InterviewSession } from '../models/interview'
import { useInterviewSession } from '../hooks/useInterviewSession'
import type { AnimacionEstado } from '../hooks/useInterviewSession'
import { useQuestionTTS } from '../hooks/useQuestionTTS'
import { getResultBySession } from '../services/resultService'

// Mapea el estado de animación de la IA al estado visual del avatar 3D
function toAvatarState(animacion: AnimacionEstado): AvatarState | null {
  if (animacion === 'celebrar') return 'celebrating'
  if (animacion === 'corregir') return 'correcting'
  if (animacion === 'pensar') return 'thinking'
  if (animacion === 'hablar' || animacion === 'animar') return 'talking'
  return null // 'idle' → liberar control al useMemo normal
}

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
  'Cuentame sobre un proyecto tecnico desafiante y como lo resolviste.',
  'Como reaccionas cuando recibes feedback critico sobre tu trabajo?',
  'Describe una situacion donde tuviste que aprender algo nuevo rapidamente.',
]

function MicrophoneIcon({ muted = false }: { muted?: boolean }) {
  return (
    <svg className="h-[21px] w-[21px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 14a3 3 0 0 0 3-3V7a3 3 0 1 0-6 0v4a3 3 0 0 0 3 3Z" />
      <path d="M19 11a7 7 0 0 1-12.3 4.6" />
      <path d="M5 11a7 7 0 0 0 11.6 5.3" />
      <path d="M12 18v3" />
      <path d="M9 21h6" />
      {muted ? <path d="M4 4l16 16" /> : null}
    </svg>
  )
}

function NextIcon() {
  return (
    <svg className="h-[21px] w-[21px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M5 12h12" />
      <path d="m13 6 6 6-6 6" />
    </svg>
  )
}

function TranscriptIcon() {
  return (
    <svg className="h-[21px] w-[21px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M4 5h16" />
      <path d="M4 10h16" />
      <path d="M4 15h10" />
      <path d="M4 20h8" />
    </svg>
  )
}

function HangupIcon() {
  return (
    <svg className="h-[21px] w-[21px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M4 15c4.5-4 11.5-4 16 0" />
      <path d="M6.5 14.5 5 20" />
      <path d="M17.5 14.5 19 20" />
    </svg>
  )
}

function InterviewLivePage() {
  const navigate = useNavigate()
  const { sessionId } = useParams<{ sessionId: string }>()
  const recognitionRef = useRef<SpeechRecognitionInstanceLike | null>(null)
  const answerInputRef = useRef<HTMLTextAreaElement | null>(null)
  // Evita autoplay bloqueado: la primera pregunta usa el timer, las siguientes usan TTS
  const isFirstQuestionRef = useRef(true)

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
  const [isGeneratingResult, setIsGeneratingResult] = useState(false)
  const [isExitModalOpen, setIsExitModalOpen] = useState(false)
  const [exitMode, setExitMode] = useState<ExitMode>('cancel')
  const [errorMessage, setErrorMessage] = useState('')
  const [elapsedSeconds, setElapsedSeconds] = useState(0)
  const [isQuestionIntroActive, setIsQuestionIntroActive] = useState(true)
  const [userAvatarUrl, setUserAvatarUrl] = useState('')
  const [userDisplayName, setUserDisplayName] = useState('Candidato')
  // Estado del avatar impulsado por la IA (null = dejar que el useMemo normal decida)
  const [aiAvatarOverride, setAiAvatarOverride] = useState<AvatarState | null>(null)

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
  const currentQuestionText = isLoading
    ? 'Preparando preguntas...'
    : hasBackendQuestions
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
    const currentQuestion = hasBackendQuestions ? questions[currentQuestionIndex] : null

    if (isFirstQuestionRef.current) {
      // Primera pregunta: sin autoplay (el navegador lo bloquea sin gesto del usuario)
      // Usar timer visual solamente; el TTS arranca desde la segunda pregunta
      isFirstQuestionRef.current = false
      setIsQuestionIntroActive(true)
      const timeout = window.setTimeout(() => { setIsQuestionIntroActive(false) }, 2800)
      return () => { window.clearTimeout(timeout) }
    }

    if (currentQuestion) {
      // Después del primer Next: intenta TTS del backend; si falla, lee el texto con Web Speech
      void playQuestionTTS(currentQuestion.id, currentQuestion.question)
    } else {
      // Preguntas de fallback local: timer fijo de 2800ms
      setIsQuestionIntroActive(true)
      const timeout = window.setTimeout(() => {
        setIsQuestionIntroActive(false)
      }, 2800)
      return () => { window.clearTimeout(timeout) }
    }

    return () => { stopTTS() }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [questionKey])

  const avatarState: AvatarState = useMemo(() => {
    // La IA toma prioridad sobre la lógica de sesión mientras habla el feedback
    if (aiAvatarOverride !== null) return aiAvatarOverride
    if (isSavingAnswer) return 'thinking'
    if (isRecording) return 'listening'
    if (isQuestionIntroActive) return 'talking'
    return 'idle'
  }, [aiAvatarOverride, isQuestionIntroActive, isRecording, isSavingAnswer])

  const callDurationLabel = useMemo(() => {
    const hours = Math.floor(elapsedSeconds / 3600)
    const minutes = Math.floor((elapsedSeconds % 3600) / 60)
    const seconds = elapsedSeconds % 60

    const hh = String(hours).padStart(2, '0')
    const mm = String(minutes).padStart(2, '0')
    const ss = String(seconds).padStart(2, '0')

    return `${hh}:${mm}:${ss}`
  }, [elapsedSeconds])

  const { evaluarRespuesta, isEvaluating } = useInterviewSession({
    // Activa el estado visual del avatar según la animación que indique la IA
    onAnimacion: (animacion) => { setAiAvatarOverride(toAvatarState(animacion)) },
    // Al terminar la locución, devolver el control al flujo normal
    onSpeakEnd: () => { setAiAvatarOverride(null) },
    onSpeakStart: () => {},
    onMouthPulse: () => {},
  })

  const { playQuestionTTS, stopTTS } = useQuestionTTS({
    // El avatar entra en 'talking' al empezar el audio de la pregunta
    onStart: () => { setIsQuestionIntroActive(true) },
    // Al terminar el audio, liberar el estado talking
    onEnd: () => { setIsQuestionIntroActive(false) },
  })

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
      const updatedQuestion = await submitQuestionAnswer(currentQuestion.id, answer)
      setAnsweredQuestionIds((prev) => {
        if (prev.includes(currentQuestion.id)) return prev
        return [...prev, currentQuestion.id]
      })
      void evaluarRespuesta(updatedQuestion.aiFeedback ?? '', updatedQuestion.score ?? 0)
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

        // Backend auto-completes the session and generates the result
        // when the last pending question is answered via submitQuestionAnswer.
        // Poll for the result before navigating to avoid showing an empty result page.
        setIsGeneratingResult(true)
        let attempts = 0
        const maxAttempts = 15 // 30 seconds total
        const pollInterval = window.setInterval(async () => {
          attempts += 1
          try {
            await getResultBySession(sessionId)
            window.clearInterval(pollInterval)
            setIsGeneratingResult(false)
            navigate(`/sessions/${sessionId}/results`, { replace: true })
          } catch {
            if (attempts >= maxAttempts) {
              window.clearInterval(pollInterval)
              setIsGeneratingResult(false)
              navigate(`/sessions/${sessionId}/results`, { replace: true })
            }
          }
        }, 2000)
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

  const focusAnswerInput = () => {
    answerInputRef.current?.focus()
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

  const cardClass = 'rounded-[10px] border border-[#33384b] bg-[linear-gradient(180deg,rgba(34,38,61,0.95),rgba(22,26,45,0.95))] p-3'
  const dockButtonClass = 'inline-flex h-[52px] w-[52px] items-center justify-center border-r border-white/8 bg-transparent text-[#f4f6fb] transition hover:bg-white/6 disabled:cursor-not-allowed disabled:opacity-50 max-[760px]:flex-1'

  return (
    <div className="flex h-screen flex-col text-[#f4f6fb] [background:radial-gradient(circle_at_top_left,rgba(224,123,57,0.12),transparent_28%),radial-gradient(circle_at_top_right,rgba(120,170,255,0.1),transparent_24%),#1a1a2e]">
      {isGeneratingResult && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#1a1a2e]/90 backdrop-blur-sm">
          <div className="flex flex-col items-center gap-4 text-center px-6">
            <div className="relative flex items-center justify-center">
              <div className="h-14 w-14 animate-spin rounded-full border-4 border-[#33384b] border-t-[#e07b39]" />
              <span className="absolute text-lg">✦</span>
            </div>
            <div>
              <p className="text-lg font-medium tracking-[0.01em]">Generando resultado final...</p>
              <p className="mt-1 text-[0.85rem] text-[#a8afc3]">La IA está evaluando tus respuestas y preparando el feedback.</p>
            </div>
          </div>
        </div>
      )}
      <header className="flex h-16 items-center border-b border-[#33384b] bg-[rgba(31,31,58,0.92)] px-4 backdrop-blur-md max-[760px]:h-auto max-[760px]:flex-col max-[760px]:items-start max-[760px]:gap-2 max-[760px]:px-3 max-[760px]:py-2.5">
        <div className="min-w-0">
          <div className="truncate font-bold tracking-[0.01em]">InterviewMate - Entrevista en progreso</div>
          <div className="text-[0.85rem] text-[#a8afc3]">Duracion {callDurationLabel}</div>
        </div>
      </header>

      <div className="grid min-h-0 flex-1 grid-cols-[minmax(0,1fr)_360px] gap-3.5 p-3.5 max-[1100px]:grid-cols-1 max-[1100px]:grid-rows-[minmax(0,1fr)_auto] max-[760px]:gap-2.5 max-[760px]:p-2.5">
        <section className="relative min-h-0 overflow-hidden rounded-xl border border-white/12 bg-[#0d1117]">
          {isLoading ? (
            <div className="grid h-full w-full place-items-center text-[#a8afc3]">
              <p>Cargando entrevista...</p>
            </div>
          ) : (
            <AvatarScene
              avatarState={avatarState}
              interviewerName="InterviewMate"
              modelUrl="/models/avatar_1776746364480.glb"
            />
          )}

          <div
            className="absolute bottom-4 right-4 z-[6] flex h-[120px] w-[180px] overflow-hidden rounded-[10px] border-2 border-white/30 bg-[#0a0a1a] max-[760px]:top-3 max-[760px]:bottom-auto max-[760px]:right-3 max-[760px]:h-[60px] max-[760px]:w-[90px]"
          >
            {userAvatarUrl ? (
              <img src={userAvatarUrl} alt={userDisplayName} className="block h-full w-full object-cover" />
            ) : (
              <div className="flex h-full w-full flex-col items-center justify-center gap-1 bg-[linear-gradient(140deg,rgba(93,126,188,0.3),rgba(14,16,33,0.95))] text-[#dbe1f5]">
                <span>{userDisplayName.charAt(0).toUpperCase()}</span>
                <small className="text-[0.72rem] text-[#bac2d8]">{userDisplayName}</small>
              </div>
            )}
          </div>
        </section>

        <aside className="grid min-h-0 grid-rows-[auto_minmax(0,1fr)_auto_auto] gap-2.5 max-[1100px]:grid-cols-2 max-[1100px]:grid-rows-2 max-[760px]:grid-cols-1">
          <section className={cardClass}>
            <p className="m-0 text-[0.72rem] uppercase tracking-[0.08em] text-[#a8afc3]">Pregunta actual</p>
            <p className="mt-1.5 text-base leading-[1.45]">{currentQuestionText}</p>
          </section>

          <section className={`${cardClass} flex min-h-0 flex-col max-[1100px]:min-h-[180px]`}>
            <p className="m-0 text-[0.72rem] uppercase tracking-[0.08em] text-[#a8afc3]">Transcripcion</p>
            {!hasAnyAnswerInCurrentQuestion && !isRecording && (
              <p className="mt-2 text-[0.9rem] text-[#a8afc3]">
                Presiona Silenciar para iniciar la transcripcion de tu respuesta.
              </p>
            )}

            <div className="mt-2.5 flex flex-col gap-2 overflow-y-auto">
              {currentEntries.map((entry) => (
                <p key={entry.id} className="m-0 rounded-lg border border-white/14 bg-[rgba(8,11,22,0.55)] px-2.5 py-[9px] text-[0.92rem] text-[#e6eaf8]">
                  {entry.text || 'Escuchando...'}
                </p>
              ))}
            </div>
          </section>

          <section className={cardClass}>
            <p className="m-0 text-[0.72rem] uppercase tracking-[0.08em] text-[#a8afc3]">Respuesta por texto</p>
            <textarea
              ref={answerInputRef}
              value={currentTypedAnswer}
              onChange={(event) => {
                const value = event.target.value
                setTypedAnswersByQuestion((prev) => ({
                  ...prev,
                  [questionKey]: value,
                }))
              }}
              onKeyDown={(event) => {
                if (event.key === 'Enter' && !event.shiftKey) {
                  event.preventDefault()
                  if (currentTypedAnswer.trim() && !isSavingAnswer && !isLoading) {
                    void goToNextQuestion()
                  }
                }
              }}
              rows={4}
              placeholder="Tambien puedes responder escribiendo aqui..."
              className="mt-2 w-full resize-y rounded-lg border border-white/20 bg-[#0d1222] p-2.5 text-[0.92rem] text-[#f4f6fb] outline-none transition focus:border-[rgba(224,123,57,0.75)] focus:shadow-[0_0_0_2px_rgba(224,123,57,0.2)]"
            />
            <div className="mt-2 flex items-center justify-between gap-2">
              <p className="text-[0.72rem] text-[#6b7a99]">Enter para enviar · Shift+Enter nueva l&iacute;nea</p>
              <button
                type="button"
                onClick={() => void goToNextQuestion()}
                disabled={isLoading || isSavingAnswer || isEvaluating}
                className="inline-flex shrink-0 items-center gap-1.5 rounded-lg bg-[#e07b39] px-3 py-1.5 text-[0.82rem] font-medium text-white transition hover:bg-[#d46f2f] disabled:cursor-not-allowed disabled:opacity-40"
              >
                {isSavingAnswer ? (
                  <>
                    <svg className="h-3.5 w-3.5 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="32" strokeDashoffset="12" />
                    </svg>
                    Guardando...
                  </>
                ) : nextButtonLabel}
              </button>
            </div>
          </section>

          {errorMessage && (
            <p className="m-0 rounded-lg border border-[rgba(241,109,109,0.6)] bg-[rgba(129,32,32,0.28)] px-2.5 py-[9px] text-[0.86rem] text-[#ffc3c3]">{errorMessage}</p>
          )}

          {!speechRecognitionSupported && (
            <p className="m-0 rounded-lg border border-[rgba(255,205,78,0.55)] bg-[rgba(125,98,21,0.28)] px-2.5 py-[9px] text-[0.86rem] text-[#ffebb2]">
              Tu navegador no soporta transcripcion automatica. Intenta en Chrome o Edge.
            </p>
          )}
        </aside>
      </div>

      <footer className="flex min-h-[88px] flex-col items-center justify-center gap-3.5 border-t border-[#33384b] bg-[rgba(31,31,58,0.94)] px-4 pb-3.5 pt-2.5 max-[760px]:min-h-0 max-[760px]:px-3 max-[760px]:py-2.5">
        <div className="flex flex-wrap items-center justify-center overflow-hidden rounded-[10px] border border-white/10 bg-[rgba(42,47,68,0.96)] shadow-[0_12px_30px_rgba(0,0,0,0.22)] max-[760px]:w-full max-[760px]:justify-stretch" role="toolbar" aria-label="Controles de entrevista">
          <div className="flex min-w-[86px] self-stretch items-center justify-center border-r border-white/8 bg-white/[0.03] px-4 text-base font-medium text-[#bfc7db] max-[760px]:min-h-11 max-[760px]:w-full max-[760px]:border-b max-[760px]:border-r-0" aria-label={`Duracion ${callDurationLabel}`}>
            {callDurationLabel}
          </div>

          <div className="flex items-stretch max-[760px]:w-[calc(100%-56px)] max-[760px]:flex-1">
            <button
              type="button"
              onClick={toggleRecording}
              disabled={!speechRecognitionSupported || isLoading || isSavingAnswer || isEvaluating}
              className={`${dockButtonClass} ${isRecording ? 'bg-[rgba(49,130,100,0.4)] text-[#dff8ea]' : ''}`}
              aria-label={isRecording ? 'Apagar microfono' : 'Encender microfono'}
              title={isRecording ? 'Apagar microfono' : 'Encender microfono'}
            >
              <MicrophoneIcon muted={!isRecording} />
            </button>

            <button
              type="button"
              onClick={goToNextQuestion}
              disabled={isLoading || isSavingAnswer || isEvaluating}
              className={dockButtonClass}
              aria-label={isSavingAnswer ? 'Guardando respuesta' : nextButtonLabel}
              title={isSavingAnswer ? 'Guardando respuesta' : nextButtonLabel}
            >
              <NextIcon />
            </button>

            <button
              type="button"
              onClick={focusAnswerInput}
              className={dockButtonClass}
              aria-label="Ir a respuesta por texto"
              title="Ir a respuesta por texto"
            >
              <TranscriptIcon />
            </button>
          </div>

          <button
            type="button"
            onClick={() => openExitModal('stop')}
            className="inline-flex h-[52px] w-14 items-center justify-center border-r-0 bg-[#b83343] text-white transition hover:bg-[#ca3d4e] disabled:cursor-not-allowed disabled:opacity-50"
            aria-label="Finalizar entrevista"
            title="Finalizar entrevista"
          >
            <HangupIcon />
          </button>
        </div>

        <div className="text-[0.78rem] text-[#a8afc3]" aria-live="polite">
          {isRecording
            ? 'Microfono activo con transcripcion'
            : isSavingAnswer
              ? 'Guardando respuesta...'
              : 'Controles de llamada listos'}
        </div>

      </footer>

      {isExitModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 px-4"
          onClick={closeExitModal}
        >
          <div
            className="w-[min(520px,95vw)] rounded-xl border border-white/14 bg-[#181d31] p-4 shadow-[0_22px_64px_rgba(0,0,0,0.45)]"
            onClick={(event) => event.stopPropagation()}
          >
            <p className="m-0 text-[0.72rem] uppercase tracking-[0.08em] text-[#a8afc3]">Confirmar salida</p>
            <h2 className="mt-2 text-[1.45rem]">
              {exitMode === 'stop' ? 'Detener entrevista' : 'Salir de entrevista'}
            </h2>
            <p className="mt-2 leading-[1.45] text-[#c3cae0]">
              Si sales ahora se cancelara la entrevista y no habra feedback generado.
            </p>

            <div className="mt-4 flex flex-wrap justify-end gap-2.5">
              <button
                type="button"
                onClick={closeExitModal}
                className="rounded-full border border-[#495067] bg-[#2a2f44] px-3.5 py-2.5 text-[0.88rem] text-[#f4f6fb] opacity-85 transition hover:-translate-y-px hover:border-[#69728f] disabled:cursor-not-allowed disabled:opacity-50"
              >
                Continuar entrevista
              </button>
              <button
                type="button"
                onClick={confirmExitInterview}
                className="rounded-full border border-[rgba(196,43,28,0.65)] bg-[#c42b1c] px-4 py-2.5 text-[0.9rem] text-white transition hover:brightness-105"
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

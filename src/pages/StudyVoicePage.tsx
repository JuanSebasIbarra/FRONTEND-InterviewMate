import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  loadStudySession,
  regenerateStudySessionQuestions,
  startInterviewFromStudy,
  startStudySession,
} from '../controllers/studyController'
import type { InterviewType } from '../models/interview'
import type { StudyDifficulty, StudyQuestion, StudyQuestionType, StudySession } from '../models/study'

type SpeechRecognitionAlternative = {
  transcript: string
}

type SpeechRecognitionResult = {
  isFinal: boolean
  length: number
  [index: number]: SpeechRecognitionAlternative
}

type SpeechRecognitionResultList = {
  length: number
  [index: number]: SpeechRecognitionResult
}

type SpeechRecognitionEvent = Event & {
  resultIndex: number
  results: SpeechRecognitionResultList
}

type SpeechRecognitionInstance = {
  continuous: boolean
  interimResults: boolean
  lang: string
  maxAlternatives: number
  onend: ((event: Event) => void) | null
  onerror: ((event: Event & { error?: string }) => void) | null
  onresult: ((event: SpeechRecognitionEvent) => void) | null
  onstart: ((event: Event) => void) | null
  start: () => void
  stop: () => void
  abort: () => void
}

type SpeechRecognitionConstructor = new () => SpeechRecognitionInstance

declare global {
  interface Window {
    SpeechRecognition?: SpeechRecognitionConstructor
    webkitSpeechRecognition?: SpeechRecognitionConstructor
  }
}

const difficultyLabel: Record<StudyDifficulty, string> = {
  BASIC: 'Básico',
  INTERMEDIATE: 'Intermedio',
  ADVANCED: 'Avanzado',
}

const questionTypeLabel: Record<StudyQuestionType, string> = {
  THEORETICAL: 'Teórica',
  PRACTICAL: 'Práctica',
}

const languageOptions = [
  { value: 'es-ES', label: 'Español' },
  { value: 'en-US', label: 'English' },
]

function StudyVoicePage() {
  const navigate = useNavigate()
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null)
  const [transcript, setTranscript] = useState('')
  const [interimTranscript, setInterimTranscript] = useState('')
  const [selectedLanguage, setSelectedLanguage] = useState('es-ES')
  const [studyIdToLoad, setStudyIdToLoad] = useState('')
  const [interviewType, setInterviewType] = useState<InterviewType>('TECHNICAL')
  const [session, setSession] = useState<StudySession | null>(null)
  const [loading, setLoading] = useState(false)
  const [startingInterview, setStartingInterview] = useState(false)
  const [listening, setListening] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const speechRecognitionCtor =
    typeof window !== 'undefined'
      ? window.SpeechRecognition ?? window.webkitSpeechRecognition ?? null
      : null

  const speechSupported = Boolean(speechRecognitionCtor)

  const groupedByDifficulty = useMemo(() => {
    const base: Record<StudyDifficulty, StudyQuestion[]> = {
      BASIC: [],
      INTERMEDIATE: [],
      ADVANCED: [],
    }

    for (const question of session?.questions ?? []) {
      base[question.difficulty].push(question)
    }

    return base
  }, [session])

  const finalTranscript = `${transcript} ${interimTranscript}`.trim()

  useEffect(() => {
    return () => {
      recognitionRef.current?.abort()
    }
  }, [])

  const resetMessages = () => {
    setError('')
    setSuccess('')
  }

  const buildRecognition = () => {
    if (!speechRecognitionCtor) {
      throw new Error('Tu navegador no soporta reconocimiento de voz en tiempo real.')
    }

    const recognition = new speechRecognitionCtor()
    recognition.continuous = true
    recognition.interimResults = true
    recognition.lang = selectedLanguage
    recognition.maxAlternatives = 1

    recognition.onstart = () => {
      setListening(true)
      setError('')
    }

    recognition.onend = () => {
      setListening(false)
      setInterimTranscript('')
    }

    recognition.onerror = (event) => {
      setListening(false)

      if (event.error === 'not-allowed') {
        setError('No se concedió permiso al micrófono. Habilítalo e inténtalo de nuevo.')
        return
      }

      if (event.error === 'no-speech') {
        setError('No detecté voz. Intenta hablar más cerca del micrófono.')
        return
      }

      setError('No fue posible procesar el audio del micrófono en este navegador.')
    }

    recognition.onresult = (event) => {
      let nextFinal = ''
      let nextInterim = ''

      for (let index = event.resultIndex; index < event.results.length; index += 1) {
        const result = event.results[index]
        const chunk = result[0]?.transcript ?? ''

        if (result.isFinal) {
          nextFinal += `${chunk} `
        } else {
          nextInterim += chunk
        }
      }

      if (nextFinal.trim()) {
        setTranscript((current) => `${current} ${nextFinal}`.trim())
      }

      setInterimTranscript(nextInterim.trim())
    }

    recognitionRef.current = recognition
    return recognition
  }

  const onToggleMic = () => {
    resetMessages()

    if (!speechSupported) {
      setError('Este navegador no soporta reconocimiento de voz. Puedes pegar o escribir el texto manualmente.')
      return
    }

    if (listening) {
      recognitionRef.current?.stop()
      return
    }

    const recognition = buildRecognition()
    recognition.start()
  }

  const onGenerateStudyMaterial = async () => {
    const normalizedTranscript = finalTranscript.trim()
    if (!normalizedTranscript) {
      setError('Habla unos segundos o escribe el contenido antes de generar material.')
      return
    }

    setLoading(true)
    resetMessages()

    try {
      const createdSession = await startStudySession({
        topic: normalizedTranscript,
        audioFile: '',
      })
      const generatedSession = await regenerateStudySessionQuestions(createdSession.id)
      setSession(generatedSession)
      setStudyIdToLoad(generatedSession.id)
      setSuccess('Material de estudio generado a partir de tu transcripción.')
    } catch (requestError) {
      setError((requestError as Error).message)
    } finally {
      setLoading(false)
    }
  }

  const onLoadStudy = async () => {
    const id = studyIdToLoad.trim()
    if (!id) return

    setLoading(true)
    resetMessages()
    try {
      const loaded = await loadStudySession(id)
      setSession(loaded)
      setSuccess('Sesión de estudio cargada correctamente.')
    } catch (requestError) {
      setError((requestError as Error).message)
    } finally {
      setLoading(false)
    }
  }

  const onStartInterview = async () => {
    if (!session) return

    setStartingInterview(true)
    resetMessages()
    try {
      const interview = await startInterviewFromStudy({
        topic: session.topic,
        interviewType,
      })
      navigate(`/dashboard/session/${interview.id}`)
    } catch (requestError) {
      setError((requestError as Error).message)
    } finally {
      setStartingInterview(false)
    }
  }

  return (
    <section className="study-page study-voice-page">
      <header className="card study-voice-hero">
        <div>
          <span className="study-voice-hero__badge">Study Voice Lab</span>
          <h2>Habla, transcribe y genera material de estudio</h2>
          <p className="small">
            Entrar a `study` ahora te lleva a esta experiencia. Tu voz se transforma a texto en el
            navegador y ese texto se envía al backend para construir el banco de preguntas.
          </p>
        </div>

        <div className="study-voice-hero__status">
          <span className={`study-status-pill ${speechSupported ? 'is-ready' : 'is-muted'}`}>
            {speechSupported ? 'Micrófono disponible' : 'Sin SpeechRecognition'}
          </span>
          <span className={`study-status-pill ${listening ? 'is-live' : 'is-idle'}`}>
            {listening ? 'Escuchando ahora' : 'Micrófono inactivo'}
          </span>
        </div>
      </header>

      <div className="study-grid study-voice-grid">
        <article className="card study-voice-panel">
          <h3>1) Dictado por voz</h3>
          <p className="small">
            Cuéntale a la IA qué tema quieres estudiar, qué dudas tienes o qué conceptos quieres
            reforzar.
          </p>

          <div className="stack">
            <label>
              Idioma de dictado
              <select
                value={selectedLanguage}
                onChange={(event) => setSelectedLanguage(event.target.value)}
                disabled={listening}
              >
                {languageOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>

            <div className="study-mic-card">
              <button
                type="button"
                className={`study-mic-button ${listening ? 'is-live' : ''}`}
                onClick={onToggleMic}
              >
                <span className="study-mic-button__icon">🎙️</span>
                <span>{listening ? 'Detener micrófono' : 'Abrir micrófono'}</span>
              </button>
              <p className="small">
                {listening
                  ? 'Te estoy escuchando. Habla con naturalidad y detén el micrófono al terminar.'
                  : 'Puedes iniciar varias veces para seguir ampliando la transcripción.'}
              </p>
            </div>

            <label>
              Transcripción editable
              <textarea
                rows={10}
                value={finalTranscript}
                onChange={(event) => {
                  setTranscript(event.target.value)
                  setInterimTranscript('')
                }}
                placeholder="Ej. Quiero estudiar React hooks, renderizado, memoización y casos de entrevistas técnicas..."
              />
            </label>

            <div className="page-actions">
              <button type="button" onClick={onGenerateStudyMaterial} disabled={loading}>
                {loading ? 'Generando material...' : 'Generar material de estudio'}
              </button>
              <button
                type="button"
                className="study-secondary-button"
                onClick={() => {
                  recognitionRef.current?.abort()
                  setListening(false)
                  setTranscript('')
                  setInterimTranscript('')
                  resetMessages()
                }}
              >
                Limpiar texto
              </button>
            </div>
          </div>
        </article>

        <article className="card">
          <h3>2) Estado de generación</h3>
          <div className="stack">
            <div className="study-insight-box">
              <strong>Texto listo para enviar</strong>
              <p>{finalTranscript || 'Aún no hay transcripción disponible.'}</p>
            </div>

            <div className="study-insight-box">
              <strong>Cómo se integra hoy con backend</strong>
              <p>
                El backend actual recibe `topic` y genera preguntas con `/study/start` +
                `/study/generate-questions`. No expone todavía un endpoint de transcripción de
                audio.
              </p>
            </div>

            <hr className="study-divider" />

            <h3>3) Cargar sesión existente</h3>
            <div className="row">
              <input
                value={studyIdToLoad}
                onChange={(event) => setStudyIdToLoad(event.target.value)}
                placeholder="Pega el studySessionId"
              />
              <button type="button" onClick={onLoadStudy} disabled={loading || !studyIdToLoad.trim()}>
                Cargar
              </button>
            </div>

            {error && <p className="alert error">{error}</p>}
            {success && <p className="alert success">{success}</p>}
          </div>
        </article>
      </div>

      {session && (
        <section className="card study-session-summary">
          <h3>Material generado</h3>
          <div className="study-session-summary__grid">
            <div className="study-insight-box">
              <strong>Study ID</strong>
              <p>{session.id}</p>
            </div>
            <div className="study-insight-box">
              <strong>Tema detectado</strong>
              <p>{session.topic}</p>
            </div>
            <div className="study-insight-box">
              <strong>Total de preguntas</strong>
              <p>{session.questions.length}</p>
            </div>
          </div>
        </section>
      )}

      {session && session.questions.length > 0 && (
        <section className="card">
          <h3>Banco de preguntas de estudio</h3>
          <div className="study-difficulty-grid">
            {(Object.keys(groupedByDifficulty) as StudyDifficulty[]).map((difficulty) => (
              <article key={difficulty} className="study-difficulty-card">
                <h4>
                  {difficultyLabel[difficulty]} ({groupedByDifficulty[difficulty].length})
                </h4>
                {groupedByDifficulty[difficulty].length === 0 ? (
                  <p className="small">Sin preguntas en este nivel.</p>
                ) : (
                  <ul className="session-question-list">
                    {groupedByDifficulty[difficulty].map((question) => (
                      <li key={question.id} className="session-question-item">
                        <p>
                          <strong>#{question.orderIndex}</strong> {question.questionText}
                        </p>
                        <span className="study-badge">{questionTypeLabel[question.type]}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </article>
            ))}
          </div>

          <div className="study-interview-cta">
            <label>
              Tipo de entrevista
              <select
                value={interviewType}
                onChange={(event) => setInterviewType(event.target.value as InterviewType)}
              >
                <option value="TECHNICAL">TECHNICAL</option>
                <option value="HR">HR</option>
                <option value="PSYCHOLOGICAL">PSYCHOLOGICAL</option>
              </select>
            </label>

            <button type="button" onClick={onStartInterview} disabled={startingInterview}>
              {startingInterview ? 'Iniciando entrevista...' : 'Iniciar entrevista desde estudio'}
            </button>
          </div>
        </section>
      )}
    </section>
  )
}

export default StudyVoicePage
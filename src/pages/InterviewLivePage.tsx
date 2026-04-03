import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  loadInterviewSessionData,
  submitQuestionAnswer,
  type InterviewSessionData,
} from '../controllers/interviewSessionController'

type SpeechRecognitionAlternative = { transcript: string }
type SpeechRecognitionResult = { isFinal: boolean; length: number; [index: number]: SpeechRecognitionAlternative }
type SpeechRecognitionResultList = { length: number; [index: number]: SpeechRecognitionResult }
type SpeechRecognitionEvent = Event & { resultIndex: number; results: SpeechRecognitionResultList }
type SpeechRecognitionInstance = {
  continuous: boolean; interimResults: boolean; lang: string; maxAlternatives: number
  onend: ((event: Event) => void) | null
  onerror: ((event: Event & { error?: string }) => void) | null
  onresult: ((event: SpeechRecognitionEvent) => void) | null
  onstart: ((event: Event) => void) | null
  start: () => void; stop: () => void; abort: () => void
}
type SpeechRecognitionConstructor = new () => SpeechRecognitionInstance

declare global {
  interface Window {
    SpeechRecognition?: SpeechRecognitionConstructor
    webkitSpeechRecognition?: SpeechRecognitionConstructor
  }
}

function InterviewLivePage() {
  const { sessionId } = useParams<{ sessionId: string }>()
  const navigate = useNavigate()
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null)
  const listeningRef = useRef(false)
  const animationRef = useRef<number | null>(null)
  
  const [data, setData] = useState<InterviewSessionData | null>(null)
  const [loading, setLoading] = useState(true)
  const [listening, setListening] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [mouthOffset, setMouthOffset] = useState(0)
  const [eyeScale, setEyeScale] = useState(1)
  const [callTime, setCallTime] = useState(0)
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [submitting, setSubmitting] = useState(false)

  const speechRecognitionCtor =
    typeof window !== 'undefined'
      ? (window.SpeechRecognition ?? window.webkitSpeechRecognition ?? null)
      : null

  const pendingQuestions = useMemo(
    () => data?.questions.filter((q) => !q.answer?.trim()) ?? [],
    [data]
  )

  const currentQuestion = pendingQuestions[currentQuestionIndex]

  const loadSession = async () => {
    if (!sessionId) return
    setLoading(true)
    try {
      const sessionData = await loadInterviewSessionData(sessionId)
      setData(sessionData)
    } catch (error) {
      console.error('Error loading session:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!sessionId) return
    void loadSession()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionId])

  useEffect(() => {
    const timer = setInterval(() => setCallTime((t) => t + 1), 1000)
    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    const blink = () => {
      setEyeScale(0.1)
      setTimeout(() => setEyeScale(1), 150)
    }
    const blinkInterval = setInterval(blink, 3000 + Math.random() * 2000)
    return () => clearInterval(blinkInterval)
  }, [])

  useEffect(() => {
    if (listening) {
      const animate = () => {
        setMouthOffset(Math.sin(Date.now() / 200) * 3)
        animationRef.current = requestAnimationFrame(animate)
      }
      animate()
    } else {
      if (animationRef.current) cancelAnimationFrame(animationRef.current)
      setMouthOffset(0)
    }
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current)
    }
  }, [listening])

  useEffect(() => () => {
    listeningRef.current = false
    recognitionRef.current?.abort()
  }, [])

  const createAndStart = (lang: string) => {
    if (!speechRecognitionCtor) return
    const r = new speechRecognitionCtor()
    r.continuous = true
    r.interimResults = true
    r.lang = lang
    r.maxAlternatives = 1

    r.onstart = () => setListening(true)
    r.onend = () => {
      if (listeningRef.current) {
        createAndStart(lang)
      } else {
        setListening(false)
      }
    }
    r.onerror = () => {
      // Ignore transient errors
    }
    r.onresult = (event) => {
      let final = ''
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i]
        const chunk = result[0]?.transcript ?? ''
        if (result.isFinal) final += `${chunk} `
      }
      if (final.trim()) setTranscript((prev) => `${prev} ${final}`.trim())
    }

    recognitionRef.current = r
    r.start()
  }

  const onToggleMic = () => {
    if (!speechRecognitionCtor) {
      alert('Tu navegador no soporta reconocimiento de voz')
      return
    }
    if (listening) {
      listeningRef.current = false
      recognitionRef.current?.stop()
    } else {
      listeningRef.current = true
      createAndStart('es-ES')
    }
  }

  const onEndCall = () => {
    listeningRef.current = false
    recognitionRef.current?.abort()
    navigate(`/dashboard/session/${sessionId}`)
  }

  const onSubmitAnswer = async () => {
    if (!currentQuestion || !transcript.trim() || !sessionId) return
    setSubmitting(true)
    try {
      await submitQuestionAnswer(currentQuestion.id, transcript.trim())
      await loadSession()
      setTranscript('')
      if (currentQuestionIndex < pendingQuestions.length - 1) {
        setCurrentQuestionIndex((i) => i + 1)
      } else {
        navigate(`/dashboard/session/${sessionId}`)
      }
    } catch (error) {
      console.error('Error submitting answer:', error)
    } finally {
      setSubmitting(false)
    }
  }

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60)
    const s = seconds % 60
    return `${m}:${s.toString().padStart(2, '0')}`
  }

  if (loading) {
    return (
      <div className="il-root">
        <div className="il-container">
          <div style={{ color: '#fff', fontSize: '14px' }}>Cargando entrevista...</div>
        </div>
      </div>
    )
  }

  if (!data || !currentQuestion) {
    return (
      <div className="il-root">
        <div className="il-container">
          <div style={{ color: '#fff', fontSize: '14px' }}>No hay preguntas disponibles</div>
          <button
            onClick={() => navigate('/dashboard')}
            style={{
              background: '#fff',
              border: 'none',
              padding: '10px 20px',
              borderRadius: '8px',
              cursor: 'pointer',
            }}
          >
            Volver al dashboard
          </button>
        </div>
      </div>
    )
  }

  return (
    <>
      <style>{`
        .il * { box-sizing: border-box; margin: 0; padding: 0; }

        .il-root {
          font-family: 'DM Sans', sans-serif;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 2rem;
        }

        .il-container {
          max-width: 500px;
          width: 100%;
          display: flex;
          flex-direction: column;
          gap: 2rem;
          align-items: center;
        }

        /* Timer */
        .il-timer {
          background: rgba(255, 255, 255, 0.25);
          backdrop-filter: blur(12px);
          border-radius: 999px;
          padding: 8px 20px;
          font-size: 14px;
          color: #fff;
          font-weight: 500;
          letter-spacing: 0.05em;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .il-timer-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #ef4444;
          animation: il-pulse 2s ease-in-out infinite;
        }
        @keyframes il-pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }

        /* Avatar card */
        .il-avatar-card {
          background: #fff;
          border-radius: 24px;
          padding: 2.5rem 2rem;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1.5rem;
          width: 100%;
        }

        /* Avatar SVG */
        .il-avatar {
          width: 160px;
          height: 160px;
          filter: drop-shadow(0 8px 16px rgba(0, 0, 0, 0.1));
        }

        /* Question */
        .il-question {
          background: #f9f9f8;
          border-radius: 12px;
          padding: 1rem 1.25rem;
          font-size: 14px;
          line-height: 1.6;
          color: #333;
          text-align: center;
          border: 0.5px solid #e5e5e5;
          font-weight: 400;
          min-height: 80px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        /* Progress indicator */
        .il-progress {
          font-size: 11px;
          color: rgba(255, 255, 255, 0.7);
          font-weight: 400;
        }

        /* Transcript preview */
        .il-transcript {
          width: 100%;
          background: #fafafa;
          border-radius: 10px;
          padding: 1rem;
          font-size: 13px;
          line-height: 1.5;
          color: #666;
          max-height: 120px;
          overflow-y: auto;
          font-weight: 300;
        }
        .il-transcript:empty::before {
          content: 'Tu respuesta aparecerá aquí...';
          color: #bbb;
        }

        /* Controls */
        .il-controls {
          display: flex;
          gap: 1.5rem;
          align-items: center;
        }
        .il-mic-btn, .il-end-btn, .il-submit-btn {
          width: 64px;
          height: 64px;
          border-radius: 50%;
          border: none;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: transform 0.15s, opacity 0.15s;
          position: relative;
        }
        .il-mic-btn {
          background: #111;
        }
        .il-mic-btn.il-active {
          background: #22c55e;
        }
        .il-mic-btn.il-active::after {
          content: '';
          position: absolute;
          width: 80px;
          height: 80px;
          border-radius: 50%;
          border: 2px solid #22c55e;
          opacity: 0.4;
          animation: il-ping 1.5s ease-out infinite;
        }
        @keyframes il-ping {
          0% { transform: scale(0.9); opacity: 0.5; }
          100% { transform: scale(1.3); opacity: 0; }
        }
        .il-mic-btn:hover, .il-end-btn:hover, .il-submit-btn:hover {
          transform: scale(1.05);
          opacity: 0.9;
        }
        .il-end-btn {
          background: #ef4444;
        }
        .il-submit-btn {
          background: #22c55e;
        }
        .il-submit-btn:disabled {
          opacity: 0.4;
          cursor: not-allowed;
        }

        /* Label */
        .il-label {
          font-size: 12px;
          color: #888;
          font-weight: 400;
          text-align: center;
        }
        .il-label.il-active {
          color: #22c55e;
          font-weight: 500;
        }
      `}</style>

      <div className="il-root">
        <div className="il-container">
          <div className="il-timer">
            <span className="il-timer-dot"></span>
            {formatTime(callTime)}
          </div>

          <div className="il-progress">
            Pregunta {currentQuestionIndex + 1} de {pendingQuestions.length}
          </div>

          <div className="il-avatar-card">
            {/* Avatar SVG - Friendly robot/creature */}
            <svg className="il-avatar" viewBox="0 0 160 160" fill="none">
              {/* Body */}
              <rect x="40" y="80" width="80" height="60" rx="20" fill="#667eea" />
              
              {/* Head */}
              <circle cx="80" cy="60" r="40" fill="#8b9aff" />
              
              {/* Eyes */}
              <g transform={`scale(${eyeScale})`} style={{ transformOrigin: '60px 55px' }}>
                <circle cx="60" cy="55" r="8" fill="#fff" />
                <circle cx="60" cy="55" r="4" fill="#111" />
              </g>
              <g transform={`scale(${eyeScale})`} style={{ transformOrigin: '100px 55px' }}>
                <circle cx="100" cy="55" r="8" fill="#fff" />
                <circle cx="100" cy="55" r="4" fill="#111" />
              </g>
              
              {/* Mouth */}
              <ellipse 
                cx="80" 
                cy={70 + mouthOffset} 
                rx="12" 
                ry={listening ? 8 : 3} 
                fill="#fff" 
                opacity="0.8"
              />
              
              {/* Antenna */}
              <line x1="80" y1="20" x2="80" y2="5" stroke="#667eea" strokeWidth="3" strokeLinecap="round" />
              <circle cx="80" cy="5" r="4" fill="#22c55e" />
              
              {/* Arms */}
              <rect x="25" y="95" width="10" height="30" rx="5" fill="#8b9aff" />
              <rect x="125" y="95" width="10" height="30" rx="5" fill="#8b9aff" />
            </svg>

            <div className="il-question">{currentQuestion.question}</div>

            {transcript && (
              <div className="il-transcript">{transcript}</div>
            )}

            <div className="il-controls">
              <div>
                <button
                  type="button"
                  className={`il-mic-btn ${listening ? 'il-active' : ''}`}
                  onClick={onToggleMic}
                  title={listening ? 'Silenciar' : 'Activar micrófono'}
                >
                  {listening ? (
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                      <rect x="8" y="3" width="8" height="13" rx="4" fill="white" />
                      <path d="M4 12c0 4.4 3.6 8 8 8s8-3.6 8-8" stroke="white" strokeWidth="2" strokeLinecap="round" />
                      <line x1="12" y1="20" x2="12" y2="24" stroke="white" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                  ) : (
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                      <path d="M3 3l18 18M15 9v2c0 .6-.1 1.1-.3 1.6M9.5 9.5V6c0-1.4 1.1-2.5 2.5-2.5s2.5 1.1 2.5 2.5v6c0 .3 0 .6-.1.9" stroke="white" strokeWidth="2" strokeLinecap="round" />
                      <path d="M5 12c0 3.9 3.1 7 7 7 1 0 1.9-.2 2.8-.6" stroke="white" strokeWidth="2" strokeLinecap="round" />
                      <line x1="12" y1="19" x2="12" y2="23" stroke="white" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                  )}
                </button>
                <div className={`il-label ${listening ? 'il-active' : ''}`}>
                  {listening ? 'Escuchando' : 'Micrófono'}
                </div>
              </div>

              {transcript.trim() && (
                <div>
                  <button
                    type="button"
                    className="il-submit-btn"
                    onClick={onSubmitAnswer}
                    disabled={submitting}
                    title="Enviar respuesta"
                  >
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                      <path d="M5 12l5 5L20 7" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </button>
                  <div className="il-label">
                    {submitting ? 'Enviando...' : 'Enviar'}
                  </div>
                </div>
              )}

              <div>
                <button
                  type="button"
                  className="il-end-btn"
                  onClick={onEndCall}
                  title="Finalizar entrevista"
                >
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                    <path d="M3 9c0-1.1.9-2 2-2h2c1.1 0 2 .9 2 2v.5c1.3-1 3-1.5 5-1.5s3.7.5 5 1.5V9c0-1.1.9-2 2-2h2c1.1 0 2 .9 2 2v6c0 1.1-.9 2-2 2h-2c-1.1 0-2-.9-2-2v-.5c-1.3 1-3 1.5-5 1.5s-3.7-.5-5-1.5v.5c0 1.1-.9 2-2 2H5c-1.1 0-2-.9-2-2V9z" fill="white" />
                    <line x1="6" y1="6" x2="18" y2="18" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
                  </svg>
                </button>
                <div className="il-label">Finalizar</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default InterviewLivePage

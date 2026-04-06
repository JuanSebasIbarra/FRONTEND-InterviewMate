import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  loadInterviewSessionData,
  submitQuestionAnswer,
  type InterviewSessionData,
} from '../controllers/interviewSessionController'
import { getMe } from '../services/authService'

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

type LocalSettingsAssets = {
  firstName: string
  lastName: string
  avatarDataUrl: string
  cvFileName: string
}

const SETTINGS_LOCAL_STORAGE_KEY = 'interviewmate.settings.local'

declare global {
  interface Window {
    SpeechRecognition?: SpeechRecognitionConstructor
    webkitSpeechRecognition?: SpeechRecognitionConstructor
  }
}

// ─── Robot Avatar Component ───────────────────────────────────────────────────

interface RobotAvatarProps {
  talking: boolean
  thinking: boolean
}

function RobotAvatar({ talking, thinking }: RobotAvatarProps) {
  const svgRef = useRef<SVGSVGElement>(null)
  const rafRef = useRef<number | null>(null)
  const blinkTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Blink animation
  useEffect(() => {
    const eyeLInner = svgRef.current?.getElementById('eyeL-inner') as SVGEllipseElement | null
    const eyeRInner = svgRef.current?.getElementById('eyeR-inner') as SVGEllipseElement | null
    const eyeLMid   = svgRef.current?.getElementById('eyeL-mid')   as SVGEllipseElement | null
    const eyeRMid   = svgRef.current?.getElementById('eyeR-mid')   as SVGEllipseElement | null

    const doBlink = () => {
      let start: number | null = null
      const dur = 150
      const step = (ts: number) => {
        if (!start) start = ts
        const prog = Math.min((ts - start) / dur, 1)
        const sy   = prog < 0.5 ? 1 - prog * 2 : (prog - 0.5) * 2
        const ry6  = Math.max(0.5, 6  * sy).toFixed(2)
        const ry12 = Math.max(0.5, 12 * sy).toFixed(2)
        eyeLInner?.setAttribute('ry', ry6)
        eyeRInner?.setAttribute('ry', ry6)
        eyeLMid?.setAttribute('ry', ry12)
        eyeRMid?.setAttribute('ry', ry12)
        if (prog < 1) requestAnimationFrame(step)
        else schedBlink()
      }
      requestAnimationFrame(step)
    }

    const schedBlink = () => {
      blinkTimerRef.current = setTimeout(doBlink, 2500 + Math.random() * 3000)
    }

    schedBlink()
    return () => {
      if (blinkTimerRef.current) clearTimeout(blinkTimerRef.current)
    }
  }, [])

  // Main animation loop
  useEffect(() => {
    const svg     = svgRef.current
    const eyeL    = svg?.getElementById('eyeL')    as SVGGElement | null
    const eyeR    = svg?.getElementById('eyeR')    as SVGGElement | null
    const eyeLMid = svg?.getElementById('eyeL-mid') as SVGEllipseElement | null
    const eyeRMid = svg?.getElementById('eyeR-mid') as SVGEllipseElement | null
    const mouthSmile = svg?.getElementById('mouth-smile') as SVGPathElement | null
    const mouthTalk  = svg?.getElementById('mouth-talk')  as SVGGElement | null
    const mouthBg    = svg?.getElementById('mouth-bg')    as SVGRectElement | null
    const barIds = ['bar1','bar2','bar3','bar4','bar5']
    const bars = barIds.map(id => svg?.getElementById(id) as SVGRectElement | null)
    const barHeights = [12, 8, 14, 8, 12]
    const barY       = [130, 132, 129, 132, 130]

    // Set mouth state
    if (talking) {
      if (mouthSmile) mouthSmile.style.opacity = '0'
      if (mouthTalk)  mouthTalk.style.opacity  = '1'
      if (mouthBg)    mouthBg.setAttribute('rx', '4')
    } else {
      if (mouthSmile) mouthSmile.style.opacity = '1'
      if (mouthTalk)  mouthTalk.style.opacity  = '0'
      if (mouthBg)    mouthBg.setAttribute('rx', '8')
      bars.forEach((b, i) => {
        b?.setAttribute('height', String(barHeights[i]))
        b?.setAttribute('y',      String(barY[i]))
      })
    }

    const loop = (ts: number) => {
      const t = ts * 0.001

      if (talking) {
        const sigs = [
          Math.sin(t * 14)       * 0.5 + 0.5,
          Math.sin(t * 11 + 1)   * 0.5 + 0.5,
          Math.sin(t * 17 + 2)   * 0.5 + 0.5,
          Math.sin(t * 9  + 0.5) * 0.5 + 0.5,
          Math.sin(t * 13 + 1.5) * 0.5 + 0.5,
        ]
        bars.forEach((b, i) => {
          const h = 4 + sigs[i] * barHeights[i]
          const y = barY[i] + (barHeights[i] - h) / 2
          b?.setAttribute('height', h.toFixed(1))
          b?.setAttribute('y',      y.toFixed(1))
        })
        const bob = Math.sin(t * 4) * 1.5
        if (svg) svg.style.transform = `translateY(${bob.toFixed(2)}px)`
        const pulse = (0.85 + Math.sin(t * 6) * 0.15).toFixed(2)
        eyeLMid?.setAttribute('opacity', pulse)
        eyeRMid?.setAttribute('opacity', pulse)

      } else if (thinking) {
        const gaze = (Math.sin(t * 1.2) * 4).toFixed(1)
        eyeL?.setAttribute('transform', `translate(${gaze}, 0)`)
        eyeR?.setAttribute('transform', `translate(${gaze}, 0)`)
        const pulse = (0.7 + Math.sin(t * 3) * 0.3).toFixed(2)
        eyeLMid?.setAttribute('opacity', pulse)
        eyeRMid?.setAttribute('opacity', pulse)
        if (svg) svg.style.transform = ''

      } else {
        const breathe = (Math.sin(t * 1.8) * 0.8).toFixed(2)
        if (svg) svg.style.transform = `translateY(${breathe}px)`
        eyeL?.setAttribute('transform', '')
        eyeR?.setAttribute('transform', '')
        eyeLMid?.setAttribute('opacity', '1')
        eyeRMid?.setAttribute('opacity', '1')
      }

      rafRef.current = requestAnimationFrame(loop)
    }

    rafRef.current = requestAnimationFrame(loop)
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [talking, thinking])

  return (
    <svg
      ref={svgRef}
      width="200"
      height="200"
      viewBox="0 0 200 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ display: 'block' }}
    >
      <defs>
        <radialGradient id="faceGrad" cx="50%" cy="45%" r="55%">
          <stop offset="0%"   stopColor="#e8eaf0" />
          <stop offset="100%" stopColor="#c8ccd8" />
        </radialGradient>
        <radialGradient id="screenGrad" cx="50%" cy="40%" r="60%">
          <stop offset="0%"   stopColor="#1a2540" />
          <stop offset="100%" stopColor="#0d1520" />
        </radialGradient>
        <radialGradient id="eyeGlow" cx="50%" cy="40%" r="60%">
          <stop offset="0%"   stopColor="#4df0d8" />
          <stop offset="100%" stopColor="#00b8a0" />
        </radialGradient>
        <filter id="eyeBloom" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Ear panels */}
      <rect x="12"  y="68" width="26" height="40" rx="8" fill="#c8ccd8" stroke="#b0b4c0" strokeWidth="0.5" />
      <rect x="162" y="68" width="26" height="40" rx="8" fill="#c8ccd8" stroke="#b0b4c0" strokeWidth="0.5" />
      <rect x="17"  y="78" width="16" height="8"  rx="4" fill="#a0a4b0" />
      <rect x="167" y="78" width="16" height="8"  rx="4" fill="#a0a4b0" />

      {/* Head shell */}
      <rect x="30" y="28" width="140" height="130" rx="32" fill="url(#faceGrad)" stroke="#b8bcc8" strokeWidth="0.8" />

      {/* Neck */}
      <rect x="82" y="155" width="36" height="18" rx="6" fill="#b8bcc8" stroke="#a0a4b0" strokeWidth="0.5" />
      <rect x="76" y="168" width="48" height="8"  rx="4" fill="#a0a4b0" />

      {/* Face screen bezel */}
      <rect x="34" y="48" width="132" height="112" rx="22" fill="#1a1e2e" stroke="#3a4060" strokeWidth="1" />

      {/* Screen surface */}
      <rect x="38" y="52" width="124" height="104" rx="18" fill="url(#screenGrad)" />

      {/* Screen shine */}
      <rect x="42" y="56" width="60" height="3" rx="1.5" fill="white" opacity="0.06" />

      {/* Left eye */}
      <g id="eyeL" filter="url(#eyeBloom)">
        <ellipse cx="72" cy="98" rx="18" ry="18" fill="#00b8a0" opacity="0.18" />
        <ellipse id="eyeL-mid"   cx="72" cy="98" rx="12" ry="12" fill="url(#eyeGlow)" />
        <ellipse id="eyeL-inner" cx="72" cy="98" rx="6"  ry="6"  fill="#ffffff" opacity="0.9" />
        <ellipse cx="68" cy="94" rx="2" ry="2" fill="white" opacity="0.6" />
      </g>

      {/* Right eye */}
      <g id="eyeR" filter="url(#eyeBloom)">
        <ellipse cx="128" cy="98" rx="18" ry="18" fill="#00b8a0" opacity="0.18" />
        <ellipse id="eyeR-mid"   cx="128" cy="98" rx="12" ry="12" fill="url(#eyeGlow)" />
        <ellipse id="eyeR-inner" cx="128" cy="98" rx="6"  ry="6"  fill="#ffffff" opacity="0.9" />
        <ellipse cx="124" cy="94" rx="2" ry="2" fill="white" opacity="0.6" />
      </g>

      {/* Mouth */}
      <g id="mouth-group">
        <rect id="mouth-bg" x="76" y="128" width="48" height="16" rx="8" fill="#001a14" opacity="0.8" />
        <path
          id="mouth-smile"
          d="M82 135 Q100 143 118 135"
          stroke="#00e8c0"
          strokeWidth="2.5"
          fill="none"
          strokeLinecap="round"
          style={{ transition: 'opacity 0.15s' }}
        />
        <g id="mouth-talk" style={{ opacity: 0 }}>
          <rect id="bar1" x="83"  y="130" width="4" height="12" rx="2" fill="#00e8c0" />
          <rect id="bar2" x="91"  y="132" width="4" height="8"  rx="2" fill="#00e8c0" />
          <rect id="bar3" x="99"  y="129" width="4" height="14" rx="2" fill="#00e8c0" />
          <rect id="bar4" x="107" y="132" width="4" height="8"  rx="2" fill="#00e8c0" />
          <rect id="bar5" x="115" y="130" width="4" height="12" rx="2" fill="#00e8c0" />
        </g>
      </g>

      {/* Top screws */}
      <circle cx="52"  cy="42" r="3" fill="#d0d4e0" stroke="#b8bcc8" strokeWidth="0.5" />
      <circle cx="148" cy="42" r="3" fill="#d0d4e0" stroke="#b8bcc8" strokeWidth="0.5" />
    </svg>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

function InterviewLivePage() {
  const { sessionId } = useParams<{ sessionId: string }>()
  const navigate = useNavigate()
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null)
  const listeningRef   = useRef(false)
  const animationRef   = useRef<number | null>(null)

  const [data, setData]                           = useState<InterviewSessionData | null>(null)
  const [loading, setLoading]                     = useState(true)
  const [listening, setListening]                 = useState(false)
  const [transcript, setTranscript]               = useState('')
  const [callTime, setCallTime]                   = useState(0)
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [submitting, setSubmitting]               = useState(false)
  const [authUsername, setAuthUsername]           = useState('')

  const speechRecognitionCtor =
    typeof window !== 'undefined'
      ? (window.SpeechRecognition ?? window.webkitSpeechRecognition ?? null)
      : null

  const pendingQuestions = useMemo(
    () => data?.questions.filter((q) => !q.answer?.trim()) ?? [],
    [data],
  )

  const currentQuestion = pendingQuestions[currentQuestionIndex]

  const localProfile = useMemo(() => {
    const fallback: LocalSettingsAssets = {
      firstName: '',
      lastName: '',
      avatarDataUrl: '',
      cvFileName: '',
    }

    if (typeof window === 'undefined') return fallback

    try {
      const raw = localStorage.getItem(SETTINGS_LOCAL_STORAGE_KEY)
      if (!raw) return fallback
      const parsed = JSON.parse(raw) as Partial<LocalSettingsAssets>
      return {
        firstName: parsed.firstName ?? '',
        lastName: parsed.lastName ?? '',
        avatarDataUrl: parsed.avatarDataUrl ?? '',
        cvFileName: parsed.cvFileName ?? '',
      }
    } catch {
      return fallback
    }
  }, [])

  const profileName = [localProfile.firstName, localProfile.lastName].filter(Boolean).join(' ')
  const selfLabel = authUsername || profileName || 'Tú'
  const userInitial = (selfLabel[0] ?? 'U').toUpperCase()
  const interviewerName = data?.session.templateEnterprise || 'InterviewMate AI'

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
    let mounted = true

    const loadAuthUser = async () => {
      try {
        const user = await getMe()
        if (mounted) {
          setAuthUsername(user.username?.trim() ?? '')
        }
      } catch {
        if (mounted) {
          setAuthUsername('')
        }
      }
    }

    void loadAuthUser()
    return () => {
      mounted = false
    }
  }, [])

  useEffect(() => {
    const timer = setInterval(() => setCallTime((t) => t + 1), 1000)
    return () => clearInterval(timer)
  }, [])

  useEffect(() => () => {
    listeningRef.current = false
    recognitionRef.current?.abort()
    if (animationRef.current) cancelAnimationFrame(animationRef.current)
  }, [])

  const createAndStart = (lang: string) => {
    if (!speechRecognitionCtor) return
    const r = new speechRecognitionCtor()
    r.continuous       = true
    r.interimResults   = true
    r.lang             = lang
    r.maxAlternatives  = 1

    r.onstart  = () => setListening(true)
    r.onend    = () => {
      if (listeningRef.current) createAndStart(lang)
      else setListening(false)
    }
    r.onerror  = () => { /* ignore transient errors */ }
    r.onresult = (event) => {
      let final = ''
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i]
        const chunk  = result[0]?.transcript ?? ''
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
    navigate('/dashboard')
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
        navigate('/dashboard')
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
      <div style={{ background: '#0c0c14', height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'DM Sans, sans-serif', color: '#555', fontSize: '14px' }}>
        Cargando entrevista...
      </div>
    )
  }

  if (!data || !currentQuestion) {
    return (
      <div style={{ background: '#0c0c14', height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', fontFamily: 'DM Sans, sans-serif', gap: '1rem' }}>
        <div style={{ color: '#555', fontSize: '14px' }}>No hay preguntas disponibles</div>
        <button
          onClick={() => navigate('/dashboard')}
          style={{ background: '#1e1e30', border: '0.5px solid #3a3a50', color: '#e5e5e5', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif', fontSize: '13px' }}
        >
          Volver al dashboard
        </button>
      </div>
    )
  }

  return (
    <>
      <style>{`
        .il * { box-sizing: border-box; margin: 0; padding: 0; }

        /* ── ROOT ── */
        .il-root {
          font-family: 'DM Sans', sans-serif;
          background: #1f2024;
          min-height: 100vh;
          width: 100%;
          padding: 1rem;
        }

        .il-call-shell {
          width: 100%;
          min-height: calc(100vh - 2rem);
          border-radius: 14px;
          background: #25262c;
          border: 1px solid #3a3b43;
          display: grid;
          grid-template-rows: auto 1fr auto auto;
          overflow: hidden;
        }

        .il-call-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0.9rem 1.1rem;
          border-bottom: 1px solid #363741;
          background: #2a2b31;
        }
        .il-call-title {
          display: flex;
          align-items: center;
          gap: 8px;
          color: #f3f4f6;
          font-size: 13px;
          font-weight: 500;
        }
        .il-status-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #22c55e;
          box-shadow: 0 0 0 6px rgba(34, 197, 94, 0.18);
        }

        .il-timer {
          background: #3a3c45;
          border-radius: 999px;
          padding: 6px 12px;
          font-size: 12px;
          color: #f5f5f5;
          font-weight: 500;
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .il-timer-dot {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: #ef4444;
          animation: il-pulse 2s ease-in-out infinite;
        }
        @keyframes il-pulse {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0.3; }
        }
        .il-rec-label {
          font-size: 11px; color: #ef4444;
          font-weight: 500; letter-spacing: 0.08em;
        }
        .il-topbar-right {
          min-width: 180px;
          text-align: right;
          font-size: 12px; color: #555;
          font-weight: 400;
        }

        .il-stage {
          position: relative;
          padding: 1rem;
          background: radial-gradient(80% 80% at 50% 20%, #2f3038 0%, #222329 75%);
        }

        .il-remote-tile {
          width: 100%;
          height: 100%;
          min-height: 48vh;
          background: #2a2c33;
          border: 1px solid #3c3d46;
          border-radius: 12px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 1rem;
          position: relative;
          overflow: hidden;
        }
        .il-remote-meta {
          position: absolute;
          left: 0.85rem;
          bottom: 0.85rem;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 5px 10px;
          border-radius: 999px;
          font-size: 11px;
          font-weight: 500;
          background: rgba(17, 17, 17, 0.62);
          color: #fff;
          backdrop-filter: blur(6px);
        }
        .il-remote-role {
          color: #d4d4d8;
          font-weight: 400;
        }

        .il-self-tile {
          position: absolute;
          right: 1.6rem;
          top: 1.6rem;
          width: 170px;
          aspect-ratio: 4 / 3;
          border-radius: 12px;
          overflow: hidden;
          background: #17181d;
          border: 1px solid #4b4d58;
          box-shadow: 0 10px 24px rgba(0, 0, 0, 0.45);
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .il-self-photo {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        .il-self-fallback {
          width: 64px;
          height: 64px;
          border-radius: 50%;
          display: grid;
          place-items: center;
          font-size: 24px;
          font-weight: 500;
          color: #ede9fe;
          background: #5b53c8;
        }
        .il-self-meta {
          position: absolute;
          left: 8px;
          bottom: 8px;
          font-size: 11px;
          color: #fff;
          background: rgba(0, 0, 0, 0.48);
          border-radius: 999px;
          padding: 3px 8px;
        }

        .il-avatar-wrapper {
          width: 200px;
          height: 200px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #0c0c14;
          overflow: hidden;
        }

        .il-question {
          width: min(900px, 92%);
          background: rgba(255, 255, 255, 0.95);
          border-radius: 10px;
          padding: 0.9rem 1rem;
          font-size: 13px;
          line-height: 1.55;
          color: #222;
          text-align: left;
          border: 1px solid #e5e7eb;
          min-height: 70px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: flex-start;
        }

        .il-progress {
          font-size: 11px;
          color: #d4d4d8;
          font-weight: 500;
          letter-spacing: 0.02em;
        }

        .il-caption-wrap {
          margin: 0 1rem;
          border-radius: 10px;
          border: 1px solid #3c3d46;
          background: #2b2d34;
          padding: 0.75rem 0.95rem;
        }
        .il-caption-title {
          font-size: 10px;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          color: #9ca3af;
          margin-bottom: 6px;
        }
        .il-transcript {
          width: 100%;
          font-size: 13px;
          line-height: 1.5;
          color: #eceff1;
          min-height: 22px;
          max-height: 90px;
          overflow-y: auto;
          font-weight: 400;
        }
        .il-transcript:empty::before {
          content: 'Tu respuesta aparecerá aquí...';
          color: #9ca3af;
        }

        .il-controls-bar {
          margin: 0.9rem 1rem 1rem;
          background: #2a2b31;
          border: 1px solid #3a3b43;
          border-radius: 12px;
          padding: 0.85rem;
          display: grid;
          grid-template-columns: 1fr auto;
          align-items: center;
          gap: 1rem;
        }
        .il-controls-left {
          display: flex;
          gap: 1.1rem;
          align-items: center;
        }
        .il-controls-right {
          display: flex;
          align-items: center;
        }
        .il-mic-btn, .il-end-btn, .il-submit-btn {
          width: 56px;
          height: 56px;
          border-radius: 50%;
          border: none;
          cursor: pointer;
          display: flex;
          flex-direction: column;
          gap: 3px;
        }
        .il-panel-title {
          font-size: 14px; font-weight: 500; color: #e5e5e5;
        }
        .il-panel-sub {
          font-size: 11px; color: #555;
        }
        .il-panel-body {
          flex: 1; overflow-y: auto;
          padding: 14px;
          display: flex; flex-direction: column; gap: 12px;
        }
        .il-panel-body::-webkit-scrollbar { width: 4px; }
        .il-panel-body::-webkit-scrollbar-track { background: transparent; }
        .il-panel-body::-webkit-scrollbar-thumb { background: #2a2a3a; border-radius: 2px; }
        .il-info-block {
          background: #1a1a28;
          border-radius: 10px;
          border: 0.5px solid #252535;
          padding: 12px 14px;
        }
        .il-block-eyebrow {
          font-size: 10px;
          letter-spacing: 0.1em; text-transform: uppercase;
          color: #00e8c0; margin-bottom: 8px; font-weight: 500;
        }
        .il-question-text {
          font-size: 13px; color: #c8c8d8;
          line-height: 1.65; font-weight: 400;
        }
        .il-transcript-body {
          font-size: 13px; color: #8888a8;
          line-height: 1.65; font-weight: 300;
          min-height: 48px;
        }
        .il-transcript-placeholder {
          color: #383848; font-style: italic;
          font-size: 13px; min-height: 48px;
          display: flex; align-items: center;
        }
        .il-listening-badge {
          display: flex; align-items: center; gap: 5px;
          font-size: 11px; color: #22c55e; font-weight: 500;
          margin-top: 8px;
        }
        .il-listening-dot {
          width: 6px; height: 6px; border-radius: 50%;
          background: #22c55e;
          animation: il-pulse 1s ease-in-out infinite;
        }

        /* ── CONTROL BAR ── */
        .il-controlbar {
          height: 78px;
          background: #111118;
          border-top: 0.5px solid #252535;
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0;
          gap: 10px;
        }
        .il-ctrl-item {
          display: flex; flex-direction: column;
          align-items: center; gap: 5px;
        }
        .il-ctrl-btn {
          width: 46px; height: 46px; border-radius: 50%;
          border: none; cursor: pointer;
          display: flex; align-items: center; justify-content: center;
          transition: transform 0.15s, opacity 0.15s;
          position: relative; flex-shrink: 0;
        }
        .il-mic-btn { background: #4b5563; }
        .il-mic-btn.il-active { background: #22c55e; }
        .il-mic-btn.il-active::after {
          content: '';
          position: absolute;
          width: 70px;
          height: 70px;
          border-radius: 50%;
          border: 2px solid #22c55e;
          opacity: 0.3;
          animation: il-ping 1.5s ease-out infinite;
        }
        @keyframes il-ping {
          0%   { transform: scale(0.9); opacity: 0.35; }
          100% { transform: scale(1.4); opacity: 0; }
        }
        .il-mic-btn:hover, .il-end-btn:hover, .il-submit-btn:hover {
          transform: scale(1.05);
          opacity: 0.9;
        }
        .il-end-btn    { background: #ef4444; }
        .il-submit-btn { background: #22c55e; }
        .il-submit-btn:disabled { opacity: 0.4; cursor: not-allowed; }

        .il-label {
          font-size: 11px;
          color: #9ca3af;
          font-weight: 400;
          text-align: center;
          margin-top: 6px;
        }
        .il-label.il-active {
          color: #22c55e;
          font-weight: 500;
        }

        @media (max-width: 900px) {
          .il-self-tile {
            width: 132px;
            right: 1.2rem;
            top: 1.2rem;
          }
          .il-controls-bar {
            grid-template-columns: 1fr;
          }
          .il-controls-right {
            justify-content: flex-end;
          }
        }

        @media (max-width: 640px) {
          .il-root { padding: 0; }
          .il-call-shell {
            min-height: 100vh;
            border-radius: 0;
            border-left: none;
            border-right: none;
          }
          .il-self-tile {
            width: 106px;
          }
          .il-avatar-wrapper {
            width: 170px;
            height: 170px;
          }
          .il-controls-left {
            gap: 0.8rem;
            justify-content: center;
          }
        }
      `}</style>

      <div className="il-root">
        <div className="il-call-shell">

          <div className="il-call-header">
            <div className="il-call-title">
              <span className="il-status-dot" />
              <span>Entrevista en vivo · {interviewerName}</span>
            </div>
            <div className="il-timer">
              <span className="il-timer-dot" />
              {formatTime(callTime)}
            </div>
          </div>
        </div>

        {/* ── MAIN ── */}
        <div className="il-main">

          <div className="il-stage">
            <div className="il-remote-tile">
              <div className="il-avatar-wrapper">
                <RobotAvatar
                  talking={listening}
                  thinking={submitting}
                />
              </div>
              <div className="il-question">{currentQuestion.question}</div>
              <div className="il-remote-meta">
                <span>{interviewerName}</span>
                <span className="il-remote-role">Entrevistador</span>
              </div>
            </div>

            <div className="il-self-tile" aria-label="Vista previa del participante">
              {localProfile.avatarDataUrl ? (
                <img
                  className="il-self-photo"
                  src={localProfile.avatarDataUrl}
                  alt={`Foto de perfil de ${selfLabel}`}
                />
              ) : (
                <div className="il-self-fallback">{userInitial}</div>
              )}
              <div className="il-self-meta">{selfLabel}</div>
            </div>
          </div>

          <div className="il-caption-wrap">
            <div className="il-caption-title">Transcripción en tiempo real</div>
            <div className="il-transcript">{transcript}</div>
          </div>

          <div className="il-controls-bar">
            <div className="il-controls-left">
              <div className="il-progress">
                Pregunta {currentQuestionIndex + 1} de {pendingQuestions.length}
              </div>

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
              <div className="il-user-pip-footer">Tú</div>
            </div>

          </div>

          {/* ── RIGHT PANEL (transcript) ── */}
          <div className="il-right-panel">
            <div className="il-panel-header">
              <span className="il-panel-title">Sesión en curso</span>
              <span className="il-panel-sub">
                {data.session.templatePosition} · {data.session.templateEnterprise}
              </span>
            </div>
            <div className="il-panel-body">

              {/* Current question */}
              <div className="il-info-block">
                <div className="il-block-eyebrow">Pregunta {currentQuestionIndex + 1}</div>
                <div className="il-question-text">{currentQuestion.question}</div>
              </div>

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

              <div>
                <button
                  type="button"
                  className="il-submit-btn"
                  onClick={onSubmitAnswer}
                  disabled={submitting || !transcript.trim()}
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
            </div>

            <div className="il-controls-right">
              <div className="il-label">Modo llamada sin cámara</div>
            </div>
          )}

          {/* End call */}
          <div className="il-ctrl-item">
            <button
              type="button"
              className="il-ctrl-btn il-ctrl-end"
              onClick={onEndCall}
              title="Finalizar entrevista"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M3 9c0-1.1.9-2 2-2h2c1.1 0 2 .9 2 2v.5c1.3-1 3-1.5 5-1.5s3.7.5 5 1.5V9c0-1.1.9-2 2-2h2c1.1 0 2 .9 2 2v6c0 1.1-.9 2-2 2h-2c-1.1 0-2-.9-2-2v-.5c-1.3 1-3 1.5-5 1.5s-3.7-.5-5-1.5v.5c0 1.1-.9 2-2 2H5c-1.1 0-2-.9-2-2V9z" fill="white" />
                <line x1="6" y1="6" x2="18" y2="18" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
              </svg>
            </button>
            <div className="il-ctrl-label">Finalizar</div>
          </div>

        </div>

      </div>
    </>
  )
}

export default InterviewLivePage
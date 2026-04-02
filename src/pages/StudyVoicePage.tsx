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

/*
  Fuentes — asegúrate de tener esto en tu index.html:
  <link href="https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;1,9..40,300&display=swap" rel="stylesheet" />
*/

// ── Tipos SpeechRecognition ───────────────────────────────────────────────
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

// ── Labels ────────────────────────────────────────────────────────────────
const DIFFICULTY_LABEL: Record<StudyDifficulty, string> = {
  BASIC: 'Básico', INTERMEDIATE: 'Intermedio', ADVANCED: 'Avanzado',
}
const QUESTION_TYPE_LABEL: Record<StudyQuestionType, string> = {
  THEORETICAL: 'Teórica', PRACTICAL: 'Práctica',
}
const INTERVIEW_TYPE_LABEL: Record<string, string> = {
  TECHNICAL: 'Técnica', HR: 'RRHH', PSYCHOLOGICAL: 'Psicológica',
}
const DIFFICULTIES: StudyDifficulty[] = ['BASIC', 'INTERMEDIATE', 'ADVANCED']
const LANGUAGE_OPTIONS = [
  { value: 'es-ES', label: 'Español' },
  { value: 'en-US', label: 'English' },
]

// ── QuestionCard ──────────────────────────────────────────────────────────
function QuestionCard({ question }: { question: StudyQuestion }) {
  return (
    <div className="sv-q-item">
      <div className="sv-q-num">{String(question.orderIndex).padStart(2, '0')}</div>
      <div className="sv-q-text">{question.questionText}</div>
      <span className={`sv-q-badge ${question.type === 'PRACTICAL' ? 'sv-badge-p' : 'sv-badge-t'}`}>
        {QUESTION_TYPE_LABEL[question.type]}
      </span>
    </div>
  )
}

// ── Página principal ──────────────────────────────────────────────────────
function StudyVoicePage() {
  const navigate = useNavigate()
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null)

  const [transcript, setTranscript]           = useState('')
  const [interimTranscript, setInterimTranscript] = useState('')
  const [selectedLanguage, setSelectedLanguage]   = useState('es-ES')
  const [studyIdToLoad, setStudyIdToLoad]         = useState('')
  const [interviewType, setInterviewType]         = useState<InterviewType>('TECHNICAL')
  const [session, setSession]                     = useState<StudySession | null>(null)
  const [loading, setLoading]                     = useState(false)
  const [startingInterview, setStartingInterview] = useState(false)
  const [listening, setListening]                 = useState(false)
  const [error, setError]                         = useState('')
  const [success, setSuccess]                     = useState('')

  const speechRecognitionCtor =
    typeof window !== 'undefined'
      ? (window.SpeechRecognition ?? window.webkitSpeechRecognition ?? null)
      : null
  const speechSupported = Boolean(speechRecognitionCtor)

  const groupedByDifficulty = useMemo(() => {
    const base: Record<StudyDifficulty, StudyQuestion[]> = { BASIC: [], INTERMEDIATE: [], ADVANCED: [] }
    for (const q of session?.questions ?? []) base[q.difficulty].push(q)
    return base
  }, [session])

  const finalTranscript = `${transcript} ${interimTranscript}`.trim()

  useEffect(() => () => { recognitionRef.current?.abort() }, [])

  const resetMessages = () => { setError(''); setSuccess('') }

  // ── SpeechRecognition ─────────────────────────────────────────────────
  const buildRecognition = () => {
    if (!speechRecognitionCtor) throw new Error('Tu navegador no soporta reconocimiento de voz.')
    const r = new speechRecognitionCtor()
    r.continuous = true; r.interimResults = true
    r.lang = selectedLanguage; r.maxAlternatives = 1
    r.onstart = () => { setListening(true); setError('') }
    r.onend   = () => { setListening(false); setInterimTranscript('') }
    r.onerror = (event) => {
      setListening(false)
      if (event.error === 'not-allowed') { setError('Permiso de micrófono denegado. Habilítalo e inténtalo de nuevo.'); return }
      if (event.error === 'no-speech')   { setError('No detecté voz. Habla más cerca del micrófono.'); return }
      setError('No fue posible procesar el audio en este navegador.')
    }
    r.onresult = (event) => {
      let nextFinal = ''; let nextInterim = ''
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i]
        const chunk = result[0]?.transcript ?? ''
        if (result.isFinal) nextFinal += `${chunk} `
        else nextInterim += chunk
      }
      if (nextFinal.trim()) setTranscript((prev) => `${prev} ${nextFinal}`.trim())
      setInterimTranscript(nextInterim.trim())
    }
    recognitionRef.current = r
    return r
  }

  const onToggleMic = () => {
    resetMessages()
    if (!speechSupported) { setError('Este navegador no soporta reconocimiento de voz. Escribe el texto manualmente.'); return }
    if (listening) { recognitionRef.current?.stop(); return }
    buildRecognition().start()
  }

  const onClear = () => {
    recognitionRef.current?.abort()
    setListening(false); setTranscript(''); setInterimTranscript('')
    resetMessages()
  }

  // ── Handlers backend ─────────────────────────────────────────────────
  const onGenerateStudyMaterial = async () => {
    const text = finalTranscript.trim()
    if (!text) { setError('Habla unos segundos o escribe el contenido antes de generar material.'); return }
    setLoading(true); resetMessages()
    try {
      const created   = await startStudySession({ topic: text, audioFile: '' })
      const generated = await regenerateStudySessionQuestions(created.id)
      setSession(generated); setStudyIdToLoad(generated.id)
      setSuccess('Material de estudio generado a partir de tu transcripción.')
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setLoading(false)
    }
  }

  const onLoadStudy = async () => {
    const id = studyIdToLoad.trim()
    if (!id) return
    setLoading(true); resetMessages()
    try {
      const loaded = await loadStudySession(id)
      setSession(loaded); setSuccess('Sesión cargada correctamente.')
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setLoading(false)
    }
  }

  const onStartInterview = async () => {
    if (!session) return
    setStartingInterview(true); resetMessages()
    try {
      const interview = await startInterviewFromStudy({ topic: session.topic, interviewType })
      navigate(`/dashboard/session/${interview.id}`)
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setStartingInterview(false)
    }
  }

  const totalQuestions = session?.questions.length ?? 0

  return (
    <>
      <style>{`
        .sv * { box-sizing: border-box; margin: 0; padding: 0; }

        /* ── RAÍZ ── */
        .sv-root {
          font-family: 'DM Sans', sans-serif;
          background: #f5f5f4;
          min-height: 100vh;
          display: grid;
          grid-template-rows: 52px 1fr;
        }

        /* ── TOPBAR ── */
        .sv-topbar {
          background: #fff; border-bottom: 0.5px solid #e5e5e5;
          padding: 0 2rem;
          display: flex; align-items: center; justify-content: space-between;
          position: sticky; top: 0; z-index: 10;
        }
        .sv-brand { display: flex; align-items: center; gap: 8px; font-size: 14px; font-weight: 500; color: #111; cursor: pointer; }
        .sv-brand-dot { width: 20px; height: 20px; border-radius: 5px; background: #111; display: flex; align-items: center; justify-content: center; }
        .sv-topbar-right { display: flex; align-items: center; gap: 10px; }
        .sv-back { font-size: 12px; color: #888; border: 0.5px solid #e5e5e5; border-radius: 6px; padding: 5px 10px; background: none; cursor: pointer; font-family: 'DM Sans', sans-serif; transition: background 0.12s; }
        .sv-back:hover { background: #f5f5f4; color: #111; }
        .sv-avatar { width: 30px; height: 30px; border-radius: 50%; background: #EEEDFE; display: flex; align-items: center; justify-content: center; font-size: 11px; font-weight: 500; color: #534AB7; border: 0.5px solid #ddd; }

        /* ── BODY ── */
        .sv-body { display: grid; grid-template-columns: 284px 1fr; min-height: 0; }

        /* ── SIDEBAR ── */
        .sv-sidebar { background: #fff; border-right: 0.5px solid #e5e5e5; padding: 1.5rem; display: flex; flex-direction: column; gap: 1.25rem; overflow-y: auto; }
        .sv-sidebar-label { font-size: 10px; letter-spacing: 0.1em; text-transform: uppercase; color: #bbb; margin-bottom: 6px; }
        .sv-sep { border: none; border-top: 0.5px solid #e5e5e5; }

        /* Status pills */
        .sv-status-row { display: flex; gap: 6px; flex-wrap: wrap; }
        .sv-pill { font-size: 10px; padding: 3px 9px; border-radius: 999px; font-weight: 500; }
        .sv-pill-ready { background: #DCFCE7; color: #166534; }
        .sv-pill-muted { background: #f5f5f4; color: #999; }
        .sv-pill-live  { background: #FEF2F2; color: #dc2626; }
        .sv-pill-idle  { background: #f5f5f4; color: #999; }

        /* MIC */
        .sv-mic-wrap { display: flex; flex-direction: column; align-items: center; gap: 10px; padding: 0.75rem 0; }
        .sv-mic-btn {
          width: 60px; height: 60px; border-radius: 50%;
          background: #111; border: none; cursor: pointer;
          display: flex; align-items: center; justify-content: center;
          transition: background 0.15s; position: relative;
        }
        .sv-mic-btn:hover { opacity: 0.85; }
        .sv-mic-btn.sv-live { background: #dc2626; }
        .sv-mic-btn.sv-live::after {
          content: ''; position: absolute;
          width: 76px; height: 76px; border-radius: 50%;
          border: 1.5px solid #dc2626; opacity: 0.4;
          animation: sv-ping 1.5s ease-out infinite;
        }
        @keyframes sv-ping { 0% { transform: scale(0.9); opacity: 0.5; } 100% { transform: scale(1.3); opacity: 0; } }
        .sv-mic-label { font-size: 12px; color: #888; font-weight: 300; text-align: center; }
        .sv-mic-label.sv-live { color: #dc2626; font-weight: 500; }

        /* Form elements */
        .sv-field { display: flex; flex-direction: column; gap: 4px; }
        .sv-label { font-size: 11px; font-weight: 500; color: #666; }
        .sv-select, .sv-input {
          font-family: 'DM Sans', sans-serif; font-size: 12px; font-weight: 300;
          padding: 8px 10px; border: 0.5px solid #ddd; border-radius: 7px;
          background: #fff; color: #111; outline: none; width: 100%; transition: border-color 0.15s;
        }
        .sv-select:focus, .sv-input:focus { border-color: #aaa; }
        .sv-input::placeholder { color: #ccc; }
        .sv-load-row { display: flex; gap: 6px; }
        .sv-load-row .sv-input { flex: 1; }
        .sv-load-btn { font-family: 'DM Sans', sans-serif; font-size: 12px; padding: 8px 12px; border-radius: 7px; background: #111; color: #fff; border: none; cursor: pointer; white-space: nowrap; flex-shrink: 0; transition: opacity 0.15s; }
        .sv-load-btn:disabled { opacity: 0.4; cursor: not-allowed; }

        /* Session card */
        .sv-session-card { background: #f9f9f8; border: 0.5px solid #e5e5e5; border-radius: 8px; padding: 10px 12px; display: flex; flex-direction: column; gap: 7px; }
        .sv-session-row { display: flex; align-items: center; justify-content: space-between; }
        .sv-session-key { font-size: 11px; color: #999; font-weight: 300; }
        .sv-session-val { font-size: 11px; color: #111; font-weight: 500; font-family: monospace; }
        .sv-session-topic { font-size: 12px; color: #111; font-weight: 500; line-height: 1.4; }

        /* Alerts */
        .sv-alert-error   { font-size: 11px; color: #dc2626; background: #FEF2F2; border: 0.5px solid #FECACA; border-radius: 6px; padding: 8px 10px; }
        .sv-alert-success { font-size: 11px; color: #166534; background: #DCFCE7; border: 0.5px solid #BBF7D0; border-radius: 6px; padding: 8px 10px; }

        /* ── MAIN ── */
        .sv-main { padding: 1.75rem; display: flex; flex-direction: column; gap: 1.25rem; overflow-y: auto; }
        .sv-main-title { font-family: 'Instrument Serif', serif; font-size: 1.5rem; font-weight: 400; letter-spacing: -0.02em; color: #111; line-height: 1.2; }
        .sv-main-title em { font-style: italic; color: #aaa; }
        .sv-main-sub { font-size: 13px; color: #999; font-weight: 300; margin-top: 3px; }

        /* Transcript card */
        .sv-transcript-card { background: #fff; border-radius: 10px; border: 0.5px solid #e5e5e5; overflow: hidden; }
        .sv-transcript-header { padding: 10px 14px; border-bottom: 0.5px solid #e5e5e5; display: flex; align-items: center; justify-content: space-between; }
        .sv-transcript-title { font-size: 12px; font-weight: 500; color: #111; }
        .sv-transcript-live-badge { font-size: 10px; padding: 3px 8px; border-radius: 999px; background: #FEF2F2; color: #dc2626; font-weight: 500; }
        .sv-transcript-idle-badge { font-size: 10px; padding: 3px 8px; border-radius: 999px; background: #f5f5f4; color: #999; font-weight: 500; }
        .sv-transcript-body { padding: 14px; }
        .sv-textarea {
          font-family: 'DM Sans', sans-serif; font-size: 13px; font-weight: 300;
          line-height: 1.6; width: 100%; border: none; outline: none;
          resize: none; background: transparent; color: #111; min-height: 120px;
        }
        .sv-textarea::placeholder { color: #ccc; }
        .sv-transcript-actions { padding: 10px 14px; border-top: 0.5px solid #e5e5e5; display: flex; gap: 8px; justify-content: flex-end; }
        .sv-btn-generate { font-family: 'DM Sans', sans-serif; font-size: 12px; padding: 8px 16px; border-radius: 7px; background: #111; color: #fff; border: none; cursor: pointer; transition: opacity 0.15s; }
        .sv-btn-generate:hover:not(:disabled) { opacity: 0.8; }
        .sv-btn-generate:disabled { opacity: 0.4; cursor: not-allowed; }
        .sv-btn-clear { font-family: 'DM Sans', sans-serif; font-size: 12px; padding: 8px 14px; border-radius: 7px; background: transparent; color: #999; border: 0.5px solid #e5e5e5; cursor: pointer; transition: background 0.12s; }
        .sv-btn-clear:hover { background: #f5f5f4; }

        /* CTA */
        .sv-cta-bar { background: #fff; border-radius: 10px; border: 0.5px solid #e5e5e5; padding: 14px 16px; display: flex; align-items: center; justify-content: space-between; gap: 12px; }
        .sv-cta-title { font-size: 13px; font-weight: 500; color: #111; }
        .sv-cta-sub { font-size: 12px; color: #999; font-weight: 300; margin-top: 2px; }
        .sv-cta-right { display: flex; align-items: center; gap: 8px; flex-shrink: 0; }
        .sv-cta-select { font-family: 'DM Sans', sans-serif; font-size: 12px; padding: 7px 10px; border: 0.5px solid #ddd; border-radius: 7px; background: #fff; color: #111; outline: none; }
        .sv-cta-btn { font-family: 'DM Sans', sans-serif; font-size: 12px; font-weight: 400; padding: 8px 16px; border-radius: 7px; background: #111; color: #fff; border: none; cursor: pointer; white-space: nowrap; transition: opacity 0.15s; }
        .sv-cta-btn:hover:not(:disabled) { opacity: 0.8; }
        .sv-cta-btn:disabled { opacity: 0.4; cursor: not-allowed; }

        /* Difficulty grid */
        .sv-section-label { font-size: 11px; font-weight: 500; color: #999; letter-spacing: 0.06em; text-transform: uppercase; margin-bottom: 8px; }
        .sv-difficulty-grid { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 10px; }
        .sv-diff-col { background: #fff; border-radius: 10px; border: 0.5px solid #e5e5e5; overflow: hidden; }
        .sv-diff-header { padding: 10px 12px; border-bottom: 0.5px solid #e5e5e5; display: flex; align-items: center; justify-content: space-between; }
        .sv-diff-title { font-size: 12px; font-weight: 500; color: #111; }
        .sv-diff-count { font-size: 11px; color: #bbb; background: #f5f5f4; border-radius: 999px; padding: 2px 8px; }
        .sv-diff-body { padding: 8px; display: flex; flex-direction: column; gap: 6px; }
        .sv-diff-empty { padding: 16px; font-size: 12px; color: #ccc; text-align: center; font-weight: 300; }
        .sv-q-item { background: #f9f9f8; border-radius: 7px; padding: 10px; border: 0.5px solid #f0f0f0; }
        .sv-q-num { font-size: 10px; color: #bbb; margin-bottom: 4px; letter-spacing: 0.04em; }
        .sv-q-text { font-size: 12px; color: #111; line-height: 1.5; font-weight: 300; }
        .sv-q-badge { display: inline-block; font-size: 10px; padding: 2px 7px; border-radius: 999px; margin-top: 6px; font-weight: 500; }
        .sv-badge-t { background: #EEF2FF; color: #4338CA; }
        .sv-badge-p { background: #ECFDF5; color: #065F46; }

        @media (max-width: 700px) {
          .sv-body { grid-template-columns: 1fr; }
          .sv-difficulty-grid { grid-template-columns: 1fr; }
        }
      `}</style>

      <div className="sv-root">

        {/* ── TOPBAR ── */}
        <div className="sv-topbar">
          <div className="sv-brand" onClick={() => navigate('/dashboard')}>
            <div className="sv-brand-dot">
              <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
                <circle cx="6" cy="6" r="4" fill="white" />
                <circle cx="6" cy="6" r="2" fill="#111" />
              </svg>
            </div>
            InterviewMate
          </div>
          <div className="sv-topbar-right">
            <button type="button" className="sv-back" onClick={() => navigate('/dashboard')}>
              ← Dashboard
            </button>
            <div className="sv-avatar">IM</div>
          </div>
        </div>

        {/* ── BODY ── */}
        <div className="sv-body">

          {/* ── SIDEBAR ── */}
          <div className="sv-sidebar">

            {/* Estado micrófono */}
            <div>
              <div className="sv-sidebar-label">Estado</div>
              <div className="sv-status-row">
                <span className={`sv-pill ${speechSupported ? 'sv-pill-ready' : 'sv-pill-muted'}`}>
                  {speechSupported ? 'Micrófono disponible' : 'Sin SpeechRecognition'}
                </span>
                <span className={`sv-pill ${listening ? 'sv-pill-live' : 'sv-pill-idle'}`}>
                  {listening ? 'Escuchando' : 'Inactivo'}
                </span>
              </div>
            </div>

            {/* Botón micrófono */}
            <div className="sv-mic-wrap">
              <button
                type="button"
                className={`sv-mic-btn ${listening ? 'sv-live' : ''}`}
                onClick={onToggleMic}
                title={listening ? 'Detener micrófono' : 'Abrir micrófono'}
              >
                <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
                  <rect x="7" y="2" width="8" height="13" rx="4" fill="white" />
                  <path d="M3 11c0 4.4 3.6 8 8 8s8-3.6 8-8" stroke="white" strokeWidth="1.6" strokeLinecap="round" fill="none" />
                  <line x1="11" y1="19" x2="11" y2="22" stroke="white" strokeWidth="1.6" strokeLinecap="round" />
                </svg>
              </button>
              <span className={`sv-mic-label ${listening ? 'sv-live' : ''}`}>
                {listening ? 'Escuchando ahora… pulsa para detener' : 'Pulsa para dictar'}
              </span>
            </div>

            {/* Idioma */}
            <div className="sv-field">
              <label className="sv-label" htmlFor="lang">Idioma de dictado</label>
              <select
                id="lang"
                className="sv-select"
                value={selectedLanguage}
                disabled={listening}
                onChange={(e) => setSelectedLanguage(e.target.value)}
              >
                {LANGUAGE_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>

            <hr className="sv-sep" />

            {/* Cargar sesión existente */}
            <div>
              <div className="sv-sidebar-label">Cargar sesión</div>
              <div className="sv-load-row">
                <input
                  className="sv-input"
                  placeholder="studySessionId"
                  value={studyIdToLoad}
                  onChange={(e) => setStudyIdToLoad(e.target.value)}
                />
                <button
                  type="button"
                  className="sv-load-btn"
                  onClick={onLoadStudy}
                  disabled={loading || !studyIdToLoad.trim()}
                >
                  {loading ? '…' : 'Cargar'}
                </button>
              </div>
            </div>

            {/* Sesión activa */}
            {session && (
              <div>
                <div className="sv-sidebar-label">Sesión activa</div>
                <div className="sv-session-card">
                  <div className="sv-session-row">
                    <span className="sv-session-key">ID</span>
                    <span className="sv-session-val">{session.id.slice(0, 8)}</span>
                  </div>
                  <hr className="sv-sep" />
                  <div>
                    <div className="sv-session-key" style={{ marginBottom: 3 }}>Tema detectado</div>
                    <div className="sv-session-topic">{session.topic || '—'}</div>
                  </div>
                  <div className="sv-session-row">
                    <span className="sv-session-key">Preguntas</span>
                    <span className="sv-session-val">{totalQuestions}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Mensajes */}
            {error   && <p className="sv-alert-error">{error}</p>}
            {success && <p className="sv-alert-success">{success}</p>}
          </div>

          {/* ── MAIN ── */}
          <div className="sv-main">

            {/* Header */}
            <div>
              <div className="sv-main-title">
                Study Voice Lab, <em>habla y aprende</em>
              </div>
              <div className="sv-main-sub">
                Dicta el tema, genera preguntas con IA e inicia una entrevista desde tu voz
              </div>
            </div>

            {/* Transcript card */}
            <div className="sv-transcript-card">
              <div className="sv-transcript-header">
                <span className="sv-transcript-title">Transcripción</span>
                {listening
                  ? <span className="sv-transcript-live-badge">EN VIVO</span>
                  : <span className="sv-transcript-idle-badge">Editable</span>
                }
              </div>
              <div className="sv-transcript-body">
                <textarea
                  className="sv-textarea"
                  rows={6}
                  placeholder="Ej. Quiero estudiar React hooks, renderizado, memoización y casos de entrevistas técnicas…"
                  value={finalTranscript}
                  onChange={(e) => { setTranscript(e.target.value); setInterimTranscript('') }}
                />
              </div>
              <div className="sv-transcript-actions">
                <button type="button" className="sv-btn-clear" onClick={onClear}>
                  Limpiar
                </button>
                <button
                  type="button"
                  className="sv-btn-generate"
                  onClick={onGenerateStudyMaterial}
                  disabled={loading || !finalTranscript.trim()}
                >
                  {loading ? 'Generando…' : 'Generar material de estudio →'}
                </button>
              </div>
            </div>

            {/* CTA entrevista — solo si hay sesión con preguntas */}
            {session && totalQuestions > 0 && (
              <>
                <div className="sv-cta-bar">
                  <div>
                    <div className="sv-cta-title">¿Listo para practicar?</div>
                    <div className="sv-cta-sub">
                      Inicia una entrevista basada en <strong>{session.topic || 'tu transcripción'}</strong>
                    </div>
                  </div>
                  <div className="sv-cta-right">
                    <select
                      className="sv-cta-select"
                      value={interviewType}
                      onChange={(e) => setInterviewType(e.target.value as InterviewType)}
                    >
                      {Object.entries(INTERVIEW_TYPE_LABEL).map(([value, label]) => (
                        <option key={value} value={value}>{label}</option>
                      ))}
                    </select>
                    <button
                      type="button"
                      className="sv-cta-btn"
                      onClick={onStartInterview}
                      disabled={startingInterview}
                    >
                      {startingInterview ? 'Iniciando…' : 'Iniciar entrevista →'}
                    </button>
                  </div>
                </div>

                {/* Banco de preguntas */}
                <div>
                  <div className="sv-section-label">Banco de preguntas generado</div>
                  <div className="sv-difficulty-grid">
                    {DIFFICULTIES.map((difficulty) => {
                      const questions = groupedByDifficulty[difficulty]
                      return (
                        <div className="sv-diff-col" key={difficulty}>
                          <div className="sv-diff-header">
                            <span className="sv-diff-title">{DIFFICULTY_LABEL[difficulty]}</span>
                            <span className="sv-diff-count">{questions.length}</span>
                          </div>
                          <div className="sv-diff-body">
                            {questions.length === 0
                              ? <div className="sv-diff-empty">Sin preguntas</div>
                              : questions.map((q) => <QuestionCard key={q.id} question={q} />)
                            }
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </>
            )}

          </div>
        </div>
      </div>
    </>
  )
}

export default StudyVoicePage
import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  loadStudySession,
  regenerateStudySessionQuestions,
  startInterviewFromStudy,
  startStudySession,
} from '../controllers/studyController'
import type { InterviewType } from '../models/interview'
import type { StudyDifficulty, StudyQuestion, StudyQuestionType, StudySession } from '../models/study'


  <link href="https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;1,9..40,300&display=swap" rel="stylesheet" />


// ── Labels ────────────────────────────────────────────────────────────────
const DIFFICULTY_LABEL: Record<StudyDifficulty, string> = {
  BASIC:        'Básico',
  INTERMEDIATE: 'Intermedio',
  ADVANCED:     'Avanzado',
}

const QUESTION_TYPE_LABEL: Record<StudyQuestionType, string> = {
  THEORETICAL: 'Teórica',
  PRACTICAL:   'Práctica',
}

const INTERVIEW_TYPE_LABEL: Record<string, string> = {
  TECHNICAL:     'Técnica',
  HR:            'RRHH',
  PSYCHOLOGICAL: 'Psicológica',
}

const DIFFICULTIES: StudyDifficulty[] = ['BASIC', 'INTERMEDIATE', 'ADVANCED']

// ── Componente pregunta ───────────────────────────────────────────────────
function QuestionCard({ question }: { question: StudyQuestion }) {
  const badgeClass =
    question.type === 'PRACTICAL' ? 'sp-badge-practical' : 'sp-badge-theoretical'

  return (
    <div className="sp-q-item">
      <div className="sp-q-num">
        {String(question.orderIndex).padStart(2, '0')}
      </div>
      <div className="sp-q-text">{question.questionText}</div>
      <span className={`sp-q-badge ${badgeClass}`}>
        {QUESTION_TYPE_LABEL[question.type]}
      </span>
    </div>
  )
}


function StudyPage() {
  const navigate = useNavigate()

  
  const [sidebarTab, setSidebarTab] = useState<'new' | 'load'>('new')

  // Formulario nueva sesión
  const [topic, setTopic]         = useState('')
  const [audioFile, setAudioFile] = useState('')

  // Cargar sesión existente
  const [studyIdToLoad, setStudyIdToLoad] = useState('')

  // Tipo de entrevista para lanzar
  const [interviewType, setInterviewType] = useState<InterviewType>('TECHNICAL')

  // Estado de sesión activa
  const [session, setSession] = useState<StudySession | null>(null)

  // Estados de carga
  const [loading, setLoading]                   = useState(false)
  const [generating, setGenerating]             = useState(false)
  const [startingInterview, setStartingInterview] = useState(false)

  // Mensajes
  const [error, setError]     = useState('')
  const [success, setSuccess] = useState('')

  // ── Preguntas agrupadas por dificultad ──────────────────────────────────
  const groupedByDifficulty = useMemo(() => {
    const base: Record<StudyDifficulty, StudyQuestion[]> = {
      BASIC:        [],
      INTERMEDIATE: [],
      ADVANCED:     [],
    }
    for (const q of session?.questions ?? []) {
      base[q.difficulty].push(q)
    }
    return base
  }, [session])

  const totalQuestions = session?.questions.length ?? 0

  const resetMessages = () => { setError(''); setSuccess('') }


  const onStartStudy = async () => {
    setLoading(true)
    resetMessages()
    try {
      const created = await startStudySession({ topic, audioFile })
      setSession(created)
      setSuccess('Sesión creada. Genera las preguntas cuando estés listo.')
    } catch (err) {
      setError((err as Error).message)
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
      setSuccess('Sesión cargada correctamente.')
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setLoading(false)
    }
  }

  const onGenerateQuestions = async () => {
    if (!session) return
    setGenerating(true)
    resetMessages()
    try {
      const updated = await regenerateStudySessionQuestions(session.id)
      setSession(updated)
      setSuccess('Preguntas generadas correctamente.')
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setGenerating(false)
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
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setStartingInterview(false)
    }
  }

  return (
    <>
      <style>{`
        .sp * { box-sizing: border-box; margin: 0; padding: 0; }

        /* ── RAÍZ ── */
        .sp-root {
          font-family: 'DM Sans', sans-serif;
          background: #f5f5f4;
          min-height: 100vh;
          display: grid;
          grid-template-rows: 52px 1fr;
        }

        /* ── TOPBAR ── */
        .sp-topbar {
          background: #fff;
          border-bottom: 0.5px solid #e5e5e5;
          padding: 0 2rem;
          display: flex; align-items: center; justify-content: space-between;
          position: sticky; top: 0; z-index: 10;
        }
        .sp-brand {
          display: flex; align-items: center; gap: 8px;
          font-size: 14px; font-weight: 500; color: #111; cursor: pointer;
        }
        .sp-brand-dot {
          width: 20px; height: 20px; border-radius: 5px; background: #111;
          display: flex; align-items: center; justify-content: center;
        }
        .sp-topbar-right { display: flex; align-items: center; gap: 10px; }
        .sp-back {
          font-size: 12px; color: #888; border: 0.5px solid #e5e5e5;
          border-radius: 6px; padding: 5px 10px; background: none;
          cursor: pointer; font-family: 'DM Sans', sans-serif;
          display: flex; align-items: center; gap: 5px; transition: background 0.12s;
        }
        .sp-back:hover { background: #f5f5f4; color: #111; }
        .sp-avatar {
          width: 30px; height: 30px; border-radius: 50%;
          background: #EEEDFE; display: flex; align-items: center; justify-content: center;
          font-size: 11px; font-weight: 500; color: #534AB7; border: 0.5px solid #ddd;
        }

        /* ── BODY ── */
        .sp-body { display: grid; grid-template-columns: 296px 1fr; min-height: 0; }

        /* ── SIDEBAR ── */
        .sp-sidebar {
          background: #fff; border-right: 0.5px solid #e5e5e5;
          padding: 1.5rem; display: flex; flex-direction: column; gap: 1.25rem;
          overflow-y: auto;
        }
        .sp-sidebar-label {
          font-size: 10px; letter-spacing: 0.1em;
          text-transform: uppercase; color: #bbb; margin-bottom: 6px;
        }

        /* Tabs */
        .sp-tabs {
          display: flex; gap: 4px;
          background: #f5f5f4; padding: 3px; border-radius: 8px;
        }
        .sp-tab {
          flex: 1; font-family: 'DM Sans', sans-serif; font-size: 12px;
          padding: 6px; border-radius: 6px; border: none; background: none;
          cursor: pointer; color: #888; transition: all 0.12s;
        }
        .sp-tab.sp-tab-on {
          background: #fff; color: #111; font-weight: 500;
          box-shadow: 0 0.5px 2px rgba(0,0,0,0.08);
        }

        /* Form */
        .sp-form { display: flex; flex-direction: column; gap: 10px; }
        .sp-field { display: flex; flex-direction: column; gap: 4px; }
        .sp-field-header { display: flex; align-items: center; justify-content: space-between; }
        .sp-label { font-size: 11px; font-weight: 500; color: #666; }
        .sp-hint  { font-size: 11px; color: #bbb; }
        .sp-input, .sp-select {
          font-family: 'DM Sans', sans-serif; font-size: 12px; font-weight: 300;
          padding: 8px 10px; border: 0.5px solid #ddd; border-radius: 7px;
          background: #fff; color: #111; outline: none;
          transition: border-color 0.15s; width: 100%;
        }
        .sp-input:focus, .sp-select:focus { border-color: #aaa; }
        .sp-input::placeholder { color: #ccc; }

        /* Buttons */
        .sp-btn-primary {
          font-family: 'DM Sans', sans-serif; font-size: 12px; font-weight: 400;
          padding: 9px 14px; border-radius: 7px; background: #111; color: #fff;
          border: none; cursor: pointer; width: 100%; transition: opacity 0.15s;
          display: flex; align-items: center; justify-content: center; gap: 7px;
        }
        .sp-btn-primary:hover:not(:disabled) { opacity: 0.8; }
        .sp-btn-primary:disabled { opacity: 0.4; cursor: not-allowed; }
        .sp-btn-ghost {
          font-family: 'DM Sans', sans-serif; font-size: 12px; font-weight: 400;
          padding: 8px 14px; border-radius: 7px; background: transparent; color: #555;
          border: 0.5px solid #e5e5e5; cursor: pointer; width: 100%;
          transition: background 0.15s;
          display: flex; align-items: center; justify-content: center; gap: 7px;
        }
        .sp-btn-ghost:hover:not(:disabled) { background: #f5f5f4; }
        .sp-btn-ghost:disabled { opacity: 0.4; cursor: not-allowed; }

        /* Alerts */
        .sp-alert-error {
          font-size: 11px; color: #dc2626; background: #FEF2F2;
          border: 0.5px solid #FECACA; border-radius: 6px; padding: 8px 10px;
        }
        .sp-alert-success {
          font-size: 11px; color: #166534; background: #DCFCE7;
          border: 0.5px solid #BBF7D0; border-radius: 6px; padding: 8px 10px;
        }

        /* Sesión activa info */
        .sp-session-card {
          background: #f9f9f8; border: 0.5px solid #e5e5e5;
          border-radius: 8px; padding: 10px 12px;
          display: flex; flex-direction: column; gap: 7px;
        }
        .sp-session-row { display: flex; align-items: center; justify-content: space-between; }
        .sp-session-key   { font-size: 11px; color: #999; font-weight: 300; }
        .sp-session-val   { font-size: 11px; color: #111; font-weight: 500; font-family: monospace; }
        .sp-session-topic { font-size: 12px; color: #111; font-weight: 500; line-height: 1.4; }
        .sp-sep { border: none; border-top: 0.5px solid #e5e5e5; }

        /* ── MAIN ── */
        .sp-main {
          padding: 1.75rem; display: flex; flex-direction: column; gap: 1.25rem;
          overflow-y: auto;
        }
        .sp-main-title {
          font-family: 'Instrument Serif', serif;
          font-size: 1.5rem; font-weight: 400;
          letter-spacing: -0.02em; color: #111; line-height: 1.2;
        }
        .sp-main-title em { font-style: italic; color: #aaa; }
        .sp-main-sub { font-size: 13px; color: #999; font-weight: 300; margin-top: 3px; }

        /* Empty state */
        .sp-empty {
          background: #fff; border-radius: 12px;
          border: 0.5px dashed #e5e5e5; padding: 3.5rem 2rem;
          text-align: center; display: flex; flex-direction: column;
          align-items: center; gap: 10px;
        }
        .sp-empty-icon {
          width: 40px; height: 40px; border-radius: 10px;
          background: #f5f5f4; display: flex; align-items: center; justify-content: center;
        }
        .sp-empty h3 {
          font-family: 'Instrument Serif', serif; font-size: 1.2rem;
          font-weight: 400; color: #111; letter-spacing: -0.01em;
        }
        .sp-empty p { font-size: 13px; color: #bbb; font-weight: 300; max-width: 32ch; line-height: 1.55; }

        /* CTA lanzar entrevista */
        .sp-cta-bar {
          background: #fff; border-radius: 10px; border: 0.5px solid #e5e5e5;
          padding: 14px 16px;
          display: flex; align-items: center; justify-content: space-between; gap: 12px;
        }
        .sp-cta-left { display: flex; flex-direction: column; gap: 2px; }
        .sp-cta-title { font-size: 13px; font-weight: 500; color: #111; }
        .sp-cta-sub   { font-size: 12px; color: #999; font-weight: 300; }
        .sp-cta-right { display: flex; align-items: center; gap: 8px; flex-shrink: 0; }
        .sp-cta-select {
          font-family: 'DM Sans', sans-serif; font-size: 12px;
          padding: 7px 10px; border: 0.5px solid #ddd; border-radius: 7px;
          background: #fff; color: #111; outline: none;
        }
        .sp-cta-btn {
          font-family: 'DM Sans', sans-serif; font-size: 12px; font-weight: 400;
          padding: 8px 16px; border-radius: 7px; background: #111; color: #fff;
          border: none; cursor: pointer; white-space: nowrap; transition: opacity 0.15s;
        }
        .sp-cta-btn:hover:not(:disabled) { opacity: 0.8; }
        .sp-cta-btn:disabled { opacity: 0.4; cursor: not-allowed; }

        /* Section label */
        .sp-section-label {
          font-size: 11px; font-weight: 500; color: #999;
          letter-spacing: 0.06em; text-transform: uppercase; margin-bottom: 8px;
        }

        /* Difficulty grid */
        .sp-difficulty-grid { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 10px; }
        .sp-diff-col {
          background: #fff; border-radius: 10px;
          border: 0.5px solid #e5e5e5; overflow: hidden;
        }
        .sp-diff-header {
          padding: 10px 12px; border-bottom: 0.5px solid #e5e5e5;
          display: flex; align-items: center; justify-content: space-between;
        }
        .sp-diff-title { font-size: 12px; font-weight: 500; color: #111; }
        .sp-diff-count {
          font-size: 11px; color: #bbb;
          background: #f5f5f4; border-radius: 999px; padding: 2px 8px;
        }
        .sp-diff-body { padding: 8px; display: flex; flex-direction: column; gap: 6px; }
        .sp-diff-empty { padding: 16px; font-size: 12px; color: #ccc; text-align: center; font-weight: 300; }

        /* Question card */
        .sp-q-item {
          background: #f9f9f8; border-radius: 7px;
          padding: 10px; border: 0.5px solid #f0f0f0;
        }
        .sp-q-num  { font-size: 10px; color: #bbb; margin-bottom: 4px; letter-spacing: 0.04em; }
        .sp-q-text { font-size: 12px; color: #111; line-height: 1.5; font-weight: 300; }
        .sp-q-badge {
          display: inline-block; font-size: 10px;
          padding: 2px 7px; border-radius: 999px; margin-top: 6px; font-weight: 500;
        }
        .sp-badge-theoretical { background: #EEF2FF; color: #4338CA; }
        .sp-badge-practical   { background: #ECFDF5; color: #065F46; }

        /* Responsive */
        @media (max-width: 700px) {
          .sp-body { grid-template-columns: 1fr; }
          .sp-difficulty-grid { grid-template-columns: 1fr; }
        }
      `}</style>

      <div className="sp-root">

        {/* ── TOPBAR ── */}
        <div className="sp-topbar">
          <div className="sp-brand" onClick={() => navigate('/dashboard')}>
            <div className="sp-brand-dot">
              <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
                <circle cx="6" cy="6" r="4" fill="white" />
                <circle cx="6" cy="6" r="2" fill="#111" />
              </svg>
            </div>
            InterviewMate
          </div>
          <div className="sp-topbar-right">
            <button type="button" className="sp-back" onClick={() => navigate('/dashboard')}>
              ← Dashboard
            </button>
            <div className="sp-avatar">IM</div>
          </div>
        </div>

        {/* ── BODY ── */}
        <div className="sp-body">

          {/* ── SIDEBAR ── */}
          <div className="sp-sidebar">

            {/* Tabs nueva / cargar */}
            <div>
              <div className="sp-sidebar-label">Sesión de estudio</div>
              <div className="sp-tabs">
                <button
                  type="button"
                  className={`sp-tab ${sidebarTab === 'new' ? 'sp-tab-on' : ''}`}
                  onClick={() => setSidebarTab('new')}
                >
                  Nueva
                </button>
                <button
                  type="button"
                  className={`sp-tab ${sidebarTab === 'load' ? 'sp-tab-on' : ''}`}
                  onClick={() => setSidebarTab('load')}
                >
                  Cargar
                </button>
              </div>
            </div>

            {/* ── TAB: NUEVA SESIÓN ── */}
            {sidebarTab === 'new' && (
              <div className="sp-form">
                <div className="sp-field">
                  <div className="sp-field-header">
                    <label className="sp-label" htmlFor="topic">Tema</label>
                    <span className="sp-hint">opcional</span>
                  </div>
                  <input
                    id="topic"
                    className="sp-input"
                    placeholder="React Hooks, Spring Security…"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                  />
                </div>
                <div className="sp-field">
                  <div className="sp-field-header">
                    <label className="sp-label" htmlFor="audioFile">Referencia de audio</label>
                    <span className="sp-hint">opcional</span>
                  </div>
                  <input
                    id="audioFile"
                    className="sp-input"
                    placeholder="URL o nombre del archivo"
                    value={audioFile}
                    onChange={(e) => setAudioFile(e.target.value)}
                  />
                </div>
                <button
                  type="button"
                  className="sp-btn-primary"
                  onClick={onStartStudy}
                  disabled={loading || (!topic.trim() && !audioFile.trim())}
                >
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                    <circle cx="6" cy="6" r="5" stroke="white" strokeWidth="1.2" />
                    <path d="M6 3.5v5M3.5 6h5" stroke="white" strokeWidth="1.2" strokeLinecap="round" />
                  </svg>
                  {loading ? 'Creando sesión…' : 'Iniciar estudio'}
                </button>
              </div>
            )}

            {/* ── TAB: CARGAR SESIÓN ── */}
            {sidebarTab === 'load' && (
              <div className="sp-form">
                <div className="sp-field">
                  <label className="sp-label" htmlFor="studyId">Study Session ID</label>
                  <input
                    id="studyId"
                    className="sp-input"
                    placeholder="Pega el studySessionId"
                    value={studyIdToLoad}
                    onChange={(e) => setStudyIdToLoad(e.target.value)}
                  />
                </div>
                <button
                  type="button"
                  className="sp-btn-primary"
                  onClick={onLoadStudy}
                  disabled={loading || !studyIdToLoad.trim()}
                >
                  {loading ? 'Cargando…' : 'Cargar sesión'}
                </button>
              </div>
            )}

            {/* ── SESIÓN ACTIVA ── */}
            {session && (
              <>
                <hr className="sp-sep" />
                <div>
                  <div className="sp-sidebar-label">Sesión activa</div>
                  <div className="sp-session-card">
                    <div className="sp-session-row">
                      <span className="sp-session-key">ID</span>
                      <span className="sp-session-val">{session.id.slice(0, 8)}</span>
                    </div>
                    <hr className="sp-sep" />
                    <div>
                      <div className="sp-session-key" style={{ marginBottom: 3 }}>Tema</div>
                      <div className="sp-session-topic">{session.topic || '—'}</div>
                    </div>
                    <div className="sp-session-row">
                      <span className="sp-session-key">Preguntas</span>
                      <span className="sp-session-val">{session.questions.length}</span>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  className="sp-btn-ghost"
                  onClick={onGenerateQuestions}
                  disabled={generating}
                >
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                    <path d="M10 6A4 4 0 112 6" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
                    <path d="M10 3v3h-3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  {generating ? 'Generando…' : 'Regenerar preguntas'}
                </button>
              </>
            )}

            {/* Mensajes */}
            {error   && <p className="sp-alert-error">{error}</p>}
            {success && <p className="sp-alert-success">{success}</p>}
          </div>

          {/* ── MAIN ── */}
          <div className="sp-main">

            {/* Header */}
            <div>
              <div className="sp-main-title">
                {session
                  ? <>Banco de preguntas, <em>por dificultad</em></>
                  : <>Modo estudio, <em>desde cero</em></>}
              </div>
              <div className="sp-main-sub">
                {session
                  ? `${totalQuestions} pregunta${totalQuestions !== 1 ? 's' : ''} · ${session.topic || 'Sin tema'}`
                  : 'Crea o carga una sesión desde el panel izquierdo para comenzar.'}
              </div>
            </div>

            {/* Sin sesión activa */}
            {!session && (
              <div className="sp-empty">
                <div className="sp-empty-icon">
                  <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                    <rect x="2" y="2" width="14" height="14" rx="3" stroke="#ccc" strokeWidth="1.2" />
                    <path d="M6 9h6M9 6v6" stroke="#ccc" strokeWidth="1.2" strokeLinecap="round" />
                  </svg>
                </div>
                <h3>Aún no hay sesión activa</h3>
                <p>Crea una nueva sesión con un tema o carga una existente por su ID.</p>
              </div>
            )}

            {/* Sesión activa sin preguntas */}
            {session && totalQuestions === 0 && (
              <div className="sp-empty">
                <div className="sp-empty-icon">
                  <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                    <path d="M4 6h10M4 9h7M4 12h5" stroke="#ccc" strokeWidth="1.2" strokeLinecap="round" />
                  </svg>
                </div>
                <h3>Sesión lista</h3>
                <p>Pulsa "Regenerar preguntas" en el panel izquierdo para generar el banco.</p>
              </div>
            )}

            {/* CTA + banco de preguntas */}
            {session && totalQuestions > 0 && (
              <>
                {/* CTA lanzar entrevista */}
                <div className="sp-cta-bar">
                  <div className="sp-cta-left">
                    <div className="sp-cta-title">¿Listo para practicar?</div>
                    <div className="sp-cta-sub">
                      Inicia una entrevista basada en <strong>{session.topic || 'este tema'}</strong>
                    </div>
                  </div>
                  <div className="sp-cta-right">
                    <select
                      className="sp-cta-select"
                      value={interviewType}
                      onChange={(e) => setInterviewType(e.target.value as InterviewType)}
                    >
                      {Object.entries(INTERVIEW_TYPE_LABEL).map(([value, label]) => (
                        <option key={value} value={value}>{label}</option>
                      ))}
                    </select>
                    <button
                      type="button"
                      className="sp-cta-btn"
                      onClick={onStartInterview}
                      disabled={startingInterview}
                    >
                      {startingInterview ? 'Iniciando…' : 'Iniciar entrevista →'}
                    </button>
                  </div>
                </div>

                {/* Columnas por dificultad */}
                <div>
                  <div className="sp-section-label">Preguntas generadas</div>
                  <div className="sp-difficulty-grid">
                    {DIFFICULTIES.map((difficulty) => {
                      const questions = groupedByDifficulty[difficulty]
                      return (
                        <div className="sp-diff-col" key={difficulty}>
                          <div className="sp-diff-header">
                            <span className="sp-diff-title">{DIFFICULTY_LABEL[difficulty]}</span>
                            <span className="sp-diff-count">{questions.length}</span>
                          </div>
                          <div className="sp-diff-body">
                            {questions.length === 0 ? (
                              <div className="sp-diff-empty">Sin preguntas</div>
                            ) : (
                              questions.map((q) => (
                                <QuestionCard key={q.id} question={q} />
                              ))
                            )}
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

export default StudyPage
import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { loadInterviewSessionData, type InterviewSessionData } from '../controllers/interviewSessionController'
import {
  getStudyModulesHistory,
  type StudyModuleHistoryItem,
} from '../lib/studyModulesHistory'
import type { InterviewType } from '../models/interview'

function InterviewSessionPage() {
  const { sessionId } = useParams<{ sessionId: string }>()
  const navigate = useNavigate()
  const [data, setData] = useState<InterviewSessionData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [modules, setModules] = useState<StudyModuleHistoryItem[]>([])

  const [interviewType, setInterviewType] = useState<InterviewType>('TECHNICAL')
  const [level, setLevel] = useState('MID')
  const [focus, setFocus] = useState('Resolver preguntas de forma estructurada')
  const [duration, setDuration] = useState('15')
  const [selectedModuleId, setSelectedModuleId] = useState('')

  useEffect(() => {
    if (!sessionId) return
    void refresh(sessionId)
  }, [sessionId])

  useEffect(() => {
    setModules(getStudyModulesHistory())
  }, [])

  const refresh = async (id: string) => {
    setLoading(true)
    setError('')
    try {
      const sessionData = await loadInterviewSessionData(id)
      setData(sessionData)
    } catch (loadError) {
      setError((loadError as Error).message)
    } finally {
      setLoading(false)
    }
  }

  const onContinueToLiveInterview = () => {
    if (!sessionId) return

    const selectedModule = modules.find((module) => module.id === selectedModuleId) ?? null

    navigate(`/interview/live/${sessionId}`, {
      state: {
        prep: {
          interviewType,
          level,
          focus,
          durationMinutes: Number(duration),
          module: selectedModule,
        },
      },
    })
  }

  const interviewTypeLabel: Record<InterviewType, string> = {
    TECHNICAL: 'Técnica',
    HR: 'RRHH',
    PSYCHOLOGICAL: 'Psicológica',
  }

  const avatarMessage: Record<InterviewType, string> = {
    TECHNICAL:
      'Excelente decisión. Enfócate en explicar tu razonamiento paso a paso y piensa en voz alta.',
    HR: 'Conecta tus respuestas con experiencias reales. Tu autenticidad será tu mejor fortaleza.',
    PSYCHOLOGICAL:
      'Respira y mantén claridad. Responder con calma y coherencia te hará destacar.',
  }

  if (loading) {
    return (
      <section className="prep-loading">
        <p>Cargando sesión...</p>
      </section>
    )
  }

  if (!data) {
    return (
      <section className="prep-loading">
        <p>No se encontró la sesión.</p>
      </section>
    )
  }

  return (
    <>
      <style>{`
        .prep-root {
          min-height: 100vh;
          width: 100vw;
          display: flex;
          align-items: stretch;
          justify-content: stretch;
          background: linear-gradient(160deg, #f5f5f4 0%, #ecebff 100%);
          padding: 0;
          font-family: 'DM Sans', sans-serif;
        }
        .prep-loading {
          min-height: 100vh;
          width: 100vw;
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: 'DM Sans', sans-serif;
          color: #666;
        }
        .prep-modal {
          width: 100%;
          background: #fff;
          border: none;
          border-radius: 0;
          box-shadow: none;
          overflow: hidden;
          display: grid;
          grid-template-columns: 1.2fr 1fr;
          min-height: 100vh;
        }
        .prep-left {
          padding: 2.25rem;
          border-right: 0.5px solid #ececec;
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
        }
        .prep-right {
          padding: 2.25rem;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          background: radial-gradient(circle at 30% 20%, #f3f2ff 0%, #fff 58%);
        }
        .prep-overline {
          font-size: 12px;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: #9ca3af;
        }
        .prep-title {
          font-size: 1.95rem;
          color: #111;
          line-height: 1.2;
          font-weight: 500;
        }
        .prep-sub {
          font-size: 15px;
          color: #7b7b7b;
          font-weight: 300;
          line-height: 1.5;
        }
        .prep-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 14px;
        }
        .prep-field {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }
        .prep-field-full {
          grid-column: 1 / -1;
        }
        .prep-label {
          font-size: 13px;
          color: #666;
          font-weight: 500;
        }
        .prep-select,
        .prep-input {
          font-family: 'DM Sans', sans-serif;
          border: 0.5px solid #ddd;
          border-radius: 8px;
          padding: 12px 12px;
          font-size: 14px;
          background: #fff;
        }
        .prep-hint {
          font-size: 13px;
          color: #999;
        }
        .prep-module-card {
          border: 0.5px solid #e9e9e9;
          border-radius: 10px;
          background: #f9f9f8;
          padding: 10px;
          display: flex;
          flex-direction: column;
          gap: 6px;
        }
        .prep-module-topic {
          font-size: 14px;
          color: #111;
          font-weight: 500;
        }
        .prep-module-meta {
          font-size: 12px;
          color: #888;
        }
        .prep-actions {
          margin-top: auto;
          display: flex;
          justify-content: space-between;
          gap: 10px;
          padding-top: 8px;
        }
        .prep-btn-secondary,
        .prep-btn-primary {
          border-radius: 8px;
          border: none;
          padding: 12px 16px;
          font-size: 14px;
          cursor: pointer;
          font-family: 'DM Sans', sans-serif;
        }
        .prep-btn-secondary {
          background: #f5f5f4;
          color: #666;
          border: 0.5px solid #e5e5e5;
        }
        .prep-btn-primary {
          background: #111;
          color: #fff;
        }
        .prep-avatar-wrap {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 14px;
        }
        .prep-avatar {
          width: 260px;
          height: 260px;
          border-radius: 999px;
          border: 3px solid #e7e4ff;
          background: linear-gradient(160deg, #fcfcff 0%, #f1f0ff 100%);
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .prep-card {
          background: #fff;
          border: 0.5px solid #ececec;
          border-radius: 10px;
          padding: 14px;
        }
        .prep-card-title {
          font-size: 12px;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          color: #9ca3af;
          margin-bottom: 6px;
        }
        .prep-card-text {
          font-size: 14px;
          color: #4b5563;
          line-height: 1.55;
        }
        .prep-error {
          font-size: 14px;
          color: #b91c1c;
          background: #fef2f2;
          border: 0.5px solid #fecaca;
          border-radius: 8px;
          padding: 10px 12px;
        }
        @media (max-width: 860px) {
          .prep-modal {
            grid-template-columns: 1fr;
          }
          .prep-left {
            border-right: none;
            border-bottom: 0.5px solid #ececec;
          }
          .prep-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>

      <section className="prep-root">
        <div className="prep-modal" role="dialog" aria-modal="true" aria-label="Preparación de entrevista">
          <div className="prep-left">
            <div className="prep-overline">Antes de iniciar</div>
            <h2 className="prep-title">Configura tu entrevista en vivo</h2>
            <p className="prep-sub">
              Esta sección prepara la simulación para el cargo <strong>{data.session.templatePosition}</strong>.
            </p>

            {error && <p className="prep-error">{error}</p>}

            <div className="prep-grid">
              <div className="prep-field">
                <label className="prep-label" htmlFor="prep-type">Tipo de entrevista</label>
                <select
                  id="prep-type"
                  className="prep-select"
                  value={interviewType}
                  onChange={(event) => setInterviewType(event.target.value as InterviewType)}
                >
                  <option value="TECHNICAL">Técnica</option>
                  <option value="HR">RRHH</option>
                  <option value="PSYCHOLOGICAL">Psicológica</option>
                </select>
              </div>

              <div className="prep-field">
                <label className="prep-label" htmlFor="prep-level">Nivel objetivo</label>
                <select
                  id="prep-level"
                  className="prep-select"
                  value={level}
                  onChange={(event) => setLevel(event.target.value)}
                >
                  <option value="JUNIOR">Junior</option>
                  <option value="MID">Mid</option>
                  <option value="SENIOR">Senior</option>
                </select>
              </div>

              <div className="prep-field prep-field-full">
                <label className="prep-label" htmlFor="prep-focus">Enfoque principal</label>
                <input
                  id="prep-focus"
                  className="prep-input"
                  value={focus}
                  onChange={(event) => setFocus(event.target.value)}
                  placeholder="Ej. Comunicación, algoritmos, liderazgo"
                />
              </div>

              <div className="prep-field">
                <label className="prep-label" htmlFor="prep-duration">Duración estimada</label>
                <select
                  id="prep-duration"
                  className="prep-select"
                  value={duration}
                  onChange={(event) => setDuration(event.target.value)}
                >
                  <option value="10">10 min</option>
                  <option value="15">15 min</option>
                  <option value="20">20 min</option>
                  <option value="30">30 min</option>
                </select>
              </div>

              <div className="prep-field">
                <label className="prep-label" htmlFor="prep-module">Módulo de estudio (opcional)</label>
                <select
                  id="prep-module"
                  className="prep-select"
                  value={selectedModuleId}
                  onChange={(event) => setSelectedModuleId(event.target.value)}
                >
                  <option value="">Sin módulo</option>
                  {modules.map((module) => (
                    <option key={module.id} value={module.id}>
                      {module.topic}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {modules.length === 0 ? (
              <p className="prep-hint">
                No tienes módulos de estudio en el historial. Puedes continuar sin módulo.
              </p>
            ) : (
              <div className="prep-module-card">
                <div className="prep-module-topic">
                  {selectedModuleId
                    ? modules.find((module) => module.id === selectedModuleId)?.topic ?? 'Sin módulo seleccionado'
                    : 'Sin módulo seleccionado'}
                </div>
                <div className="prep-module-meta">
                  {selectedModuleId
                    ? `${modules.find((module) => module.id === selectedModuleId)?.questionsCount ?? 0} preguntas generadas`
                    : 'Puedes iniciar sin seleccionar un módulo'}
                </div>
              </div>
            )}

            <div className="prep-actions">
              <button
                type="button"
                className="prep-btn-secondary"
                onClick={() => navigate('/dashboard')}
              >
                Cancelar
              </button>
              <button
                type="button"
                className="prep-btn-primary"
                onClick={onContinueToLiveInterview}
              >
                Entrar a la llamada →
              </button>
            </div>
          </div>

          <aside className="prep-right">
            <div className="prep-avatar-wrap">
              <div className="prep-avatar" aria-hidden="true">
                <svg width="180" height="180" viewBox="0 0 200 200" fill="none">
                  <defs>
                    <linearGradient id="botHead" x1="46" y1="26" x2="154" y2="154" gradientUnits="userSpaceOnUse">
                      <stop stopColor="#FDFEFF" />
                      <stop offset="1" stopColor="#E4E9F3" />
                    </linearGradient>
                    <linearGradient id="botScreen" x1="60" y1="58" x2="140" y2="136" gradientUnits="userSpaceOnUse">
                      <stop stopColor="#143053" />
                      <stop offset="1" stopColor="#0A1E3A" />
                    </linearGradient>
                    <linearGradient id="botBody" x1="70" y1="116" x2="128" y2="188" gradientUnits="userSpaceOnUse">
                      <stop stopColor="#FCFDFF" />
                      <stop offset="1" stopColor="#DEE5F2" />
                    </linearGradient>
                    <radialGradient id="botEye" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(0.5 0.5) rotate(90) scale(1)">
                      <stop stopColor="#74F5FF" />
                      <stop offset="1" stopColor="#25D8EA" />
                    </radialGradient>
                  </defs>

                  <ellipse cx="100" cy="192" rx="34" ry="6" fill="#D6DDF0" opacity="0.75" />

                  <rect x="30" y="74" width="22" height="40" rx="11" fill="#A7D4F0" />
                  <rect x="148" y="74" width="22" height="40" rx="11" fill="#A7D4F0" />

                  <rect x="42" y="28" width="116" height="104" rx="36" fill="url(#botHead)" stroke="#D7DEEA" strokeWidth="1.4" />
                  <rect x="58" y="46" width="84" height="66" rx="24" fill="url(#botScreen)" />

                  <ellipse cx="84" cy="78" rx="7" ry="10" fill="url(#botEye)" />
                  <ellipse cx="116" cy="78" rx="7" ry="10" fill="url(#botEye)" />
                  <path d="M84 96C89 102 95 105 100 105C105 105 111 102 116 96" stroke="#44E7F5" strokeWidth="4" strokeLinecap="round" />

                  <rect x="88" y="128" width="24" height="10" rx="5" fill="#B3C2DA" />

                  <path d="M65 142C65 127 77 115 92 115H108C123 115 135 127 135 142V150C135 169 119 184 100 184C81 184 65 169 65 150V142Z" fill="url(#botBody)" stroke="#D7DEEA" strokeWidth="1.2" />

                  <ellipse cx="72" cy="154" rx="12" ry="26" fill="#EFF3FA" transform="rotate(18 72 154)" />
                  <ellipse cx="128" cy="154" rx="12" ry="26" fill="#EFF3FA" transform="rotate(-18 128 154)" />

                  <ellipse cx="86" cy="182" rx="12" ry="8" fill="#EEF2FA" />
                  <ellipse cx="114" cy="182" rx="12" ry="8" fill="#EEF2FA" />
                </svg>
              </div>

              <div className="prep-card">
                <div className="prep-card-title">Avatar motivador · {interviewTypeLabel[interviewType]}</div>
                <p className="prep-card-text">{avatarMessage[interviewType]}</p>
              </div>
            </div>

            <div className="prep-card">
              <div className="prep-card-title">Estado de la sesión</div>
              <p className="prep-card-text">
                Preguntas detectadas: <strong>{data.questions.length}</strong>
                <br />
                Sesión: <strong>{data.session.id.slice(0, 8)}</strong>
                <br />
                Estado actual: <strong>{data.session.status}</strong>
              </p>
            </div>
          </aside>
        </div>
      </section>
    </>
  )
}

export default InterviewSessionPage

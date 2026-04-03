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
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(160deg, #f5f5f4 0%, #ecebff 100%);
          padding: 1.25rem;
          font-family: 'DM Sans', sans-serif;
        }
        .prep-loading {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: 'DM Sans', sans-serif;
          color: #666;
        }
        .prep-modal {
          width: min(960px, 100%);
          background: #fff;
          border: 0.5px solid #e5e5e5;
          border-radius: 16px;
          box-shadow: 0 24px 80px rgba(17, 17, 17, 0.08);
          overflow: hidden;
          display: grid;
          grid-template-columns: 1.2fr 1fr;
          min-height: 560px;
        }
        .prep-left {
          padding: 1.5rem;
          border-right: 0.5px solid #ececec;
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }
        .prep-right {
          padding: 1.5rem;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          background: radial-gradient(circle at 30% 20%, #f3f2ff 0%, #fff 58%);
        }
        .prep-overline {
          font-size: 10px;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: #9ca3af;
        }
        .prep-title {
          font-size: 1.35rem;
          color: #111;
          line-height: 1.2;
          font-weight: 500;
        }
        .prep-sub {
          font-size: 12px;
          color: #7b7b7b;
          font-weight: 300;
        }
        .prep-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 10px;
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
          font-size: 11px;
          color: #666;
          font-weight: 500;
        }
        .prep-select,
        .prep-input {
          font-family: 'DM Sans', sans-serif;
          border: 0.5px solid #ddd;
          border-radius: 8px;
          padding: 9px 10px;
          font-size: 12px;
          background: #fff;
        }
        .prep-hint {
          font-size: 11px;
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
          font-size: 12px;
          color: #111;
          font-weight: 500;
        }
        .prep-module-meta {
          font-size: 11px;
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
          padding: 10px 14px;
          font-size: 12px;
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
          width: 180px;
          height: 180px;
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
          padding: 12px;
        }
        .prep-card-title {
          font-size: 11px;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          color: #9ca3af;
          margin-bottom: 6px;
        }
        .prep-card-text {
          font-size: 12px;
          color: #4b5563;
          line-height: 1.55;
        }
        .prep-error {
          font-size: 12px;
          color: #b91c1c;
          background: #fef2f2;
          border: 0.5px solid #fecaca;
          border-radius: 8px;
          padding: 8px 10px;
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
                <svg width="120" height="120" viewBox="0 0 120 120" fill="none">
                  <circle cx="60" cy="60" r="58" fill="#EEEDFE" />
                  <circle cx="43" cy="50" r="6" fill="#534AB7" />
                  <circle cx="77" cy="50" r="6" fill="#534AB7" />
                  <path d="M38 78C45 88 55 93 60 93C65 93 75 88 82 78" stroke="#534AB7" strokeWidth="5" strokeLinecap="round" />
                  <path d="M25 36C34 23 46 17 60 17C74 17 86 23 95 36" stroke="#D6D3FF" strokeWidth="6" strokeLinecap="round" />
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

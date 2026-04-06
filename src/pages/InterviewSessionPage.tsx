import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { loadInterviewSessionData, type InterviewSessionData } from '../controllers/interviewSessionController'
import {
  getStudyModulesHistory,
  type StudyModuleHistoryItem,
} from '../lib/studyModulesHistory'

function formatDateLabel(value: string) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return 'Fecha desconocida'

  return new Intl.DateTimeFormat('es-ES', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date)
}

class StudyModuleCatalog {
  private readonly modules: StudyModuleHistoryItem[]
  private readonly modulesById: Map<string, StudyModuleHistoryItem>

  constructor(modules: StudyModuleHistoryItem[]) {
    this.modules = modules
    this.modulesById = new Map(modules.map((module) => [module.id, module]))
  }

  getAll() {
    return this.modules
  }

  getById(id: string) {
    return this.modulesById.get(id) ?? null
  }
}

function InterviewSessionPage() {
  const { sessionId } = useParams<{ sessionId: string }>()
  const navigate = useNavigate()
  const [data, setData] = useState<InterviewSessionData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [modules, setModules] = useState<StudyModuleHistoryItem[]>([])
  const [selectedModuleId, setSelectedModuleId] = useState('')
  const [isModuleModalOpen, setIsModuleModalOpen] = useState(false)

  useEffect(() => {
    if (!sessionId) return
    void refresh(sessionId)
  }, [sessionId])

  useEffect(() => {
    setModules(getStudyModulesHistory())
  }, [])

  const catalog = useMemo(() => new StudyModuleCatalog(modules), [modules])
  const selectedModule = useMemo(
    () => catalog.getById(selectedModuleId),
    [catalog, selectedModuleId],
  )

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

    navigate(`/interview/live/${sessionId}`, {
      state: {
        prep: {
          module: selectedModule,
        },
      },
    })
  }

  const onSelectModule = (moduleId: string) => {
    setSelectedModuleId(moduleId)
    setIsModuleModalOpen(false)
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
        .prep-btn-primary,
        .prep-btn-secondary,
        .prep-btn-outline {
          border-radius: 8px;
          border: none;
          padding: 10px 14px;
          font-size: 12px;
          cursor: pointer;
          font-family: 'DM Sans', sans-serif;
        }
        .prep-btn-primary {
          background: #111;
          color: #fff;
        }
        .prep-btn-secondary {
          background: #f5f5f4;
          color: #666;
          border: 0.5px solid #e5e5e5;
        }
        .prep-btn-outline {
          background: #fff;
          color: #111;
          border: 0.5px solid #ddd;
          width: fit-content;
        }
        .prep-selected-module {
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
        .prep-hint {
          font-size: 11px;
          color: #999;
        }
        .prep-actions {
          margin-top: auto;
          display: flex;
          justify-content: space-between;
          gap: 10px;
          padding-top: 8px;
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
        .prep-popup-backdrop {
          position: fixed;
          inset: 0;
          background: rgba(17, 17, 17, 0.52);
          display: grid;
          place-items: center;
          padding: 1rem;
          z-index: 40;
        }
        .prep-popup {
          width: min(680px, 100%);
          max-height: 80vh;
          overflow: hidden;
          border-radius: 14px;
          border: 0.5px solid #e5e5e5;
          background: #fff;
          display: grid;
          grid-template-rows: auto 1fr auto;
        }
        .prep-popup-head {
          padding: 12px 14px;
          border-bottom: 0.5px solid #ececec;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .prep-popup-title {
          font-size: 13px;
          color: #111;
          font-weight: 500;
        }
        .prep-popup-list {
          padding: 10px;
          overflow: auto;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .prep-history-item {
          border: 0.5px solid #e5e5e5;
          border-radius: 10px;
          padding: 10px;
          display: grid;
          grid-template-columns: 1fr auto;
          align-items: center;
          gap: 10px;
        }
        .prep-history-name {
          font-size: 12px;
          color: #111;
          font-weight: 500;
          margin-bottom: 3px;
        }
        .prep-history-meta {
          font-size: 11px;
          color: #888;
          line-height: 1.45;
        }
        .prep-select-history-btn {
          border: 0.5px solid #ddd;
          border-radius: 8px;
          background: #fff;
          color: #111;
          padding: 7px 10px;
          font-size: 11px;
          cursor: pointer;
          font-family: 'DM Sans', sans-serif;
        }
        .prep-popup-footer {
          border-top: 0.5px solid #ececec;
          padding: 10px 14px;
          display: flex;
          justify-content: flex-end;
          gap: 8px;
        }
        @media (max-width: 860px) {
          .prep-modal {
            grid-template-columns: 1fr;
          }
          .prep-left {
            border-right: none;
            border-bottom: 0.5px solid #ececec;
          }
        }
      `}</style>

      <section className="prep-root">
        <div className="prep-modal" role="dialog" aria-modal="true" aria-label="Preparación de entrevista">
          <div className="prep-left">
            <div className="prep-overline">Antes de iniciar</div>
            <h2 className="prep-title">Carga tu módulo de estudio</h2>
            <p className="prep-sub">
              Conserva tu flujo de estudio y asocia un módulo del historial a esta sesión de entrevista
              para seguir practicando con contexto.
            </p>

            {error && <p className="prep-error">{error}</p>}

            <button
              type="button"
              className="prep-btn-outline"
              onClick={() => setIsModuleModalOpen(true)}
            >
              Cargar módulo desde historial
            </button>

            {selectedModule ? (
              <div className="prep-selected-module">
                <div className="prep-module-topic">{selectedModule.topic}</div>
                <div className="prep-module-meta">
                  {selectedModule.questionsCount} preguntas · Guardado {formatDateLabel(selectedModule.savedAt)}
                </div>
              </div>
            ) : (
              <p className="prep-hint">
                {modules.length > 0
                  ? 'Aún no has cargado un módulo para esta entrevista. Es opcional.'
                  : 'No hay sesiones de estudio guardadas en el historial.'}
              </p>
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
                <div className="prep-card-title">Asistente de práctica</div>
                <p className="prep-card-text">
                  Cuando ingreses a la llamada, recibirás preguntas en vivo y podrás responder con micrófono.
                </p>
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

      {isModuleModalOpen && (
        <div className="prep-popup-backdrop" role="dialog" aria-modal="true" aria-label="Historial de módulos">
          <div className="prep-popup">
            <div className="prep-popup-head">
              <div className="prep-popup-title">Sesiones de estudio guardadas</div>
              <button
                type="button"
                className="prep-btn-secondary"
                onClick={() => setIsModuleModalOpen(false)}
              >
                Cerrar
              </button>
            </div>

            <div className="prep-popup-list">
              {catalog.getAll().length === 0 ? (
                <p className="prep-hint">No hay módulos disponibles en el historial.</p>
              ) : (
                catalog.getAll().map((module) => (
                  <div key={module.id} className="prep-history-item">
                    <div>
                      <div className="prep-history-name">{module.topic}</div>
                      <div className="prep-history-meta">
                        {module.questionsCount} preguntas · Creado {formatDateLabel(module.createdAt)}
                        <br />
                        Guardado {formatDateLabel(module.savedAt)}
                      </div>
                    </div>

                    <button
                      type="button"
                      className="prep-select-history-btn"
                      onClick={() => onSelectModule(module.id)}
                    >
                      Cargar módulo
                    </button>
                  </div>
                ))
              )}
            </div>

            <div className="prep-popup-footer">
              <button
                type="button"
                className="prep-btn-secondary"
                onClick={() => {
                  setSelectedModuleId('')
                  setIsModuleModalOpen(false)
                }}
              >
                Continuar sin módulo
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default InterviewSessionPage

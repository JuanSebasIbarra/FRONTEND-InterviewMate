import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  loadDashboardData,
  startNewInterview,
  type DashboardData,
} from '../controllers/dashboardController'
import type { InterviewType } from '../models/interview'

function DashboardPage() {
  const navigate = useNavigate()
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [creating, setCreating] = useState(false)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [form, setForm] = useState({
    enterprise: '',
    type: 'TECHNICAL' as InterviewType,
    position: '',
    workingArea: '',
    description: '',
  })

  useEffect(() => {
    void loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    setError('')
    try {
      const nextData = await loadDashboardData()
      setData(nextData)
    } catch (loadError) {
      setError((loadError as Error).message)
    } finally {
      setLoading(false)
    }
  }

  const onStartInterview = async () => {
    setCreating(true)
    setError('')
    try {
      const session = await startNewInterview({
        enterprise: form.enterprise,
        type: form.type,
        position: form.position,
        workingArea: form.workingArea || undefined,
        description: form.description || undefined,
      })
      navigate(`/dashboard/session/${session.id}`)
    } catch (createError) {
      setError((createError as Error).message)
    } finally {
      setCreating(false)
    }
  }

  const latestResult = data?.latestResult ?? null
  const templatesCount = data?.templates.length ?? 0
  const completedSessions = data?.results.length ?? 0

  const history = data?.results ?? []

  return (
    <div className="dashboard">
      <section className="dashboard__left">
        <div className="dashboard__stats">
          <h2 className="dashboard__section-title">Resumen</h2>

          {error && <p className="alert error">{error}</p>}

          {loading ? (
            <p className="dashboard__loading">Cargando...</p>
          ) : (
            <>
              <p className="dashboard__welcome">
                Hola, <strong>{data?.user?.username ?? '—'}</strong>
              </p>

              <div className="stat-card">
                <span className="stat-label">Plantillas creadas</span>
                <span className="stat-value">{templatesCount}</span>
              </div>

              <div className="stat-card">
                <span className="stat-label">Sesiones completadas</span>
                <span className="stat-value">{completedSessions}</span>
              </div>

              <div className="stat-card">
                <span className="stat-label">Último resultado</span>
                {latestResult ? (
                  <>
                    <span className="stat-value">
                      Score: {latestResult.totalScore?.toFixed(1) ?? 'N/A'}
                    </span>
                    <span className="stat-meta">
                      {new Date(latestResult.generatedAt).toLocaleDateString('es-ES', {
                        day: '2-digit',
                        month: 'long',
                        year: 'numeric',
                      })}
                    </span>
                    <span className="stat-badge">{latestResult.status}</span>
                  </>
                ) : (
                  <span className="stat-empty">Sin resultados aún</span>
                )}
              </div>
            </>
          )}
        </div>

        <button
          className="btn-new-interview"
          type="button"
          onClick={() => setShowCreateForm((value) => !value)}
        >
          Empezar nueva entrevista
        </button>

        {showCreateForm && (
          <div className="dashboard-create-card">
            <h3>Nueva entrevista</h3>
            <div className="stack">
              <label>
                Empresa
                <input
                  value={form.enterprise}
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, enterprise: event.target.value }))
                  }
                  placeholder="Ej. Globant"
                  required
                />
              </label>

              <label>
                Tipo
                <select
                  value={form.type}
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, type: event.target.value as InterviewType }))
                  }
                >
                  <option value="TECHNICAL">TECHNICAL</option>
                  <option value="HR">HR</option>
                  <option value="PSYCHOLOGICAL">PSYCHOLOGICAL</option>
                </select>
              </label>

              <label>
                Posición
                <input
                  value={form.position}
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, position: event.target.value }))
                  }
                  placeholder="Frontend Developer"
                  required
                />
              </label>

              <label>
                Área de trabajo (opcional)
                <input
                  value={form.workingArea}
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, workingArea: event.target.value }))
                  }
                  placeholder="Web Development"
                />
              </label>

              <label>
                Descripción (opcional)
                <textarea
                  rows={3}
                  value={form.description}
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, description: event.target.value }))
                  }
                  placeholder="Contexto de la entrevista"
                />
              </label>

              <button
                type="button"
                onClick={onStartInterview}
                disabled={
                  creating || !form.enterprise.trim() || !form.position.trim() || loading
                }
              >
                {creating ? 'Creando sesión...' : 'Crear y comenzar'}
              </button>
            </div>
          </div>
        )}
      </section>

      <section className="dashboard__right">
        <h2 className="dashboard__section-title">Historial</h2>

        {loading ? (
          <p className="dashboard__loading">Cargando historial...</p>
        ) : history.length === 0 ? (
          <div className="history-empty">
            <span className="history-empty__icon">📋</span>
            <p>No tienes sesiones registradas todavía.</p>
            <p>Comienza tu primera entrevista para ver tu historial aquí.</p>
          </div>
        ) : (
          <ul className="history-list">
            {history.map((result) => (
              <li key={result.id} className="history-item">
                <div className="history-item__title">Sesión {result.sessionId.slice(0, 8)}</div>
                <div className="history-item__meta">
                  <span className="history-item__type">Intento #{result.attemptNumber}</span>
                  <span className="history-item__level">Score {result.totalScore?.toFixed(1) ?? 'N/A'}</span>
                  <span
                    className={`history-item__status status--${(result.status ?? '').toLowerCase()}`}
                  >
                    {result.status}
                  </span>
                  <span className="history-item__date">
                    {new Date(result.generatedAt).toLocaleDateString('es-ES', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </span>
                </div>
                <div className="page-actions">
                  <button
                    type="button"
                    className="layout__logout"
                    onClick={() => navigate(`/dashboard/session/${result.sessionId}`)}
                  >
                    Ver sesión
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}

export default DashboardPage

import { useEffect, useState } from 'react'
import { getAuthToken } from '../lib/auth'
import { buildApiUrl } from '../lib/api'

type User = {
  id: number
  username: string
  email: string
}

type Interview = {
  id: number
  title: string
  status: string
  tipoEntrevista?: string
  nivelDificultad?: string
  createdAt: string
}

function DashboardPage() {
  const [user, setUser] = useState<User | null>(null)
  const [interviews, setInterviews] = useState<Interview[]>([])
  const [loading, setLoading] = useState(true)
  const token = getAuthToken()

  useEffect(() => {
    void loadData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const loadData = async () => {
    setLoading(true)
    try {
      const [userRes, interviewsRes] = await Promise.allSettled([
        fetch(buildApiUrl('/auth/me'), {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(buildApiUrl('/entrevistas'), {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ])

      if (userRes.status === 'fulfilled' && userRes.value.ok) {
        setUser((await userRes.value.json()) as User)
      }
      if (interviewsRes.status === 'fulfilled' && interviewsRes.value.ok) {
        const data = await interviewsRes.value.json()
        setInterviews(Array.isArray(data) ? (data as Interview[]) : [])
      }
    } finally {
      setLoading(false)
    }
  }

  const lastInterview = interviews[0] ?? null
  const totalInterviews = interviews.length

  const handleNewInterview = () => {
    // TODO: navegar a flujo de nueva entrevista
    alert('Próximamente: selección de tipo y nivel de entrevista.')
  }

  return (
    <div className="dashboard">
      {/* ── Panel izquierdo: estadísticas ── */}
      <section className="dashboard__left">
        <div className="dashboard__stats">
          <h2 className="dashboard__section-title">Resumen</h2>

          {loading ? (
            <p className="dashboard__loading">Cargando...</p>
          ) : (
            <>
              <p className="dashboard__welcome">
                Hola, <strong>{user?.username ?? '—'}</strong>
              </p>

              <div className="stat-card">
                <span className="stat-label">Entrevistas realizadas</span>
                <span className="stat-value">{totalInterviews}</span>
              </div>

              <div className="stat-card">
                <span className="stat-label">Última entrevista</span>
                {lastInterview ? (
                  <>
                    <span className="stat-value">
                      {lastInterview.title ?? `Entrevista #${lastInterview.id}`}
                    </span>
                    <span className="stat-meta">
                      {new Date(lastInterview.createdAt).toLocaleDateString('es-ES', {
                        day: '2-digit',
                        month: 'long',
                        year: 'numeric',
                      })}
                    </span>
                    {lastInterview.tipoEntrevista && (
                      <span className="stat-badge">{lastInterview.tipoEntrevista}</span>
                    )}
                  </>
                ) : (
                  <span className="stat-empty">Sin entrevistas aún</span>
                )}
              </div>
            </>
          )}
        </div>

        <button className="btn-new-interview" type="button" onClick={handleNewInterview}>
          Empezar nueva entrevista
        </button>
      </section>

      {/* ── Panel derecho: historial ── */}
      <section className="dashboard__right">
        <h2 className="dashboard__section-title">Historial</h2>

        {loading ? (
          <p className="dashboard__loading">Cargando historial...</p>
        ) : interviews.length === 0 ? (
          <div className="history-empty">
            <span className="history-empty__icon">📋</span>
            <p>No tienes sesiones registradas todavía.</p>
            <p>Comienza tu primera entrevista para ver tu historial aquí.</p>
          </div>
        ) : (
          <ul className="history-list">
            {interviews.map((interview) => (
              <li key={interview.id} className="history-item">
                <div className="history-item__title">
                  {interview.title ?? `Entrevista #${interview.id}`}
                </div>
                <div className="history-item__meta">
                  {interview.tipoEntrevista && (
                    <span className="history-item__type">{interview.tipoEntrevista}</span>
                  )}
                  {interview.nivelDificultad && (
                    <span className="history-item__level">{interview.nivelDificultad}</span>
                  )}
                  <span
                    className={`history-item__status status--${(interview.status ?? '').toLowerCase()}`}
                  >
                    {interview.status}
                  </span>
                  <span className="history-item__date">
                    {new Date(interview.createdAt).toLocaleDateString('es-ES', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </span>
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

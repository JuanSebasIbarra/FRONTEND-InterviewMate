import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  loadInterviewSessionData,
  submitQuestionAnswer,
  type InterviewSessionData,
} from '../controllers/interviewSessionController'

function InterviewSessionPage() {
  const { sessionId } = useParams<{ sessionId: string }>()
  const navigate = useNavigate()
  const [data, setData] = useState<InterviewSessionData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [submittingQuestionId, setSubmittingQuestionId] = useState('')
  const [answers, setAnswers] = useState<Record<string, string>>({})

  useEffect(() => {
    if (!sessionId) return
    void refresh(sessionId)
  }, [sessionId])

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

  const pendingQuestions = useMemo(
    () => data?.questions.filter((question) => !question.answer?.trim()) ?? [],
    [data],
  )

  const onSubmitAnswer = async (questionId: string) => {
    if (!sessionId) return
    const answer = answers[questionId]?.trim()
    if (!answer) return

    setSubmittingQuestionId(questionId)
    setError('')
    try {
      await submitQuestionAnswer(questionId, answer)
      setAnswers((prev) => ({ ...prev, [questionId]: '' }))
      await refresh(sessionId)
    } catch (submitError) {
      setError((submitError as Error).message)
    } finally {
      setSubmittingQuestionId('')
    }
  }

  if (loading) {
    return (
      <section className="page-card">
        <h2>Sesión de entrevista</h2>
        <p>Cargando sesión...</p>
      </section>
    )
  }

  if (!data) {
    return (
      <section className="page-card">
        <h2>Sesión de entrevista</h2>
        <p>No se encontró la sesión.</p>
      </section>
    )
  }

  return (
    <section className="session-page">
      <header className="session-header card">
        <h2>Entrevista: {data.session.templatePosition}</h2>
        <p>
          Empresa: <strong>{data.session.templateEnterprise}</strong> · Estado:{' '}
          <strong>{data.session.status}</strong>
        </p>
        <div className="page-actions">
          <button type="button" onClick={() => navigate('/dashboard')}>
            Volver al dashboard
          </button>
        </div>
      </header>

      {error && <p className="alert error">{error}</p>}

      <div className="session-grid">
        <article className="card">
          <h3>Preguntas ({data.questions.length})</h3>
          {data.questions.length === 0 ? (
            <p>Esta sesión aún no tiene preguntas generadas.</p>
          ) : (
            <ul className="session-question-list">
              {data.questions.map((question) => (
                <li key={question.id} className="session-question-item">
                  <h4>
                    #{question.orderIndex} {question.question}
                  </h4>

                  {question.answer ? (
                    <div className="result">
                      <p>
                        <strong>Respuesta:</strong> {question.answer}
                      </p>
                      {question.aiFeedback && (
                        <p>
                          <strong>Feedback IA:</strong> {question.aiFeedback}
                        </p>
                      )}
                      {typeof question.score === 'number' && (
                        <p>
                          <strong>Score:</strong> {question.score.toFixed(1)}
                        </p>
                      )}
                    </div>
                  ) : (
                    <div className="stack">
                      <textarea
                        rows={4}
                        value={answers[question.id] ?? ''}
                        onChange={(event) =>
                          setAnswers((prev) => ({ ...prev, [question.id]: event.target.value }))
                        }
                        placeholder="Escribe tu respuesta..."
                      />
                      <button
                        type="button"
                        disabled={
                          submittingQuestionId === question.id || !(answers[question.id] ?? '').trim()
                        }
                        onClick={() => void onSubmitAnswer(question.id)}
                      >
                        {submittingQuestionId === question.id ? 'Enviando...' : 'Enviar respuesta'}
                      </button>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          )}
        </article>

        <aside className="card">
          <h3>Resumen de sesión</h3>
          <p>
            Preguntas pendientes: <strong>{pendingQuestions.length}</strong>
          </p>

          {data.result ? (
            <div className="result">
              <h4>Resultado final</h4>
              <p>
                Estado: <strong>{data.result.status}</strong>
              </p>
              <p>
                Score total: <strong>{data.result.totalScore?.toFixed(1) ?? 'N/A'}</strong>
              </p>
              {data.result.generalFeedback && <p>{data.result.generalFeedback}</p>}
            </div>
          ) : (
            <p className="small">
              El resultado aparecerá cuando todas las preguntas tengan respuesta.
            </p>
          )}
        </aside>
      </div>
    </section>
  )
}

export default InterviewSessionPage

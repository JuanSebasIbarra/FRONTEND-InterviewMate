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

const difficultyLabel: Record<StudyDifficulty, string> = {
  BASIC: 'Básico',
  INTERMEDIATE: 'Intermedio',
  ADVANCED: 'Avanzado',
}

const questionTypeLabel: Record<StudyQuestionType, string> = {
  THEORETICAL: 'Teórica',
  PRACTICAL: 'Práctica',
}

function StudyPage() {
  const navigate = useNavigate()
  const [topic, setTopic] = useState('')
  const [audioFile, setAudioFile] = useState('')
  const [studyIdToLoad, setStudyIdToLoad] = useState('')
  const [interviewType, setInterviewType] = useState<InterviewType>('TECHNICAL')

  const [session, setSession] = useState<StudySession | null>(null)
  const [loading, setLoading] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [startingInterview, setStartingInterview] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const groupedByDifficulty = useMemo(() => {
    const base: Record<StudyDifficulty, StudyQuestion[]> = {
      BASIC: [],
      INTERMEDIATE: [],
      ADVANCED: [],
    }

    for (const question of session?.questions ?? []) {
      base[question.difficulty].push(question)
    }

    return base
  }, [session])

  const resetMessages = () => {
    setError('')
    setSuccess('')
  }

  const onStartStudy = async () => {
    setLoading(true)
    resetMessages()
    try {
      const created = await startStudySession({ topic, audioFile })
      setSession(created)
      setSuccess('Sesión de estudio creada. Ahora puedes generar preguntas.')
    } catch (requestError) {
      setError((requestError as Error).message)
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
      setSuccess('Sesión de estudio cargada correctamente.')
    } catch (requestError) {
      setError((requestError as Error).message)
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
    } catch (requestError) {
      setError((requestError as Error).message)
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
    } catch (requestError) {
      setError((requestError as Error).message)
    } finally {
      setStartingInterview(false)
    }
  }

  return (
    <section className="study-page">
      <header className="card">
        <h2>Modo estudio</h2>
        <p className="small">
          Crea una sesión con tema o nota de voz, genera preguntas con IA y luego inicia una
          entrevista basada en el mismo foco.
        </p>
      </header>

      <div className="study-grid">
        <article className="card">
          <h3>1) Crear sesión de estudio</h3>
          <div className="stack">
            <label>
              Tema (opcional)
              <input
                value={topic}
                onChange={(event) => setTopic(event.target.value)}
                placeholder="Ej. React Hooks, Spring Security, Testing"
              />
            </label>

            <label>
              Referencia de audio (opcional)
              <input
                value={audioFile}
                onChange={(event) => setAudioFile(event.target.value)}
                placeholder="URL, nombre o referencia del audio"
              />
            </label>

            <button
              type="button"
              onClick={onStartStudy}
              disabled={loading || (!topic.trim() && !audioFile.trim())}
            >
              {loading ? 'Creando sesión...' : 'Iniciar estudio'}
            </button>
          </div>

          <hr className="study-divider" />

          <h3>2) Cargar sesión existente</h3>
          <div className="row">
            <input
              value={studyIdToLoad}
              onChange={(event) => setStudyIdToLoad(event.target.value)}
              placeholder="Pega el studySessionId"
            />
            <button type="button" onClick={onLoadStudy} disabled={loading || !studyIdToLoad.trim()}>
              Cargar
            </button>
          </div>

          {error && <p className="alert error">{error}</p>}
          {success && <p className="alert success">{success}</p>}
        </article>

        <article className="card">
          <h3>3) Resultado de estudio</h3>
          {!session ? (
            <p>Aún no hay sesión activa.</p>
          ) : (
            <div className="stack">
              <p>
                <strong>Study ID:</strong> {session.id}
              </p>
              <p>
                <strong>Tema:</strong> {session.topic}
              </p>
              <p>
                <strong>Preguntas:</strong> {session.questions.length}
              </p>

              <div className="row">
                <button type="button" onClick={onGenerateQuestions} disabled={generating}>
                  {generating ? 'Generando...' : 'Generar / Regenerar preguntas'}
                </button>
              </div>
            </div>
          )}
        </article>
      </div>

      {session && session.questions.length > 0 && (
        <section className="card">
          <h3>Banco de preguntas de estudio</h3>
          <div className="study-difficulty-grid">
            {(Object.keys(groupedByDifficulty) as StudyDifficulty[]).map((difficulty) => (
              <article key={difficulty} className="study-difficulty-card">
                <h4>
                  {difficultyLabel[difficulty]} ({groupedByDifficulty[difficulty].length})
                </h4>
                {groupedByDifficulty[difficulty].length === 0 ? (
                  <p className="small">Sin preguntas en este nivel.</p>
                ) : (
                  <ul className="session-question-list">
                    {groupedByDifficulty[difficulty].map((question) => (
                      <li key={question.id} className="session-question-item">
                        <p>
                          <strong>#{question.orderIndex}</strong> {question.questionText}
                        </p>
                        <span className="study-badge">{questionTypeLabel[question.type]}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </article>
            ))}
          </div>

          <div className="study-interview-cta">
            <label>
              Tipo de entrevista
              <select
                value={interviewType}
                onChange={(event) => setInterviewType(event.target.value as InterviewType)}
              >
                <option value="TECHNICAL">TECHNICAL</option>
                <option value="HR">HR</option>
                <option value="PSYCHOLOGICAL">PSYCHOLOGICAL</option>
              </select>
            </label>

            <button type="button" onClick={onStartInterview} disabled={startingInterview}>
              {startingInterview ? 'Iniciando entrevista...' : 'Iniciar entrevista desde estudio'}
            </button>
          </div>
        </section>
      )}
    </section>
  )
}

export default StudyPage

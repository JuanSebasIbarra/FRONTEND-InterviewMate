import { useEffect, useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import { RouterProvider } from 'react-router-dom'
import { appRouter } from './router'
import './App.css'

type User = {
  id: number
  username: string
  email: string
  roles: string[]
  createdAt: string
}

type LoginResponse = {
  token: string
  tokenType: string
  expiresAt: string
  username: string
}

type ProfessionalProfile = {
  userId: number
  username: string
  perfilProfesional: string
  updatedAt: string
}

type InterviewQuestion = {
  id: number
  content: string
  tipo: 'TECNICA' | 'COMPORTAMENTAL' | 'MIXTA'
  nivelDificultad: 'BASICO' | 'INTERMEDIO' | 'AVANZADO'
  orden: number
  createdAt: string
}

type Interview = {
  id: number
  title: string
  description: string
  status: string
  questions: InterviewQuestion[]
  createdAt: string
  updatedAt: string
}

type AnswerResponse = {
  id: number
  idPregunta: number
  idEntrevista: number
  respuesta: string
  tiempoRespuesta: number
  createdAt: string
}

type ApiError = {
  status?: number
  message?: string
  fieldErrors?: Record<string, string>
}

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE'

const BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8080'
const TOKEN_STORAGE_KEY = 'interviewmate_token'

export function LegacyApp() {
  const [token, setToken] = useState(localStorage.getItem(TOKEN_STORAGE_KEY) ?? '')
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const [registerForm, setRegisterForm] = useState({ username: '', email: '', password: '' })
  const [loginForm, setLoginForm] = useState({
    username: '',
    password: '',
  })
  const [perfilProfesional, setPerfilProfesional] = useState('')
  const [profileData, setProfileData] = useState<ProfessionalProfile | null>(null)
  const [interviewData, setInterviewData] = useState<Interview | null>(null)
  const [lastAnswer, setLastAnswer] = useState<AnswerResponse | null>(null)

  const [tipoEntrevista, setTipoEntrevista] = useState<
    'TECNICA' | 'COMPORTAMENTAL' | 'MIXTA'
  >('TECNICA')
  const [nivelDificultad, setNivelDificultad] = useState<
    'BASICO' | 'INTERMEDIO' | 'AVANZADO'
  >('INTERMEDIO')
  const [questionId, setQuestionId] = useState(1)
  const [answerText, setAnswerText] = useState('')

  const questionOptions = useMemo(() => interviewData?.questions ?? [], [interviewData])

  useEffect(() => {
    if (!token) return
    void loadCurrentUser(token)
  }, [token])

  const callApi = async <T,>(
    path: string,
    method: HttpMethod,
    body?: unknown,
  ) => {
    setLoading(true)
    setError('')
    setSuccess('')

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    }

    if (token.trim()) {
      headers.Authorization = `Bearer ${token}`
    }

    try {
      const response = await fetch(`${BASE_URL}${path}`, {
        method,
        headers,
        body: body ? JSON.stringify(body) : undefined,
      })

      const text = await response.text()
      const data = text ? (JSON.parse(text) as T | ApiError) : null

      if (!response.ok) {
        const apiError = data as ApiError
        const fieldError = apiError.fieldErrors
          ? Object.values(apiError.fieldErrors).join(' · ')
          : ''
        const message = apiError.message || fieldError || 'No se pudo completar la operación.'
        throw new Error(message)
      }

      return data as T
    } catch (error) {
      setError((error as Error).message)
      throw error
    } finally {
      setLoading(false)
    }
  }

  const loadCurrentUser = async (tokenValue: string) => {
    try {
      setLoading(true)
      setError('')
      const response = await fetch(`${BASE_URL}/auth/me`, {
        headers: { Authorization: `Bearer ${tokenValue}` },
      })

      if (!response.ok) {
        localStorage.removeItem(TOKEN_STORAGE_KEY)
        setToken('')
        setCurrentUser(null)
        return
      }

      const user = (await response.json()) as User
      setCurrentUser(user)
    } finally {
      setLoading(false)
    }
  }

  const onRegister = async (e: FormEvent) => {
    e.preventDefault()
    try {
      await callApi<User>('/auth/register', 'POST', registerForm)
      setSuccess('Registro exitoso. Ahora inicia sesión.')
      setAuthMode('login')
      setLoginForm({ username: registerForm.username, password: '' })
    } catch {
      // controlled in callApi
    }
  }

  const onLogin = async (e: FormEvent) => {
    e.preventDefault()
    try {
      const data = await callApi<LoginResponse>('/auth/login', 'POST', loginForm)
      if (!data?.token) return
      setToken(data.token)
      localStorage.setItem(TOKEN_STORAGE_KEY, data.token)
      await loadCurrentUser(data.token)
      setSuccess('Inicio de sesión exitoso.')
    } catch {
      // controlled in callApi
    }
  }

  const onLogout = () => {
    localStorage.removeItem(TOKEN_STORAGE_KEY)
    setToken('')
    setCurrentUser(null)
    setProfileData(null)
    setInterviewData(null)
    setLastAnswer(null)
    setSuccess('Sesión cerrada correctamente.')
  }

  const onGetProfile = async () => {
    try {
      const profile = await callApi<ProfessionalProfile>('/usuarios/perfil', 'GET')
      setProfileData(profile)
      setPerfilProfesional(profile.perfilProfesional)
    } catch {
      // controlled in callApi
    }
  }

  const onUpdateProfile = async () => {
    try {
      const profile = await callApi<ProfessionalProfile>('/usuarios/perfil', 'PUT', {
        perfilProfesional,
      })
      setProfileData(profile)
      setSuccess('Perfil profesional actualizado.')
    } catch {
      // controlled in callApi
    }
  }

  const onStartInterview = async () => {
    try {
      const interview = await callApi<Interview>('/entrevistas/start', 'POST', {
        tipoEntrevista,
        nivelDificultad,
      })
      setInterviewData(interview)
      if (interview.questions.length > 0) {
        setQuestionId(interview.questions[0].id)
      }
      setSuccess('Entrevista iniciada correctamente.')
    } catch {
      // controlled in callApi
    }
  }

  const onSubmitAnswer = async (e: FormEvent) => {
    e.preventDefault()
    try {
      const answer = await callApi<AnswerResponse>('/entrevistas/respuestas', 'POST', {
        idPregunta: questionId,
        respuesta: answerText,
      })
      setLastAnswer(answer)
      setAnswerText('')
      setSuccess('Respuesta enviada.')
    } catch {
      // controlled in callApi
    }
  }

  if (!currentUser) {
    return (
      <main className="auth-page">
        <section className="auth-card">
          <h1>InterviewMate</h1>
          <p>Inicia sesión para practicar entrevistas técnicas con IA.</p>

          {error && <p className="alert error">{error}</p>}
          {success && <p className="alert success">{success}</p>}

          {authMode === 'login' ? (
            <form onSubmit={onLogin} className="stack">
              <label>
                Nombre de usuario
                <input
                  required
                  value={loginForm.username}
                  onChange={(e) => setLoginForm((v) => ({ ...v, username: e.target.value }))}
                  placeholder="tu_usuario"
                />
              </label>
              <label>
                Contraseña
                <input
                  required
                  type="password"
                  value={loginForm.password}
                  onChange={(e) => setLoginForm((v) => ({ ...v, password: e.target.value }))}
                  placeholder="********"
                />
              </label>
              <button disabled={loading}>{loading ? 'Ingresando...' : 'Iniciar sesión'}</button>
              <button type="button" className="link-btn" onClick={() => setAuthMode('register')}>
                ¿No tienes cuenta? Regístrate
              </button>
            </form>
          ) : (
            <form onSubmit={onRegister} className="stack">
              <label>
                Nombre de usuario
                <input
                  required
                  value={registerForm.username}
                  onChange={(e) =>
                    setRegisterForm((v) => ({ ...v, username: e.target.value }))
                  }
                  placeholder="tu_usuario"
                />
              </label>
              <label>
                Correo electrónico
                <input
                  required
                  type="email"
                  value={registerForm.email}
                  onChange={(e) => setRegisterForm((v) => ({ ...v, email: e.target.value }))}
                  placeholder="correo@ejemplo.com"
                />
              </label>
              <label>
                Contraseña
                <input
                  required
                  type="password"
                  minLength={8}
                  value={registerForm.password}
                  onChange={(e) =>
                    setRegisterForm((v) => ({ ...v, password: e.target.value }))
                  }
                  placeholder="mínimo 8 caracteres"
                />
              </label>
              <button disabled={loading}>{loading ? 'Registrando...' : 'Crear cuenta'}</button>
              <button type="button" className="link-btn" onClick={() => setAuthMode('login')}>
                Ya tengo cuenta
              </button>
            </form>
          )}
        </section>
      </main>
    )
  }

  return (
    <main className="app">
      <header className="topbar">
        <div>
          <h1>Dashboard de Entrevistas</h1>
          <p>Hola, {currentUser.username}. Gestiona tu perfil y práctica técnica.</p>
        </div>
        <button className="danger" onClick={onLogout}>
          Cerrar sesión
        </button>
      </header>

      {error && <p className="alert error">{error}</p>}
      {success && <p className="alert success">{success}</p>}

      <section className="card">
        <h2>Tu Perfil Profesional</h2>
        <textarea
          rows={4}
          value={perfilProfesional}
          onChange={(e) => setPerfilProfesional(e.target.value)}
          placeholder="Describe tu experiencia, stack y fortalezas..."
        />
        <div className="row">
          <button onClick={() => void onGetProfile()} disabled={loading}>
            Cargar perfil
          </button>
          <button onClick={() => void onUpdateProfile()} disabled={loading}>
            Guardar perfil
          </button>
        </div>
        {profileData && (
          <p className="small">
            Última actualización: {new Date(profileData.updatedAt).toLocaleString()}
          </p>
        )}
      </section>

      <section className="card">
        <h2>Iniciar Entrevista</h2>
        <div className="grid two">
          <label>
            Tipo de entrevista
            <select
              value={tipoEntrevista}
              onChange={(e) =>
                setTipoEntrevista(e.target.value as 'TECNICA' | 'COMPORTAMENTAL' | 'MIXTA')
              }
            >
              <option value="TECNICA">Técnica</option>
              <option value="COMPORTAMENTAL">Comportamental</option>
              <option value="MIXTA">Mixta</option>
            </select>
          </label>

          <label>
            Nivel de dificultad
            <select
              value={nivelDificultad}
              onChange={(e) =>
                setNivelDificultad(e.target.value as 'BASICO' | 'INTERMEDIO' | 'AVANZADO')
              }
            >
              <option value="BASICO">Básico</option>
              <option value="INTERMEDIO">Intermedio</option>
              <option value="AVANZADO">Avanzado</option>
            </select>
          </label>
        </div>

        <button onClick={() => void onStartInterview()} disabled={loading}>
          Iniciar entrevista
        </button>

        {interviewData && (
          <div className="result">
            <h3>{interviewData.title}</h3>
            <p>{interviewData.description}</p>
            <ul>
              {interviewData.questions.map((q) => (
                <li key={q.id}>
                  <strong>#{q.orden}</strong> {q.content}
                </li>
              ))}
            </ul>
          </div>
        )}
      </section>

      <section className="card">
        <h2>Responder Pregunta</h2>
        <form onSubmit={onSubmitAnswer} className="stack">
          <label>
            Pregunta
            <select
              value={questionId}
              onChange={(e) => setQuestionId(Number(e.target.value))}
            >
              {questionOptions.length === 0 && <option value={1}>Sin preguntas disponibles</option>}
              {questionOptions.map((q) => (
                <option key={q.id} value={q.id}>
                  #{q.orden} - {q.content.slice(0, 60)}...
                </option>
              ))}
            </select>
          </label>

          <label>
            Tu respuesta
            <textarea
              required
              rows={5}
              value={answerText}
              onChange={(e) => setAnswerText(e.target.value)}
              placeholder="Escribe tu respuesta aquí..."
            />
          </label>

          <button disabled={loading || questionOptions.length === 0}>Enviar respuesta</button>
        </form>

        {lastAnswer && (
          <p className="small">
            Respuesta enviada correctamente. Tiempo registrado: {lastAnswer.tiempoRespuesta}s.
          </p>
        )}
      </section>
    </main>
  )
}

function App() {
  return <RouterProvider router={appRouter} />
}

export default App

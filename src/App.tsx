import { useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import './App.css'

type Role = 'ROLE_USER' | 'ROLE_ADMIN'

type User = {
  id: number
  username: string
  email: string
  roles: Role[]
  createdAt: string
}

type LoginResponse = {
  token: string
  tokenType: string
  expiresAt: string
  username: string
}

type PagedResponse<T> = {
  content: T[]
  totalPages: number
  totalElements: number
  number: number
  size: number
  first: boolean
  last: boolean
  empty: boolean
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
  error?: string
  message?: string
  timestamp?: string
  fieldErrors?: Record<string, string>
}

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE'

function App() {
  const [baseUrl, setBaseUrl] = useState('http://localhost:8080')
  const [token, setToken] = useState('')
  const [loading, setLoading] = useState(false)
  const [lastStatus, setLastStatus] = useState<number | null>(null)
  const [lastAction, setLastAction] = useState('')
  const [lastResponse, setLastResponse] = useState<unknown>(null)

  const [registerForm, setRegisterForm] = useState({
    username: 'alice',
    email: 'alice@example.com',
    password: 'SecurePass123!',
  })
  const [loginForm, setLoginForm] = useState({
    username: 'alice',
    password: 'SecurePass123!',
  })

  const [queryPage, setQueryPage] = useState(0)
  const [querySize, setQuerySize] = useState(10)
  const [querySort, setQuerySort] = useState('createdAt,desc')
  const [userId, setUserId] = useState(1)
  const [userCreateForm, setUserCreateForm] = useState({
    username: 'bob',
    email: 'bob@example.com',
    password: 'SecurePass456!',
  })
  const [userUpdateForm, setUserUpdateForm] = useState({
    username: 'alice_updated',
    email: 'alice_new@example.com',
    password: 'NewPassword789!',
  })

  const [perfilProfesional, setPerfilProfesional] = useState(
    'Desarrollador Full Stack con experiencia en Java, React y Cloud Computing.',
  )

  const [tipoEntrevista, setTipoEntrevista] = useState<
    'TECNICA' | 'COMPORTAMENTAL' | 'MIXTA'
  >('TECNICA')
  const [nivelDificultad, setNivelDificultad] = useState<
    'BASICO' | 'INTERMEDIO' | 'AVANZADO'
  >('INTERMEDIO')
  const [questionId, setQuestionId] = useState(1)
  const [answerText, setAnswerText] = useState(
    'Una clase abstracta comparte implementación base; una interfaz define un contrato de comportamiento.',
  )

  const prettyResponse = useMemo(
    () => (lastResponse ? JSON.stringify(lastResponse, null, 2) : ''),
    [lastResponse],
  )

  const callApi = async <T,>(
    action: string,
    path: string,
    method: HttpMethod,
    body?: unknown,
    customToken?: string,
  ) => {
    setLoading(true)
    setLastAction(action)

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    }

    const authToken = customToken ?? token
    if (authToken.trim()) {
      headers.Authorization = `Bearer ${authToken}`
    }

    try {
      const response = await fetch(`${baseUrl}${path}`, {
        method,
        headers,
        body: body ? JSON.stringify(body) : undefined,
      })

      setLastStatus(response.status)

      if (response.status === 204) {
        setLastResponse({ message: 'Sin contenido (204)' })
        return null as T
      }

      const text = await response.text()
      const data = text ? (JSON.parse(text) as T | ApiError) : null

      if (!response.ok) {
        setLastResponse(data)
        throw new Error(`Request failed: ${response.status}`)
      }

      setLastResponse(data)
      return data as T
    } catch (error) {
      if (!lastResponse) {
        setLastResponse({ message: (error as Error).message })
      }
      throw error
    } finally {
      setLoading(false)
    }
  }

  const onRegister = async (e: FormEvent) => {
    e.preventDefault()
    await callApi<User>('Register', '/auth/register', 'POST', registerForm)
  }

  const onLogin = async (e: FormEvent) => {
    e.preventDefault()
    const data = await callApi<LoginResponse>('Login', '/auth/login', 'POST', loginForm)
    if (data?.token) setToken(data.token)
  }

  return (
    <main className="app">
      <header>
        <h1>InterviewMate Frontend</h1>
        <p>Panel React + TypeScript para probar todos los endpoints de tu backend Spring Boot.</p>
      </header>

      <section className="card">
        <h2>Configuración</h2>
        <div className="grid two">
          <label>
            Base URL
            <input value={baseUrl} onChange={(e) => setBaseUrl(e.target.value)} />
          </label>
          <label>
            Token JWT
            <input value={token} onChange={(e) => setToken(e.target.value)} placeholder="Bearer token" />
          </label>
        </div>
      </section>

      <section className="card">
        <h2>🔐 Autenticación</h2>
        <div className="grid two">
          <form onSubmit={onRegister}>
            <h3>Register</h3>
            <input placeholder="username" value={registerForm.username} onChange={(e) => setRegisterForm((v) => ({ ...v, username: e.target.value }))} />
            <input placeholder="email" type="email" value={registerForm.email} onChange={(e) => setRegisterForm((v) => ({ ...v, email: e.target.value }))} />
            <input placeholder="password" type="password" value={registerForm.password} onChange={(e) => setRegisterForm((v) => ({ ...v, password: e.target.value }))} />
            <button disabled={loading}>Registrar</button>
          </form>

          <form onSubmit={onLogin}>
            <h3>Login</h3>
            <input placeholder="username" value={loginForm.username} onChange={(e) => setLoginForm((v) => ({ ...v, username: e.target.value }))} />
            <input placeholder="password" type="password" value={loginForm.password} onChange={(e) => setLoginForm((v) => ({ ...v, password: e.target.value }))} />
            <button disabled={loading}>Iniciar sesión</button>
            <button type="button" className="secondary" disabled={loading} onClick={() => void callApi<User>('Get Current User', '/auth/me', 'GET')}>
              Get /auth/me
            </button>
          </form>
        </div>
      </section>

      <section className="card">
        <h2>👥 Usuarios</h2>
        <div className="grid three">
          <div>
            <h3>Listar</h3>
            <input type="number" value={queryPage} onChange={(e) => setQueryPage(Number(e.target.value))} />
            <input type="number" value={querySize} onChange={(e) => setQuerySize(Number(e.target.value))} />
            <input value={querySort} onChange={(e) => setQuerySort(e.target.value)} />
            <button disabled={loading} onClick={() => void callApi<PagedResponse<User>>('List Users', `/usuarios?page=${queryPage}&size=${querySize}&sort=${querySort}`, 'GET')}>
              Get /usuarios
            </button>
          </div>

          <div>
            <h3>Por ID</h3>
            <input type="number" value={userId} onChange={(e) => setUserId(Number(e.target.value))} />
            <button disabled={loading} onClick={() => void callApi<User>('Get User by ID', `/usuarios/${userId}`, 'GET')}>
              Get /usuarios/:id
            </button>
            <button className="danger" disabled={loading} onClick={() => void callApi<null>('Delete User', `/usuarios/${userId}`, 'DELETE')}>
              Delete /usuarios/:id
            </button>
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault()
              void callApi<User>('Create User', '/usuarios', 'POST', userCreateForm)
            }}
          >
            <h3>Crear</h3>
            <input placeholder="username" value={userCreateForm.username} onChange={(e) => setUserCreateForm((v) => ({ ...v, username: e.target.value }))} />
            <input placeholder="email" type="email" value={userCreateForm.email} onChange={(e) => setUserCreateForm((v) => ({ ...v, email: e.target.value }))} />
            <input placeholder="password" type="password" value={userCreateForm.password} onChange={(e) => setUserCreateForm((v) => ({ ...v, password: e.target.value }))} />
            <button disabled={loading}>Post /usuarios</button>
          </form>
        </div>

        <form
          className="update-form"
          onSubmit={(e) => {
            e.preventDefault()
            void callApi<User>('Update User', `/usuarios/${userId}`, 'PUT', userUpdateForm)
          }}
        >
          <h3>Actualizar usuario</h3>
          <div className="grid three">
            <input placeholder="username" value={userUpdateForm.username} onChange={(e) => setUserUpdateForm((v) => ({ ...v, username: e.target.value }))} />
            <input placeholder="email" type="email" value={userUpdateForm.email} onChange={(e) => setUserUpdateForm((v) => ({ ...v, email: e.target.value }))} />
            <input placeholder="password" type="password" value={userUpdateForm.password} onChange={(e) => setUserUpdateForm((v) => ({ ...v, password: e.target.value }))} />
          </div>
          <button disabled={loading}>Put /usuarios/:id</button>
        </form>
      </section>

      <section className="card">
        <h2>🎯 Perfil Profesional</h2>
        <textarea rows={4} value={perfilProfesional} onChange={(e) => setPerfilProfesional(e.target.value)} />
        <div className="row">
          <button disabled={loading} onClick={() => void callApi<ProfessionalProfile>('Get Profile', '/usuarios/perfil', 'GET')}>
            Get /usuarios/perfil
          </button>
          <button disabled={loading} onClick={() => void callApi<ProfessionalProfile>('Update Profile', '/usuarios/perfil', 'PUT', { perfilProfesional })}>
            Put /usuarios/perfil
          </button>
        </div>
      </section>

      <section className="card">
        <h2>🎤 Entrevistas</h2>
        <div className="grid two">
          <div>
            <h3>Iniciar entrevista</h3>
            <label>
              Tipo
              <select value={tipoEntrevista} onChange={(e) => setTipoEntrevista(e.target.value as 'TECNICA' | 'COMPORTAMENTAL' | 'MIXTA')}>
                <option value="TECNICA">TECNICA</option>
                <option value="COMPORTAMENTAL">COMPORTAMENTAL</option>
                <option value="MIXTA">MIXTA</option>
              </select>
            </label>
            <label>
              Dificultad
              <select value={nivelDificultad} onChange={(e) => setNivelDificultad(e.target.value as 'BASICO' | 'INTERMEDIO' | 'AVANZADO')}>
                <option value="BASICO">BASICO</option>
                <option value="INTERMEDIO">INTERMEDIO</option>
                <option value="AVANZADO">AVANZADO</option>
              </select>
            </label>
            <button disabled={loading} onClick={() => void callApi<Interview>('Start Interview', '/entrevistas/start', 'POST', { tipoEntrevista, nivelDificultad })}>
              Post /entrevistas/start
            </button>
          </div>
          <div>
            <h3>Enviar respuesta</h3>
            <input type="number" value={questionId} onChange={(e) => setQuestionId(Number(e.target.value))} />
            <textarea rows={4} value={answerText} onChange={(e) => setAnswerText(e.target.value)} />
            <button disabled={loading} onClick={() => void callApi<AnswerResponse>('Submit Answer', '/entrevistas/respuestas', 'POST', { idPregunta: questionId, respuesta: answerText })}>
              Post /entrevistas/respuestas
            </button>
          </div>
        </div>
      </section>

      <section className="card">
        <h2>⚠️ Pruebas de error</h2>
        <div className="row wrap">
          <button className="secondary" disabled={loading} onClick={() => void callApi<PagedResponse<User>>('Invalid Token', '/usuarios', 'GET', undefined, 'invalid_token_123')}>
            Token inválido
          </button>
          <button className="secondary" disabled={loading} onClick={() => void callApi<User>('User Not Found', '/usuarios/999', 'GET')}>
            Usuario no encontrado
          </button>
          <button className="secondary" disabled={loading} onClick={() => void callApi<User>('Duplicate User', '/auth/register', 'POST', registerForm)}>
            Usuario duplicado
          </button>
          <button className="secondary" disabled={loading} onClick={() => void callApi<User>('Validation Error', '/auth/register', 'POST', { username: 'bob', email: 'invalid_email', password: 'pass123' })}>
            Validación inválida
          </button>
          <button className="secondary" disabled={loading} onClick={() => void callApi<Interview>('Profile Missing', '/entrevistas/start', 'POST', { tipoEntrevista: 'TECNICA', nivelDificultad: 'INTERMEDIO' })}>
            Perfil no completado
          </button>
        </div>
      </section>

      <section className="card output">
        <h2>📤 Última respuesta</h2>
        <p>
          Acción: <strong>{lastAction || 'N/A'}</strong> · Status: <strong>{lastStatus ?? 'N/A'}</strong> · Estado: <strong>{loading ? 'Cargando...' : 'Listo'}</strong>
        </p>
        <pre>{prettyResponse || 'Aún no hay respuesta.'}</pre>
      </section>
    </main>
  )
}

export default App

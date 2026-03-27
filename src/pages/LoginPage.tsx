import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import heroLogo from '../assets/hero.png'
import { saveAuthToken } from '../lib/auth'

type LoginResponse = {
  token: string
}

type ApiError = {
  message?: string
}

const BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8080'

function LoginPage() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({ username: '', password: '' })

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault()
    setLoading(true)
    setError('')

    try {
      const response = await fetch(`${BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })

      const raw = await response.text()
      const data = raw ? (JSON.parse(raw) as LoginResponse | ApiError) : {}

      if (!response.ok) {
        throw new Error((data as ApiError).message ?? 'No se pudo iniciar sesión.')
      }

      const token = (data as LoginResponse).token
      if (!token) {
        throw new Error('La respuesta no incluyó token de sesión.')
      }

      saveAuthToken(token)
      navigate('/dashboard', { replace: true })
    } catch (submitError) {
      setError((submitError as Error).message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="auth-page">
      <article className="auth-card auth-card--public">
        <img className="auth-logo" src={heroLogo} alt="InterviewMate logo" />
        <h2>Iniciar sesión</h2>
        <p>Accede a tu dashboard privado para continuar tus simulaciones.</p>

        {error && <p className="alert error">{error}</p>}

        <form onSubmit={onSubmit} className="stack">
          <label>
            Usuario
            <input
              required
              value={form.username}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, username: event.target.value }))
              }
              placeholder="tu_usuario"
            />
          </label>

          <label>
            Contraseña
            <input
              required
              type="password"
              value={form.password}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, password: event.target.value }))
              }
              placeholder="********"
            />
          </label>

          <button type="submit" disabled={loading}>
            {loading ? 'Ingresando...' : 'Entrar'}
          </button>
        </form>

        <p className="auth-footer">
          ¿No tienes cuenta? <Link to="/register">Regístrate</Link>
        </p>
      </article>
    </section>
  )
}

export default LoginPage

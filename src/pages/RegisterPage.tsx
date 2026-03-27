import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import heroLogo from '../assets/hero.png'

type ApiError = {
  message?: string
}

const BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8080'

function RegisterPage() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [form, setForm] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  })

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault()
    setError('')
    setSuccess('')

    if (form.password !== form.confirmPassword) {
      setError('La confirmación de contraseña no coincide.')
      return
    }

    setLoading(true)

    try {
      const response = await fetch(`${BASE_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: form.username,
          email: form.email,
          password: form.password,
        }),
      })

      const raw = await response.text()
      const data = raw ? (JSON.parse(raw) as ApiError) : {}

      if (!response.ok) {
        throw new Error(data.message ?? 'No se pudo completar el registro.')
      }

      setSuccess('Registro exitoso. Ahora inicia sesión.')
      setForm({ username: '', email: '', password: '', confirmPassword: '' })
      setTimeout(() => navigate('/login'), 900)
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
        <h2>Crear cuenta</h2>
        <p>Regístrate para desbloquear tu dashboard y guardar tu progreso.</p>

        {error && <p className="alert error">{error}</p>}
        {success && <p className="alert success">{success}</p>}

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
            Correo electrónico
            <input
              required
              type="email"
              value={form.email}
              onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))}
              placeholder="correo@ejemplo.com"
            />
          </label>

          <label>
            Contraseña
            <input
              required
              type="password"
              minLength={8}
              value={form.password}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, password: event.target.value }))
              }
              placeholder="mínimo 8 caracteres"
            />
          </label>

          <label>
            Confirmar contraseña
            <input
              required
              type="password"
              minLength={8}
              value={form.confirmPassword}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, confirmPassword: event.target.value }))
              }
              placeholder="repite tu contraseña"
            />
          </label>

          <button type="submit" disabled={loading}>
            {loading ? 'Creando cuenta...' : 'Registrarme'}
          </button>
        </form>

        <p className="auth-footer">
          ¿Ya tienes cuenta? <Link to="/login">Inicia sesión</Link>
        </p>
      </article>
    </section>
  )
}

export default RegisterPage

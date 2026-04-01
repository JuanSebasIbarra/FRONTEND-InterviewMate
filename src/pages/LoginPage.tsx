import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import heroLogo from '../assets/interviewmate-logo.svg'
import { loginUser } from '../controllers/authController'
import { getGoogleOAuthStartUrl } from '../services/authService'

function LoginPage() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({ username: '', password: '' })

  const onGoogleLogin = () => {
    window.location.assign(getGoogleOAuthStartUrl())
  }

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault()
    setLoading(true)
    setError('')

    try {
      await loginUser(form)
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

          <button type="button" onClick={onGoogleLogin} disabled={loading}>
            Continuar con Google
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

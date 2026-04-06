import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { loginUser } from '../controllers/authController'
import { getGoogleOAuthStartUrl } from '../services/authService'


  <link href="https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;1,9..40,300&display=swap" rel="stylesheet" />


function LoginPage() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')
  const [form, setForm]       = useState({ username: '', password: '' })

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
    <>
      <style>{`
        .lg * { box-sizing: border-box; margin: 0; padding: 0; }

        /* ── PÁGINA COMPLETA ── */
        .lg-page {
          font-family: 'DM Sans', sans-serif;
          min-height: 100vh;
          width: 100%;
          display: block;
          background: #f5f5f4;
          padding: 0;
        }

        /* ── CARD PRINCIPAL ── */
        .lg-card {
          display: grid;
          grid-template-columns: 1fr 1fr;
          width: 100%;
          min-height: 100vh;
          max-width: none;
          border-radius: 0;
          overflow: hidden;
          box-shadow: none;
        }

        /* ── PANEL IZQUIERDO ── */
        .lg-left {
          background: #111;
          padding: 2.5rem;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          min-height: 520px;
        }
        .lg-brand {
          display: flex; align-items: center; gap: 8px;
          font-size: 14px; font-weight: 500; color: #fff;
          text-decoration: none;
        }
        .lg-brand-dot {
          width: 22px; height: 22px; border-radius: 6px;
          background: #fff;
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0;
        }
        .lg-quote-block {
          flex: 1;
          display: flex;
          flex-direction: column;
          justify-content: center;
          padding: 2rem 0 1rem;
        }
        .lg-quote {
          font-family: 'Instrument Serif', serif;
          font-size: 1.45rem;
          font-weight: 400;
          color: #fff;
          line-height: 1.35;
          letter-spacing: -0.02em;
          margin-bottom: 1.75rem;
          font-style: normal;
        }
        .lg-quote em { font-style: italic; color: #666; }
        .lg-testimonial { display: flex; align-items: center; gap: 10px; }
        .lg-avatar {
          width: 30px; height: 30px; border-radius: 50%;
          background: #222; border: 0.5px solid #333;
          display: flex; align-items: center; justify-content: center;
          font-size: 11px; font-weight: 500; color: #ccc;
          flex-shrink: 0;
        }
        .lg-author-name { font-size: 12px; font-weight: 500; color: #fff; }
        .lg-author-role { font-size: 11px; color: #555; margin-top: 1px; }
        .lg-dots { display: flex; gap: 5px; }
        .lg-dot { width: 5px; height: 5px; border-radius: 50%; background: #333; }
        .lg-dot.on { background: #fff; }

        /* ── PANEL DERECHO ── */
        .lg-right {
          background: #fff;
          padding: 2.5rem;
          display: flex;
          flex-direction: column;
          justify-content: center;
        }
        .lg-heading { margin-bottom: 1.75rem; }
        .lg-heading h1 {
          font-family: 'Instrument Serif', serif;
          font-size: 1.65rem; font-weight: 400;
          letter-spacing: -0.02em; line-height: 1.2;
          margin-bottom: 5px;
          color: #111;
        }
        .lg-heading p { font-size: 13px; color: #888; font-weight: 300; }
        .lg-heading p a {
          color: #111; font-weight: 400;
          text-decoration: underline;
          text-underline-offset: 3px;
        }

        /* Google */
        .lg-google {
          display: flex; align-items: center; justify-content: center; gap: 10px;
          width: 100%; padding: 9px 16px;
          border: 0.5px solid #ddd;
          border-radius: 8px;
          background: #fff;
          color: #111;
          font-family: 'DM Sans', sans-serif;
          font-size: 13px; font-weight: 400;
          cursor: pointer; transition: background 0.15s;
          margin-bottom: 1.25rem;
        }
        .lg-google:hover:not(:disabled) { background: #f9f9f8; }
        .lg-google:disabled { opacity: 0.5; cursor: not-allowed; }

        /* Divider */
        .lg-divider {
          display: flex; align-items: center; gap: 10px;
          margin-bottom: 1.25rem;
        }
        .lg-divider-line { flex: 1; height: 0.5px; background: #e5e5e5; }
        .lg-divider span { font-size: 11px; color: #bbb; letter-spacing: 0.04em; white-space: nowrap; }

        /* Form */
        .lg-form { display: flex; flex-direction: column; gap: 12px; }
        .lg-field { display: flex; flex-direction: column; gap: 5px; }
        .lg-label { font-size: 12px; font-weight: 500; color: #666; }
        .lg-input {
          font-family: 'DM Sans', sans-serif;
          font-size: 13px; font-weight: 300;
          padding: 9px 12px;
          border: 0.5px solid #ddd;
          border-radius: 8px;
          background: #fff;
          color: #111;
          outline: none;
          transition: border-color 0.15s;
          width: 100%;
        }
        .lg-input:focus { border-color: #aaa; }
        .lg-input::placeholder { color: #ccc; }

        .lg-forgot {
          display: flex; justify-content: flex-end;
          margin-top: -2px;
        }
        .lg-forgot a {
          font-size: 11px; color: #aaa;
          text-decoration: underline;
          text-underline-offset: 3px;
        }

        /* Error */
        .lg-error {
          font-size: 12px; color: #dc2626;
          background: #FEF2F2;
          border: 0.5px solid #FECACA;
          border-radius: 6px;
          padding: 8px 10px;
          margin-bottom: 4px;
        }

        /* Submit */
        .lg-submit {
          font-family: 'DM Sans', sans-serif;
          font-size: 13px; font-weight: 400;
          padding: 10px 16px;
          border-radius: 8px;
          background: #111; color: #fff;
          border: none; cursor: pointer;
          transition: opacity 0.15s;
          width: 100%;
          margin-top: 4px;
        }
        .lg-submit:hover:not(:disabled) { opacity: 0.8; }
        .lg-submit:disabled { opacity: 0.5; cursor: not-allowed; }

        /* Footer */
        .lg-footer {
          text-align: center;
          font-size: 12px; color: #bbb;
          margin-top: 1.25rem;
        }
        .lg-footer a {
          color: #888; font-weight: 400;
          text-decoration: underline;
          text-underline-offset: 3px;
        }

        /* ── RESPONSIVE ── */
        @media (max-width: 600px) {
          .lg-card { grid-template-columns: 1fr; }
          .lg-left { display: none; }
          .lg-page { padding: 0; }
        }
      `}</style>

      <div className="lg-page">
        <div className="lg-card">

          {/* ── PANEL IZQUIERDO ── */}
          <div className="lg-left">
            <Link className="lg-brand" to="/">
              <div className="lg-brand-dot">
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <circle cx="6" cy="6" r="4" fill="white" />
                  <circle cx="6" cy="6" r="2" fill="#111" />
                </svg>
              </div>
              InterviewMate
            </Link>

            <div className="lg-quote-block">
              <p className="lg-quote">
                "Después de tres sesiones ya respondía con{' '}
                <em>mucha más claridad</em> bajo presión."
              </p>
              <div className="lg-testimonial">
                <div className="lg-avatar">AM</div>
                <div>
                  <div className="lg-author-name">Alejandra Moreno</div>
                  <div className="lg-author-role">Frontend Dev · consiguió trabajo en 3 semanas</div>
                </div>
              </div>
            </div>

            <div className="lg-dots">
              <div className="lg-dot on" />
              <div className="lg-dot" />
              <div className="lg-dot" />
            </div>
          </div>

          {/* ── PANEL DERECHO ── */}
          <div className="lg-right">
            <div className="lg-heading">
              <h1>Bienvenido de nuevo</h1>
              <p>
                ¿No tienes cuenta?{' '}
                <Link to="/register">Regístrate gratis</Link>
              </p>
            </div>

            {/* Google OAuth */}
            <button
              type="button"
              className="lg-google"
              onClick={onGoogleLogin}
              disabled={loading}
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path
                  d="M15.68 8.18c0-.57-.05-1.11-.14-1.64H8v3.1h4.3a3.68 3.68 0 01-1.6 2.42v2h2.58c1.51-1.39 2.4-3.44 2.4-5.88z"
                  fill="#4285F4"
                />
                <path
                  d="M8 16c2.16 0 3.97-.72 5.29-1.94l-2.58-2a4.8 4.8 0 01-7.16-2.52H.9v2.07A8 8 0 008 16z"
                  fill="#34A853"
                />
                <path
                  d="M3.55 9.54A4.83 4.83 0 013.3 8c0-.54.09-1.06.25-1.54V4.39H.9A8 8 0 000 8c0 1.29.31 2.51.9 3.61l2.65-2.07z"
                  fill="#FBBC05"
                />
                <path
                  d="M8 3.18c1.22 0 2.31.42 3.17 1.24l2.37-2.37A8 8 0 00.9 4.39L3.55 6.46A4.77 4.77 0 018 3.18z"
                  fill="#EA4335"
                />
              </svg>
              Continuar con Google
            </button>

            <div className="lg-divider">
              <div className="lg-divider-line" />
              <span>o continúa con tu cuenta</span>
              <div className="lg-divider-line" />
            </div>

            {/* Formulario */}
            <form className="lg-form" onSubmit={onSubmit}>
              {error && <p className="lg-error">{error}</p>}

              <div className="lg-field">
                <label className="lg-label" htmlFor="username">Usuario</label>
                <input
                  id="username"
                  className="lg-input"
                  required
                  autoComplete="username"
                  placeholder="tu_usuario"
                  value={form.username}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, username: e.target.value }))
                  }
                />
              </div>

              <div className="lg-field">
                <label className="lg-label" htmlFor="password">Contraseña</label>
                <input
                  id="password"
                  className="lg-input"
                  required
                  type="password"
                  autoComplete="current-password"
                  placeholder="••••••••"
                  value={form.password}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, password: e.target.value }))
                  }
                />
                <div className="lg-forgot">
                  <a href="#">¿Olvidaste tu contraseña?</a>
                </div>
              </div>

              <button type="submit" className="lg-submit" disabled={loading}>
                {loading ? 'Ingresando...' : 'Entrar'}
              </button>
            </form>

            <div className="lg-footer">
           
            </div>
          </div>

        </div>
      </div>
    </>
  )
}

export default LoginPage
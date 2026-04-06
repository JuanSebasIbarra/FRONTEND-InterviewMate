import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { registerUser } from '../controllers/authController'
import { getGoogleOAuthStartUrl } from '../services/authService'


  <link href="https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;1,9..40,300&display=swap" rel="stylesheet" />


function getPasswordStrength(password: string): number {
  if (password.length === 0) return 0
  let score = 0
  if (password.length >= 8)  score++
  if (password.length >= 12) score++
  if (/[A-Z]/.test(password) && /[0-9]/.test(password)) score++
  if (/[^A-Za-z0-9]/.test(password)) score++
  return score
}

function RegisterPage() {
  const navigate  = useNavigate()
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState('')
  const [success, setSuccess]   = useState('')
  const [form, setForm]         = useState({
    username:        '',
    email:           '',
    password:        '',
    confirmPassword: '',
  })

  const onGoogleRegister = () => {
    window.location.assign(getGoogleOAuthStartUrl())
  }

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault()
    setError('')
    setSuccess('')

    if (form.password !== form.confirmPassword) {
      setError('La confirmación de contraseña no coincide.')
      return
    }
    if (form.password.length < 8 || form.password.length > 16) {
      setError('La contraseña debe tener entre 8 y 16 caracteres.')
      return
    }

    setLoading(true)
    try {
      await registerUser({
        username:        form.username,
        email:           form.email,
        password:        form.password,
        confirmPassword: form.confirmPassword,
      })
      setSuccess('Registro exitoso. Redirigiendo...')
      setForm({ username: '', email: '', password: '', confirmPassword: '' })
      setTimeout(() => navigate('/login'), 900)
    } catch (submitError) {
      setError((submitError as Error).message)
    } finally {
      setLoading(false)
    }
  }

  const strength       = getPasswordStrength(form.password)
  const passwordsMatch = form.confirmPassword.length > 0 && form.password === form.confirmPassword

  const strengthClass = (bar: number) => {
    if (form.password.length === 0) return ''
    if (strength >= bar) {
      if (strength === 1) return 's1'
      if (strength === 2) return 's2'
      if (strength === 3) return 's3'
      return 's4'
    }
    return ''
  }

  return (
    <>
      <style>{`
        .rg * { box-sizing: border-box; margin: 0; padding: 0; }

        /* ── PÁGINA ── */
        .rg-page {
          font-family: 'DM Sans', sans-serif;
          min-height: 100vh;
          width: 100%;
          display: block;
          background: #f5f5f4;
          padding: 0;
        }

        /* ── CARD ── */
        .rg-card {
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
        .rg-left {
          background: #111; padding: 2.5rem;
          display: flex; flex-direction: column;
          justify-content: space-between; min-height: 100%;
        }
        .rg-brand {
          display: flex; align-items: center; gap: 8px;
          font-size: 14px; font-weight: 500; color: #fff;
          text-decoration: none;
        }
        .rg-brand-dot {
          width: 22px; height: 22px; border-radius: 6px;
          background: #fff;
          display: flex; align-items: center; justify-content: center; flex-shrink: 0;
        }
        .rg-left-body {
          flex: 1; display: flex; flex-direction: column;
          justify-content: center; padding: 2rem 0 1rem;
        }
        .rg-left-title {
          font-family: 'Instrument Serif', serif;
          font-size: 1.45rem; font-weight: 400;
          color: #fff; line-height: 1.35;
          letter-spacing: -0.02em; margin-bottom: 2rem;
        }
        .rg-left-title em { font-style: italic; color: #555; }
        .rg-steps { display: flex; flex-direction: column; gap: 16px; }
        .rg-step { display: flex; align-items: flex-start; gap: 12px; }
        .rg-step-num {
          width: 20px; height: 20px; border-radius: 50%;
          border: 0.5px solid #333;
          display: flex; align-items: center; justify-content: center;
          font-size: 10px; color: #555; flex-shrink: 0; margin-top: 1px;
        }
        .rg-step-num.done { border-color: #fff; color: #fff; }
        .rg-step-text h4 { font-size: 12px; font-weight: 500; color: #fff; margin-bottom: 2px; }
        .rg-step-text p  { font-size: 11px; color: #555; font-weight: 300; line-height: 1.4; }
        .rg-dots { display: flex; gap: 5px; }
        .rg-dot     { width: 5px; height: 5px; border-radius: 50%; background: #333; }
        .rg-dot.on  { background: #fff; }

        /* ── PANEL DERECHO ── */
        .rg-right {
          background: #fff; padding: 2.5rem;
          display: flex; flex-direction: column; justify-content: center;
        }
        .rg-heading { margin-bottom: 1.5rem; }
        .rg-heading h1 {
          font-family: 'Instrument Serif', serif;
          font-size: 1.65rem; font-weight: 400;
          letter-spacing: -0.02em; line-height: 1.2;
          margin-bottom: 5px; color: #111;
        }
        .rg-heading p { font-size: 13px; color: #888; font-weight: 300; }
        .rg-heading p a {
          color: #111; font-weight: 400;
          text-decoration: underline; text-underline-offset: 3px;
        }

        /* Google */
        .rg-google {
          display: flex; align-items: center; justify-content: center; gap: 10px;
          width: 100%; padding: 9px 16px;
          border: 0.5px solid #ddd; border-radius: 8px;
          background: #fff; color: #111;
          font-family: 'DM Sans', sans-serif;
          font-size: 13px; font-weight: 400;
          cursor: pointer; transition: background 0.15s;
          margin-bottom: 1.25rem;
        }
        .rg-google:hover:not(:disabled) { background: #f9f9f8; }
        .rg-google:disabled { opacity: 0.5; cursor: not-allowed; }

        /* Divider */
        .rg-divider {
          display: flex; align-items: center; gap: 10px;
          margin-bottom: 1.25rem;
        }
        .rg-divider-line { flex: 1; height: 0.5px; background: #e5e5e5; }
        .rg-divider span { font-size: 11px; color: #bbb; letter-spacing: 0.04em; white-space: nowrap; }

        /* Form */
        .rg-form { display: flex; flex-direction: column; gap: 10px; }
        .rg-row   { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
        .rg-field { display: flex; flex-direction: column; gap: 4px; }
        .rg-label-row { display: flex; align-items: center; justify-content: space-between; }
        .rg-label { font-size: 12px; font-weight: 500; color: #666; }
        .rg-hint  { font-size: 11px; color: #bbb; }

        .rg-input {
          font-family: 'DM Sans', sans-serif;
          font-size: 13px; font-weight: 300;
          padding: 9px 12px;
          border: 0.5px solid #ddd; border-radius: 8px;
          background: #fff; color: #111;
          outline: none; transition: border-color 0.15s; width: 100%;
        }
        .rg-input:focus          { border-color: #aaa; }
        .rg-input::placeholder   { color: #ccc; }
        .rg-input.input-error    { border-color: #FECACA; }
        .rg-input.input-success  { border-color: #BBF7D0; }

        /* Strength bars */
        .rg-strength { display: flex; gap: 3px; margin-top: 5px; }
        .rg-strength-bar {
          flex: 1; height: 3px; border-radius: 99px;
          background: #e5e5e5; transition: background 0.2s;
        }
        .rg-strength-bar.s1 { background: #ef4444; }
        .rg-strength-bar.s2 { background: #f97316; }
        .rg-strength-bar.s3 { background: #eab308; }
        .rg-strength-bar.s4 { background: #22c55e; }

        /* Match indicator */
        .rg-match { font-size: 11px; margin-top: 3px; display: flex; align-items: center; gap: 4px; }
        .rg-match.ok { color: #22c55e; }
        .rg-match.no { color: #ef4444; }

        /* Alerts */
        .rg-error {
          font-size: 12px; color: #dc2626;
          background: #FEF2F2; border: 0.5px solid #FECACA;
          border-radius: 6px; padding: 8px 10px;
        }
        .rg-success {
          font-size: 12px; color: #166534;
          background: #DCFCE7; border: 0.5px solid #BBF7D0;
          border-radius: 6px; padding: 8px 10px;
        }

        /* Submit */
        .rg-submit {
          font-family: 'DM Sans', sans-serif;
          font-size: 13px; font-weight: 400;
          padding: 10px 16px; border-radius: 8px;
          background: #111; color: #fff;
          border: none; cursor: pointer;
          transition: opacity 0.15s; width: 100%; margin-top: 4px;
        }
        .rg-submit:hover:not(:disabled) { opacity: 0.8; }
        .rg-submit:disabled { opacity: 0.5; cursor: not-allowed; }

        /* Footer */
        .rg-footer {
          text-align: center; font-size: 12px; color: #bbb; margin-top: 1rem;
        }
        .rg-footer a {
          color: #888; font-weight: 400;
          text-decoration: underline; text-underline-offset: 3px;
        }

        /* ── RESPONSIVE ── */
        @media (max-width: 900px) {
          .rg-card { grid-template-columns: 1fr; }
          .rg-left { display: none; }
          .rg-row  { grid-template-columns: 1fr; }
          .rg-page { padding: 0; }
        }
      `}</style>

      <div className="rg-page">
        <div className="rg-card">

          {/* ── PANEL IZQUIERDO ── */}
          <div className="rg-left">
            <Link className="rg-brand" to="/">
              <div className="rg-brand-dot">
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <circle cx="6" cy="6" r="4" fill="white" />
                  <circle cx="6" cy="6" r="2" fill="#111" />
                </svg>
              </div>
              InterviewMate
            </Link>

            <div className="rg-left-body">
              <p className="rg-left-title">
                Tu próxima entrevista<br />empieza <em>hoy mismo.</em>
              </p>
              <div className="rg-steps">
                {[
                  { n: '1', done: true,  title: 'Crea tu cuenta',      desc: 'Solo tarda un minuto, sin tarjeta.' },
                  { n: '2', done: false, title: 'Configura tu perfil', desc: 'Stack, nivel y rol objetivo.' },
                  { n: '3', done: false, title: 'Empieza a practicar', desc: 'Primera sesión disponible al instante.' },
                ].map((step) => (
                  <div className="rg-step" key={step.n}>
                    <div className={`rg-step-num${step.done ? ' done' : ''}`}>{step.n}</div>
                    <div className="rg-step-text">
                      <h4>{step.title}</h4>
                      <p>{step.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rg-dots">
              <div className="rg-dot on" />
              <div className="rg-dot" />
              <div className="rg-dot" />
            </div>
          </div>

          {/* ── PANEL DERECHO ── */}
          <div className="rg-right">
            <div className="rg-heading">
              <h1>Crear cuenta</h1>
              <p>¿Ya tienes cuenta? <Link to="/login">Inicia sesión</Link></p>
            </div>

            {/* Google */}
            <button
              type="button"
              className="rg-google"
              onClick={onGoogleRegister}
              disabled={loading}
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M15.68 8.18c0-.57-.05-1.11-.14-1.64H8v3.1h4.3a3.68 3.68 0 01-1.6 2.42v2h2.58c1.51-1.39 2.4-3.44 2.4-5.88z" fill="#4285F4" />
                <path d="M8 16c2.16 0 3.97-.72 5.29-1.94l-2.58-2a4.8 4.8 0 01-7.16-2.52H.9v2.07A8 8 0 008 16z" fill="#34A853" />
                <path d="M3.55 9.54A4.83 4.83 0 013.3 8c0-.54.09-1.06.25-1.54V4.39H.9A8 8 0 000 8c0 1.29.31 2.51.9 3.61l2.65-2.07z" fill="#FBBC05" />
                <path d="M8 3.18c1.22 0 2.31.42 3.17 1.24l2.37-2.37A8 8 0 00.9 4.39L3.55 6.46A4.77 4.77 0 018 3.18z" fill="#EA4335" />
              </svg>
              Registrarse con Google
            </button>

            <div className="rg-divider">
              <div className="rg-divider-line" />
              <span>o crea tu cuenta</span>
              <div className="rg-divider-line" />
            </div>

            <form className="rg-form" onSubmit={onSubmit}>
              {error   && <p className="rg-error">{error}</p>}
              {success && <p className="rg-success">{success}</p>}

              {/* Usuario + Email */}
              <div className="rg-row">
                <div className="rg-field">
                  <label className="rg-label" htmlFor="username">Usuario</label>
                  <input
                    id="username"
                    className="rg-input"
                    required
                    autoComplete="username"
                    placeholder="tu_usuario"
                    value={form.username}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, username: e.target.value }))
                    }
                  />
                </div>
                <div className="rg-field">
                  <label className="rg-label" htmlFor="email">Correo electrónico</label>
                  <input
                    id="email"
                    className="rg-input"
                    required
                    type="email"
                    autoComplete="email"
                    placeholder="correo@ejemplo.com"
                    value={form.email}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, email: e.target.value }))
                    }
                  />
                </div>
              </div>

              {/* Contraseña + Confirmar */}
              <div className="rg-row">
                <div className="rg-field">
                  <div className="rg-label-row">
                    <label className="rg-label" htmlFor="password">Contraseña</label>
                    <span className="rg-hint">8–16 caracteres</span>
                  </div>
                  <input
                    id="password"
                    className="rg-input"
                    required
                    type="password"
                    autoComplete="new-password"
                    placeholder="••••••••"
                    minLength={8}
                    maxLength={16}
                    value={form.password}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, password: e.target.value }))
                    }
                  />
                  {/* Barra de fortaleza */}
                  <div className="rg-strength">
                    {[1, 2, 3, 4].map((bar) => (
                      <div key={bar} className={`rg-strength-bar ${strengthClass(bar)}`} />
                    ))}
                  </div>
                </div>

                <div className="rg-field">
                  <label className="rg-label" htmlFor="confirmPassword">Confirmar contraseña</label>
                  <input
                    id="confirmPassword"
                    className={`rg-input ${
                      form.confirmPassword.length > 0
                        ? passwordsMatch
                          ? 'input-success'
                          : 'input-error'
                        : ''
                    }`}
                    required
                    type="password"
                    autoComplete="new-password"
                    placeholder="••••••••"
                    minLength={8}
                    maxLength={16}
                    value={form.confirmPassword}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, confirmPassword: e.target.value }))
                    }
                  />
                  {form.confirmPassword.length > 0 && (
                    <div className={`rg-match ${passwordsMatch ? 'ok' : 'no'}`}>
                      {passwordsMatch ? '✓ Coinciden' : '✕ No coinciden'}
                    </div>
                  )}
                </div>
              </div>

              <button type="submit" className="rg-submit" disabled={loading}>
                {loading ? 'Creando cuenta...' : 'Crear cuenta'}
              </button>
            </form>

            <div className="rg-footer">
              Al registrarte aceptas nuestros <a href="#">términos de uso</a>
            </div>
          </div>

        </div>
      </div>
    </>
  )
}

export default RegisterPage
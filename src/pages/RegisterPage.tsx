import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { registerUser } from '../controllers/authController'
import { getGoogleOAuthStartUrl } from '../services/authService'

function getPasswordStrength(password: string): number {
  if (password.length === 0) return 0
  let score = 0
  if (password.length >= 8) score++
  if (password.length >= 12) score++
  if (/[A-Z]/.test(password) && /[0-9]/.test(password)) score++
  if (/[^A-Za-z0-9]/.test(password)) score++
  return score
}

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

  const onGoogleRegister = () => {
    window.location.assign(getGoogleOAuthStartUrl())
  }

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault()
    setError('')
    setSuccess('')

    if (form.password !== form.confirmPassword) {
      setError('La confirmacion de contraseña no coincide.')
      return
    }
    if (form.password.length < 8 || form.password.length > 16) {
      setError('La contraseña debe tener entre 8 y 16 caracteres.')
      return
    }

    setLoading(true)
    try {
      await registerUser({
        username: form.username,
        email: form.email,
        password: form.password,
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

  const strength = getPasswordStrength(form.password)
  const passwordsMatch = form.confirmPassword.length > 0 && form.password === form.confirmPassword

  const strengthClass = (bar: number) => {
    if (form.password.length === 0 || strength < bar) return 'bg-zinc-200'
    if (strength === 1) return 'bg-red-500'
    if (strength === 2) return 'bg-orange-500'
    if (strength === 3) return 'bg-amber-500'
    return 'bg-green-500'
  }

  return (
    <div className="min-h-screen bg-stone-100 px-3 py-3 sm:px-6 sm:py-6">
      <div className="grid min-h-[calc(100vh-1.5rem)] overflow-hidden rounded-3xl bg-white sm:min-h-[calc(100vh-3rem)] md:grid-cols-2">
        <div className="hidden min-h-140 flex-col justify-between bg-zinc-950 p-10 md:flex">
          <Link className="inline-flex items-center gap-2 text-sm font-medium text-white no-underline" to="/">
            <div className="flex h-5.5 w-5.5 items-center justify-center rounded-md bg-white">
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <circle cx="6" cy="6" r="4" fill="white" />
                <circle cx="6" cy="6" r="2" fill="#111" />
              </svg>
            </div>
            InterviewMate
          </Link>

          <div className="flex flex-1 flex-col justify-center py-8">
            <p className="mb-8 font-serif text-3xl leading-[1.35] tracking-[-0.02em] text-white">
              Tu proxima entrevista
              <br />
              empieza <em className="not-italic text-zinc-500">hoy mismo.</em>
            </p>
            <div className="flex flex-col gap-4 w-full">
              {[
                { n: '1', done: true, title: 'Crea tu cuenta', desc: 'Solo tarda un minuto, sin tarjeta.' },
                { n: '2', done: false, title: 'Configura tu perfil', desc: 'Stack, nivel y rol objetivo.' },
                { n: '3', done: false, title: 'Empieza a practicar', desc: 'Primera sesion disponible al instante.' },
              ].map((step) => (
                <div className="flex items-center aling-center gap-3" key={step.n}>
                  <div
                    className={`mt-px flex h-8 w-8 shrink-0 items-center justify-center rounded-full border text-md ${
                      step.done ? 'border-white text-white' : 'border-zinc-700 text-zinc-500'
                    }`}
                  >
                    {step.n}
                  </div>
                  <div>
                    <h4 className="mb-0.5 text-lg font-medium text-white">{step.title}</h4>
                    <p className="text-md font-light leading-[1.4] text-zinc-500">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-1.5">
            <div className="h-1.25 w-1.25 rounded-full bg-white" />
            <div className="h-1.25 w-1.25 rounded-full bg-zinc-700" />
            <div className="h-1.25 w-1.25 rounded-full bg-zinc-700" />
          </div>
        </div>

        <div className="flex flex-col justify-center bg-white px-5 py-8 sm:px-10">
          <div className="mb-6 text-center">
            <h1 className="mb-1.5 font-serif text-[1.65rem] font-normal leading-[1.2] tracking-[-0.02em] text-zinc-900">
              Crear cuenta
            </h1>
            <p className="text-[13px] font-light text-zinc-500">
              ¿Ya tienes cuenta?{' '}
              <Link className="font-normal text-zinc-900 underline underline-offset-3" to="/login">
                Inicia sesion
              </Link>
            </p>
          </div>

          <button
            type="button"
            className="mb-5 inline-flex w-full items-center justify-center gap-2.5 rounded-lg border border-zinc-300 bg-white px-4 py-2.25 text-[13px] font-normal text-zinc-900 transition hover:bg-black/5 disabled:cursor-not-allowed disabled:opacity-50"
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

          <div className="mb-5 flex items-center gap-2.5">
            <div className="h-px flex-1 bg-zinc-200" />
            <span className="whitespace-nowrap text-[11px] tracking-[0.04em] text-zinc-400">o crea tu cuenta</span>
            <div className="h-px flex-1 bg-zinc-200" />
          </div>

          <form className="flex flex-col gap-2.5" onSubmit={onSubmit}>
            {error && (
              <p className="rounded-md border border-rose-200 bg-rose-50 px-2.5 py-2 text-xs text-rose-600">
                {error}
              </p>
            )}
            {success && (
              <p className="rounded-md border border-green-200 bg-green-100 px-2.5 py-2 text-xs text-green-800">
                {success}
              </p>
            )}

            <div className="grid gap-2.5 sm:grid-cols-2 mb-4">
              <div className="flex flex-col gap-1">
                <label className="text-xs font-medium text-zinc-500" htmlFor="username">
                  Usuario
                </label>
                <input
                  id="username"
                  className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2.25 text-[13px] font-light text-zinc-900 outline-none transition placeholder:text-zinc-400 focus:border-zinc-400"
                  required
                  autoComplete="username"
                  placeholder="tu_usuario"
                  value={form.username}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, username: e.target.value }))
                  }
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs font-medium text-zinc-500" htmlFor="email">
                  Correo electronico
                </label>
                <input
                  id="email"
                  className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2.25 text-[13px] font-light text-zinc-900 outline-none transition placeholder:text-zinc-400 focus:border-zinc-400"
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

            <div className="grid gap-2.5 sm:grid-cols-2 mb-4">
              <div className="flex flex-col gap-1">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-medium text-zinc-500" htmlFor="password">
                    Contraseña
                  </label>
                  <span className="text-[11px] text-zinc-400">8-16 caracteres</span>
                </div>
                <input
                  id="password"
                  className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2.25 text-[13px] font-light text-zinc-900 outline-none transition placeholder:text-zinc-400 focus:border-zinc-400"
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
                <div className="mt-1 flex gap-1">
                  {[1, 2, 3, 4].map((bar) => (
                    <div key={bar} className={`h-0.75 flex-1 rounded-full ${strengthClass(bar)}`} />
                  ))}
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-medium text-zinc-500" htmlFor="confirmPassword">
                  Confirmar contraseña
                </label>
                <input
                  id="confirmPassword"
                  className={`w-full rounded-lg border bg-white px-3 py-2.25 text-[13px] font-light text-zinc-900 outline-none transition placeholder:text-zinc-400 ${
                    form.confirmPassword.length > 0
                      ? passwordsMatch
                        ? 'border-green-300'
                        : 'border-rose-300'
                      : 'border-zinc-300 focus:border-zinc-400'
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
                  <div className={`mt-0.5 flex items-center gap-1 text-[11px] ${passwordsMatch ? 'text-green-500' : 'text-red-500'}`}>
                    {passwordsMatch ? 'Coinciden' : 'No coinciden'}
                  </div>
                )}
              </div>
            </div>

            <button
              type="submit"
              className="mt-1 w-full rounded-lg bg-zinc-950 px-4 py-2.5 text-[13px] font-normal text-white transition hover:opacity-80 disabled:cursor-not-allowed disabled:opacity-50"
              disabled={loading}
            >
              {loading ? 'Creando cuenta...' : 'Crear cuenta'}
            </button>
          </form>

          <div className="mt-4 text-center text-xs text-zinc-400">
            Al registrarte aceptas nuestros <a className="text-zinc-500 underline underline-offset-3" href="#">terminos de uso</a>
          </div>
        </div>
      </div>
    </div>
  )
}

export default RegisterPage

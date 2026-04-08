import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
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
    <div className="min-h-screen bg-stone-100 px-3 py-3 sm:px-6 sm:py-6">
      <div className="grid min-h-[calc(100vh-1.5rem)] overflow-hidden rounded-3xl bg-white sm:min-h-[calc(100vh-3rem)] md:grid-cols-2">
        <div className="hidden min-h-130 flex-col justify-between bg-zinc-950 p-10 md:flex">
          <Link className="inline-flex items-center gap-2 text-sm font-medium text-white no-underline" to="/">
            <div className="flex h-5.5 w-5.5 items-center justify-center rounded-md bg-white">
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <circle cx="6" cy="6" r="4" fill="white" />
                <circle cx="6" cy="6" r="2" fill="#111" />
              </svg>
            </div>
            InterviewMate
          </Link>

          <div className="flex flex-1 flex-col justify-center py-5 px-8">
            <p className="mb-7 font-serif text-[1.45rem] leading-[1.35] tracking-[-0.02em] text-white">
              "Despues de tres sesiones ya respondia con{' '}
              <em className="not-italic text-zinc-500">mucha mas claridad</em> bajo presion."
            </p>
            <div className="flex items-center gap-2.5">
              <div className="flex h-7.5 w-7.5 items-center justify-center rounded-full border border-zinc-700 bg-zinc-900 text-[11px] font-medium text-zinc-300">
                AM
              </div>
              <div>
                <div className="text-xs font-medium text-white">Alejandra Moreno</div>
                <div className="mt-px text-[11px] text-zinc-500">Frontend Dev · consiguio trabajo en 3 semanas</div>
              </div>
            </div>
          </div>

          <div className="flex gap-1.5">
            <div className="h-1.25 w-1.25 rounded-full bg-white" />
            <div className="h-1.25 w-1.25 rounded-full bg-zinc-700" />
            <div className="h-1.25 w-1.25 rounded-full bg-zinc-700" />
          </div>
        </div>

        <div className="flex flex-col justify-center bg-white px-5 py-8 sm:px-10">
          <div className="mb-7 text-center">
            <h1 className="mb-1.5 font-serif text-[1.65rem] font-normal leading-[1.2] tracking-[-0.02em] text-zinc-900">
              Bienvenido de nuevo
            </h1>
            <p className="text-[13px] font-light text-zinc-500">
              ¿No tienes cuenta?{' '}
              <Link className="font-normal text-zinc-900 underline underline-offset-3" to="/register">
                Registrate gratis
              </Link>
            </p>
          </div>

          <button
            type="button"
            className="mb-5 inline-flex w-full items-center justify-center gap-2.5 rounded-lg border border-zinc-300 bg-white px-4 py-2.25 text-[13px] font-normal text-zinc-900 transition hover:bg-black/8 disabled:cursor-not-allowed disabled:opacity-50"
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

          <div className="mb-5 flex items-center gap-2.5">
            <div className="h-px flex-1 bg-zinc-200" />
            <span className="whitespace-nowrap text-[11px] tracking-[0.04em] text-zinc-400">o continua con tu cuenta</span>
            <div className="h-px flex-1 bg-zinc-200" />
          </div>

          <form className="flex flex-col gap-3" onSubmit={onSubmit}>
            {error && (
              <p className="rounded-md border border-rose-200 bg-rose-50 px-2.5 py-2 text-xs text-rose-600">
                {error}
              </p>
            )}

            <div className="flex flex-col gap-1.5">
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

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-zinc-500" htmlFor="password">
                Contraseña
              </label>
              <input
                id="password"
                className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2.25 text-[13px] font-light text-zinc-900 outline-none transition placeholder:text-zinc-400 focus:border-zinc-400"
                required
                type="password"
                autoComplete="current-password"
                placeholder="••••••••"
                value={form.password}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, password: e.target.value }))
                }
              />
              <div className="-mt-0.5 flex justify-end">
                <a className="text-[11px] text-zinc-400 underline underline-offset-3 mt-3" href="#">
                  ¿Olvidaste tu contraseña?
                </a>
              </div>
            </div>

            <button
              type="submit"
              className="mt-1 w-full rounded-lg bg-zinc-950 px-4 py-2.5 text-[13px] font-normal text-white transition hover:opacity-80 disabled:cursor-not-allowed disabled:opacity-50"
              disabled={loading}
            >
              {loading ? 'Ingresando...' : 'Entrar'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

export default LoginPage

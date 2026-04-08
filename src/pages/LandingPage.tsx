import { useEffect } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import {
  handleOAuthCallback,
  OAUTH_CALLBACK_PARAMS,
} from '../controllers/authController'
import { isAuthenticated } from '../lib/auth'
import ActionLinkButton from '../components/ActionLinkButton'

function LandingPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  useEffect(() => {
    const token = searchParams.get(OAUTH_CALLBACK_PARAMS.TOKEN)

    if (token) {
      const expiresAt = searchParams.get(OAUTH_CALLBACK_PARAMS.EXPIRES_AT)
      handleOAuthCallback({ token, expiresAt })
      navigate('/dashboard', { replace: true })
      return
    }

    if (isAuthenticated()) {
      navigate('/dashboard', { replace: true })
    }
  }, [navigate, searchParams])

  return (
    <section className="w-full bg-white pb-20 text-zinc-900">
      <nav className="border-b border-zinc-200">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-4 py-5 sm:px-6 lg:px-8">
          <Link className="inline-flex items-center gap-2 text-[15px] font-medium text-zinc-900 no-underline" to="/">
            <div className="flex h-5.5 w-5.5ems-center justify-center rounded-md bg-zinc-900">
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <circle cx="6" cy="6" r="4" fill="white" />
                <circle cx="6" cy="6" r="2" fill="#111" />
              </svg>
            </div>
            InterviewMate
          </Link>
          <div className="flex items-center gap-2">
            <ActionLinkButton to="/login" variant="ghost" size="md">
              Iniciar sesion
            </ActionLinkButton>
            <ActionLinkButton to="/register" variant="primary" size="md">
              Comenzar gratis
            </ActionLinkButton>
          </div>
        </div>
      </nav>

      <section className="mx-auto grid w-full max-w-7xl grid-cols-1 gap-12 px-4 pb-16 pt-14 sm:px-6 lg:grid-cols-2 lg:gap-14 lg:px-8">
        <div>
          <div className="mb-6 inline-flex items-center gap-1.5 rounded-full border border-zinc-300 px-3 py-1 text-xs tracking-[0.02em] text-zinc-500">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-green-500" />
            +1,200 sesiones esta semana
          </div>

          <h1 className="mb-5 font-serif text-5xl font-normal leading-[1.12] tracking-[-0.02em] text-zinc-900">
            Practica.
            <br />
            <em className="not-italic text-zinc-500">Mejora.</em>
            <br />
            Consigue el trabajo.
          </h1>

          <p className="mb-8 max-w-[38ch] text-[15px] font-light leading-[1.65] text-zinc-600">
            Simulaciones de entrevista personalizadas segun tu stack y nivel,
            con feedback estructurado que te dice exactamente que mejorar.
          </p>

          <div className="mb-10 flex items-center gap-2.5">
            <ActionLinkButton to="/register" variant="primary" size="md">
              Comenzar gratis
            </ActionLinkButton>
            <ActionLinkButton to="/login" variant="ghost" size="md">
              Iniciar sesion
            </ActionLinkButton>
          </div>

          <div className="flex items-center gap-2 text-xs text-zinc-400">
            <div className="flex">
              {[
                ['A', '#7F77DD'],
                ['M', '#1D9E75'],
                ['C', '#D85A30'],
                ['L', '#378ADD'],
              ].map(([letter, color]) => (
                <div
                  className="-mr-1.5 flex h-5.5 w-5.5 items-center justify-center rounded-full border-2 border-white text-[9px] font-medium text-white"
                  key={letter}
                  style={{ background: color }}
                >
                  {letter}
                </div>
              ))}
            </div>
            Mas de 400 desarrolladores registrados este mes
          </div>
        </div>

        <div className="flex flex-col gap-2 items-center justify-center">
          <div className="flex items-center gap-1.5 pl-0.5 text-[11px] uppercase tracking-[0.06em] text-zinc-400">
            <span className="h-1.75 w-1.75 animate-pulse rounded-full bg-green-500" />
            Ejemplo de sesion en curso
          </div>

          <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-stone-50">
            <div className="flex items-center justify-between border-b border-zinc-200 bg-white px-3.5 py-2.5">
              <div className="flex items-center gap-2">
                <div className="flex h-6.5 w-6.5 items-center justify-center rounded-full bg-[#EEEDFE] text-[11px] font-medium text-[#534AB7]">
                  JR
                </div>
                <div className="flex flex-col">
                  <span className="text-xs font-medium">Juan Rodriguez</span>
                  <span className="text-[11px] text-zinc-400">Frontend · React · Mid-level</span>
                </div>
              </div>
              <span className="rounded-full bg-green-100 px-2 py-0.5 text-[10px] font-medium tracking-[0.02em] text-green-800">
                Pregunta 3 / 8
              </span>
            </div>

            <div className="flex flex-col gap-2.5 p-3.5">
              <div className="rounded-lg border border-zinc-200 bg-white px-3 py-2.5">
                <div className="mb-1 text-[10px] uppercase tracking-[0.05em] text-zinc-400">Pregunta tecnica</div>
                <div className="text-[13px] font-medium leading-[1.4]">
                  ¿Como funciona el Virtual DOM en React y por que es util?
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <div className="max-w-[88%] self-end rounded-[10px] rounded-br-[3px] bg-zinc-900 px-3 py-2 text-[12.5px] leading-[1.55] text-white">
                  React mantiene una copia ligera del DOM real. Al cambiar el estado,
                  compara el arbol virtual con el anterior y aplica solo los cambios necesarios.
                </div>
                <div className="max-w-[92%] rounded-[10px] rounded-bl-[3px] border border-zinc-200 bg-white px-3 py-2 text-[12.5px] leading-[1.55] text-zinc-900">
                  Buena respuesta. Describes bien el concepto de diffing. Para completarla,
                  menciona el proceso de reconciliacion y por que mejora el rendimiento
                  frente a manipular el DOM directamente.
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-2 border-t border-zinc-200 px-3.5 py-2.5">
              <div className="text-[10px] uppercase tracking-[0.06em] text-zinc-400">Feedback inmediato</div>
              <div className="flex flex-wrap gap-1.5">
                <span className="rounded-full bg-green-100 px-2.5 py-1 text-[11px] font-medium text-green-800">Concepto correcto</span>
                <span className="rounded-full bg-amber-100 px-2.5 py-1 text-[11px] font-medium text-amber-800">Menciona reconciliacion</span>
                <span className="rounded-full bg-amber-100 px-2.5 py-1 text-[11px] font-medium text-amber-800">Agrega un ejemplo</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <hr className="mx-auto my-0 w-[calc(100%-2rem)] max-w-7xl border-zinc-200 sm:w-[calc(100%-3rem)] lg:w-[calc(100%-4rem)]" />

      <section className="mx-auto grid w-full max-w-7xl grid-cols-1 gap-12 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:gap-16 lg:px-8">
        <div className="space-y-1 mr-8">
          <div className="mb-3 text-[11px] uppercase tracking-widest text-zinc-400">Por que funciona</div>
          <h2 className="mb-4 font-serif text-[2rem] font-normal leading-[1.2] tracking-[-0.02em]">
            Preparacion que
            <br />
            se nota en la sala
          </h2>
          <p className="text-sm font-light leading-[1.65] text-zinc-600">
            La diferencia entre un candidato mediocre y uno memorable no es el
            conocimiento, es como lo comunica bajo presion.
          </p>
        </div>

        <div>
          {[
            {
              num: '01',
              title: 'Preguntas reales del sector',
              desc: 'Basadas en procesos de seleccion de empresas tech. No ensayos genericos.',
            },
            {
              num: '02',
              title: 'Feedback con estructura',
              desc: 'Cada respuesta evaluada en claridad, profundidad y confianza, no solo si es correcta.',
            },
            {
              num: '03',
              title: 'Sesiones adaptadas a ti',
              desc: 'Tu stack, tu nivel, tu rol objetivo. Las preguntas cambian segun tu progreso.',
            },
            {
              num: '04',
              title: 'Sin limite de practica',
              desc: 'Repite hasta que te salga natural. El volumen de practica marca la diferencia.',
            },
          ].map((item, idx, arr) => (
            <div
              className={`flex items-start gap-4 py-5 ${idx < arr.length - 1 ? 'border-b border-zinc-200' : ''}`}
              key={item.num}
            >
              <div className="min-w-7 pt-0.5 font-serif text-2xl leading-none text-zinc-300">{item.num}</div>
              <div>
                <h3 className="mb-1 text-sm font-medium">{item.title}</h3>
                <p className="text-[13px] font-light leading-[1.55] text-zinc-500">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <hr className="mx-auto my-0 w-[calc(100%-2rem)] max-w-7xl border-zinc-200 sm:w-[calc(100%-3rem)] lg:w-[calc(100%-4rem)]" />

      <section className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="mb-8">
          <div className="mb-3 text-[11px] uppercase tracking-widest text-zinc-400">Como funciona</div>
          <h2 className="font-serif text-[2rem] font-normal leading-[1.2] tracking-[-0.02em]">
            Todo en un solo lugar
          </h2>
          <p className="mt-3 max-w-[48ch] text-sm font-light leading-[1.65] text-zinc-600">
            Desde el diagnostico inicial hasta el seguimiento de tu progreso,
            sin herramientas dispersas.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-3 md:gap-5">
          <div className="rounded-xl border border-zinc-200 bg-white p-5">
            <div className="mb-4 flex h-8 w-8 items-center justify-center rounded-lg bg-[#EEEDFE]">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <rect x="2" y="2" width="5" height="5" rx="1.5" fill="#7F77DD" />
                <rect x="9" y="2" width="5" height="5" rx="1.5" fill="#AFA9EC" />
                <rect x="2" y="9" width="5" height="5" rx="1.5" fill="#AFA9EC" />
                <rect x="9" y="9" width="5" height="5" rx="1.5" fill="#534AB7" />
              </svg>
            </div>
            <h3 className="mb-1.5 text-sm font-medium leading-[1.3]">Diagnostico de perfil</h3>
            <p className="text-[13px] font-light leading-[1.55] text-zinc-500">
              Configura tu stack y nivel. Las preguntas se adaptan a tu rol
              y experiencia desde la primera sesion.
            </p>
          </div>

          <div className="rounded-xl border border-zinc-200 bg-white p-5">
            <div className="mb-4 flex h-8 w-8 items-center justify-center rounded-lg bg-[#E1F5EE]">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path
                  d="M2 4a2 2 0 012-2h8a2 2 0 012 2v6a2 2 0 01-2 2H6l-4 2V4z"
                  fill="#1D9E75"
                />
              </svg>
            </div>
            <h3 className="mb-1.5 text-sm font-medium leading-[1.3]">Simulaciones guiadas</h3>
            <p className="text-[13px] font-light leading-[1.55] text-zinc-500">
              Practica tecnica, comportamental o mixta con feedback inmediato
              en cada respuesta.
            </p>
          </div>

          <div className="rounded-xl border border-zinc-200 bg-white p-5">
            <div className="mb-4 flex h-8 w-8 items-center justify-center rounded-lg bg-[#FAEEDA]">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <polyline
                  points="2,12 5,8 8,10 11,5 14,3"
                  stroke="#BA7517"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  fill="none"
                />
              </svg>
            </div>
            <h3 className="mb-1.5 text-sm font-medium leading-[1.3]">Seguimiento continuo</h3>
            <p className="text-[13px] font-light leading-[1.55] text-zinc-500">
              Identifica tus puntos debiles y ve como evolucionas con
              cada nueva sesion de practica.
            </p>
          </div>
        </div>
      </section>

      <div className="mx-auto mt-8 flex w-[calc(100%-2rem)] max-w-7xl flex-col items-start justify-between gap-8 rounded-2xl border border-zinc-200 bg-stone-50 p-8 sm:w-[calc(100%-3rem)] lg:w-[calc(100%-4rem)] lg:flex-row lg:items-center">
        <h2 className="max-w-[28ch] font-serif text-[1.75rem] font-normal leading-tight tracking-[-0.02em]">
          Empieza a practicar hoy.
          <br />
          <em className="not-italic text-zinc-500">La proxima entrevista puede ser la definitiva.</em>
        </h2>

        <div className="flex shrink-0 flex-col items-start gap-2 lg:items-end">
          <ActionLinkButton to="/register" variant="primary" size="md">
            Crear mi cuenta
          </ActionLinkButton>
          <span className="text-xs text-zinc-400">Gratis, sin tarjeta de credito</span>
        </div>
      </div>
    </section>
  )
}

export default LandingPage

import { useEffect } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import {
  handleOAuthCallback,
  OAUTH_CALLBACK_PARAMS,
} from '../controllers/authController'
import { isAuthenticated } from '../lib/auth'


  <link href="https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;1,9..40,300&display=swap" rel="stylesheet" />

function LandingPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  /**
   * Fallback OAuth2 handler.
   *
   * Intercepts the case where the backend still redirects the OAuth callback
   * to "/" instead of "/auth/callback". As soon as the backend is configured
   * to redirect to "/auth/callback" this block will never be reached.
   *
   * Priority order:
   *  1. Token in URL → save + go to dashboard.
   *  2. Already authenticated → go to dashboard (avoids showing the
   *     marketing page to a logged-in user).
   */
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
    <>
      <style>{`
        .lp * { box-sizing: border-box; margin: 0; padding: 0; }

        .lp {
          font-family: 'DM Sans', sans-serif;
          color: #111;
          background: #fff;
          width: 100%;
          min-height: 100vh;
          padding: 0 0 4rem;
        }

        /* ── NAV ── */
        .lp-nav {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 1.25rem 2rem;
          border-bottom: 0.5px solid #e5e5e5;
        }
        .lp-brand {
          display: flex; align-items: center; gap: 8px;
          font-size: 15px; font-weight: 500;
          text-decoration: none; color: #111;
        }
        .lp-brand-dot {
          width: 22px; height: 22px; border-radius: 6px;
          background: #111;
          display: flex; align-items: center; justify-content: center;
        }
        .lp-nav-actions { display: flex; gap: 8px; align-items: center; }

        .btn {
          font-family: 'DM Sans', sans-serif;
          font-size: 13px; padding: 7px 16px;
          border-radius: 999px; cursor: pointer;
          font-weight: 400; transition: opacity 0.15s;
          text-decoration: none; display: inline-block;
        }
        .btn:hover { opacity: 0.75; }
        .btn-ghost { border: 0.5px solid #ccc; background: transparent; color: #111; }
        .btn-solid { background: #111; color: #fff; border: none; }
        .btn-lg { font-size: 14px; padding: 10px 24px; }

        /* ── HERO ── */
        .lp-hero {
          padding: 4rem 2rem 3rem;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 3rem;
          align-items: start;
        }
        .lp-badge {
          display: inline-flex; align-items: center; gap: 6px;
          font-size: 12px; color: #666;
          border: 0.5px solid #ddd;
          border-radius: 999px; padding: 4px 12px;
          margin-bottom: 1.5rem;
          letter-spacing: 0.02em;
        }
        .lp-badge-pulse {
          width: 6px; height: 6px; border-radius: 50%;
          background: #4CAF50;
          animation: lp-pulse 2s ease-in-out infinite;
        }
        @keyframes lp-pulse {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0.4; }
        }
        .lp-hero h1 {
          font-family: 'Instrument Serif', serif;
          font-size: 3rem; line-height: 1.12;
          font-weight: 400; margin-bottom: 1.25rem;
          letter-spacing: -0.02em;
        }
        .lp-hero h1 em { font-style: italic; color: #888; }
        .lp-hero-copy p {
          font-size: 15px; line-height: 1.65;
          color: #555; margin-bottom: 2rem;
          font-weight: 300; max-width: 38ch;
        }
        .lp-cta-row { display: flex; gap: 10px; align-items: center; margin-bottom: 2rem; }
        .lp-proof {
          font-size: 12px; color: #999;
          display: flex; align-items: center; gap: 6px;
        }
        .lp-proof-avatars { display: flex; }
        .lp-proof-avatar {
          width: 22px; height: 22px; border-radius: 50%;
          border: 2px solid #fff;
          margin-right: -6px; font-size: 9px;
          display: flex; align-items: center; justify-content: center;
          font-weight: 500; color: #fff;
        }

        /* ── SESSION MOCKUP ── */
        .lp-session-wrap { display: flex; flex-direction: column; gap: 8px; }
        .lp-session-label {
          display: flex; align-items: center; gap: 7px;
          font-size: 11px; color: #999;
          letter-spacing: 0.06em; text-transform: uppercase;
          padding-left: 2px;
        }
        .lp-session-label-dot {
          width: 7px; height: 7px; border-radius: 50%;
          background: #4CAF50;
          animation: lp-pulse 2s ease-in-out infinite;
        }
        .lp-session-card {
          background: #f9f9f8;
          border-radius: 14px;
          border: 0.5px solid #e5e5e5;
          overflow: hidden;
        }
        .lp-session-topbar {
          display: flex; align-items: center; justify-content: space-between;
          padding: 10px 14px;
          border-bottom: 0.5px solid #e5e5e5;
          background: #fff;
        }
        .lp-session-topbar-left { display: flex; align-items: center; gap: 8px; }
        .lp-session-avatar {
          width: 26px; height: 26px; border-radius: 50%;
          background: #EEEDFE;
          display: flex; align-items: center; justify-content: center;
          font-size: 11px; font-weight: 500; color: #534AB7;
        }
        .lp-session-info { display: flex; flex-direction: column; gap: 1px; }
        .lp-session-name { font-size: 12px; font-weight: 500; }
        .lp-session-role { font-size: 11px; color: #999; }
        .lp-session-badge {
          font-size: 10px; padding: 3px 8px;
          border-radius: 999px; background: #DCFCE7;
          color: #166534; font-weight: 500;
          letter-spacing: 0.02em;
        }
        .lp-session-body { padding: 14px; display: flex; flex-direction: column; gap: 10px; }
        .lp-question-block {
          background: #fff; border-radius: 8px;
          padding: 10px 12px;
          border: 0.5px solid #e5e5e5;
        }
        .lp-question-tag {
          font-size: 10px; color: #999;
          letter-spacing: 0.05em; text-transform: uppercase;
          margin-bottom: 5px;
        }
        .lp-question-text { font-size: 13px; font-weight: 500; line-height: 1.4; }
        .lp-chat { display: flex; flex-direction: column; gap: 7px; }
        .lp-bubble { border-radius: 10px; padding: 9px 12px; font-size: 12.5px; line-height: 1.55; }
        .lp-bubble-user {
          background: #111; color: #fff;
          align-self: flex-end;
          border-bottom-right-radius: 3px;
          max-width: 88%;
        }
        .lp-bubble-ai {
          background: #fff;
          border: 0.5px solid #e5e5e5;
          color: #111;
          border-bottom-left-radius: 3px;
          max-width: 92%;
        }
        .lp-feedback-section {
          border-top: 0.5px solid #e5e5e5;
          padding: 10px 14px;
          display: flex; flex-direction: column; gap: 7px;
        }
        .lp-feedback-title {
          font-size: 10px; color: #999;
          letter-spacing: 0.06em; text-transform: uppercase;
        }
        .lp-pills { display: flex; gap: 6px; flex-wrap: wrap; }
        .lp-pill { font-size: 11px; padding: 4px 10px; border-radius: 999px; font-weight: 500; }
        .pill-g { background: #DCFCE7; color: #166534; }
        .pill-y { background: #FEF9C3; color: #854D0E; }

        /* ── SEPARADOR ── */
        .lp-sep { border: none; border-top: 0.5px solid #e5e5e5; margin: 0 2rem; }

        /* ── SECCIONES ── */
        .lp-section { padding: 3rem 2rem; }
        .lp-eyebrow {
          font-size: 11px; letter-spacing: 0.1em;
          text-transform: uppercase; color: #999; margin-bottom: 0.75rem;
        }
        .lp-section-header { margin-bottom: 2rem; }
        .lp-section-header h2 {
          font-family: 'Instrument Serif', serif;
          font-size: 2rem; font-weight: 400;
          line-height: 1.2; letter-spacing: -0.02em;
        }
        .lp-section-header p {
          font-size: 14px; color: #555;
          margin-top: 0.75rem; font-weight: 300;
          line-height: 1.65; max-width: 48ch;
        }

        /* ── POR QUÉ ── */
        .lp-why-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 4rem;
          align-items: start;
        }
        .lp-why-intro h2 {
          font-family: 'Instrument Serif', serif;
          font-size: 2rem; font-weight: 400;
          line-height: 1.2; letter-spacing: -0.02em;
          margin-bottom: 1rem;
        }
        .lp-why-intro p {
          font-size: 14px; color: #555;
          font-weight: 300; line-height: 1.65;
        }
        .lp-highlights { display: flex; flex-direction: column; }
        .lp-highlight-item {
          display: flex; align-items: flex-start; gap: 16px;
          padding: 1.25rem 0;
          border-bottom: 0.5px solid #e5e5e5;
        }
        .lp-highlight-item:last-child { border-bottom: none; }
        .lp-highlight-num {
          font-family: 'Instrument Serif', serif;
          font-size: 1.5rem; color: #ccc;
          line-height: 1; min-width: 28px; padding-top: 2px;
        }
        .lp-highlight-text h3 { font-size: 14px; font-weight: 500; margin-bottom: 4px; }
        .lp-highlight-text p { font-size: 13px; color: #666; font-weight: 300; line-height: 1.55; }

        /* ── FEATURES ── */
        .lp-features { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 12px; }
        .lp-feature {
          padding: 1.25rem;
          border: 0.5px solid #e5e5e5;
          border-radius: 12px;
          background: #fff;
        }
        .lp-feature-icon {
          width: 32px; height: 32px; border-radius: 8px;
          margin-bottom: 1rem;
          display: flex; align-items: center; justify-content: center;
        }
        .lp-feature h3 { font-size: 14px; font-weight: 500; margin-bottom: 6px; line-height: 1.3; }
        .lp-feature p { font-size: 13px; color: #666; line-height: 1.55; font-weight: 300; }

        /* ── CTA FINAL ── */
        .lp-cta-section {
          margin: 0 2rem;
          padding: 2.5rem;
          background: #f9f9f8;
          border-radius: 16px;
          border: 0.5px solid #e5e5e5;
          display: flex; align-items: center;
          justify-content: space-between; gap: 2rem;
        }
        .lp-cta-section h2 {
          font-family: 'Instrument Serif', serif;
          font-size: 1.75rem; font-weight: 400;
          line-height: 1.25; letter-spacing: -0.02em; max-width: 28ch;
        }
        .lp-cta-section h2 em { font-style: italic; color: #888; }
        .lp-cta-right { display: flex; flex-direction: column; gap: 8px; align-items: flex-end; flex-shrink: 0; }
        .lp-cta-note { font-size: 12px; color: #999; }
      `}</style>

      <section className="lp">

        {/* ── NAV ── */}
        <nav className="lp-nav">
          <Link className="lp-brand" to="/">
            <div className="lp-brand-dot">
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <circle cx="6" cy="6" r="4" fill="white" />
                <circle cx="6" cy="6" r="2" fill="#111" />
              </svg>
            </div>
            InterviewMate
          </Link>
          <div className="lp-nav-actions">
            <Link className="btn btn-ghost" to="/login">Iniciar sesión</Link>
            <Link className="btn btn-solid" to="/register">Comenzar gratis</Link>
          </div>
        </nav>

        {/* ── HERO ── */}
        <section className="lp-hero">

          {/* Copy */}
          <div className="lp-hero-copy">
            <div className="lp-badge">
              <span className="lp-badge-pulse" />
              +1,200 sesiones esta semana
            </div>
            <h1>
              Practica.<br />
              <em>Mejora.</em><br />
              Consigue el trabajo.
            </h1>
            <p>
              Simulaciones de entrevista personalizadas según tu stack y nivel,
              con feedback estructurado que te dice exactamente qué mejorar.
            </p>
            <div className="lp-cta-row">
              <Link className="btn btn-solid btn-lg" to="/register">Comenzar gratis</Link>
              <Link className="btn btn-ghost btn-lg" to="/login">Iniciar sesión</Link>
            </div>
            <div className="lp-proof">
              <div className="lp-proof-avatars">
                <div className="lp-proof-avatar" style={{ background: '#7F77DD' }}>A</div>
                <div className="lp-proof-avatar" style={{ background: '#1D9E75' }}>M</div>
                <div className="lp-proof-avatar" style={{ background: '#D85A30' }}>C</div>
                <div className="lp-proof-avatar" style={{ background: '#378ADD' }}>L</div>
              </div>
              Más de 400 desarrolladores registrados este mes
            </div>
          </div>

          {/* Mockup sesión */}
          <div className="lp-session-wrap">
            <div className="lp-session-label">
              <span className="lp-session-label-dot" />
              Ejemplo de sesión en curso
            </div>
            <div className="lp-session-card">
              <div className="lp-session-topbar">
                <div className="lp-session-topbar-left">
                  <div className="lp-session-avatar">JR</div>
                  <div className="lp-session-info">
                    <span className="lp-session-name">Juan Rodríguez</span>
                    <span className="lp-session-role">Frontend · React · Mid-level</span>
                  </div>
                </div>
                <span className="lp-session-badge">Pregunta 3 / 8</span>
              </div>
              <div className="lp-session-body">
                <div className="lp-question-block">
                  <div className="lp-question-tag">Pregunta técnica</div>
                  <div className="lp-question-text">
                    ¿Cómo funciona el Virtual DOM en React y por qué es útil?
                  </div>
                </div>
                <div className="lp-chat">
                  <div className="lp-bubble lp-bubble-user">
                    React mantiene una copia ligera del DOM real. Al cambiar el estado,
                    compara el árbol virtual con el anterior y aplica solo los cambios necesarios.
                  </div>
                  <div className="lp-bubble lp-bubble-ai">
                    Buena respuesta. Describes bien el concepto de diffing. Para completarla,
                    menciona el proceso de reconciliación y por qué mejora el rendimiento
                    frente a manipular el DOM directamente.
                  </div>
                </div>
              </div>
              <div className="lp-feedback-section">
                <div className="lp-feedback-title">Feedback inmediato</div>
                <div className="lp-pills">
                  <span className="lp-pill pill-g">Concepto correcto</span>
                  <span className="lp-pill pill-y">Menciona reconciliación</span>
                  <span className="lp-pill pill-y">Agrega un ejemplo</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <hr className="lp-sep" />

        {/* ── POR QUÉ INTERVIEWMATE ── */}
        <section className="lp-section">
          <div className="lp-why-grid">
            <div className="lp-why-intro">
              <div className="lp-eyebrow">Por qué funciona</div>
              <h2>Preparación que<br />se nota en la sala</h2>
              <p>
                La diferencia entre un candidato mediocre y uno memorable no es el
                conocimiento — es cómo lo comunica bajo presión.
              </p>
            </div>
            <div className="lp-highlights">
              {[
                {
                  num: '01',
                  title: 'Preguntas reales del sector',
                  desc: 'Basadas en procesos de selección de empresas tech. No ensayos genéricos.',
                },
                {
                  num: '02',
                  title: 'Feedback con estructura',
                  desc: 'Cada respuesta evaluada en claridad, profundidad y confianza — no solo si es correcta.',
                },
                {
                  num: '03',
                  title: 'Sesiones adaptadas a ti',
                  desc: 'Tu stack, tu nivel, tu rol objetivo. Las preguntas cambian según tu progreso.',
                },
                {
                  num: '04',
                  title: 'Sin límite de práctica',
                  desc: 'Repite hasta que te salga natural. El volumen de práctica marca la diferencia.',
                },
              ].map((item) => (
                <div className="lp-highlight-item" key={item.num}>
                  <div className="lp-highlight-num">{item.num}</div>
                  <div className="lp-highlight-text">
                    <h3>{item.title}</h3>
                    <p>{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <hr className="lp-sep" />

        {/* ── CÓMO FUNCIONA ── */}
        <section className="lp-section">
          <div className="lp-section-header">
            <div className="lp-eyebrow">Cómo funciona</div>
            <h2>Todo en un solo lugar</h2>
            <p>
              Desde el diagnóstico inicial hasta el seguimiento de tu progreso —
              sin herramientas dispersas.
            </p>
          </div>
          <div className="lp-features">

            {/* Diagnóstico */}
            <div className="lp-feature">
              <div className="lp-feature-icon" style={{ background: '#EEEDFE' }}>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <rect x="2" y="2" width="5" height="5" rx="1.5" fill="#7F77DD" />
                  <rect x="9" y="2" width="5" height="5" rx="1.5" fill="#AFA9EC" />
                  <rect x="2" y="9" width="5" height="5" rx="1.5" fill="#AFA9EC" />
                  <rect x="9" y="9" width="5" height="5" rx="1.5" fill="#534AB7" />
                </svg>
              </div>
              <h3>Diagnóstico de perfil</h3>
              <p>
                Configura tu stack y nivel. Las preguntas se adaptan a tu rol
                y experiencia desde la primera sesión.
              </p>
            </div>

            {/* Simulaciones */}
            <div className="lp-feature">
              <div className="lp-feature-icon" style={{ background: '#E1F5EE' }}>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path
                    d="M2 4a2 2 0 012-2h8a2 2 0 012 2v6a2 2 0 01-2 2H6l-4 2V4z"
                    fill="#1D9E75"
                  />
                </svg>
              </div>
              <h3>Simulaciones guiadas</h3>
              <p>
                Práctica técnica, comportamental o mixta con feedback inmediato
                en cada respuesta.
              </p>
            </div>

            {/* Seguimiento */}
            <div className="lp-feature">
              <div className="lp-feature-icon" style={{ background: '#FAEEDA' }}>
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
              <h3>Seguimiento continuo</h3>
              <p>
                Identifica tus puntos débiles y ve cómo evolucionas con
                cada nueva sesión de práctica.
              </p>
            </div>

          </div>
        </section>

        {/* ── CTA FINAL ── */}
        <div className="lp-cta-section">
          <h2>
            Empieza a practicar hoy.<br />
            <em>La próxima entrevista puede ser la definitiva.</em>
          </h2>
          <div className="lp-cta-right">
            <Link className="btn btn-solid btn-lg" to="/register">Crear mi cuenta</Link>
            <span className="lp-cta-note">Gratis, sin tarjeta de crédito</span>
          </div>
        </div>

      </section>
    </>
  )
}

export default LandingPage
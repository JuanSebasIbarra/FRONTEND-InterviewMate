import { Link } from 'react-router-dom'
import heroLogo from '../assets/hero.png'

function LandingPage() {
  return (
    <section className="marketing-page">
      <header className="marketing-hero">
        <div className="marketing-hero__text">
          <span className="marketing-badge">Prepárate mejor para tus entrevistas</span>
          <h2>Convierte cada simulación en una oferta real de trabajo</h2>
          <p>
            InterviewMate te ayuda a practicar entrevistas técnicas y comportamentales con
            preguntas personalizadas, feedback estructurado y sesiones enfocadas a tu perfil.
          </p>
          <div className="page-actions">
            <Link className="cta cta-primary" to="/register">
              Comenzar gratis
            </Link>
            <Link className="cta cta-secondary" to="/login">
              Ya tengo cuenta
            </Link>
          </div>
          <p className="marketing-proof">+1,200 sesiones de práctica realizadas esta semana</p>
        </div>

        <div className="marketing-hero__visual">
          <img src={heroLogo} alt="InterviewMate logo" />
        </div>
      </header>

      <section className="marketing-block">
        <h3>¿Por qué una landing larga?</h3>
        <p>
          Porque tomar una decisión profesional requiere confianza. Por eso te mostramos de forma
          clara cómo funciona InterviewMate, qué beneficios obtienes y por qué otros candidatos lo
          recomiendan.
        </p>
      </section>

      <section className="marketing-grid">
        <article className="marketing-card">
          <h4>Diagnóstico de perfil</h4>
          <p>
            Configura tu stack y experiencia para recibir preguntas acordes a tu rol y nivel.
          </p>
        </article>
        <article className="marketing-card">
          <h4>Simulaciones guiadas</h4>
          <p>
            Práctica técnica, comportamental o mixta con sesiones realistas y progresivas.
          </p>
        </article>
        <article className="marketing-card">
          <h4>Seguimiento continuo</h4>
          <p>
            Guarda avances, identifica mejoras y enfócate en los puntos que elevan tu desempeño.
          </p>
        </article>
      </section>

      <section className="marketing-block marketing-block--dark">
        <h3>Resultados que importan</h3>
        <ul>
          <li>Feedback inmediato en cada respuesta.</li>
          <li>Entrenamiento enfocado en claridad, estructura y confianza.</li>
          <li>Preparación continua para entrevistas reales de tecnología.</li>
        </ul>
        <Link className="cta cta-primary" to="/register">
          Crear mi cuenta
        </Link>
      </section>
    </section>
  )
}

export default LandingPage

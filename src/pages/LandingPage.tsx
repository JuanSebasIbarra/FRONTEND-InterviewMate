import { Link } from 'react-router-dom'

function LandingPage() {
  return (
    <section className="page-card">
      <h2>Landing Page</h2>
      <p>Plantilla de página pública para mostrar información general del producto.</p>
      <div className="page-actions">
        <Link to="/login">Ir a Login</Link>
        <Link to="/register">Ir a Register</Link>
      </div>
    </section>
  )
}

export default LandingPage

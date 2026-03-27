import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { clearAuthToken, isAuthenticated } from './lib/auth'

function Main() {
  const navigate = useNavigate()
  const authenticated = isAuthenticated()

  const onLogout = () => {
    clearAuthToken()
    navigate('/', { replace: true })
  }

  return (
    <div className="layout">
      <header className="layout__header">
        <h1>InterviewMate</h1>
        <nav className="layout__nav">
          <NavLink to="/" end>
            Landing
          </NavLink>
          {!authenticated ? (
            <>
              <NavLink to="/login">Login</NavLink>
              <NavLink to="/register">Register</NavLink>
            </>
          ) : (
            <>
              <NavLink to="/dashboard">Dashboard</NavLink>
              <button type="button" className="layout__logout" onClick={onLogout}>
                Logout
              </button>
            </>
          )}
        </nav>
      </header>

      <main className="layout__content">
        <Outlet />
      </main>
    </div>
  )
}

export default Main

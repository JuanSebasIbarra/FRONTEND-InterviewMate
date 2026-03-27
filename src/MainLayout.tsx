import { NavLink, Outlet } from 'react-router-dom'

function Main() {
  return (
    <div className="layout">
      <header className="layout__header">
        <h1>InterviewMate</h1>
        <nav className="layout__nav">
          <NavLink to="/" end>
            Landing
          </NavLink>
          <NavLink to="/login">Login</NavLink>
          <NavLink to="/register">Register</NavLink>
          <NavLink to="/dashboard">Dashboard</NavLink>
        </nav>
      </header>

      <main className="layout__content">
        <Outlet />
      </main>
    </div>
  )
}

export default Main

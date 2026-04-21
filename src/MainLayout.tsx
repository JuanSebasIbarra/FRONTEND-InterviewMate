import { Outlet, useLocation } from 'react-router-dom'

function Main() {
  const location = useLocation()

  const useNewInterfaceNavbar =
    location.pathname === '/' ||
    location.pathname.startsWith('/login') ||
    location.pathname.startsWith('/register') ||
    location.pathname.startsWith('/interview/live') ||
    location.pathname.startsWith('/dashboard') ||
    location.pathname.startsWith('/history') ||
    location.pathname.startsWith('/study/live') ||
    location.pathname.startsWith('/settings') ||
    location.pathname.startsWith('/templates') ||
    location.pathname.startsWith('/Template')

  if (useNewInterfaceNavbar) {
    return <Outlet />
  }

  return (
    <div className="layout">
      <main className="layout__content">
        <Outlet />
      </main>
    </div>
  )
}

export default Main

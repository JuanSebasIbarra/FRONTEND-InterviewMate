import { Navigate, createBrowserRouter } from 'react-router-dom'
import type { ReactElement } from 'react'
import Main from './MainLayout'
import DashboardPage from './pages/DashboardPage'
import LandingPage from './pages/LandingPage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import { isAuthenticated } from './lib/auth'

type PrivateRouteProps = {
  children: ReactElement
}

function PrivateRoute({ children }: PrivateRouteProps) {
  const hasAccess = isAuthenticated()

  return hasAccess ? children : <Navigate to="/login" replace />
}

export const appRouter = createBrowserRouter([
  {
    path: '/',
    element: <Main />,
    children: [
      {
        index: true,
        element: <LandingPage />,
      },
      {
        path: 'login',
        element: <LoginPage />,
      },
      {
        path: 'register',
        element: <RegisterPage />,
      },
      {
        path: 'dashboard',
        element: (
          <PrivateRoute>
            <DashboardPage />
          </PrivateRoute>
        ),
      },
      {
        path: '*',
        element: <Navigate to="/" replace />,
      },
    ],
  },
])

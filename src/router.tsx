import { Navigate, createBrowserRouter } from 'react-router-dom'
import type { ReactElement } from 'react'
import Main from './MainLayout'
import DashboardPage from './pages/DashboardPage'
import InterviewSessionPage from './pages/InterviewSessionPage'
import LandingPage from './pages/LandingPage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import SettingsPage from './pages/SettingsPage'
import StudyPage from './pages/StudyPage'
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
        path: 'dashboard/session/:sessionId',
        element: (
          <PrivateRoute>
            <InterviewSessionPage />
          </PrivateRoute>
        ),
      },
      {
        path: 'settings',
        element: (
          <PrivateRoute>
            <SettingsPage />
          </PrivateRoute>
        ),
      },
      {
        path: 'study',
        element: (
          <PrivateRoute>
            <StudyPage />
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

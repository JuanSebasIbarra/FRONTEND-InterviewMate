import { Navigate, createBrowserRouter } from 'react-router-dom'
import Main from './MainLayout'
import DashboardPage from './pages/DashboardPage'
import SessionPage from './pages/SessionPage'
import TemplateCreationPage from './pages/TemplateCreationPage'
import LandingPage from './pages/LandingPage'
import LoginPage from './pages/LoginPage'
import OAuthCallbackPage from './pages/OAuthCallbackPage'
import RegisterPage from './pages/RegisterPage'
import SettingsPage from './pages/SettingsPage'
import PrivateRoute from './components/PrivateRoute'
import PublicRoute from './components/PublicRoute'

export const appRouter = createBrowserRouter([
  {
    path: '/',
    element: <Main />,
    children: [
      {
        index: true,
        element: (
          <PublicRoute>
            <LandingPage />
          </PublicRoute>
        ),
      },
      {
        path: 'login',
        element: (
          <PublicRoute>
            <LoginPage />
          </PublicRoute>
        ),
      },
      {
        path: 'register',
        element: (
          <PublicRoute>
            <RegisterPage />
          </PublicRoute>
        ),
      },
      {
        /**
         * Canonical OAuth2 callback route.
         * The backend must redirect here after a successful Google sign-in:
         *   <FRONTEND_URL>/auth/callback?token=<JWT>&expiresAt=<ISO>
         *
         * No PrivateRoute guard — this IS the page that establishes auth.
         */
        path: 'auth/callback',
        element: <OAuthCallbackPage />,
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
        path: 'sessions',
        element: (
          <PrivateRoute>
            <SessionPage />
          </PrivateRoute>
        ),
      },
      {
        path: 'sessions/:templateId',
        element: (
          <PrivateRoute>
            <SessionPage />
          </PrivateRoute>
        ),
      },
      {
        path: 'templates/new',
        element: (
          <PrivateRoute>
            <TemplateCreationPage />
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
        path: '*',
        element: <Navigate to="/" replace />,
      },
    ],
  },
])

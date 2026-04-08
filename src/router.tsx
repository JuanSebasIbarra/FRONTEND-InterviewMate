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
            <DashboardPage />
        ),
      },
      {
        path: 'Template',
        element: (
            <TemplateCreationPage />
        ),
      },
      {
        path: 'session',
        element: (
            <SessionPage />
        ),
      },
      {
        path: 'settings',
        element: (
            <SettingsPage />
        ),
      },
      {
        path: '*',
        element: <Navigate to="/" replace />,
      },
    ],
  },
])

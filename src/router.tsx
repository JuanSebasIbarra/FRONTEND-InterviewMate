import { Navigate, createBrowserRouter } from 'react-router-dom'
import PrivateRoute from './components/PrivateRoute'
import Main from './MainLayout'
import DashboardPage from './pages/DashboardPage'
import InterviewSessionPage from './pages/InterviewSessionPage'
import InterviewLivePage from './pages/InterviewLivePage'
import LandingPage from './pages/LandingPage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import SettingsPage from './pages/SettingsPage'
import StudyVoicePage from './pages/StudyVoicePage'

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
        path: 'interview/live/:sessionId',
        element: (
          <PrivateRoute>
            <InterviewLivePage />
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
        element: <Navigate to="/study/live" replace />,
      },
      {
        path: 'study/live',
        element: (
          <PrivateRoute>
            <StudyVoicePage />
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

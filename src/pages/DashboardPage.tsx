import { useNavigate } from 'react-router-dom'
import DashboardHeader from '../components/dashboard/DashboardHeader'
import DashboardSidebar from '../components/dashboard/DashboardSidebar'
import TemplateCardsSection from '../components/dashboard/TemplateCardsSection'

const TEMPLATE_NAMES = [
  'Ingeniero de software en Google',
  'Frontend Developer React',
  'Backend Engineer Node.js',
]

function DashboardPage() {
  const navigate = useNavigate()

  const handleProfile = () => {
    navigate('/dashboard')
  }

  const handleSettings = () => {
    navigate('/settings')
  }

  const handleLogout = () => {
    navigate('/login')
  }

  const handleAdd = () => {
    navigate('/')
  }

  const handleHistory = () => {
    navigate('/')
  }

  return (
    <div className="min-h-screen bg-stone-100 px-3 py-3 sm:px-6 sm:py-6">
      <main className="mx-auto grid min-h-[calc(100vh-1.5rem)] max-w-7xl grid-cols-1 gap-4 rounded-3xl border border-zinc-300 bg-white p-4 sm:min-h-[calc(100vh-3rem)] sm:p-6 lg:grid-cols-[280px_minmax(0,1fr)] lg:gap-6 lg:p-8">
        <DashboardSidebar
          onProfile={handleProfile}
          onSettings={handleSettings}
          onLogout={handleLogout}
        />

        <section className="space-y-4 rounded-3xl border border-zinc-300 bg-stone-50 p-5 sm:p-7">
          <DashboardHeader />
          <TemplateCardsSection
            templates={TEMPLATE_NAMES}
            onAdd={handleAdd}
            onHistory={handleHistory}
          />
        </section>
      </main>
    </div>
  )
}

export default DashboardPage
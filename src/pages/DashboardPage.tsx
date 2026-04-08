import { useNavigate } from 'react-router-dom'
import DashboardSidebar from '../components/dashboard/DashboardSidebar'
import TemplateCard from '../components/dashboard/TemplateCard'

const TEMPLATE_NAMES = [
  'Ingeniero de software en Google',
  'Frontend Developer React',
  'Backend Engineer Node.js',
]

function DashboardPage() {
  const navigate = useNavigate()

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
    <div className="h-screen w-screen bg-stone-100 flex">
      <DashboardSidebar onLogout={handleLogout} />

      <main className="w-full h-full sm:h-full sm:lg:grid-cols-[280px_minmax(0,1fr)] lg:gap-6">
        <section className="border-zinc-300 bg-stone-50 p-5 sm:p-7 h-full">
          <header className="mb-7 border-b border-zinc-200 pb-5">
            <p className="text-xs uppercase tracking-widest text-zinc-500">Panel principal</p>
            <h1 className="mt-2 font-serif text-4xl font-normal tracking-[-0.02em] text-zinc-900 sm:text-5xl">
              Dashboard
            </h1>
          </header>

          <article>
            <div className="mb-4 flex items-center justify-between gap-3">
              <h2 className="font-serif text-[2rem] font-normal tracking-[-0.02em] text-zinc-900">
                Plantillas
              </h2>
            </div>

            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {TEMPLATE_NAMES.map((template) => (
                <TemplateCard
                  key={template}
                  name={template}
                  onAdd={handleAdd}
                  onHistory={handleHistory}
                />
              ))}
            </div>
          </article>
        </section>
      </main>
    </div>
  )
}

export default DashboardPage
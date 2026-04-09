import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import DashboardSidebar from '../components/dashboard/DashboardSidebar'
import TemplateCard from '../components/dashboard/TemplateCard'
import { clearAuthToken } from '../lib/auth'
import type { InterviewTemplate } from '../models/interview'
import { getMyTemplates } from '../services/templateService'

function DashboardPage() {
  const navigate = useNavigate()
  const [templates, setTemplates] = useState<InterviewTemplate[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    let isMounted = true

    const loadTemplates = async () => {
      setIsLoading(true)
      setErrorMessage('')

      try {
        const payload = await getMyTemplates()
        if (!isMounted) return
        setTemplates(payload ?? [])
      } catch (error) {
        if (!isMounted) return
        const message = error instanceof Error ? error.message : 'No se pudieron cargar las plantillas.'
        setErrorMessage(message)
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    void loadTemplates()

    return () => {
      isMounted = false
    }
  }, [])

  const handleLogout = () => {
    clearAuthToken()
    navigate('/login')
  }

  const handleAdd = () => {
    navigate('/templates/new')
  }

  const handleOpenTemplate = (templateId: string) => {
    navigate(`/sessions/${templateId}`)
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
              {isLoading && (
                <p className="text-sm text-zinc-600">Cargando plantillas...</p>
              )}

              {!isLoading && errorMessage && (
                <p className="text-sm text-red-700">{errorMessage}</p>
              )}

              {!isLoading && !errorMessage && templates.length === 0 && (
                <p className="text-sm text-zinc-600">Aun no tienes plantillas creadas.</p>
              )}

              {!isLoading && !errorMessage && templates.map((template) => (
                <TemplateCard
                  key={template.id}
                  name={`${template.position} - ${template.enterprise}`}
                  onAdd={handleAdd}
                  onHistory={() => handleOpenTemplate(template.id)}
                  onOpen={() => handleOpenTemplate(template.id)}
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
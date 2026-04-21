import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import DeleteTemplateModal from '../components/DeleteTemplateModal'
import DashboardSidebar from '../components/dashboard/DashboardSidebar'
import SessionModeModal from '../components/dashboard/SessionModeModal'
import TemplateCard from '../components/dashboard/TemplateCard'
import { clearAuthToken } from '../lib/auth'
import { formatTemplateLastActivity, sortTemplatesByRecentActivity } from '../lib/templateActivity'
import type { InterviewTemplate } from '../models/interview'
import { deleteTemplate, getMyTemplates } from '../services/templateService'

function DashboardPage() {
  const navigate = useNavigate()
  const [templates, setTemplates] = useState<InterviewTemplate[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState('')
  const [selectedTemplate, setSelectedTemplate] = useState<InterviewTemplate | null>(null)
  const [isSessionModeModalOpen, setIsSessionModeModalOpen] = useState(false)
  const [templatePendingDeletion, setTemplatePendingDeletion] = useState<InterviewTemplate | null>(null)
  const [isDeletingTemplate, setIsDeletingTemplate] = useState(false)

  const sortedTemplates = useMemo(() => sortTemplatesByRecentActivity(templates), [templates])
  const recentTemplates = useMemo(() => sortedTemplates.slice(0, 3), [sortedTemplates])
  const hasTemplateHistory = sortedTemplates.length > 3

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

  const handleOpenSessionModeModal = (template: InterviewTemplate) => {
    setSelectedTemplate(template)
    setIsSessionModeModalOpen(true)
  }

  const handleCloseSessionModeModal = () => {
    setIsSessionModeModalOpen(false)
    setSelectedTemplate(null)
  }

  const handleStartStudy = () => {
    if (!selectedTemplate) return
    navigate(`/sessions/${selectedTemplate.id}?mode=study`, { replace: true })
    handleCloseSessionModeModal()
  }

  const handleStartInterview = () => {
    if (!selectedTemplate) return
    navigate(`/sessions/${selectedTemplate.id}`, { replace: true })
    handleCloseSessionModeModal()
  }

  const handleOpenTemplate = (templateId: string) => {
    navigate(`/sessions/${templateId}`)
  }

  const handleOpenHistory = () => {
    navigate('/history')
  }

  const handleRequestDeleteTemplate = (template: InterviewTemplate) => {
    setTemplatePendingDeletion(template)
  }

  const handleCancelDeleteTemplate = () => {
    if (isDeletingTemplate) return
    setTemplatePendingDeletion(null)
  }

  const handleConfirmDeleteTemplate = async () => {
    if (!templatePendingDeletion) return

    setIsDeletingTemplate(true)
    setErrorMessage('')

    try {
      await deleteTemplate(templatePendingDeletion.id)
      setTemplates((currentTemplates) => currentTemplates.filter((template) => template.id !== templatePendingDeletion.id))
      setTemplatePendingDeletion(null)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'No se pudo eliminar la plantilla.'
      setErrorMessage(message)
    } finally {
      setIsDeletingTemplate(false)
    }
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
              <div>
                <h2 className="font-serif text-[2rem] font-normal tracking-[-0.02em] text-zinc-900">
                  Plantillas recientes
                </h2>
                <p className="mt-1 text-sm text-zinc-500">
                  Mostrando las tres plantillas con actividad mas reciente.
                </p>
              </div>
              <button
                type="button"
                onClick={handleAdd}
                className="rounded-full bg-zinc-900 px-6 py-2.5 text-sm font-medium text-white transition hover:opacity-80"
              >
                Nueva plantilla
              </button>
            </div>

            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {isLoading && (
                <p className="text-sm text-zinc-600">Cargando plantillas...</p>
              )}

              {!isLoading && errorMessage && (
                <p className="text-sm text-red-700">{errorMessage}</p>
              )}

              {!isLoading && !errorMessage && recentTemplates.length === 0 && (
                <p className="text-sm text-zinc-600">Aun no tienes plantillas creadas.</p>
              )}

              {!isLoading && !errorMessage && recentTemplates.map((template) => (
                <TemplateCard
                  key={template.id}
                  name={`${template.position} - ${template.enterprise}`}
                  subtitle={`Ultima actividad: ${formatTemplateLastActivity(template)}`}
                  onAdd={() => handleOpenSessionModeModal(template)}
                  onHistory={() => handleOpenTemplate(template.id)}
                  onOpen={() => handleOpenTemplate(template.id)}
                  secondaryActionLabel="Abrir"
                  onDelete={() => handleRequestDeleteTemplate(template)}
                />
              ))}
            </div>

            {!isLoading && !errorMessage && hasTemplateHistory && (
              <div className="mt-6 rounded-2xl border border-zinc-300 bg-white px-5 py-4 shadow-sm">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-widest text-zinc-400">History</p>
                    <p className="mt-1 text-sm text-zinc-600">
                      Tienes {sortedTemplates.length - recentTemplates.length} plantilla{sortedTemplates.length - recentTemplates.length === 1 ? '' : 's'} adicional{sortedTemplates.length - recentTemplates.length === 1 ? '' : 'es'} en tu historial.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleOpenHistory}
                    className="w-full rounded-full border border-zinc-300 bg-white px-5 py-2.5 text-sm font-medium text-zinc-800 transition hover:bg-zinc-100 md:w-auto"
                  >
                    Ver historial
                  </button>
                </div>
              </div>
            )}
          </article>
        </section>
      </main>

      <SessionModeModal
        isOpen={isSessionModeModalOpen}
        templateName={selectedTemplate ? `${selectedTemplate.position} - ${selectedTemplate.enterprise}` : 'Template'}
        onClose={handleCloseSessionModeModal}
        onStudy={handleStartStudy}
        onInterview={handleStartInterview}
      />

      <DeleteTemplateModal
        isOpen={Boolean(templatePendingDeletion)}
        templateName={templatePendingDeletion ? `${templatePendingDeletion.position} - ${templatePendingDeletion.enterprise}` : 'Plantilla'}
        isDeleting={isDeletingTemplate}
        onCancel={handleCancelDeleteTemplate}
        onConfirm={() => void handleConfirmDeleteTemplate()}
      />
    </div>
  )
}

export default DashboardPage
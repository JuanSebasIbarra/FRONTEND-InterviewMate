import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import DeleteTemplateModal from '../components/DeleteTemplateModal'
import DashboardSidebar from '../components/dashboard/DashboardSidebar'
import SessionModeModal from '../components/dashboard/SessionModeModal'
import StatisticsSection from '../components/dashboard/StatisticsSection'
import TemplateCard from '../components/dashboard/TemplateCard'
import { logoutUser } from '../controllers/authController'
import { useTranslation } from '../contexts/LanguageContext'
import {
  buildDashboardStatsLinkedList,
  getDashboardSignInCount,
  incrementDashboardSignInCount,
} from '../lib/dashboardStats'
import { getStudyModulesHistory } from '../lib/studyModulesHistory'
import { formatTemplateLastActivity, sortTemplatesByRecentActivity } from '../lib/templateActivity'
import type { DashboardStatsResponse } from '../models/api'
import type { InterviewSession, InterviewTemplate } from '../models/interview'
import { getDashboardStats } from '../services/dashboardService'
import { getMySessions } from '../services/sessionService'
import { deleteTemplate, getMyTemplates } from '../services/templateService'
import { APP_VERSION } from '../config/version'

function ensureArray<T>(value: unknown): T[] {
  return Array.isArray(value) ? value : []
}

function DashboardPage() {
  const navigate = useNavigate()
  const t = useTranslation()
  const [templates, setTemplates] = useState<InterviewTemplate[]>([])
  const [sessions, setSessions] = useState<InterviewSession[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState('')
  const [selectedTemplate, setSelectedTemplate] = useState<InterviewTemplate | null>(null)
  const [isSessionModeModalOpen, setIsSessionModeModalOpen] = useState(false)
  const [templatePendingDeletion, setTemplatePendingDeletion] = useState<InterviewTemplate | null>(null)
  const [isDeletingTemplate, setIsDeletingTemplate] = useState(false)
  const [dashboardSignInCount, setDashboardSignInCount] = useState(() => getDashboardSignInCount())
  const [stats, setStats] = useState<DashboardStatsResponse | null>(null)

  const sortedTemplates = useMemo(() => sortTemplatesByRecentActivity(templates), [templates])
  const recentTemplates = useMemo(() => sortedTemplates.slice(0, 3), [sortedTemplates])
  const hasTemplateHistory = sortedTemplates.length > 3
  const studyModulesHistory = useMemo(() => getStudyModulesHistory(), [])

  const dashboardStatsLinkedList = useMemo(() => {
    const completedStudySessions = stats?.totalStudySessions
      ?? studyModulesHistory.filter((item) => item.completed).length
    const interviewsDone = stats?.totalInterviewSessionsCompleted
      ?? sessions.filter((session) => session.status === 'COMPLETED').length
    const signInAndPractice = dashboardSignInCount

    return buildDashboardStatsLinkedList({
      studyCompleted: completedStudySessions,
      interviewsDone,
      signInAndPractice,
      labels: {
        studySessionsCompleted: t.dashboard.studySessionsCompleted,
        interviewsDone: t.dashboard.interviewsDone,
        signInAndPracticeLabel: t.dashboard.signInAndPracticeLabel,
      },
    })
  }, [dashboardSignInCount, sessions, studyModulesHistory, stats, t])

  useEffect(() => {
    setDashboardSignInCount(incrementDashboardSignInCount())

    let isMounted = true

    const loadTemplates = async () => {
      setIsLoading(true)
      setErrorMessage('')

      try {
        const [templatesPayload, sessionsPayload, statsPayload] = await Promise.all([
          getMyTemplates(),
          getMySessions(),
          getDashboardStats(),
        ])
        if (!isMounted) return
        setTemplates(ensureArray<InterviewTemplate>(templatesPayload))
        setSessions(ensureArray<InterviewSession>(sessionsPayload))
        setStats(statsPayload)
      } catch (error) {
        if (!isMounted) return
        const message = error instanceof Error ? error.message : t.errors.loadingTemplates
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

  const handleLogout = async () => {
    await logoutUser()
    navigate('/login', { replace: true })
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
      const message = error instanceof Error ? error.message : t.errors.deletingTemplate
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
            <p className="text-xs uppercase tracking-widest text-zinc-500">{t.dashboard.title}</p>
            <div className="flex items-baseline gap-3">
              <h1 className="mt-2 font-serif text-4xl font-normal tracking-[-0.02em] text-zinc-900 sm:text-5xl">
                {t.nav.dashboard}
              </h1>
              <span className="text-sm font-medium text-zinc-400">V {APP_VERSION}</span>
            </div>
          </header>

          <article>
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <h2 className="font-serif text-[2rem] font-normal tracking-[-0.02em] text-zinc-900">
                  {t.dashboard.recentTemplates}
                </h2>
                <p className="mt-1 text-sm text-zinc-500">
                  {t.dashboard.recentTemplatesSubtitle}
                </p>
              </div>
              <button
                type="button"
                onClick={handleAdd}
                className="rounded-full bg-zinc-900 px-6 py-2.5 text-sm font-medium text-white transition hover:opacity-80"
              >
                {t.dashboard.newTemplateButton}
              </button>
            </div>

            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {isLoading && (
                <p className="text-sm text-zinc-600">{t.dashboard.loadingTemplates}</p>
              )}

              {!isLoading && errorMessage && (
                <p className="text-sm text-red-700">{errorMessage}</p>
              )}

              {!isLoading && !errorMessage && recentTemplates.length === 0 && (
                <p className="text-sm text-zinc-600">{t.dashboard.noTemplatesCreated}</p>
              )}

              {!isLoading && !errorMessage && recentTemplates.map((template) => (
                <TemplateCard
                  key={template.id}
                  name={`${template.position} - ${template.enterprise}`}
                  subtitle={`${t.dashboard.lastActivity}: ${formatTemplateLastActivity(template)}`}
                  onAdd={() => handleOpenSessionModeModal(template)}
                  onHistory={() => handleOpenTemplate(template.id)}
                  onOpen={() => handleOpenTemplate(template.id)}
                  secondaryActionLabel={t.dashboard.open}
                  onDelete={() => handleRequestDeleteTemplate(template)}
                  newLabel={t.dashboard.new}
                />
              ))}
            </div>

            {!isLoading && !errorMessage && hasTemplateHistory && (
              <div className="mt-6 rounded-2xl border border-zinc-300 bg-white px-5 py-4 shadow-sm">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-widest text-zinc-400">{t.dashboard.historyUppercase}</p>
                    <p className="mt-1 text-sm text-zinc-600">
                      Tienes {sortedTemplates.length - recentTemplates.length} {sortedTemplates.length - recentTemplates.length === 1 ? t.dashboard.additionalTemplatesSingular : t.dashboard.additionalTemplatesPlural} en tu historial.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleOpenHistory}
                    className="w-full rounded-full border border-zinc-300 bg-white px-5 py-2.5 text-sm font-medium text-zinc-800 transition hover:bg-zinc-100 md:w-auto"
                  >
                    {t.dashboard.viewHistory}
                  </button>
                </div>
              </div>
            )}

            <StatisticsSection statsLinkedList={dashboardStatsLinkedList} />
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
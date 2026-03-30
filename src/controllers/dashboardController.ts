import type {
  CreateInterviewTemplateRequest,
  InterviewResult,
  InterviewSession,
  InterviewTemplate,
} from '../models/interview'
import type { ProfileResponse, User } from '../models/auth'
import { getMe } from '../services/authService'
import { getProfile } from '../services/profileService'
import { getMyResults } from '../services/resultService'
import { beginSession, createSession } from '../services/sessionService'
import { createTemplate, getMyTemplates } from '../services/templateService'

export type DashboardData = {
  user: User | null
  profile: ProfileResponse | null
  templates: InterviewTemplate[]
  results: InterviewResult[]
  latestResult: InterviewResult | null
}

function orderResultsByDate(results: InterviewResult[]) {
  return [...results].sort(
    (a, b) => new Date(b.generatedAt).getTime() - new Date(a.generatedAt).getTime(),
  )
}

export async function loadDashboardData(): Promise<DashboardData> {
  const [userRes, profileRes, templatesRes, resultsRes] = await Promise.allSettled([
    getMe(),
    getProfile(),
    getMyTemplates(),
    getMyResults(),
  ])

  const user = userRes.status === 'fulfilled' ? userRes.value : null
  const profile = profileRes.status === 'fulfilled' ? profileRes.value : null
  const templates = templatesRes.status === 'fulfilled' ? templatesRes.value : []
  const results = resultsRes.status === 'fulfilled' ? orderResultsByDate(resultsRes.value) : []

  return {
    user,
    profile,
    templates,
    results,
    latestResult: results[0] ?? null,
  }
}

export async function startNewInterview(
  templatePayload: CreateInterviewTemplateRequest,
): Promise<InterviewSession> {
  const template = await createTemplate(templatePayload)
  const createdSession = await createSession({ templateId: template.id })
  return beginSession(createdSession.id)
}

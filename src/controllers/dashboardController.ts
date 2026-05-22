import type {
  CreateInterviewTemplateRequest,
  InterviewResult,
  InterviewSession,
  InterviewTemplate,
} from '../models/interview'
import type { DashboardStatsResponse } from '../models/api'
import type { ProfileResponse, User } from '../models/auth'
import { getMe } from '../services/authService'
import { getDashboardStats } from '../services/dashboardService'
import { getProfile } from '../services/profileService'
import { getMyResults } from '../services/resultService'
import { beginSession, createSession, getMySessions } from '../services/sessionService'
import { createTemplate, getMyTemplates } from '../services/templateService'

export type DashboardData = {
  user: User | null
  profile: ProfileResponse | null
  templates: InterviewTemplate[]
  results: InterviewResult[]
  sessions: InterviewSession[]
  latestResult: InterviewResult | null
  stats: DashboardStatsResponse | null
}

function ensureArray<T>(value: unknown): T[] {
  return Array.isArray(value) ? value : []
}

function orderResultsByDate(results: InterviewResult[]) {
  return [...results].sort(
    (a, b) => new Date(b.generatedAt).getTime() - new Date(a.generatedAt).getTime(),
  )
}

export async function loadDashboardData(): Promise<DashboardData> {
  const [userRes, profileRes, templatesRes, resultsRes, sessionsRes, statsRes] = await Promise.allSettled([
    getMe(),
    getProfile(),
    getMyTemplates(),
    getMyResults(),
    getMySessions(),
    getDashboardStats(),
  ])

  const user = userRes.status === 'fulfilled' ? userRes.value : null
  const profile = profileRes.status === 'fulfilled' ? profileRes.value : null
  const templates = templatesRes.status === 'fulfilled' ? ensureArray<InterviewTemplate>(templatesRes.value) : []
  const results = resultsRes.status === 'fulfilled'
    ? orderResultsByDate(ensureArray<InterviewResult>(resultsRes.value))
    : []
  const sessions = sessionsRes.status === 'fulfilled'
    ? [...ensureArray<InterviewSession>(sessionsRes.value)].sort(
        (a, b) => new Date(b.startedAt ?? b.completedAt ?? 0).getTime()
                - new Date(a.startedAt ?? a.completedAt ?? 0).getTime(),
      )
    : []
  const stats = statsRes.status === 'fulfilled' ? statsRes.value : null

  return {
    user,
    profile,
    templates,
    results,
    sessions,
    latestResult: results[0] ?? null,
    stats,
  }
}

export async function startNewInterview(
  templatePayload: CreateInterviewTemplateRequest,
): Promise<InterviewSession> {
  const template = await createTemplate(templatePayload)
  const createdSession = await createSession({ templateId: template.id })
  return beginSession(createdSession.id)
}

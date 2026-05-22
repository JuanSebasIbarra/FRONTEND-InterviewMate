import { extractPageData } from '../lib/pagination'
import type { PageData, PageResponse } from '../models/api'
import type { CreateSessionRequest, InterviewSession } from '../models/interview'
import { httpRequest } from './httpClient'

export function createSession(request: CreateSessionRequest) {
  return httpRequest<InterviewSession>('/sessions', {
    method: 'POST',
    body: JSON.stringify(request),
  })
}

export function beginSession(sessionId: string) {
  return httpRequest<InterviewSession>(`/sessions/${sessionId}/begin`, {
    method: 'PATCH',
  })
}

export function completeSession(sessionId: string) {
  return httpRequest<InterviewSession>(`/sessions/${sessionId}/complete`, {
    method: 'PATCH',
  })
}

export function abandonSession(sessionId: string) {
  return httpRequest<InterviewSession>(`/sessions/${sessionId}/abandon`, {
    method: 'PATCH',
  })
}

export function getSessionById(sessionId: string) {
  return httpRequest<InterviewSession>(`/sessions/${sessionId}`)
}

export function getSessionsByTemplate(templateId: string) {
  return httpRequest<InterviewSession[]>(`/sessions/template/${templateId}`)
}

export function getMySessions() {
  return getMySessionsPage().then((response) => response.data)
}

export async function getMySessionsPage(page = 0, size = 20): Promise<PageData<InterviewSession>> {
  const response = await httpRequest<PageResponse<InterviewSession> | InterviewSession[]>(
    `/sessions/me?page=${page}&size=${size}`,
  )
  return extractPageData<InterviewSession>(response)
}

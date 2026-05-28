import { extractPageData } from '../lib/pagination'
import type { PageData, PageResponse } from '../models/api'
import type { CreateSessionRequest, InterviewSession } from '../models/interview'
import { httpRequest } from './httpClient'

export function createSession(request: CreateSessionRequest) {
  return httpRequest<InterviewSession>('/api/v1/sessions', {
    method: 'POST',
    body: JSON.stringify(request),
  })
}

export function beginSession(sessionId: string) {
  return httpRequest<InterviewSession>(`/api/v1/sessions/${sessionId}/begin`, {
    method: 'PATCH',
  })
}

export function completeSession(sessionId: string) {
  return httpRequest<InterviewSession>(`/api/v1/sessions/${sessionId}/complete`, {
    method: 'PATCH',
  })
}

export function abandonSession(sessionId: string) {
  return httpRequest<InterviewSession>(`/api/v1/sessions/${sessionId}/abandon`, {
    method: 'PATCH',
  })
}

export function getSessionById(sessionId: string) {
  return httpRequest<InterviewSession>(`/api/v1/sessions/${sessionId}`)
}

export function getSessionsByTemplate(templateId: string) {
  return httpRequest<InterviewSession[]>(`/api/v1/sessions/template/${templateId}`)
}

export function getMySessions() {
  return getMySessionsPage().then((response) => response.data)
}

export async function getMySessionsPage(page = 0, size = 20): Promise<PageData<InterviewSession>> {
  const response = await httpRequest<PageResponse<InterviewSession> | InterviewSession[]>(
    `/api/v1/sessions/me?page=${page}&size=${size}`,
  )
  return extractPageData<InterviewSession>(response)
}

export function deleteSession(sessionId: string) {
  return httpRequest<void>(`/api/v1/sessions/${sessionId}`, {
    method: 'DELETE',
  })
}

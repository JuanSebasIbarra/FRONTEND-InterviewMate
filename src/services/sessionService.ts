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

export function getSessionById(sessionId: string) {
  return httpRequest<InterviewSession>(`/api/v1/sessions/${sessionId}`)
}

export function getSessionsByTemplate(templateId: string) {
  return httpRequest<InterviewSession[]>(`/api/v1/sessions/template/${templateId}`)
}

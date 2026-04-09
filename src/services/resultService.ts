import type { InterviewResult } from '../models/interview'
import { httpRequest } from './httpClient'

export function getMyResults() {
  return httpRequest<InterviewResult[]>('/api/v1/results/me')
}

export function getResultBySession(sessionId: string) {
  return httpRequest<InterviewResult>(`/api/v1/results/session/${sessionId}`)
}

export function generateSessionReview(sessionId: string) {
  return httpRequest<InterviewResult>(`/api/v1/interview/sessions/${sessionId}/review`, {
    method: 'POST',
  })
}

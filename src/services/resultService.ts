import type { PageResponse } from '../models/api'
import { extractPageData } from '../lib/pagination'
import type { InterviewResult } from '../models/interview'
import { httpRequest } from './httpClient'

export async function getMyResultsPage(page = 0, size = 20) {
  const response = await httpRequest<PageResponse<InterviewResult>>(
    `/results/me?page=${page}&size=${size}`,
  )
  return extractPageData<InterviewResult>(response)
}

export function getMyResults() {
  return getMyResultsPage(0, 20).then((page) => page.data)
}

export function getResultBySession(sessionId: string) {
  return httpRequest<InterviewResult>(`/results/session/${sessionId}`)
}

export function generateSessionReview(sessionId: string) {
  return httpRequest<InterviewResult>(`/interview/sessions/${sessionId}/review`, {
    method: 'POST',
  })
}

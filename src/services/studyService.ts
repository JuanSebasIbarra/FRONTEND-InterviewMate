import type {
  GenerateStudyQuestionsRequest,
  StartStudyRequest,
  StudySession,
  StudySessionSummary,
} from '../models/study'
import { httpRequest } from './httpClient'

export function startStudy(request: StartStudyRequest) {
  return httpRequest<StudySession>('/study/start', {
    method: 'POST',
    body: JSON.stringify(request),
  })
}

export function generateStudyQuestions(request: GenerateStudyQuestionsRequest) {
  return httpRequest<StudySession>('/study/generate-questions', {
    method: 'POST',
    body: JSON.stringify(request),
  })
}

export function getStudyById(studyId: string) {
  return httpRequest<StudySession>(`/study/${studyId}`)
}

export function getMyStudySessions() {
  return httpRequest<StudySessionSummary[]>('/study/me')
}

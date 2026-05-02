import type {
  GenerateStudyQuestionsRequest,
  StartStudyRequest,
  StudySession,
  StudySessionSummary,
} from '../models/study'
import { buildApiV1Path } from '../lib/api'
import { httpRequest } from './httpClient'

const STUDY_BASE_PATH = buildApiV1Path('/study')

export function startStudy(request: StartStudyRequest) {
  return httpRequest<StudySession>(`${STUDY_BASE_PATH}/start`, {
    method: 'POST',
    body: JSON.stringify(request),
  })
}

export function generateStudyQuestions(request: GenerateStudyQuestionsRequest) {
  return httpRequest<StudySession>(`${STUDY_BASE_PATH}/generate-questions`, {
    method: 'POST',
    body: JSON.stringify(request),
  })
}

export function getStudyById(studyId: string) {
  return httpRequest<StudySession>(`${STUDY_BASE_PATH}/${studyId}`)
}

export function getMyStudySessions() {
  return httpRequest<StudySessionSummary[]>('/study/me')
}

import type {
  StartStudyRequest,
  StudySession,
  StudySessionSummary,
} from '../models/study'
import { httpRequest } from './httpClient'

const STUDY_BASE_PATH = '/study'

export function startStudy(request: StartStudyRequest) {
  return httpRequest<StudySession>(`${STUDY_BASE_PATH}/start`, {
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

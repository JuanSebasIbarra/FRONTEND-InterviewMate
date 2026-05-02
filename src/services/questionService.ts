import type { InterviewQuestion, SubmitAnswerRequest } from '../models/interview'
import { httpRequest, httpRequestBlob } from './httpClient'

export function getQuestionsBySession(sessionId: string) {
  return httpRequest<InterviewQuestion[]>(`/api/v1/questions/session/${sessionId}`)
}

export function submitAnswer(questionId: string, request: SubmitAnswerRequest) {
  return httpRequest<InterviewQuestion>(`/api/v1/questions/${questionId}/answer`, {
    method: 'PATCH',
    body: JSON.stringify(request),
  })
}

export function getQuestionTTS(questionId: string): Promise<Blob> {
  return httpRequestBlob(`/api/v1/questions/${questionId}/tts`, {
    method: 'GET',
  })
}

import type { InterviewSession, InterviewType } from '../models/interview'
import type { StartStudyRequest, StudySession } from '../models/study'
import { beginSession, createSession } from '../services/sessionService'
import { generateStudyQuestions, getStudyById, startStudy } from '../services/studyService'
import { createTemplate } from '../services/templateService'

function normalizeOptionalText(value: string) {
  const trimmed = value.trim()
  return trimmed ? trimmed : undefined
}

export async function startStudySession(payload: {
  topic: string
  audioFile: string
}): Promise<StudySession> {
  const request: StartStudyRequest = {
    topic: normalizeOptionalText(payload.topic),
    audioFile: normalizeOptionalText(payload.audioFile),
  }

  if (!request.topic && !request.audioFile) {
    throw new Error('Debes ingresar un tema o una referencia de audio para iniciar estudio.')
  }

  return startStudy(request)
}

export function regenerateStudySessionQuestions(studySessionId: string): Promise<StudySession> {
  return generateStudyQuestions({ studySessionId })
}

export function loadStudySession(studySessionId: string): Promise<StudySession> {
  return getStudyById(studySessionId)
}

export async function startInterviewFromStudy(payload: {
  topic: string
  interviewType: InterviewType
}): Promise<InterviewSession> {
  const topic = payload.topic.trim()
  if (!topic) {
    throw new Error('No se pudo iniciar entrevista: la sesión de estudio no tiene tema.')
  }

  const template = await createTemplate({
    enterprise: 'InterviewMate AI',
    type: payload.interviewType,
    position: topic,
    description: `Entrevista generada desde modo estudio. Tema base: ${topic}`,
  })

  const session = await createSession({ templateId: template.id })
  return beginSession(session.id)
}

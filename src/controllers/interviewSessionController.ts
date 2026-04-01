import type { InterviewQuestion, InterviewResult, InterviewSession } from '../models/interview'
import { getQuestionsBySession, submitAnswer } from '../services/questionService'
import { getResultBySession } from '../services/resultService'
import { completeSession, getSessionById } from '../services/sessionService'

export type InterviewSessionData = {
  session: InterviewSession
  questions: InterviewQuestion[]
  result: InterviewResult | null
}

export async function loadInterviewSessionData(sessionId: string): Promise<InterviewSessionData> {
  const [session, questions] = await Promise.all([
    getSessionById(sessionId),
    getQuestionsBySession(sessionId),
  ])

  let result: InterviewResult | null = null
  try {
    result = await getResultBySession(sessionId)
  } catch {
    result = null
  }

  return {
    session,
    questions,
    result,
  }
}

export async function submitQuestionAnswer(questionId: string, answer: string) {
  await submitAnswer(questionId, { answer })
}

export async function finishInterviewSession(sessionId: string) {
  return completeSession(sessionId)
}

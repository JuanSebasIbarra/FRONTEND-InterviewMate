export type StoredStudyAnswer = {
  questionId: string
  answer: string
}

export type StoredStudySessionAnswers = {
  sessionId: string
  templateId: string
  topic: string
  answers: StoredStudyAnswer[]
  savedAt: string
}

const STORAGE_PREFIX = 'im.studySessionAnswers'

function getStorageKey(sessionId: string) {
  return `${STORAGE_PREFIX}.${sessionId}`
}

export function saveStudySessionAnswers(payload: StoredStudySessionAnswers) {
  if (typeof window === 'undefined') return
  window.sessionStorage.setItem(getStorageKey(payload.sessionId), JSON.stringify(payload))
}

export function getStudySessionAnswers(sessionId: string): StoredStudySessionAnswers | null {
  if (typeof window === 'undefined') return null

  try {
    const raw = window.sessionStorage.getItem(getStorageKey(sessionId))
    if (!raw) return null

    const parsed = JSON.parse(raw) as StoredStudySessionAnswers
    if (!parsed || typeof parsed !== 'object') return null
    if (parsed.sessionId !== sessionId) return null
    return parsed
  } catch {
    return null
  }
}

export function clearStudySessionAnswers(sessionId: string) {
  if (typeof window === 'undefined') return
  window.sessionStorage.removeItem(getStorageKey(sessionId))
}
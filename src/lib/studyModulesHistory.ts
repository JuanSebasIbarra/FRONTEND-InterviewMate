import type { StudySession } from '../models/study'

export const STUDY_MODULES_HISTORY_KEY = 'im.studyModulesHistory'

export type StudyModuleHistoryItem = {
  id: string
  topic: string
  createdAt: string
  questionsCount: number
  savedAt: string
  completed: boolean
}

function normalizeTopic(topic: string | undefined) {
  const value = (topic ?? '').trim()
  return value || 'Módulo sin título'
}

export function getStudyModulesHistory(): StudyModuleHistoryItem[] {
  if (typeof window === 'undefined') return []

  try {
    const raw = window.localStorage.getItem(STUDY_MODULES_HISTORY_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as StudyModuleHistoryItem[]
    if (!Array.isArray(parsed)) return []

    return parsed
      .filter((item) => item && typeof item.id === 'string')
      .slice(0, 20)
  } catch {
    return []
  }
}

export function saveStudyModuleToHistory(session: StudySession) {
  if (typeof window === 'undefined') return

  const existing     = getStudyModulesHistory()
  const existingItem  = existing.find((item) => item.id === session.id)

  const nextItem: StudyModuleHistoryItem = {
    id: session.id,
    topic: normalizeTopic(session.topic),
    createdAt: session.createdAt,
    questionsCount: session.questions.length,
    savedAt: new Date().toISOString(),
    completed: existingItem?.completed ?? false,
  }

  const deduped = existing.filter((item) => item.id !== nextItem.id)
  const next = [nextItem, ...deduped].slice(0, 20)
  window.localStorage.setItem(STUDY_MODULES_HISTORY_KEY, JSON.stringify(next))
}

export function markStudyModuleCompleted(id: string): void {
  if (typeof window === 'undefined') return
  try {
    const existing = getStudyModulesHistory()
    const next = existing.map((item) =>
      item.id === id ? { ...item, completed: true } : item
    )
    window.localStorage.setItem(STUDY_MODULES_HISTORY_KEY, JSON.stringify(next))
  } catch {
    // ignore
  }
}

export function removeStudyModuleFromHistory(id: string): void {
  if (typeof window === 'undefined') return
  try {
    const existing = getStudyModulesHistory()
    const next = existing.filter((item) => item.id !== id)
    window.localStorage.setItem(STUDY_MODULES_HISTORY_KEY, JSON.stringify(next))
  } catch {
    // ignore
  }
}

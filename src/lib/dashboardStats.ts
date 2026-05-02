export type DashboardStatKey = 'studyCompleted' | 'interviewsDone' | 'signInAndPractice'

export type DashboardStatData = {
  key: DashboardStatKey
  label: string
  value: number
  color: string
}

export type LinkedDashboardStatData = DashboardStatData & {
  previousLabel: string | null
  nextLabel: string | null
}

export class DashboardStatNode {
  data: DashboardStatData
  next: DashboardStatNode | null
  previous: DashboardStatNode | null

  constructor(data: DashboardStatData) {
    this.data = data
    this.next = null
    this.previous = null
  }
}

export class DashboardStatsDoublyLinkedList {
  head: DashboardStatNode | null
  tail: DashboardStatNode | null
  length: number

  constructor() {
    this.head = null
    this.tail = null
    this.length = 0
  }

  append(data: DashboardStatData) {
    const node = new DashboardStatNode(data)

    if (!this.head || !this.tail) {
      this.head = node
      this.tail = node
      this.length = 1
      return node
    }

    node.previous = this.tail
    this.tail.next = node
    this.tail = node
    this.length += 1
    return node
  }

  toArray(): DashboardStatData[] {
    const values: DashboardStatData[] = []
    let current = this.head

    while (current) {
      values.push(current.data)
      current = current.next
    }

    return values
  }

  toLinkedArray(): LinkedDashboardStatData[] {
    const values: LinkedDashboardStatData[] = []
    let current = this.head

    while (current) {
      values.push({
        ...current.data,
        previousLabel: current.previous?.data.label ?? null,
        nextLabel: current.next?.data.label ?? null,
      })
      current = current.next
    }

    return values
  }
}

const DASHBOARD_SIGN_IN_DAYS_KEY = 'im.dashboardSignInDays'

function getTodayKey() {
  return new Date().toISOString().slice(0, 10)
}

function getStoredSignInDays() {
  if (typeof window === 'undefined') return [] as string[]

  try {
    const raw = window.localStorage.getItem(DASHBOARD_SIGN_IN_DAYS_KEY)
    if (!raw) return []

    const parsed = JSON.parse(raw) as unknown
    if (!Array.isArray(parsed)) return []

    const normalized = parsed.filter((item): item is string => typeof item === 'string')
    return [...new Set(normalized)].sort()
  } catch {
    return []
  }
}

function saveSignInDays(days: string[]) {
  if (typeof window === 'undefined') return
  const limitedDays = days.slice(-365)
  window.localStorage.setItem(DASHBOARD_SIGN_IN_DAYS_KEY, JSON.stringify(limitedDays))
}

export function getDashboardSignInCount() {
  return getStoredSignInDays().length
}

export function incrementDashboardSignInCount() {
  if (typeof window === 'undefined') return 0

  const todayKey = getTodayKey()
  const existingDays = getStoredSignInDays()

  if (existingDays.includes(todayKey)) {
    return existingDays.length
  }

  const nextDays = [...existingDays, todayKey]
  saveSignInDays(nextDays)
  return nextDays.length
}

type BuildDashboardStatsInput = {
  studyCompleted: number
  interviewsDone: number
  signInAndPractice: number
}

export function buildDashboardStatsLinkedList(input: BuildDashboardStatsInput) {
  const linkedList = new DashboardStatsDoublyLinkedList()

  linkedList.append({
    key: 'studyCompleted',
    label: 'Sesiones de estudio completadas',
    value: Math.max(0, input.studyCompleted),
    color: '#2563eb',
  })

  linkedList.append({
    key: 'interviewsDone',
    label: 'Entrevistas realizadas',
    value: Math.max(0, input.interviewsDone),
    color: '#dc2626',
  })

  linkedList.append({
    key: 'signInAndPractice',
    label: 'Inicios de sesion y practica',
    value: Math.max(0, input.signInAndPractice),
    color: '#eab308',
  })

  return linkedList
}
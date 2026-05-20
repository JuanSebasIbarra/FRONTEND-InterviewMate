export type ApiResponse<T> = {
  success: boolean
  message: string
  data: T
}

export type PageResponse<T> = {
  content: T[]
  totalElements: number
  totalPages: number
  size: number
  number: number
  last?: boolean
  first?: boolean
}

export type PageMeta = {
  totalElements: number
  totalPages: number
  size: number
  page: number
}

export type PageData<T> = {
  data: T[]
  meta: PageMeta
}

export type ApiErrorPayload = {
  message?: string
  error?: string
  fieldErrors?: Record<string, string>
  success?: boolean
}

export type DashboardStatsResponse = {
  totalInterviewSessionsCompleted: number
  avgInterviewScore: number
  totalStudySessions: number
  totalInterviewTemplates: number
  lastInterviewSessionDate: string | null
  lastStudySessionDate: string | null
}

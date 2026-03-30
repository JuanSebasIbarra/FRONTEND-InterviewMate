export type InterviewType = 'TECHNICAL' | 'HR' | 'PSYCHOLOGICAL'
export type InterviewStatus = 'DRAFT' | 'ACTIVE' | 'ARCHIVED'
export type SessionStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED'
export type ResultStatus = 'PASSED' | 'FAILED' | 'PENDING_REVIEW'

export type InterviewTemplate = {
  id: string
  userId: number
  userFullName: string
  enterprise: string
  type: InterviewType
  position: string
  workingArea?: string
  description?: string
  requirements?: string
  goals?: string
  businessContext?: string
  status: InterviewStatus
  createdAt: string
  updatedAt: string
}

export type CreateInterviewTemplateRequest = {
  enterprise: string
  type: InterviewType
  position: string
  workingArea?: string
  description?: string
  requirements?: string
  goals?: string
  businessContext?: string
}

export type InterviewSession = {
  id: string
  attemptNumber: number
  status: SessionStatus
  startedAt?: string
  completedAt?: string
  templateId: string
  templatePosition: string
  templateEnterprise: string
}

export type CreateSessionRequest = {
  templateId: string
}

export type InterviewQuestion = {
  id: string
  sessionId: string
  orderIndex: number
  question: string
  answer?: string
  aiFeedback?: string
  score?: number
  aiModel?: string
  createdAt: string
  answeredAt?: string
}

export type SubmitAnswerRequest = {
  answer: string
}

export type InterviewResult = {
  id: string
  sessionId: string
  attemptNumber: number
  generalFeedback?: string
  strengths?: string
  weaknesses?: string
  totalScore?: number
  status: ResultStatus
  aiModel?: string
  totalTokensUsed?: number
  generatedAt: string
}

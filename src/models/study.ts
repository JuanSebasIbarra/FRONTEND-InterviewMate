export type StudyDifficulty = 'BASIC' | 'INTERMEDIATE' | 'ADVANCED'

export type StudyQuestionType = 'THEORETICAL' | 'PRACTICAL'

export type StartStudyRequest = {
  audioFile?: string
  topic?: string
}

export type GenerateStudyQuestionsRequest = {
  studySessionId: string
}

export type StudyQuestion = {
  id: string
  orderIndex: number
  questionText: string
  difficulty: StudyDifficulty
  type: StudyQuestionType
}

export type StudySession = {
  id: string
  topic: string
  createdAt: string
  questions: StudyQuestion[]
}

import type { CreateInterviewTemplateRequest, InterviewTemplate } from '../models/interview'
import { httpRequest } from './httpClient'

export function getMyTemplates() {
  return httpRequest<InterviewTemplate[]>('/api/v1/interview-templates')
}

export function createTemplate(request: CreateInterviewTemplateRequest) {
  return httpRequest<InterviewTemplate>('/api/v1/interview-templates', {
    method: 'POST',
    body: JSON.stringify(request),
  })
}

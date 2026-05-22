import type { CreateInterviewTemplateRequest, InterviewTemplate } from '../models/interview'
import { httpRequest } from './httpClient'

export function getMyTemplates() {
  return httpRequest<InterviewTemplate[]>('/interview-templates')
}

export function getTemplateById(templateId: string) {
  return httpRequest<InterviewTemplate>(`/interview-templates/${templateId}`)
}

export function createTemplate(request: CreateInterviewTemplateRequest) {
  return httpRequest<InterviewTemplate>('/interview-templates', {
    method: 'POST',
    body: JSON.stringify(request),
  })
}

export function updateTemplate(templateId: string, request: Partial<CreateInterviewTemplateRequest>) {
  return httpRequest<InterviewTemplate>(`/interview-templates/${templateId}`, {
    method: 'PATCH',
    body: JSON.stringify(request),
  })
}

export function updateTemplateStatus(templateId: string, newStatus: 'DRAFT' | 'ACTIVE' | 'ARCHIVED') {
  return httpRequest<InterviewTemplate>(
    `/interview-templates/${templateId}/status?newStatus=${encodeURIComponent(newStatus)}`,
    {
      method: 'PATCH',
    },
  )
}

export function deleteTemplate(templateId: string) {
  return httpRequest<void>(`/interview-templates/${templateId}`, {
    method: 'DELETE',
  })
}

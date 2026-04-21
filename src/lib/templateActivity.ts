import type { InterviewTemplate } from '../models/interview'

function toTimestamp(value?: string): number {
  if (!value) return 0

  const timestamp = new Date(value).getTime()
  return Number.isNaN(timestamp) ? 0 : timestamp
}

export function getTemplateLastActivityTimestamp(template: Pick<InterviewTemplate, 'createdAt' | 'updatedAt'>): number {
  return Math.max(toTimestamp(template.createdAt), toTimestamp(template.updatedAt))
}

export function sortTemplatesByRecentActivity(templates: InterviewTemplate[]): InterviewTemplate[] {
  return [...templates].sort(
    (left, right) => getTemplateLastActivityTimestamp(right) - getTemplateLastActivityTimestamp(left),
  )
}

export function formatTemplateLastActivity(template: Pick<InterviewTemplate, 'createdAt' | 'updatedAt'>): string {
  const timestamp = getTemplateLastActivityTimestamp(template)

  if (!timestamp) {
    return 'Sin actividad reciente'
  }

  return new Intl.DateTimeFormat('es-ES', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(timestamp))
}
import type { DashboardStatsResponse } from '../models/api'
import { httpRequest } from './httpClient'

export function getDashboardStats() {
  return httpRequest<DashboardStatsResponse>('/api/v1/dashboard/stats')
}

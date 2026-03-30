export type ApiResponse<T> = {
  success: boolean
  message: string
  data: T
}

export type ApiErrorPayload = {
  message?: string
  error?: string
  fieldErrors?: Record<string, string>
  success?: boolean
}

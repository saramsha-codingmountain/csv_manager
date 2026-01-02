/**
 * API request and response types
 */

export interface ApiError {
  detail: string
  status_code?: number
}

export interface PaginatedResponse<T> {
  items: T[]
  total: number
  page: number
  page_size: number
}

export interface ApiResponse<T = unknown> {
  data: T
  message?: string
}


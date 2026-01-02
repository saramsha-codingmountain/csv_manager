/**
 * Application type definitions
 */

export interface User {
  id: number
  username: string
  email: string
  role: 'user' | 'admin'
  created_at: string
}

export interface CSVFile {
  id: number
  filename: string
  file_size: number
  uploader_id: number
  uploader_username: string
  uploaded_at: string
}

export interface CSVViewData {
  filename: string
  headers: string[]
  rows: Record<string, string>[]
  total_rows: number
  displayed_rows: number
}

export interface WebSocketMessage {
  event: string
  action?: string
  file?: CSVFile
  file_id?: number
  [key: string]: unknown
}

export interface AuthTokens {
  access_token: string
  token_type: string
}

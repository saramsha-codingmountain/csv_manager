/**
 * Application constants and configuration
 */

export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_URL || 'http://localhost:8000',
  WS_URL: import.meta.env.VITE_WS_URL || 'ws://localhost:8000',
  TIMEOUT: 30000, // 30 seconds
} as const

export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/api/v1/auth/login',
    SIGNUP: '/api/v1/auth/signup',
    ME: '/api/v1/auth/me',
  },
  CSV: {
    LIST: '/api/v1/csv/list',
    UPLOAD: '/api/v1/csv/upload',
    VIEW: (id: number) => `/api/v1/csv/${id}/view`,
    DOWNLOAD: (id: number) => `/api/v1/csv/${id}/download`,
    DELETE: (id: number) => `/api/v1/csv/${id}`,
  },
  USERS: {
    LIST: '/api/v1/users/',
    UPDATE: (id: number) => `/api/v1/users/${id}`,
    DELETE: (id: number) => `/api/v1/users/${id}`,
  },
  WS: {
    CSV_UPDATES: '/ws/csv-updates',
  },
} as const

export const STORAGE_KEYS = {
  TOKEN: 'token',
  USER: 'user',
} as const

export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 100,
  MAX_PAGE_SIZE: 1000,
} as const

export const FILE_UPLOAD = {
  MAX_SIZE_MB: 50,
  ALLOWED_EXTENSIONS: ['.csv'],
} as const

export const CSV_VIEW = {
  DEFAULT_MAX_ROWS: 100,
  MAX_ROWS: 1000,
} as const

export const WS_RECONNECT = {
  INITIAL_DELAY: 1000,
  MAX_DELAY: 30000,
  MAX_RETRIES: 5,
} as const


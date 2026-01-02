/**
 * Authentication API service
 */
import { apiClient } from '../../config/api'
import { API_ENDPOINTS } from '../../config/constants'
import { User, AuthTokens } from '../../types'
import { ApiError } from '../../types/api'

export class AuthService {
  /**
   * Login user
   */
  static async login(email: string, password: string): Promise<AuthTokens> {
    try {
      const response = await apiClient.post<AuthTokens>(
        API_ENDPOINTS.AUTH.LOGIN,
        { email, password }
      )
      return response.data
    } catch (error: unknown) {
      throw this.handleError(error)
    }
  }

  /**
   * Register new user (admin only)
   */
  static async signup(username: string, email: string, password: string, role: 'user' | 'admin' = 'user'): Promise<User> {
    try {
      const response = await apiClient.post<User>(
        API_ENDPOINTS.AUTH.SIGNUP,
        { username, email, password, role }
      )
      return response.data
    } catch (error: unknown) {
      throw this.handleError(error)
    }
  }

  /**
   * Get current user information
   */
  static async getCurrentUser(): Promise<User> {
    try {
      const response = await apiClient.get<User>(API_ENDPOINTS.AUTH.ME)
      return response.data
    } catch (error: unknown) {
      throw this.handleError(error)
    }
  }

  /**
   * Handle API errors
   */
  private static handleError(error: unknown): Error {
    if (error && typeof error === 'object' && 'response' in error) {
      const axiosError = error as { response?: { data?: ApiError } }
      const message = axiosError.response?.data?.detail || 'An error occurred'
      return new Error(message)
    }
    return error instanceof Error ? error : new Error('Unknown error occurred')
  }
}


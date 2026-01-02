/**
 * Users API service
 */
import { apiClient } from '../../config/api'
import { API_ENDPOINTS } from '../../config/constants'
import { User } from '../../types'
import { ApiError } from '../../types/api'

export class UsersService {
  /**
   * Get list of users
   */
  static async list(skip = 0, limit = 100): Promise<User[]> {
    try {
      const response = await apiClient.get<User[]>(API_ENDPOINTS.USERS.LIST, {
        params: { skip, limit },
      })
      return response.data
    } catch (error: unknown) {
      throw this.handleError(error)
    }
  }

  /**
   * Update user
   */
  static async update(
    userId: number,
    data: {
      username?: string
      email?: string
      password?: string
      role?: 'user' | 'admin'
    }
  ): Promise<User> {
    try {
      const response = await apiClient.put<User>(API_ENDPOINTS.USERS.UPDATE(userId), data)
      return response.data
    } catch (error: unknown) {
      throw this.handleError(error)
    }
  }

  /**
   * Delete user
   */
  static async delete(userId: number): Promise<void> {
    try {
      await apiClient.delete(API_ENDPOINTS.USERS.DELETE(userId))
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


/**
 * CSV file API service
 */
import { apiClient } from '../../config/api'
import { API_ENDPOINTS } from '../../config/constants'
import { CSVFile, CSVViewData } from '../../types'
import { ApiError } from '../../types/api'

export class CSVService {
  /**
   * Get list of CSV files
   */
  static async list(skip = 0, limit = 100): Promise<CSVFile[]> {
    try {
      const response = await apiClient.get<CSVFile[]>(API_ENDPOINTS.CSV.LIST, {
        params: { skip, limit },
      })
      return response.data
    } catch (error: unknown) {
      throw this.handleError(error)
    }
  }

  /**
   * View CSV file contents
   */
  static async view(fileId: number, maxRows = 100): Promise<CSVViewData> {
    try {
      const response = await apiClient.get<CSVViewData>(
        API_ENDPOINTS.CSV.VIEW(fileId),
        {
          params: { max_rows: maxRows },
        }
      )
      return response.data
    } catch (error: unknown) {
      throw this.handleError(error)
    }
  }

  /**
   * Upload CSV file
   */
  static async upload(file: File): Promise<CSVFile> {
    try {
      const formData = new FormData()
      formData.append('file', file)
      
      const response = await apiClient.post<CSVFile>(
        API_ENDPOINTS.CSV.UPLOAD,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      )
      return response.data
    } catch (error: unknown) {
      throw this.handleError(error)
    }
  }

  /**
   * Download CSV file
   */
  static async download(fileId: number, filename: string): Promise<void> {
    try {
      const response = await apiClient.get(API_ENDPOINTS.CSV.DOWNLOAD(fileId), {
        responseType: 'blob',
      })
      
      // Create a blob URL and trigger download
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', filename)
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)
    } catch (error: unknown) {
      throw this.handleError(error)
    }
  }

  /**
   * Delete CSV file
   */
  static async delete(fileId: number): Promise<void> {
    try {
      await apiClient.delete(API_ENDPOINTS.CSV.DELETE(fileId))
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


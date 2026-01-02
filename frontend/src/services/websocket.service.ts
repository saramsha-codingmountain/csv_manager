/**
 * WebSocket service for real-time updates
 */
import { API_CONFIG, API_ENDPOINTS, WS_RECONNECT } from '../config/constants'
import { WebSocketMessage } from '../types'

type MessageHandler = (data: WebSocketMessage) => void

export class WebSocketService {
  private ws: WebSocket | null = null
  private reconnectAttempts = 0
  private reconnectTimer: NodeJS.Timeout | null = null
  private messageHandlers: Set<MessageHandler> = new Set()
  private token: string | null = null

  /**
   * Connect to WebSocket server
   */
  connect(token: string): void {
    if (this.ws?.readyState === WebSocket.OPEN) {
      return
    }

    this.token = token
    this.disconnect()

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
    const wsUrl = `${protocol}//${API_CONFIG.WS_URL.replace(/^https?:\/\//, '')}${API_ENDPOINTS.WS.CSV_UPDATES}`

    try {
      this.ws = new WebSocket(wsUrl)

      this.ws.onopen = () => {
        this.reconnectAttempts = 0
        console.log('WebSocket connected')
        
        // Send authentication token if needed
        if (this.token) {
          this.ws?.send(JSON.stringify({ type: 'auth', token: this.token }))
        }
      }

      this.ws.onmessage = (event) => {
        try {
          const data: WebSocketMessage = JSON.parse(event.data)
          this.messageHandlers.forEach((handler) => handler(data))
        } catch (error) {
          console.error('Error parsing WebSocket message:', error)
        }
      }

      this.ws.onerror = (error) => {
        console.error('WebSocket error:', error)
      }

      this.ws.onclose = () => {
        console.log('WebSocket disconnected')
        this.attemptReconnect()
      }
    } catch (error) {
      console.error('Error creating WebSocket connection:', error)
      this.attemptReconnect()
    }
  }

  /**
   * Disconnect from WebSocket server
   */
  disconnect(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer)
      this.reconnectTimer = null
    }

    if (this.ws) {
      this.ws.close()
      this.ws = null
    }

    this.reconnectAttempts = 0
  }

  /**
   * Subscribe to WebSocket messages
   */
  onMessage(handler: MessageHandler): () => void {
    this.messageHandlers.add(handler)
    return () => {
      this.messageHandlers.delete(handler)
    }
  }

  /**
   * Attempt to reconnect with exponential backoff
   */
  private attemptReconnect(): void {
    if (this.reconnectAttempts >= WS_RECONNECT.MAX_RETRIES) {
      console.error('Max reconnection attempts reached')
      return
    }

    if (!this.token) {
      return
    }

    const delay = Math.min(
      WS_RECONNECT.INITIAL_DELAY * Math.pow(2, this.reconnectAttempts),
      WS_RECONNECT.MAX_DELAY
    )

    this.reconnectTimer = setTimeout(() => {
      this.reconnectAttempts++
      console.log(`Attempting to reconnect (${this.reconnectAttempts}/${WS_RECONNECT.MAX_RETRIES})...`)
      this.connect(this.token!)
    }, delay)
  }

  /**
   * Check if WebSocket is connected
   */
  isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN
  }
}

// Singleton instance
export const wsService = new WebSocketService()


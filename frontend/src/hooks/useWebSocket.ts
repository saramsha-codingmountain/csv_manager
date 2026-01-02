/**
 * Custom hook for WebSocket connection
 */
import { useEffect, useRef } from 'react'
import { wsService } from '../services/websocket.service'
import { WebSocketMessage } from '../types'

export function useWebSocket(
  token: string | null,
  onMessage: (data: WebSocketMessage) => void
): void {
  const onMessageRef = useRef(onMessage)

  // Keep the latest handler reference
  useEffect(() => {
    onMessageRef.current = onMessage
  }, [onMessage])

  useEffect(() => {
    if (!token) {
      wsService.disconnect()
      return
    }

    // Connect to WebSocket
    wsService.connect(token)

    // Subscribe to messages
    const unsubscribe = wsService.onMessage((data) => {
      onMessageRef.current(data)
    })

    // Cleanup on unmount
    return () => {
      unsubscribe()
      wsService.disconnect()
    }
  }, [token])
}

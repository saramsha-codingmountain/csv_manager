/**
 * Authentication context and provider
 */
import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react'
import { AuthService } from '../services/api/auth.service'
import { STORAGE_KEYS } from '../config/constants'
import { User } from '../types'

interface AuthContextType {
  user: User | null
  token: string | null
  login: (email: string, password: string) => Promise<void>
  signup: (username: string, email: string, password: string, role?: 'user' | 'admin') => Promise<void>
  logout: () => void
  loading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check for stored token on mount
    const storedToken = localStorage.getItem(STORAGE_KEYS.TOKEN)
    if (storedToken) {
      setToken(storedToken)
      // Fetch user info
      AuthService.getCurrentUser()
        .then((userData) => {
          setUser(userData)
          localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(userData))
        })
        .catch(() => {
          // Invalid token, clear it
          localStorage.removeItem(STORAGE_KEYS.TOKEN)
          localStorage.removeItem(STORAGE_KEYS.USER)
          setToken(null)
        })
        .finally(() => setLoading(false))
    } else {
      setLoading(false)
    }
  }, [])

  const login = useCallback(async (email: string, password: string) => {
    const tokens = await AuthService.login(email, password)
    const newToken = tokens.access_token
    setToken(newToken)
    localStorage.setItem(STORAGE_KEYS.TOKEN, newToken)
    
    // Fetch user info
    const userData = await AuthService.getCurrentUser()
    setUser(userData)
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(userData))
  }, [])

  const signup = useCallback(async (username: string, email: string, password: string, role: 'user' | 'admin' = 'user') => {
    await AuthService.signup(username, email, password, role)
    // Note: After admin creates a user, they don't automatically log in as that user
  }, [])

  const logout = useCallback(() => {
    setToken(null)
    setUser(null)
    localStorage.removeItem(STORAGE_KEYS.TOKEN)
    localStorage.removeItem(STORAGE_KEYS.USER)
  }, [])

  return (
    <AuthContext.Provider value={{ user, token, login, signup, logout, loading }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

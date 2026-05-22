'use client'

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react'
import type { ChangePasswordRequest, User, LoginRequest } from '@/types/auth'
import { authService } from '@/lib/services/auth.service'
import { tokenManager } from './token-manager'
import { SESSION_EXPIRED_MESSAGE } from './session-errors'

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (data: LoginRequest) => Promise<void>
  logout: () => void
  changePassword: (data: ChangePasswordRequest) => Promise<void>
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const logout = useCallback(() => {
    tokenManager.clearAll()
    setUser(null)
  }, [])

  // Restore session on mount
  useEffect(() => {
    const restore = async () => {
      const refreshToken = tokenManager.getRefreshToken()
      const storedUser = tokenManager.getStoredUser()

      if (!refreshToken) {
        setIsLoading(false)
        return
      }

      // Optimistically set stored user while we validate
      if (storedUser) {
        setUser(storedUser)
      }

      try {
        const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'
        const res = await fetch(`${baseUrl}/v1/auth/refresh`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ refreshToken }),
        })

        if (!res.ok) {
          throw new Error('Refresh failed')
        }

        const data = await res.json()
        const responseData = data.success ? data.data : data

        tokenManager.setAccessToken(responseData.accessToken)
        tokenManager.setRefreshToken(responseData.refreshToken)

        // Fetch fresh user info
        const meRes = await fetch(`${baseUrl}/v1/auth/me`, {
          headers: { Authorization: `Bearer ${responseData.accessToken}` },
          credentials: 'include',
        })

        if (meRes.ok) {
          const meData = await meRes.json()
          const freshUser = meData.success ? meData.data : meData
          tokenManager.setStoredUser(freshUser)
          setUser(freshUser)
        } else {
          throw new Error(SESSION_EXPIRED_MESSAGE)
        }
      } catch {
        // Refresh failed - clear everything
        tokenManager.clearAll()
        setUser(null)
      } finally {
        setIsLoading(false)
      }
    }

    restore()
  }, [])

  const login = useCallback(async (data: LoginRequest) => {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'
    const res = await fetch(`${baseUrl}/v1/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(data),
    })

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}))
      const message = errorData?.error?.message || errorData?.message || 'เข้าสู่ระบบไม่สำเร็จ'
      throw new Error(message)
    }

    const responseData = await res.json()
    const loginData = responseData.success ? responseData.data : responseData

    tokenManager.setAccessToken(loginData.accessToken)
    tokenManager.setRefreshToken(loginData.refreshToken)
    tokenManager.setStoredUser(loginData.user)
    setUser(loginData.user)
  }, [])

  const changePassword = useCallback(async (data: ChangePasswordRequest) => {
    if (!user) throw new Error('กรุณาเข้าสู่ระบบก่อนเปลี่ยนรหัสผ่าน')
    await authService.changePassword(user.id, data)
    const updatedUser = {
      ...user,
      mustChangePassword: false,
      position: data.position ?? user.position,
      phoneNumber: data.phoneNumber ?? user.phoneNumber,
    }
    tokenManager.setStoredUser(updatedUser)
    setUser(updatedUser)
  }, [user])

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
        changePassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuthContext() {
  const ctx = useContext(AuthContext)
  if (!ctx) {
    throw new Error('useAuthContext must be used within AuthProvider')
  }
  return ctx
}

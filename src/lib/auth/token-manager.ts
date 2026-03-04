import type { User } from '@/types/auth'

const REFRESH_TOKEN_KEY = 'hotlines3_refresh_token'
const USER_KEY = 'hotlines3_user'

let accessToken: string | null = null

export const tokenManager = {
  getAccessToken(): string | null {
    return accessToken
  },

  setAccessToken(token: string | null) {
    accessToken = token
  },

  getRefreshToken(): string | null {
    if (typeof window === 'undefined') return null
    return localStorage.getItem(REFRESH_TOKEN_KEY)
  },

  setRefreshToken(token: string | null) {
    if (typeof window === 'undefined') return
    if (token) {
      localStorage.setItem(REFRESH_TOKEN_KEY, token)
    } else {
      localStorage.removeItem(REFRESH_TOKEN_KEY)
    }
  },

  getStoredUser(): User | null {
    if (typeof window === 'undefined') return null
    const stored = localStorage.getItem(USER_KEY)
    if (!stored) return null
    try {
      return JSON.parse(stored) as User
    } catch {
      return null
    }
  },

  setStoredUser(user: User | null) {
    if (typeof window === 'undefined') return
    if (user) {
      localStorage.setItem(USER_KEY, JSON.stringify(user))
    } else {
      localStorage.removeItem(USER_KEY)
    }
  },

  clearAll() {
    accessToken = null
    if (typeof window === 'undefined') return
    localStorage.removeItem(REFRESH_TOKEN_KEY)
    localStorage.removeItem(USER_KEY)
  },
}

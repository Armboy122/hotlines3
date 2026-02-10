import axios, { type AxiosInstance, type AxiosError, type AxiosRequestConfig } from 'axios'
import { tokenManager } from '@/lib/auth/token-manager'

const baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'

const axiosInstance: AxiosInstance = axios.create({
  baseURL,
  timeout: 30000,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor: attach Bearer token
axiosInstance.interceptors.request.use(
  (config) => {
    const token = tokenManager.getAccessToken()
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Track if a refresh is already in progress to avoid parallel refreshes
let isRefreshing = false
let failedQueue: Array<{
  resolve: (token: string) => void
  reject: (error: Error) => void
}> = []

function processQueue(error: Error | null, token: string | null) {
  failedQueue.forEach((p) => {
    if (error) {
      p.reject(error)
    } else if (token) {
      p.resolve(token)
    }
  })
  failedQueue = []
}

// Response interceptor: extract data + auto-refresh on 401
axiosInstance.interceptors.response.use(
  (response) => {
    // Backend API returns { success: true, data: {...} }
    if (response.data?.success === true) {
      return response.data.data
    }
    return response.data
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as typeof error.config & { _retry?: boolean }

    // If 401 and we haven't already retried
    if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
      // Don't retry auth endpoints themselves
      if (originalRequest.url?.includes('/auth/')) {
        return Promise.reject(extractError(error))
      }

      if (isRefreshing) {
        // Queue this request while refresh is in progress
        return new Promise<string>((resolve, reject) => {
          failedQueue.push({ resolve, reject })
        }).then((token) => {
          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${token}`
          }
          return axiosInstance.request(originalRequest)
        })
      }

      originalRequest._retry = true
      isRefreshing = true

      try {
        const refreshToken = tokenManager.getRefreshToken()
        if (!refreshToken) {
          throw new Error('No refresh token')
        }

        const res = await axios.post(`${baseURL}/v1/auth/refresh`, { refreshToken })
        const data = res.data?.success ? res.data.data : res.data
        const newAccessToken = data.accessToken

        tokenManager.setAccessToken(newAccessToken)
        tokenManager.setRefreshToken(data.refreshToken)

        processQueue(null, newAccessToken)

        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`
        }
        return axiosInstance.request(originalRequest)
      } catch (refreshError) {
        processQueue(new Error('Refresh failed'), null)
        tokenManager.clearAll()

        // Redirect to login (client-side only)
        if (typeof window !== 'undefined') {
          window.location.href = '/login'
        }

        return Promise.reject(new Error('เซสชันหมดอายุ กรุณาเข้าสู่ระบบใหม่'))
      } finally {
        isRefreshing = false
      }
    }

    return Promise.reject(extractError(error))
  }
)

function extractError(error: AxiosError): Error {
  if (error.response?.data) {
    const data = error.response.data as Record<string, unknown>
    const errorObj = data.error as Record<string, unknown> | undefined
    if (errorObj?.message) {
      return new Error(errorObj.message as string)
    }
    if (data.message) {
      return new Error(data.message as string)
    }
  }

  if (error.code === 'ECONNREFUSED') {
    return new Error('ไม่สามารถเชื่อมต่อกับ Backend API ได้')
  }

  if (error.code === 'ETIMEDOUT') {
    return new Error('หมดเวลาการเชื่อมต่อ กรุณาลองใหม่')
  }

  return new Error(error.message || 'เกิดข้อผิดพลาด')
}

// Typed API client wrapper
// The response interceptor extracts data, so the actual return is T (not AxiosResponse<T>)
export const apiClient = {
  get<T = unknown>(url: string, config?: AxiosRequestConfig): Promise<T> {
    return axiosInstance.get(url, config) as Promise<T>
  },
  post<T = unknown>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
    return axiosInstance.post(url, data, config) as Promise<T>
  },
  put<T = unknown>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
    return axiosInstance.put(url, data, config) as Promise<T>
  },
  delete<T = unknown>(url: string, config?: AxiosRequestConfig): Promise<T> {
    return axiosInstance.delete(url, config) as Promise<T>
  },
}

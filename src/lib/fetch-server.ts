import { cookies } from 'next/headers'

const BASE_URL = process.env.GO_BACKEND_URL || 'http://localhost:8080'

/**
 * Server-side fetch utility for Server Components
 * Automatically forwards access_token cookie to the Go backend
 */
export async function fetchServer<T>(path: string, options: RequestInit = {}): Promise<T> {
  const cookieStore = await cookies()
  const accessToken = cookieStore.get('access_token')?.value

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  }

  // Forward cookie to backend
  if (accessToken) {
    headers['Cookie'] = `access_token=${accessToken}`
  }

  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers,
    credentials: 'include', // Important: send cookies
  })

  if (!res.ok) {
    // Handle 401 - redirect to login (server-side)
    if (res.status === 401) {
      throw new Error('Unauthorized - redirecting to login')
    }
    throw new Error(`Failed to fetch ${path}: ${res.statusText}`)
  }

  const data = await res.json()

  // Unwrap { success: true, data: {...} } format (same as apiClient)
  return (data.success ? data.data : data) as T
}

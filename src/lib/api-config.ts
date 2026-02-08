/**
 * API Configuration - Pure frontend mode (Go backend only)
 */

export const API_CONFIG = {
  baseUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080',
}

export function getApiUrl(path: string): string {
  const normalizedPath = path.startsWith('/') ? path.slice(1) : path
  const baseUrl = API_CONFIG.baseUrl.endsWith('/')
    ? API_CONFIG.baseUrl.slice(0, -1)
    : API_CONFIG.baseUrl
  return `${baseUrl}/${normalizedPath}`
}

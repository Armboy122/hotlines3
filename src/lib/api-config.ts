/**
 * API Configuration
 * Manages API mode switching between local (Prisma) and external (Backend API)
 */

export const API_CONFIG = {
  /**
   * API Mode: 'local' | 'external'
   * - local: Use Prisma directly (current implementation)
   * - external: Use Backend API via axios
   */
  mode: (process.env.NEXT_PUBLIC_API_MODE || 'local') as 'local' | 'external',

  /**
   * Backend API Base URL
   * Used when mode is 'external'
   */
  baseUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080',
};

/**
 * Check if running in External API mode
 */
export function isExternalMode(): boolean {
  return API_CONFIG.mode === 'external';
}

/**
 * Check if running in Local (Prisma) mode
 */
export function isLocalMode(): boolean {
  return API_CONFIG.mode === 'local';
}

/**
 * Get full API URL for a given path
 * @param path - API path (e.g., '/api/tasks')
 * @returns Full URL (e.g., 'http://localhost:8080/api/tasks')
 */
export function getApiUrl(path: string): string {
  // Remove leading slash if present to avoid double slashes
  const normalizedPath = path.startsWith('/') ? path.slice(1) : path;
  const baseUrl = API_CONFIG.baseUrl.endsWith('/')
    ? API_CONFIG.baseUrl.slice(0, -1)
    : API_CONFIG.baseUrl;
  return `${baseUrl}/${normalizedPath}`;
}

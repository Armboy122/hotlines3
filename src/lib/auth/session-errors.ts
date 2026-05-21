export const SESSION_EXPIRED_MESSAGE = 'เซสชันหมดอายุ กรุณาเข้าสู่ระบบใหม่'

const INVALID_SESSION_CODES = new Set([
  'INVALID_TOKEN',
  'USER_NOT_FOUND',
  'SESSION_USER_NOT_FOUND',
])

export function isInvalidSessionErrorCode(code: unknown): boolean {
  return typeof code === 'string' && INVALID_SESSION_CODES.has(code)
}

export function extractApiErrorCode(data: unknown): string | null {
  if (!data || typeof data !== 'object') return null
  const record = data as Record<string, unknown>
  const error = record.error
  if (error && typeof error === 'object') {
    const code = (error as Record<string, unknown>).code
    return typeof code === 'string' ? code : null
  }
  const code = record.code
  return typeof code === 'string' ? code : null
}

export function isInvalidSessionApiResponse(data: unknown): boolean {
  return isInvalidSessionErrorCode(extractApiErrorCode(data))
}

export function sessionExpiredError(): Error {
  return new Error(SESSION_EXPIRED_MESSAGE)
}

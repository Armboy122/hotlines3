import { extractApiErrorCode, isInvalidSessionApiResponse, isInvalidSessionErrorCode, SESSION_EXPIRED_MESSAGE, sessionExpiredError } from './session-errors'

const assert = (value: boolean, message?: string) => {
  if (!value) throw new Error(message ?? 'session error assertion failed')
}

const assertEqual = <T>(actual: T, expected: T, message?: string) => {
  if (actual !== expected) throw new Error(message ?? `expected ${String(actual)} to equal ${String(expected)}`)
}

assert(isInvalidSessionErrorCode('SESSION_USER_NOT_FOUND'))
assert(isInvalidSessionErrorCode('USER_NOT_FOUND'))
assert(isInvalidSessionErrorCode('INVALID_TOKEN'))
assert(!isInvalidSessionErrorCode('PASSWORD_STATUS_ERROR'))
assert(!isInvalidSessionErrorCode(undefined))

assertEqual(extractApiErrorCode({ success: false, error: { code: 'SESSION_USER_NOT_FOUND', message: 'Session user not found' } }), 'SESSION_USER_NOT_FOUND')
assertEqual(extractApiErrorCode({ code: 'INVALID_TOKEN' }), 'INVALID_TOKEN')
assertEqual(extractApiErrorCode({ success: false, error: { message: 'missing code' } }), null)

assert(isInvalidSessionApiResponse({ success: false, error: { code: 'SESSION_USER_NOT_FOUND' } }))
assert(!isInvalidSessionApiResponse({ success: false, error: { code: 'PASSWORD_STATUS_ERROR' } }))
assertEqual(sessionExpiredError().message, SESSION_EXPIRED_MESSAGE)

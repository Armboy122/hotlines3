import { strict as assert } from 'node:assert'
import { tokenManager } from '@/lib/auth/token-manager'
import { INVALID_SESSION_MESSAGE, handleInvalidSessionResponse, isInvalidSessionResponse } from './api-client'

const storage = new Map<string, string>()
let redirectedTo = ''
Object.defineProperty(globalThis, 'window', {
  value: {
    location: {
      get href() {
        return redirectedTo
      },
      set href(value: string) {
        redirectedTo = value
      },
      pathname: '/admin/users',
    },
  },
  configurable: true,
})
Object.defineProperty(globalThis, 'localStorage', {
  value: {
    getItem: (key: string) => storage.get(key) ?? null,
    setItem: (key: string, value: string) => storage.set(key, value),
    removeItem: (key: string) => storage.delete(key),
  },
  configurable: true,
})

tokenManager.setAccessToken('stale-access-token')
tokenManager.setRefreshToken('stale-refresh-token')
tokenManager.setStoredUser({
  id: 1,
  username: 'admin',
  role: 'super_admin',
  teamId: null,
  isActive: true,
  lastLogin: null,
  createdAt: '2026-05-21T00:00:00.000Z',
})

for (const code of ['USER_NOT_FOUND', 'SESSION_USER_NOT_FOUND', 'INVALID_TOKEN']) {
  assert.equal(
    isInvalidSessionResponse(401, { error: { code, message: 'Unable to verify password status' } }),
    true,
    `${code} 401 should be classified as invalid session`,
  )
}

assert.equal(
  isInvalidSessionResponse(401, { error: { code: 'VALIDATION_ERROR', message: 'Bad request' } }),
  false,
  'unrelated 401 errors should not be treated as invalid session',
)
assert.equal(
  isInvalidSessionResponse(403, { error: { code: 'INVALID_TOKEN' } }),
  false,
  'non-401 invalid token errors should not trigger session recovery',
)

const error = handleInvalidSessionResponse()
assert.equal(error.message, INVALID_SESSION_MESSAGE)
assert.equal(tokenManager.getAccessToken(), null, 'invalid session should clear in-memory access token')
assert.equal(tokenManager.getRefreshToken(), null, 'invalid session should clear refresh token')
assert.equal(tokenManager.getStoredUser(), null, 'invalid session should clear stored user')
assert.equal(redirectedTo, '/login', 'invalid session should send the browser back to login')

console.log('✅ api-client invalid-session recovery contract passed')

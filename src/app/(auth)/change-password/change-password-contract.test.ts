import assert from 'node:assert/strict'
import { readFileSync, existsSync } from 'node:fs'
import { resolve } from 'node:path'

const root = process.cwd()
const pagePath = resolve(root, 'src/app/(auth)/change-password/page.tsx')
const authGuardSource = readFileSync(resolve(root, 'src/lib/auth/auth-guard.tsx'), 'utf8')
const authContextSource = readFileSync(resolve(root, 'src/lib/auth/auth-context.tsx'), 'utf8')
const authServiceSource = readFileSync(resolve(root, 'src/lib/services/auth.service.ts'), 'utf8')

assert(existsSync(pagePath), 'first-login forced password change route /change-password must exist')
const pageSource = readFileSync(pagePath, 'utf8')

assert(authGuardSource.includes('mustChangePassword'), 'main app guard must inspect mustChangePassword from backend user contract')
assert(authGuardSource.includes("router.replace('/change-password')"), 'main app guard must redirect forced-change users to /change-password')
assert(authContextSource.includes('changePassword'), 'auth context must expose a changePassword action for the route')
assert(authServiceSource.includes('/v1/users/${userId}/password'), 'frontend must use backend user password-change endpoint')
assert(pageSource.includes('รหัสผ่านปัจจุบัน'), 'change password route must collect current password')
assert(pageSource.includes('รหัสผ่านใหม่'), 'change password route must collect new password')
assert(pageSource.includes('/planning'), 'successful first-login password change should continue to /planning')

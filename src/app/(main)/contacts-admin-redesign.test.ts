import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message)
}

const root = process.cwd()
const contactsSource = readFileSync(resolve(root, 'src/app/(main)/contacts/page.tsx'), 'utf8')
const contactViewModelSource = readFileSync(resolve(root, 'src/features/contacts/contact-directory-view-model.ts'), 'utf8')
const adminSource = readFileSync(resolve(root, 'src/app/(main)/admin/page.tsx'), 'utf8')
const adminShellSource = readFileSync(resolve(root, 'src/components/pages/admin/admin-shell.tsx'), 'utf8')
const adminUsersSource = readFileSync(resolve(root, 'src/components/pages/admin/users-client.tsx'), 'utf8')
const rolePolicySource = readFileSync(resolve(root, 'src/lib/auth/role-policy.ts'), 'utf8')
const navigationSource = readFileSync(resolve(root, 'src/config/navigation.tsx'), 'utf8')

// /contacts Requirement C/D: all roles can view; viewer keeps call/copy/detail only;
// mobile/tablet cards are call-first and no squeezed table below lg.
assert(/Title:\s*`?สมุดโทรศัพท์|สมุดโทรศัพท์/.test(contactsSource), '/contacts must use Thai title สมุดโทรศัพท์')
assert(/placeholder=\"ค้นหาชื่อ, เบอร์โทร, ทีม\/หน่วยงาน, ตำแหน่ง\"/.test(contactsSource), 'contacts search placeholder must cover name, phone, organization/team, position')
assert(/ทีมของฉัน/.test(contactsSource) && /ทุกทีมที่มองเห็นได้/.test(contactsSource) && /รายการโปรด\/ใช้บ่อย/.test(contactsSource), 'contacts must expose Requirement C filter chips')
assert(
  /CONTACT_TYPE_OPTIONS = buildContactTypeOptions\(\)/.test(contactsSource) &&
    /name=\"typeFilter\"/.test(contactsSource) &&
    /บุคลากรภายใน/.test(contactViewModelSource) &&
    /หน่วยงานภายนอก/.test(contactViewModelSource) &&
    /เบอร์ฉุกเฉิน\/สำคัญ/.test(contactViewModelSource),
  'contacts must expose Requirement C contact type filters',
)
assert(
  /function phoneHref[\s\S]{0,120}contactCallHref/.test(contactsSource) &&
    /href=\{phoneHref\(entry\.phoneNumber\)\}/.test(contactsSource) &&
    /phoneNumber\.replace\(\/\[\^0-9\+\]\//.test(contactViewModelSource) &&
    /tel:\$\{sanitized\}/.test(contactViewModelSource),
  'contact cards/rows must use sanitized tel: links for call action',
)
assert(/คัดลอกเบอร์โทร/.test(contactsSource) && /คัดลอกเบอร์โทรแล้ว/.test(contactsSource), 'contacts must support copy phone feedback')
assert(/ดูรายละเอียด/.test(contactsSource), 'contacts must provide detail drawer/sheet action')
assert(/lg:hidden/.test(contactsSource) && /hidden[\s\S]{0,80}lg:block/.test(contactsSource), 'contacts mobile/tablet must use cards and desktop can use table')
assert(!/viewer[\s\S]{0,160}(แก้ไข|ลบ|เพิ่มรายชื่อ)/.test(contactsSource), 'viewer path must not expose add/edit/delete actions')

// /admin round 1: super_admin only, active sections are users/teams/capability/master-data/settings.
// Audit and dashboard are explicitly deferred by the 2026-05-21 contract lock.
assert(/canAccessAdminConsole\(role[^)]*\)[\s\S]{0,120}return isSystemAdmin\(role\)/.test(rolePolicySource), 'admin console must be super_admin only')
assert(/!canAccessMainNavigationItem\('admin', '\/admin'\)/.test(readFileSync(resolve(root, 'src/lib/auth/role-policy.test.ts'), 'utf8')), 'role policy tests must lock admin role out of /admin nav')
assert(
  /ผู้ใช้/.test(adminSource) &&
    /ทีม/.test(adminSource) &&
    /สิทธิ์พิเศษ/.test(adminSource) &&
    /ข้อมูลหลัก/.test(adminSource) &&
    /ตั้งค่า/.test(adminSource) &&
    /\/admin\/capabilities/.test(adminShellSource) &&
    /\/admin\/master-data/.test(adminShellSource),
  'admin must render active round-1 system-management sections',
)
assert(/การเปลี่ยนสิทธิ์ ทีม หรือสถานะมีผลกับการเข้าใช้ระบบทันที/.test(adminUsersSource), 'admin must show permission-impact warning')
assert(/ยืนยัน/.test(adminUsersSource) && /มีผล/.test(adminUsersSource), 'admin risky actions must use Thai confirmation copy naming consequences')
assert(!/\/admin\/audit|Audit/.test(adminSource + adminShellSource + rolePolicySource), 'admin audit must stay deferred in round 1')
assert(!/Dashboard|แดชบอร์ด|demo|Demo|MVP/.test(adminSource + contactsSource + navigationSource), 'F4 pages/nav must not include Dashboard/demo/MVP copy')

console.log('Contacts/Admin redesign assertions passed ✓')

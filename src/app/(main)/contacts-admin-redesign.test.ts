import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message)
}

const root = process.cwd()
const contactsSource = readFileSync(resolve(root, 'src/app/(main)/contacts/page.tsx'), 'utf8')
const adminSource = readFileSync(resolve(root, 'src/app/(main)/admin/page.tsx'), 'utf8')
const rolePolicySource = readFileSync(resolve(root, 'src/lib/auth/role-policy.ts'), 'utf8')
const navigationSource = readFileSync(resolve(root, 'src/config/navigation.tsx'), 'utf8')

// /contacts Requirement C/D: all roles can view; viewer keeps call/copy/detail only;
// mobile cards are call-first and no squeezed table below md.
assert(/Title:\s*`?สมุดโทรศัพท์|สมุดโทรศัพท์/.test(contactsSource), '/contacts must use Thai title สมุดโทรศัพท์')
assert(/placeholder=\"ค้นหาชื่อ, เบอร์โทร, ทีม\/หน่วยงาน, ตำแหน่ง\"/.test(contactsSource), 'contacts search placeholder must cover name, phone, organization/team, position')
assert(/ทีมของฉัน/.test(contactsSource) && /ทุกทีมที่มองเห็นได้/.test(contactsSource) && /รายการโปรด\/ใช้บ่อย/.test(contactsSource), 'contacts must expose Requirement C filter chips')
assert(/บุคลากรภายใน/.test(contactsSource) && /หน่วยงานภายนอก/.test(contactsSource) && /เบอร์ฉุกเฉิน\/สำคัญ/.test(contactsSource), 'contacts must expose Requirement C contact type filters')
assert(/function phoneHref[\s\S]{0,120}tel:\$\{phoneNumber\.replace/.test(contactsSource) && /href=\{phoneHref\(entry\.phoneNumber\)\}/.test(contactsSource), 'contact cards/rows must use sanitized tel: links for call action')
assert(/คัดลอกเบอร์โทร/.test(contactsSource) && /คัดลอกเบอร์โทรแล้ว/.test(contactsSource), 'contacts must support copy phone feedback')
assert(/ดูรายละเอียด/.test(contactsSource), 'contacts must provide detail drawer/sheet action')
assert(/md:hidden/.test(contactsSource) && /hidden md:block/.test(contactsSource), 'contacts mobile must use cards and desktop can use table')
assert(!/viewer[\s\S]{0,160}(แก้ไข|ลบ|เพิ่มรายชื่อ)/.test(contactsSource), 'viewer path must not expose add/edit/delete actions')

// /admin Requirement C/D: super_admin only, tabs are users/teams/capability/audit,
// risky changes must have Thai confirmation copy, audit is read-only.
assert(/canAccessAdminConsole\(role[^)]*\)[\s\S]{0,120}return isSystemAdmin\(role\)/.test(rolePolicySource), 'admin console must be super_admin only')
assert(/!canAccessMainNavigationItem\('admin', '\/admin'\)/.test(readFileSync(resolve(root, 'src/lib/auth/role-policy.test.ts'), 'utf8')), 'role policy tests must lock admin role out of /admin nav')
assert(/ผู้ใช้/.test(adminSource) && /ทีม/.test(adminSource) && /สิทธิ์\/Capability/.test(adminSource) && /Audit/.test(adminSource), 'admin must render users/teams/capability/audit tabs')
assert(/การเปลี่ยนสิทธิ์มีผลต่อการเข้าถึงเมนูและการทำงานของผู้ใช้/.test(adminSource), 'admin must show permission-impact warning')
assert(/ยืนยัน/.test(adminSource) && /มีผลต่อ/.test(adminSource), 'admin risky actions must use Thai confirmation copy naming consequences')
assert(/Audit[\s\S]{0,600}readOnly|อ่านอย่างเดียว/.test(adminSource), 'admin audit tab must be read-only')
assert(!/Dashboard|แดชบอร์ด|demo|Demo|MVP/.test(adminSource + contactsSource + navigationSource), 'F4 pages/nav must not include Dashboard/demo/MVP copy')

console.log('Contacts/Admin redesign assertions passed ✓')

import type { UserRole } from '@/types/auth'
import type { PlanFile } from '@/types/monthly-plan'

export type MonthlyPlanCapability = 'can_manage_own_team_monthly_plan' | 'can_upload_approved_monthly_plan'
export type MonthlyPlanTabId = 'own-team' | 'overview' | 'upload-approved'

export interface MonthlyPlanUserContext {
  role: UserRole | null | undefined
  teamId: number | null | undefined
  capabilities?: readonly string[] | null
}

export interface MonthlyPlanTeamOption {
  id: number
  name: string
}

export interface MonthlyPlanPageModelInput {
  user: MonthlyPlanUserContext
  approvedFile: PlanFile | null
  ownTeamPlans: PlanFile[]
  otherTeamPlans: PlanFile[]
  teams: MonthlyPlanTeamOption[]
}

export interface MonthlyPlanActionModel {
  visible: boolean
  enabled: boolean
  reason?: string
}

export interface MonthlyPlanOverviewRow {
  file: PlanFile
  teamName: string
  canPreview: boolean
  canDownload: boolean
  canEdit: boolean
  canDelete: boolean
}

export interface MonthlyPlanPageModel {
  header: {
    title: 'แผนประจำเดือน'
    showTeamFilter: boolean
    scopeText: string
  }
  tabs: { id: MonthlyPlanTabId; label: string }[]
  primaryActions: {
    addOwnTeamPlan: MonthlyPlanActionModel
    uploadApprovedFile: MonthlyPlanActionModel
  }
  approvedFile: {
    file: PlanFile | null
    statusText: string
    emptyText: string
    viewerHint: string | null
    actions: {
      preview: MonthlyPlanActionModel
      download: MonthlyPlanActionModel
      replace: MonthlyPlanActionModel
      upload: MonthlyPlanActionModel
    }
  }
  ownTeamRows: MonthlyPlanOverviewRow[]
  overviewRows: MonthlyPlanOverviewRow[]
  uploadSummary: {
    selectedMonthText: string
    submittedTeamPlanCount: number
    includedInApprovedCount: number
  }
}

function hasCapability(user: MonthlyPlanUserContext, capability: MonthlyPlanCapability): boolean {
  return (user.capabilities ?? []).includes(capability)
}

export function canUploadApprovedMonthlyPlan(user: MonthlyPlanUserContext): boolean {
  if (user.role === 'super_admin') return true
  if (user.role === 'viewer') return false
  return (user.role === 'team_lead' || user.role === 'user') &&
    hasCapability(user, 'can_upload_approved_monthly_plan')
}

export function canManageOwnTeamMonthlyPlan(user: MonthlyPlanUserContext): boolean {
  if (user.role === 'super_admin') return true
  if (user.role === 'viewer') return false
  if (user.teamId == null) return false
  if (user.role === 'team_lead') return true
  if (user.role === 'user') return hasCapability(user, 'can_manage_own_team_monthly_plan')
  return false
}

export function canViewMonthlyPlanOverview(user: MonthlyPlanUserContext): boolean {
  if (user.role === 'super_admin' || user.role === 'viewer' || user.role === 'team_lead') return true
  return hasCapability(user, 'can_upload_approved_monthly_plan')
}

export function isPreviewableApprovedFile(file: PlanFile | null): boolean {
  if (!file) return false
  const name = file.fileName.toLowerCase()
  return name.endsWith('.pdf') || name.endsWith('.png') || name.endsWith('.jpg') || name.endsWith('.jpeg') || name.endsWith('.webp')
}

export function canPreviewApprovedFile(user: MonthlyPlanUserContext, file: PlanFile | null): boolean {
  if (!file) return false
  if (user.role === 'viewer') return isPreviewableApprovedFile(file)
  return canUploadApprovedMonthlyPlan(user)
}

export function canDownloadApprovedFile(user: MonthlyPlanUserContext, file: PlanFile | null): boolean {
  if (!file) return false
  return user.role !== 'viewer'
}

function action(visible: boolean, enabled = visible, reason?: string): MonthlyPlanActionModel {
  return { visible, enabled, reason: !enabled && reason ? reason : undefined }
}

function teamNameFor(file: PlanFile, teams: MonthlyPlanTeamOption[], fallback = 'ไม่ระบุทีม'): string {
  if (file.team?.name) return file.team.name
  const found = teams.find((team) => team.id === file.teamId)
  if (found) return found.name
  return file.teamId == null ? fallback : `ทีม #${file.teamId}`
}

function buildRows(
  files: PlanFile[],
  user: MonthlyPlanUserContext,
  teams: MonthlyPlanTeamOption[],
  scope: 'own' | 'overview',
): MonthlyPlanOverviewRow[] {
  const canManageOwn = canManageOwnTeamMonthlyPlan(user)
  const isSuperAdmin = user.role === 'super_admin'
  return files.filter((file) => !file.isDeleted).map((file) => {
    const isOwnTeam = user.teamId != null && file.teamId === user.teamId
    const canManageThis = isSuperAdmin || (scope === 'own' && isOwnTeam && canManageOwn)
    return {
      file,
      teamName: teamNameFor(file, teams),
      canPreview: true,
      canDownload: isSuperAdmin || (scope === 'own' && isOwnTeam && user.role !== 'viewer'),
      canEdit: canManageThis,
      canDelete: canManageThis,
    }
  })
}

export function buildMonthlyPlanPageModel(input: MonthlyPlanPageModelInput): MonthlyPlanPageModel {
  const { user, approvedFile, ownTeamPlans, otherTeamPlans, teams } = input
  const canManageOwn = canManageOwnTeamMonthlyPlan(user)
  const canUploadApproved = canUploadApprovedMonthlyPlan(user)
  const canOverview = canViewMonthlyPlanOverview(user)
  const tabs: MonthlyPlanPageModel['tabs'] = [{ id: 'own-team', label: 'แผนทีมของฉัน' }]
  if (canOverview) tabs.push({ id: 'overview', label: 'แผนทีมอื่น / ภาพรวม' })
  if (canUploadApproved) tabs.push({ id: 'upload-approved', label: 'อัปโหลดไฟล์อนุมัติ' })

  const isViewer = user.role === 'viewer'
  const allTeamPlans = [...ownTeamPlans, ...otherTeamPlans].filter((file) => !file.isDeleted)
  const includedInApprovedCount = approvedFile && !approvedFile.isDeleted ? 1 : 0

  return {
    header: {
      title: 'แผนประจำเดือน',
      showTeamFilter: user.role === 'super_admin',
      scopeText: user.role === 'super_admin' ? 'เห็นทุกทีม' : user.role === 'viewer' ? 'อ่านอย่างเดียว' : 'ล็อกตามทีมของคุณ',
    },
    tabs,
    primaryActions: {
      addOwnTeamPlan: canManageOwn ? action(true) : action(false, false, 'ไม่มีสิทธิ์'),
      uploadApprovedFile: canUploadApproved ? action(true) : action(false, false, 'ไม่มีสิทธิ์'),
    },
    approvedFile: {
      file: approvedFile,
      statusText: approvedFile ? 'มีไฟล์อนุมัติแล้ว' : 'ยังไม่มีไฟล์อนุมัติ',
      emptyText: 'ยังไม่มีไฟล์อนุมัติประจำเดือนนี้',
      viewerHint: isViewer ? 'ดูตัวอย่างได้เฉพาะไฟล์ PDF/รูปภาพ และไม่มีสิทธิ์ดาวน์โหลด' : null,
      actions: {
        preview: action(!!approvedFile && (isViewer || canUploadApproved)),
        download: action(canDownloadApprovedFile(user, approvedFile)),
        replace: action(!!approvedFile && canUploadApproved),
        upload: action(!approvedFile && canUploadApproved),
      },
    },
    ownTeamRows: buildRows(ownTeamPlans, user, teams, 'own'),
    overviewRows: buildRows(otherTeamPlans, user, teams, 'overview'),
    uploadSummary: {
      selectedMonthText: 'เดือนที่เลือก',
      submittedTeamPlanCount: allTeamPlans.length,
      includedInApprovedCount,
    },
  }
}

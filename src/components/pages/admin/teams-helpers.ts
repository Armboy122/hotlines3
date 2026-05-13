import type { ContactDirectoryEntry } from '@/types/contact-directory'
import type { Team } from '@/types/query-types'

export interface TeamMemberSummary {
  teamId: number
  totalCount: number
  activeCount: number
  inactiveCount: number
  leadNames: string[]
  memberNames: string[]
}

const getDisplayName = (member: ContactDirectoryEntry): string => {
  const name = member.displayName?.trim() || member.username.trim()
  return name || `ผู้ใช้ #${member.id}`
}

export function buildTeamMemberSummaries(
  teams: readonly Team[],
  members: readonly ContactDirectoryEntry[],
): Map<number, TeamMemberSummary> {
  const summaries = new Map<number, TeamMemberSummary>()

  for (const team of teams) {
    summaries.set(team.id, {
      teamId: team.id,
      totalCount: 0,
      activeCount: 0,
      inactiveCount: 0,
      leadNames: [],
      memberNames: [],
    })
  }

  for (const member of members) {
    if (member.teamId == null) continue

    const summary = summaries.get(member.teamId) ?? {
      teamId: member.teamId,
      totalCount: 0,
      activeCount: 0,
      inactiveCount: 0,
      leadNames: [],
      memberNames: [],
    }

    summary.totalCount += 1
    if (member.isActive) summary.activeCount += 1
    else summary.inactiveCount += 1

    const displayName = getDisplayName(member)
    summary.memberNames.push(displayName)
    if (member.role === 'team_lead') summary.leadNames.push(displayName)

    summaries.set(member.teamId, summary)
  }

  return summaries
}

export function filterTeamsByQuery(teams: readonly Team[], query: string): Team[] {
  const normalized = query.trim().toLocaleLowerCase('th-TH')
  if (!normalized) return [...teams]

  return teams.filter((team) =>
    team.name.toLocaleLowerCase('th-TH').includes(normalized) ||
    String(team.id).includes(normalized),
  )
}

export function validateTeamName(name: string): { valid: boolean; message?: string } {
  const normalized = name.trim()
  if (!normalized) return { valid: false, message: 'กรุณากรอกชื่อทีม' }
  if (normalized.length < 3) return { valid: false, message: 'ชื่อทีมต้องมีอย่างน้อย 3 ตัวอักษร' }
  if (normalized.length > 120) return { valid: false, message: 'ชื่อทีมต้องไม่เกิน 120 ตัวอักษร' }
  return { valid: true }
}

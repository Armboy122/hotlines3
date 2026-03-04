'use client'

import { Wrench } from 'lucide-react'
import type { PlanFile, TeamSubmissionStatus } from '@/types/monthly-plan'
import { SubmissionStatusBadge } from './SubmissionStatusBadge'
import { PlanFileRow } from './PlanFileRow'
import { SoftDeletedSection } from './SoftDeletedSection'

interface TeamFilesGroupProps {
  submission: TeamSubmissionStatus
  teamFiles: PlanFile[]
  currentUserTeamId: number | null
  isAdmin: boolean
  isPeriodLocked: boolean
  onSoftDelete: (fileId: number) => void
  onHardDelete: (fileId: number) => void
  onRestore: (fileId: number) => void
}

export function TeamFilesGroup({
  submission,
  teamFiles,
  currentUserTeamId,
  isAdmin,
  isPeriodLocked,
  onSoftDelete,
  onHardDelete,
  onRestore,
}: TeamFilesGroupProps) {
  const isOwnTeam = currentUserTeamId === submission.team.id
  const activeFiles = teamFiles.filter((f) => !f.isDeleted)
  const deletedFiles = teamFiles.filter((f) => f.isDeleted)

  return (
    <div className="card-glass rounded-2xl p-4 sm:p-5 space-y-3">
      {/* Team header */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 icon-glass-green">
            <Wrench className="h-4 w-4 text-emerald-600" />
          </div>
          <span className="text-base font-bold text-gray-800">{submission.team.name}</span>
        </div>
        <SubmissionStatusBadge status={submission.status} size="sm" />
      </div>

      {/* Active files */}
      {activeFiles.length > 0 ? (
        <div className="space-y-2">
          {activeFiles.map((file) => (
            <PlanFileRow
              key={file.id}
              file={file}
              canDownload={isAdmin || isOwnTeam}
              canSoftDelete={!isPeriodLocked && (isAdmin || isOwnTeam)}
              canHardDelete={isAdmin}
              canRestore={false}
              onSoftDelete={onSoftDelete}
              onHardDelete={onHardDelete}
              onRestore={onRestore}
            />
          ))}
        </div>
      ) : (
        <p className="text-sm text-gray-400 italic py-2">ยังไม่มีไฟล์</p>
      )}

      {/* Soft deleted files (admin or own team) */}
      {(isAdmin || isOwnTeam) && deletedFiles.length > 0 && (
        <SoftDeletedSection
          files={deletedFiles}
          canHardDelete={isAdmin}
          canRestore={isAdmin}
          onHardDelete={onHardDelete}
          onRestore={onRestore}
        />
      )}
    </div>
  )
}

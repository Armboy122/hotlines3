'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Edit, Loader2, Plus, Search, ShieldCheck, Trash2, Users } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { TeamForm } from '@/components/forms/team-form'
import { useContactDirectory, useTeams } from '@/hooks/useQueries'
import { useDeleteTeam } from '@/hooks'
import { buildTeamMemberSummaries, filterTeamsByQuery } from './teams-helpers'
import type { Team } from '@/types/query-types'

export default function TeamsClient() {
  const [query, setQuery] = useState('')
  const [editingTeam, setEditingTeam] = useState<Team | null>(null)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<Team | null>(null)

  const { data: teams = [], isLoading, error, refetch } = useTeams()
  const {
    data: contacts = [],
    isLoading: isLoadingContacts,
    error: contactError,
  } = useContactDirectory({ includeInactive: true, limit: 1000 })
  const deleteMutation = useDeleteTeam()

  const memberSummaries = useMemo(() => buildTeamMemberSummaries(teams, contacts), [teams, contacts])
  const visibleTeams = useMemo(() => filterTeamsByQuery(teams, query), [teams, query])

  const handleDelete = async () => {
    if (!deleteTarget) return
    await deleteMutation.mutateAsync(deleteTarget.id.toString())
    setDeleteTarget(null)
  }

  const closeForms = () => {
    setIsCreateDialogOpen(false)
    setEditingTeam(null)
  }

  if (error) {
    return (
      <div className="mx-auto w-full max-w-7xl px-3 py-4 pb-28 sm:px-5 sm:py-6 md:pb-10 lg:px-8">
        <Card className="border-red-100 bg-white/80 shadow-sm">
          <CardContent className="space-y-4 py-8 text-center">
            <p className="font-medium text-red-600">เกิดข้อผิดพลาด: {error.message}</p>
            <Button onClick={() => refetch()} className="rounded-2xl bg-emerald-600 hover:bg-emerald-700">
              ลองใหม่
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="mx-auto w-full max-w-7xl px-3 py-4 pb-28 sm:px-5 sm:py-6 md:pb-10 lg:px-8">
      <div className="mb-6 rounded-3xl bg-gradient-to-br from-emerald-500 via-emerald-600 to-emerald-800 p-5 text-white shadow-2xl shadow-emerald-500/20 sm:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-3">
            <Button asChild variant="outline" className="min-h-11 w-fit rounded-2xl border-white/30 bg-white/15 text-white hover:bg-white/25 hover:text-white">
              <Link href="/admin">
                <ArrowLeft className="h-4 w-4" />
                กลับจัดการระบบ
              </Link>
            </Button>
            <div>
              <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-sm font-semibold text-emerald-50 ring-1 ring-white/20">
                <ShieldCheck className="h-4 w-4" />
                สิทธิ์ Super Admin
              </div>
              <h1 className="text-2xl font-black tracking-tight sm:text-3xl">ทีมงาน</h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-emerald-50 sm:text-base">
                จัดการรายชื่อทีมสำหรับงานภาคสนาม และตรวจสอบจำนวนสมาชิกจากสมุดโทรศัพท์ของระบบ
              </p>
            </div>
          </div>

          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="min-h-11 rounded-2xl bg-white text-emerald-700 shadow-lg shadow-emerald-950/10 hover:bg-emerald-50">
                <Plus className="h-4 w-4" />
                เพิ่มทีมใหม่
              </Button>
            </DialogTrigger>
            <DialogContent className="max-h-[92dvh] w-[calc(100vw-1rem)] overflow-y-auto rounded-3xl sm:w-full sm:max-w-lg">
              <DialogHeader>
                <DialogTitle>เพิ่มทีมใหม่</DialogTitle>
              </DialogHeader>
              <TeamForm onSuccess={closeForms} />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="mb-5 grid grid-cols-1 gap-3 md:grid-cols-[1fr_auto] md:items-center">
        <label className="relative block">
          <span className="sr-only">ค้นหาทีม</span>
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="ค้นหาชื่อทีม"
            className="min-h-11 rounded-2xl border-emerald-100 bg-white pl-11 shadow-sm"
          />
        </label>
        <div className="flex flex-wrap gap-2 text-sm text-gray-600 md:justify-end">
          <Badge variant="outline" className="border-emerald-200 bg-white px-3 py-1 text-emerald-700">
            ทีมทั้งหมด {teams.length} ทีม
          </Badge>
          <Badge variant="outline" className="border-emerald-200 bg-white px-3 py-1 text-emerald-700">
            สมาชิกที่แสดง {contacts.length} คน
          </Badge>
        </div>
      </div>

      {contactError && (
        <div className="mb-4 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          ไม่สามารถโหลดจำนวนสมาชิกจากสมุดโทรศัพท์ได้ในขณะนี้ แต่ยังสามารถจัดการทีมได้ตามปกติ
        </div>
      )}

      {isLoading ? (
        <div className="flex min-h-52 items-center justify-center rounded-3xl border border-emerald-100 bg-white/80 text-gray-600 shadow-sm">
          <Loader2 className="mr-2 h-6 w-6 animate-spin text-emerald-600" />
          กำลังโหลดทีมงาน...
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 lg:hidden">
            {visibleTeams.map((team) => {
              const summary = memberSummaries.get(team.id)
              return (
                <TeamCard
                  key={team.id}
                  team={team}
                  activeCount={summary?.activeCount ?? 0}
                  totalCount={summary?.totalCount ?? 0}
                  leadNames={summary?.leadNames ?? []}
                  isLoadingContacts={isLoadingContacts}
                  onEdit={() => setEditingTeam(team)}
                  onDelete={() => setDeleteTarget(team)}
                />
              )
            })}
          </div>

          <Card className="hidden overflow-hidden border-emerald-100 bg-white/90 shadow-sm lg:block">
            <CardContent className="p-0">
              <table className="w-full table-fixed text-left">
                <thead className="bg-emerald-50 text-sm text-emerald-900">
                  <tr>
                    <th className="w-[34%] px-5 py-4 font-bold">ทีมงาน</th>
                    <th className="w-[20%] px-5 py-4 font-bold">สมาชิก</th>
                    <th className="w-[28%] px-5 py-4 font-bold">หัวหน้าทีม</th>
                    <th className="w-[18%] px-5 py-4 text-right font-bold">การจัดการ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-emerald-50 text-sm">
                  {visibleTeams.map((team) => {
                    const summary = memberSummaries.get(team.id)
                    return (
                      <tr key={team.id} className="hover:bg-emerald-50/50">
                        <td className="px-5 py-4">
                          <div className="font-bold text-gray-900">{team.name}</div>
                          <div className="text-xs text-gray-500">รหัสทีม {team.id}</div>
                        </td>
                        <td className="px-5 py-4 text-gray-700">
                          {isLoadingContacts ? 'กำลังโหลด...' : `${summary?.activeCount ?? 0} ใช้งาน / ${summary?.totalCount ?? 0} ทั้งหมด`}
                        </td>
                        <td className="px-5 py-4 text-gray-700">
                          {summary?.leadNames.length ? summary.leadNames.join(', ') : 'ยังไม่มีข้อมูล'}
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex justify-end gap-2">
                            <Button variant="outline" size="sm" className="min-h-10 rounded-xl bg-white" onClick={() => setEditingTeam(team)}>
                              <Edit className="h-4 w-4" />
                              แก้ไข
                            </Button>
                            <Button variant="destructive" size="sm" className="min-h-10 rounded-xl" onClick={() => setDeleteTarget(team)}>
                              <Trash2 className="h-4 w-4" />
                              ลบ
                            </Button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </CardContent>
          </Card>

          {visibleTeams.length === 0 && (
            <div className="rounded-3xl border border-dashed border-emerald-200 bg-white/70 py-10 text-center text-gray-500 shadow-sm">
              ไม่พบทีมงานที่ตรงกับคำค้นหา
            </div>
          )}
        </>
      )}

      <Dialog open={!!editingTeam} onOpenChange={(open) => !open && setEditingTeam(null)}>
        <DialogContent className="max-h-[92dvh] w-[calc(100vw-1rem)] overflow-y-auto rounded-3xl sm:w-full sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>แก้ไขทีมงาน</DialogTitle>
          </DialogHeader>
          {editingTeam && (
            <TeamForm
              initialData={{ id: editingTeam.id.toString(), name: editingTeam.name }}
              onSuccess={closeForms}
            />
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <DialogContent className="w-[calc(100vw-1rem)] rounded-3xl sm:w-full sm:max-w-md">
          <DialogHeader>
            <DialogTitle>ยืนยันการลบทีม</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm leading-6 text-gray-600">
              ต้องการลบทีม <span className="font-bold text-gray-900">{deleteTarget?.name}</span> ใช่หรือไม่ การดำเนินการนี้ควรทำเฉพาะเมื่อแน่ใจว่าไม่มีการใช้งานทีมนี้แล้ว
            </p>
            <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <Button variant="outline" className="min-h-11 rounded-2xl" onClick={() => setDeleteTarget(null)} disabled={deleteMutation.isPending}>
                ยกเลิก
              </Button>
              <Button variant="destructive" className="min-h-11 rounded-2xl" onClick={handleDelete} disabled={deleteMutation.isPending}>
                {deleteMutation.isPending ? 'กำลังลบ...' : 'ยืนยันลบทีม'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function TeamCard({
  team,
  activeCount,
  totalCount,
  leadNames,
  isLoadingContacts,
  onEdit,
  onDelete,
}: {
  team: Team
  activeCount: number
  totalCount: number
  leadNames: string[]
  isLoadingContacts: boolean
  onEdit: () => void
  onDelete: () => void
}) {
  return (
    <Card className="card-glass border-emerald-100 shadow-sm">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 space-y-1">
            <CardTitle className="break-words text-lg font-black text-gray-900">{team.name}</CardTitle>
            <p className="text-xs text-gray-500">รหัสทีม {team.id}</p>
          </div>
          <div className="rounded-2xl bg-emerald-100 p-3 text-emerald-700">
            <Users className="h-5 w-5" />
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 gap-2 text-sm text-gray-700 sm:grid-cols-2">
          <div className="rounded-2xl bg-white/80 p-3">
            <div className="text-xs font-semibold text-gray-500">สมาชิก</div>
            <div className="font-bold text-gray-900">
              {isLoadingContacts ? 'กำลังโหลด...' : `${activeCount} ใช้งาน / ${totalCount} ทั้งหมด`}
            </div>
          </div>
          <div className="rounded-2xl bg-white/80 p-3">
            <div className="text-xs font-semibold text-gray-500">หัวหน้าทีม</div>
            <div className="font-bold text-gray-900">{leadNames.length ? leadNames.join(', ') : 'ยังไม่มีข้อมูล'}</div>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <Button variant="outline" className="min-h-11 rounded-2xl bg-white" onClick={onEdit}>
            <Edit className="h-4 w-4" />
            แก้ไข
          </Button>
          <Button variant="destructive" className="min-h-11 rounded-2xl" onClick={onDelete}>
            <Trash2 className="h-4 w-4" />
            ลบ
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

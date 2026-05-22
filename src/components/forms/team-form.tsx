'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useCreateTeam, useUpdateTeam } from '@/hooks'
import type { CreateTeamData, UpdateTeamData } from '@/lib/services/team.service'
import { validateTeamName } from '@/components/pages/admin/teams-helpers'

interface TeamFormProps {
  initialData?: {
    id: string
    name: string
  }
  onSuccess?: () => void
}

export function TeamForm({ initialData, onSuccess }: TeamFormProps) {
  const [name, setName] = useState(initialData?.name ?? '')
  const [error, setError] = useState<string | null>(null)

  const createMutation = useCreateTeam()
  const updateMutation = useUpdateTeam()
  const isPending = createMutation.isPending || updateMutation.isPending

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const validation = validateTeamName(name)
    if (!validation.valid) {
      setError(validation.message ?? 'กรุณาตรวจสอบชื่อทีม')
      return
    }

    setError(null)
    const payload: CreateTeamData = { name: name.trim() }

    if (initialData) {
      await updateMutation.mutateAsync({ ...payload, id: initialData.id } satisfies UpdateTeamData)
    } else {
      await createMutation.mutateAsync(payload)
      setName('')
    }

    onSuccess?.()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="space-y-2">
        <Label htmlFor="team-name">ชื่อทีม *</Label>
        <Input
          id="team-name"
          value={name}
          onChange={(event) => {
            setName(event.target.value)
            if (error) setError(null)
          }}
          placeholder="เช่น ทีมฮอตไลน์ 1"
          className="min-h-11 rounded-2xl bg-white"
          disabled={isPending}
          autoFocus
        />
        <p className="text-xs text-gray-500">ใช้ชื่อที่ตรงกับทีมงานจริงในระบบงานภาคสนาม</p>
        {error && <p className="text-sm font-medium text-red-600">{error}</p>}
      </div>

      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <Button
          type="submit"
          disabled={isPending}
          className="min-h-11 rounded-2xl bg-blue-600 px-5 text-white hover:bg-blue-700"
        >
          {isPending ? 'กำลังบันทึก...' : initialData ? 'บันทึกการแก้ไข' : 'เพิ่มทีม'}
        </Button>
      </div>
    </form>
  )
}

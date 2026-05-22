import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { contactDirectoryService } from '@/lib/services/contact-directory.service'
import type { CreateExternalContactRequest, UpdateContactRequest } from '@/types/contact-directory'

// ── Create external contact ─────────────────────────────────
export function useCreateExternalContact() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateExternalContactRequest) => contactDirectoryService.createExternalContact(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contactDirectory'] })
      toast.success('เพิ่มเบอร์ติดต่อหน่วยงานอื่นสำเร็จ')
    },
    onError: (error: Error) => {
      toast.error('เกิดข้อผิดพลาด: ' + error.message)
    },
  })
}

// ── Update own contact ──────────────────────────────────────
export function useUpdateOwnContact() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: UpdateContactRequest) => contactDirectoryService.updateOwnContact(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contactDirectory'] })
      toast.success('อัปเดตข้อมูลติดต่อสำเร็จ')
    },
    onError: (error: Error) => {
      toast.error('เกิดข้อผิดพลาด: ' + error.message)
    },
  })
}

// ── Update any contact (super_admin only) ───────────────────
export function useUpdateAnyContact() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ userId, data }: { userId: number; data: UpdateContactRequest }) =>
      contactDirectoryService.updateContact(userId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contactDirectory'] })
      toast.success('อัปเดตข้อมูลติดต่อสำเร็จ')
    },
    onError: (error: Error) => {
      toast.error('เกิดข้อผิดพลาด: ' + error.message)
    },
  })
}

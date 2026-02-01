import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createTeam, updateTeam, deleteTeam } from '@/lib/actions/team';
import type { CreateTeamData, UpdateTeamData } from '@/lib/actions/team';
import { toast } from 'sonner';

// TODO: [EXTERNAL-API] อนาคต: แก้ไข hooks ให้เรียก External API แทน server actions

export function useCreateTeam() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateTeamData) => {
      const result = await createTeam(data);
      if (!result.success) {
        throw new Error(result.error || 'Failed to create team');
      }
      return result.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teams'] });
      toast.success('สร้างทีมสำเร็จ');
    },
    onError: (error: Error) => {
      toast.error('เกิดข้อผิดพลาด: ' + error.message);
    },
  });
}

export function useUpdateTeam() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: UpdateTeamData) => {
      const result = await updateTeam(data);
      if (!result.success) {
        throw new Error(result.error || 'Failed to update team');
      }
      return result.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teams'] });
      toast.success('อัปเดตทีมสำเร็จ');
    },
    onError: (error: Error) => {
      toast.error('เกิดข้อผิดพลาด: ' + error.message);
    },
  });
}

export function useDeleteTeam() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const result = await deleteTeam(id);
      if (!result.success) {
        throw new Error(result.error || 'Failed to delete team');
      }
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teams'] });
      toast.success('ลบทีมสำเร็จ');
    },
    onError: (error: Error) => {
      toast.error('เกิดข้อผิดพลาด: ' + error.message);
    },
  });
}

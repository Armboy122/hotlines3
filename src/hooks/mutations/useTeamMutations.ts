import { useMutation, useQueryClient } from '@tanstack/react-query';
import { teamService } from '@/lib/services/team.service';
import type { CreateTeamData, UpdateTeamData } from '@/lib/services/team.service';
import type { Team } from '@/types/query-types';
import { queryKeys } from '@/hooks/useQueries';
import { toast } from 'sonner';

type TeamQueryClient = {
  setQueryData: (queryKey: readonly unknown[], updater: (old: Team[] | undefined) => Team[] | undefined) => unknown;
  invalidateQueries: (args: { queryKey: readonly unknown[]; refetchType?: 'active' | 'all' | 'inactive' | 'none' }) => unknown;
};

export function removeDeletedTeamFromCache(queryClient: TeamQueryClient, id: string) {
  const deletedID = Number(id);
  queryClient.setQueryData(queryKeys.teams, (old) => old?.filter((team) => team.id !== deletedID));
  queryClient.invalidateQueries({ queryKey: queryKeys.teams, refetchType: 'active' });
}

export function useCreateTeam() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateTeamData) => teamService.create(data),
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
    mutationFn: (data: UpdateTeamData) => teamService.update(data),
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
    mutationFn: (id: string) => teamService.delete(id),
    onSuccess: (_data, id) => {
      removeDeletedTeamFromCache(queryClient, id);
      toast.success('ลบทีมสำเร็จ');
    },
    onError: (error: Error) => {
      toast.error('เกิดข้อผิดพลาด: ' + error.message);
    },
  });
}

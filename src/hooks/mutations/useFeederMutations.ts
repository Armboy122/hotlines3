import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createFeeder, updateFeeder, deleteFeeder } from '@/lib/actions/feeder';
import type { CreateFeederData, UpdateFeederData } from '@/lib/actions/feeder';
import { toast } from 'sonner';

// TODO: [EXTERNAL-API] อนาคต: แก้ไข hooks ให้เรียก External API แทน server actions

export function useCreateFeeder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateFeederData) => {
      const result = await createFeeder(data);
      if (!result.success) {
        throw new Error(result.error || 'Failed to create feeder');
      }
      return result.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feeders'] });
      toast.success('สร้าง Feeder สำเร็จ');
    },
    onError: (error: Error) => {
      toast.error('เกิดข้อผิดพลาด: ' + error.message);
    },
  });
}

export function useUpdateFeeder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: UpdateFeederData) => {
      const result = await updateFeeder(data);
      if (!result.success) {
        throw new Error(result.error || 'Failed to update feeder');
      }
      return result.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feeders'] });
      toast.success('อัปเดต Feeder สำเร็จ');
    },
    onError: (error: Error) => {
      toast.error('เกิดข้อผิดพลาด: ' + error.message);
    },
  });
}

export function useDeleteFeeder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const result = await deleteFeeder(id);
      if (!result.success) {
        throw new Error(result.error || 'Failed to delete feeder');
      }
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feeders'] });
      toast.success('ลบ Feeder สำเร็จ');
    },
    onError: (error: Error) => {
      toast.error('เกิดข้อผิดพลาด: ' + error.message);
    },
  });
}

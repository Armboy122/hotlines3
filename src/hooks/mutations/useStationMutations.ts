import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createStation, updateStation, deleteStation } from '@/lib/actions/station';
import type { CreateStationData, UpdateStationData } from '@/lib/actions/station';
import { toast } from 'sonner';

// TODO: [EXTERNAL-API] อนาคต: แก้ไข hooks ให้เรียก External API แทน server actions

export function useCreateStation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateStationData) => {
      const result = await createStation(data);
      if (!result.success) {
        throw new Error(result.error || 'Failed to create station');
      }
      return result.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stations'] });
      toast.success('สร้างสถานีสำเร็จ');
    },
    onError: (error: Error) => {
      toast.error('เกิดข้อผิดพลาด: ' + error.message);
    },
  });
}

export function useUpdateStation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: UpdateStationData) => {
      const result = await updateStation(data);
      if (!result.success) {
        throw new Error(result.error || 'Failed to update station');
      }
      return result.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stations'] });
      toast.success('อัปเดตสถานีสำเร็จ');
    },
    onError: (error: Error) => {
      toast.error('เกิดข้อผิดพลาด: ' + error.message);
    },
  });
}

export function useDeleteStation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const result = await deleteStation(id);
      if (!result.success) {
        throw new Error(result.error || 'Failed to delete station');
      }
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stations'] });
      toast.success('ลบสถานีสำเร็จ');
    },
    onError: (error: Error) => {
      toast.error('เกิดข้อผิดพลาด: ' + error.message);
    },
  });
}

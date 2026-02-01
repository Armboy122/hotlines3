import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createPea, updatePea, deletePea, createMultiplePeas } from '@/lib/actions/pea';
import type { CreatePeaData, UpdatePeaData } from '@/lib/actions/pea';
import { toast } from 'sonner';

// TODO: [EXTERNAL-API] อนาคต: แก้ไข hooks ให้เรียก External API แทน server actions

export function useCreatePea() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreatePeaData) => {
      const result = await createPea(data);
      if (!result.success) {
        throw new Error(result.error || 'Failed to create pea');
      }
      return result.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['peas'] });
      toast.success('สร้าง PEA สำเร็จ');
    },
    onError: (error: Error) => {
      toast.error('เกิดข้อผิดพลาด: ' + error.message);
    },
  });
}

export function useUpdatePea() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: UpdatePeaData) => {
      const result = await updatePea(data);
      if (!result.success) {
        throw new Error(result.error || 'Failed to update pea');
      }
      return result.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['peas'] });
      toast.success('อัปเดต PEA สำเร็จ');
    },
    onError: (error: Error) => {
      toast.error('เกิดข้อผิดพลาด: ' + error.message);
    },
  });
}

export function useDeletePea() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const result = await deletePea(id);
      if (!result.success) {
        throw new Error(result.error || 'Failed to delete pea');
      }
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['peas'] });
      toast.success('ลบ PEA สำเร็จ');
    },
    onError: (error: Error) => {
      toast.error('เกิดข้อผิดพลาด: ' + error.message);
    },
  });
}

export function useCreateMultiplePeas() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreatePeaData[]) => {
      const result = await createMultiplePeas(data);
      if (!result.success) {
        throw new Error(result.error || 'Failed to create multiple peas');
      }
      return result.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['peas'] });
      toast.success('สร้าง PEA หลายรายการสำเร็จ');
    },
    onError: (error: Error) => {
      toast.error('เกิดข้อผิดพลาด: ' + error.message);
    },
  });
}

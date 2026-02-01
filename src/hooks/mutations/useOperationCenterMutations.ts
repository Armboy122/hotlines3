import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createOperationCenter, updateOperationCenter, deleteOperationCenter } from '@/lib/actions/operation-center';
import type { CreateOperationCenterData, UpdateOperationCenterData } from '@/lib/actions/operation-center';
import { toast } from 'sonner';

// TODO: [EXTERNAL-API] อนาคต: แก้ไข hooks ให้เรียก External API แทน server actions

export function useCreateOperationCenter() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateOperationCenterData) => {
      const result = await createOperationCenter(data);
      if (!result.success) {
        throw new Error(result.error || 'Failed to create operation center');
      }
      return result.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['operationCenters'] });
      toast.success('สร้างศูนย์ปฏิบัติการสำเร็จ');
    },
    onError: (error: Error) => {
      toast.error('เกิดข้อผิดพลาด: ' + error.message);
    },
  });
}

export function useUpdateOperationCenter() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: UpdateOperationCenterData) => {
      const result = await updateOperationCenter(data);
      if (!result.success) {
        throw new Error(result.error || 'Failed to update operation center');
      }
      return result.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['operationCenters'] });
      toast.success('อัปเดตศูนย์ปฏิบัติการสำเร็จ');
    },
    onError: (error: Error) => {
      toast.error('เกิดข้อผิดพลาด: ' + error.message);
    },
  });
}

export function useDeleteOperationCenter() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const result = await deleteOperationCenter(id);
      if (!result.success) {
        throw new Error(result.error || 'Failed to delete operation center');
      }
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['operationCenters'] });
      toast.success('ลบศูนย์ปฏิบัติการสำเร็จ');
    },
    onError: (error: Error) => {
      toast.error('เกิดข้อผิดพลาด: ' + error.message);
    },
  });
}

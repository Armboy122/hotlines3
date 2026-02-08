import { useMutation, useQueryClient } from '@tanstack/react-query';
import { operationCenterService } from '@/lib/services/operation-center.service';
import type { CreateOperationCenterData, UpdateOperationCenterData } from '@/lib/services/operation-center.service';
import { toast } from 'sonner';

export function useCreateOperationCenter() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateOperationCenterData) => operationCenterService.create(data),
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
    mutationFn: (data: UpdateOperationCenterData) => operationCenterService.update(data),
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
    mutationFn: (id: string) => operationCenterService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['operationCenters'] });
      toast.success('ลบศูนย์ปฏิบัติการสำเร็จ');
    },
    onError: (error: Error) => {
      toast.error('เกิดข้อผิดพลาด: ' + error.message);
    },
  });
}

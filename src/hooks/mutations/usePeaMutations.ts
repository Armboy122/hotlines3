import { useMutation, useQueryClient } from '@tanstack/react-query';
import { peaService } from '@/lib/services/pea.service';
import type { CreatePeaData, UpdatePeaData } from '@/lib/services/pea.service';
import { toast } from 'sonner';

export function useCreatePea() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreatePeaData) => peaService.create(data),
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
    mutationFn: (data: UpdatePeaData) => peaService.update(data),
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
    mutationFn: (id: string) => peaService.delete(id),
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
    mutationFn: (data: CreatePeaData[]) => peaService.createMultiple(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['peas'] });
      toast.success('สร้าง PEA หลายรายการสำเร็จ');
    },
    onError: (error: Error) => {
      toast.error('เกิดข้อผิดพลาด: ' + error.message);
    },
  });
}
